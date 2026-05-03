'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let bounds = card.getBoundingClientRect();
    
    const xSetter = gsap.quickSetter(card, "rotateY", "deg");
    const ySetter = gsap.quickSetter(card, "rotateX", "deg");

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const xPercent = (x / bounds.width - 0.5) * 20; // 20 degrees max
      const yPercent = (y / bounds.height - 0.5) * -20;

      gsap.to(card, {
        rotateY: xPercent,
        rotateX: yPercent,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
        overwrite: true
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true
      });
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', onMouseEnter);
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className={className} style={{ transformStyle: 'preserve-3d' }}>
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </div>
  );
}
