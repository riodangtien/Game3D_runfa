import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type PendulumTrapProps = {
  position: readonly [number, number, number];
  length: number;
  speed: number;
  phase?: number;
};

export const PendulumTrap = ({ position, length, speed, phase = 0 }: PendulumTrapProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const canHit = useRef(true);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);

  useFrame((state) => {
    if (paused || !bodyRef.current) return;
    const angle = Math.sin(state.clock.elapsedTime * speed + phase) * 0.78;
    bodyRef.current.setNextKinematicRotation(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, angle))
    );
    if (Math.abs(angle) > 0.55) canHit.current = true;
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.42, 8]} />
        <meshStandardMaterial color="#3f352e" roughness={1} />
      </mesh>
      <mesh position={[0, -length / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, length, 8]} />
        <meshStandardMaterial color="#6f5744" roughness={1} />
      </mesh>
      <mesh position={[0, -length, 0]} rotation={[0.25, 0.3, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color="#47443f" roughness={1} />
      </mesh>
      <CuboidCollider
        args={[0.82, 0.82, 0.82]}
        position={[0, -length, 0]}
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
