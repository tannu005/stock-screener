'use client';
// src/components/ui/CursorTrail.tsx
import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; opacity: number; size: number; color: string }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const colorRef = useRef<string>('rgba(0, 212, 255, 0.8)');

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

      // Vary color based on mouse position for premium effect
      const colors = [
        'rgba(212, 165, 116, 0.7)',  // Primary beige
        'rgba(155, 140, 124, 0.7)',  // Warm brown
        'rgba(193, 154, 107, 0.6)',  // Light gold
      ];
      const colorIndex = Math.floor((e.clientX / window.innerWidth) * colors.length);
      colorRef.current = colors[colorIndex] || colors[0];

      // Add multiple trail points for smoother effect
      for (let i = 0; i < 2; i++) {
        trailRef.current.push({
          x: e.clientX,
          y: e.clientY,
          opacity: 1 - (i * 0.3),
          size: 3 + Math.random() * 3,
          color: colorRef.current,
        });
      }

      if (trailRef.current.length > 80) {
        trailRef.current.shift();
      }
    };

    const animate = () => {
      // Clear with fade effect for smoother trails
      ctx.fillStyle = 'rgba(31, 26, 22, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      trailRef.current.forEach((point, i) => {
        const progress = i / trailRef.current.length;
        const size = point.size * progress;
        const opacity = point.opacity * progress * 0.8;

        // Create premium glowing effect
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 4);
        gradient.addColorStop(0, point.color.replace('0.7', (opacity * 0.9).toString()).replace('0.5', (opacity * 0.7).toString()));
        gradient.addColorStop(0.5, point.color.replace('0.7', (opacity * 0.4).toString()).replace('0.5', (opacity * 0.3).toString()));
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add outer glow
        ctx.strokeStyle = point.color.replace('0.7', (opacity * 0.3).toString()).replace('0.5', (opacity * 0.15).toString());
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 5, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Fade trail
      trailRef.current = trailRef.current
        .map(p => ({ ...p, opacity: p.opacity * 0.92 }))
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
