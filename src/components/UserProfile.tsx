import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, Bell, Shield, LogOut, Edit3, Save, X } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-200 hover:bg-green-500/30 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white/60 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  ) : (
                    <p className="text-white font-medium">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  ) : (
                    <p className="text-white">{user.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          {user.subscription && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Subscription</h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">{user.subscription.planId} Plan</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.subscription.status === 'active' 
                      ? 'bg-green-500/20 text-green-200' 
                      : 'bg-red-500/20 text-red-200'
                  }`}>
                    {user.subscription.status}
                  </span>
                </div>
                <div className="text-sm text-white/60 space-y-1">
                  <p>Started: {formatDate(user.subscription.startDate)}</p>
                  <p>Expires: {formatDate(user.subscription.endDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Your Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">{user.stats.totalQuizzes}</p>
                <p className="text-sm text-white/60">Total Quizzes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">{user.stats.totalQuestions}</p>
                <p className="text-sm text-white/60">Questions Answered</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">{user.stats.averageScore}%</p>
                <p className="text-sm text-white/60">Average Score</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-2xl font-bold text-white">{user.stats.studyStreak}</p>
                <p className="text-sm text-white/60">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Information</h3>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex justify-between">
                <span>Member since:</span>
                <span className="text-white">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last login:</span>
                <span className="text-white">{formatDate(user.lastLoginAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-6 border-t border-white/20">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
              Preferences
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              Notification Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-colors">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
