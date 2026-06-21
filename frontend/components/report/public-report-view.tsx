'use client'

import React from 'react'
import Link from 'next/link'
import type { Scan } from '@/types/scan'
import { ProfileSummary } from './profile-summary'
import { FraudScoreGauge } from './fraud-score-gauge'
import { RealReach } from './real-reach'
import { SignalCard } from './signal-card'
import { FollowerGrowthChart } from './follower-growth-chart'
import { EngagementBenchmarkChart } from './engagement-benchmark-chart'
import { CommentAnalysisChart } from './comment-analysis-chart'
import { ScoreRadarChart } from './score-radar-chart'
import { ReportFooter } from './report-footer'
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

interface Props {
  scan: Scan
  token: string
}

export function PublicReportView({ scan, token }: Props) {
  if (!scan) return null

  const getRiskSummaryConfig = () => {
    switch (scan.riskLevel) {
      case 'low':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          border: 'border-green-400/20',
          title: 'Low Risk Audience',
        }
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bg: 'bg-amber-400/10',
          border: 'border-amber-400/20',
          title: 'Review Recommended',
        }
      case 'high':
      default:
        return {
          icon: ShieldAlert,
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          border: 'border-red-400/20',
          title: 'High Risk Audience',
        }
    }
  }

  const riskConfig = getRiskSummaryConfig()
  const RiskIcon = riskConfig.icon

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* PUBLIC HEADER */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              S
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Spotbot
            </span>
          </Link>
          <div className="hidden sm:block text-gray-400 text-sm font-medium">
            Fraud Analysis Report
          </div>
          <Link 
            href="/signup" 
            className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5"
          >
            Run your own scan →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Top Section: Profile & Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileSummary scan={scan} />
            
            {/* Risk Summary Card */}
            <div className={`mt-6 p-4 rounded-xl border ${riskConfig.bg} ${riskConfig.border} flex items-start gap-4`}>
              <div className={`p-2 rounded-lg bg-black/20 ${riskConfig.color}`}>
                <RiskIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-semibold ${riskConfig.color}`}>{riskConfig.title}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {scan.riskSummary || 'Based on our analysis of engagement patterns and audience quality, this account shows typical signals for this risk tier.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <FraudScoreGauge score={scan.fraudScore || 0} riskLevel={scan.riskLevel || 'medium'} />
            <RealReach realReach={scan.realReach || 0} followers={scan.profile?.followers || 0} />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreRadarChart signals={scan.signals} />
          {scan.followerHistory && scan.followerHistory.length > 0 && (
            <FollowerGrowthChart data={scan.followerHistory} spikes={scan.signals?.spikeDetection?.details?.spikes} />
          )}
          {scan.signals?.engagementRate?.details && (
            <EngagementBenchmarkChart details={scan.signals.engagementRate.details} />
          )}
          {scan.signals?.commentSentiment?.details && (
            <CommentAnalysisChart details={scan.signals.commentSentiment.details} />
          )}
        </div>

        {/* Signals Section */}
        {scan.signals && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white pt-4">Signal Breakdown</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <SignalCard type="growthVelocity" result={scan.signals.growthVelocity} />
                <div className="absolute bottom-3 right-4 text-[10px] text-gray-600 font-medium">Verified by Spotbot</div>
              </div>
              <div className="relative">
                <SignalCard type="engagementRate" result={scan.signals.engagementRate} />
                <div className="absolute bottom-3 right-4 text-[10px] text-gray-600 font-medium">Verified by Spotbot</div>
              </div>
              <div className="relative">
                <SignalCard type="commentSentiment" result={scan.signals.commentSentiment} />
                <div className="absolute bottom-3 right-4 text-[10px] text-gray-600 font-medium">Verified by Spotbot</div>
              </div>
              <div className="relative">
                <SignalCard type="spikeDetection" result={scan.signals.spikeDetection} />
                <div className="absolute bottom-3 right-4 text-[10px] text-gray-600 font-medium">Verified by Spotbot</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PUBLIC FOOTER */}
      <footer className="mt-16 border-t border-white/10 bg-[#12121A]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">Want to verify your influencers?</h2>
            <p className="text-gray-400 text-lg">
              Spotbot gives agencies instant fraud scores for any Instagram or YouTube account. Stop guessing, start verifying.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link 
                href="/signup" 
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                Get Started Free →
              </Link>
              <Link 
                href="/" 
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Spotbot · spotbot.io · This report reflects publicly available data</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
