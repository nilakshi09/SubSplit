'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom' // using react-router-dom based on previous context, even if Next.js was specified for the page
import { ArrowLeft } from 'lucide-react'
import { ProfileSummary } from './profile-summary'
import { FraudScoreGauge } from './fraud-score-gauge'
import { RealReach } from './real-reach'
import { SignalCard } from './signal-card'
import { FollowerGrowthChart } from './follower-growth-chart'
import { ScoreRadarChart } from './score-radar-chart'
import { EngagementBenchmarkChart } from './engagement-benchmark-chart'
import { CommentAnalysisChart } from './comment-analysis-chart'
import { ReportActions } from './report-actions'
import { ReportFooter } from './report-footer'
import type { Scan } from '@/types/scan'

interface Props {
  scan: Scan
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
}

export function ScanReport({ scan }: Props) {
  if (!scan.profile || !scan.signals) {
    return <div className="p-8 text-center text-gray-400">Report data is incomplete.</div>
  }

  // Determine risk level color for the summary paragraph
  let riskBorder = 'border-green-400'
  if (scan.riskLevel === 'high') riskBorder = 'border-red-400'
  else if (scan.riskLevel === 'medium') riskBorder = 'border-amber-400'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* TOP BAR (sticky on scroll) */}
      <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-20 border-b border-white/5 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          {/* Note: since this is requested as Next.js app but project is Vite, keeping a hybrid approach. 
              We'll use a standard anchor or Link from react-router depending on the actual environment.
              Since we import Link from react-router-dom above, we'll use that. */}
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <ReportActions scan={scan} />
        </div>
      </div>

      <motion.div 
        className="max-w-5xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* SECTION 1 — Profile Summary */}
        <motion.div variants={itemVariants} className="mb-8">
          <ProfileSummary profile={scan.profile} handle={scan.handle} platform={scan.platform} />
        </motion.div>

        {/* SECTION 2 — Score Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 lg:col-span-1 flex items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <FraudScoreGauge score={scan.fraudScore || 0} />
          </div>
          <div className="col-span-1 lg:col-span-1 flex flex-col justify-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md min-h-[220px]">
            <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-2">Risk Level</h3>
            <div className={`text-4xl font-bold capitalize mb-4 ${
              scan.riskLevel === 'high' ? 'text-red-500' :
              scan.riskLevel === 'medium' ? 'text-amber-500' : 'text-green-500'
            }`}>
              {scan.riskLevel || 'Unknown'} Risk
            </div>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
              {scan.riskSummary || 'Analysis completed.'}
            </p>
          </div>
          <div className="col-span-1 lg:col-span-1">
            <RealReach 
              realReach={scan.realReach || 0} 
              totalFollowers={scan.profile.followers} 
              fraudScore={scan.fraudScore || 0} 
            />
          </div>
        </motion.div>

        {/* SECTION 3 — Risk Summary paragraph */}
        {scan.riskSummary && (
          <motion.div variants={itemVariants} className={`mb-12 p-5 rounded-xl bg-white/5 border border-white/10 border-l-4 ${riskBorder}`}>
            <p className="text-gray-300 italic leading-relaxed text-sm">
              "{scan.riskSummary}"
            </p>
          </motion.div>
        )}

        {/* SECTION 4 — Signal Breakdown */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Signal Breakdown</h2>
            <p className="text-sm text-gray-400 mt-1">Four independent signals analyzed to compute the fraud score</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignalCard signalKey="growthVelocity" signal={scan.signals.growthVelocity} weight={0.3} />
            <SignalCard signalKey="engagementRate" signal={scan.signals.engagementRate} weight={0.25} />
            <SignalCard signalKey="commentSentiment" signal={scan.signals.commentSentiment} weight={0.25} />
            <SignalCard signalKey="spikeDetection" signal={scan.signals.spikeDetection} weight={0.2} />
          </div>
        </motion.div>

        {/* SECTION 5 — Charts */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Audience Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FollowerGrowthChart 
              followerHistory={scan.followerHistory} 
              anomalyDays={scan.signals.growthVelocity.details.anomalyDays} 
            />
            <ScoreRadarChart signals={scan.signals} />
            <EngagementBenchmarkChart 
              accountER={scan.signals.engagementRate.details.accountER}
              benchmarkER={scan.signals.engagementRate.details.benchmarkER}
              handle={scan.handle}
              niche={scan.signals.engagementRate.details.niche}
              tier={scan.signals.engagementRate.details.tier}
            />
            <CommentAnalysisChart details={scan.signals.commentSentiment.details} />
          </div>
        </motion.div>

        {/* SECTION 6 — Report Footer */}
        <motion.div variants={itemVariants}>
          <ReportFooter scan={scan} />
        </motion.div>
      </motion.div>
    </div>
  )
}
