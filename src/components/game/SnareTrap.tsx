import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type SnareTrapProps = {
  position: readonly [number, number, number];
  rotation?: number;
};

export const SnareTrap = ({ position, rotation = 0 }: SnareTrapProps) => {
  const triggeredAt = useRef<number | null>(null);
  const activeTime = useRef(0);
  const resolved = useRef(false);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);
  const [sprung, setSprung] = useState(false);

  useFrame((_, dt) => {
    if (paused) return;
    activeTime.current += dt;
    const triggered = triggeredAt.current;
    if (triggered === null) return;

    if (activeTime.current - triggered > 0.18 && !resolved.current) {
      resolved.current = true;
      hitHazard();
    }
  });

  const trigger = () => {
    if (triggeredAt.current !== null) return;
    triggeredAt.current = activeTime.current;
    setSprung(true);
  };

  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
      <group visible={sprung}>
        {[-0.52, 0, 0.52].map((offset, index) => (
          <mesh key={`snare-root-${index}`} position={[offset, 0.24, 0]} rotation={[0, 0, index === 1 ? 0 : offset * 0.72]} castShadow>
            <cylinderGeometry args={[0.08, 0.14, 1.2, 7]} />
            <meshStandardMaterial color="#5f432d" roughness={1} />
          </mesh>
        ))}
        {[-0.62, -0.2, 0.22, 0.64].map((offset, index) => (
          <mesh key={`snare-thorn-${index}`} position={[offset, 0.48, index % 2 === 0 ? 0.16 : -0.12]} rotation={[0, 0, offset * -0.35]} castShadow>
            <coneGeometry args={[0.12, 0.68, 7]} />
            <meshStandardMaterial color="#7b5b3b" roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.68, 0.92, 18]} />
          <meshStandardMaterial color="#a86d3a" emissive="#713f12" emissiveIntensity={0.36} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <CuboidCollider
        args={[0.86, 0.52, 0.86]}
        position={[0, 0.28, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') trigger();
        }}
      />
    </RigidBody>
  );
};
