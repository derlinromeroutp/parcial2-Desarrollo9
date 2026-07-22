import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { inspectionService } from '../services/inspection.service';
import type { InspectionChecklistItem, InspectionReport } from '../types/inspection';

export const useProductInspection = (productId: string | undefined) => {
  return useQuery<InspectionReport | null, Error>({
    queryKey: ['product', productId, 'inspection'],
    queryFn: () => inspectionService.getByProduct(productId as string),
    enabled: Boolean(productId),
  });
};

export const useUpsertInspection = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, checklist }: { productId: string; checklist: InspectionChecklistItem[] }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return inspectionService.upsert(productId, checklist, token);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['product', variables.productId, 'inspection'] });
    },
  });
};
