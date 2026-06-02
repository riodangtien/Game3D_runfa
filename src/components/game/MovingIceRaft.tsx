import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

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

  useFrame((state) => {
    if (!bodyRef.current) return;
    const offset = Math.sin(state.clock.elapsedTime * speed + phase.current) * distance;
    bodyRef.current.setNextKinematicTranslation({
      x: position[0] + (axis === 'x' ? offset : 0),
      y: position[1],
      z: position[2] + (axis === 'z' ? offset : 0),
    });
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} friction={0.15} />
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[size[0] * 0.5, size[0] * 0.57, size[1], 8]} />
        <meshStandardMaterial color="#b9eef2" roughness={0.24} metalness={0.06} />
      </mesh>
      <mesh position={[0, size[1] * 0.46, 0]} receiveShadow>
        <cylinderGeometry args={[size[0] * 0.43, size[0] * 0.48, 0.06, 8]} />
        <meshStandardMaterial color="#e7fbfc" roughness={0.18} transparent opacity={0.84} />
      </mesh>
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
