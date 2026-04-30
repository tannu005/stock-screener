'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      const xPercent = (x / width - 0.5) * 20; // 20 degrees max
      const yPercent = (y / height - 0.5) * -20;

      gsap.to(card, {
        rotateY: xPercent,
        rotateX: yPercent,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className={`transition-all duration-300 ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </div>
  );
}
