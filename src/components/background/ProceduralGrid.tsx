'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ProceduralGrid() {
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vec2 grid = abs(fract(vUv * 40.0 - 0.5) - 0.5) / fwidth(vUv * 40.0);
      float line = min(grid.x, grid.y);
      float grid1 = 1.0 - min(line, 1.0);
      
      vec2 grid22 = abs(fract(vUv * 8.0 - 0.5) - 0.5) / fwidth(vUv * 8.0);
      float line2 = min(grid22.x, grid22.y);
      float grid2 = 1.0 - min(line2, 1.0);
      
      float intensity = grid1 * 0.1 + grid2 * 0.2;
      
      // Add a pulse effect
      float pulse = sin(uTime * 0.5 + vUv.x * 10.0) * 0.5 + 0.5;
      intensity *= 0.5 + pulse * 0.5;
      
      vec3 color = vec3(0.83, 0.65, 0.42); // Primary color #d4a574
      gl_FragColor = vec4(color, intensity * 0.3);
    }
  `;

  const uniforms = useRef({
    uTime: { value: 0 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.current.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
