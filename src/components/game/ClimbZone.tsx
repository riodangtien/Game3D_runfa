import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type ClimbZoneProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
};

export const ClimbZone = ({ position, size }: ClimbZoneProps) => {
  const setInClimbZone = useGameStore((state) => state.setInClimbZone);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            setInClimbZone(true);
          }
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            setInClimbZone(false);
          }
        }}
      />
    </RigidBody>
  );
};
