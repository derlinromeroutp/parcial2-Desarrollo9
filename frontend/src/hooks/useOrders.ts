import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { ordersService } from '../services/orders.service';

export const useOrders = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['my-orders'],
    enabled: isLoaded && !!isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      return ordersService.getMyOrders(token);
    },
  });
};
