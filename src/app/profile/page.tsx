'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Crown,
  Image,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  Trash2,
  Plus,
  CreditCard,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  BarChart3,
  ArrowLeft,
  RotateCcw as Regenerate,
  Play,
  Star,
  TrendingUp
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ConfirmationModal';
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

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [history, setHistory] = useState<ThumbnailHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    loading?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user credits with admin check
      const creditsResponse = await fetch('/api/test-admin');
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        console.log('Profile - fetched credits data:', creditsData);
        setCredits(creditsData.credits);
      }

      // Fetch thumbnail history
      const historyResponse = await fetch('/api/thumbnail-history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteThumbnail = async (id: string) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Thumbnail',
      message: 'Are you sure you want to delete this thumbnail? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        setModal({ ...modal, loading: true });
        try {
          const response = await fetch(`/api/thumbnail-history/${id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setHistory(history.filter(item => item.id !== id));
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Success',
              message: 'Thumbnail deleted successfully!',
              confirmText: 'OK'
            });
          } else {
            setModal({
              isOpen: true,
              type: 'error',
              title: 'Error',
              message: 'Failed to delete thumbnail. Please try again.',
              confirmText: 'OK'
            });
          }
        } catch (error) {
          console.error('Error deleting thumbnail:', error);
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete thumbnail. Please try again.',
            confirmText: 'OK'
          });
        }
      }
    });
  };

  const navigateToCreateThumbnail = () => {
    router.push('/?step=topic');
  };

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
      alert('Failed to download thumbnail');
    }
  };

  const regenerateThumbnail = async (thumbnailId: string, topic: string) => {
    try {
      // Check if user has regenerate credits
      if (!credits?.isAdmin && (credits?.regeneratesRemaining || 0) <= 0) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Insufficient Credits',
          message: 'You don\'t have enough regenerate credits. Please purchase more credits to continue.',
          confirmText: 'Buy Credits',
          onConfirm: () => {
            setModal({ ...modal, isOpen: false });
            // TODO: Open payment modal
          }
        });
        return;
      }

      // Create regenerate session in database
      const response = await fetch('/api/regenerate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to start regeneration process. Please try again.',
          confirmText: 'OK'
        });
        return;
      }

      // Navigate to home page - the main app will detect the regenerate session
      router.push('/');
    } catch (error) {
      console.error('Error regenerating thumbnail:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to regenerate thumbnail. Please try again.',
        confirmText: 'OK'
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
console.log("history",history)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchUserData}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh Data"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              {credits?.isAdmin && (
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credits Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                Credits & Plan
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Thumbnails</span>
                      <p className="text-xs text-gray-500">Generate new thumbnails</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-orange-600">
                      {credits?.isAdmin ? '∞' : credits?.thumbnailsRemaining || 0}
                    </span>
                    {credits?.isAdmin && (
                      <p className="text-xs text-orange-500 font-medium">Unlimited</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Regenerates</span>
                      <p className="text-xs text-gray-500">Improve existing thumbnails</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-blue-600">
                      {credits?.isAdmin ? '∞' : credits?.regeneratesRemaining || 0}
                    </span>
                    {credits?.isAdmin && (
                      <p className="text-xs text-blue-500 font-medium">Unlimited</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Free Preview</span>
                      <p className="text-xs text-gray-500">Try before you buy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-semibold ${credits?.hasUsedFreePreview ? 'text-red-600' : 'text-green-600'}`}>
                      {credits?.hasUsedFreePreview ? 'Used' : 'Available'}
                    </span>
                    {!credits?.hasUsedFreePreview && (
                      <p className="text-xs text-green-500 font-medium">1 available</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-4 border-t">
                  <p>Member since {credits?.createdAt ? new Date(credits.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p>Last updated {credits?.lastUpdated ? new Date(credits.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <motion.button
                      onClick={navigateToCreateThumbnail}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Create New Thumbnail</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    
                    {credits?.isAdmin && (
                      <motion.button
                        onClick={() => router.push('/admin')}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Admin Panel</span>
                        <Crown className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-orange-500" />
                  Thumbnail History
                </h2>
                <span className="text-sm text-gray-500">{history.length} thumbnails</span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Image className="w-12 h-12 text-orange-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No thumbnails yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Start creating thumbnails to see them here. Your first thumbnail will appear in this history section.</p>
                  <motion.button 
                    onClick={navigateToCreateThumbnail}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Create First Thumbnail</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
                            ) : (
                <div className="space-y-6">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group"
                    >
                      <div className=" gap-6">
                        {/* Thumbnail Image */}
                        <div className="w-full flex-shrink-0 pb-4">
                          {item.imageUrl ? (
                            <div className="relative group/image">
                              <img
                                src={item.imageUrl}
                                alt={item.topic}
                                className="w-full h-48 lg:h-56 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-lg bg-gray-100"
                                onClick={() => setSelectedImage(item.imageUrl!)}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            
                            </div>
                          ) : (
                            <div className="w-full h-48 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                              <div className="text-center">
                                <Image className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No image available</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{item.topic}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4" />
                                  <span>Thumbnail #{index + 1}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CTR Score */}
                          {item.ctrScore && (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-800">CTR Performance</p>
                                  <p className="text-xs text-green-600">Click-through rate score</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{item.ctrScore.toFixed(1)}%</p>
                                <p className="text-xs text-green-500">Excellent</p>
                              </div>
                            </div>
                          )}

                          {/* Analysis */}
                          {/* {item.ctrAnalysis && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4" />
                                <span>Performance Analysis</span>
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.ctrAnalysis.length > 200
                                  ? `${item.ctrAnalysis.substring(0, 200)}...`
                                  : item.ctrAnalysis
                                }
                              </p>
                            </div>
                          )} */}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <button
                              onClick={() => downloadThumbnail(item.imageUrl!, item.topic)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => setSelectedImage(item.imageUrl!)}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => regenerateThumbnail(item.id, item.topic)}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <Regenerate className="w-4 h-4" />
                              <span>Regenerate</span>
                            </button>
                            <button
                              onClick={() => deleteThumbnail(item.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center space-x-2 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Thumbnail preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm || (() => {})}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        loading={modal.loading}
      />
    </div>
  );
}
