import { GoogleGenAI } from '@google/genai';
import { config } from './config';
import { UserAnswers, GeneratedThumbnail } from './types';
import { queryRewriter } from './query-rewriter';
import { youtubeAPI, YouTubeThumbnail } from './youtube-api';

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
      // Fetch YouTube reference thumbnails with base64 images
      const { thumbnails: referenceThumbnails, referenceImages: base64Images } = 
        await youtubeAPI.getReferenceThumbnailsForPrompt(userAnswers.topic);
      
      // Generate optimized prompt
      const prompt = await this.buildComprehensivePrompt(userAnswers, referenceThumbnails, 'Reference thumbnails available', userImage);
      
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
      
      // Add reference images to Gemini with enhanced context (using base64 directly)
      const maxImages = Math.min(base64Images.length, 2);
      
      for (let i = 0; i < maxImages; i++) {
        try {
          const base64Image = base64Images[i];
          const referenceThumbnail = referenceThumbnails[i];
          
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
              // Return the base64 image directly instead of saving to file system
              const generatedThumbnail: GeneratedThumbnail = {
                imageUrl: `data:image/png;base64,${part.inlineData.data}`,
                prompt,
                referenceImages: referenceThumbnails.slice(0, 3).map(t => t.thumbnailUrl),
                metadata: {
                  style: userAnswers.stylePreference,
                  colors: this.extractColorsFromYouTubeReferences(referenceThumbnails),
                  elements: this.extractElementsFromAnswers(userAnswers),
                  targetAudience: userAnswers.targetAudience,
                  contentType: userAnswers.contentType,
                  emotion: userAnswers.emotion,
                  keyElements: userAnswers.keyElements,
                  referenceScore: this.calculateAverageReferenceScore(referenceThumbnails),
                  generationTimestamp: new Date().toISOString(),
                  model: config.generation.model,
                  promptVersion: '2.0',
                  optimizationLevel: 'high',
                  ctrOptimization: this.analyzeCTROptimization(userAnswers, referenceThumbnails),
                },
              };
              
              console.log('✅ Thumbnail generated successfully');
              return generatedThumbnail;
            }
          }
        }
      }

      throw new Error('No image generated from Gemini');
    } catch (error) {
      console.error('❌ Error generating thumbnail:', error);
      return null;
    }
  }

  async generateMultipleVariations(
    userAnswers: UserAnswers,
    count: number,
    userImage?: string
  ): Promise<GeneratedThumbnail[]> {
    const variations: GeneratedThumbnail[] = [];
    
    for (let i = 0; i < count; i++) {
      const variation = await this.generateThumbnail(userAnswers, userImage);
      if (variation) {
        variations.push(variation);
      }
    }
    
    return variations;
  }

  private async buildComprehensivePrompt(
    userAnswers: UserAnswers,
    referenceThumbnails: YouTubeThumbnail[],
    referenceContext: string,
    userImage?: string
  ): Promise<string> {
    const systemInstructions = this.buildSystemInstructions(userAnswers);
    const userImageInstructions = userImage ? this.buildUserImageInstructions() : '';
    const referenceAnalysis = this.buildReferenceAnalysis(referenceThumbnails);
    
    return `${systemInstructions}

${userImageInstructions}

${referenceAnalysis}

CRITICAL REQUIREMENTS:
- Generate a YouTube thumbnail with EXACTLY 16:9 aspect ratio (1280x720px)
- NO cropping of the image - ensure full content is visible
- If user requested text, use the EXACT text provided by the system instructions
- If no text requested, do NOT include any text on the thumbnail
- Ensure text is clearly visible with minimum 60px font size
- Position text strategically for maximum impact
- Use colors and styles that match the reference thumbnails
- Create a thumbnail that would get high CTR (Click-Through Rate)
- Make it visually striking and professional

Topic: ${userAnswers.topic}
Target Audience: ${userAnswers.targetAudience}
Content Type: ${userAnswers.contentType}
Emotion: ${userAnswers.emotion}
Key Elements: ${userAnswers.keyElements}
Style Preference: ${userAnswers.stylePreference}`;
  }

  private buildSystemInstructions(userAnswers: UserAnswers): string {
    const textOverlay = userAnswers.additionalAnswers?.thumbnailText;
    
    // Handle auto-generation case
    let textInstructions = '';
    if (textOverlay === 'Auto-generate from topic') {
      const autoText = this.generateAutoTextFromTopic(userAnswers.topic);
      textInstructions = `TEXT REQUIREMENTS:
- User has requested auto-generated text based on the topic
- Use this EXACT text: "${autoText}"
- Ensure text is clearly visible and readable
- Use appropriate font size (minimum 60px)
- Position text strategically for maximum impact`;
    } else if (textOverlay && textOverlay !== 'No text needed') {
      textInstructions = `TEXT REQUIREMENTS:
- User has requested text on the thumbnail
- Use this EXACT text: "${textOverlay}"
- Ensure text is clearly visible and readable
- Use appropriate font size (minimum 60px)
- Position text strategically for maximum impact`;
    } else {
      textInstructions = `TEXT REQUIREMENTS:
- User has NOT requested any text on the thumbnail
- Do NOT include any text, logos, or written content
- Focus purely on visual elements and imagery`;
    }
    
    return `You are a professional YouTube thumbnail designer. Your task is to create a high-converting thumbnail that follows these guidelines:

${textInstructions}

DESIGN PRINCIPLES:
- Create a thumbnail that would get high CTR (Click-Through Rate)
- Use bold, contrasting colors
- Ensure visual hierarchy and focal points
- Make it stand out in YouTube search results
- Follow YouTube thumbnail best practices

TECHNICAL REQUIREMENTS:
- Generate image in 16:9 aspect ratio (1280x720px)
- High quality, professional appearance
- No grammatical errors or typos
- Optimized for mobile and desktop viewing`;
  }

  private buildUserImageInstructions(): string {
    return `USER IMAGE INSTRUCTIONS:
- User has provided a reference image
- ENHANCE BUT DO NOT ALTER the user's image
- FACE PRESERVATION: Do not change, distort, or modify any faces in the image
- Maintain the original composition and elements
- Use the user's image as the primary focal point
- Integrate it seamlessly with the thumbnail design`;
  }

  private buildReferenceAnalysis(referenceThumbnails: YouTubeThumbnail[]): string {
    if (referenceThumbnails.length === 0) {
      return 'No reference thumbnails available. Create a professional, high-converting design.';
    }

    const analysis = referenceThumbnails.map((thumb, index) => {
      const viewCount = parseInt(thumb.viewCount).toLocaleString();
      return `Reference ${index + 1}: "${thumb.title}" (${viewCount} views) - Study color schemes, text placement, and visual hierarchy.`;
    }).join('\n');

    return `REFERENCE THUMBNAIL ANALYSIS:
${analysis}

Use these references to understand successful design patterns and apply similar principles to your creation.`;
  }

  private extractColorsFromYouTubeReferences(referenceThumbnails: YouTubeThumbnail[]): string[] {
    // Extract color information from reference thumbnails
    const colors = new Set<string>();
    
    referenceThumbnails.forEach(thumb => {
      // Add common YouTube thumbnail colors
      colors.add('High Contrast');
      colors.add('Bold');
      colors.add('Eye-catching');
    });
    
    return Array.from(colors);
  }

  private extractElementsFromAnswers(userAnswers: UserAnswers): string[] {
    const elements: string[] = [];
    
    if (userAnswers.keyElements) {
      elements.push(userAnswers.keyElements);
    }
    
    if (userAnswers.stylePreference) {
      elements.push(userAnswers.stylePreference);
    }
    
    return elements;
  }

  private calculateAverageReferenceScore(referenceThumbnails: YouTubeThumbnail[]): number {
    if (referenceThumbnails.length === 0) return 0;
    
    const totalViews = referenceThumbnails.reduce((sum, thumb) => {
      return sum + parseInt(thumb.viewCount);
    }, 0);
    
    const averageViews = totalViews / referenceThumbnails.length;
    
    // Convert to a 0-100 score
    if (averageViews > 1000000) return 95; // 1M+ views
    if (averageViews > 500000) return 85;  // 500K+ views
    if (averageViews > 100000) return 75;  // 100K+ views
    if (averageViews > 50000) return 65;   // 50K+ views
    if (averageViews > 10000) return 55;   // 10K+ views
    return 45; // Less than 10K views
  }

  private generateAutoTextFromTopic(topic: string): string {
    // Generate short, impactful text (2-3 words max) based on the topic
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
      category = 'education';
    } else if (topicLower.includes('explain') || topicLower.includes('understand') || topicLower.includes('analysis') || topicLower.includes('breakdown')) {
      category = 'education';
    }
    
    const categoryPatterns = patterns[category as keyof typeof patterns] || patterns.tutorial;
    const mainText = categoryPatterns[Math.floor(Math.random() * categoryPatterns.length)];
    
    // Generate contextual subtitle based on topic (keep it short - 2-3 words max)
    const words = topic.split(' ').slice(0, 2); // Only take first 2 words
    let subtitle = words.join(' ').toUpperCase();
    
    // Ensure subtitle isn't too long
    if (subtitle.length > 15) {
      subtitle = words[0].toUpperCase();
    }
    
    // Return short, impactful text (2-3 words max)
    return `${mainText}\n${subtitle}`;
  }

  private analyzeCTROptimization(userAnswers: UserAnswers, referenceThumbnails: YouTubeThumbnail[]): {
    score: number;
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let score = 70; // Base score

    // Analyze user preferences
    if (userAnswers.emotion === 'Exciting' || userAnswers.emotion === 'Dramatic') {
      score += 10;
      insights.push('High-energy emotion choice increases CTR potential');
    }

    if (userAnswers.stylePreference === 'Bold' || userAnswers.stylePreference === 'Eye-catching') {
      score += 8;
      insights.push('Bold style preference aligns with high-CTR thumbnails');
    }

    // Analyze reference thumbnails
    if (referenceThumbnails.length > 0) {
      const avgViews = referenceThumbnails.reduce((sum, t) => sum + parseInt(t.viewCount), 0) / referenceThumbnails.length;
      if (avgViews > 100000) {
        score += 12;
        insights.push('High-performing reference thumbnails indicate strong CTR potential');
      }
    }

    // Recommendations
    if (score < 80) {
      recommendations.push('Consider using more contrasting colors');
      recommendations.push('Add visual elements that create curiosity');
    }

    if (userAnswers.additionalAnswers?.thumbnailText) {
      recommendations.push('Ensure text is highly readable and positioned strategically');
    }

    return {
      score: Math.min(score, 100),
      insights,
      recommendations
    };
  }
}

export const thumbnailGenerator = new ThumbnailGenerator();
