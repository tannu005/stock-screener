'use client';
// src/components/ui/TickerTape.tsx
import { useEffect, useRef } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useFormatters } from '@/lib/hooks/useWebSocket';

export default function TickerTape() {
  const { allStocks } = useScreenerStore();
  const { formatPrice } = useFormatters();
  const trackRef = useRef<HTMLDivElement>(null);

  const topMovers = allStocks
    .slice(0, 30)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

  return (
    <div className="flex-shrink-0 bg-obsidian/90 border-b border-white/5 overflow-hidden h-8 flex items-center">
      <div
        ref={trackRef}
        className="flex items-center gap-0 whitespace-nowrap"
        style={{
          animation: 'tickerScroll 60s linear infinite',
        }}
      >
        {[...topMovers, ...topMovers].map((stock, i) => {
          const color = stock.changePct > 0 ? '#00ff88' : '#ff3366';
          return (
            <span key={`${stock.id}-${i}`} className="inline-flex items-center gap-2 px-4 border-r border-white/5">
              <span className="font-mono text-xs font-bold text-white">{stock.symbol}</span>
              <span className="font-mono text-xs" style={{ color }}>{formatPrice(stock.price)}</span>
              <span className="font-mono text-xs" style={{ color }}>
                {stock.changePct > 0 ? '▲' : '▼'}{Math.abs(stock.changePct).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
