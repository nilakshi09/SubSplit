import { BarChart2, Shield, AlertTriangle } from 'lucide-react';
import { scoreColor } from '@/lib/format';
import { motion } from 'framer-motion';

// Using inline types as Phase B types are assumed available
interface DashboardStatsData {
  totalScans: number;
  avgFraudScore: number;
  highRiskCount: number;
}

interface DashboardStatsProps {
  stats?: DashboardStatsData;
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Scans",
      subtitle: "All time",
      value: stats.totalScans.toString(),
      icon: BarChart2,
      valueColor: "text-white"
    },
    {
      title: "Avg Fraud Score",
      subtitle: "Across completed scans",
      value: stats.avgFraudScore.toFixed(1),
      icon: Shield,
      valueColor: scoreColor(stats.avgFraudScore)
    },
    {
      title: "High Risk Flagged",
      subtitle: "Suspicious accounts",
      value: stats.highRiskCount.toString(),
      icon: AlertTriangle,
      valueColor: stats.highRiskCount > 0 ? 'text-red-400' : 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-gray-400 font-medium text-sm">{card.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${card.valueColor}`}>
              {card.value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
