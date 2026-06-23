import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useBalances } from '../../hooks/useBalances';
import toast from 'react-hot-toast';

interface SimulateChargeButtonProps {
  subscriptionId: string;
  groupId: string | null;
  onCharged: () => void;
}

export function SimulateChargeButton({ subscriptionId, groupId, onCharged }: SimulateChargeButtonProps) {
  const { simulateCharge } = useBalances();
  const [isCharging, setIsCharging] = useState(false);

  // Only show if subscription has a group assigned
  if (!groupId) return null;

  const handleCharge = async () => {
    setIsCharging(true);
    try {
      await simulateCharge(subscriptionId);
      toast.success(`Charge simulated! Balances updated.`);
      onCharged();
    } catch {
      toast.error('Failed to simulate charge');
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleCharge}
        disabled={isCharging}
        className="flex items-center gap-1.5 bg-[#F7F7F5] border border-[#E2E8F0] text-[#718096] text-xs px-3 py-1 rounded-lg hover:bg-[#F1F5F4] hover:text-[#718096] hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
      >
        {isCharging ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span>⚡</span>
        )}
        Simulate Charge
      </button>
      <span className="text-[#718096] text-[10px] mt-0.5 ml-0.5">Dev only — removes in production</span>
    </div>
  );
}
