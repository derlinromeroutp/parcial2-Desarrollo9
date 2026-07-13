import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { wishlistService } from '../services/wishlist.service';
import type { WishlistItem } from '../types/wishlist';

export const useWishlist = () => {
  const { getToken } = useAuth();
  return useQuery<WishlistItem[], Error>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const token = await getToken();
      return wishlistService.getMyWishlist(token!);
    },
  });
};

export const useWishlistCheck = (productId: string | undefined) => {
  const { getToken } = useAuth();
  return useQuery<boolean, Error>({
    queryKey: ['wishlist', 'check', productId],
    queryFn: async () => {
      const token = await getToken();
      return wishlistService.checkItem(productId!, token!);
    },
    enabled: Boolean(productId),
  });
};

export const useAddToWishlist = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const token = await getToken();
      return wishlistService.addToWishlist(productId, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const token = await getToken();
      return wishlistService.removeFromWishlist(productId, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useUpdateWishlistNote = () => {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, note }: { productId: string; note: string }) => {
      const token = await getToken();
      return wishlistService.updateNote(productId, note, token!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};
