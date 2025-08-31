export const config = {
  // API Keys
  googleAI: {
    apiKey: process.env.FLASH_IMG_API_KEY || '',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
  },
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // App Configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Vector Database
  vectorDB: {
    collectionName: 'youtube_thumbnails',
    vectorSize: 1536, // OpenAI embeddings size
  },

  // Thumbnail Generation
  generation: {
    model: 'gemini-2.5-flash-image-preview',
    maxReferences: 5,
    outputFormat: 'png',
    aspectRatio: '16:9',
  },

  // YouTube Scraping
  scraping: {
    categories: [
      'entertainment',
      'technical', 
      'gaming',
      'lifestyle',
      'education',
      'music'
    ],
    maxVideosPerCategory: 100,
    minViews: 10000,
  },
} as const;

export type Config = typeof config;
