import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product';
import type { ProductFilters } from '../services/products.service';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id as string),
    enabled: Boolean(id),
  });
};