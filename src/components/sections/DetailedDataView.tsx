'use client';
// src/components/sections/DetailedDataView.tsx
import { useState, useRef, useEffect } from 'react';
import StockTable from '@/components/table/StockTable';
import FilterPanel from '@/components/filters/FilterPanel';
import gsap from 'gsap';

export default function DetailedDataView() {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        <section ref={containerRef} className="relative py-14 px-6 min-h-[400px]">
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
                                {isExpanded ? 'REFINE SEARCH • 5,000+ STOCKS • REAL-TIME DATA' : 'Advanced filtering with 5,000+ stocks and sub-200ms response times'}
                            </p>
                        </div>
                        <div
                            className={`transform transition-all duration-500 text-3xl ${isExpanded ? 'rotate-180 text-primary' : 'rotate-0 text-white/30'}`}
                        >
                            ▼
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
                        {isExpanded && (
                            <>
                                <FilterPanel />
                                <div className="flex-1 h-full glass-card rounded-2xl overflow-hidden border border-white/5">
                                    <StockTable />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
