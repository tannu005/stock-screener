'use client';
import { Canvas } from '@react-three/fiber';
import { ProceduralGrid } from './ProceduralGrid';
import { FinancialWaves } from './FinancialWaves';
import { SentimentParticles } from './SentimentParticles';
import { Float, PerspectiveCamera } from '@react-three/drei';
import { ScrollRig } from './ScrollRig';

export default function ThreeBackground() {
  return (
    <div className="three-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
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
