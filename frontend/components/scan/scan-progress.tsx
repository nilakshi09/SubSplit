'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScan } from '@/hooks/use-scans';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const stepMap: Record<string, number> = {
  fetching_profile: 0,
  fetching_posts: 1,
  analyzing_engagement: 2,
  detecting_spikes: 3,
  analyzing_comments: 4,
  computing_score: 5,
};

const STEPS = [
  "Fetching profile",
  "Fetching posts & comments",
  "Analyzing engagement rate",
  "Detecting follower spikes",
  "Analyzing comments",
  "Computing fraud score"
];

interface ScanProgressProps {
  scanId: string;
  onCancel: () => void;
}

export function ScanProgress({ scanId, onCancel }: ScanProgressProps) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Poll every 2s
  const { data: scan, error } = useScan(scanId, {
    refetchInterval: (data: any) => 
      data?.status === 'completed' || data?.status === 'failed' ? false : 2000,
  });

  useEffect(() => {
    if (scan?.status === 'completed') {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        router.push(`/scan/${scanId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scan?.status, scanId, router]);

  const currentStepIndex = scan?.progress?.step ? stepMap[scan.progress.step] : 0;
  const stepsCompleted = scan?.progress?.stepsCompleted || 0;
  const isFailed = scan?.status === 'failed' || error;
  
  const percentage = Math.min((stepsCompleted / 6) * 100, 100);
  const remainingSeconds = Math.max(0, 30 - stepsCompleted * 5); // Rough estimation

  return (
    <div className="max-w-lg mx-auto w-full pt-10 px-4">
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        {/* Cancel Button */}
        {!isSuccess && !isFailed && (
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle2 className="w-20 h-20 text-white mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">Analysis Complete!</h3>
            <p className="text-indigo-200 mt-2">Redirecting to results...</p>
          </motion.div>
        )}

        {/* Failed State */}
        {isFailed ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analysis failed</h3>
            <p className="text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded-lg inline-block">
              {scan?.errorMessage || error?.message || "An unexpected error occurred"}
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Common reasons: private account, account not found, or temporary API issue
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8 pr-8">
              <h2 className="text-xl font-bold text-white mb-1">
                {scan ? `Analyzing @${scan.handle}` : "Starting analysis..."}
              </h2>
              <p className="text-gray-400 text-sm">This usually takes 15–30 seconds</p>
            </div>

            {/* Steps List */}
            <div className="space-y-4 mb-8">
              {STEPS.map((stepText, index) => {
                const isCompleted = index < currentStepIndex || stepsCompleted > index;
                const isCurrent = index === currentStepIndex && !isCompleted;

                return (
                  <motion.div 
                    key={stepText}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isCompleted ? 'text-green-400' : isCurrent ? 'text-indigo-400' : 'text-gray-500'}`}>
                      {stepText}{isCurrent ? '...' : ''}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-indigo-400">{Math.round(percentage)}%</span>
                {remainingSeconds > 0 && percentage > 0 && percentage < 100 && (
                  <span className="text-gray-500">~{remainingSeconds}s remaining</span>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
