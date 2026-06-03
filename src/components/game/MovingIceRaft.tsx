import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../../systems/gameStore';

type MovingIceRaftProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  axis: 'x' | 'z';
  distance: number;
  speed: number;
};

export const MovingIceRaft = ({ position, size, axis, distance, speed }: MovingIceRaftProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const phase = useRef(position[2] * 0.17);
  const playerOnRaft = useRef(false);
  const setPlatformVelocity = useGameStore((state) => state.setPlatformVelocity);

  useFrame((state) => {
    if (!bodyRef.current) return;
    const wave = state.clock.elapsedTime * speed + phase.current;
    const offset = Math.sin(wave) * distance;
    const velocity = Math.cos(wave) * distance * speed;
    bodyRef.current.setNextKinematicTranslation({
      x: position[0] + (axis === 'x' ? offset : 0),
      y: position[1],
      z: position[2] + (axis === 'z' ? offset : 0),
    });

    if (playerOnRaft.current) {
      setPlatformVelocity({
        x: axis === 'x' ? velocity : 0,
        y: 0,
        z: axis === 'z' ? velocity : 0,
      });
    }
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} friction={1.2} />
      <CuboidCollider
        args={[size[0] / 2 - 0.08, 0.22, size[2] / 2 - 0.08]}
        position={[0, size[1] / 2 + 0.18, 0]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name !== 'player') return;
          playerOnRaft.current = true;
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name !== 'player') return;
          playerOnRaft.current = false;
          setPlatformVelocity({ x: 0, y: 0, z: 0 });
        }}
      />
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[size[0] * 0.5, size[0] * 0.57, size[1], 8]} />
        <meshStandardMaterial color="#96cbd2" roughness={0.42} metalness={0.03} />
      </mesh>
      <mesh position={[0, size[1] * 0.46, 0]} receiveShadow>
        <cylinderGeometry args={[size[0] * 0.43, size[0] * 0.48, 0.06, 8]} />
        <meshStandardMaterial color="#e8f5f6" roughness={0.32} />
      </mesh>
      <mesh position={[0, -size[1] * 0.5 - 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[size[0] * 0.38, size[0] * 0.5, 0.16, 8]} />
        <meshStandardMaterial color="#5f7d88" roughness={0.85} />
      </mesh>
      {[
        [-0.8, -0.38, -0.58, 0.78],
        [0.62, -0.36, 0.64, 0.66],
        [0.34, -0.34, -0.74, 0.54],
      ].map(([x, y, z, scale], index) => (
        <mesh key={`raft-icicle-${index}`} position={[x, y, z]} rotation={[0.08, index * 0.82, 0.04]} scale={scale} castShadow>
          <coneGeometry args={[0.22, 0.76, 6]} />
          <meshStandardMaterial color="#6f929c" roughness={0.8} />
        </mesh>
      ))}
      {[
        [-0.72, 0.23, -0.42, 0.76],
        [0.62, 0.2, 0.54, 0.58],
        [0.42, 0.18, -0.74, 0.46],
      ].map(([x, y, z, scale], index) => (
        <mesh key={`ice-chip-${index}`} position={[x, y, z]} rotation={[0.12, index * 0.8, 0.08]} scale={scale}>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#d6f5f7' : '#9ddce2'} roughness={0.3} />
        </mesh>
      ))}
    </RigidBody>
  );
};
