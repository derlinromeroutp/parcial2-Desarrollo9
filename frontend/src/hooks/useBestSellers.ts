import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products.service';

export const useBestSellers = (limit = 4) => {
  return useQuery({
    queryKey: ['best-sellers', limit],
    queryFn: () => productsService.getBestSellers(limit),
  });
};
