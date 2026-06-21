'use client'

import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from './chart-card'
import { chartColors, tooltipStyle } from '@/lib/chart-theme'
import type { ScanSignals } from '@/types/scan'

interface Props {
  signals?: ScanSignals
}

export function ScoreRadarChart({ signals }: Props) {
  const isLoading = signals === undefined

  const data = !isLoading && signals ? [
    { signal: 'Growth', score: signals.growthVelocity.score, fullMark: 100 },
    { signal: 'Engagement', score: signals.engagementRate.score, fullMark: 100 },
    { signal: 'Comments', score: signals.commentSentiment.score, fullMark: 100 },
    { signal: 'Spikes', score: signals.spikeDetection.score, fullMark: 100 },
  ] : []

  // Custom tick component to color labels based on score
  const renderCustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
    const item = data.find(d => d.signal === payload.value)
    const score = item ? item.score : 0
    let fill = '#22c55e' // low
    if (score >= 60) fill = '#ef4444' // high
    else if (score >= 30) fill = '#f59e0b' // medium

    return (
      <g>
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fill="#9ca3af"
          fontSize={11}
          dy={4}
        >
          {payload.value}
        </text>
        <text
          x={x}
          y={y + 14}
          textAnchor={textAnchor}
          fill={fill}
          fontSize={11}
          fontWeight="bold"
        >
          {score}
        </text>
      </g>
    )
  }

  return (
    <ChartCard
      title="Signal Overview"
      subtitle="Higher values indicate more suspicious activity"
      isLoading={isLoading}
    >
      {!isLoading && (
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={data}>
            <PolarGrid stroke={chartColors.grid} gridType="polygon" />
            <PolarAngleAxis dataKey="signal" tick={renderCustomTick} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="score"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value}/100`, 'Fraud Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
