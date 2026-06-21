'use client'

import { useState, useEffect, useCallback } from 'react'
import { useScans } from '@/hooks/use-scans'
import { useDebounce } from '@/hooks/use-debounce'
import type { ScanFilters, Platform, RiskLevel, Scan } from '@/types/scan'
import { Search, FileText, Download, Copy, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { formatDate, scoreColor, riskLabel, riskColor } from '@/lib/format'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { PlatformBadge } from '@/components/ui/platform-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { SkeletonRow } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getAccessToken } from '@/lib/auth'

export default function ReportsPage() {
  const [filters, setFilters] = useState<ScanFilters>({
    page: 1,
    limit: 20,
    status: 'completed',
  })
  
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      handle: debouncedSearch || undefined,
      page: 1,
    }))
  }, [debouncedSearch])

  const { data, isLoading } = useScans(filters)

  const handleCopy = (handle: string, id: string) => {
    navigator.clipboard.writeText(handle)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadPDF = async (scanId: string, handle: string) => {
    setDownloadingId(scanId)
    try {
      const token = getAccessToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${scanId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error('Failed to download PDF')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spotbot-report-${handle}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report downloaded successfully')
    } catch (err) {
      toast.error('Failed to download report. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setFilters({
      page: 1,
      limit: 20,
      status: 'completed',
    })
  }, [])

  const hasActiveFilters = Boolean(
    filters.handle || filters.platform || filters.riskLevel || filters.dateFrom
  )

  const setDateRange = (range: string) => {
    let dateFrom: string | undefined = undefined
    if (range === 'week') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      dateFrom = d.toISOString()
    } else if (range === 'month') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      dateFrom = d.toISOString()
    } else if (range === '3months') {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      dateFrom = d.toISOString()
    }
    
    setFilters(prev => ({ ...prev, dateFrom, page: 1 }))
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-400 mt-1">All your fraud analysis reports</p>
        </div>
        <Link 
          href="/scan" 
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Run New Scan →
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by handle..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Platform Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`px-4 py-2 bg-white/5 border rounded-lg text-sm font-medium transition-colors ${filters.platform ? 'border-indigo-500 text-white' : 'border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {filters.platform ? `Platform: ${filters.platform}` : 'Platform ▼'}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-gray-900 border border-white/10 rounded-lg p-1 min-w-[150px] shadow-xl z-50">
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setFilters(prev => ({ ...prev, platform: undefined, page: 1 }))}
              >
                All Platforms
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setFilters(prev => ({ ...prev, platform: 'instagram', page: 1 }))}
              >
                Instagram
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setFilters(prev => ({ ...prev, platform: 'youtube', page: 1 }))}
              >
                YouTube
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Risk Level Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`px-4 py-2 bg-white/5 border rounded-lg text-sm font-medium transition-colors ${filters.riskLevel ? 'border-indigo-500 text-white' : 'border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {filters.riskLevel ? `Risk: ${riskLabel(filters.riskLevel)}` : 'Risk Level ▼'}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-gray-900 border border-white/10 rounded-lg p-1 min-w-[200px] shadow-xl z-50">
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setFilters(prev => ({ ...prev, riskLevel: undefined, page: 1 }))}
              >
                All Risk Levels
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none flex items-center justify-between"
                onClick={() => setFilters(prev => ({ ...prev, riskLevel: 'low', page: 1 }))}
              >
                <span>Clean (Low)</span>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none flex items-center justify-between"
                onClick={() => setFilters(prev => ({ ...prev, riskLevel: 'medium', page: 1 }))}
              >
                <span>Review (Medium)</span>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none flex items-center justify-between"
                onClick={() => setFilters(prev => ({ ...prev, riskLevel: 'high', page: 1 }))}
              >
                <span>Suspicious (High)</span>
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Date Range Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className={`px-4 py-2 bg-white/5 border rounded-lg text-sm font-medium transition-colors ${filters.dateFrom ? 'border-indigo-500 text-white' : 'border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {filters.dateFrom ? 'Date: Custom ▼' : 'Date Range ▼'}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-gray-900 border border-white/10 rounded-lg p-1 min-w-[150px] shadow-xl z-50">
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setDateRange('all')}
              >
                All time
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setDateRange('week')}
              >
                This week
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setDateRange('month')}
              >
                This month
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md cursor-pointer outline-none"
                onClick={() => setDateRange('3months')}
              >
                Last 3 months
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white underline ml-auto sm:ml-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400">
        {isLoading ? (
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        ) : (
          <p>
            Showing {data?.meta?.total || 0} results
            {filters.handle && ` for '${filters.handle}'`}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1C1C22] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10 bg-black/20">
                <th className="p-4 font-medium">Handle</th>
                <th className="p-4 font-medium hidden sm:table-cell">Platform</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Risk</th>
                <th className="p-4 font-medium hidden sm:table-cell">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="p-4">
                      <div className="h-8 bg-white/5 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    {!hasActiveFilters ? (
                      <EmptyState
                        icon={FileText}
                        title="No reports yet"
                        description="Run your first fraud scan to start building your report history"
                        action={{ label: "Run First Scan", href: "/scan" }}
                      />
                    ) : (
                      <EmptyState
                        icon={Search}
                        title="No results found"
                        description="Try adjusting your filters or search term"
                        action={{ label: "Clear Filters", onClick: clearFilters }}
                      />
                    )}
                  </td>
                </tr>
              ) : (
                data?.data?.map((scan: Scan) => (
                  <tr key={scan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <button 
                        onClick={() => handleCopy(`@${scan.handle}`, scan.id)}
                        className="font-mono text-white flex items-center gap-2 group-hover:text-indigo-400 transition-colors"
                        title="Copy handle"
                      >
                        @{scan.handle}
                        {copiedId === scan.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <PlatformBadge platform={scan.platform} size="sm" />
                    </td>
                    <td className="p-4">
                      <span className={`text-xl font-bold ${scoreColor(scan.fraudScore || 0)}`}>
                        {scan.fraudScore}
                      </span>
                    </td>
                    <td className="p-4">
                      {scan.riskLevel && <RiskBadge level={scan.riskLevel} size="sm" />}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-gray-400 text-sm" title={new Date(scan.createdAt).toLocaleString()}>
                        {formatDate(scan.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/scan/${scan.id}`}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(scan.id, scan.handle)}
                          disabled={downloadingId === scan.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloadingId === scan.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={filters.page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <span className="text-sm text-gray-500">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          
          <button
            onClick={() => {
              setFilters(prev => ({ ...prev, page: Math.min(data.meta.totalPages, (prev.page || 1) + 1) }))
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            disabled={filters.page === data.meta.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
