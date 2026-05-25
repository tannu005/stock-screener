'use client';
// src/components/sections/DetailedDataView.tsx
import { useState, useRef, useEffect } from 'react';
import StockTable from '@/components/table/StockTable';
import FilterPanel from '@/components/filters/FilterPanel';
import gsap from 'gsap';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { Download, History, Activity } from 'lucide-react';

export default function DetailedDataView() {
    const isExpanded = useScreenerStore((state) => state.isExplorerExpanded);
    const setIsExpanded = useScreenerStore((state) => state.setExplorerExpanded);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const filteredStocks = useScreenerStore((state) => state.filteredStocks);
    const viewMode = useScreenerStore((state) => state.viewMode);
    const setViewMode = useScreenerStore((state) => state.setViewMode);

    const exportToCSV = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent expanding/collapsing when clicking export
        if (!filteredStocks.length) return;
        
        const headers = ['Symbol,Price,Change,ChangePct,Volume,MarketCap,Sector'];
        const csvData = filteredStocks.map(stock => 
            `${stock.symbol},${stock.price},${stock.change},${stock.changePct},${stock.volume},${stock.marketCap},${stock.sector || ''}`
        );
        const csvContent = [...headers, ...csvData].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'screener_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (!contentRef.current) return;

        gsap.to(contentRef.current, {
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
            duration: 0.4,
            ease: 'power2.inOut',
        });

        // Handle pointer events separately
        contentRef.current.style.pointerEvents = isExpanded ? 'auto' : 'none';
    }, [isExpanded]);

    return (
        <section id="full-data-explorer" ref={containerRef} className="relative py-14 px-6 min-h-[400px]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center gap-3 px-6 py-5 glass-card rounded-2xl border transition-all duration-500 w-full group shadow-2xl ${isExpanded ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30'}`}
                    >
                        <div className="flex-1 text-left">
                            <h2 className={`text-2xl sm:text-3xl font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-white'}`}>
                                Full Data Explorer
                            </h2>
                            <p className="text-white/60 text-sm mt-1 font-mono">
                                {isExpanded ? 'REFINE SEARCH • 500+ STOCKS • REAL-TIME DATA' : 'Advanced filtering with 500+ stocks and sub-200ms response times'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isExpanded && (
                                <button
                                    onClick={exportToCSV}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-mono text-xs uppercase tracking-widest transition-all hover:border-primary/50"
                                >
                                    <Download size={14} />
                                    Export CSV
                                </button>
                            )}
                            {isExpanded && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewMode(viewMode === 'today' ? 'yesterday' : 'today');
                                    }}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-mono text-xs uppercase tracking-widest transition-all hover:border-primary/50"
                                    style={{ borderColor: viewMode === 'yesterday' ? '#ffd700' : '' }}
                                >
                                    {viewMode === 'today' ? <><History size={14} /> Yesterday</> : <><Activity size={14} color="#ffd700" /> Live</>}
                                </button>
                            )}
                            <div
                                className={`transform transition-all duration-500 text-3xl ${isExpanded ? 'rotate-180 text-primary' : 'rotate-0 text-white/30'}`}
                            >
                                ▼
                            </div>
                        </div>
                    </button>
                </div>

                {/* Expandable Content */}
                <div
                    ref={contentRef}
                    className="overflow-hidden transition-all duration-500"
                    style={{ 
                        maxHeight: isExpanded ? '2000px' : '0', 
                        opacity: isExpanded ? 1 : 0,
                        visibility: isExpanded ? 'visible' : 'hidden'
                    }}
                >
                    <div className="flex flex-col lg:flex-row gap-6 pt-6 h-[800px]">
                        <FilterPanel />
                        <div className="flex-1 h-full glass-card rounded-2xl flex flex-col overflow-hidden border border-white/5">
                            <StockTable />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
