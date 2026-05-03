'use client';

import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useScreenerStore } from '@/lib/store/screenerStore';

export default function PricingSection() {
  const { user, upgradeToPro, setAuthModalOpen } = useScreenerStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    // Simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    upgradeToPro();
    setLoading(false);
    setSuccess(true);
  };

  const features = [
    'Real-time Market Data (5,000+ Stocks)',
    'Advanced Technical Indicators',
    'AI-Powered Sentiment Analysis',
    'Custom Alert Notifications',
    'Unlimited Watchlists',
    'Priority Support Access',
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-dark" id="pricing">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6"
          >
            <Star size={16} fill="currentColor" />
            <span>ELITE ACCESS</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Professional Grade <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Intelligence</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-mono">
            Unleash the full power of Stock Screener Pro with our most advanced features.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass-card rounded-[2.5rem] border border-primary/30 p-8 md:p-12 shadow-[0_0_50px_rgba(212,165,116,0.15)] overflow-hidden"
          >
            {/* Pro Badge */}
            <div className="absolute top-8 right-8">
              <div className="bg-primary text-dark font-bold px-4 py-1 rounded-full text-xs tracking-widest uppercase">
                Best Value
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Version</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">₹199</span>
                <span className="text-white/50 font-mono">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check size={14} className="text-primary" />
                  </div>
                  <span className="text-sm font-mono">{feature}</span>
                </div>
              ))}
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 bg-success/10 border border-success/30 rounded-2xl"
              >
                <div className="flex items-center justify-center gap-2 text-success font-bold">
                  <Shield size={20} />
                  <span>Pro Activated!</span>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading || (user?.isPro)}
                className="w-full py-4 bg-primary text-dark font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : user?.isPro ? (
                  <>
                    <Shield size={20} />
                    <span>Already Pro</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe Now</span>
                    <Zap size={20} fill="currentColor" />
                  </>
                )}
              </button>
            )}

            <p className="mt-6 text-center text-[10px] text-white/30 font-mono uppercase tracking-widest">
              Secure Checkout • Cancel Anytime • No Hidden Fees
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
