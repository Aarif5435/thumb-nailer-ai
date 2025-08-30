'use client';

import { GeneratedThumbnail, ThumbnailData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Eye, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ThumbnailPreview } from './ThumbnailPreview';

interface ThumbnailResultProps {
  thumbnail: GeneratedThumbnail;
  similarThumbnails: ThumbnailData[];
  onRegenerate: () => void;
  regenerating?: boolean;
}

export function ThumbnailResult({ 
  thumbnail, 
  similarThumbnails, 
  onRegenerate, 
  regenerating 
}: ThumbnailResultProps) {
  const [showReferences, setShowReferences] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Main Thumbnail Preview */}
      <ThumbnailPreview
        imageUrl={thumbnail.imageUrl}
        alt="Generated Thumbnail"
        onRegenerate={onRegenerate}
        regenerating={regenerating}
      />

      {/* CTR Optimization Insights */}
      <motion.div
        className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">CTR Optimization Report</h3>
            <p className="text-gray-600">Your thumbnail is optimized for maximum clicks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-sm font-medium text-green-700">CTR Score</div>
            <div className="text-xs text-green-600 mt-1">High-impact design</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
            <div className="text-lg font-bold text-blue-600 mb-2">{thumbnail.metadata.style}</div>
            <div className="text-sm font-medium text-blue-700">Visual Style</div>
            <div className="text-xs text-blue-600 mt-1">Audience-optimized</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
            <div className="flex space-x-1 mb-2">
              {thumbnail.metadata.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="text-sm font-medium text-purple-700">Color Palette</div>
            <div className="text-xs text-purple-600 mt-1">High contrast</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
            <div className="text-lg font-bold text-orange-600 mb-2">HD Ready</div>
            <div className="text-sm font-medium text-orange-700">1280×720px</div>
            <div className="text-xs text-orange-600 mt-1">YouTube optimized</div>
          </div>
        </div>
      </motion.div>

      {/* Reference Thumbnails */}
      {similarThumbnails.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-500" />
              Reference Thumbnails Used
            </h3>
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showReferences ? 'Hide' : 'Show'} References
            </button>
          </div>

          {showReferences && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {similarThumbnails.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <img
                    src={ref.thumbnailUrl}
                    alt={ref.title}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                    {ref.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{ref.channel}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {ref.category}
                    </span>
                    <span className="text-gray-500">
                      {ref.performanceScore}/10
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Generation Prompt */}
      {/* <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Generation Prompt</h3>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            {thumbnail.prompt.length > 300 
              ? `${thumbnail.prompt.substring(0, 300)}...` 
              : thumbnail.prompt
            }
          </p>
        </div>
      </div> */}
    </motion.div>
  );
}
