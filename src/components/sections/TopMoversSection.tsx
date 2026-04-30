'use client';
// src/components/sections/TopMoversSection.tsx
import { useMemo, useRef, useEffect } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import gsap from 'gsap';

interface TopMover {
    symbol: string;
    price: number;
    changePct: number;
    volume: number;
    type: 'gainer' | 'loser';
}

export default function TopMoversSection() {
    const { filteredStocks } = useScreenerStore();
    const sectionRef = useRef<HTMLDivElement>(null);

    const topMovers = useMemo(() => {
        const gainers = filteredStocks
            .filter(s => s.changePct > 0)
            .sort((a, b) => b.changePct - a.changePct)
            .slice(0, 3)
            .map(s => ({ ...s, type: 'gainer' as const }));

        const losers = filteredStocks
            .filter(s => s.changePct < 0)
            .sort((a, b) => a.changePct - b.changePct)
            .slice(0, 3)
            .map(s => ({ ...s, type: 'loser' as const }));

        return [...gainers, ...losers];
    }, [filteredStocks]);

    useEffect(() => {
        if (!sectionRef.current || !topMovers.length) return;
        
        const movers = sectionRef.current.querySelectorAll('[data-mover]');
        if (!movers.length) return;

        gsap.set(movers, { opacity: 0, y: 20 });
        gsap.to(movers, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'expo.out',
            delay: 0.2
        });
    }, [topMovers.length]);

    return (
        <section
            ref={sectionRef}
            className="relative py-14 px-6"
            style={{
                background: 'linear-gradient(135deg, rgba(31, 26, 22, 0.85) 0%, rgba(42, 38, 32, 0.95) 100%)',
                zIndex: 10,
            }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Top Movers</h2>
                    <p className="text-white/50 text-sm">6 stocks with highest volatility by percentage gain/loss</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {topMovers.map((stock, idx) => (
                        <div
                            key={stock.symbol}
                            data-mover
                            className="glass-card p-5 rounded-xl group hover:scale-105 transition-all duration-300 cursor-pointer border border-white/10 hover:border-primary/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-bold text-primary truncate">{stock.symbol}</span>
                                <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full ${stock.type === 'gainer'
                                        ? 'bg-success/20 text-success'
                                        : 'bg-danger/20 text-danger'
                                        }`}
                                >
                                    {stock.type === 'gainer' ? '📈' : '📉'}
                                </span>
                            </div>

                            <div className="mb-2">
                                <div className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</div>
                            </div>

                            <div
                                className={`text-lg font-bold mb-3 ${stock.type === 'gainer' ? 'text-success' : 'text-danger'
                                    }`}
                            >
                                {stock.type === 'gainer' ? '+' : ''}
                                {stock.changePct.toFixed(2)}%
                            </div>

                            <div className="text-white/50 text-xs font-mono">
                                Vol: {(stock.volume / 1e6).toFixed(1)}M
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
