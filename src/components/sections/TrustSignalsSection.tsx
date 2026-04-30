'use client';
// src/components/sections/TrustSignalsSection.tsx
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function TrustSignalsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll('[data-stat]'), {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out',
    });
  }, []);

  const metrics = [
    { label: 'Real-time Data Points', value: '5,000+' },
    { label: 'Average Response Time', value: '<200ms' },
    { label: 'Market Coverage', value: '99.9%' },
    { label: 'Daily Data Updates', value: '2M+' },
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Investment Analyst',
      company: 'Capital Markets Inc',
      quote: 'The responsiveness is unmatched. Crucial for real-time decision making.',
      image: '👨‍💼',
    },
    {
      name: 'Maria Rodriguez',
      role: 'Portfolio Manager',
      company: 'Wealth Advisors Group',
      quote: 'Premium UI makes data exploration intuitive. Our team loves it.',
      image: '👩‍💼',
    },
    {
      name: 'James Park',
      role: 'Fintech CTO',
      company: 'TradeTech Ventures',
      quote: 'Production-ready code. Deployed to 10,000+ users in weeks.',
      image: '👨‍💻',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-6"
      style={{
        background: 'linear-gradient(135deg, rgba(42, 38, 32, 0.8) 0%, rgba(53, 48, 43, 0.6) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Key Metrics */}
        <div className="mb-20">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              Enterprise-Grade Performance
            </h2>
            <p className="text-white/70 text-lg max-w-2xl font-mono">Engineered for investment teams deploying at scale with sub-200ms latency.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <div
                key={idx}
                data-stat
                className="glass-card p-8 rounded-2xl text-center border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-2xl group"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-white bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
                  {metric.value}
                </div>
                <div className="text-white/80 text-xs font-mono font-bold tracking-[0.2em] uppercase">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Professional Grade Intelligence
            </h3>
            <p className="text-white/70 text-lg max-w-2xl font-mono">Trusted by top-tier investment teams worldwide.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="glass-card p-8 rounded-2xl border border-white/10 hover:border-primary/40 transition-all duration-500 hover:scale-[1.03] shadow-2xl bg-dark/40"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl filter drop-shadow-lg">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-white text-base">{testimonial.name}</div>
                    <div className="text-primary font-mono text-xs font-bold uppercase tracking-wider">{testimonial.role}</div>
                    <div className="text-white/50 text-xs">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-white/90 italic text-base leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="inline-block glass-card px-6 py-4 rounded-xl border border-primary/30">
            <p className="text-white/80 text-sm mb-3">Ready to integrate premium market intelligence?</p>
            <button className="px-5 py-2 bg-gradient-to-r from-primary to-accent text-dark font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-sm">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
