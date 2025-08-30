'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Check, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  onImageRemove: () => void;
  uploadedImage?: string;
}

export function ImageUpload({ onImageUpload, onImageRemove, uploadedImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const base64 = await fileToBase64(file);
      onImageUpload(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
    } finally {
      setUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setDragCounter(prev => prev + 1),
    onDragLeave: () => setDragCounter(prev => prev - 1),
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  if (uploadedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative group"
      >
        {/* Success indicator */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>

        {/* Image container */}
        <div className="relative rounded-3xl overflow-hidden glass border border-white/30 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          
          <img
            src={`data:image/jpeg;base64,${uploadedImage}`}
            alt="Uploaded"
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ opacity: 1 }}
          />
          
          {/* Remove button */}
          <motion.button
            onClick={onImageRemove}
            className="absolute top-4 right-4 p-3 bg-red-500/90 backdrop-blur-sm text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Image info overlay */}
          <motion.div
            className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Image Ready!</p>
                <p className="text-white/80 text-sm">Will be featured in your thumbnail</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Success message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-green-800 font-semibold text-sm">Perfect! Image uploaded successfully</h4>
              <p className="text-green-700 text-xs mt-1">
                Your image will be seamlessly integrated into the AI-generated thumbnail design.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-500 transform ${
          isDragActive && !isDragReject
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02] shadow-2xl'
            : isDragReject
            ? 'border-red-500 bg-red-50 shake'
            : 'border-gray-300/50 bg-gradient-to-br from-white/80 to-gray-50/80 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 hover:scale-[1.01] hover:shadow-xl'
        } ${uploading ? 'opacity-70 cursor-not-allowed' : ''} glass backdrop-blur-sm`}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {/* Background decoration */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center space-y-6">
          {/* Icon container */}
          <motion.div
            className={`relative p-6 rounded-3xl shadow-lg transition-all duration-500 ${
              isDragActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110'
                : uploading
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100'
            }`}
            animate={uploading ? { rotate: [0, 360] } : {}}
            transition={uploading ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            whileHover={{ scale: 1.05, rotate: isDragActive ? 0 : 5 }}
          >
            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div
                  key="uploading"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
              ) : isDragActive ? (
                <motion.div
                  key="active"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <ImageIcon className="w-10 h-10 text-gray-500" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating particles */}
            {isDragActive && (
              <div className="absolute inset-0">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Text content */}
          <motion.div
            className="space-y-3"
            animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className={`text-2xl font-bold transition-all duration-300 ${
              isDragActive
                ? 'text-blue-600 gradient-text'
                : uploading
                ? 'text-orange-600'
                : 'text-gray-700'
            }`}>
              {uploading ? 'Processing Your Image...' : isDragActive ? 'Drop it like it\'s hot! 🔥' : 'Upload Your Image'}
            </h3>
            
            <p className={`text-lg transition-all duration-300 ${
              isDragActive
                ? 'text-blue-600 font-medium'
                : 'text-gray-500'
            }`}>
              {isDragActive
                ? 'Release to upload your awesome image!'
                : uploading
                ? 'Please wait while we prepare your image...'
                : 'Drag & drop an image, or click to browse'}
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>JPEG, PNG, WebP</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Up to 10MB</span>
              </span>
            </div>
          </motion.div>

          {/* Upload progress */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs"
            >
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 p-6 glass rounded-2xl border border-white/30"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">✨ Pro Tip: Make Your Thumbnail Shine!</h4>
            <p className="text-gray-600 leading-relaxed">
              Upload your best image - it could be your face, a product shot, a screenshot, or any visual element 
              you want to feature. Our AI will seamlessly blend it with the perfect background, text, and effects 
              to create a thumbnail that stops the scroll! 🚀
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Portrait photos', 'Product images', 'Screenshots', 'Logos', 'Graphics'].map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
