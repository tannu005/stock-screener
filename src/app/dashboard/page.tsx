'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScreenerStore } from '@/lib/store/screenerStore';
import FloatingNavbar from '@/components/ui/FloatingNavbar';
import DetailedDataView from '@/components/sections/DetailedDataView';
import MarketSentimentPanel from '@/components/sections/MarketSentimentPanel';
import TopMoversSection from '@/components/sections/TopMoversSection';
import { Shield, TrendingUp, Briefcase, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, initialize } = useScreenerStore();
  const router = useRouter();

  useEffect(() => {
    if (!user && !localStorage.getItem('stock_screener_user')) {
      router.push('/');
    }
    initialize();
  }, [user, router, initialize]);

  if (!user && typeof window !== 'undefined' && !localStorage.getItem('stock_screener_user')) {
    return null;
  }

  return (
    <main className="min-h-screen bg-dark text-white selection:bg-primary selection:text-dark overflow-x-hidden">
      <FloatingNavbar />

      {/* Dashboard Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-dark-light to-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Welcome back, <span className="text-primary">{user?.name || 'Trader'}</span>
              </h1>
              <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Premium Trading Terminal Active</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="glass-card px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono font-bold text-white/70">LIVE MARKET DATA</span>
              </div>
              <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                <Bell size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h3 className="font-bold text-lg">Portfolio Value</h3>
              </div>
              <div className="text-3xl font-mono font-bold">$124,592.40</div>
              <div className="text-success text-xs mt-2 font-bold">+12.4% (+$15,320.00)</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-accent/20 hover:border-accent/40 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <h3 className="font-bold text-lg">Active Positions</h3>
              </div>
              <div className="text-3xl font-mono font-bold">12</div>
              <div className="text-white/40 text-xs mt-2 font-bold">7 Gainers • 5 Losers</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-warning/20 hover:border-warning/40 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-warning/10 rounded-xl text-warning group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <h3 className="font-bold text-lg">Risk Level</h3>
              </div>
              <div className="text-3xl font-mono font-bold">MODERATE</div>
              <div className="text-white/40 text-xs mt-2 font-bold">Safe Haven Protocol Enabled</div>
            </div>
          </div>
        </div>
      </section>

      <MarketSentimentPanel />

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Live Market Explorer</h2>
            <p className="text-white/40 text-sm">Advanced algorithmic filtering across 5,000+ instruments</p>
          </div>
          <DetailedDataView />
        </div>
      </section>

      <TopMoversSection />

      <footer className="py-12 border-t border-white/5 bg-dark-light">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/20 text-xs font-mono uppercase tracking-[0.2em]">
          Stock Screener Pro • Enterprise Intelligence Terminal • © 2026
        </div>
      </footer>
    </main>
  );
}
