'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, TrendingUp, Zap, Users, Award, ArrowRight, Moon, Sun, Lock, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ParticlesBackground } from './ParticlesBackground';

interface HeroSectionProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export function HeroSection({ onGetStarted, isAuthenticated = false }: HeroSectionProps) {
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
        ? 'bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100'
    }`}>
      {/* Particles Background */}
      <ParticlesBackground isDark={isDark} />
      
      {/* Subtle Glow Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-orange-500/5' : 'bg-orange-400/3'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-orange-600/5' : 'bg-orange-500/3'}`} />
      </div>

      {/* DEMO VIDEO SECTION - AT THE TOP */}
     

      {/* Main Hero Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">
            
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              <motion.div
                className={`inline-flex items-center px-4 py-2 rounded-full ${
                  isDark 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                } shadow-lg backdrop-blur-sm`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">
                  AI-Powered
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className={isDark ? 'text-white' : 'text-slate-900'}>
                  Create Viral
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  YouTube Thumbnails
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Transform your content with AI that generates 
                <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> click-worthy thumbnails</span> in seconds. 
                Join 100,000+ creators boosting their views.
              </motion.p>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {[
                  { icon: TrendingUp, label: '300% CTR Boost', value: '300%' },
                  { icon: Zap, label: '30 Second Generation', value: '30s' },
                  { icon: Users, label: 'Active Creators', value: '100K+' },
                  { icon: Award, label: 'Success Rate', value: '98%' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={`text-center rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                      isDark 
                        ? 'bg-slate-800/80 text-white border border-slate-700/50' 
                        : 'bg-white/90 text-slate-900 border border-slate-200/50'
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Main CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:from-orange-600 hover:to-red-600"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    {isAuthenticated ? 'Create My First Thumbnail' : 'Get Started'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.button>
                
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  No credit card required • Generate unlimited thumbnails
                </p>

                {/* Login Prompt for Non-Authenticated Users */}
                
              </motion.div>
            </div>

            {/* Example Gallery */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <h3 className={`text-2xl font-bold mb-8 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Trusted by creators worldwide ✨
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {exampleThumbnails.map((example, index) => (
                  <motion.div
                    key={index}
                    className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-slate-800/60 border-slate-600/50' 
                        : 'bg-white/80 border-slate-200/50'
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.2, duration: 0.6 }}
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
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </motion.div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        16:9 HD
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className={`font-bold text-lg mb-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {example.title}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${
                          isDark ? 'text-white/70' : 'text-slate-600'
                        }`}>
                          {example.views} views
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          {example.ctr} CTR
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

    </div>
  );
}
