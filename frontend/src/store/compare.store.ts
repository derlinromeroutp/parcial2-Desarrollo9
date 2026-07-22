import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  productIds: string[];
  toggleProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      productIds: [],

      toggleProduct: (productId: string) => set((state) => {
        if (state.productIds.includes(productId)) {
          return { productIds: state.productIds.filter((id) => id !== productId) };
        }
        if (state.productIds.length >= MAX_COMPARE_ITEMS) return state;
        return { productIds: [...state.productIds, productId] };
      }),

      removeProduct: (productId: string) => set((state) => ({
        productIds: state.productIds.filter((id) => id !== productId),
      })),

      clearCompare: () => set({ productIds: [] }),
    }),
    {
      name: 'safetech-compare-storage',
    }
  )
);
