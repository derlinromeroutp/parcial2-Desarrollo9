import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products.service';

export const useRecentProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['recent-products', limit],
    queryFn: () => productsService.getRecent(limit),
  });
};
