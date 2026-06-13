import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../../systems/gameStore';

type StoneCrusherTrapProps = {
  position: readonly [number, number, number];
  width: number;
  speed: number;
  phase?: number;
};

export const StoneCrusherTrap = ({
  position,
  width,
  speed,
  phase = 0,
}: StoneCrusherTrapProps) => {
  const leftRef = useRef<RapierRigidBody | null>(null);
  const rightRef = useRef<RapierRigidBody | null>(null);
  const hitReady = useRef(true);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);

  useFrame((state) => {
    if (paused || !leftRef.current || !rightRef.current) return;
    const cycle = (Math.sin(state.clock.elapsedTime * speed + phase) + 1) / 2;
    const gap = 0.55 + cycle * (width / 2 - 0.75);
    leftRef.current.setNextKinematicTranslation({
      x: position[0] - gap,
      y: position[1],
      z: position[2],
    });
    rightRef.current.setNextKinematicTranslation({
      x: position[0] + gap,
      y: position[1],
      z: position[2],
    });
    if (cycle > 0.72) hitReady.current = true;
  });

  const handleHit = (name?: string) => {
    if (!hitReady.current || name !== 'player') return;
    hitReady.current = false;
    hitHazard();
  };

  return (
    <>
      {[-1, 1].map((side) => (
        <RigidBody
          key={`crusher-${side}`}
          ref={side < 0 ? leftRef : rightRef}
          type="kinematicPosition"
          colliders={false}
          position={[position[0] + side * width / 2, position[1], position[2]]}
        >
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 2.1, 1.5]} />
            <meshStandardMaterial color={side < 0 ? '#4a4a46' : '#575650'} roughness={1} />
          </mesh>
          <mesh position={[side * -0.78, 1.05, 0]} rotation={[0, 0, side * 0.32]} castShadow>
            <coneGeometry args={[0.28, 0.72, 6]} />
            <meshStandardMaterial color="#837b6f" roughness={1} />
          </mesh>
          <CuboidCollider
            args={[0.78, 1.1, 0.82]}
            position={[0, 1.05, 0]}
            sensor
            onIntersectionEnter={({ other }) => handleHit(other.rigidBodyObject?.name)}
          />
        </RigidBody>
      ))}
    </>
  );
};
