'use client';
// src/app/page.tsx
import { useEffect, useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useWebSocketSimulation } from '@/lib/hooks/useWebSocket';
import dynamic from 'next/dynamic';
import HeroHeader from '@/components/ui/HeroHeader';
import FilterPanel from '@/components/filters/FilterPanel';
import StockTable from '@/components/table/StockTable';
import StockDetailPanel from '@/components/ui/StockDetailPanel';
import TickerTape from '@/components/ui/TickerTape';
import LoadingScreen from '@/components/ui/LoadingScreen';

const ParticleBackground = dynamic(() => import('@/components/background/ParticleBackground'), { ssr: false });
const CursorTrail = dynamic(() => import('@/components/ui/CursorTrail'), { ssr: false });

function AppContent() {
  useWebSocketSimulation();
  return null;
}

export default function HomePage() {
  const { initialize, isLoading, allStocks } = useScreenerStore();
  const [loadProgress, setLoadProgress] = useState(0);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    initialize();

    // Simulate progress
    const steps = [
      { pct: 20, delay: 100 },
      { pct: 50, delay: 400 },
      { pct: 75, delay: 700 },
      { pct: 90, delay: 900 },
    ];

    steps.forEach(({ pct, delay }) => {
      setTimeout(() => setLoadProgress(pct), delay);
    });
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && allStocks.length > 0) {
      setLoadProgress(100);
      setTimeout(() => setShowApp(true), 600);
    }
  }, [isLoading, allStocks.length]);

  return (
    <>
      <CursorTrail />
      <ParticleBackground />

      {!showApp && <LoadingScreen progress={loadProgress} />}

      {showApp && (
        <>
          <AppContent />
          <div
            className="fixed inset-0 flex flex-col z-10"
            style={{ opacity: showApp ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            {/* Scan line overlay */}
            <div className="scan-line" />

            <HeroHeader />
            <TickerTape />

            {/* Main layout */}
            <div className="flex flex-1 overflow-hidden">
              <FilterPanel />

              <div className="flex-1 flex flex-col overflow-hidden">
                <StockTable />
              </div>

              <StockDetailPanel />
            </div>
          </div>
        </>
      )}
    </>
  );
}
