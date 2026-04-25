'use client';
// src/components/ui/CursorTrail.tsx
import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; opacity: number; size: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        size: 4 + Math.random() * 4,
      });
      if (trailRef.current.length > 40) {
        trailRef.current.shift();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailRef.current.forEach((point, i) => {
        const progress = i / trailRef.current.length;
        const size = point.size * progress;
        const opacity = point.opacity * progress * 0.6;

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 3);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Fade trail
      trailRef.current = trailRef.current
        .map(p => ({ ...p, opacity: p.opacity * 0.95 }))
        .filter(p => p.opacity > 0.01);

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        mixBlendMode: 'screen',
      }}
    />
  );
}
