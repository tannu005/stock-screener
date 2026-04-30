'use client';
// src/components/sections/StockCardGroups.tsx
import { useMemo, useRef, useEffect } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import gsap from 'gsap';
import TiltCard from '@/components/ui/TiltCard';

interface CardGroup {
    title: string;
    description: string;
    stocks: any[];
    color: string;
    icon: string;
    bgColor: string;
}

export default function StockCardGroups() {
    const { filteredStocks } = useScreenerStore();
    const sectionRef = useRef<HTMLDivElement>(null);

    const cardGroups = useMemo((): CardGroup[] => {
        const topGainers = filteredStocks
            .filter(s => s.changePct > 0)
            .sort((a, b) => b.changePct - a.changePct)
            .slice(0, 5);

        const topLosers = filteredStocks
            .filter(s => s.changePct < 0)
            .sort((a, b) => a.changePct - b.changePct)
            .slice(0, 5);

        const mostActive = filteredStocks
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);

        return [
            {
                title: 'Top Gainers',
                description: 'Highest percentage gains today',
                stocks: topGainers,
                color: '#7a9d7a',
                icon: '📈',
                bgColor: 'rgba(122, 157, 122, 0.1)',
            },
            {
                title: 'Top Losers',
                description: 'Largest percentage losses today',
                stocks: topLosers,
                color: '#a87070',
                icon: '📉',
                bgColor: 'rgba(168, 112, 112, 0.1)',
            },
            {
                title: 'Most Active',
                description: 'Highest trading volume',
                stocks: mostActive,
                color: '#c19a6b',
                icon: '⚡',
                bgColor: 'rgba(193, 154, 107, 0.1)',
            },
        ];
    }, [filteredStocks]);

    useEffect(() => {
        if (!sectionRef.current) return;
        gsap.from(sectionRef.current.querySelectorAll('[data-group]'), {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
        });
    }, []);

    return (
        <section ref={sectionRef} className="relative py-14 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Market Highlights</h2>
                    <p className="text-white/50 text-sm">Curated stock groups with real-time filtering and advanced technical analysis</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {cardGroups.map((group, groupIdx) => (
                        <TiltCard key={group.title} className="h-full">
                            <div
                                data-group
                                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all duration-500 group h-full shadow-xl"
                                style={{ background: `linear-gradient(180deg, ${group.bgColor} 0%, rgba(31, 26, 22, 0.9) 100%)` }}
                            >
                            {/* Header */}
                            <div
                                className="p-6 border-b border-white/5"
                                style={{ borderBottomColor: `${group.color}30` }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{group.title}</h3>
                                        <p className="text-white/70 text-sm mt-1">{group.description}</p>
                                    </div>
                                    <span className="text-3xl ml-2 filter drop-shadow-lg">{group.icon}</span>
                                </div>
                            </div>

                            {/* Feature Callout */}
                            <div className="px-6 pt-4 pb-2">
                                <div className="text-xs text-primary/80 font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Real-time intelligence
                                </div>
                            </div>

                            {/* Stocks */}
                            <div className="px-5 py-3 space-y-3">
                                {group.stocks.slice(0, 5).map((stock, idx) => (
                                    <div
                                        key={stock.symbol}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group/item border border-transparent hover:border-white/10"
                                    >
                                        <div className="flex-1">
                                            <div className="font-mono font-bold text-white group-hover/item:text-primary transition-colors text-lg">
                                                {stock.symbol}
                                            </div>
                                            <div className="text-white/80 text-xs mt-0.5 font-mono">${stock.price.toFixed(2)}</div>
                                        </div>
                                        <div
                                            className="font-mono font-bold text-right text-lg"
                                            style={{
                                                color: stock.changePct > 0 ? '#00ff88' : '#ff3366',
                                                textShadow: stock.changePct > 0 ? '0 0 10px rgba(0,255,136,0.2)' : '0 0 10px rgba(255,51,102,0.2)'
                                            }}
                                        >
                                            {stock.changePct > 0 ? '+' : ''}
                                            {stock.changePct.toFixed(2)}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View all link */}
                            <div className="px-6 py-4 border-t border-white/5 mt-auto">
                                <button
                                    className="w-full py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 uppercase tracking-widest border"
                                    style={{
                                        color: '#fff',
                                        borderColor: `${group.color}40`,
                                        background: `${group.color}20`,
                                    }}
                                >
                                    View All {group.title} →
                                </button>
                            </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
