import { Search } from 'lucide-react';
import Link from 'next/link';
import { scoreColor, timeAgo } from '@/lib/format';
import { Scan } from '@/types/scan';

// Mock components to satisfy requirements since we can't edit phase B
const PlatformBadge = ({ platform }: { platform: string }) => (
  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-md font-medium capitalize">
    {platform === 'instagram' ? 'IG' : platform}
  </span>
);

const RiskBadge = ({ risk }: { risk: string | null }) => {
  if (!risk) return <span className="text-gray-500">—</span>;
  const isHigh = risk.toLowerCase() === 'high';
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${isHigh ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
      {isHigh ? '🚨 High' : '✅ Clean'}
    </span>
  );
};

export function RecentScansTable({ scans, isLoading }: { scans?: Scan[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 animate-pulse rounded border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const completedScans = scans?.filter(s => s.status === 'completed') || [];
  const hasPendingScans = scans?.some(s => s.status !== 'completed');

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 mt-6 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
        <Link href="/reports" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          View all →
        </Link>
      </div>

      {!scans || scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-white font-medium mb-1">No scans yet</h4>
          <p className="text-gray-400 text-sm mb-6">Run your first fraud scan to protect your campaigns</p>
          <Link 
            href="/scan"
            className="px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg text-sm font-medium transition-colors"
          >
            Run Your First Scan
          </Link>
        </div>
      ) : completedScans.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm border-t border-white/5">
          Your recent scans are still processing...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/10">
                <th className="pb-3 font-medium">Handle</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Platform</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Risk</th>
                <th className="pb-3 font-medium text-right sm:text-left">Date</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {completedScans.slice(0, 10).map((scan) => (
                <tr key={scan.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4">
                    <span className="text-white font-mono">@{scan.handle}</span>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <PlatformBadge platform={scan.platform} />
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      {scan.score !== null ? (
                        <span className={`text-2xl font-bold ${scoreColor(scan.score)}`}>
                          {scan.score}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                      <div className="sm:hidden mt-1">
                        <RiskBadge risk={scan.riskLevel} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <RiskBadge risk={scan.riskLevel} />
                  </td>
                  <td className="py-4 text-gray-400 text-xs text-right sm:text-left">
                    {timeAgo(scan.createdAt)}
                  </td>
                  <td className="py-4 text-right">
                    <Link 
                      href={`/scan/${scan.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium group-hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
