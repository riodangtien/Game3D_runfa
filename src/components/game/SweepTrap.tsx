import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type SweepTrapProps = {
  position: readonly [number, number, number];
  length: number;
  speed: number;
  phase?: number;
};

export const SweepTrap = ({ position, length, speed, phase = 0 }: SweepTrapProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const canHit = useRef(true);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);

  useFrame((state) => {
    if (paused || !bodyRef.current) return;
    const rotation = Math.sin(state.clock.elapsedTime * speed + phase) * 0.92;
    bodyRef.current.setNextKinematicRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0)));
    if (Math.abs(rotation) < 0.12) canHit.current = true;
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.96, 8]} />
        <meshStandardMaterial color="#3f3a34" roughness={1} />
      </mesh>
      <mesh position={[0, 0.92, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, length, 8]} />
        <meshStandardMaterial color="#5a5249" roughness={1} />
      </mesh>
      {[-length / 2 + 0.35, length / 2 - 0.35].map((x) => (
        <mesh key={`sweep-weight-${x}`} position={[x, 0.92, 0]} rotation={[0.4, x > 0 ? 0.4 : -0.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color="#4a4640" roughness={1} />
        </mesh>
      ))}
      <CuboidCollider
        args={[length / 2, 0.32, 0.34]}
        position={[0, 0.92, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (!canHit.current || other.rigidBodyObject?.name !== 'player') return;
          canHit.current = false;
          hitHazard();
        }}
      />
    </RigidBody>
  );
};
