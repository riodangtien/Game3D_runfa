import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type IcePatchProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
};

export const IcePatch = ({ position, size }: IcePatchProps) => {
  const setSlippery = useGameStore((state) => state.setSlippery);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#9ee7ee" transparent opacity={0.62} roughness={0.2} metalness={0.1} />
      </mesh>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2 + 0.12, size[2] / 2]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') setSlippery(true);
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') setSlippery(false);
        }}
      />
    </RigidBody>
  );
};
