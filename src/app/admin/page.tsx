'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Plus,
  Minus,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Image as ImageIcon,
  CreditCard,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { SideModal } from '@/components/SideModal';
import { Toast } from '@/components/Toast';

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

interface AdminStats {
  totalUsers: number;
  totalThumbnails: number;
  activeUsers: number;
  blockedUsers: number;
  totalCreditsUsed: number;
}

export default function AdminPanel() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<UserCredits[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null);
  const [userThumbnails, setUserThumbnails] = useState<ThumbnailHistory[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'createdAt' | 'lastUpdated'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'admin' | 'regular' | 'blocked'>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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

  // Check if current user is admin
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/test-admin');
      if (response.ok) {
        const data = await response.json();
        setIsCurrentUserAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          router.push('/profile');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/profile');
    }
  };

  const fetchAdminData = async () => {
    if (!isCurrentUserAdmin) return;
    
    setLoading(true);
    try {
      // Fetch all users
      const usersResponse = await fetch('/api/all-users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Fetch admin stats
      const statsResponse = await fetch('/api/admin-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserThumbnails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/user-thumbnails?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserThumbnails(data);
      }
    } catch (error) {
      console.error('Error fetching user thumbnails:', error);
    }
  };

  const handleUserClick = async (userData: UserCredits) => {
    setSelectedUser(userData);
    setShowUserModal(true);
    await fetchUserThumbnails(userData.userId);
  };

  const addCredits = async (userId: string, thumbnails: number, regenerates: number) => {
    try {
      console.log('Admin panel - attempting to add credits:', { userId, thumbnails, regenerates });
      
      const response = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, thumbnails, regenerates })
      });
      
      console.log('Admin panel - API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Add credits response:', result);
        // Refresh data
        await fetchAdminData();
        if (selectedUser && selectedUser.userId === userId) {
          // Fetch the updated user data from the users list
          const usersResponse = await fetch('/api/all-users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const updatedUser = usersData.find((u: UserCredits) => u.userId === userId);
            if (updatedUser) {
              setSelectedUser(updatedUser);
            }
          }
        }
        const userEmail = selectedUser?.email || 'user';
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Credits Updated Successfully!',
          message: `Credits updated for ${userEmail}`
        });
      } else {
        const errorData = await response.json();
        console.error('Add credits failed:', errorData);
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Failed to Update Credits',
          message: errorData.error || 'Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Update Credits',
        message: 'Please try again or contact support.'
      });
    }
  };

  const blockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        await fetchAdminData();
        setToast({
          isOpen: true,
          type: 'success',
          title: 'User Blocked Successfully!',
          message: 'User has been blocked and credits set to zero.'
        });
      } else {
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Failed to Block User',
          message: 'Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Block User',
        message: 'Please try again or contact support.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const unblockUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/unblock-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        await fetchAdminData();
        setToast({
          isOpen: true,
          type: 'success',
          title: 'User Unblocked Successfully!',
          message: 'User has been unblocked and can now use the platform.'
        });
      } else {
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Failed to Unblock User',
          message: 'Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Unblock User',
        message: 'Please try again or contact support.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        await fetchAdminData();
        if (selectedUser && selectedUser.userId === userId) {
          setShowUserModal(false);
          setSelectedUser(null);
        }
        setToast({
          isOpen: true,
          type: 'success',
          title: 'User Deleted Successfully!',
          message: 'User and all associated data have been permanently removed.'
        });
      } else {
        setToast({
          isOpen: true,
          type: 'error',
          title: 'Failed to Delete User',
          message: 'Please try again or contact support.'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Failed to Delete User',
        message: 'Please try again or contact support.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'admin' && user.isAdmin) ||
        (filterStatus === 'regular' && !user.isAdmin) ||
        (filterStatus === 'blocked' && user.isAdmin === false && user.thumbnailsRemaining === 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'lastUpdated') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isCurrentUserAdmin) {
      fetchAdminData();
    }
  }, [isCurrentUserAdmin]);

  if (!isCurrentUserAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Back to Profile"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage users, credits, and system access</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin Access
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl shadow-lg p-6 border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl shadow-lg p-6 border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Thumbnails</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalThumbnails}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl shadow-lg p-6 border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl shadow-lg p-6 border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.blockedUsers}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins</option>
                <option value="regular">Regular Users</option>
                <option value="blocked">Blocked Users</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="email">Sort by Email</option>
                <option value="createdAt">Sort by Join Date</option>
                <option value="lastUpdated">Sort by Last Active</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData, index) => (
                  <motion.tr
                    key={userData.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserClick(userData)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                                     <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.email}</div>
                          <div className="text-sm text-gray-500">ID: {userData.userId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {userData.isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <ImageIcon className="w-4 h-4 text-orange-500 mr-1" />
                            {userData.isAdmin ? '∞' : userData.thumbnailsRemaining}
                          </span>
                          <span className="flex items-center">
                            <RefreshCw className="w-4 h-4 text-blue-500 mr-1" />
                            {userData.isAdmin ? '∞' : userData.regeneratesRemaining}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(userData);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add credits modal
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Add Credits"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {!userData.isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              blockUser(userData.userId);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Block User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

                    {/* Side Modal */}
              <SideModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                user={selectedUser!}
                thumbnails={userThumbnails}
                onAddCredits={addCredits}
                onBlockUser={blockUser}
                onDeleteUser={deleteUser}
                loading={actionLoading}
              />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
}
