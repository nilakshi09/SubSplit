'use client';

import { useState, useEffect } from 'react';
import { Camera, Play, X, Zap, Lock } from 'lucide-react';
import { useCreateScan } from '@/hooks/use-create-scan';
import { useToast } from '@/hooks/use-toast';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';

interface ScanFormProps {
  onScanCreated: (scanId: string) => void;
}

export function ScanForm({ onScanCreated }: ScanFormProps) {
  const [handle, setHandle] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const { mutate: createScan, isPending } = useCreateScan();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (handle) {
        const cleanHandle = handle.replace(/^@/, '');
        setIsValid(/^[a-zA-Z0-9._]{1,30}$/.test(cleanHandle));
      } else {
        setIsValid(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [handle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !handle) return;

    setLimitReached(false);
    const cleanHandle = handle.replace(/^@/, '');

    createScan(
      { platform: 'instagram', handle: cleanHandle },
      {
        onSuccess: (data) => {
          onScanCreated(data.id);
        },
        onError: (err: any) => {
          if (err?.response?.status === 402 || err?.message?.includes('402')) {
            setLimitReached(true);
          } else {
            toast.error(err.message || "Failed to create scan. Please try again.");
          }
        }
      }
    );
  };

  return (
    <div className="max-w-lg mx-auto w-full pt-10 px-4">
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
        
        {/* SECTION 1 - Platform Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Platform</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-indigo-500 bg-indigo-500/10 transition-all">
              <Camera className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-white">Instagram</span>
              <span className="text-xs text-indigo-400 mt-1">Active</span>
            </button>
            
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button disabled className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-white/5 bg-white/5 opacity-50 cursor-not-allowed">
                    <Play className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-300">YouTube</span>
                    <span className="text-xs text-gray-500 mt-1">Coming Soon</span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg" sideOffset={5}>
                    YouTube support coming in Phase 5
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>

        {/* Limit Reached Alert */}
        {limitReached && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-sm font-medium">You've reached your monthly scan limit.</p>
            <Link href="/billing" className="text-amber-300 text-sm hover:underline mt-1 inline-block">
              Upgrade your plan to run more scans →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 2 - Handle Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Instagram Handle</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 sm:text-sm">@</span>
              </div>
              <input
                type="text"
                placeholder="username"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setLimitReached(false);
                }}
                disabled={isPending}
                className={`block w-full pl-8 pr-10 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isValid === false ? 'border-red-500/50 focus:border-red-500' : isValid === true ? 'border-green-500/50 focus:border-green-500' : 'border-white/10'}`}
              />
              {handle && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setHandle('')}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {isValid === false && (
              <p className="mt-2 text-sm text-red-400">Handle can only contain letters, numbers, periods, and underscores</p>
            )}
          </div>

          {/* SECTION 3 - Info row */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400 justify-between items-center bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Results in under 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span>Only public data is analyzed</span>
            </div>
          </div>

          {/* SECTION 4 - Submit Button */}
          <button
            type="submit"
            disabled={isPending || !isValid || !handle || limitReached}
            className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Starting analysis...</span>
              </>
            ) : (
              "Analyze Audience"
            )}
          </button>
        </form>

        {/* SECTION 5 - What we analyze */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Accordion.Root type="single" collapsible>
            <Accordion.Item value="what-we-analyze" className="border-none">
              <Accordion.Header>
                <Accordion.Trigger className="flex justify-between items-center w-full text-sm text-gray-400 hover:text-gray-300 transition-colors py-2 group">
                  What does Spotbot analyze?
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300 group-data-[state=open]:rotate-180">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                <ul className="text-sm text-gray-500 space-y-2 mt-3 pl-4 list-disc marker:text-indigo-500">
                  <li>Follower Growth Velocity</li>
                  <li>Engagement Rate Benchmarking</li>
                  <li>Comment Sentiment Analysis</li>
                  <li>Spike Detection</li>
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>

      </div>
    </div>
  );
}
