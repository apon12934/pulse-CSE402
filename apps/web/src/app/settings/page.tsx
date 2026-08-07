'use client'

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@pulse/ui';
import { Loader2, Upload, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PasswordField } from '@/components/ui/PasswordField';
import { apiPatch, apiDelete, apiPost } from '@/lib/api';
import { useTaskStore } from '@/store/tasks';

export default function SettingsPage() {
  const { user, token, updateAvatarUrl, logout } = useAuthStore();
  const { fetchTasks } = useTaskStore();
  
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Auto 1:1 crop, optimize, and upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingAvatar(true);
    try {
      // 1. Read file as Data URL
      const reader = new FileReader();
      const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const img = await imageLoadPromise;

      // 2. Smart 1:1 Center Crop & Resize to 256x256
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

      // 3. Compress to WebP (0.8 quality)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.8);
      });

      if (!blob) throw new Error('Compression failed');

      // 4. Upload
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.webp');

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/user/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user?.avatarUrl) {
          updateAvatarUrl(data.user.avatarUrl);
        }
      } else {
        const text = await res.text();
        console.error('Failed to upload avatar', text);
      }
    } catch (err) {
      console.error('Avatar processing error', err);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdatingProfile(true);
    setProfileMsg('');
    try {
      await apiPatch('/api/user/profile', { name });
      setProfileMsg('Profile updated.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg("New passwords don't match.");
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordMsg('');
    try {
      await apiPatch('/api/user/password', { currentPassword, newPassword });
      setPasswordMsg('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiDelete('/api/user/account');
      setDeleteModalOpen(false);
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const handleClearRoutine = async () => {
    setIsClearing(true);
    try {
      await apiDelete('/api/schedule/clear-all');
      setClearModalOpen(false);
      await fetchTasks(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-12 pb-20">
        
        {/* Header */}
        <div>
          <h1 className="text-[#FFFF00] font-mono text-2xl font-bold tracking-widest uppercase mb-2">Settings</h1>
          <p className="text-[#888] font-mono text-sm tracking-wide">Manage your AI Core preferences and security.</p>
        </div>

        {/* Avatar Section */}
        <div className="border border-[#262626] bg-[#121212] p-6 space-y-6">
          <h2 className="text-white font-mono font-bold tracking-widest uppercase text-sm">Avatar Configuration</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#1A1A1A] border border-[#262626] flex items-center justify-center overflow-hidden shrink-0">
              {isUploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#FFFF00]" />
              ) : user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#888] font-mono text-xl">{user.name?.substring(0, 2).toUpperCase() || 'AI'}</span>
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="bg-[#1A1A1A] border border-[#333] text-white hover:bg-[#262626] rounded-none font-mono tracking-widest uppercase text-xs h-10 px-6 shadow-none flex items-center gap-2"
              >
                <Upload className="w-3 h-3" />
                Upload New Image
              </Button>
              <p className="text-[#666] font-mono text-[10px] mt-3">Auto 1:1 optimization. Powered by client-side WebP compression.</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="border border-[#262626] bg-[#121212] p-6 space-y-6">
          <h2 className="text-white font-mono font-bold tracking-widest uppercase text-sm">Identity Parameters</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[#888] font-mono text-[10px] uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#262626] text-white p-3 font-mono text-sm focus:outline-none focus:border-[#FFFF00] rounded-none transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button 
                type="submit"
                disabled={isUpdatingProfile || !name.trim() || name === user.name}
                className="bg-[#FFFF00] text-black hover:bg-[#FFFF00]/80 rounded-none font-mono tracking-widest uppercase text-xs h-10 px-8 shadow-none"
              >
                {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
              </Button>
              {profileMsg && <span className="text-[#888] font-mono text-xs">{profileMsg}</span>}
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="border border-[#262626] bg-[#121212] p-6 space-y-6">
          <h2 className="text-white font-mono font-bold tracking-widest uppercase text-sm">Security Matrix</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[#888] font-mono text-[10px] uppercase tracking-wider mb-2">Current Password</label>
              <PasswordField 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#888] font-mono text-[10px] uppercase tracking-wider mb-2">New Password</label>
              <PasswordField 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#888] font-mono text-[10px] uppercase tracking-wider mb-2">Confirm New Password</label>
              <PasswordField 
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button 
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                className="bg-[#1A1A1A] border border-[#333] text-white hover:bg-[#262626] rounded-none font-mono tracking-widest uppercase text-xs h-10 px-8 shadow-none"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
              {passwordMsg && <span className="text-[#888] font-mono text-xs">{passwordMsg}</span>}
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-[#FF4444]/30 bg-[#121212] p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4444]/50"></div>
          <div className="flex items-center gap-2 text-[#FF4444]">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-mono font-bold tracking-widest uppercase text-sm">Danger Zone</h2>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-[#262626] bg-[#0A0A0A]">
              <div>
                <h3 className="text-white font-mono text-xs uppercase tracking-wider">Clear Routine</h3>
                <p className="text-[#666] font-mono text-[10px] mt-1">Wipe all tasks from your schedule.</p>
              </div>
              <Button 
                onClick={() => setClearModalOpen(true)}
                className="bg-[#FF4444] text-white hover:bg-[#FF4444]/80 rounded-none font-mono tracking-widest uppercase text-xs h-10 w-40 shadow-none shrink-0"
              >
                Clear Data
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-[#262626] bg-[#0A0A0A]">
              <div>
                <h3 className="text-white font-mono text-xs uppercase tracking-wider">Delete Account</h3>
                <p className="text-[#666] font-mono text-[10px] mt-1">Permanently erase identity and all data.</p>
              </div>
              <Button 
                onClick={() => setDeleteModalOpen(true)}
                className="bg-[#FF4444] text-white hover:bg-[#FF4444]/80 rounded-none font-mono tracking-widest uppercase text-xs h-10 w-40 shadow-none shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearRoutine}
        title="Clear Routine"
        description="Are you absolutely sure you want to clear your entire schedule? This action cannot be undone and will delete all tasks."
        confirmText="Clear Everything"
        confirmType="warning"
        isProcessing={isClearing}
      />

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This will permanently delete your user identity, all scheduled tasks, and your AI chat history. This action is irreversible."
        confirmText="Erase Identity"
        confirmType="danger"
        requireText="DELETE"
        isProcessing={isDeleting}
      />
    </div>
  );
}
