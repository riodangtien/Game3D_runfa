import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type WindZoneProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  push: readonly [number, number, number];
};

export const WindZone = ({ position, size, push }: WindZoneProps) => {
  const setWind = useGameStore((state) => state.setWind);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') setWind({ x: push[0], y: push[1], z: push[2] });
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') setWind({ x: 0, y: 0, z: 0 });
        }}
      />
    </RigidBody>
  );
};
