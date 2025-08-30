import { GoogleGenAI } from '@google/genai';
import { config } from './config';
import { UserAnswers, GeneratedThumbnail } from './types';
import { queryRewriter } from './query-rewriter';
import { youtubeAPI, YouTubeThumbnail } from './youtube-api';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenAI({
  apiKey: config.googleAI.apiKey,
});

export class ThumbnailGenerator {
  private getModel() {
    return genAI.models.generateContent;
  }

  async generateThumbnail(
    userAnswers: UserAnswers,
    userImage?: string // Base64 image if user uploaded one
  ): Promise<GeneratedThumbnail | null> {
    try {
      // Fetch YouTube reference thumbnails
      console.log('Fetching YouTube reference thumbnails for topic:', userAnswers.topic);
      const { thumbnails: referenceThumbnails, referenceImages, contextDescription } = 
        await youtubeAPI.getReferenceThumbnailsForPrompt(userAnswers.topic);
      
      console.log('Found', referenceThumbnails.length, 'reference thumbnails');
      
      // Generate optimized prompt
      const prompt = await this.buildComprehensivePrompt(userAnswers, referenceThumbnails, contextDescription, userImage);
      
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
      
      // Add reference images from YouTube
      referenceImages.slice(0, 2).forEach((base64Image, index) => {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        });
      });

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
                },
              };

              console.log('Thumbnail generated successfully:', filename);
              return generatedThumbnail;
            }
          }
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  private async buildComprehensivePrompt(
    userAnswers: UserAnswers,
    referenceThumbnails: YouTubeThumbnail[],
    contextDescription: string,
    userImage?: string
  ): Promise<string> {
    // Use query rewriter for enhanced prompt generation
    const enhancedPrompt = await queryRewriter.generateThumbnailPrompt(userAnswers, referenceThumbnails);
    
    // Add specific Gemini instructions
    const systemInstructions = this.buildSystemInstructions(userAnswers);
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
- Text must be LARGE (minimum 48px font size) and BOLD with high contrast outline
- Use complementary colors for maximum visibility on YouTube
- Main subject should occupy 60-70% of the frame
- Add a colorful, eye-catching background with depth
- Include emotional visual cues that match the "${userAnswers.emotion}" emotion
- Target the "${userAnswers.targetAudience}" demographic specifically
- Style should be "${userAnswers.stylePreference}"
- IMPORTANT: The image must be bright, colorful, and immediately eye-catching
- Ensure all text is readable even when thumbnail is viewed at 320x180px (mobile size)

ASPECT RATIO ENFORCEMENT:
- Width: EXACTLY 1280 pixels
- Height: EXACTLY 720 pixels
- Do NOT create square or portrait images
- Follow YouTube's standard thumbnail dimensions precisely

Generate a bright, colorful, eye-catching YouTube thumbnail image now with PERFECT 16:9 aspect ratio.`;
  }

  private buildSystemInstructions(userAnswers: UserAnswers): string {
    const textOverlay = userAnswers.additionalAnswers?.textOverlay || 'No text needed';
    const customText = userAnswers.additionalAnswers?.customText || '';
    const logoPreference = userAnswers.additionalAnswers?.logoPreference || 'No logo';
    const logoText = userAnswers.additionalAnswers?.logoText || '';
    
    // CTR-optimized text instructions
    let textInstructions = '';
    if (textOverlay === "Custom text (I'll specify)" && customText) {
      textInstructions = `\n7. HIGH-CTR TEXT: Display "${customText}" in LARGE, BOLD font with high contrast outline. Use YouTube-style text formatting with drop shadows.`;
    } else if (textOverlay === 'Auto-generate from topic') {
      textInstructions = `\n7. HIGH-CTR TEXT: Generate compelling, click-worthy text for "${userAnswers.topic}". Use power words like "SHOCKING", "AMAZING", "SECRET", "NEW". Max 3-4 words, HUGE font size.`;
    } else {
      textInstructions = `\n7. NO TEXT OVERLAY: Focus on strong visual storytelling without text distractions.`;
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
- Focus on elements that likely contributed to their high view counts`;
  }

  private buildUserImageInstructions(userAnswers: UserAnswers): string {
    return `[USER PROVIDED IMAGE]
The user has provided an image. Instructions:
1. Incorporate this image as the main visual element
2. Enhance it with appropriate background, text, and effects
3. Ensure it fits the "${userAnswers.stylePreference}" style
4. Add text overlay that complements the image
5. Apply color grading and effects to match the desired "${userAnswers.emotion}" emotion
6. Maintain the image's key features while optimizing for thumbnail format`;
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
