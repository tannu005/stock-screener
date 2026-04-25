// src/lib/hooks/useWebSocket.ts
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';

export function useWebSocketSimulation() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { allStocks, updateStockPrice } = useScreenerStore();

  const startSimulation = useCallback(() => {
    if (!allStocks.length) return;

    intervalRef.current = setInterval(() => {
      // Update 20 random stocks every 500ms
      const count = Math.floor(Math.random() * 20) + 10;
      const indices = new Set<number>();
      while (indices.size < count) {
        indices.add(Math.floor(Math.random() * allStocks.length));
      }

      indices.forEach(idx => {
        const stock = allStocks[idx];
        if (!stock) return;
        const volatility = 0.002 + Math.random() * 0.008;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const newPrice = parseFloat((stock.price * (1 + direction * volatility)).toFixed(2));
        updateStockPrice(stock.symbol, Math.max(0.01, newPrice));
      });
    }, 500);
  }, [allStocks, updateStockPrice]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (allStocks.length > 0) {
      startSimulation();
    }
    return () => stopSimulation();
  }, [allStocks.length, startSimulation, stopSimulation]);

  return { startSimulation, stopSimulation };
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
