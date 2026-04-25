'use client';
// src/components/background/ParticleBackground.tsx
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 4000;

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palettes = [
      [0, 0.83, 1],      // plasma #00d4ff
      [0, 1, 0.53],      // aurora #00ff88
      [0.55, 0.36, 0.96], // violet
      [1, 0.42, 0.21],   // ember
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 40;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const brightness = 0.4 + Math.random() * 0.6;
      colors[i3] = palette[0] * brightness;
      colors[i3 + 1] = palette[1] * brightness;
      colors[i3 + 2] = palette[2] * brightness;

      sizes[i] = Math.random() * 3 + 0.5;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.02;
    meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;

    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posAttr.array[i3 + 1] = (posAttr.array[i3 + 1] as number) + Math.sin(time * 0.5 + i * 0.1) * 0.001;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GridLines() {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const step = 3;
    const extent = 30;

    for (let x = -extent; x <= extent; x += step) {
      vertices.push(x, -extent, -15, x, extent, -15);
    }
    for (let y = -extent; y <= extent; y += step) {
      vertices.push(-extent, y, -15, extent, y, -15);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;
    lineRef.current.material.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#00d4ff" transparent opacity={0.04} />
    </lineSegments>
  );
}

function DataNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = 30;

  const positions = useMemo(() =>
    Array.from({ length: nodeCount }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 10 - 8,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const pos = positions[i];
      child.position.y = pos.y + Math.sin(state.clock.elapsedTime * pos.speed + pos.phase) * 0.5;
      child.rotation.z += 0.01;
      (child as THREE.Mesh).material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + pos.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#00ff88' : '#8b5cf6'}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ParticleBackground() {
  return (
    <div className="three-canvas" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.1} />
        <ParticleField />
        <GridLines />
        <DataNodes />
        <fog attach="fog" args={['#020306', 20, 50]} />
      </Canvas>
    </div>
  );
}
