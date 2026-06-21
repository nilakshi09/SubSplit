import { useSubscriptionStore } from '../stores/subscriptionStore';

export function useSubscriptions() {
  return useSubscriptionStore();
}
