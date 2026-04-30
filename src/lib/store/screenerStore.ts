import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Stock, FilterCriteria, SortConfig } from '@/types/stock';
import { generateStocks, applyFilters } from '@/lib/data/stockGenerator';
import { fetchMarketData } from '@/lib/data/dataService';

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
  dataMode: 'simulated' | 'live';
  isAuthModalOpen: boolean;
  user: { name: string; email: string; id?: string } | null;
  token: string | null;

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
  setAuthModalOpen: (open: boolean) => void;
  login: (name: string, email: string, token?: string) => void;
  logout: () => void;
}

// Throttling updates to prevent hanging
let updateBuffer: Record<string, number> = {};
let updateTimeout: NodeJS.Timeout | null = null;

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
    dataMode: (process.env.NEXT_PUBLIC_DATA_MODE as any) || 'simulated',
    isAuthModalOpen: false,
    user: null,
    token: null,

    initialize: async () => {
      set({ isLoading: true });

      let stocks: Stock[] = [];
      if (get().dataMode === 'live') {
        stocks = await fetchMarketData();
        if (stocks.length === 0) {
          console.warn('Live data failed, falling back to simulated.');
          stocks = generateStocks(5000);
        }
      } else {
        stocks = generateStocks(5000);
      }

      set({
        allStocks: stocks,
        filteredStocks: sortStocks(stocks, get().sort),
        isLoading: false,
      });
    },

    setFilters: (newFilters) => {
      const start = performance.now();
      const filters = { ...get().filters, ...newFilters };
      const filtered = applyFilters(get().allStocks, filters);
      const sorted = sortStocks(filtered, get().sort);
      const elapsed = performance.now() - start;

      set({
        filters,
        filteredStocks: sorted,
        lastFilterTime: elapsed,
        filterCount: get().filterCount + 1,
      });
    },

    resetFilters: () => {
      set({
        filters: {},
        filteredStocks: sortStocks(get().allStocks, get().sort),
        filterCount: get().filterCount + 1,
      });
    },

    setSort: (sort) => {
      const sorted = sortStocks(get().filteredStocks, sort);
      set({ sort, filteredStocks: sorted });
    },

    selectStock: (stock) => set({ selectedStock: stock }),

    updateStockPrice: (symbol, price) => {
      updateBuffer[symbol] = price;

      if (updateTimeout) return;

      updateTimeout = setTimeout(() => {
        const currentBuffer = { ...updateBuffer };
        updateBuffer = {};
        updateTimeout = null;

        const stockMap = new Map(get().allStocks.map(s => [s.symbol, s]));

        const allStocks = get().allStocks.map(s => {
          const newPrice = currentBuffer[s.symbol];
          if (newPrice === undefined) return s;

          const change = parseFloat((newPrice - s.prevClose).toFixed(2));
          const changePct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
          return { ...s, price: newPrice, change, changePct, lastUpdated: Date.now() };
        });

        const filtered = applyFilters(allStocks, get().filters);
        const sorted = sortStocks(filtered, get().sort);

        const newTickerUpdates: Record<string, { price: number; change: number }> = {};
        Object.entries(currentBuffer).forEach(([sym, p]) => {
          const stock = stockMap.get(sym);
          if (stock) {
            newTickerUpdates[sym] = { price: p, change: p - stock.prevClose };
          }
        });

        set(state => ({
          allStocks,
          filteredStocks: sorted,
          tickerUpdates: {
            ...state.tickerUpdates,
            ...newTickerUpdates
          }
        }));
      }, 500); // Process updates every 500ms to stay smooth
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
      const filtered = applyFilters(get().allStocks, criteria);
      const sorted = sortStocks(filtered, get().sort);
      const elapsed = performance.now() - start;
      set({ filters: criteria, filteredStocks: sorted, lastFilterTime: elapsed, filterCount: get().filterCount + 1 });
    },

    setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

    login: (name, email, token) => {
      set({ user: { name, email }, isAuthModalOpen: false, token: token || null });
      localStorage.setItem('stock_screener_user', JSON.stringify({ name, email, token }));
    },

    logout: () => {
      set({ user: null, token: null });
      localStorage.removeItem('stock_screener_user');
    },
  }))
);

function sortStocks(stocks: Stock[], sort: SortConfig): Stock[] {
  if (!stocks.length) return [];
  const { key, direction } = sort;
  const isAsc = direction === 'asc';

  return [...stocks].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    return isAsc ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
  });
}

