import OpenAI from 'openai';
import { config } from './config';
import { UserAnswers } from './types';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class QueryRewriter {
  async enhanceSearchQuery(userAnswers: UserAnswers): Promise<string> {
    try {
      const prompt = this.buildQueryRewritingPrompt(userAnswers);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a search query optimizer for a YouTube thumbnail database. 
            Transform user inputs into optimal search queries that will find the most relevant thumbnail references.
            
            Focus on:
            1. Visual style descriptors
            2. Emotional keywords
            3. Layout and composition terms
            4. Color and design elements
            5. Target audience indicators
            
            Return only the enhanced search query, no explanations.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const enhancedQuery = response.choices[0]?.message?.content?.trim();
      return enhancedQuery || this.buildFallbackQuery(userAnswers);
    } catch (error) {
      console.error('Error enhancing search query:', error);
      return this.buildFallbackQuery(userAnswers);
    }
  }

  private buildQueryRewritingPrompt(userAnswers: UserAnswers): string {
    return `Transform this thumbnail request into an optimal search query:

Topic: "${userAnswers.topic}"
Target Audience: ${userAnswers.targetAudience}
Content Type: ${userAnswers.contentType}
Emotion: ${userAnswers.emotion}
Key Elements: ${userAnswers.keyElements}
Style: ${userAnswers.stylePreference}
${userAnswers.additionalAnswers ? `Additional: ${Object.entries(userAnswers.additionalAnswers).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}

Create an enhanced search query that includes:
- Synonyms and related terms
- Visual descriptors
- Emotional keywords
- Layout/composition terms
- Color/style indicators

Example:
Input: "React tutorial for beginners"
Output: "beginner-friendly react javascript tutorial coding professional clean layout educational trust-building step-by-step learning development programming"`;
  }

  private buildFallbackQuery(userAnswers: UserAnswers): string {
    const queryParts = [
      userAnswers.topic,
      userAnswers.targetAudience.toLowerCase(),
      userAnswers.contentType.toLowerCase(),
      userAnswers.emotion.toLowerCase(),
      userAnswers.keyElements.toLowerCase().replace(/['']/g, ''),
      userAnswers.stylePreference.toLowerCase().replace(/[\/]/g, ' '),
    ];

    // Add additional answers
    if (userAnswers.additionalAnswers) {
      queryParts.push(...Object.values(userAnswers.additionalAnswers).map(v => v.toLowerCase()));
    }

    // Add relevant synonyms based on content
    const topic = userAnswers.topic.toLowerCase();
    if (topic.includes('tutorial') || topic.includes('how to')) {
      queryParts.push('educational', 'learning', 'guide', 'step-by-step');
    }
    if (topic.includes('review')) {
      queryParts.push('comparison', 'analysis', 'opinion', 'rating');
    }
    if (topic.includes('news') || topic.includes('update')) {
      queryParts.push('breaking', 'latest', 'announcement', 'current');
    }

    // Add style-based keywords
    const style = userAnswers.stylePreference.toLowerCase();
    if (style.includes('bold') || style.includes('dramatic')) {
      queryParts.push('high-contrast', 'striking', 'eye-catching', 'dynamic');
    }
    if (style.includes('minimalist') || style.includes('clean')) {
      queryParts.push('simple', 'elegant', 'uncluttered', 'modern');
    }
    if (style.includes('colorful') || style.includes('vibrant')) {
      queryParts.push('bright', 'saturated', 'rainbow', 'energetic');
    }
    if (style.includes('professional') || style.includes('corporate')) {
      queryParts.push('business', 'formal', 'polished', 'trustworthy');
    }

    // Add emotion-based keywords
    const emotion = userAnswers.emotion.toLowerCase();
    switch (emotion) {
      case 'excitement':
        queryParts.push('energetic', 'thrilling', 'amazing', 'wow');
        break;
      case 'curiosity':
        queryParts.push('mysterious', 'intriguing', 'discover', 'reveal');
        break;
      case 'urgency':
        queryParts.push('now', 'immediate', 'breaking', 'alert');
        break;
      case 'trust':
        queryParts.push('reliable', 'honest', 'authentic', 'credible');
        break;
      case 'fun':
        queryParts.push('playful', 'entertaining', 'joyful', 'lighthearted');
        break;
      case 'professional':
        queryParts.push('expert', 'authoritative', 'competent', 'skilled');
        break;
    }

    return queryParts.filter(Boolean).join(' ');
  }

  async generateThumbnailPrompt(
    userAnswers: UserAnswers,
    youtubeThumbnails: any[]
  ): Promise<string> {
    try {
      const prompt = `Create a detailed prompt for generating a YouTube thumbnail based on:

User Request:
- Topic: "${userAnswers.topic}"
- Target Audience: ${userAnswers.targetAudience}
- Content Type: ${userAnswers.contentType}
- Emotion: ${userAnswers.emotion}
- Key Elements: ${userAnswers.keyElements}
- Style: ${userAnswers.stylePreference}

Reference YouTube Thumbnails (real successful examples):
${youtubeThumbnails.slice(0, 3).map((thumb, i) => {
  const views = parseInt(thumb.viewCount || '0').toLocaleString();
  return `${i + 1}. "${thumb.title}" by ${thumb.channelTitle} (${views} views) - Published: ${new Date(thumb.publishedAt).toLocaleDateString()}`;
}).join('\n')}

Generate a detailed prompt for Gemini 2.5 Flash Image Preview that will create an eye-catching YouTube thumbnail. Include specific details about:
- Layout and composition
- Colors and visual style
- Text placement and typography
- Visual elements and graphics
- Overall mood and atmosphere

Make it optimized for high click-through rates.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert YouTube thumbnail designer. Create detailed, specific prompts for AI image generation that will result in high-CTR thumbnails. Focus on visual impact, readability, and emotional appeal.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || this.buildFallbackThumbnailPrompt(userAnswers);
    } catch (error) {
      console.error('Error generating thumbnail prompt:', error);
      return this.buildFallbackThumbnailPrompt(userAnswers);
    }
  }

  private buildFallbackThumbnailPrompt(userAnswers: UserAnswers): string {
    const { topic, targetAudience, emotion, keyElements, stylePreference } = userAnswers;
    
    return `Create a high-quality YouTube thumbnail for "${topic}".

Style: ${stylePreference} design with ${emotion.toLowerCase()} mood
Target Audience: ${targetAudience}
Main Focus: ${keyElements}

Visual Requirements:
- 16:9 aspect ratio (1280x720px)
- High contrast for visibility
- Large, readable text (max 4-6 words)
- Eye-catching colors
- Professional quality
- Clear focal point
- Optimized for small display sizes

Text should be bold, sans-serif font with strong outline/shadow for readability.
Use vibrant, contrasting colors that stand out in YouTube's interface.
Ensure the main subject/element is prominently displayed and easily recognizable.`;
  }

  async rewriteMultipleQueries(userAnswers: UserAnswers): Promise<string[]> {
    const baseQuery = await this.enhanceSearchQuery(userAnswers);
    
    // Generate variations for better coverage
    const variations = [
      baseQuery,
      `${userAnswers.topic} ${userAnswers.stylePreference.toLowerCase()} thumbnail`,
      `${userAnswers.contentType.toLowerCase()} ${userAnswers.emotion.toLowerCase()} design`,
      `${userAnswers.targetAudience.toLowerCase()} ${userAnswers.keyElements.toLowerCase().replace(/['']/g, '')}`,
    ];

    return [...new Set(variations)]; // Remove duplicates
  }
}

export const queryRewriter = new QueryRewriter();
