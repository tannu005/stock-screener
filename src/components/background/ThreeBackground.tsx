'use client';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ProceduralGrid } from './ProceduralGrid';
import { FinancialWaves } from './FinancialWaves';
import { SentimentParticles } from './SentimentParticles';
import { Float, PerspectiveCamera } from '@react-three/drei';
import { ScrollRig } from './ScrollRig';
import { isWebGLSupported } from '@/lib/utils/webgl';

export default function ThreeBackground() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isWebGLSupported());
  }, []);

  if (!supported) {
    return (
      <div className="three-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(to bottom, #1f1a16, #000000)' }} />
    );
  }

  return (
    <div className="three-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#d4a574" />
        <ScrollRig />
        
        <group>
          <ProceduralGrid />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <FinancialWaves />
          </Float>
          <SentimentParticles />
        </group>
        
        <fog attach="fog" args={['#1f1a16', 5, 35]} />
      </Canvas>
    </div>
  );
}
