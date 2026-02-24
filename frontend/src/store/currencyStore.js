import create from 'zustand';

export const useCurrencyStore = create((set) => ({
  currency: 'PEN',
  setCurrency: (currency) => set({ currency }),
}));

export default useCurrencyStore;
