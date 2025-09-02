'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Crown, User, Shield } from 'lucide-react';

export function AdminDebug() {
  const { user } = useUser();
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/test-admin');
      const data = await response.json();
      setAdminStatus(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Clear all user data
      await fetch('/api/clear-all-users', { method: 'POST' });
      await checkAdminStatus(); // Refresh status
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewAllUsers = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/all-users');
      if (response.ok) {
        const users = await response.json();
        console.log('All users:', users);
        alert(`Total users: ${users.length}\nCheck console for details`);
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      alert('Error fetching users');
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg z-50 max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-800">Admin Debug</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Email: {user.emailAddresses[0]?.emailAddress}</span>
        </div>
        
        {loading ? (
          <div className="text-blue-600">Checking admin status...</div>
        ) : adminStatus ? (
          <div className="space-y-1">
            <div className={`flex items-center space-x-2 ${adminStatus.isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
              {adminStatus.isAdmin ? (
                <Crown className="w-4 h-4 text-yellow-500" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>{adminStatus.isAdmin ? 'Admin Access' : 'Regular User'}</span>
            </div>
            
            {adminStatus.credits && (
              <div className="text-xs text-gray-500">
                Credits: {adminStatus.credits.thumbnailsRemaining} thumbnails, {adminStatus.credits.regeneratesRemaining} regenerates
                <br />
                Free Preview: {adminStatus.credits.hasUsedFreePreview ? 'Used' : 'Available'}
              </div>
            )}
          </div>
        ) : (
          <div className="text-red-600">Failed to check admin status</div>
        )}
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={checkAdminStatus}
          className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={viewAllUsers}
          className="flex-1 px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
        >
          View All
        </button>
        <button
          onClick={clearAllData}
          className="flex-1 px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </motion.div>
  );
}
