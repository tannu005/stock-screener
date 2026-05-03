// src/lib/hooks/useWebSocket.ts
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';

export function useWebSocketSimulation() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stocksRef = useRef(useScreenerStore.getState().allStocks);

  // Keep ref in sync without causing re-renders
  useEffect(() => {
    const unsub = useScreenerStore.subscribe(
      (state) => { stocksRef.current = state.allStocks; }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const updateStockPrice = useScreenerStore.getState().updateStockPrice;

    intervalRef.current = setInterval(() => {
      const stocks = stocksRef.current;
      if (!stocks.length) return;

      // Update only 2-4 stocks every 3 seconds — gentle on the CPU
      const count = Math.floor(Math.random() * 3) + 2;
      const indices = new Set<number>();
      while (indices.size < count) {
        indices.add(Math.floor(Math.random() * stocks.length));
      }

      indices.forEach(idx => {
        const stock = stocks[idx];
        if (!stock) return;
        const volatility = 0.002 + Math.random() * 0.005;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const newPrice = parseFloat((stock.price * (1 + direction * volatility)).toFixed(2));
        updateStockPrice(stock.symbol, Math.max(0.01, newPrice));
      });
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}

export function useFormatters() {
  const formatPrice = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const formatMarketCap = (v: number) => {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    return `$${v.toFixed(0)}`;
  };

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toString();
  };

  const formatPct = (v: number | null) => (v === null ? 'N/A' : `${v > 0 ? '+' : ''}${v.toFixed(2)}%`);
  const formatNum = (v: number | null, dec = 2) => (v === null ? 'N/A' : v.toFixed(dec));

  return { formatPrice, formatMarketCap, formatVolume, formatPct, formatNum };
}
