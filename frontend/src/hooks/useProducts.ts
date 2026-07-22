import { useQuery } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product';
import type { PaginatedProducts, ProductFilters } from '../services/products.service';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
  });
};

export const useProductsPaginated = (filters?: ProductFilters) => {
  return useQuery<PaginatedProducts, Error>({
    queryKey: ['products', 'paginated', filters],
    queryFn: () => productsService.getAllPaginated(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id as string),
    enabled: Boolean(id),
  });
};

export const useProductsCompare = (ids: string[]) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', 'compare', ids],
    queryFn: () => productsService.compare(ids),
    enabled: ids.length >= 2,
  });
};

export const useRelatedProducts = (id: string | undefined) => {
  return useQuery<Product[], Error>({
    queryKey: ['product', id, 'related'],
    queryFn: () => productsService.getRelated(id as string),
    enabled: Boolean(id),
  });
};