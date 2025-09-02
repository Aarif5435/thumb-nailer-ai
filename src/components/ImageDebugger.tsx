'use client';

import { useState, useEffect } from 'react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ImageDebuggerProps {
  imageUrl: string | null | undefined;
  topic: string;
}

export function ImageDebugger({ imageUrl, topic }: ImageDebuggerProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setImageStatus('error');
      return;
    }

    const normalizedUrl = normalizeImageUrl(imageUrl);
    console.log('🔍 ImageDebugger for:', topic);
    console.log('Original URL length:', imageUrl.length);
    console.log('Normalized URL length:', normalizedUrl?.length);
    console.log('URL starts with data:', imageUrl.startsWith('data:'));
    console.log('First 100 chars:', imageUrl.substring(0, 100));

    const img = new Image();
    
    img.onload = () => {
      console.log('✅ Image loaded successfully!');
      console.log('Dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      setImageStatus('loaded');
      setImageInfo({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: imageUrl.length
      });
    };

    img.onerror = (e) => {
      console.error('❌ Image failed to load:', e);
      setImageStatus('error');
    };

    img.src = normalizedUrl || '';
  }, [imageUrl, topic]);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h4 className="font-semibold text-yellow-800 mb-2">Image Debug Info: {topic}</h4>
      <div className="text-sm text-yellow-700 space-y-1">
        <p>Status: <span className="font-mono">{imageStatus}</span></p>
        <p>URL Length: <span className="font-mono">{imageUrl?.length || 0}</span></p>
        <p>Starts with data: <span className="font-mono">{imageUrl?.startsWith('data:') ? 'Yes' : 'No'}</span></p>
        {imageInfo && (
          <>
            <p>Dimensions: <span className="font-mono">{imageInfo.width} x {imageInfo.height}</span></p>
            <p>Size: <span className="font-mono">{(imageInfo.size / 1024).toFixed(1)} KB</span></p>
          </>
        )}
      </div>
    </div>
  );
}
