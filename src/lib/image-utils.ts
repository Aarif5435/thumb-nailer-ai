/**
 * Utility functions for handling base64 images
 */

export function normalizeImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // If it's already a data URL, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a base64 string without data URL prefix, add it
  if (imageUrl.startsWith('iVBORw0KGgo') || imageUrl.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/png;base64,${imageUrl}`;
  }
  
  // If it's a regular URL, return as is
  return imageUrl;
}

export function isValidBase64Image(imageUrl: string): boolean {
  if (!imageUrl) return false;
  
  try {
    // Check if it's a data URL
    if (imageUrl.startsWith('data:image/')) {
      const base64Part = imageUrl.split(',')[1];
      if (!base64Part) return false;
      
      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(base64Part);
    }
    
    // Check if it's a raw base64 string
    if (imageUrl.startsWith('iVBORw0KGgo') || imageUrl.match(/^[A-Za-z0-9+/=]+$/)) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

export function getImageSize(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = normalizeImageUrl(imageUrl) || '';
  });
}
