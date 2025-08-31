'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Check, Sparkles, Camera, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface ModernImageUploadProps {
  onImageUpload: (base64: string) => void;
  onImageRemove: () => void;
  uploadedImage?: string;
}

export function ModernImageUpload({ onImageUpload, onImageRemove, uploadedImage }: ModernImageUploadProps) {
  const { isDark } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        onImageUpload(base64Data);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!uploadedImage ? (
          <div
            {...getRootProps()}
            className={`relative cursor-pointer transition-all duration-300 ${
              isDragActive || dragActive
                ? 'scale-105'
                : 'hover:scale-[1.02]'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
            
            <div className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
              isDragActive || dragActive
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : isDark
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            } backdrop-blur-sm`}>
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 gap-2 h-full w-full p-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-current rounded"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="relative p-12 text-center">
                {uploading ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Processing Image...
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        This will just take a moment
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Icon */}
                    <motion.div
                      className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                        isDragActive || dragActive
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      } shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Camera className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    {/* Text */}
                    <div className="space-y-2">
                      <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {isDragActive ? 'Drop it here!' : 'Add Your Image'}
                      </h3>
                      <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isDragActive 
                          ? 'Release to upload your image'
                          : 'Drag & drop an image or click to browse'
                        }
                      </p>
                    </div>
                    
                    {/* Supported Formats */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {['JPG', 'PNG', 'GIF', 'WEBP'].map((format) => (
                        <span
                          key={format}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <motion.div
                      className="pt-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="w-5 h-5 mr-2" />
                        Choose Image
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className={`relative overflow-hidden rounded-3xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-xl border-2 border-green-200 dark:border-green-800`}>
              
              {/* Success Badge */}
              <div className="absolute top-4 left-4 z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Image Added</span>
                </motion.div>
              </div>
              
              {/* Remove Button */}
              <motion.button
                onClick={onImageRemove}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              {/* Image Preview */}
              <div className="aspect-video relative overflow-hidden">
                <motion.img
                  src={`data:image/jpeg;base64,${uploadedImage}`}
                  alt="Uploaded image"
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                
                {/* Replace Button */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <div
                    {...getRootProps()}
                    className="cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <motion.button
                      className="px-6 py-3 bg-white text-black font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Replace Image
                    </motion.button>
                  </div>
                </motion.div>
              </div>
              
              {/* Image Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Image ready for thumbnail
                    </span>
                  </div>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
