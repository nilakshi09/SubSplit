'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'
import { formatNumber, capitalize, formatTier } from '@/lib/format'
import type { ScanProfile, Platform } from '@/types/scan'
import { PlatformBadge } from '@/components/ui/platform-badge' // Assuming this exists or falls back

interface Props {
  profile: ScanProfile
  handle: string
  platform: Platform
}

export function ProfileSummary({ profile, handle, platform }: Props) {
  // Compute tier based on followers
  const getFollowerTier = (followers: number) => {
    if (followers >= 1_000_000) return 'mega'
    if (followers >= 200_000) return 'macro'
    if (followers >= 50_000) return 'mid'
    if (followers >= 10_000) return 'micro'
    return 'nano'
  }

  const tier = getFollowerTier(profile.followers)
  const initial = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      {/* LEFT SIDE — Avatar */}
      <div className="relative shrink-0">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20">
          {profile.profilePictureUrl ? (
            <img 
              src={profile.profilePictureUrl} 
              alt={profile.displayName} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`text-2xl text-white font-bold ${profile.profilePictureUrl ? 'hidden' : ''}`}>
            {initial}
          </span>
        </div>
        {profile.isVerified && (
          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 shadow-lg border-2 border-[#0a0a0a]">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* CENTER — Identity */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {profile.displayName}
        </h2>
        <div className="text-gray-400 text-sm font-mono mt-0.5 flex items-center gap-2">
          @{handle}
          {platform === 'instagram' ? (
            <span className="text-[10px] uppercase bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded">IG</span>
          ) : (
            <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">YT</span>
          )}
        </div>
        <p className="text-gray-300 text-sm mt-2 line-clamp-2 leading-relaxed max-w-lg">
          {profile.bio || 'No bio provided.'}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300 border border-white/5">
            {capitalize(profile.category || 'general')} · {capitalize(tier)}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE — Stats grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 shrink-0 md:pl-8 md:border-l border-white/10">
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-white">{formatNumber(profile.followers)}</span>
          <span className="text-xs text-gray-400 mt-1">Followers</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-white">{formatNumber(profile.following)}</span>
          <span className="text-xs text-gray-400 mt-1">Following</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-white">{formatNumber(profile.posts)}</span>
          <span className="text-xs text-gray-400 mt-1">Posts</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white flex items-center gap-1 mt-1">
            {profile.isVerified ? '✓ Verified' : 'Not Verified'}
          </span>
          <span className="text-xs text-gray-400 mt-1">Status</span>
        </div>
      </div>
    </div>
  )
}
