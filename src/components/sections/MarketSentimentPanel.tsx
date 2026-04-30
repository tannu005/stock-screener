'use client';
// src/components/sections/MarketSentimentPanel.tsx
import { useMemo, memo, useEffect, useRef } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import gsap from 'gsap';

const MarketSentimentPanel = memo(() => {
    const filteredStocks = useScreenerStore(state => state.filteredStocks);
    const sectionRef = useRef<HTMLDivElement>(null);

    const stats = useMemo(() => {
        const total = filteredStocks.length;
        if (total === 0) return { gainers: 0, losers: 0, unchanged: 0, avgChange: 0, sentiment: 'NEUTRAL', gainersPercent: 50 };

        let gainers = 0;
        let losers = 0;
        let sumChange = 0;

        for (let i = 0; i < total; i++) {
            const s = filteredStocks[i];
            if (s.changePct > 0) gainers++;
            else if (s.changePct < 0) losers++;
            sumChange += s.changePct;
        }

        const unchanged = total - gainers - losers;
        const avgChange = sumChange / total;
        const sentiment = gainers > losers ? 'BULLISH' : gainers < losers ? 'BEARISH' : 'NEUTRAL';

        return {
            gainers,
            losers,
            unchanged,
            avgChange,
            sentiment,
            gainersPercent: (gainers / Math.max(gainers + losers, 1)) * 100,
        };
    }, [filteredStocks]);

    useEffect(() => {
        if (!sectionRef.current) return;
        gsap.from(sectionRef.current.querySelectorAll('[data-card]'), {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
        });
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-14 px-6 backdrop-blur-md"
            style={{
                background: 'linear-gradient(135deg, rgba(31, 26, 22, 0.9) 0%, rgba(42, 38, 32, 0.8) 100%)',
                zIndex: 10,
            }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Market Sentiment Analysis</h2>
                    <p className="text-white/50 text-sm">Real-time advance/decline ratio tracking sentiment shifts across 5,000 stocks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Sentiment Indicator */}
                    <div data-card className="glass-card p-5 rounded-xl group hover:scale-105 transition-transform duration-300 border border-white/8">
                        <div className="text-white/60 text-xs font-mono tracking-widest mb-2">SENTIMENT</div>
                        <div
                            className="text-3xl font-bold mb-1"
                            style={{
                                color:
                                    stats.sentiment === 'BULLISH'
                                        ? '#7a9d7a'
                                        : stats.sentiment === 'BEARISH'
                                            ? '#a87070'
                                            : '#c19a6b',
                            }}
                        >
                            {stats.sentiment}
                        </div>
                        <div className="text-white/40 text-xs mb-2">
                            {stats.avgChange > 0 ? '+' : ''}
                            {stats.avgChange.toFixed(2)}% avg change
                        </div>
                        <div className="text-white/30 text-xs leading-relaxed">Tracks bullish vs bearish momentum</div>
                    </div>

                    {/* Gainers */}
                    <div data-card className="glass-card p-5 rounded-xl group hover:scale-105 transition-transform duration-300 border border-success/20">
                        <div className="text-success text-xs font-mono tracking-widest mb-2">GAINERS</div>
                        <div className="text-3xl font-bold text-success mb-1">{stats.gainers}</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-success to-success/70"
                                style={{ width: `${stats.gainersPercent}%` }}
                            />
                        </div>
                        <div className="text-white/30 text-xs">Stocks with positive momentum</div>
                    </div>

                    {/* Losers */}
                    <div data-card className="glass-card p-5 rounded-xl group hover:scale-105 transition-transform duration-300 border border-danger/20">
                        <div className="text-danger text-xs font-mono tracking-widest mb-2">LOSERS</div>
                        <div className="text-3xl font-bold text-danger mb-1">{stats.losers}</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-danger to-danger/70"
                                style={{ width: `${100 - stats.gainersPercent}%` }}
                            />
                        </div>
                        <div className="text-white/30 text-xs">Stocks experiencing declines</div>
                    </div>

                    {/* Unchanged */}
                    <div data-card className="glass-card p-5 rounded-xl group hover:scale-105 transition-transform duration-300 border border-warning/20">
                        <div className="text-warning text-xs font-mono tracking-widest mb-2">UNCHANGED</div>
                        <div className="text-3xl font-bold text-warning mb-1">{stats.unchanged}</div>
                        <div className="text-white/40 text-xs mb-2">
                            {((stats.unchanged / Math.max(filteredStocks.length, 1)) * 100).toFixed(1)}% of market
                        </div>
                        <div className="text-white/30 text-xs">Flat or neutral price action</div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default MarketSentimentPanel;
