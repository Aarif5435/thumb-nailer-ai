'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, TrendingUp, Zap, Users, Award, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { isDark, toggleTheme } = useTheme();

  const exampleThumbnails = [
    {
      title: "Best JavaScript Tutorial",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop",
      views: "2.3M",
      ctr: "12.4%"
    },
    {
      title: "Amazing Cooking Recipe",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=225&fit=crop",
      views: "1.8M",
      ctr: "15.2%"
    },
    {
      title: "Gaming Highlights",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop",
      views: "3.1M",
      ctr: "18.7%"
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black' 
        : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl ${
            isDark ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : 'bg-gradient-to-r from-red-400/20 to-orange-400/20'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl ${
            isDark ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-yellow-400/20 to-red-400/20'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header with Dark Mode Toggle */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <motion.div
                className="p-3 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                    "0 0 30px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(239, 68, 68, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Play className="w-7 h-7 text-white" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Thumb-nailer
              </h1>
              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Professional Thumbnail AI
              </p>
            </div>
          </motion.div>

          <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-2xl transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            } backdrop-blur-sm shadow-lg hover:shadow-xl`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 px-6 pt-16 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-4 h-4 text-red-500 mr-2" />
                <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  AI-Powered Thumbnail Generator
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Create Viral
                </span>
                <br />
                <span className={`${isDark ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-red-400' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600'} bg-clip-text text-transparent`}>
                  YouTube Thumbnails
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className={`text-xl md:text-2xl max-w-2xl leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                🚀 <span className="font-bold text-red-500">Boost your CTR by 300%</span> with AI-powered thumbnails that 
                <span className="font-bold text-orange-500"> stop the scroll</span> and 
                <span className="font-bold text-purple-500"> force clicks</span>. 
                Professional results in 30 seconds!
              </motion.p>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {[
                  { icon: TrendingUp, label: '300% CTR Boost', color: 'from-green-500 to-emerald-600' },
                  { icon: Zap, label: '30 Second Magic', color: 'from-yellow-500 to-orange-600' },
                  { icon: Users, label: '1M+ Creators', color: 'from-purple-500 to-pink-600' },
                  { icon: Award, label: 'AI Powered', color: 'from-blue-500 to-cyan-600' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl ${
                      isDark ? 'bg-white/5 backdrop-blur-sm border border-white/10' : 'bg-white/80 backdrop-blur-sm border border-white/50'
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-xl`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <motion.button
                  onClick={onGetStarted}
                  className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl overflow-hidden"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <span className="relative flex items-center">
                    Get Started - It's Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
              </motion.div>
            </div>

            {/* Right Column - Example Thumbnails */}
            <div className="space-y-8">
              <motion.h3
                className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Created with Thumb-nailer ✨
              </motion.h3>

              <div className="grid gap-6">
                {exampleThumbnails.map((example, index) => (
                  <motion.div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl ${
                      isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/80 border border-white/50'
                    } backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.2, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <img
                        src={example.image}
                        alt={example.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Play Button Overlay */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </motion.div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        16:9 HD
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {example.title}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {example.views} views
                        </span>
                        <span className="text-sm font-bold text-green-500">
                          {example.ctr} CTR
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
