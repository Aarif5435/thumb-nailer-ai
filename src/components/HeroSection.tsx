'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, TrendingUp, Zap, Users, Award, ArrowRight, Moon, Sun, Lock, Clock, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ParticlesBackground } from './ParticlesBackground';
import { useState, useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HeroSectionProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export function HeroSection({ onGetStarted, isAuthenticated = false }: HeroSectionProps) {
  const { isDark, toggleTheme } = useTheme();
  
  // State for showcase carousel and preview
  const [currentShowcaseSlide, setCurrentShowcaseSlide] = useState(0);
  const [showShowcasePreview, setShowShowcasePreview] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<typeof showcaseThumbnails[0] | null>(null);

  // Autoplay plugin for carousel
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

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

  // Showcase thumbnails using all available generated images from public/generated
  const showcaseThumbnails = [
    {
      id: 'gaming-setup',
      title: 'Ultimate Gaming Setup',
      description: 'High-energy gaming content with vibrant colors',
      image: '/generated/thumbnail_84e5b411-1042-4482-a334-2508db6c3d14.png',
      views: '3.5M',
      ctr: '16.2%'
    },
    {
      id: 'cooking-recipe',
      title: 'Amazing Cooking Recipe',
      description: 'Delicious food content with warm, inviting colors',
      image: '/generated/thumbnail_09e03894-ce0a-4c67-b1bd-384f2fe0c7e1.png',
      views: '1.9M',
      ctr: '13.7%'
    },
    {
      id: 'travel-vlog',
      title: 'Travel Adventures',
      description: 'Exciting travel content with stunning landscapes',
      image: '/generated/thumbnail_6a79e17e-fe85-46e8-bee2-5f10c5ca52fc.png',
      views: '2.8M',
      ctr: '17.1%'
    },
    {
      id: 'fitness-motivation',
      title: 'Fitness Transformation',
      description: 'Motivational fitness content with high energy',
      image: '/generated/thumbnail_47f7b1ac-9a52-4cdb-aee3-623a1d6c443b.png',
      views: '2.3M',
      ctr: '15.4%'
    },
    {
      id: 'lifestyle-tips',
      title: 'Lifestyle Transformation',
      description: 'Modern lifestyle content with clean aesthetics',
      image: '/generated/thumbnail_5d24e3a8-a4b2-4d90-b147-fa380400dba6.png',
      views: '1.8M',
      ctr: '13.2%'
    },
    {
      id: 'product-review',
      title: 'Honest Product Review',
      description: 'Trustworthy product review with detailed analysis',
      image: '/generated/thumbnail_7b00727d-ce6e-46f6-aeea-841f40bb24bc.png',
      views: '2.7M',
      ctr: '16.3%'
    },
    {
      id: 'beauty-tutorial',
      title: 'Beauty Transformation',
      description: 'Glamorous beauty content with elegant styling',
      image: '/generated/thumbnail_078f9aef-4e52-46b6-84e3-e950c08f8319.png',
      views: '2.1M',
      ctr: '15.7%'
    },
    {
      id: 'automotive-review',
      title: 'Car Review & Analysis',
      description: 'Professional automotive content with sleek design',
      image: '/generated/thumbnail_70b7cd39-79aa-48e7-85fe-9af032063365.png',
      views: '1.9M',
      ctr: '13.8%'
    },
    {
      id: 'gaming-stream',
      title: 'Epic Gaming Stream',
      description: 'Intense gaming content with dramatic lighting',
      image: '/generated/thumbnail_7d41b841-582a-43af-bfcd-ec51257a241b.png',
      views: '4.1M',
      ctr: '19.2%'
    },
    {
      id: 'business-strategy',
      title: 'Business Growth Strategy',
      description: 'Strategic business insights with professional layout',
      image: '/generated/thumbnail_1bf0b351-34f5-461b-a6ed-feb98a7814f2.png',
      views: '1.6M',
      ctr: '12.5%'
    },
    {
      id: 'art-tutorial',
      title: 'Digital Art Masterclass',
      description: 'Creative art techniques with vibrant colors',
      image: '/generated/thumbnail_24fa2dee-697a-4ab2-8fd4-d815a8407f64.png',
      views: '2.8M',
      ctr: '16.4%'
    },
    {
      id: 'fashion-trends',
      title: 'Latest Fashion Trends',
      description: 'Trendy fashion content with stylish aesthetics',
      image: '/generated/thumbnail_9ca9bac4-8e0e-4c99-86a8-6bc3ac806948.png',
      views: '2.1M',
      ctr: '15.1%'
    },
    {
      id: 'investment-tips',
      title: 'Smart Investment Guide',
      description: 'Financial advice with professional presentation',
      image: '/generated/thumbnail_48e2475b-b0a6-4cce-9a90-93e2c9b5a84a.png',
      views: '1.8M',
      ctr: '13.4%'
    },
    {
      id: 'gaming-tournament',
      title: 'Epic Gaming Tournament',
      description: 'Competitive gaming with high-stakes atmosphere',
      image: '/generated/thumbnail_6b7feff2-6144-4c23-8a68-dc42ac9f995c.png',
      views: '4.3M',
      ctr: '19.5%'
    },
    {
      id: 'cooking-basics',
      title: 'Cooking for Beginners',
      description: 'Simple cooking techniques for new chefs',
      image: '/generated/thumbnail_57cd9e3b-d491-4edc-9678-4518e7ee5b1e.png',
      views: '2.2M',
      ctr: '14.7%'
    }
  ];





  const openShowcasePreview = (thumbnail: typeof showcaseThumbnails[0]) => {
    setSelectedThumbnail(thumbnail);
    setShowShowcasePreview(true);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden overflow-x-hidden transition-colors duration-500 ${
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

            {/* Showcase Section - What Least You Can Expect */}
            <motion.div
              className="mt-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              <h3 className={`text-3xl font-bold mb-8 text-center ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                What Least You Can Expect ✨
              </h3>
              
              {/* Showcase Section - What Least You Can Expect */}
              <div className="relative max-w-6xl mx-auto">
                {/* Shadcn Carousel */}
                <Carousel
                  plugins={[autoplayPlugin.current]}
                  className="w-full"
                  onMouseEnter={autoplayPlugin.current.stop}
                  onMouseLeave={autoplayPlugin.current.reset}
                >
                  <CarouselContent>
                    {showcaseThumbnails.map((thumbnail, index) => (
                      <CarouselItem key={thumbnail.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-2">
                          <div 
                            className="relative aspect-video overflow-hidden rounded-xl bg-slate-800 group cursor-pointer"
                            onClick={() => openShowcasePreview(thumbnail)}
                          >
                            <img
                              src={thumbnail.image}
                              alt={thumbnail.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            
                            {/* Content - Only visible on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <h4 className="text-lg font-bold mb-1 line-clamp-1">
                                {thumbnail.title}
                              </h4>
                              <p className="text-sm text-slate-200 mb-2 line-clamp-2">
                                {thumbnail.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                                  {thumbnail.views}
                                </span>
                                <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                                  {thumbnail.ctr}
                                </span>
                              </div>
                            </div>
                            
                            {/* Preview Icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openShowcasePreview(thumbnail);
                              }}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                              title="Preview Full Screen"
                            >
                              <Maximize2 size={16} />
                            </button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="bg-black/70 text-white border-0" />
                  <CarouselNext className="bg-black/70 text-white border-0" />
                </Carousel>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Full Screen Showcase Preview Modal */}
      <AnimatePresence>
        {showShowcasePreview && selectedThumbnail && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setShowShowcasePreview(false);
              setSelectedThumbnail(null);
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={() => {
                setShowShowcasePreview(false);
                setSelectedThumbnail(null);
              }}
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
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedThumbnail?.image || ''}
                alt={selectedThumbnail?.title || ''}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
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
                  <h3 className="font-semibold text-lg">{selectedThumbnail?.title || ''}</h3>
                  <p className="text-sm text-gray-300">{selectedThumbnail?.description || ''}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">{selectedThumbnail?.ctr || ''}</div>
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
