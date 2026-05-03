'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FinancialWaves() {
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    uniform float uTime;
    varying float vElevation;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0 * vec3(x0.x,x12.xz) + h * vec3(x0.y,x12.yw);
      vec3 l = 1.79284291400159 - 0.85373472095314 * ( g*g + h*h );
      vec3 g1;
      g1.x  = a0.x  * l.x;
      g1.yz = a0.yz * l.y;
      float n = 130.0 * dot(m, g);
      return n;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      float noise = snoise(vec2(pos.x * 0.1, pos.y * 0.1 + uTime * 0.2));
      pos.z += noise * 2.0;
      vElevation = pos.z;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying float vElevation;
    varying vec2 vUv;
    uniform vec3 uColor;

    void main() {
      float alpha = (vElevation + 2.0) / 4.0;
      vec3 color = mix(vec3(0.1, 0.1, 0.1), uColor, alpha);
      gl_FragColor = vec4(color, alpha * 0.4);
    }
  `;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#d4a574') }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -10]}>
      <planeGeometry args={[50, 50, 48, 48]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        wireframe
      />
    </mesh>
  );
}
