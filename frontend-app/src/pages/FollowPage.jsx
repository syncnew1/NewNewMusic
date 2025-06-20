import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { UserIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
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
    if (!currentUser) {
      console.warn('No current user available for follow data');
      return;
    }
    
    try {
      const [followingRes, followersRes] = await Promise.all([
        fetch('/api/follow/my/following', {
          headers: authService.authHeader()
        }),
        fetch('/api/follow/my/followers', {
          headers: authService.authHeader()
        })
      ]);

      if (followingRes.ok) {
        const followingData = await followingRes.json();
        setFollowing(followingData);
      }

      if (followersRes.ok) {
        const followersData = await followersRes.json();
        setFollowers(followersData);
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
      const response = await fetch(`/api/users/${currentUser.user.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const unfollowUser = async (userId) => {
    try {
      const response = await fetch(`/api/follow/user/${userId}`, {
        method: 'DELETE',
        headers: authService.authHeader()
      });

      if (response.ok) {
        setFollowing(following.filter(user => user.id !== userId));
        fetchStats();
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`/api/follow/user/${userId}`, {
        method: 'POST',
        headers: authService.authHeader()
      });

      if (response.ok) {
        // 刷新数据
        fetchFollowData();
        fetchStats();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const UserCard = ({ user, showUnfollowButton = false, showFollowButton = false }) => (
    <div className="bg-card-bg rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-text">{user.username}</h3>
            <p className="text-sm text-secondary-text">{user.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {showUnfollowButton && (
            <button
              onClick={() => unfollowUser(user.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <UserMinusIcon className="w-4 h-4" />
              <span>取消关注</span>
            </button>
          )}
          {showFollowButton && (
            <button
              onClick={() => followUser(user.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>关注</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-4 text-sm text-secondary-text">
        <span>关注: {user.followingCount || 0}</span>
        <span>粉丝: {user.followersCount || 0}</span>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text mb-4">关注管理</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.followingCount}</div>
            <div className="text-sm text-secondary-text">关注</div>
          </div>
          <div className="bg-card-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.followersCount}</div>
            <div className="text-sm text-secondary-text">粉丝</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'following'
              ? 'bg-primary text-white'
              : 'bg-card-bg text-secondary-text hover:text-primary-text'
          }`}
        >
          我的关注 ({following.length})
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'followers'
              ? 'bg-primary text-white'
              : 'bg-card-bg text-secondary-text hover:text-primary-text'
          }`}
        >
          我的粉丝 ({followers.length})
        </button>
      </div>

      {/* User Lists */}
      <div className="space-y-4">
        {activeTab === 'following' ? (
          following.length > 0 ? (
            following.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                showUnfollowButton={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-secondary-text mx-auto mb-4" />
              <p className="text-secondary-text">您还没有关注任何用户</p>
            </div>
          )
        ) : (
          followers.length > 0 ? (
            followers.map(user => (
              <UserCard 
                key={user.id} 
                user={user}
                showFollowButton={!following.some(f => f.id === user.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-secondary-text mx-auto mb-4" />
              <p className="text-secondary-text">您还没有粉丝</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FollowPage;