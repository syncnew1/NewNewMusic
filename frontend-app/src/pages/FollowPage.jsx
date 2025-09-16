import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import {
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  HeartIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import authService from '../services/authService';

const FollowPage = () => {
  const { currentUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState('following');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followingCount: 0, followersCount: 0 });

  useEffect(() => {
    if (currentUser) {
      fetchFollowData();
      fetchStats();
    }
  }, [currentUser]);

  const fetchFollowData = async () => {
    if (!currentUser?.user?.id) {
      console.warn('No current user ID available');
      return;
    }
    
    setLoading(true);
    try {
      const [followingRes, followersRes] = await Promise.all([
        fetch(`/api/users/${currentUser.user.id}/following`, {
          headers: authService.authHeader()
        }),
        fetch(`/api/users/${currentUser.user.id}/followers`, {
          headers: authService.authHeader()
        })
      ]);

      if (followingRes.ok) {
        const followingResult = await followingRes.json();
        if (followingResult.success && followingResult.data) {
          setFollowing(followingResult.data.following || []);
        }
      }

      if (followersRes.ok) {
        const followersResult = await followersRes.json();
        if (followersResult.success && followersResult.data) {
          setFollowers(followersResult.data.followers || []);
        }
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!currentUser?.user?.id) {
      console.warn('No current user ID available for stats');
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${currentUser.user.id}/stats`, {
        headers: authService.authHeader()
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setStats({ followingCount: 0, followersCount: 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const unfollowUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        headers: authService.authHeader()
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // 重新获取数据以确保同步
        fetchFollowData();
        fetchStats();
      } else {
        alert(result.message || '取消关注失败，请重试');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('网络错误，请检查连接后重试');
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: authService.authHeader()
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // 刷新数据
        fetchFollowData();
        fetchStats();
      } else {
        alert(result.message || '关注失败，请重试');
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert('网络错误，请检查连接后重试');
    }
  };

  const UserCard = ({ user, showUnfollowButton = false, showFollowButton = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.username}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{user.followingCount || 0} 关注</span>
              <span>{user.followersCount || 0} 粉丝</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {showUnfollowButton && (
            <button
              onClick={() => unfollowUser(user.id)}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              取消关注
            </button>
          )}
          {showFollowButton && (
            <button
              onClick={() => followUser(user.id)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              关注
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 text-secondary-text mx-auto mb-4" />
          <p className="text-secondary-text">请先登录以查看关注信息</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">关注管理</h1>
            <p className="text-gray-600 dark:text-gray-400">管理你的关注和粉丝</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.followingCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">关注</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.followersCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">粉丝</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('following')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'following'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                我的关注 ({following.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'followers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                我的粉丝 ({followers.length})
              </button>
            </nav>
          </div>
        </div>

      {/* User Lists */}
      <div className="space-y-4">
        {(activeTab === 'following' ? following : followers).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'following' ? (
                <HeartIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              ) : (
                <UsersIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'following' ? '还没有关注任何人' : '还没有粉丝'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              {activeTab === 'following' 
                ? '发现并关注你感兴趣的用户' 
                : '分享你的内容，吸引更多朋友关注'
              }
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
              {activeTab === 'following' ? '发现用户' : '完善资料'}
            </button>
          </div>
        ) : (
          (activeTab === 'following' ? following : followers).map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              showUnfollowButton={activeTab === 'following'}
              showFollowButton={activeTab === 'followers' && !following.some(f => f.id === user.id)}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default FollowPage;