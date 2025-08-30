import { config } from './config';

export interface YouTubeThumbnail {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  viewCount: string;
  publishedAt: string;
  description: string;
}

export class YouTubeAPIService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = config.youtube?.apiKey || process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Reference thumbnails will be skipped.');
    }
  }

  async searchThumbnails(topic: string, maxResults: number = 3): Promise<YouTubeThumbnail[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not available, returning empty results');
      return [];
    }

    try {
      // Create a search query optimized for finding high-quality thumbnails
      const searchQuery = this.buildSearchQuery(topic);
      
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('type', 'video');
      url.searchParams.set('maxResults', maxResults.toString());
      url.searchParams.set('order', 'relevance'); // Get most relevant results
      url.searchParams.set('videoDuration', 'medium'); // Focus on substantial content
      url.searchParams.set('videoDefinition', 'high'); // High quality videos likely have better thumbnails
      url.searchParams.set('key', this.apiKey);

      console.log('Fetching YouTube thumbnails for topic:', topic);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.log('No YouTube results found for topic:', topic);
        return [];
      }

      // Get video statistics for better filtering
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const statsUrl = new URL(`${this.baseUrl}/videos`);
      statsUrl.searchParams.set('part', 'statistics');
      statsUrl.searchParams.set('id', videoIds);
      statsUrl.searchParams.set('key', this.apiKey);

      const statsResponse = await fetch(statsUrl.toString());
      const statsData = statsResponse.ok ? await statsResponse.json() : null;

      const thumbnails: YouTubeThumbnail[] = data.items
        .map((item: any, index: number) => {
          const stats = statsData?.items?.[index]?.statistics || {};
          
          return {
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnailUrl: this.getBestThumbnailUrl(item.snippet.thumbnails),
            channelTitle: item.snippet.channelTitle,
            viewCount: stats.viewCount || '0',
            publishedAt: item.snippet.publishedAt,
            description: item.snippet.description || '',
          };
        })
        .filter((thumbnail: YouTubeThumbnail) => 
          thumbnail.thumbnailUrl && 
          parseInt(thumbnail.viewCount) > 1000 // Filter for videos with decent view count
        )
        .slice(0, maxResults);

      console.log(`Found ${thumbnails.length} reference thumbnails for topic: ${topic}`);
      
      return thumbnails;
    } catch (error) {
      console.error('Error fetching YouTube thumbnails:', error);
      return [];
    }
  }

  private buildSearchQuery(topic: string): string {
    // Clean and optimize the search query
    const cleanTopic = topic.toLowerCase().trim();
    
    // Add relevant keywords to find high-quality content
    const qualityKeywords = [
      'tutorial', 'guide', 'how to', 'explained', 'tips', 'secrets', 
      'ultimate', 'complete', 'best', 'top', 'amazing', 'incredible'
    ];
    
    // Check if topic already contains quality keywords
    const hasQualityKeyword = qualityKeywords.some(keyword => 
      cleanTopic.includes(keyword)
    );
    
    if (!hasQualityKeyword) {
      // Add a quality keyword to improve results
      return `${topic} tutorial OR ${topic} guide OR ${topic} explained`;
    }
    
    return topic;
  }

  private getBestThumbnailUrl(thumbnails: any): string {
    // Prefer high quality thumbnails
    if (thumbnails.maxres?.url) return thumbnails.maxres.url;
    if (thumbnails.high?.url) return thumbnails.high.url;
    if (thumbnails.medium?.url) return thumbnails.medium.url;
    if (thumbnails.default?.url) return thumbnails.default.url;
    return '';
  }

  async downloadThumbnailAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download thumbnail: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return base64;
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      return null;
    }
  }

  async getThumbnailsWithBase64(topic: string, maxResults: number = 3): Promise<(YouTubeThumbnail & { base64Image?: string })[]> {
    const thumbnails = await this.searchThumbnails(topic, maxResults);
    
    // Download thumbnails as base64 for LLM reference
    const thumbnailsWithBase64 = await Promise.all(
      thumbnails.map(async (thumbnail) => {
        const base64Image = await this.downloadThumbnailAsBase64(thumbnail.thumbnailUrl);
        return {
          ...thumbnail,
          base64Image: base64Image || undefined,
        };
      })
    );
    
    // Filter out failed downloads
    return thumbnailsWithBase64.filter(t => t.base64Image);
  }

  // Method to get reference thumbnails for the LLM prompt
  async getReferenceThumbnailsForPrompt(topic: string): Promise<{
    thumbnails: YouTubeThumbnail[];
    referenceImages: string[]; // Base64 images for LLM
    contextDescription: string;
  }> {
    const thumbnailsWithBase64 = await this.getThumbnailsWithBase64(topic, 3);
    
    const referenceImages = thumbnailsWithBase64
      .map(t => t.base64Image)
      .filter(Boolean) as string[];
    
    const contextDescription = thumbnailsWithBase64.length > 0
      ? `Reference thumbnails from successful YouTube videos about "${topic}":\n` +
        thumbnailsWithBase64.map((t, i) => 
          `${i + 1}. "${t.title}" by ${t.channelTitle} (${parseInt(t.viewCount).toLocaleString()} views)`
        ).join('\n')
      : `No reference thumbnails found for "${topic}". Creating original design.`;
    
    return {
      thumbnails: thumbnailsWithBase64,
      referenceImages,
      contextDescription,
    };
  }
}

export const youtubeAPI = new YouTubeAPIService();
