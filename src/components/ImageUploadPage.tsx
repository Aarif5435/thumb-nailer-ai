'use client';

import { motion } from 'framer-motion';
import { Upload, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { ModernImageUpload } from './ModernImageUpload';

interface ImageUploadPageProps {
  userImage: string;
  setUserImage: (image: string) => void;
  onContinue: () => void;
  onBack: () => void;
  topic: string;
  loadingQuestions: boolean;
  isLoading?: boolean;
}

export function ImageUploadPage({ 
  userImage, 
  setUserImage, 
  onContinue, 
  onBack,
  topic,
  loadingQuestions,
  isLoading = false
}: ImageUploadPageProps) {
  const isDark = false; // Default to light theme

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className={`mb-8 inline-flex items-center px-4 py-2 rounded-full ${
            isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
          } shadow-lg transition-all duration-200`}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Topic
        </motion.button>

        {/* Main Content */}
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className={`inline-flex items-center px-6 py-3 rounded-full ${
              isDark 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-blue-50 border border-blue-200'
            } backdrop-blur-sm`}>
              <Upload className="w-5 h-5 text-blue-500 mr-3" />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-blue-600'}`}>
                Step 2: Add your image (Optional)
              </span>
            </div>

            <h1 className={`text-5xl md:text-7xl font-black leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Enhance Your Thumbnail
            </h1>

            <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Upload an image to include in your "{topic}" thumbnail, or skip to continue
            </p>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <ModernImageUpload
              onImageUpload={setUserImage}
              onImageRemove={() => setUserImage('')}
              uploadedImage={userImage}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={onContinue}
              disabled={loadingQuestions}
              className="px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl rounded-3xl shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loadingQuestions ? { scale: 1.05, y: -3 } : {}}
              whileTap={!loadingQuestions ? { scale: 0.95 } : {}}
            >
              {loadingQuestions ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                  />
                  Processing...
                </div>
              ) : (
                <>
                  Continue to Questions
                  <ArrowRight className="w-6 h-6 ml-3 inline" />
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={onContinue}
              className="px-8 py-6 bg-gray-500 text-white font-semibold text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip Image Upload
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
