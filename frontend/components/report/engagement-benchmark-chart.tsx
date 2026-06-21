'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts'
import { ChartCard } from './chart-card'
import { capitalize, formatTier } from '@/lib/format'
import { chartColors, tooltipStyle, axisTickStyle } from '@/lib/chart-theme'

interface Props {
  accountER?: number
  benchmarkER?: number
  handle: string
  niche: string
  tier: string
}

export function EngagementBenchmarkChart({ accountER, benchmarkER, handle, niche, tier }: Props) {
  const isLoading = accountER === undefined || benchmarkER === undefined
  
  const data = !isLoading ? [
    { name: `@${handle}`, er: accountER },
    { name: 'Niche Average', er: benchmarkER },
  ] : []

  const domainMax = !isLoading ? Math.max(benchmarkER! * 1.5, accountER! * 1.5) : 10

  const getAccountColor = (accountValue: number, benchmarkValue: number) => {
    if (accountValue < benchmarkValue * 0.4) return '#ef4444' // red
    if (accountValue < benchmarkValue * 0.8) return '#f59e0b' // amber
    return '#22c55e' // green
  }

  return (
    <ChartCard
      title="Engagement Rate vs Benchmark"
      subtitle={`${capitalize(niche)} · ${formatTier(tier)}`}
      isLoading={isLoading}
    >
      {!isLoading && (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={true} vertical={false} />
              <XAxis dataKey="name" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={axisTickStyle}
                axisLine={false}
                tickLine={false}
                domain={[0, domainMax]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${(value as number).toFixed(2)}%`, 'Engagement Rate']}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="er" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? getAccountColor(entry.er, benchmarkER!) : '#6366f1'}
                  />
                ))}
                <LabelList
                  dataKey="er"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                  style={{ fill: '#9ca3af', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-gray-400" /> Account ER
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-[#6366f1]" /> Niche Average
            </div>
          </div>
        </>
      )}
    </ChartCard>
  )
}
