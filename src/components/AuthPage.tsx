'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Sparkles, Shield, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  // Hardcoded credentials
  const VALID_EMAIL = 'aarif.mohammad0909@gmail.com';
  const VALID_PASSWORD = 'Aarif@0909';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // Store auth state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      onAuthSuccess();
    } else {
      setError('Invalid credentials. This is an invite-only platform.');
    }

    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 py-12 transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100'
    }`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`}>
          <div className="grid grid-cols-20 gap-1 h-full w-full p-2">
            {Array.from({ length: 200 }).map((_, i) => (
              <motion.div
                key={i}
                className={`rounded-sm ${isDark ? 'bg-orange-400/10' : 'bg-orange-500/5'}`}
                animate={{ 
                  opacity: [0.1, 0.4, 0.1],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative w-full max-w-md z-10`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Welcome to Thumb-nailer
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={`text-lg ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Professional Thumbnail AI
          </motion.p>
        </div>

        {/* Invite Only Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            isDark 
              ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300' 
              : 'bg-orange-100 border border-orange-200 text-orange-700'
          }`}>
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Invite Only</span>
          </div>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className={`rounded-3xl p-8 shadow-2xl backdrop-blur-sm ${
            isDark 
              ? 'bg-slate-800/80 border border-slate-700/50' 
              : 'bg-white/90 border border-slate-200/50'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:border-orange-500'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-2xl border-2 transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:border-orange-500'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
              } transform hover:scale-105 active:scale-95`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Access Platform
                </div>
              )}
            </motion.button>
          </form>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-6 pt-6 border-t border-slate-200/50"
          >
            <div className="flex items-center justify-center text-sm text-slate-500">
              <Users className="w-4 h-4 mr-2" />
              Exclusive access for invited creators
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
