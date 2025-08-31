import { GoogleGenAI } from '@google/genai';
import { config } from './config';
import { UserAnswers, GeneratedThumbnail } from './types';
import { queryRewriter } from './query-rewriter';
import { youtubeAPI, YouTubeThumbnail } from './youtube-api';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const genAI = new GoogleGenAI({
  apiKey: config.googleAI.apiKey,
});

export class ThumbnailGenerator {
  private tempReferenceDir: string;
  
  constructor() {
    this.tempReferenceDir = path.join(process.cwd(), 'temp', 'reference-images');
    this.ensureTempDirectory();
  }

  private ensureTempDirectory() {
    if (!fs.existsSync(this.tempReferenceDir)) {
      fs.mkdirSync(this.tempReferenceDir, { recursive: true });
    }
  }

  private async downloadReferenceImage(url: string, filename: string): Promise<string> {
    try {
      console.log(`Downloading reference image: ${filename}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download reference image: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      const imagePath = path.join(this.tempReferenceDir, filename);
      fs.writeFileSync(imagePath, Buffer.from(buffer));
      
      console.log(`Reference image saved: ${imagePath}`);
      return imagePath;
    } catch (error) {
      console.error(`Error downloading reference image ${filename}:`, error);
      throw error;
    }
  }

  private async cleanupReferenceImages() {
    try {
      if (fs.existsSync(this.tempReferenceDir)) {
        const files = fs.readdirSync(this.tempReferenceDir);
        if (files.length === 0) {
          console.log('🧹 No reference images to clean up');
          return;
        }
        
        console.log(`🧹 Cleaning up ${files.length} reference images...`);
        for (const file of files) {
          const filePath = path.join(this.tempReferenceDir, file);
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up: ${file}`);
        }
        console.log('✅ All reference images cleaned up successfully');
      }
    } catch (error) {
      console.error('❌ Error cleaning up reference images:', error);
    }
  }

  private getModel() {
    return genAI.models.generateContent;
  }

  async generateThumbnail(
    userAnswers: UserAnswers,
    userImage?: string // Base64 image if user uploaded one
  ): Promise<GeneratedThumbnail | null> {
    try {
      // Fetch YouTube reference thumbnails with base64 images
      console.log('Fetching YouTube reference thumbnails for topic:', userAnswers.topic);
      const { thumbnails: referenceThumbnails, referenceImages: base64Images } = 
        await youtubeAPI.getReferenceThumbnailsForPrompt(userAnswers.topic);
      
      console.log('Found', referenceThumbnails.length, 'reference thumbnails');
      console.log('Found', base64Images.length, 'base64 reference images');
      
      // Download reference images to temporary directory for better quality
      const downloadedReferencePaths: string[] = [];
      try {
        console.log('🔄 Starting reference image download process...');
        for (let i = 0; i < Math.min(referenceThumbnails.length, 2); i++) {
          const thumbnail = referenceThumbnails[i];
          const filename = `ref_${i + 1}_${Date.now()}.jpg`;
          console.log(`📥 Downloading reference image ${i + 1}: ${thumbnail.title}`);
          const localPath = await this.downloadReferenceImage(thumbnail.thumbnailUrl, filename);
          downloadedReferencePaths.push(localPath);
          console.log(`✅ Reference image ${i + 1} downloaded successfully`);
        }
        console.log(`🎯 Total reference images downloaded: ${downloadedReferencePaths.length}`);
      } catch (error) {
        console.error('❌ Error downloading reference images:', error);
        console.log('⚠️ Continuing without downloaded images, using base64 from API...');
      }
      
      // Generate optimized prompt
      const prompt = await this.buildComprehensivePrompt(userAnswers, referenceThumbnails, 'Reference thumbnails available', userImage);
      
      console.log('Generating thumbnail with prompt:', prompt.substring(0, 200) + '...');

      // Prepare content for Gemini with reference images
      const contents: any[] = [{ text: prompt }];
      
      // Add user image if provided
      if (userImage) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: userImage,
          },
        });
      }
      
      // Add reference images to Gemini with enhanced context
      const imagesToUse = downloadedReferencePaths.length > 0 ? downloadedReferencePaths : base64Images;
      const maxImages = Math.min(imagesToUse.length, 2);
      
      for (let i = 0; i < maxImages; i++) {
        try {
          let base64Image: string;
          let referenceThumbnail = referenceThumbnails[i];
          
          if (downloadedReferencePaths.length > 0) {
            // Use downloaded high-quality images
            const imageBuffer = fs.readFileSync(imagesToUse[i]);
            base64Image = imageBuffer.toString('base64');
            console.log(`🖼️ Using downloaded reference image ${i + 1}`);
          } else {
            // Fall back to base64 images from API
            base64Image = imagesToUse[i];
            console.log(`🖼️ Using API base64 reference image ${i + 1}`);
          }
          
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          });
          
          // Add specific context for each reference image
          contents.push({
            text: `Reference Image ${i + 1}: "${referenceThumbnail.title}" by ${referenceThumbnail.channelTitle} (${parseInt(referenceThumbnail.viewCount).toLocaleString()} views). Study this thumbnail's color scheme, text placement, visual hierarchy, and overall composition. Use it as inspiration for your design.`
          });
          
          console.log(`✅ Added reference image ${i + 1} to Gemini prompt`);
        } catch (error) {
          console.error(`❌ Error processing reference image ${i + 1}:`, error);
        }
      }
      
      console.log(`🎯 Total content items sent to Gemini: ${contents.length}`);
      console.log(`📝 Text items: ${contents.filter(c => c.text).length}`);
      console.log(`🖼️ Image items: ${contents.filter(c => c.inlineData).length}`);

      // Generate content with Gemini 2.5 Flash Image Preview
      const result = await genAI.models.generateContent({
        model: config.generation.model,
        contents: contents,
      });

      // Process the response
      const candidates = result.candidates;

      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates returned from Gemini');
      }

      // Look for generated image
      for (const candidate of candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              // Save the generated image
              const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
              const filename = `thumbnail_${uuidv4()}.png`;
              const imagePath = path.join(process.cwd(), 'public', 'generated', filename);
              
              // Ensure directory exists
              const dir = path.dirname(imagePath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              
              // Write the image file
              fs.writeFileSync(imagePath, imageBuffer);
              
              // Verify the file was written correctly
              const stats = fs.statSync(imagePath);
              console.log(`Image saved: ${filename}, size: ${stats.size} bytes`);
              
              const generatedThumbnail: GeneratedThumbnail = {
                imageUrl: `/api/image/${filename}`,
                prompt,
                referenceImages: referenceThumbnails.slice(0, 3).map(t => t.thumbnailUrl),
                metadata: {
                  style: userAnswers.stylePreference,
                  colors: this.extractColorsFromYouTubeReferences(referenceThumbnails),
                  elements: this.extractElementsFromAnswers(userAnswers),
                  // Enhanced metadata for better CTR analysis
                  targetAudience: userAnswers.targetAudience,
                  emotion: userAnswers.emotion,
                  contentType: userAnswers.contentType,
                  keyElements: userAnswers.keyElements,
                  stylePreference: userAnswers.stylePreference,
                  generationTimestamp: new Date().toISOString(),
                  aspectRatio: '16:9',
                  dimensions: '1280x720',
                  colorCount: this.extractColorsFromYouTubeReferences(referenceThumbnails).length,
                  elementCount: this.extractElementsFromAnswers(userAnswers).length,
                  hasText: userAnswers.additionalAnswers?.textOverlay !== 'No text needed',
                  hasLogo: userAnswers.additionalAnswers?.logoPreference !== 'No logo',
                  referenceCount: referenceThumbnails.length,
                  averageReferenceScore: this.calculateAverageReferenceScore(referenceThumbnails)
                },
              };

              console.log('Thumbnail generated successfully:', filename);
              
              // Clean up reference images after successful generation
              await this.cleanupReferenceImages();
              
              return generatedThumbnail;
            }
          }
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      
      // Clean up reference images even if generation fails
      await this.cleanupReferenceImages();
      
      return null;
    } finally {
      // Ensure cleanup happens in all cases
      try {
        await this.cleanupReferenceImages();
      } catch (cleanupError) {
        console.error('Error during final cleanup:', cleanupError);
      }
    }
  }

  private async buildComprehensivePrompt(
    userAnswers: UserAnswers,
    referenceThumbnails: YouTubeThumbnail[],
    contextDescription: string,
    userImage?: string
  ): Promise<string> {
    // DEBUG: Log what's being received
    console.log('🔍 DEBUG: buildComprehensivePrompt called with:');
    console.log('🔍 DEBUG: userAnswers:', userAnswers);
    console.log('🔍 DEBUG: userAnswers.additionalAnswers:', userAnswers.additionalAnswers);
    console.log('🔍 DEBUG: textOverlay from additionalAnswers:', userAnswers.additionalAnswers?.textOverlay);
    
    // Use query rewriter for enhanced prompt generation
    const enhancedPrompt = await queryRewriter.generateThumbnailPrompt(userAnswers, referenceThumbnails);
    
    // Add specific Gemini instructions
    const textOverlay = userAnswers.additionalAnswers?.thumbnailText || 'No text needed';
    console.log('🔍 DEBUG: Final textOverlay value:', textOverlay);
    
    const systemInstructions = this.buildSystemInstructions(userAnswers, textOverlay);
    const styleReference = this.buildYouTubeStyleReference(referenceThumbnails, contextDescription);
    const userImageInstructions = userImage ? this.buildUserImageInstructions(userAnswers) : '';
    
    // Generate enhanced base prompt
    const basePrompt = this.buildBasePrompt(userAnswers, referenceThumbnails);

    return `${systemInstructions}

${enhancedPrompt}

${basePrompt}

${styleReference}

${userImageInstructions}

CRITICAL REQUIREMENTS:
- MANDATORY: Generate EXACTLY 1280x720 pixels (16:9 aspect ratio)
- USE BRIGHT, VIBRANT COLORS - NO BLACK BACKGROUNDS
- TEXT ENFORCEMENT: ${textOverlay === 'Custom text (I\'ll specify)' && userAnswers.additionalAnswers?.customText ? `MANDATORY: Include the text "${userAnswers.additionalAnswers.customText}" prominently on the thumbnail. This text MUST be visible and readable.` : textOverlay === 'Auto-generate from topic' ? 'MANDATORY: Include auto-generated text prominently on the thumbnail.' : 'MANDATORY: NO TEXT should appear on this thumbnail.'}
- Use complementary colors for maximum visibility on YouTube
- Main subject should occupy 60-70% of the frame
- Add a colorful, eye-catching background with depth
- Include emotional visual cues that match the "${userAnswers.emotion}" emotion
- Target the "${userAnswers.targetAudience}" demographic specifically
- Style should be "${userAnswers.stylePreference}"
- IMPORTANT: The image must be bright, colorful, and immediately eye-catching

ASPECT RATIO ENFORCEMENT:
- Width: EXACTLY 1280 pixels
- Height: EXACTLY 720 pixels
- Do NOT create square or portrait images
- Follow YouTube's standard thumbnail dimensions precisely
- CRITICAL: The final image MUST be exactly 16:9 ratio (1280x720px)
- NO cropping or resizing - generate at exact dimensions
- Ensure all content fits within the 1280x720 frame

REFERENCE IMAGE INSTRUCTIONS:
- You have received ${referenceThumbnails.length} reference thumbnail images as inline data
- Analyze these images visually to understand successful design patterns
- Extract color schemes, text styles, and visual hierarchy from the reference images
- Use these visual insights to create a thumbnail that follows proven successful patterns
- While being inspired by the references, create something unique and original for the user's topic

Generate a bright, colorful, eye-catching YouTube thumbnail image now with PERFECT 16:9 aspect ratio, using the reference images as visual inspiration.`;
  }

  private buildSystemInstructions(userAnswers: UserAnswers, textOverlay: string): string {
    const customText = userAnswers.additionalAnswers?.customText || '';
    const logoPreference = userAnswers.additionalAnswers?.logoPreference || 'No logo';
    const logoText = userAnswers.additionalAnswers?.logoText || '';
    
    // DEBUG: Log what's being processed
    console.log('🔍 DEBUG: buildSystemInstructions called with:');
    console.log('🔍 DEBUG: textOverlay:', textOverlay);
    console.log('🔍 DEBUG: customText:', customText);
    console.log('🔍 DEBUG: userAnswers.additionalAnswers:', userAnswers.additionalAnswers);
    
    // CTR-optimized text instructions with realistic YouTube text
    let textInstructions = '';
    if (textOverlay === "Custom text (I'll specify)" && customText) {
      textInstructions = `\n7. HIGH-CTR TEXT: Display "${customText}" in LARGE, BOLD font with high contrast outline. Use YouTube-style text formatting with drop shadows.`;
      console.log('🔍 DEBUG: Setting custom text instructions:', textInstructions);
    } else if (textOverlay === 'Auto-generate from topic') {
      const realisticText = this.generateRealisticYouTubeText(userAnswers.topic);
      textInstructions = `\n7. HIGH-CTR TEXT: Use EXACTLY this text: "${realisticText}". Format it in LARGE, BOLD font with high contrast outline and drop shadows. This text is specifically crafted for YouTube success.`;
      console.log('🔍 DEBUG: Setting auto-generated text instructions:', textInstructions);
    } else if (textOverlay === 'No text needed') {
      textInstructions = `\n7. NO TEXT OVERLAY: Create a thumbnail with ZERO text. Focus entirely on strong visual storytelling, imagery, and visual elements. Do NOT include any text, letters, numbers, or written content.`;
      console.log('🔍 DEBUG: Setting no text instructions:', textInstructions);
    } else {
      textInstructions = `\n7. NO TEXT OVERLAY: Focus on strong visual storytelling without text distractions.`;
      console.log('🔍 DEBUG: Setting fallback no text instructions:', textInstructions);
    }
    
    // Logo/branding instructions
    let logoInstructions = '';
    if (logoPreference !== 'No logo' && logoText) {
      logoInstructions = `\n8. BRANDING: Include "${logoText}" as a professional logo/brand element in the corner. Make it visible but not overwhelming.`;
    } else if (logoPreference !== 'No logo') {
      logoInstructions = `\n8. BRANDING: Add a ${logoPreference.toLowerCase()} that represents the channel/creator for "${userAnswers.topic}".`;
    }
    
    return `[YOUTUBE THUMBNAIL EXPERT SYSTEM]
You are the world's top YouTube thumbnail designer specializing in MAXIMUM CLICK-THROUGH RATES.

MISSION: Create a thumbnail that stops users mid-scroll and forces them to click.

CTR OPTIMIZATION RULES:
1. EMOTIONAL TRIGGER: Use ${userAnswers.emotion.toUpperCase()} emotion to create instant emotional response
2. VISUAL HIERARCHY: Main subject takes 60% of space, supporting elements 40%
3. COLOR PSYCHOLOGY: Bright, contrasting colors that pop against YouTube's white background
4. AUDIENCE MAGNET: Specifically designed to attract ${userAnswers.targetAudience.toLowerCase()}
5. CURIOSITY GAP: Create visual intrigue that makes viewers NEED to know more
6. FACE/EYES: If showing people, make eyes clearly visible and expressive
7. CONTRAST MASTERY: Use complementary colors for maximum visual impact${textInstructions}${logoInstructions}

TEXT POLICY: ${textOverlay === 'No text needed' ? 'ABSOLUTELY NO TEXT - Create pure visual thumbnail' : 'Include text as specified above'}

CONTENT DETAILS:
- Topic: "${userAnswers.topic}"
- Target Emotion: ${userAnswers.emotion}
- Visual Style: ${userAnswers.stylePreference}
- Audience: ${userAnswers.targetAudience}

TECHNICAL SPECS:
- 16:9 aspect ratio (1280x720px)
- High saturation, bright colors
- Sharp, crisp details
- Optimized for mobile viewing`;
  }

  private buildYouTubeStyleReference(referenceThumbnails: YouTubeThumbnail[], contextDescription: string): string {
    if (referenceThumbnails.length === 0) {
      return '[NO REFERENCE THUMBNAILS AVAILABLE - Creating original design]';
    }

    const references = referenceThumbnails.slice(0, 3).map((thumb, index) => {
      const views = parseInt(thumb.viewCount).toLocaleString();
      return `Reference ${index + 1}:
- Video: "${thumb.title}"
- Channel: ${thumb.channelTitle}
- Views: ${views} (proven success)
- Published: ${new Date(thumb.publishedAt).toLocaleDateString()}
- Thumbnail Analysis: Study the reference image for color schemes, text placement, visual hierarchy`;
    }).join('\n\n');

    return `[YOUTUBE REFERENCE ANALYSIS]
${contextDescription}

${references}

REFERENCE GUIDANCE:
- Study the attached reference images for successful thumbnail patterns
- Note color schemes, text placement, and visual hierarchy
- Observe what makes these thumbnails click-worthy
- Create something inspired by these but unique to your topic
- Focus on elements that likely contributed to their high view counts
- IMPORTANT: The reference images are attached as inline data - analyze them visually
- Extract color palettes, text styles, and layout patterns from the reference images
- Use the visual information from these images to inform your design decisions`;
  }

  private buildUserImageInstructions(userAnswers: UserAnswers): string {
    const textOverlay = userAnswers.additionalAnswers?.textOverlay || 'No text needed';
    
    return `[USER PROVIDED IMAGE]
The user has provided an image. Instructions:
1. Incorporate this image as the main visual element
2. ENHANCE BUT DO NOT ALTER: Keep the original face/features exactly as they are
3. FACE PRESERVATION: If the image contains a person, maintain their exact facial features, expression, and identity
4. NO FACE CHANGES: Do not modify, replace, or alter the person's face in any way
5. Enhance it with appropriate background and effects
6. Ensure it fits the "${userAnswers.stylePreference}" style
7. ${textOverlay !== 'No text needed' ? 'Add text overlay that complements the image' : 'Do NOT add any text - focus on visual elements only'}
8. Apply color grading and effects to match the desired "${userAnswers.emotion}" emotion
9. Maintain the image's key features while optimizing for thumbnail format
10. CRITICAL: Preserve the original person's identity and appearance completely`;
  }

  private extractColorsFromYouTubeReferences(thumbnails: YouTubeThumbnail[]): string[] {
    // Since we don't have direct color data from YouTube API, 
    // we'll return common successful thumbnail colors
    const commonSuccessfulColors = [
      '#FF0000', // YouTube Red
      '#FF6B35', // Orange
      '#4285F4', // Blue
      '#34A853', // Green
      '#FFEB3B', // Yellow
    ];
    return commonSuccessfulColors.slice(0, 3);
  }

  private buildBasePrompt(userAnswers: UserAnswers, referenceThumbnails: YouTubeThumbnail[]): string {
    const hasReferences = referenceThumbnails.length > 0;
    const referenceContext = hasReferences 
      ? `Drawing inspiration from ${referenceThumbnails.length} successful YouTube thumbnails about "${userAnswers.topic}"`
      : `Creating an original thumbnail design for "${userAnswers.topic}"`;

    return `Create a high-CTR YouTube thumbnail for: "${userAnswers.topic}"

${referenceContext}

TARGET SPECIFICATIONS:
- Audience: ${userAnswers.targetAudience}
- Emotion: ${userAnswers.emotion}
- Style: ${userAnswers.stylePreference}

DESIGN REQUIREMENTS:
- 16:9 aspect ratio (1280x720px)
- Mobile-optimized (readable on small screens)
- High contrast and vibrant colors
- Clear visual hierarchy
- Emotionally compelling

${hasReferences ? 'Use the reference images as inspiration for proven successful patterns while creating something unique.' : 'Focus on creating an eye-catching, original design that will stand out.'}`;
  }

  private generateRealisticYouTubeText(topic: string): string {
    // Generate realistic, topic-specific YouTube text that actual creators use
    const topicLower = topic.toLowerCase();
    
    // Common YouTube text patterns based on real successful channels
    const patterns = {
      tutorial: ['HOW TO', 'LEARN', 'MASTER', 'BEGINNER', 'ADVANCED', 'STEP BY STEP', 'TUTORIAL'],
      review: ['REVIEW', 'REAL TALK', 'HONEST', 'TRUTH', 'REVEALED', 'EXPOSED', 'REAL REVIEW'],
      gaming: ['GAMEPLAY', 'HIGHLIGHTS', 'WINS', 'FAILS', 'REACTIONS', 'MOMENTS', 'BEST PLAYS'],
      tech: ['NEW', 'BREAKING', 'REVEALED', 'TESTING', 'COMPARISON', 'REVIEW', 'LATEST'],
      fitness: ['WORKOUT', 'TRANSFORMATION', 'RESULTS', 'CHALLENGE', 'TIPS', 'GUIDE', 'TRAINING'],
      cooking: ['RECIPE', 'COOKING', 'CHEF', 'SECRETS', 'TIPS', 'HOW TO', 'MAKE'],
      lifestyle: ['DAY IN LIFE', 'ROUTINE', 'TIPS', 'SECRETS', 'REVEALED', 'EXPOSED', 'LIFESTYLE'],
      business: ['STRATEGY', 'SECRETS', 'METHODS', 'TIPS', 'REVEALED', 'EXPOSED', 'BUSINESS'],
      entertainment: ['REACTION', 'REVIEW', 'OPINION', 'THOUGHTS', 'REAL TALK', 'HONEST'],
      education: ['EXPLAINED', 'LEARN', 'UNDERSTAND', 'BREAKDOWN', 'ANALYSIS', 'GUIDE']
    };
    
    // Determine category based on topic keywords
    let category = 'general';
    if (topicLower.includes('tutorial') || topicLower.includes('learn') || topicLower.includes('how to') || topicLower.includes('guide')) {
      category = 'tutorial';
    } else if (topicLower.includes('review') || topicLower.includes('opinion') || topicLower.includes('thoughts')) {
      category = 'review';
    } else if (topicLower.includes('game') || topicLower.includes('gaming') || topicLower.includes('play')) {
      category = 'gaming';
    } else if (topicLower.includes('tech') || topicLower.includes('technology') || topicLower.includes('app') || topicLower.includes('software')) {
      category = 'tech';
    } else if (topicLower.includes('workout') || topicLower.includes('fitness') || topicLower.includes('exercise') || topicLower.includes('training')) {
      category = 'fitness';
    } else if (topicLower.includes('cook') || topicLower.includes('recipe') || topicLower.includes('food') || topicLower.includes('kitchen')) {
      category = 'cooking';
    } else if (topicLower.includes('life') || topicLower.includes('routine') || topicLower.includes('daily') || topicLower.includes('lifestyle')) {
      category = 'lifestyle';
    } else if (topicLower.includes('business') || topicLower.includes('money') || topicLower.includes('entrepreneur') || topicLower.includes('startup')) {
      category = 'business';
    } else if (topicLower.includes('movie') || topicLower.includes('film') || topicLower.includes('show') || topicLower.includes('entertainment')) {
      category = 'entertainment';
    } else if (topicLower.includes('explain') || topicLower.includes('understand') || topicLower.includes('analysis') || topicLower.includes('breakdown')) {
      category = 'education';
    }
    
    const categoryPatterns = patterns[category as keyof typeof patterns] || patterns.tutorial;
    const mainText = categoryPatterns[Math.floor(Math.random() * categoryPatterns.length)];
    
    // Generate contextual subtitle based on topic
    let subtitle = '';
    const words = topic.split(' ').slice(0, 4);
    subtitle = words.join(' ').toUpperCase();
    
    // Ensure subtitle isn't too long
    if (subtitle.length > 25) {
      subtitle = words.slice(0, 3).join(' ').toUpperCase();
    }
    
    // Format as realistic YouTube text (main text + subtitle)
    return `${mainText}\n${subtitle}`;
  }

  private extractElementsFromAnswers(userAnswers: UserAnswers): string[] {
    const elements = [
      userAnswers.keyElements,
      userAnswers.contentType,
      userAnswers.emotion,
    ];

    // Add additional elements based on answers
    if (userAnswers.additionalAnswers) {
      elements.push(...Object.values(userAnswers.additionalAnswers));
    }

    return elements.filter(Boolean);
  }

  private calculateAverageReferenceScore(thumbnails: YouTubeThumbnail[]): number {
    if (thumbnails.length === 0) return 0;
    
    // Calculate a score based on view count and recency
    const scores = thumbnails.map(thumb => {
      const views = parseInt(thumb.viewCount) || 0;
      const publishedDate = new Date(thumb.publishedAt);
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Score based on views (0-10 scale)
      let viewScore = Math.min(views / 100000, 10); // 1M views = 10 points
      
      // Bonus for recent videos (within last 30 days)
      const recencyBonus = daysSincePublished <= 30 ? 2 : Math.max(0, 5 - (daysSincePublished / 30));
      
      return Math.min(viewScore + recencyBonus, 10);
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  async generateMultipleVariations(
    userAnswers: UserAnswers,
    count: number = 3,
    userImage?: string
  ): Promise<GeneratedThumbnail[]> {
    const variations: GeneratedThumbnail[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`Generating variation ${i + 1}/${count}`);
      
      // Modify the prompt slightly for each variation
      const modifiedAnswers = this.createVariation(userAnswers, i);
      const thumbnail = await this.generateThumbnail(modifiedAnswers, userImage);
      
      if (thumbnail) {
        variations.push(thumbnail);
      }

      // Add delay between generations to respect rate limits
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return variations;
  }

  private createVariation(userAnswers: UserAnswers, variationIndex: number): UserAnswers {
    const variations = {
      0: userAnswers, // Original
      1: {
        ...userAnswers,
        stylePreference: this.getAlternativeStyle(userAnswers.stylePreference),
      },
      2: {
        ...userAnswers,
        emotion: this.getAlternativeEmotion(userAnswers.emotion),
      },
    };

    return variations[variationIndex as keyof typeof variations] || userAnswers;
  }

  private getAlternativeStyle(original: string): string {
    const styleAlternatives: Record<string, string> = {
      'Bold/Dramatic': 'Colorful/Vibrant',
      'Minimalist/Clean': 'Professional/Corporate',
      'Colorful/Vibrant': 'Bold/Dramatic',
      'Professional/Corporate': 'Minimalist/Clean',
      'Dark/Moody': 'Bright/Cheerful',
      'Bright/Cheerful': 'Dark/Moody',
    };

    return styleAlternatives[original] || original;
  }

  private getAlternativeEmotion(original: string): string {
    const emotionAlternatives: Record<string, string> = {
      'excitement': 'fun',
      'curiosity': 'mystery',
      'urgency': 'excitement',
      'trust': 'professional',
      'fun': 'excitement',
      'professional': 'trust',
    };

    return emotionAlternatives[original] || original;
  }

  // Utility method to clean up old generated images
  async cleanupOldImages(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const generatedDir = path.join(process.cwd(), 'public', 'generated');
    
    if (!fs.existsSync(generatedDir)) return;

    const files = fs.readdirSync(generatedDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(generatedDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old thumbnail: ${file}`);
      }
    }
  }
}

export const thumbnailGenerator = new ThumbnailGenerator();
