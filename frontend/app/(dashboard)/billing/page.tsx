'use client'

import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { UsageMeter } from '@/components/dashboard/usage-meter'

export default function BillingPage() {
  const { data: stats } = useDashboardStats()

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-400">Manage your subscription plan and billing details.</p>
      </div>

      <div className="bg-[#1C1C22] border border-white/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Current Plan</h2>
        
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-medium text-lg">
              {stats?.planName || 'Pro Plan'}
            </div>
            <p className="text-sm text-gray-400">
              Active until end of billing period
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-4">Plan Usage</h3>
            <UsageMeter />
          </div>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 text-center space-y-4">
        <h3 className="text-lg font-semibold text-indigo-400">Full billing management coming soon</h3>
        <p className="text-gray-400 max-w-lg mx-auto">
          Stripe integration and detailed billing history will be available in Phase 4. For immediate changes to your subscription, please reach out to our team.
        </p>
        <a 
          href="mailto:support@spotbot.io"
          className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
