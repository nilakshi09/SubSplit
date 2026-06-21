'use client';

import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useScans } from '@/hooks/use-scans';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { QuickScanInput } from '@/components/dashboard/quick-scan-input';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentScans, isLoading: scansLoading } = useScans({
    limit: 10,
    status: 'completed',
  });

  const planName = user?.plan || 'free';
  
  const getBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'starter': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pro': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'enterprise': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(planName)} capitalize`}>
            {planName} Plan
          </div>
        </div>
        <Link 
          href="/scan"
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          Run New Scan →
        </Link>
      </motion.div>

      <DashboardStats stats={stats} isLoading={statsLoading} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <UsageMeter 
          scansUsed={stats?.scansUsed || 0} 
          scanLimit={stats?.scanLimit || 100} 
          planName={planName} 
          isLoading={statsLoading} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <QuickScanInput />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <RecentScansTable scans={recentScans} isLoading={scansLoading} />
      </motion.div>
    </motion.div>
  );
}
