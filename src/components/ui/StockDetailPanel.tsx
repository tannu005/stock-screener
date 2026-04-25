'use client';
// src/components/ui/StockDetailPanel.tsx
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useFormatters } from '@/lib/hooks/useWebSocket';
import { X, TrendingUp, TrendingDown, Star, Bell, ExternalLink } from 'lucide-react';
import CandlestickChart from '@/components/charts/CandlestickChart';

const RATING_COLORS: Record<string, string> = {
  'Strong Buy': '#00ff88',
  'Buy': '#00d4ff',
  'Hold': '#ffd700',
  'Sell': '#ff6b35',
  'Strong Sell': '#ff3366',
};

interface MetricRowProps {
  label: string;
  value: string | null;
  color?: string;
  highlight?: boolean;
}

function MetricRow({ label, value, color, highlight }: MetricRowProps) {
  return (
    <div className={`flex items-center justify-between py-1.5 border-b border-white/3 ${highlight ? 'bg-white/2' : ''}`}>
      <span className="text-xs text-white/40 font-mono">{label}</span>
      <span className="text-xs font-mono font-medium" style={{ color: color || 'rgba(255,255,255,0.8)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function StockDetailPanel() {
  const { selectedStock, selectStock, toggleWatchlist, toggleAlert, watchlist, alerts } = useScreenerStore();
  const { formatPrice, formatMarketCap, formatVolume, formatPct, formatNum } = useFormatters();

  if (!selectedStock) {
    return (
      <div className="w-96 flex-shrink-0 border-l border-white/5 bg-obsidian/90 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4 opacity-20">📊</div>
          <div className="text-white/20 font-mono text-sm">Click a stock to view details</div>
        </div>
      </div>
    );
  }

  const s = selectedStock;
  const isWatchlisted = watchlist.has(s.symbol);
  const hasAlert = alerts.has(s.symbol);
  const changeColor = s.changePct > 0 ? '#00ff88' : s.changePct < 0 ? '#ff3366' : '#ffffff60';

  return (
    <div className="w-96 flex-shrink-0 border-l border-white/5 bg-obsidian/90 backdrop-blur-sm overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-abyss/50 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl tracking-widest text-white">{s.symbol}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-white/10 text-white/40">{s.exchange}</span>
            </div>
            <div className="text-sm text-white/50 font-mono mt-0.5 truncate max-w-[280px]">{s.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(s.symbol)}
              className="transition-colors"
              style={{ color: isWatchlisted ? '#ffd700' : 'rgba(255,255,255,0.2)' }}
            >
              <Star size={16} fill={isWatchlisted ? '#ffd700' : 'none'} />
            </button>
            <button
              onClick={() => toggleAlert(s.symbol)}
              className="transition-colors"
              style={{ color: hasAlert ? '#00d4ff' : 'rgba(255,255,255,0.2)' }}
            >
              <Bell size={16} />
            </button>
            <button onClick={() => selectStock(null)} className="text-white/20 hover:text-white transition-colors ml-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl tracking-widest text-white">{formatPrice(s.price)}</span>
          <div className="flex items-center gap-1" style={{ color: changeColor }}>
            {s.changePct > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-mono font-bold text-sm">{s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(2)}%</span>
            <span className="font-mono text-sm opacity-70">({s.change > 0 ? '+' : ''}{formatPrice(s.change)})</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#00d4ff15', border: '1px solid #00d4ff30', color: '#00d4ff' }}>
            {s.sector}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#8b5cf615', border: '1px solid #8b5cf630', color: '#8b5cf6' }}>
            {s.industry}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ color: RATING_COLORS[s.analystRating], background: `${RATING_COLORS[s.analystRating]}15`, border: `1px solid ${RATING_COLORS[s.analystRating]}40` }}>
            {s.analystRating}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 border-b border-white/5 flex-shrink-0" style={{ height: 280 }}>
        <div className="text-xs font-mono tracking-widest text-white/30 mb-3">90-DAY CHART</div>
        <div style={{ height: 230 }}>
          <CandlestickChart stock={s} />
        </div>
      </div>

      {/* RSI gauge */}
      <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-white/40">RSI (14)</span>
          <span className="text-xs font-mono font-bold" style={{
            color: s.rsi > 70 ? '#ff3366' : s.rsi < 30 ? '#00ff88' : 'rgba(255,255,255,0.7)'
          }}>
            {s.rsi.toFixed(1)} {s.rsi > 70 ? '(Overbought)' : s.rsi < 30 ? '(Oversold)' : ''}
          </span>
        </div>
        <div className="h-2 bg-abyss rounded-full overflow-hidden relative">
          <div className="absolute inset-0 flex">
            <div className="w-[30%] bg-aurora/20 rounded-l-full" />
            <div className="flex-1 bg-white/5" />
            <div className="w-[30%] bg-crimson/20 rounded-r-full" />
          </div>
          <div
            className="absolute top-0 bottom-0 w-2 rounded-full transition-all"
            style={{
              left: `${s.rsi}%`,
              background: s.rsi > 70 ? '#ff3366' : s.rsi < 30 ? '#00ff88' : '#00d4ff',
              boxShadow: `0 0 6px ${s.rsi > 70 ? '#ff3366' : s.rsi < 30 ? '#00ff88' : '#00d4ff'}`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-white/20 mt-1">
          <span>0 Oversold</span>
          <span>Overbought 100</span>
        </div>
      </div>

      {/* Moving Averages */}
      <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="text-xs font-mono tracking-widest text-white/30 mb-2">MOVING AVERAGES</div>
        <div className="space-y-1.5">
          {[
            { label: 'SMA 20', value: s.sma20, color: '#00d4ff' },
            { label: 'SMA 50', value: s.sma50, color: '#ffd700' },
            { label: 'SMA 200', value: s.sma200, color: '#ff6b35' },
          ].map(({ label, value, color }) => {
            const above = s.price > value;
            return (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/40 font-mono">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color }}>{formatPrice(value)}</span>
                  <span className="text-xs font-mono" style={{ color: above ? '#00ff88' : '#ff3366' }}>
                    {above ? '▲' : '▼'} {Math.abs(((s.price - value) / value) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 flex-1">
        <div className="text-xs font-mono tracking-widest text-white/30 mb-3">KEY METRICS</div>
        <div className="space-y-0">
          <MetricRow label="Market Cap" value={formatMarketCap(s.marketCap)} />
          <MetricRow label="Volume" value={formatVolume(s.volume)} />
          <MetricRow label="Avg Volume" value={formatVolume(s.avgVolume)} />
          <MetricRow label="Vol Ratio" value={`${s.volumeRatio.toFixed(2)}x`} color={s.volumeRatio > 2 ? '#ff6b35' : undefined} />
          <MetricRow label="P/E Ratio" value={s.peRatio !== null ? s.peRatio.toFixed(1) : null} />
          <MetricRow label="P/B Ratio" value={s.pbRatio !== null ? s.pbRatio.toFixed(1) : null} />
          <MetricRow label="Beta" value={s.beta.toFixed(2)} />
          <MetricRow label="52W High" value={formatPrice(s.week52High)} />
          <MetricRow label="52W Low" value={formatPrice(s.week52Low)} />
          <MetricRow label="From 52W High" value={formatPct(s.week52HighPct)} color={s.week52HighPct < -20 ? '#ff3366' : undefined} />
          <MetricRow label="Revenue Growth" value={formatPct(s.revenueGrowth)} color={s.revenueGrowth > 20 ? '#00ff88' : undefined} />
          <MetricRow label="Gross Margin" value={formatPct(s.grossMargin)} />
          <MetricRow label="Net Margin" value={formatPct(s.netMargin)} color={s.netMargin > 10 ? '#00ff88' : s.netMargin < 0 ? '#ff3366' : undefined} />
          <MetricRow label="ROE" value={`${s.roe.toFixed(1)}%`} />
          <MetricRow label="Debt/Equity" value={s.debtToEquity.toFixed(2)} color={s.debtToEquity > 2 ? '#ff3366' : undefined} />
          <MetricRow label="Short Float" value={`${s.shortFloat.toFixed(1)}%`} />
          <MetricRow label="Inst. Own." value={`${s.institutionalOwnership.toFixed(1)}%`} />
          {s.dividendYield !== null && (
            <MetricRow label="Dividend Yield" value={`${s.dividendYield.toFixed(2)}%`} color="#ffd700" highlight />
          )}
          {s.priceTarget !== null && (
            <MetricRow
              label="Price Target"
              value={`${formatPrice(s.priceTarget)} (${(s.priceTargetUpside || 0) > 0 ? '+' : ''}${(s.priceTargetUpside || 0).toFixed(1)}%)`}
              color={s.priceTargetUpside && s.priceTargetUpside > 0 ? '#00ff88' : '#ff3366'}
              highlight
            />
          )}
          <MetricRow label="Employees" value={s.employees.toLocaleString()} />
          <MetricRow label="Founded" value={s.founded.toString()} />
          <MetricRow label="Country" value={s.country} />
        </div>
      </div>
    </div>
  );
}
