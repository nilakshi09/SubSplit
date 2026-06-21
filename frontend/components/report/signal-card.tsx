'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, BarChart2, MessageCircle, Zap, ChevronDown } from 'lucide-react'
import { formatNumber, formatDateShort, capitalize, formatTier, confidenceLabel, confidenceColor } from '@/lib/format'
import type { 
  SignalResult, 
  GrowthVelocityDetails, 
  EngagementRateDetails, 
  CommentSentimentDetails, 
  SpikeDetectionDetails 
} from '@/types/scan'

const signalNames = {
  growthVelocity: 'Follower Growth',
  engagementRate: 'Engagement Rate',
  commentSentiment: 'Comment Quality',
  spikeDetection: 'Spike Detection',
}

const signalIcons = {
  growthVelocity: TrendingUp,
  engagementRate: BarChart2,
  commentSentiment: MessageCircle,
  spikeDetection: Zap,
}

interface Props {
  signalKey: keyof typeof signalNames
  signal: SignalResult<any>
  weight: number
}

export function SignalCard({ signalKey, signal, weight }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = signalIcons[signalKey]
  const name = signalNames[signalKey]

  let borderColor = 'border-green-400'
  let scoreColor = 'text-green-400'
  let bgGradient = 'from-green-400'
  
  if (signal.score >= 60) {
    borderColor = 'border-red-400'
    scoreColor = 'text-red-400'
    bgGradient = 'from-red-400'
  } else if (signal.score >= 30) {
    borderColor = 'border-amber-400'
    scoreColor = 'text-amber-400'
    bgGradient = 'from-amber-400'
  }

  const renderDetails = () => {
    switch (signalKey) {
      case 'growthVelocity': {
        const d = signal.details as GrowthVelocityDetails
        return (
          <div className="space-y-3 mt-4 pt-4 border-t border-white/10 text-sm">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>Data points analyzed: <span className="text-white font-medium">{d.dataPointCount}</span></div>
              <div>Avg daily growth: <span className="text-white font-medium">{formatNumber(d.avgDailyGrowth)}</span></div>
            </div>
            {d.anomalyDays?.length > 0 ? (
              <div className="mt-4">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Detected Anomalies</div>
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-3 py-2 font-medium text-gray-400">Date</th>
                        <th className="px-3 py-2 font-medium text-gray-400">Followers Gained</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.anomalyDays.map((date, idx) => (
                        <tr key={date} className="border-b border-white/5 last:border-0">
                          <td className="px-3 py-2 text-gray-300">{formatDateShort(date)}</td>
                          <td className="px-3 py-2 text-red-400 font-medium">
                            +{formatNumber(d.anomalyMagnitudes[idx])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-green-400 mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                No anomalous growth days detected
              </div>
            )}
          </div>
        )
      }
      case 'engagementRate': {
        const d = signal.details as EngagementRateDetails
        const deviationStr = d.ratio < 1 ? `${((1 - d.ratio) * 100).toFixed(0)}% below average` : 'Above average'
        return (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10 text-sm">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="text-gray-400">Account ER: <span className="text-white ml-1">{d.accountER.toFixed(2)}%</span></div>
              <div className="text-gray-400">Niche Benchmark: <span className="text-white ml-1">{d.benchmarkER.toFixed(2)}%</span></div>
              <div className="text-gray-400">Deviation: <span className="text-white ml-1">{deviationStr}</span></div>
              <div className="text-gray-400">Follower Tier: <span className="text-white ml-1">{formatTier(d.tier)}</span></div>
              <div className="text-gray-400">Niche: <span className="text-white ml-1">{capitalize(d.niche)}</span></div>
              <div className="text-gray-400">Posts Analyzed: <span className="text-white ml-1">{d.postsAnalyzed}</span></div>
              <div className="text-gray-400">Avg Likes: <span className="text-white ml-1">{formatNumber(d.avgLikes)}</span></div>
              <div className="text-gray-400">Avg Comments: <span className="text-white ml-1">{formatNumber(d.avgComments)}</span></div>
            </div>
          </div>
        )
      }
      case 'commentSentiment': {
        const d = signal.details as CommentSentimentDetails
        return (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10 text-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium text-right">Count</th>
                  <th className="pb-2 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Authentic', count: d.authentic, color: 'text-green-400' },
                  { label: 'Generic Bot', count: d.genericBot, color: 'text-red-400' },
                  { label: 'Emoji Only', count: d.emojiOnly, color: 'text-amber-400' },
                  { label: 'Spam', count: d.spam, color: 'text-red-500' },
                ].map(row => {
                  const pct = d.totalAnalyzed > 0 ? Math.round((row.count / d.totalAnalyzed) * 100) : 0
                  return (
                    <tr key={row.label}>
                      <td className={`py-2 ${row.color}`}>{row.label}</td>
                      <td className="py-2 text-white text-right">{formatNumber(row.count)}</td>
                      <td className="py-2 text-gray-400 text-right">{pct}%</td>
                    </tr>
                  )
                })}
                <tr className="font-medium bg-white/5">
                  <td className="py-2 px-2 text-white rounded-l">Total</td>
                  <td className="py-2 text-white text-right">{formatNumber(d.totalAnalyzed)}</td>
                  <td className="py-2 px-2 text-white text-right rounded-r">100%</td>
                </tr>
              </tbody>
            </table>

            {d.topBotPhrases?.length > 0 && (
              <div className="mt-4">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Common bot phrases detected</div>
                <div className="flex flex-wrap gap-2">
                  {d.topBotPhrases.slice(0, 5).map(phrase => (
                    <span key={phrase} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-mono">
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }
      case 'spikeDetection': {
        const d = signal.details as SpikeDetectionDetails
        return (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10 text-sm">
            <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-lg p-3">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Total Spikes</span>
                <span className="text-white font-medium text-lg">{d.totalSpikes}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Explained</span>
                <span className="text-green-400 font-medium text-lg">{d.explainedSpikes}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Unexplained</span>
                <span className="text-red-400 font-medium text-lg">{d.unexplainedSpikes}</span>
              </div>
            </div>

            {d.spikes?.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-3 py-2 font-medium text-gray-400">Date</th>
                      <th className="px-3 py-2 font-medium text-gray-400">Gained</th>
                      <th className="px-3 py-2 font-medium text-gray-400">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {d.spikes.map((spike, i) => {
                      let badge = <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-red-500/20 text-red-400">Unexplained</span>
                      if (spike.classification === 'explained') {
                        badge = <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-green-500/20 text-green-400">Explained</span>
                      } else if (spike.classification === 'partially_explained') {
                        badge = <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-amber-500/20 text-amber-400">Partial</span>
                      }
                      
                      return (
                        <tr key={i}>
                          <td className="px-3 py-2 text-gray-300">{formatDateShort(spike.date)}</td>
                          <td className="px-3 py-2 text-white">+{formatNumber(spike.magnitude)}</td>
                          <td className="px-3 py-2">{badge}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-green-400 mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                No suspicious follower spikes detected
              </div>
            )}
          </div>
        )
      }
    }
  }

  return (
    <div className={`p-5 rounded-2xl bg-white/5 border border-white/10 border-l-4 ${borderColor} backdrop-blur-sm transition-all hover:bg-white/10`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-white/5 ${scoreColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-medium text-white">{name}</h3>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {Math.round(weight * 100)}% of score
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className={`text-4xl font-bold ${scoreColor}`}>
          {signal.score}
        </div>
        <div className="flex items-center gap-1.5 pb-1">
          <div className={`w-2 h-2 rounded-full bg-current ${confidenceColor(signal.confidence)}`} />
          <span className={`text-xs font-medium ${confidenceColor(signal.confidence)}`}>
            {confidenceLabel(signal.confidence)}
          </span>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${signal.score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          className={`h-full bg-gradient-to-r ${bgGradient} to-transparent rounded-full`}
        />
      </div>

      <p className="text-sm text-gray-300 mt-4 leading-relaxed">
        {signal.summary}
      </p>

      <div className="mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors py-1"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {renderDetails()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
