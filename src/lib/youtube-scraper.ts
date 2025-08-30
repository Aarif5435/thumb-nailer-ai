import { google } from 'googleapis';
import { config } from './config';
import { ThumbnailData } from './types';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const youtube = google.youtube({
  version: 'v3',
  auth: config.youtube.apiKey,
});

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class YouTubeScraper {
  private searchQueries = {
    technical: [
      'programming tutorial', 'web development', 'coding interview', 'software engineering',
      'react tutorial', 'javascript tutorial', 'python programming', 'data structures',
      'machine learning', 'artificial intelligence', 'database design', 'system design'
    ],
    entertainment: [
      'comedy sketches', 'funny moments', 'entertainment news', 'celebrity interviews',
      'movie reviews', 'tv show reactions', 'viral videos', 'trending content',
      'pranks', 'challenges', 'memes', 'pop culture'
    ],
    gaming: [
      'gameplay walkthrough', 'game reviews', 'esports highlights', 'gaming news',
      'stream highlights', 'game tutorials', 'speedrun', 'gaming setup',
      'new game releases', 'gaming tips', 'game analysis', 'indie games'
    ],
    lifestyle: [
      'lifestyle vlog', 'health and fitness', 'cooking recipes', 'travel vlog',
      'fashion haul', 'beauty tutorials', 'home decor', 'productivity tips',
      'morning routine', 'self improvement', 'wellness', 'life advice'
    ],
    education: [
      'educational content', 'science explained', 'history lessons', 'math tutorials',
      'language learning', 'study tips', 'exam preparation', 'online courses',
      'educational documentary', 'how things work', 'science experiments', 'academic help'
    ],
    music: [
      'new music releases', 'music videos', 'artist interviews', 'live performances',
      'music covers', 'song analysis', 'music production', 'behind the scenes',
      'music reviews', 'concert footage', 'music tutorials', 'album reactions'
    ],
  };

  async scrapeThumbnails(category: keyof typeof this.searchQueries, maxResults: number = 50): Promise<ThumbnailData[]> {
    const thumbnails: ThumbnailData[] = [];
    const queries = this.searchQueries[category];

    try {
      for (const query of queries.slice(0, 3)) { // Limit queries to avoid API limits
        console.log(`Scraping thumbnails for query: ${query}`);
        
        const response = await youtube.search.list({
          part: ['snippet'],
          q: query,
          type: ['video'],
          maxResults: Math.min(20, maxResults),
          order: 'viewCount',
          publishedAfter: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Last year
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            if (item.snippet && item.id?.videoId) {
              // Get video statistics
              const statsResponse = await youtube.videos.list({
                part: ['statistics'],
                id: [item.id.videoId],
              });

              const stats = statsResponse.data.items?.[0]?.statistics;
              const viewCount = parseInt(stats?.viewCount || '0');

              // Filter by minimum views
              if (viewCount >= config.scraping.minViews) {
                const thumbnailData = await this.processThumbnail(item, category, viewCount);
                if (thumbnailData) {
                  thumbnails.push(thumbnailData);
                }
              }
            }
          }
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error scraping ${category} thumbnails:`, error);
    }

    return thumbnails;
  }

  private async processThumbnail(
    item: any,
    category: keyof typeof this.searchQueries,
    viewCount: number
  ): Promise<ThumbnailData | null> {
    try {
      const snippet = item.snippet;
      const thumbnailUrl = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url;
      
      if (!thumbnailUrl) return null;

      // Analyze thumbnail using OpenAI Vision (if available) or create based on metadata
      const analysis = await this.analyzeThumbnail(snippet.title, snippet.description, thumbnailUrl);

      const thumbnailData: ThumbnailData = {
        id: uuidv4(),
        thumbnailUrl,
        title: snippet.title,
        channel: snippet.channelTitle,
        category,
        subcategory: this.extractSubcategory(snippet.title, category),
        views: viewCount,
        visualElements: analysis.visualElements,
        colorPalette: analysis.colorPalette,
        textElements: analysis.textElements,
        layoutType: analysis.layoutType,
        emotion: analysis.emotion,
        targetAudience: this.determineTargetAudience(snippet.title, snippet.description),
        performanceScore: this.calculatePerformanceScore(viewCount, snippet.title),
        description: analysis.description,
      };

      return thumbnailData;
    } catch (error) {
      console.error('Error processing thumbnail:', error);
      return null;
    }
  }

  private async analyzeThumbnail(title: string, description: string, thumbnailUrl: string) {
    try {
      // Use OpenAI to analyze the thumbnail
      const prompt = `Analyze this YouTube thumbnail and title: "${title}".
      
      Based on the title and typical YouTube thumbnail patterns, provide analysis in this JSON format:
      {
        "visualElements": ["face", "text_overlay", "bright_colors", "arrows", "objects"],
        "colorPalette": ["#FF0000", "#00FF00", "#0000FF"],
        "textElements": ["SHOCKING", "NEW", "2024"],
        "layoutType": "split_screen|full_face|product_focus|text_heavy|minimal",
        "emotion": "excitement|curiosity|urgency|trust|fun|professional",
        "description": "Brief description of visual elements and style"
      }
      
      Respond only with valid JSON.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch {
          // Fallback if JSON parsing fails
          return this.getFallbackAnalysis(title);
        }
      }
    } catch (error) {
      console.error('Error analyzing thumbnail with OpenAI:', error);
    }

    return this.getFallbackAnalysis(title);
  }

  private getFallbackAnalysis(title: string) {
    const titleLower = title.toLowerCase();
    
    // Determine visual elements based on title keywords
    const visualElements = [];
    if (titleLower.includes('react') || titleLower.includes('tutorial')) visualElements.push('text_overlay', 'clean_layout');
    if (titleLower.includes('shocking') || titleLower.includes('amazing')) visualElements.push('bright_colors', 'dramatic');
    if (titleLower.includes('review') || titleLower.includes('vs')) visualElements.push('split_screen', 'comparison');
    
    // Default color palette
    const colorPalette = ['#FF0000', '#FFFFFF', '#000000'];
    
    // Extract text elements from title
    const textElements = title.split(' ').filter(word => 
      word.length > 3 && !['the', 'and', 'for', 'with'].includes(word.toLowerCase())
    ).slice(0, 3);

    return {
      visualElements: visualElements.length ? visualElements : ['text_overlay', 'clean_layout'],
      colorPalette,
      textElements,
      layoutType: 'text_heavy' as const,
      emotion: 'curiosity' as const,
      description: `Thumbnail for: ${title}`,
    };
  }

  private extractSubcategory(title: string, category: string): string {
    const titleLower = title.toLowerCase();
    
    switch (category) {
      case 'technical':
        if (titleLower.includes('react')) return 'react';
        if (titleLower.includes('javascript')) return 'javascript';
        if (titleLower.includes('python')) return 'python';
        if (titleLower.includes('ai') || titleLower.includes('machine learning')) return 'ai';
        return 'general';
      
      case 'gaming':
        if (titleLower.includes('minecraft')) return 'minecraft';
        if (titleLower.includes('fortnite')) return 'fortnite';
        if (titleLower.includes('valorant')) return 'valorant';
        return 'general';
      
      default:
        return 'general';
    }
  }

  private determineTargetAudience(title: string, description: string): ThumbnailData['targetAudience'] {
    const content = `${title} ${description}`.toLowerCase();
    
    if (content.includes('kids') || content.includes('children')) return 'kids';
    if (content.includes('teen') || content.includes('young')) return 'teens';
    if (content.includes('professional') || content.includes('business')) return 'professionals';
    
    return 'adults'; // Default
  }

  private calculatePerformanceScore(views: number, title: string): number {
    // Simple scoring based on views and title characteristics
    let score = Math.min(views / 100000, 8); // Base score from views
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('tutorial') || titleLower.includes('how to')) score += 1;
    if (titleLower.includes('2024') || titleLower.includes('new')) score += 0.5;
    if (title.length > 50) score -= 0.5; // Penalize very long titles
    
    return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
  }

  async scrapeAllCategories(): Promise<Record<string, ThumbnailData[]>> {
    const results: Record<string, ThumbnailData[]> = {};
    
    for (const category of config.scraping.categories) {
      console.log(`\nScraping ${category} category...`);
      results[category] = await this.scrapeThumbnails(
        category as keyof typeof this.searchQueries,
        config.scraping.maxVideosPerCategory
      );
      console.log(`Scraped ${results[category].length} thumbnails for ${category}`);
      
      // Add delay between categories
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }
}

export const youtubeScraper = new YouTubeScraper();
