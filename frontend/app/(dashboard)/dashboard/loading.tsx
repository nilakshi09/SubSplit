import { SkeletonCard, SkeletonRow } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      <div>
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-5 w-64 bg-white/5 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="bg-[#1C1C22] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="h-6 w-1/4 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <SkeletonCard className="h-48" />
        </div>
      </div>
    </div>
  )
}
