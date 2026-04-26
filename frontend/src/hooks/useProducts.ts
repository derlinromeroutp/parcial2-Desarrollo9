import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product';

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id as string),
    enabled: Boolean(id),
  });
};