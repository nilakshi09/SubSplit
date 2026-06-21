import { Progress } from '@radix-ui/react-progress';
import Link from 'next/link';

interface UsageMeterProps {
  scansUsed: number;
  scanLimit: number;
  planName: string;
  isLoading: boolean;
}

export function UsageMeter({ scansUsed, scanLimit, planName, isLoading }: UsageMeterProps) {
  if (isLoading) {
    return <div className="h-28 bg-white/5 animate-pulse rounded-xl border border-white/10" />;
  }

  const percentage = Math.min((scansUsed / scanLimit) * 100, 100);
  const remaining = scanLimit - scansUsed;
  
  let fillColor = 'bg-green-500';
  let StatusMessage = () => <p className="text-gray-400 text-sm mt-3">You have {remaining} scans remaining this month</p>;

  if (percentage >= 80) {
    fillColor = 'bg-red-500';
    StatusMessage = () => (
      <p className="text-sm mt-3 flex items-center justify-between">
        <span className="text-red-400">
          {remaining === 0 ? "Scan limit reached." : "🚨 Almost at your limit!"}
        </span>
        <Link href="/billing" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          {remaining === 0 ? "Upgrade to run more scans →" : "Upgrade Plan →"}
        </Link>
      </p>
    );
  } else if (percentage >= 60) {
    fillColor = 'bg-amber-500';
    StatusMessage = () => <p className="text-amber-400 text-sm mt-3">⚠️ Running low — {remaining} scans remaining</p>;
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-300 font-medium">Scans used this month</h3>
        <span className="text-white font-bold">{scansUsed} / {scanLimit}</span>
      </div>
      
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div 
          className={`h-full ${fillColor} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <StatusMessage />

      {planName === 'free' && remaining > 0 && percentage < 80 && (
        <p className="text-sm mt-3 text-gray-400">
          You are on the free plan.{' '}
          <Link href="/billing" className="text-indigo-400 hover:text-indigo-300">
            Upgrade for more scans →
          </Link>
        </p>
      )}
    </div>
  );
}
