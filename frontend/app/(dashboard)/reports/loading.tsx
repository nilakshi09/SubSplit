import { SkeletonRow } from '@/components/ui/skeleton'

export default function ReportsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-indigo-500/20 rounded animate-pulse" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="h-10 flex-1 min-w-[200px] bg-white/5 rounded animate-pulse" />
        <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
      </div>

      <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />

      <div className="bg-[#1C1C22] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  )
}
