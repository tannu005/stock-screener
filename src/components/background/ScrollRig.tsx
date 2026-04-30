'use client';
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollRig() {
  const { camera } = useThree();
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 15));

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        // Subtle parallax and rotation based on scroll
        targetRotation.current.y = progress * Math.PI * 0.1;
        targetPosition.current.z = 15 - progress * 5;
        targetPosition.current.y = -progress * 2;
      }
    });

    return () => trigger.kill();
  }, []);

  useFrame(() => {
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPosition.current.z, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPosition.current.y, 0.05);
  });

  return null;
}
