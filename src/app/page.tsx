'use client';
// src/app/page.tsx
import { useEffect, useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useWebSocketSimulation } from '@/lib/hooks/useWebSocket';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';
import HeroSection from '@/components/sections/HeroSection';
import MarketSentimentPanel from '@/components/sections/MarketSentimentPanel';
import TopMoversSection from '@/components/sections/TopMoversSection';
import StockCardGroups from '@/components/sections/StockCardGroups';
import DetailedDataView from '@/components/sections/DetailedDataView';
import PricingSection from '@/components/sections/PricingSection';
import TrustSignalsSection from '@/components/sections/TrustSignalsSection';
import FloatingNavbar from '@/components/ui/FloatingNavbar';
import ThreeChartSection from '@/components/sections/ThreeChartSection';

const ThreeBackground = dynamic(() => import('@/components/background/ThreeBackground'), { ssr: false });
const MagneticCursor = dynamic(() => import('@/components/ui/MagneticCursor'), { ssr: false });

function AppContent() {
  useWebSocketSimulation();
  return null;
}

export default function HomePage() {
  const { initialize, isLoading, allStocks, user, setAuthModalOpen } = useScreenerStore();
  const [loadProgress, setLoadProgress] = useState(0);
  const [showApp, setShowApp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('stock_screener_user');
    if (savedUser && !user) {
      try {
        const parsed = JSON.parse(savedUser);
        useScreenerStore.getState().login(parsed.name, parsed.email, parsed.token, parsed.isPro);
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
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
      <FloatingNavbar />
      <MagneticCursor />
      <ThreeBackground />

      {!showApp && <LoadingScreen progress={loadProgress} />}

      {showApp && (
        <>
          <AppContent />
          <div
            className="relative w-full overflow-y-auto overflow-x-hidden z-10"
            style={{ opacity: showApp ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            {/* Scan line overlay */}
            <div className="scan-line" />

            {/* Progressive Disclosure Layout */}
            <section className="content-section" data-cursor-theme="finance">
              <HeroSection />
            </section>

            <section className="content-section" data-cursor-theme="finance">
              <MarketSentimentPanel />
            </section>

            <section className="content-section" data-cursor-theme="finance">
              <TopMoversSection />
            </section>

            <section className="content-section" data-cursor-theme="portfolio">
              <StockCardGroups />
            </section>

            <section className="content-section" data-cursor-theme="portfolio">
              <ThreeChartSection />
            </section>

            <section className="content-section" data-cursor-theme="portfolio">
              <DetailedDataView />
            </section>

            <section className="content-section" data-cursor-theme="finance">
              <PricingSection />
            </section>

            <section className="content-section" data-cursor-theme="portfolio">
              <TrustSignalsSection />
            </section>

            {/* How It Works Section */}
            <section className="relative py-20 px-6 bg-gradient-to-b from-dark-light to-dark" data-cursor-theme="portfolio">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
                  <p className="text-white/70 text-lg font-mono">From data ingestion to cinematic visualization—engineered for speed.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Step 1 */}
                  <div className="glass-card p-8 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-xl group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">01</div>
                      <div className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🔄</div>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-3">Live Ingestion</h3>
                    <p className="text-white/60 text-sm leading-relaxed font-mono">Real-time market feeds from 5,000+ stocks with sub-200ms latency.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="glass-card p-8 rounded-2xl border border-accent/20 hover:border-accent/50 transition-all duration-500 shadow-xl group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">02</div>
                      <div className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🎛️</div>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-3">Algorithmic Filters</h3>
                    <p className="text-white/60 text-sm leading-relaxed font-mono">Intelligent filtering with real-time sentiment analysis and technical indicators.</p>
                  </div>

                  {/* Step 3 */}
                  <div className="glass-card p-8 rounded-2xl border border-success/20 hover:border-success/50 transition-all duration-500 shadow-xl group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-success to-white bg-clip-text text-transparent">03</div>
                      <div className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform">✨</div>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-3">3D Analytics</h3>
                    <p className="text-white/60 text-sm leading-relaxed font-mono">GSAP animations and Three.js effects for high-fidelity data visualization.</p>
                  </div>

                  {/* Step 4 */}
                  <div className="glass-card p-8 rounded-2xl border border-warning/20 hover:border-warning/50 transition-all duration-500 shadow-xl group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-warning to-white bg-clip-text text-transparent">04</div>
                      <div className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform">🚀</div>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-3">Enterprise Scale</h3>
                    <p className="text-white/60 text-sm leading-relaxed font-mono">Production-ready Next.js architecture deployed with 99.9% uptime.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <section className="relative py-24 px-6 bg-gradient-to-b from-dark to-dark-light" data-cursor-theme="finance">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                  Ready to experience market intelligence?
                </h2>
                <p className="text-white/70 text-lg mb-10 font-mono">
                  Join 10,000+ professionals using Stock Screener Pro for real-time decision making.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => user ? router.push('/dashboard') : setAuthModalOpen(true)}
                    className="px-10 py-4 bg-primary text-dark font-bold rounded-xl hover:bg-accent hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                  >
                    {user ? 'Enter Dashboard' : 'Get Started Today'}
                  </button>
                  <button className="px-10 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all transform hover:scale-105 active:scale-95">
                    Contact Enterprise
                  </button>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
