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
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.64, 0.82, 0.28, 7]} />
        <meshStandardMaterial color="#556258" roughness={1} />
      </mesh>
      <mesh position={[0, 0.84, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.46, 1.28, 7]} />
        <meshStandardMaterial color="#647067" roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0.18, index * 0.62, 0.12]} castShadow>
        <dodecahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#536159" roughness={1} />
      </mesh>
      <mesh position={[0, 0.91, 0.305]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshStandardMaterial color="#f6c46d" emissive="#e88b32" emissiveIntensity={1.8} side={2} />
      </mesh>
      <mesh position={[0.2, 0.2, -0.52]} rotation={[0.3, 0.5, 0.2]} scale={[0.34, 0.26, 0.32]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#49544d" roughness={1} />
      </mesh>
      <CuboidCollider
        args={[1.2, 1.2, 1.2]}
        position={[0, 0.9, 0]}
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
