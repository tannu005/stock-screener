'use client';
// src/components/charts/MiniChart.tsx
import { useMemo } from 'react';
import { CandleData } from '@/types/stock';

interface MiniChartProps {
  data: CandleData[];
  positive: boolean;
  width?: number;
  height?: number;
}

export default function MiniChart({ data, positive, width = 90, height = 32 }: MiniChartProps) {
  const path = useMemo(() => {
    if (!data.length) return '';
    const prices = data.map(d => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    return prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [data, width, height]);

  const areaPath = path ? `${path} L ${width} ${height} L 0 ${height} Z` : '';
  const color = positive ? '#00ff88' : '#ff3366';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {areaPath && (
        <path d={areaPath} fill={`url(#grad-${positive})`} />
      )}
      {path && (
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
