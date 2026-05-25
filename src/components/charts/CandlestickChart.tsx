'use client';
// src/components/charts/CandlestickChart.tsx
import { useEffect, useRef, useState } from 'react';
import { Stock, CandleData } from '@/types/stock';

interface CandlestickChartProps {
  stock: Stock;
}

type Indicator = 'SMA20' | 'SMA50' | 'SMA200' | 'Bollinger' | 'Volume';

function computeSMA(data: CandleData[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, d) => s + d.close, 0) / period;
  });
}

function computeBollinger(data: CandleData[], period = 20): { upper: (number | null)[]; lower: (number | null)[] } {
  const sma = computeSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  data.forEach((_, i) => {
    if (i < period - 1) { upper.push(null); lower.push(null); return; }
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i]!;
    const variance = slice.reduce((s, d) => s + Math.pow(d.close - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper.push(mean + 2 * std);
    lower.push(mean - 2 * std);
  });

  return { upper, lower };
}

export default function CandlestickChart({ stock }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set(['SMA20', 'SMA50', 'Volume']));
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const data = stock.candleData.slice(-90);

  const toggleIndicator = (ind: Indicator) => {
    setActiveIndicators(prev => {
      const next = new Set(prev);
      if (next.has(ind)) next.delete(ind);
      else next.add(ind);
      return next;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padding = { top: 20, right: 20, bottom: activeIndicators.has('Volume') ? 80 : 30, left: 60 };
    const chartH = H - padding.top - padding.bottom;
    const chartW = W - padding.left - padding.right;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Compute indicators
    const sma20 = computeSMA(data, 20);
    const sma50 = computeSMA(data, 50);
    const sma200 = computeSMA(data, Math.min(200, data.length));
    const bollinger = computeBollinger(data);

    // Price range
    const prices = data.flatMap(d => [d.high, d.low]);
    if (activeIndicators.has('Bollinger')) {
      bollinger.upper.forEach(v => v && prices.push(v));
      bollinger.lower.forEach(v => v && prices.push(v));
    }
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);
    const priceRange = priceMax - priceMin || 1;

    const toX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
    const toY = (p: number) => padding.top + chartH - ((p - priceMin) / priceRange) * chartH;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      const price = priceMax - (i / 4) * priceRange;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 6, y + 4);
    }

    // Bollinger Bands
    if (activeIndicators.has('Bollinger')) {
      ctx.strokeStyle = 'rgba(139,92,246,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      const drawLine = (values: (number | null)[]) => {
        let started = false;
        values.forEach((v, i) => {
          if (v === null) { started = false; return; }
          if (!started) { ctx.beginPath(); ctx.moveTo(toX(i), toY(v)); started = true; }
          else ctx.lineTo(toX(i), toY(v));
        });
        ctx.stroke();
      };
      drawLine(bollinger.upper);
      drawLine(bollinger.lower);
      ctx.setLineDash([]);

      // Fill
      ctx.beginPath();
      bollinger.upper.forEach((v, i) => {
        if (v !== null) {
          if (i === 0 || bollinger.upper[i - 1] === null) ctx.moveTo(toX(i), toY(v));
          else ctx.lineTo(toX(i), toY(v));
        }
      });
      bollinger.lower.slice().reverse().forEach((v, i) => {
        const origI = bollinger.lower.length - 1 - i;
        if (v !== null) ctx.lineTo(toX(origI), toY(v));
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(139,92,246,0.05)';
      ctx.fill();
    }

    // SMA lines
    const drawSMA = (values: (number | null)[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      let started = false;
      values.forEach((v, i) => {
        if (v === null) { started = false; return; }
        if (!started) { ctx.beginPath(); ctx.moveTo(toX(i), toY(v)); started = true; }
        else ctx.lineTo(toX(i), toY(v));
      });
      ctx.stroke();
    };

    if (activeIndicators.has('SMA20')) drawSMA(sma20, 'rgba(0,212,255,0.7)');
    if (activeIndicators.has('SMA50')) drawSMA(sma50, 'rgba(255,215,0,0.7)');
    if (activeIndicators.has('SMA200')) drawSMA(sma200, 'rgba(255,107,53,0.7)');

    // Candlesticks
    const candleW = Math.max(2, (chartW / data.length) * 0.7);
    data.forEach((candle, i) => {
      const x = toX(i);
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#00ff88' : '#ff3366';

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(candle.high));
      ctx.lineTo(x, toY(candle.low));
      ctx.stroke();

      ctx.fillStyle = isGreen ? 'rgba(0,255,136,0.8)' : 'rgba(255,51,102,0.8)';
      const bodyY = Math.min(toY(candle.open), toY(candle.close));
      const bodyH = Math.max(1, Math.abs(toY(candle.open) - toY(candle.close)));
      ctx.fillRect(x - candleW / 2, bodyY, candleW, bodyH);
    });

    // Volume bars
    if (activeIndicators.has('Volume')) {
      const volH = 60;
      const volY = H - padding.bottom + 10;
      const maxVol = Math.max(...data.map(d => d.volume));

      data.forEach((candle, i) => {
        const x = toX(i);
        const isGreen = candle.close >= candle.open;
        const h = (candle.volume / maxVol) * volH;
        ctx.fillStyle = isGreen ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,102,0.3)';
        ctx.fillRect(x - candleW / 2, volY + volH - h, candleW, h);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '9px "Space Mono"';
      ctx.textAlign = 'left';
      ctx.fillText('VOLUME', padding.left, volY + 10);
    }
  }, [data, activeIndicators]);

  const indicators: { key: Indicator; label: string; color: string }[] = [
    { key: 'SMA20', label: 'SMA 20', color: '#00d4ff' },
    { key: 'SMA50', label: 'SMA 50', color: '#ffd700' },
    { key: 'SMA200', label: 'SMA 200', color: '#ff6b35' },
    { key: 'Bollinger', label: 'BOLL', color: '#8b5cf6' },
    { key: 'Volume', label: 'VOL', color: '#ffffff60' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Indicator toggles */}
      <div className="flex items-center gap-2 mb-3">
        {indicators.map(ind => (
          <button
            key={ind.key}
            onClick={() => toggleIndicator(ind.key)}
            className="px-2.5 py-1 rounded text-xs font-mono transition-all"
            style={{
              background: activeIndicators.has(ind.key) ? `${ind.color}20` : 'rgba(10,16,32,0.8)',
              border: `1px solid ${activeIndicators.has(ind.key) ? ind.color : 'rgba(255,255,255,0.1)'}`,
              color: activeIndicators.has(ind.key) ? ind.color : 'rgba(255,255,255,0.3)',
            }}
          >
            {ind.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} className="rounded-lg" />
      </div>
    </div>
  );
}
