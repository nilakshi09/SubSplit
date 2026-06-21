'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateScan } from '@/hooks/use-create-scan';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function QuickScanInput() {
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createScan, isPending } = useCreateScan();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let cleanHandle = handle.trim();
    if (cleanHandle.startsWith('@')) {
      cleanHandle = cleanHandle.substring(1);
    }

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanHandle)) {
      setError("Invalid handle — use letters, numbers, . and _ only");
      return;
    }

    setError(null);

    createScan(
      { platform: 'instagram', handle: cleanHandle },
      {
        onSuccess: (data) => {
          router.push(`/scan/${data.id}`);
        },
        onError: (err: any) => {
          if (err?.response?.status === 402 || err?.message?.includes('402')) {
            setError("SCAN_LIMIT_REACHED");
          } else {
            toast.error("Failed to create scan. Please try again.");
          }
        }
      }
    );
  };

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 mt-6 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300">
      <h3 className="text-xl font-bold text-white mb-1">Quick Scan</h3>
      <p className="text-gray-400 text-sm mb-4">Enter an Instagram handle to instantly check for fraud</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">@</span>
          </div>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value.replace(/^@/, ''));
              setError(null);
            }}
            disabled={isPending}
            placeholder="username"
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !handle}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-lg disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Scan Now"
          )}
        </button>
      </form>

      {error === "SCAN_LIMIT_REACHED" ? (
        <p className="mt-3 text-amber-400 text-sm">
          Scan limit reached.{' '}
          <Link href="/billing" className="underline hover:text-amber-300">
            Upgrade your plan →
          </Link>
        </p>
      ) : error ? (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      ) : null}
    </div>
  );
}
