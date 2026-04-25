'use client';
// src/components/ui/LoadingScreen.tsx
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress: number;
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f1535 100%)' }}>
      {/* Animated grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'fadeInUp 1s ease-out',
        }}
      />

      {/* Radial glow animations */}
      <div
        className="absolute animate-soft-glow"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div
        className="absolute"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'softGlow 3s ease-in-out infinite 0.5s',
        }}
      />

      <div className="relative z-10 text-center animate-fade-in-up">
        {/* Premium Logo */}
        <div className="mb-12">
          <div className="relative w-24 h-24 mx-auto mb-6 animate-float">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-plasma/20 to-violet/20 blur-2xl" />
            <svg viewBox="0 0 80 80" className="w-24 h-24 relative z-10 drop-shadow-2xl">
              <defs>
                <linearGradient id="load-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="url(#load-grad)" strokeWidth="1.5" />
              <polygon points="40,16 64,29 64,51 40,64 16,51 16,29" fill="none" stroke="url(#load-grad)" strokeWidth="0.8" opacity="0.6" />
              <circle cx="40" cy="40" r="8" fill="none" stroke="url(#load-grad)" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="3" fill="url(#load-grad)" />
            </svg>
          </div>

          <div className="font-display text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-plasma via-violet to-aurora bg-clip-text text-transparent drop-shadow-lg">
              STOCK SCREENER
            </span>
            <span className="text-plasma drop-shadow-lg"> PRO</span>
          </div>

          <div className="text-sm font-mono tracking-widest text-white/40">
            REAL-TIME MARKET INTELLIGENCE SYSTEM
          </div>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-80 mx-auto mb-8">
          <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #00ff88)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.8), inset 0 0 10px rgba(255,255,255,0.2)',
              }}
            >
              <div className="absolute inset-0 animate-shimmer opacity-60" style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }} />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-white/40 tracking-wide">
            <span className="hover:text-white/60 transition-colors duration-300">Initializing system{dots}</span>
            <span className="text-plasma font-semibold drop-shadow-lg">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Premium Status Messages */}
        <div className="mt-8 space-y-3">
          {[
            { label: 'Seeding market data engine', done: progress > 20, icon: '◆' },
            { label: 'Computing technical indicators', done: progress > 50, icon: '◆' },
            { label: 'Calibrating filter engine', done: progress > 70, icon: '◆' },
            { label: 'Initializing WebSocket layer', done: progress > 90, icon: '◆' },
          ].map(({ label, done, icon }) => (
            <div key={label} className="flex items-center gap-3 justify-center group">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${done ? 'bg-aurora scale-125 shadow-lg shadow-aurora/50' : 'bg-white/20'}`}>
              </div>
              <span className={`text-xs font-mono tracking-wide transition-all duration-500 ${done ? 'text-aurora font-semibold drop-shadow-lg' : 'text-white/30'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
