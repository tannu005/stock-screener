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
  const sentimentColor = gainers > losers ? '#00ff88' : gainers < losers ? '#ff3366' : '#ffd700';

  return (
    <header className="relative z-10 border-b border-white/5 bg-obsidian/80 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-aurora pulse-dot" />
            <span className="text-aurora font-mono text-xs tracking-widest">LIVE</span>
          </div>
          <span className="text-white/30 text-xs font-mono">{time} EST</span>
          <div className="flex items-center gap-1">
            <span className="text-white/30 text-xs font-mono">WS:</span>
            <span className="text-xs font-mono" style={{ color: '#00ff88' }}>CONNECTED</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <StatPill label="UNIVERSE" value={allStocks.length.toLocaleString()} color="#00d4ff" />
          <StatPill label="MATCHED" value={filteredStocks.length.toLocaleString()} color="#8b5cf6" />
          <StatPill label="GAINERS" value={gainers.toString()} color="#00ff88" />
          <StatPill label="LOSERS" value={losers.toString()} color="#ff3366" />
          {lastFilterTime > 0 && (
            <StatPill label="FILTER" value={`${lastFilterTime.toFixed(1)}ms`} color="#ffd700" />
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#00d4ff" strokeWidth="1" />
                <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
                <circle cx="20" cy="20" r="4" fill="#00d4ff" opacity="0.8" />
                <line x1="20" y1="8" x2="20" y2="14" stroke="#00d4ff" strokeWidth="1" />
                <line x1="20" y1="26" x2="20" y2="32" stroke="#00d4ff" strokeWidth="1" />
              </svg>
            </div>
            <div>
              <div className="font-display text-2xl tracking-widest glow-plasma text-white">
                STOCKSCREENER<span style={{ color: '#00d4ff' }}>PRO</span>
              </div>
              <div className="text-xs text-white/30 font-mono tracking-widest">REAL-TIME MARKET INTELLIGENCE</div>
            </div>
          </div>
        </div>

        {/* Market sentiment */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-xs text-white/30 font-mono tracking-widest mb-1">MARKET SENTIMENT</div>
            <div className="font-display text-2xl tracking-widest" style={{ color: sentimentColor }}>
              {marketSentiment}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/30 font-mono tracking-widest mb-1">ADVANCE/DECLINE</div>
            <div className="flex items-center gap-2 font-mono">
              <span style={{ color: '#00ff88' }}>{gainers}</span>
              <span className="text-white/20">/</span>
              <span style={{ color: '#ff3366' }}>{losers}</span>
            </div>
          </div>
          <div className="relative w-32 h-8">
            <div className="absolute inset-0 rounded bg-graphite overflow-hidden">
              <div
                className="h-full rounded transition-all duration-1000"
                style={{
                  width: `${(gainers / Math.max(gainers + losers, 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/30">{label}:</span>
      <span style={{ color }} className="font-bold">{value}</span>
    </div>
  );
}
