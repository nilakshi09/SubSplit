'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartCard } from './chart-card'
import { chartColors, tooltipStyle } from '@/lib/chart-theme'
import type { CommentSentimentDetails } from '@/types/scan'

interface Props {
  details?: CommentSentimentDetails
}

export function CommentAnalysisChart({ details }: Props) {
  const isLoading = details === undefined
  const isEmpty = !isLoading && details.totalAnalyzed === 0

  const data = !isLoading && !isEmpty ? [
    { name: 'Authentic', value: details.authentic, color: chartColors.authentic },
    { name: 'Generic Bot', value: details.genericBot, color: chartColors.genericBot },
    { name: 'Emoji Only', value: details.emojiOnly, color: chartColors.emojiOnly },
    { name: 'Spam', value: details.spam, color: chartColors.spam },
  ].filter(d => d.value > 0) : []

  const botRatio = details?.botRatio ?? 0
  const botColor = botRatio < 0.2 ? '#22c55e' : botRatio < 0.4 ? '#f59e0b' : '#ef4444'

  return (
    <ChartCard
      title="Comment Quality Analysis"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="Comment data unavailable"
    >
      {!isLoading && !isEmpty && details && (
        <div className="flex flex-col h-full">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                dataKey="value"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value} comments (${((value / details.totalAnalyzed) * 100).toFixed(1)}%)`,
                  name
                ]}
              />
              <svg>
                <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill={botColor} fontSize="24" fontWeight="bold">
                  {Math.round(botRatio * 100)}%
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize="11">
                  Bot Activity
                </text>
              </svg>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-y-2 mt-4">
            {data.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300 text-xs w-24">{item.name}</span>
                <span className="text-white text-xs font-medium w-8 text-right">{item.value}</span>
                <span className="text-gray-500 text-xs text-right w-12">
                  ({Math.round((item.value / details.totalAnalyzed) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
