import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type CheckpointProps = {
  index: number;
  position: readonly [number, number, number];
};

export const Checkpoint = ({ index, position }: CheckpointProps) => {
  const setCheckpoint = useGameStore((state) => state.setCheckpoint);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 0.16, 24]} />
        <meshStandardMaterial color="#2f6b55" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.08, 8, 24]} />
        <meshStandardMaterial color="#7cf5a4" emissive="#45d982" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#a7f3d0" emissive="#4ade80" emissiveIntensity={1.6} />
      </mesh>
      <CuboidCollider
        args={[1.2, 1.2, 1.2]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            setCheckpoint({ x: position[0], y: position[1] + 1, z: position[2] }, index);
          }
        }}
      />
    </RigidBody>
  );
};
