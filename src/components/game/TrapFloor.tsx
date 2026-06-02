import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type TrapFloorProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  color: string;
  delay?: number;
};

export const TrapFloor = ({ position, size, color, delay = 0.48 }: TrapFloorProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const triggeredAt = useRef<number | null>(null);
  const pendingTrigger = useRef(false);
  const activeTime = useRef(0);
  const activeDelay = useRef(delay);
  const paused = useGameStore((state) => state.paused);

  useFrame((_, dt) => {
    if (paused || !bodyRef.current) return;
    activeTime.current += dt;
    const elapsed = activeTime.current;
    if (pendingTrigger.current && triggeredAt.current === null) {
      triggeredAt.current = elapsed;
      pendingTrigger.current = false;
    }
    const triggered = triggeredAt.current;
    if (triggered === null) return;
    const fallProgress = triggered === null ? 0 : THREE.MathUtils.clamp((elapsed - triggered - activeDelay.current) * 2.7, 0, 1);
    const resetReady = triggered !== null && elapsed - triggered > activeDelay.current + 3.2;

    if (resetReady) {
      triggeredAt.current = null;
      bodyRef.current.setNextKinematicTranslation({ x: position[0], y: position[1], z: position[2] });
      return;
    }

    bodyRef.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1] - fallProgress * 8,
      z: position[2],
    });
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive="#d97706" emissiveIntensity={0.12} roughness={0.88} />
      </mesh>
      <CuboidCollider args={[size[0] / 2 - 0.06, size[1] / 2, size[2] / 2 - 0.06]} />
      <CuboidCollider
        args={[size[0] / 2 - 0.14, 0.36, size[2] / 2 - 0.14]}
        position={[0, size[1] / 2 + 0.3, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player' && triggeredAt.current === null) {
            activeDelay.current = Math.max(0.14, delay * (0.58 + Math.random() * 0.92));
            pendingTrigger.current = true;
          }
        }}
      />
    </RigidBody>
  );
};
