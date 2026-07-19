import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { priceAlertService } from '../services/priceAlert.service';
import type { PriceAlert } from '../types/priceAlert';

export const usePriceAlerts = () => {
  const { getToken } = useAuth();
  return useQuery<PriceAlert[], Error>({
    queryKey: ['price-alerts'],
    queryFn: async () => {
      const token = await getToken();
      return priceAlertService.getMyPriceAlerts(token!);
    },
  });
};

export const useCreatePriceAlert = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const token = await getToken();
      return priceAlertService.createPriceAlert(productId, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });
};

export const useDeactivatePriceAlert = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return priceAlertService.deactivatePriceAlert(id, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });
};
