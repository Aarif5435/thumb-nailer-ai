import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './config';
import { ThumbnailData, QdrantPoint } from './types';
import OpenAI from 'openai';

// Initialize Qdrant client
export const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
});

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class VectorDatabase {
  private collectionName = config.vectorDB.collectionName;

  async initializeCollection() {
    try {
      // Check if collection exists
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(
        col => col.name === this.collectionName
      );

      if (!exists) {
        // Create collection
        await qdrantClient.createCollection(this.collectionName, {
          vectors: {
            size: config.vectorDB.vectorSize,
            distance: 'Cosine',
          },
        });
      }
    } catch (error) {
      console.error('Error initializing collection:', error);
      throw error;
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  async addThumbnail(thumbnail: ThumbnailData): Promise<void> {
    try {
      // Create text for embedding
      const embeddingText = this.createEmbeddingText(thumbnail);
      const vector = await this.createEmbedding(embeddingText);

      await qdrantClient.upsert(this.collectionName, {
        wait: true,
        points: [{
          id: thumbnail.id,
          vector,
          payload: thumbnail as Record<string, unknown>,
        }],
      });
    } catch (error) {
      console.error('Error adding thumbnail to vector DB:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, limit: number = 5): Promise<ThumbnailData[]> {
    try {
      const queryVector = await this.createEmbedding(query);
      
      const searchResult = await qdrantClient.search(this.collectionName, {
        vector: queryVector,
        limit,
        with_payload: true,
      });

      return searchResult.map(result => result.payload as unknown as ThumbnailData);
    } catch (error: any) {
      console.warn('Qdrant database not available, proceeding without similar thumbnails');
      return []; // Always return empty array for any connection errors
    }
  }

  async batchAddThumbnails(thumbnails: ThumbnailData[]): Promise<void> {
    try {
      const points = [];
      
      for (const thumbnail of thumbnails) {
        const embeddingText = this.createEmbeddingText(thumbnail);
        const vector = await this.createEmbedding(embeddingText);
        
        points.push({
          id: thumbnail.id,
          vector,
          payload: thumbnail as Record<string, unknown>,
        });
      }

      // Batch upsert
      await qdrantClient.upsert(this.collectionName, {
        wait: true,
        points,
      });

    } catch (error) {
      console.error('Error batch adding thumbnails:', error);
      throw error;
    }
  }

  private createEmbeddingText(thumbnail: ThumbnailData): string {
    return [
      thumbnail.title,
      thumbnail.category,
      thumbnail.subcategory,
      thumbnail.description,
      thumbnail.emotion,
      thumbnail.targetAudience,
      thumbnail.layoutType,
      ...thumbnail.visualElements,
      ...thumbnail.textElements,
    ].join(' ');
  }

  async getCollectionInfo() {
    try {
      const info = await qdrantClient.getCollection(this.collectionName);
      return info;
    } catch (error) {
      console.error('Error getting collection info:', error);
      return null;
    }
  }
}

export const vectorDB = new VectorDatabase();
