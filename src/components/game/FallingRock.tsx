import { BallCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../../systems/gameStore';

type FallingRockProps = {
  position: readonly [number, number, number];
  phase?: number;
};

export const FallingRock = ({ position, phase = 0 }: FallingRockProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const canHit = useRef(true);
  const hitHazard = useGameStore((state) => state.hitHazard);

  useFrame((state) => {
    const progress = ((state.clock.elapsedTime * 0.42 + phase) % 1 + 1) % 1;
    const y = position[1] - progress * 10;
    if (progress < 0.08) canHit.current = true;
    bodyRef.current?.setNextKinematicTranslation({ x: position[0], y, z: position[2] });
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color="#59636a" roughness={1} />
      </mesh>
      <BallCollider
        args={[0.72]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player' && canHit.current) {
            canHit.current = false;
            hitHazard();
          }
        }}
      />
    </RigidBody>
  );
};
