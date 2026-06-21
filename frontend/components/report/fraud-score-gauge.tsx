'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface Props {
  score: number
  size?: number
}

export function FraudScoreGauge({ score, size = 200 }: Props) {
  const [filledLength, setFilledLength] = useState(0)
  
  // Center is (100, 100), radius 80
  const radius = 80
  const circumference = 2 * Math.PI * radius
  
  // Sweep is 240 degrees (from 210 to 330)
  const sweepAngle = 240
  const arcLength = circumference * (sweepAngle / 360)
  
  // Compute dash arrays
  const bgDasharray = `${arcLength} ${circumference - arcLength}`
  // To start at 210 degrees clockwise from 3 o'clock (0deg):
  // 0deg is right, 90deg is bottom, 180deg is left, 210deg is bottom-left
  // The stroke-dashoffset pushes the start of the stroke back.
  // We need to offset by 150 degrees (360 - 210) to align start point.
  const dashoffset = circumference * (150 / 360)

  // Color mapping
  let scoreColor = '#22c55e' // < 30
  if (score >= 60) scoreColor = '#ef4444' // >= 60
  else if (score >= 30) scoreColor = '#f59e0b' // 30-59

  useEffect(() => {
    // Animate the stroke dash array over 1.5s
    const targetLength = arcLength * (score / 100)
    const controls = animate(0, targetLength, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => {
        setFilledLength(value)
      }
    })
    return () => controls.stop()
  }, [score, arcLength])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full transform -rotate-90"
        style={{ dropShadow: `0 0 8px ${scoreColor}66` }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={bgDasharray}
          strokeDashoffset={dashoffset}
        />

        {/* Foreground Animated Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeDashoffset={dashoffset}
          filter="url(#glow)"
        />
      </svg>
      
      {/* Center Text overlay */}
      <div className="absolute flex flex-col items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl font-bold text-white"
        >
          {score}
        </motion.div>
        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
          Fraud Score
        </div>
      </div>
    </div>
  )
}
