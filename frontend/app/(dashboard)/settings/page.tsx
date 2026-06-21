'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Eye, EyeOff, Check, X, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { UsageMeter } from '@/components/dashboard/usage-meter'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const { data: stats } = useDashboardStats()

  // Profile Tab State
  const [name, setName] = useState(user?.name || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const isProfileDirty = name !== user?.name && name.length >= 2

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Danger Zone State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Password strength checks
  const hasMinLength = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length
  const isPasswordValid = strengthScore === 4
  const isConfirmValid = newPassword === confirmPassword && newPassword !== ''

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      await api.patch('/api/users/me', { name })
      updateUser({ name })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setIsChangingPassword(true)
    try {
      await api.post('/api/users/me/change-password', {
        currentPassword,
        newPassword
      })
      toast.success('Password updated. Please log in again.')
      setTimeout(() => {
        logout()
        router.push('/login')
      }, 1500)
    } catch (error) {
      toast.error('Failed to change password. Check your current password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await api.delete('/api/users/me')
      logout()
      router.push('/')
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        
        <Tabs.Root defaultValue="profile" className="flex flex-col">
          <Tabs.List className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
            <Tabs.Trigger 
              value="profile"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-indigo-500 transition-colors whitespace-nowrap"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="security"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-indigo-500 transition-colors whitespace-nowrap"
            >
              Security
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="organization"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-indigo-500 transition-colors whitespace-nowrap"
            >
              Organization
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-[#1C1C22] border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <button disabled className="text-sm text-gray-400 opacity-50 cursor-not-allowed" title="Coming soon">
                    Upload photo
                  </button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={user.email}
                      readOnly
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2">To change your email, contact support@spotbot.io</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={!isProfileDirty || isSavingProfile}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isSavingProfile ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-[#1C1C22] border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
              
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <div className="relative mb-3">
                    <input 
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-1 mb-2">
                      <div className={`h-1 flex-1 rounded-full ${strengthScore >= 1 ? (strengthScore === 4 ? 'bg-green-500' : strengthScore >= 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-white/10'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${strengthScore >= 2 ? (strengthScore === 4 ? 'bg-green-500' : 'bg-amber-500') : 'bg-white/10'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${strengthScore >= 3 ? (strengthScore === 4 ? 'bg-green-500' : 'bg-amber-500') : 'bg-white/10'}`}></div>
                      <div className={`h-1 flex-1 rounded-full ${strengthScore >= 4 ? 'bg-green-500' : 'bg-white/10'}`}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 ${hasMinLength ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-red-400/50" />} At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${hasUpper ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-red-400/50" />} Uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${hasLower ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-red-400/50" />} Lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-red-400/50" />} Number
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full bg-white/5 border ${confirmPassword && !isConfirmValid ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-indigo-500'} rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2`}
                    />
                    <button 
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && !isConfirmValid && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !isPasswordValid || !isConfirmValid || isChangingPassword}
                    className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[40px]"
                  >
                    {isChangingPassword ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1C22] border border-white/5 rounded-xl p-6">
              <h3 className="text-white font-medium mb-2">Active Sessions</h3>
              <p className="text-sm text-gray-400">
                Updating your password will sign you out of all other devices.
              </p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="organization" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-[#1C1C22] border border-white/5 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Organization</h2>
              
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Organization Name</label>
                  <input 
                    type="text" 
                    value="Spotbot Agency"
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Plan</label>
                  <div className="inline-flex items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                    {stats?.planName || 'Pro Plan'}
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Scan Usage</label>
                  <UsageMeter />
                </div>
                
                <div className="pt-4">
                  <Link 
                    href="/billing"
                    className="inline-flex items-center justify-center px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors border border-white/10"
                  >
                    Manage Billing →
                  </Link>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        {/* Danger Zone */}
        <div className="mt-12 bg-red-400/5 border border-red-400/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-400/10 rounded-lg text-red-400 mt-1">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              <p className="text-sm text-red-400/70 mt-1 mb-6">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-transparent border border-red-400/30 text-red-400 hover:bg-red-400/10 font-medium rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => !isDeleting && setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          title="Delete your account?"
          description="This will permanently delete your account, all your scans, and all generated reports. This action cannot be undone."
          confirmLabel={isDeleting ? "Deleting..." : "Delete Account"}
          variant="danger"
        />
      </div>
    </div>
  )
}
