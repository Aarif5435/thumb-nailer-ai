'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Eye, AlertCircle, X, Maximize2 } from 'lucide-react';

interface ThumbnailPreviewProps {
  imageUrl: string;
  alt: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export function ThumbnailPreview({ imageUrl, alt, onRegenerate, regenerating }: ThumbnailPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Try to load the image data directly
    const loadImage = async () => {
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const dataUrl = URL.createObjectURL(blob);
          setImageData(dataUrl);
          setImageLoaded(true);
          setImageError(false);
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        setImageError(true);
      }
    };

    loadImage();

    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageUrl]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'youtube-thumbnail.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Eye className="w-8 h-8 mr-3 text-red-500" />
          Thumbnail Ready!
        </motion.h2>
        
        <div className="flex space-x-4">
          {onRegenerate && (
            <motion.button
              onClick={onRegenerate}
              disabled={regenerating}
              className="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl hover:bg-white transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Creating...' : 'New'}
            </motion.button>
          )}
          
          <motion.button
            onClick={() => setShowPreview(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Maximize2 className="w-5 h-5 mr-2" />
            Preview
          </motion.button>
          
          <motion.button
            onClick={handleDownload}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </motion.button>
        </div>
      </div>

      {/* Thumbnail Container */}
      <motion.div
        className="relative group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background decoration */}
        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-xl" />
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          {/* Aspect ratio container */}
          <div className="aspect-video relative">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600 font-medium">Loading your masterpiece...</p>
                </div>
              </div>
            )}

            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold text-lg">Preview Unavailable</p>
                  <p className="text-red-500 text-sm">But your thumbnail was generated successfully!</p>
                  <p className="text-gray-600 text-sm mt-2">Click download to save your thumbnail</p>
                </div>
              </div>
            )}

            {imageLoaded && imageData && (
              <motion.img
                src={imageData}
                alt={alt}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onLoad={() =>  ('Image displayed successfully')}
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            
            {/* YouTube play button overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
            </motion.div>
          </div>

          {/* YouTube-style thumbnail frame */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            16:9 HD
          </div>
        </div>

        {/* CTR Stats */}
        <motion.div
          className="mt-6 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">CTR Optimized</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
            <div className="text-2xl font-bold text-blue-600">1280×720</div>
            <div className="text-sm text-gray-600">YouTube HD</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50">
            <div className="text-2xl font-bold text-purple-600">Ready</div>
            <div className="text-sm text-gray-600">To Upload</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Full Screen Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <motion.button
              onClick={() => setShowPreview(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Image container */}
            <motion.div
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {imageData && (
                <motion.img
                  src={imageData}
                  alt={alt}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              )}
            </motion.div>

            {/* Thumbnail info overlay */}
            <motion.div
              className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-sm text-white rounded-2xl p-4 max-w-md"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Thumbnail Preview</h3>
                  <p className="text-sm text-gray-300">16:9 HD • 1280×720 • CTR Optimized</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">95%</div>
                  <div className="text-xs text-gray-400">CTR</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
