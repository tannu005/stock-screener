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
  dataMode: 'simulated' | 'live';
  viewMode: 'today' | 'yesterday';
  isAuthModalOpen: boolean;
  isExplorerExpanded: boolean;
  user: { name: string; email: string; id?: string; isPro?: boolean } | null;
  token: string | null;

  // Actions
  initialize: () => void;
  setViewMode: (mode: 'today' | 'yesterday') => void;
  setFilters: (filters: Partial<FilterCriteria>) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig) => void;
  selectStock: (stock: Stock | null) => void;
  updateStockPrice: (symbol: string, price: number) => void;
  toggleWatchlist: (symbol: string) => void;
  toggleAlert: (symbol: string) => void;
  applyPreset: (criteria: FilterCriteria) => void;
  setAuthModalOpen: (open: boolean) => void;
  setExplorerExpanded: (open: boolean) => void;
  login: (name: string, email: string, token?: string, isPro?: boolean) => void;
  logout: () => void;
  upgradeToPro: () => void;
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
    dataMode: (process.env.NEXT_PUBLIC_DATA_MODE as any) || 'hybrid',
    viewMode: 'today',
    isAuthModalOpen: false,
    isExplorerExpanded: false,
    user: null,
    token: null,

    initialize: async () => {
      set({ isLoading: true });

      try {
        const res = await fetch(`/api/stocks/load?mode=${get().dataMode}&count=500`);
        if (!res.ok) throw new Error('Failed to fetch stocks');
        const stocks = await res.json();
        
        set({
          allStocks: stocks,
          filteredStocks: sortStocks(stocks, get().sort, get().viewMode),
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading stocks via API:', error);
        // Fallback to simulated data directly on client if API fails
        const simulatedStocks = generateStocks(500);
        set({
          allStocks: simulatedStocks,
          filteredStocks: sortStocks(simulatedStocks, get().sort, get().viewMode),
          isLoading: false,
        });
      }
    },

    setViewMode: (mode) => {
      const sorted = sortStocks(get().filteredStocks, get().sort, mode);
      set({ viewMode: mode, filteredStocks: sorted });
    },

    setFilters: (newFilters) => {
      const start = performance.now();
      const filters = { ...get().filters, ...newFilters };
      const filtered = applyFilters(get().allStocks, filters);
      const sorted = sortStocks(filtered, get().sort, get().viewMode);
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
        filteredStocks: sortStocks(get().allStocks, get().sort, get().viewMode),
        filterCount: get().filterCount + 1,
      });
    },

    setSort: (sort) => {
      const sorted = sortStocks(get().filteredStocks, sort, get().viewMode);
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

        const { allStocks: prevStocks, filters, sort } = get();
        
        // Efficiently update only changed stocks
        const allStocks = prevStocks.map(s => {
          const newPrice = currentBuffer[s.symbol];
          if (newPrice === undefined) return s;

          const change = parseFloat((newPrice - s.prevClose).toFixed(2));
          const changePct = parseFloat(((change / s.prevClose) * 100).toFixed(2));
          return { ...s, price: newPrice, change, changePct, lastUpdated: Date.now() };
        });

        // Only re-filter/sort if there are active filters, otherwise just update ticker
        const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

        const newTickerUpdates: Record<string, { price: number; change: number }> = {};
        Object.entries(currentBuffer).forEach(([sym, p]) => {
          const stock = prevStocks.find(s => s.symbol === sym);
          if (stock) {
            newTickerUpdates[sym] = { price: p, change: p - stock.prevClose };
          }
        });

        if (hasFilters) {
          const filtered = applyFilters(allStocks, filters);
          const sorted = sortStocks(filtered, sort, get().viewMode);
          set(state => ({
            allStocks,
            filteredStocks: sorted,
            tickerUpdates: { ...state.tickerUpdates, ...newTickerUpdates }
          }));
        } else {
          // Skip expensive sort — just update data in place
          set(state => ({
            allStocks,
            filteredStocks: allStocks,
            tickerUpdates: { ...state.tickerUpdates, ...newTickerUpdates }
          }));
        }
      }, 4000);
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
      const sorted = sortStocks(filtered, get().sort, get().viewMode);
      const elapsed = performance.now() - start;
      set({ filters: criteria, filteredStocks: sorted, lastFilterTime: elapsed, filterCount: get().filterCount + 1 });
    },

    setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
    setExplorerExpanded: (open) => set({ isExplorerExpanded: open }),

    login: (name, email, token, isPro) => {
      set({ user: { name, email, isPro: !!isPro }, isAuthModalOpen: false, token: token || null });
      localStorage.setItem('stock_screener_user', JSON.stringify({ name, email, token, isPro: !!isPro }));
    },

    logout: () => {
      set({ user: null, token: null });
      localStorage.removeItem('stock_screener_user');
    },

    upgradeToPro: () => {
      const user = get().user;
      if (user) {
        const updatedUser = { ...user, isPro: true };
        set({ user: updatedUser });
        localStorage.setItem('stock_screener_user', JSON.stringify({ ...updatedUser, token: get().token }));
      }
    },
  }))
);

function sortStocks(stocks: Stock[], sort: SortConfig, viewMode: 'today' | 'yesterday' = 'today'): Stock[] {
  if (!stocks.length) return [];
  const { key, direction } = sort;
  const isAsc = direction === 'asc';

  return [...stocks].sort((a, b) => {
    let aVal: any = a[key];
    let bVal: any = b[key];

    if (viewMode === 'yesterday') {
      if (key === 'price') {
        aVal = a.prevClose;
        bVal = b.prevClose;
      } else if (key === 'changePct' || key === 'change') {
        aVal = a.week52HighPct * -1;
        bVal = b.week52HighPct * -1;
      }
    }

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    return isAsc ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
  });
}

