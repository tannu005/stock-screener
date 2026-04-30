'use client';
// src/components/sections/HeroSection.tsx
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useHeroTypography } from '@/lib/hooks/useHeroTypography';
import PageTransition from '@/components/ui/PageTransition';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
    const titleRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<HTMLDivElement>(null);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const { setAuthModalOpen, user } = useScreenerStore();
    const router = useRouter();

    useHeroTypography(titleRef);

    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.3 });

        tl.from(titleRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
        })
            .from(
                subtitleRef.current,
                {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: 'power2.out',
                },
                '-=0.4'
            )
            .from(
                ctaRef.current,
                {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.6,
                    ease: 'back.out',
                },
                '-=0.3'
            );

        const handleMouseMove = (event: MouseEvent) => {
            if (!layerRef.current) return;
            const xOffset = (event.clientX / window.innerWidth - 0.5) * 14;
            const yOffset = (event.clientY / window.innerHeight - 0.5) * 10;

            gsap.to(layerRef.current, {
                x: xOffset,
                y: yOffset,
                duration: 0.45,
                ease: 'power3.out',
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDemoOpen(false);
            }
        };

        if (isDemoOpen) {
            window.addEventListener('keydown', onKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isDemoOpen]);

    return (
        <PageTransition>
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <svg className="hero-mask-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <defs>
                            <radialGradient id="heroGlow" cx="50%" cy="40%" r="70%">
                                <stop offset="0%" stopColor="rgba(212,165,116,0.85)" />
                                <stop offset="55%" stopColor="rgba(193,154,107,0.4)" />
                                <stop offset="100%" stopColor="rgba(42,38,32,0)" />
                            </radialGradient>
                            <mask id="heroTextMask">
                                <rect width="1200" height="600" fill="black" />
                                <text x="50%" y="52%" textAnchor="middle" fontSize="170" fontWeight="800" fill="white" letterSpacing="12">
                                    SCREEN
                                </text>
                            </mask>
                        </defs>
                        <rect width="1200" height="600" fill="url(#heroGlow)" mask="url(#heroTextMask)" />
                    </svg>
                </div>

                <div ref={layerRef} className="absolute inset-0 pointer-events-none">
                    <div className="hero-depth-orb hero-depth-orb-a" />
                    <div className="hero-depth-orb hero-depth-orb-b" />
                </div>

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark pointer-events-none" />

                <div className="relative z-10 max-w-4xl text-center">
                    {/* Main Title */}
                    <div ref={titleRef} data-splitting className="mb-6 hero-title-wrap">
                        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-3 hero-title-perspective">
                            <span className="bg-gradient-to-r from-primary via-accent to-accent-light bg-clip-text text-transparent drop-shadow-lg">
                                STOCK SCREENER
                            </span>
                            <br />
                            <span className="text-primary drop-shadow-lg">PRO</span>
                        </h1>
                    </div>

                    {/* Subtitle with metrics */}
                    <p
                        ref={subtitleRef}
                        className="text-lg md:text-xl text-white/90 font-light tracking-wide mb-1 font-mono"
                    >
                        5,000 stocks • Real-time intelligence • Sub‑200ms filters
                    </p>

                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent mx-auto mb-6 rounded-full" />

                    <p className="text-base text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Experience market intelligence at cinematic speed. Advanced filtering, sentiment analysis, and live market data
                        designed for professionals who move fast.
                    </p>

                    {/* CTA Section */}
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            aria-label="Explore live stock data"
                            onClick={() => user ? router.push('/dashboard') : setAuthModalOpen(true)}
                            className="px-10 py-4 bg-primary text-dark font-bold rounded-lg hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 transform hover:scale-105"
                        >
                            {user ? 'Go to Dashboard' : 'Explore Live Data'}
                        </button>
                        <button
                            aria-label="Open interactive product walkthrough"
                            onClick={() => setIsDemoOpen(true)}
                            className="px-10 py-4 border-2 border-primary text-primary bg-primary/5 rounded-lg hover:bg-primary/20 transition-all duration-300 font-bold shadow-lg"
                        >
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-primary text-xs font-mono font-bold tracking-widest uppercase">Scroll to explore</p>
                        <svg
                            className="w-6 h-6 text-primary animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>

                {isDemoOpen && (
                    <div
                        className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md px-4 py-6 flex items-center justify-center"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Interactive product walkthrough"
                    >
                        <div className="relative w-full max-w-5xl rounded-2xl border border-primary/30 bg-dark-light/90 shadow-2xl hero-modal-3d">
                            <button
                                className="absolute right-4 top-4 z-10 px-3 py-1 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                                aria-label="Close walkthrough modal"
                                onClick={() => setIsDemoOpen(false)}
                            >
                                Close
                            </button>
                            <iframe
                                title="Stock Screener Pro Walkthrough"
                                src="https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=1"
                                className="w-full h-[65vh] rounded-2xl"
                                allow="autoplay; encrypted-media; picture-in-picture"
                            />
                        </div>
                    </div>
                )}
            </section>
        </PageTransition>
    );
}
