'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  position: [number, number, number];
}

export function ThreeStockCard({ symbol, name, price, change, position }: StockCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        hovered ? 0.2 : 0,
        0.1
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        hovered ? -0.1 : 0,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4, 5, 0.2]} />
        <meshStandardMaterial
          color={hovered ? '#d4a574' : '#2a2620'}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
        
        <Text
          position={[0, 1.5, 0.11]}
          fontSize={0.5}
          color="white"
          font="/fonts/Inter-Bold.ttf"
        >
          {symbol}
        </Text>
        
        <Text
          position={[0, 0.5, 0.11]}
          fontSize={0.3}
          color="white"
          fillOpacity={0.7}
        >
          {name}
        </Text>
        
        <Text
          position={[0, -0.5, 0.11]}
          fontSize={0.6}
          color={change >= 0 ? '#4ade80' : '#f87171'}
        >
          ${price.toFixed(2)}
        </Text>
        
        <Text
          position={[0, -1.5, 0.11]}
          fontSize={0.3}
          color={change >= 0 ? '#4ade80' : '#f87171'}
        >
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </Text>
      </mesh>
    </group>
  );
}
