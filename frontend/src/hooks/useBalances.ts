import { useBalanceStore } from '../stores/balanceStore';

export function useBalances() {
  return useBalanceStore();
}
