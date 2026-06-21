'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ChartCard } from './chart-card'
import { formatNumber, formatDateShort, formatDate } from '@/lib/format'
import { chartColors, tooltipStyle, axisTickStyle } from '@/lib/chart-theme'
import type { FollowerSnapshot } from '@/types/scan'

interface Props {
  followerHistory?: FollowerSnapshot[]
  anomalyDays?: string[]
}

export function FollowerGrowthChart({ followerHistory, anomalyDays = [] }: Props) {
  const isLoading = followerHistory === undefined
  const isEmpty = !isLoading && followerHistory.length === 0

  return (
    <ChartCard
      title="Follower Growth"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="Historical follower data unavailable. Social Blade data could not be retrieved for this account."
    >
      {!isLoading && !isEmpty && (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={followerHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => formatDateShort(date)}
              tick={axisTickStyle}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatNumber(v)}
              tick={axisTickStyle}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [formatNumber(value as number), 'Followers']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#followerGradient)"
            />
            {anomalyDays.map((anomalyDate) => (
              <ReferenceLine
                key={anomalyDate}
                x={anomalyDate}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{ value: '⚠', fill: '#ef4444', fontSize: 12, position: 'top' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
