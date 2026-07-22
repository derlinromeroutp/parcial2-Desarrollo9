import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedState {
  productIds: string[];
  recordView: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],

      // Mas reciente primero; si ya estaba en la lista se mueve al frente en
      // vez de duplicarse.
      recordView: (productId: string) => set((state) => ({
        productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(0, MAX_RECENTLY_VIEWED),
      })),
    }),
    {
      name: 'safetech-recently-viewed-storage',
    }
  )
);
