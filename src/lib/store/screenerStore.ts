// src/lib/store/screenerStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Stock, FilterCriteria, SortConfig } from '@/types/stock';
import { generateStocks, applyFilters } from '@/lib/data/stockGenerator';

interface ScreenerState {
  allStocks: Stock[];
  filteredStocks: Stock[];
  selectedStock: Stock | null;
  filters: FilterCriteria;
  sort: SortConfig;
  isLoading: boolean;
  lastFilterTime: number;
  filterCount: number;
  wsConnected: boolean;
  tickerUpdates: Record<string, { price: number; change: number }>;
  watchlist: Set<string>;
  alerts: Set<string>;

  // Actions
  initialize: () => void;
  setFilters: (filters: Partial<FilterCriteria>) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig) => void;
  selectStock: (stock: Stock | null) => void;
  updateStockPrice: (symbol: string, price: number) => void;
  toggleWatchlist: (symbol: string) => void;
  toggleAlert: (symbol: string) => void;
  applyPreset: (criteria: FilterCriteria) => void;
}

export const useScreenerStore = create<ScreenerState>()(
  subscribeWithSelector((set, get) => ({
    allStocks: [],
    filteredStocks: [],
    selectedStock: null,
    filters: {},
    sort: { key: 'marketCap', direction: 'desc' },
    isLoading: true,
    lastFilterTime: 0,
    filterCount: 0,
    wsConnected: false,
    tickerUpdates: {},
    watchlist: new Set(),
    alerts: new Set(),

    initialize: () => {
      set({ isLoading: true });
      // Use setTimeout to avoid blocking UI
      setTimeout(() => {
        const stocks = generateStocks(5000);
        set({
          allStocks: stocks,
          filteredStocks: stocks,
          isLoading: false,
        });
      }, 100);
    },

    setFilters: (newFilters) => {
      const start = performance.now();
      const filters = { ...get().filters, ...newFilters };
      const allStocks = get().allStocks;
      const sort = get().sort;

      const filtered = applyFilters(allStocks, filters);
      const sorted = sortStocks(filtered, sort);
      const elapsed = performance.now() - start;

      set({
        filters,
        filteredStocks: sorted,
        lastFilterTime: elapsed,
        filterCount: get().filterCount + 1,
      });
    },

    resetFilters: () => {
      const allStocks = get().allStocks;
      const sort = get().sort;
      set({
        filters: {},
        filteredStocks: sortStocks(allStocks, sort),
        filterCount: get().filterCount + 1,
      });
    },

    setSort: (sort) => {
      const sorted = sortStocks(get().filteredStocks, sort);
      set({ sort, filteredStocks: sorted });
    },

    selectStock: (stock) => set({ selectedStock: stock }),

    updateStockPrice: (symbol, price) => {
      const allStocks = get().allStocks.map(s => {
        if (s.symbol !== symbol) return s;
        const change = parseFloat((price - s.prevClose).toFixed(2));
        const changePct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
        return { ...s, price, change, changePct, lastUpdated: Date.now() };
      });

      const filtered = applyFilters(allStocks, get().filters);
      const sorted = sortStocks(filtered, get().sort);

      set(state => ({
        allStocks,
        filteredStocks: sorted,
        tickerUpdates: {
          ...state.tickerUpdates,
          [symbol]: { price, change: price - get().allStocks.find(s => s.symbol === symbol)!.prevClose },
        },
      }));
    },

    toggleWatchlist: (symbol) => {
      const watchlist = new Set(get().watchlist);
      if (watchlist.has(symbol)) watchlist.delete(symbol);
      else watchlist.add(symbol);
      set({ watchlist });
    },

    toggleAlert: (symbol) => {
      const alerts = new Set(get().alerts);
      if (alerts.has(symbol)) alerts.delete(symbol);
      else alerts.add(symbol);
      set({ alerts });
    },

    applyPreset: (criteria) => {
      const start = performance.now();
      const allStocks = get().allStocks;
      const sort = get().sort;
      const filtered = applyFilters(allStocks, criteria);
      const sorted = sortStocks(filtered, sort);
      const elapsed = performance.now() - start;
      set({ filters: criteria, filteredStocks: sorted, lastFilterTime: elapsed, filterCount: get().filterCount + 1 });
    },
  }))
);

function sortStocks(stocks: Stock[], sort: SortConfig): Stock[] {
  return [...stocks].sort((a, b) => {
    const aVal = a[sort.key];
    const bVal = b[sort.key];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}
