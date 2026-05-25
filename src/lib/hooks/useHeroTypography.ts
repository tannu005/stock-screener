'use client';

import { MutableRefObject, useEffect } from 'react';
import gsap from 'gsap';

export function useHeroTypography<T extends HTMLElement>(targetRef: MutableRefObject<T | null>) {
    useEffect(() => {
        let isCancelled = false;

        const run = async () => {
            const target = targetRef.current;
            if (!target) return;

            const prefersReducedMotion =
                typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) return;

            const { default: Splitting } = await import('splitting');
            if (isCancelled) return;

            Splitting({ target, by: 'chars' });

            const chars = target.querySelectorAll('.char');
            if (!chars.length) return;

            gsap.fromTo(
                chars,
                { opacity: 0, y: 22, rotateX: -45 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.9,
                    stagger: 0.018,
                    ease: 'power3.out',
                }
            );
        };

        void run();

        return () => {
            isCancelled = true;
        };
    }, [targetRef]);
}
