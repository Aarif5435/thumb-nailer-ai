'use client';

import { motion } from 'framer-motion';
import { Youtube, Sparkles, Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  currentPage: 'home' | 'topic' | 'image' | 'questions' | 'result';
  onReset: () => void;
}

export function Header({ currentPage, onReset }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const steps = [
    { id: 'topic', name: 'Topic', completed: ['image', 'questions', 'result'].includes(currentPage) },
    { id: 'image', name: 'Image', completed: ['questions', 'result'].includes(currentPage) },
    { id: 'questions', name: 'Questions', completed: ['result'].includes(currentPage) },
    { id: 'result', name: 'Result', completed: false },
  ];

  const handleLogoClick = () => {
    if (currentPage !== 'home') {
      onReset();
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isDark 
          ? 'bg-slate-900/80 border-slate-700/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <motion.div
                className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(249, 115, 22, 0.3)",
                    "0 0 30px rgba(239, 68, 68, 0.5)",
                    "0 0 20px rgba(249, 115, 22, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Youtube className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Thumb-nailer
              </h1>
              <p className="text-xs text-gray-600 font-medium">Professional Thumbnail AI</p>
            </div>
          </motion.button>

          {/* Progress Steps - Desktop - Only show from topic step onwards */}
          {currentPage !== 'home' && (
            <div className="hidden md:flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                    step.id === currentPage
                      ? 'bg-white/20 text-orange-600'
                      : step.completed
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step.id === currentPage
                        ? 'bg-blue-500 scale-pulse'
                        : step.completed
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                      }`}
                  />
                  <span className="text-sm font-medium">{step.name}</span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              } backdrop-blur-sm shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* User Menu (Only show when authenticated) */}
            {typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true' && (
              <>
                {/* User Email (Compact) */}
                <div className={`hidden md:flex items-center px-3 py-2 rounded-xl ${
                  isDark 
                    ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' 
                    : 'bg-white/80 text-slate-700 border border-slate-200/50'
                }`}>
                                  <span className="text-sm font-medium truncate max-w-32">
                  {typeof window !== 'undefined' && localStorage.getItem('userEmail')?.split('@')[0] || 'User'}
                </span>
                </div>

                {/* Logout Button */}
                <motion.button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('isAuthenticated');
                      localStorage.removeItem('userEmail');
                      window.location.reload();
                    }
                  }}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                  } shadow-lg hover:shadow-xl`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800 bg-white/80 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Progress Steps - Only show from topic step onwards */}
        {currentPage !== 'home' && (
          <motion.div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              mobileMenuOpen ? 'max-h-40 pb-4' : 'max-h-0'
            }`}
          >
          <div className="flex justify-between items-center pt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    step.id === currentPage
                      ? 'bg-blue-500 text-white scale-pulse'
                      : step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {index + 1}
                </motion.div>
                <span className="text-xs mt-1 text-gray-600">{step.name}</span>
                {index < steps.length - 1 && (
                  <div className="absolute top-4 w-full h-px bg-gray-300 -z-10" />
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile Menu Actions */}
          {typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true' && (
            <>
              {currentPage !== 'topic' && (
                <motion.button
                  onClick={onReset}
                  className="w-full mt-4 flex items-center justify-center px-4 py-2 text-gray-600 bg-white/80 rounded-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Over
                </motion.button>
              )}

              {/* Mobile Logout Button */}
              <motion.button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userEmail');
                    window.location.reload();
                  }
                }}
                className="w-full mt-4 flex items-center justify-center px-4 py-2 text-red-600 bg-red-100 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </motion.button>
            </>
          )}
        </motion.div>
        )}
      </div>
    </motion.header>
  );
}
