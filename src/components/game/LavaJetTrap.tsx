import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type LavaJetTrapProps = {
  position: readonly [number, number, number];
  radius: number;
  height: number;
  interval: number;
  activeTime: number;
  phase?: number;
};

export const LavaJetTrap = ({
  position,
  radius,
  height,
  interval,
  activeTime,
  phase = 0,
}: LavaJetTrapProps) => {
  const activeRef = useRef(false);
  const hitReady = useRef(true);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);
  const [active, setActive] = useState(false);

  useFrame((state) => {
    if (paused) return;
    const cycle = (state.clock.elapsedTime + phase) % interval;
    const nextActive = cycle < activeTime;
    if (nextActive !== activeRef.current) {
      activeRef.current = nextActive;
      setActive(nextActive);
      if (!nextActive) hitReady.current = true;
    }
  });

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[radius * 0.42, radius, 20]} />
        <meshStandardMaterial color="#2a2421" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.56, 18]} />
        <meshStandardMaterial
          color={active ? '#fb923c' : '#7c2d12'}
          emissive={active ? '#ef4444' : '#431407'}
          emissiveIntensity={active ? 1.8 : 0.55}
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group visible={active}>
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[radius * 0.38, radius * 0.7, height, 10]} />
          <meshStandardMaterial color="#fb923c" emissive="#dc2626" emissiveIntensity={2.2} transparent opacity={0.78} roughness={0.45} />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh key={`lava-spark-${index}`} position={[Math.cos(index * 2.1) * radius * 0.44, height * (0.34 + index * 0.18), Math.sin(index * 2.1) * radius * 0.44]}>
            <sphereGeometry args={[0.12 + index * 0.03, 8, 6]} />
            <meshStandardMaterial color="#fde68a" emissive="#f97316" emissiveIntensity={1.4} roughness={0.5} />
          </mesh>
        ))}
      </group>
      <CuboidCollider
        args={[radius * 0.72, height / 2, radius * 0.72]}
        position={[0, height / 2, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (!activeRef.current || !hitReady.current || other.rigidBodyObject?.name !== 'player') return;
          hitReady.current = false;
          hitHazard();
        }}
      />
    </RigidBody>
  );
};
