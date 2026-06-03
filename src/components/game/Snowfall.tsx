import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

const SNOW_COUNT = 42;

export const Snowfall = () => {
  const snow = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const flakes = Array.from({ length: SNOW_COUNT }, (_, index) => {
      const flake = {
        x: -39 + (index * 5.7) % 22,
        y: 14 + (index * 1.37) % 13,
        z: 88 + (index * 8.3) % 96,
        drift: 0.35 + (index % 5) * 0.08,
        speed: 0.7 + (index % 7) * 0.08,
      };
      const base = index * 3;
      positions[base] = flake.x;
      positions[base + 1] = flake.y;
      positions[base + 2] = flake.z;
      return flake;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { flakes, geometry, positions };
  }, []);

  useFrame((state, dt) => {
    const positionAttribute = snow.geometry.getAttribute('position') as THREE.BufferAttribute;
    snow.flakes.forEach((flake, index) => {
      const base = index * 3;
      snow.positions[base] += Math.sin(state.clock.elapsedTime * flake.drift + index) * 0.008;
      snow.positions[base + 1] -= flake.speed * dt;
      if (snow.positions[base + 1] < 8) {
        snow.positions[base] = flake.x;
        snow.positions[base + 1] = 27;
      }
    });
    positionAttribute.needsUpdate = true;
  });

  return (
    <points geometry={snow.geometry}>
      <pointsMaterial color="#f4fbff" size={0.11} sizeAttenuation transparent opacity={0.76} depthWrite={false} />
    </points>
  );
};
