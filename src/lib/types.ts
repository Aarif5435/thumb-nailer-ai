export interface ThumbnailData {
  id: string;
  thumbnailUrl: string;
  title: string;
  channel: string;
  category: 'entertainment' | 'technical' | 'gaming' | 'lifestyle' | 'education' | 'music';
  subcategory: string;
  views: number;
  visualElements: string[];
  colorPalette: string[];
  textElements: string[];
  layoutType: 'split_screen' | 'full_face' | 'product_focus' | 'text_heavy' | 'minimal';
  emotion: 'excitement' | 'curiosity' | 'urgency' | 'trust' | 'fun' | 'professional';
  targetAudience: 'kids' | 'teens' | 'adults' | 'professionals';
  performanceScore: number;
  description: string;
  [key: string]: unknown;
}

export interface UserAnswers {
  topic: string;
  targetAudience: string;
  contentType: string;
  emotion: string;
  keyElements: string;
  stylePreference: string;
  additionalAnswers?: Record<string, string>;
}

export interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  required: boolean;
}

export interface GeneratedThumbnail {
  imageUrl: string;
  prompt: string;
  referenceImages: string[];
  metadata: {
    style: string;
    colors: string[];
    elements: string[];
    // Enhanced metadata for CTR analysis
    targetAudience?: string;
    emotion?: string;
    contentType?: string;
    keyElements?: string;
    stylePreference?: string;
    generationTimestamp?: string;
    aspectRatio?: string;
    dimensions?: string;
    colorCount?: number;
    elementCount?: number;
    hasText?: boolean;
    hasLogo?: boolean;
    referenceCount?: number;
    averageReferenceScore?: number;
  };
}

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: ThumbnailData;
}

export interface SearchResult {
  thumbnails: ThumbnailData[];
  similarity: number[];
  query: string;
}
