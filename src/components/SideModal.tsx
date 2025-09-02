'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Eye, Calendar, User, Crown, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Toast } from './Toast';

interface UserCredits {
  id: string;
  userId: string;
  email: string;
  thumbnailsRemaining: number;
  regeneratesRemaining: number;
  isAdmin: boolean;
  hasUsedFreePreview: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ThumbnailHistory {
  id: string;
  userId: string;
  topic: string;
  prompt: string;
  imageUrl?: string;
  ctrScore?: number;
  ctrAnalysis?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserCredits;
  thumbnails: ThumbnailHistory[];
  onAddCredits: (userId: string, thumbnails: number, regenerates: number) => void;
  onBlockUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  loading?: boolean;
}

export function SideModal({
  isOpen,
  onClose,
  user,
  thumbnails,
  onAddCredits,
  onBlockUser,
  onDeleteUser,
  loading = false
}: SideModalProps) {
  const [creditsToAdd, setCreditsToAdd] = useState({ thumbnails: 0, regenerates: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    thumbnails: false,
    regenerates: false,
    block: false,
    delete: false
  });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: ''
  });

  const downloadThumbnail = async (imageUrl: string, topic: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumbnail-${topic.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download thumbnail. Please try again.'
      });
    }
  };

  const handleAddCredits = async (type: 'thumbnails' | 'regenerates', amount: number) => {
    if (amount === 0) return;

    setLoadingStates(prev => ({ ...prev, [type]: true }));
    
    try {
      if (type === 'thumbnails') {
        await onAddCredits(user.userId, amount, 0);
      } else {
        await onAddCredits(user.userId, 0, amount);
      }
      
      const action = amount > 0 ? 'added' : 'reduced';
      const absAmount = Math.abs(amount);
      
      setToast({
        isOpen: true,
        type: 'success',
        title: 'Credits Updated Successfully!',
        message: `${absAmount} ${type} credits ${action} for ${user.email}`
      });
      
      // Reset the input
      setCreditsToAdd(prev => ({ ...prev, [type]: 0 }));
    } catch (error) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Update Credits',
        message: 'Please try again or contact support.'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleBlockUser = async () => {
    setLoadingStates(prev => ({ ...prev, block: true }));
    
    try {
      await onBlockUser(user.userId);
      setToast({
        isOpen: true,
        type: 'success',
        title: 'User Blocked',
        message: `${user.email} has been blocked successfully.`
      });
    } catch (error) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Block User',
        message: 'Please try again or contact support.'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, block: false }));
    }
  };

  const handleDeleteUser = async () => {
    setLoadingStates(prev => ({ ...prev, delete: true }));
    
    try {
      await onDeleteUser(user.userId);
      setToast({
        isOpen: true,
        type: 'success',
        title: 'User Deleted',
        message: `${user.email} has been deleted successfully.`
      });
    } catch (error) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Delete User',
        message: 'Please try again or contact support.'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="side-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-opacity-75"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ 
            type: 'tween',
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.email}</h2>
                  <p className="text-sm text-gray-500">ID: {user.userId.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user.isAdmin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Crown className="w-4 h-4 mr-1" />
                    Admin
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Member Since:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Active:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Free Preview:</span>
                  <span className={`text-sm ${user.hasUsedFreePreview ? 'text-red-600' : 'text-green-600'}`}>
                    {user.hasUsedFreePreview ? 'Used' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Credits Management */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits Management</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Thumbnails</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {user.isAdmin ? '∞' : user.thumbnailsRemaining}
                    </span>
                  </div>
                  {!user.isAdmin && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={creditsToAdd.thumbnails}
                          onChange={(e) => setCreditsToAdd(prev => ({ ...prev, thumbnails: parseInt(e.target.value) || 0 }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                        <button
                          onClick={() => handleAddCredits('thumbnails', creditsToAdd.thumbnails)}
                          disabled={loadingStates.thumbnails || creditsToAdd.thumbnails === 0}
                          className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {loadingStates.thumbnails && (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>Update</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter positive number to add, negative to reduce
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Regenerates</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {user.isAdmin ? '∞' : user.regeneratesRemaining}
                    </span>
                  </div>
                  {!user.isAdmin && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={creditsToAdd.regenerates}
                          onChange={(e) => setCreditsToAdd(prev => ({ ...prev, regenerates: parseInt(e.target.value) || 0 }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                        <button
                          onClick={() => handleAddCredits('regenerates', creditsToAdd.regenerates)}
                          disabled={loadingStates.regenerates || creditsToAdd.regenerates === 0}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {loadingStates.regenerates && (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          <span>Update</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter positive number to add, negative to reduce
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail History */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thumbnail History
                </h3>
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                  {thumbnails.length} thumbnails
                </span>
              </div>

              {thumbnails.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No thumbnails yet</h4>
                  <p className="text-gray-500">This user hasn't created any thumbnails yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {thumbnails.map((thumbnail, index) => (
                    <div key={thumbnail.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200 group">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail Image */}
                        <div className="flex-shrink-0">
                          {thumbnail.imageUrl ? (
                            <div className="relative">
                              <img
                                src={thumbnail.imageUrl}
                                alt={thumbnail.topic}
                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                onClick={() => setSelectedImage(thumbnail.imageUrl!)}
                              />
                             
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                              {thumbnail.topic}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => downloadThumbnail(thumbnail.imageUrl!, thumbnail.topic)}
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedImage(thumbnail.imageUrl!)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(thumbnail.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400">#{index + 1}</span>
                            </div>
                            {thumbnail.ctrScore && (
                              <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium">{thumbnail.ctrScore.toFixed(1)}% CTR</span>
                              </div>
                            )}
                          </div>

                          {/* Analysis Preview */}
                          {thumbnail.ctrAnalysis && (
                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <span className="font-medium text-gray-700">Analysis:</span>
                              <p className="mt-1 line-clamp-2">
                                {thumbnail.ctrAnalysis.length > 80
                                  ? `${thumbnail.ctrAnalysis.substring(0, 80)}...`
                                  : thumbnail.ctrAnalysis
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {!user.isAdmin && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleBlockUser}
                    disabled={loadingStates.block}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loadingStates.block && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Block User</span>
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={loadingStates.delete}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loadingStates.delete && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Delete User</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-60 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Thumbnail preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </AnimatePresence>
  );
}
