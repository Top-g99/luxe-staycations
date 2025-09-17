import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RedeemJewelsRequest {
  user_id: string;
  jewels_to_redeem: number;
}

interface RedeemJewelsResponse {
  success: boolean;
  discount_amount: number;
  message: string;
  jewels_redeemed: number;
}

const redeemJewels = async (request: RedeemJewelsRequest): Promise<RedeemJewelsResponse> => {
  const response = await fetch('/api/loyalty/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to redeem jewels');
  }

  return response.json();
};

export const useRedeemJewels = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemJewels,
    onSuccess: (data, variables) => {
      // Invalidate loyalty balance query to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ['loyaltyBalance', variables.user_id],
      });
      
      // Show success notification
      console.log(`Successfully redeemed ${data.jewels_redeemed} jewels for ₹${data.discount_amount} discount`);
    },
    onError: (error) => {
      console.error('Failed to redeem jewels:', error);
    },
  });
};

export type { RedeemJewelsRequest, RedeemJewelsResponse };






