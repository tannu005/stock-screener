'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ThreeCandlestickChartProps {
  data: CandleData[];
  position?: [number, number, number];
}

export function ThreeCandlestickChart({ data, position = [0, 0, 0] }: ThreeCandlestickChartProps) {
  const groupRef = useRef<THREE.Group>(null);

  const candles = useMemo(() => {
    if (!data.length) return [];
    const basePrice = data[0].open;
    
    return data.map((d, i) => {
      const isUp = d.close >= d.open;
      const bodyHeight = Math.max(Math.abs(d.close - d.open), 0.1);
      const bodyY = (d.open + d.close) / 2 - basePrice;
      const wickHeight = d.high - d.low;
      const wickY = (d.high + d.low) / 2 - basePrice;
      
      return {
        x: i * 0.6 - (data.length * 0.3),
        bodyHeight,
        bodyY,
        wickHeight,
        wickY,
        color: isUp ? '#4ade80' : '#f87171'
      };
    });
  }, [data]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {candles.map((c, i) => (
        <group key={i} position={[c.x, 0, 0]}>
          {/* Wick */}
          <mesh position={[0, c.wickY * 0.2, 0]}>
            <boxGeometry args={[0.08, c.wickHeight * 0.2, 0.08]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          
          {/* Body */}
          <mesh position={[0, c.bodyY * 0.2, 0]}>
            <boxGeometry args={[0.5, c.bodyHeight * 0.2, 0.5]} />
            <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Grid Floor */}
      <gridHelper args={[20, 20, '#d4a574', '#2a2620']} position={[0, -2, 0]} />
    </group>
  );
}
