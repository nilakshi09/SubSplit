import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#F7F7F5] flex flex-col items-center justify-center z-50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#4ADE80] rounded-xl flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#2D3748]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold text-[#2D3748] tracking-tight">
          SubSplit
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#4ADE80] border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-[#718096]">Loading...</p>
      </div>
    </motion.div>
  );
}
