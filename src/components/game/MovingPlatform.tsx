import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

type MovingPlatformProps = {
  position: readonly [number, number, number];
  axis?: 'x' | 'z';
  distance?: number;
  speed?: number;
};

export const MovingPlatform = ({ position, axis = 'x', distance = 3, speed = 1 }: MovingPlatformProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);

  useFrame((state) => {
    const offset = Math.sin(state.clock.elapsedTime * speed) * distance;
    bodyRef.current?.setNextKinematicTranslation({
      x: position[0] + (axis === 'x' ? offset : 0),
      y: position[1],
      z: position[2] + (axis === 'z' ? offset : 0),
    });
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.28, 2.4]} />
        <meshStandardMaterial color="#687b82" metalness={0.12} roughness={0.78} />
      </mesh>
      <CuboidCollider args={[1.54, 0.14, 1.14]} />
    </RigidBody>
  );
};
