'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Crown, Zap, RefreshCw, Sparkles } from 'lucide-react';

interface UserCredits {
  userId: string;
  email: string;
  thumbnailsRemaining: number;
  regeneratesRemaining: number;
  isAdmin: boolean;
  hasUsedFreePreview: boolean;
  lastUpdated: Date;
}

export function UserCredits() {
  const { user } = useUser();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user-credits');
      const data = await response.json();
      
      if (data.success) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const useCredit = async (action: 'thumbnail' | 'regenerate') => {
    try {
      const response = await fetch('/api/use-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setCredits(data.credits);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error using credit:', error);
      return { success: false, message: 'Failed to use credit' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  return (
    <motion.div
      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {credits.isAdmin ? (
            <Crown className="w-5 h-5 text-yellow-500" />
          ) : (
            <Zap className="w-5 h-5 text-orange-500" />
          )}
          <h3 className="text-lg font-bold text-slate-900">
            {credits.isAdmin ? 'Admin Access' : 'Your Credits'}
          </h3>
        </div>
        {credits.isAdmin && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Unlimited
          </span>
        )}
      </div>

      {/* Credits Display */}
      <div className="grid grid-cols-3 gap-4">
        {/* Free Preview */}
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-slate-600">Free Preview</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {credits.isAdmin ? '∞' : credits.hasUsedFreePreview ? '0' : '1'}
          </div>
          <div className="text-xs text-slate-500">
            {credits.isAdmin ? 'Unlimited' : credits.hasUsedFreePreview ? 'used' : 'available'}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-600">Thumbnails</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {credits.isAdmin ? '∞' : credits.thumbnailsRemaining}
          </div>
          <div className="text-xs text-slate-500">
            {credits.isAdmin ? 'Unlimited' : 'remaining'}
          </div>
        </div>

        {/* Regenerates */}
        <div className="bg-white rounded-xl p-4 border border-orange-100">
          <div className="flex items-center space-x-2 mb-2">
            <RefreshCw className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-600">Regenerates</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {credits.isAdmin ? '∞' : credits.regeneratesRemaining}
          </div>
          <div className="text-xs text-slate-500">
            {credits.isAdmin ? 'Unlimited' : 'remaining'}
          </div>
        </div>
      </div>

      {/* Low Credits Warning */}
      {!credits.isAdmin && (credits.thumbnailsRemaining <= 1 || credits.regeneratesRemaining <= 1) && (
        <motion.div
          className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-orange-800">
            ⚠️ Running low on credits! 
            {credits.thumbnailsRemaining <= 1 && ` Only ${credits.thumbnailsRemaining} thumbnail left.`}
            {credits.regeneratesRemaining <= 1 && ` Only ${credits.regeneratesRemaining} regenerate left.`}
          </p>
        </motion.div>
      )}

      {/* Free Preview Used Warning */}
      {!credits.isAdmin && credits.hasUsedFreePreview && credits.thumbnailsRemaining === 0 && (
        <motion.div
          className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-blue-800">
            🎯 You've used your free preview! Purchase credits to download, regenerate, or create more thumbnails.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}


