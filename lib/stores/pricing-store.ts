import { create } from 'zustand';

interface PricingStore {
  isMonthly: boolean;
  setIsMonthly: (isMonthly: boolean) => void;

}

export const usePricing = create<PricingStore>()((set) => ({
  isMonthly: true,
  setIsMonthly: (isMonthly: boolean) => set({ isMonthly }),

}));
