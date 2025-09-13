import { useQuery } from '@tanstack/react-query';

interface LoyaltyTier {
  current: string;
  progress: number;
  next: string;
  jewels_to_next: number;
}

interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  reason: string;
  reason_display: string;
  booking_id?: string;
  expires_at?: string;
  created_at: string;
}

interface LoyaltyData {
  current_balance: number;
  active_balance: number;
  total_earned: number;
  total_redeemed: number;
  tier: LoyaltyTier;
  transactions: LoyaltyTransaction[];
  last_updated: string;
}

interface LoyaltyResponse {
  success: boolean;
  data: LoyaltyData;
}

const fetchLoyaltyBalance = async (userId: string): Promise<LoyaltyData> => {
  const response = await fetch(`/api/user/loyalty?user_id=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch loyalty balance');
  }
  
  const result: LoyaltyResponse = await response.json();
  
  if (!result.success) {
    throw new Error('Failed to fetch loyalty data');
  }
  
  return result.data;
};

export const useLoyaltyBalance = (userId: string | null) => {
  return useQuery({
    queryKey: ['loyaltyBalance', userId],
    queryFn: () => fetchLoyaltyBalance(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export type { LoyaltyData, LoyaltyTransaction, LoyaltyTier };






