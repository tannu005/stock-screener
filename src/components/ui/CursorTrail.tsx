'use client';
// src/components/ui/CursorTrail.tsx
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });

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
      const now = Date.now();
      
      // Create particle burst every 50ms for smooth but subtle effect
      if (now - lastMouseRef.current.time > 50) {
        lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };

        // Determine color based on mouse position
        const colors = [
          'rgba(212, 165, 116, 0.8)',   // Beige
          'rgba(193, 154, 107, 0.8)',   // Light gold
          'rgba(155, 140, 124, 0.7)',   // Warm brown
        ];
        const colorIndex = Math.floor((e.clientX / window.innerWidth) * colors.length);
        const baseColor = colors[colorIndex] || colors[0];

        // Create 5-8 particles in a burst pattern
        const burstCount = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < burstCount; i++) {
          const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.3;
          const speed = 1 + Math.random() * 2;
          
          particlesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: baseColor,
          });
        }
      }
    };

    const animate = () => {
      // Clear with slight fade
      ctx.fillStyle = 'rgba(31, 26, 22, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= 0.02;
        
        if (p.life <= 0) return false;

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.vx *= 0.98; // Friction

        // Draw particle with glow
        const size = 4 * p.life;
        const opacity = p.life * 0.6;

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, p.color.replace('0.8', (opacity * 0.8).toString()).replace('0.7', (opacity * 0.7).toString()));
        gradient.addColorStop(0.7, p.color.replace('0.8', (opacity * 0.3).toString()).replace('0.7', (opacity * 0.25).toString()));
        gradient.addColorStop(1, 'rgba(212, 165, 116, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('0.8', opacity.toString()).replace('0.7', opacity.toString());
        ctx.fill();

        return true;
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
      }}
    />
  );
}
