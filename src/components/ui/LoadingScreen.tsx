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
    <div className="fixed inset-0 z-50 bg-void flex items-center justify-center" style={{ background: '#020306' }}>
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px #00d4ff)' }}>
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="#00d4ff" strokeWidth="1.5" />
            <polygon points="40,16 64,29 64,51 40,64 16,51 16,29" fill="none" stroke="#00d4ff" strokeWidth="0.8" opacity="0.5" />
            <circle cx="40" cy="40" r="8" fill="none" stroke="#00d4ff" strokeWidth="1.5" />
            <circle cx="40" cy="40" r="3" fill="#00d4ff" />
            <line x1="40" y1="16" x2="40" y2="29" stroke="#00d4ff" strokeWidth="1.5" />
            <line x1="40" y1="51" x2="40" y2="64" stroke="#00d4ff" strokeWidth="1.5" />
            <line x1="64" y1="29" x2="56" y2="34" stroke="#00d4ff" strokeWidth="1.5" />
            <line x1="24" y1="46" x2="16" y2="51" stroke="#00d4ff" strokeWidth="1.5" />
          </svg>
          <div
            className="font-display text-4xl tracking-widest text-white mb-1"
            style={{ fontFamily: 'Bebas Neue, serif', letterSpacing: '0.2em' }}
          >
            STOCKSCREENER<span style={{ color: '#00d4ff' }}>PRO</span>
          </div>
          <div className="text-xs font-mono tracking-widest" style={{ color: 'rgba(0,212,255,0.5)' }}>
            REAL-TIME MARKET INTELLIGENCE SYSTEM
          </div>
        </div>

        {/* Progress */}
        <div className="w-64 mx-auto">
          <div className="h-0.5 bg-white/5 rounded-full mb-3">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
                boxShadow: '0 0 12px #00d4ff',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-white/30">
            <span>Generating 5,000 stocks{dots}</span>
            <span style={{ color: '#00d4ff' }}>{progress}%</span>
          </div>
        </div>

        {/* Status messages */}
        <div className="mt-6 space-y-1.5">
          {[
            { label: 'Seeding market data engine', done: progress > 20 },
            { label: 'Computing technical indicators', done: progress > 50 },
            { label: 'Calibrating filter engine', done: progress > 70 },
            { label: 'Initializing WebSocket layer', done: progress > 90 },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2 justify-center">
              <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
                {done && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff88' }} />}
              </div>
              <span className="text-xs font-mono" style={{ color: done ? 'rgba(0,255,136,0.7)' : 'rgba(255,255,255,0.2)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
