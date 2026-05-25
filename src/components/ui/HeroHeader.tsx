'use client';
// src/components/ui/HeroHeader.tsx
import { useEffect, useRef, useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';

export default function HeroHeader() {
  const { filteredStocks, allStocks, lastFilterTime, wsConnected } = useScreenerStore();
  const [time, setTime] = useState('');
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    tickRef.current = setInterval(update, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const gainers = filteredStocks.filter(s => s.changePct > 0).length;
  const losers = filteredStocks.filter(s => s.changePct < 0).length;
  const marketSentiment = gainers > losers ? 'BULLISH' : gainers < losers ? 'BEARISH' : 'NEUTRAL';
  const sentimentColor = gainers > losers ? '#7a9d7a' : gainers < losers ? '#a87070' : '#c19a6b';

  return (
    <header className="relative z-10 border-b border-white/10 bg-gradient-to-b from-slate-900/60 to-obsidian/40 backdrop-blur-xl">
      {/* Top bar with enhanced styling */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-primary font-mono text-xs tracking-widest font-semibold">LIVE</span>
          </div>
          <span className="text-white/40 text-xs font-mono tracking-wide">{time} EST</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono">WS:</span>
            <span className="text-xs font-mono text-primary animate-shimmer">CONNECTED</span>
          </div>
        </div>

        <div className="flex items-center gap-8 text-xs font-mono">
          <StatPill label="UNIVERSE" value={allStocks.length.toLocaleString()} color="#d4a574" />
          <StatPill label="MATCHED" value={filteredStocks.length.toLocaleString()} color="#9b8c7c" />
          <StatPill label="GAINERS" value={gainers.toString()} color="#7a9d7a" />
          <StatPill label="LOSERS" value={losers.toString()} color="#a87070" />
          {lastFilterTime > 0 && (
            <StatPill label="FILTER" value={`${lastFilterTime.toFixed(1)}ms`} color="#c19a6b" />
          )}
        </div>
      </div>

      {/* Main header - Premium styling */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          {/* Logo with glow */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-12 h-12 animate-float">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 blur-lg group-hover:blur-xl transition-all duration-300" />
              <svg viewBox="0 0 40 40" className="w-12 h-12 relative z-10 drop-shadow-lg">
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#d4a574', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#9b8c7c', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="url(#logo-grad)" strokeWidth="1.5" />
                <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke="url(#logo-grad)" strokeWidth="0.8" opacity="0.6" />
                <circle cx="20" cy="20" r="4" fill="url(#logo-grad)" opacity="0.9" />
              </svg>
            </div>
            <div>
              <div className="font-display text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-accent-light bg-clip-text text-transparent drop-shadow-lg">
                  STOCK SCREENER
                </span>
                <span className="text-primary drop-shadow-lg"> PRO</span>
              </div>
              <div className="text-xs text-white/40 font-mono tracking-widest uppercase mt-1">Real-Time Market Intelligence</div>
            </div>
          </div>
        </div>

        {/* Market sentiment with enhanced styling */}
        <div className="flex items-center gap-12">
          <div className="text-center group">
            <div className="text-xs text-white/40 font-mono tracking-widest mb-2 uppercase">Market Sentiment</div>
            <div className="font-display text-3xl font-bold tracking-tight drop-shadow-lg group-hover:drop-shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300" style={{ color: sentimentColor }}>
              {marketSentiment}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/40 font-mono tracking-widest mb-2 uppercase">Advance / Decline</div>
            <div className="flex items-center gap-3 font-mono text-lg">
              <span className="text-success font-bold">{gainers}</span>
              <span className="text-white/20">/</span>
              <span className="text-danger font-bold">{losers}</span>
            </div>
          </div>

          {/* Sentiment bar - Enhanced */}
          <div className="relative w-40 h-10 rounded-lg overflow-hidden border border-white/10 glass-card">
            <div
              className="h-full rounded-lg transition-all duration-1000 relative overflow-hidden"
              style={{
                width: `${(gainers / Math.max(gainers + losers, 1)) * 100}%`,
                background: 'linear-gradient(90deg, #7a9d7a, #d4a574)',
              }}
            >
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }} />
            </div>
            <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ boxShadow: 'inset 0 0 20px rgba(212, 165, 116, 0.1)' }} />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:scale-105 transition-transform duration-300 cursor-default">
      <span className="text-white/35 font-semibold tracking-wide">{label}</span>
      <span className="font-bold tracking-wide" style={{ color, textShadow: `0 0 10px ${color}40` }}>
        {value}
      </span>
    </div>
  );
}
