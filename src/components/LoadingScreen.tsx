'use client';

import { motion } from 'framer-motion';
import { Sparkles, Youtube, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function LoadingScreen() {
  const { isDark } = useTheme();

  const facts = [
    "🎯 Thumbnails account for 90% of video performance",
    "🚀 Good thumbnails can increase CTR by 30-300%",
    "👁️ Viewers decide in 0.05 seconds whether to click",
    "🎨 Bright colors perform 3x better than dark ones",
    "📱 Most views happen on mobile devices",
  ];

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
        : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
    }`}>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30' : 'bg-gradient-to-r from-red-400/30 to-orange-400/30'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30' : 'bg-gradient-to-r from-yellow-400/30 to-red-400/30'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6">
        {/* Loading Animation */}
        <div className="relative">
          <motion.div
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-2xl"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Youtube className="w-12 h-12 text-white" />
          </motion.div>
          
          {/* Orbiting Elements */}
          {[Sparkles, Zap].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 w-8 h-8"
              style={{ originX: 0.5, originY: 0.5 }}
              animate={{
                rotate: 360,
                x: Math.cos((index * Math.PI) + (Math.PI / 2)) * 50 - 16,
                y: Math.sin((index * Math.PI) + (Math.PI / 2)) * 50 - 16,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.5,
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-800 text-orange-400' : 'bg-white text-orange-500'
              } shadow-lg`}>
                <Icon className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Creating Your Viral Thumbnail
          </h2>
          
          <motion.div
            className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Random Facts */}
        <motion.div
          className={`p-4 rounded-2xl ${
            isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/80 border border-white/50'
          } backdrop-blur-sm`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.p
            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            key={Math.floor(Date.now() / 3000) % facts.length}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {facts[Math.floor(Date.now() / 3000) % facts.length]}
          </motion.p>
        </motion.div>

        {/* AI Process Steps */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[
            "🔍 Analyzing your topic",
            "📺 Fetching YouTube references",
            "🎨 Generating high-CTR design",
            "✨ Applying AI magic"
          ].map((step, index) => (
            <motion.div
              key={step}
              className={`flex items-center space-x-3 text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + index * 0.3 }}
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2 + index * 0.3 + 0.2 }}
              />
              <span>{step}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}