'use client';
// src/components/background/ParticleBackground.tsx
import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScreenerStore } from '@/lib/store/screenerStore';

gsap.registerPlugin(ScrollTrigger);

// ===== SHADER-BASED WAVE SYSTEM =====
function ShaderWaveBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { filteredStocks } = useScreenerStore();

  // Calculate sentiment from stock data
  const sentiment = useMemo(() => {
    if (!filteredStocks.length) return 0.5;
    const gainers = filteredStocks.filter(s => s.changePct > 0).length;
    const losers = filteredStocks.filter(s => s.changePct < 0).length;
    return gainers / Math.max(gainers + losers, 1);
  }, [filteredStocks]);

  // Custom wave shader
  const vertexShader = `
    uniform float uTime;
    uniform float uSentiment;
    varying float vWave;
    varying vec3 vPos;

    void main() {
      vPos = position;
      float wave = sin(position.x * 0.5 + uTime * 0.5) * 0.3;
      wave += sin(position.y * 0.3 + uTime * 0.3) * 0.2;
      wave *= uSentiment; // Sentiment affects wave amplitude
      vWave = wave;
      
      vec3 pos = position;
      pos.z += wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uSentiment;
    varying float vWave;
    varying vec3 vPos;

    void main() {
      // Sentiment-driven color gradient
      vec3 bullColor = vec3(0.48, 0.62, 0.48);   // Muted green for bullish
      vec3 bearColor = vec3(0.66, 0.44, 0.44);   // Muted red for bearish
      vec3 neutralColor = vec3(0.83, 0.64, 0.45); // Beige for neutral
      
      // Blend colors based on sentiment
      vec3 color = mix(bearColor, bullColor, uSentiment);
      color = mix(color, neutralColor, 0.3); // Add warmth
      
      // Wave-based opacity for flow effect
      float opacity = 0.15 + vWave * 0.1;
      opacity *= (0.7 + sin(uTime * 0.5) * 0.2);
      
      gl_FragColor = vec4(color, opacity);
    }
  `;

  const uniforms = useRef({
    uTime: { value: 0.0 },
    uSentiment: { value: sentiment },
  });

  useFrame((state) => {
    if (!meshRef.current) return;
    uniforms.current.uTime.value = state.clock.elapsedTime;
    uniforms.current.uSentiment.value = sentiment;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -25]}>
      <planeGeometry args={[60, 40, 100, 100]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        wireframe={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ===== SENTIMENT-DRIVEN PARTICLE EMITTER =====
function SentimentParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const { filteredStocks } = useScreenerStore();
  const count = 1500;

  const sentiment = useMemo(() => {
    if (!filteredStocks.length) return 0.5;
    const gainers = filteredStocks.filter(s => s.changePct > 0).length;
    const losers = filteredStocks.filter(s => s.changePct < 0).length;
    return gainers / Math.max(gainers + losers, 1);
  }, [filteredStocks]);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 15;

      // Color based on sentiment
      if (sentiment > 0.6) {
        // Bullish: green tones
        colors[i3] = 0.48;
        colors[i3 + 1] = 0.62;
        colors[i3 + 2] = 0.48;
      } else if (sentiment < 0.4) {
        // Bearish: red tones
        colors[i3] = 0.66;
        colors[i3 + 1] = 0.44;
        colors[i3 + 2] = 0.44;
      } else {
        // Neutral: beige
        colors[i3] = 0.83;
        colors[i3 + 1] = 0.64;
        colors[i3 + 2] = 0.45;
      }
    }
    return { positions, colors };
  }, [sentiment]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Drift upward, influenced by sentiment
      array[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + i * 0.01) * 0.005 * sentiment;
      if (array[i3 + 1] > 20) array[i3 + 1] = -20;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ===== SCROLL-TRIGGERED ANIMATION LAYER =====
function ScrollAnimationLayer() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    gsap.registerEffect({
      name: 'scroll3D',
      effect: (targets: any) => {
        return gsap.timeline()
          .to(groupRef.current, {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            duration: 1,
          });
      },
      defaults: { duration: 1 },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.content-section',
        start: 'top center',
        end: 'bottom center',
        scrub: 0.5,
        markers: false,
      },
    });

    tl.to(groupRef.current, {
      rotation: [0, Math.PI * 0.2, 0],
      z: -10,
      duration: 1,
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return <group ref={groupRef} />;
}

// ===== PREMIUM AMBIENT LIGHTING WITH SENTIMENT =====
function SentimentLighting() {
  const { filteredStocks } = useScreenerStore();

  const sentiment = useMemo(() => {
    if (!filteredStocks.length) return 0.5;
    const gainers = filteredStocks.filter(s => s.changePct > 0).length;
    const losers = filteredStocks.filter(s => s.changePct < 0).length;
    return gainers / Math.max(gainers + losers, 1);
  }, [filteredStocks]);

  return (
    <>
      <ambientLight
        intensity={0.25}
        color={new THREE.Color().lerpColors(
          new THREE.Color(0.66, 0.44, 0.44),
          new THREE.Color(0.48, 0.62, 0.48),
          sentiment
        )}
      />
      <directionalLight position={[20, 15, 20]} intensity={0.3} color={0xe8d5c4} />
      <pointLight
        position={[-20, -10, 10]}
        intensity={0.15}
        color={new THREE.Color().lerpColors(
          new THREE.Color(0.66, 0.44, 0.44),
          new THREE.Color(0.48, 0.62, 0.48),
          sentiment
        )}
      />
    </>
  );
}

// ===== OPACITY & BLUR OVERLAY FOR CRISP FOREGROUND =====
function BackgroundOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(42, 38, 32, 0.3) 0%, rgba(42, 38, 32, 0.15) 50%, rgba(42, 38, 32, 0.3) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    />
  );
}

// ===== MAIN CANVAS ===== 
export default function ParticleBackground() {
  return (
    <>
      <div className="three-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 5, 20], fov: 50 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <SentimentLighting />
          <ShaderWaveBackground />
          <SentimentParticles />
          <ScrollAnimationLayer />
          <fog attach="fog" args={[0x2a2620, 10, 60]} />
        </Canvas>
      </div>
      <BackgroundOverlay />
    </>
  );
}
