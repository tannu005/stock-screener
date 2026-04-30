'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { ThreeCandlestickChart } from '@/components/charts/ThreeCandlestickChart';
import { useScreenerStore } from '@/lib/store/screenerStore';
import { useMemo } from 'react';

export default function ThreeChartSection() {
  const { filteredStocks } = useScreenerStore();
  
  const mockData = useMemo(() => {
    let price = 150;
    return Array.from({ length: 40 }, (_, i) => {
      const open = price;
      const change = (Math.random() - 0.45) * 10;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      price = close;
      return {
        time: `2024-01-${i + 1}`,
        open,
        high,
        low,
        close,
      };
    });
  }, []);

  return (
    <section className="relative h-[600px] w-full py-14 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full relative">
        <div className="absolute top-0 left-0 z-10">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Immersive 3D Analytics</h2>
          <p className="text-white/50 text-sm">Explore market trends in a high-fidelity 3D environment</p>
        </div>
        
        <div className="w-full h-full glass-card rounded-3xl border border-primary/20 overflow-hidden mt-16">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={50} />
            <OrbitControls enableZoom={true} enablePan={true} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#d4a574" />
            
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <ThreeCandlestickChart data={mockData} />
            </Float>
            
            <fog attach="fog" args={['#1f1a16', 10, 50]} />
          </Canvas>
        </div>
        
        <div className="absolute bottom-6 right-6 z-10 glass-card p-4 rounded-xl border border-white/10 text-xs font-mono text-white/60">
          USE MOUSE TO ROTATE • SCROLL TO ZOOM • RIGHT CLICK TO PAN
        </div>
      </div>
    </section>
  );
}
