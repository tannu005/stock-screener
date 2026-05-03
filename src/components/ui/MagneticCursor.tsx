'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // High-performance setters
    const xCursorSetter = gsap.quickSetter(cursor, "x", "px");
    const yCursorSetter = gsap.quickSetter(cursor, "y", "px");
    const xFollowerSetter = gsap.quickSetter(follower, "x", "px");
    const yFollowerSetter = gsap.quickSetter(follower, "y", "px");

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      xCursorSetter(mouseX);
      yCursorSetter(mouseY);
    };

    // Smooth follower animation using a simple lerp for maximum performance
    const updateFollower = () => {
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      followerX += (mouseX - followerX) * dt;
      followerY += (mouseY - followerY) * dt;
      
      xFollowerSetter(followerX);
      yFollowerSetter(followerY);
    };

    window.addEventListener('mousemove', onMouseMove);
    gsap.ticker.add(updateFollower);

    const magneticElements = document.querySelectorAll('.magnetic');
    const magneticHandlers = Array.from(magneticElements).map((el) => {
      const onMove = (e: any) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        
        gsap.to(el, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true
        });
        
        gsap.to(cursor, { scale: 1.5, duration: 0.2 });
      };

      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
          overwrite: true
        });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      
      return { el, onMove, onLeave };
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      gsap.ticker.remove(updateFollower);
      magneticHandlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-primary rounded-full pointer-events-none z-[9998] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
}
