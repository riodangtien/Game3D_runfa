import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { useGameStore } from '../../systems/gameStore';

type HazardProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  phase?: number;
  cycleSpeed?: number;
};

export const Hazard = ({ position, size, phase = 0, cycleSpeed = 2.25 }: HazardProps) => {
  const spikesRef = useRef<Group>(null);
  const playerInside = useRef(false);
  const armed = useRef(false);
  const hitHazard = useGameStore((state) => state.hitHazard);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const wave = (
      Math.sin(elapsed * cycleSpeed + phase)
      + Math.sin(elapsed * 0.73 + phase * 1.91) * 0.22
      + 1.22
    ) / 2.44;
    const rise = Math.max(0, (wave - 0.52) / 0.48);
    armed.current = rise > 0.58;

    if (spikesRef.current) {
      spikesRef.current.position.y = rise * 0.62 - 0.5;
    }

    if (armed.current && playerInside.current) {
      playerInside.current = false;
      hitHazard();
    }
  });

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color="#765f4d" roughness={0.95} />
      </mesh>
      <group ref={spikesRef}>
        {[-0.35, 0, 0.35].map((offset) => (
          <mesh key={offset} position={[offset * size[0], size[1] + 0.28, 0]} castShadow>
            <coneGeometry args={[0.18, 0.55, 6]} />
            <meshStandardMaterial color="#c7b59a" metalness={0.45} roughness={0.45} />
          </mesh>
        ))}
      </group>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2 + 0.35, size[2] / 2]}
        position={[0, size[1] / 2, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            playerInside.current = true;
            if (armed.current) {
              playerInside.current = false;
              hitHazard();
            }
          }
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            playerInside.current = false;
          }
        }}
      />
    </RigidBody>
  );
};
