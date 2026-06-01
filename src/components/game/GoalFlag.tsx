import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type GoalFlagProps = {
  position: readonly [number, number, number];
};

export const GoalFlag = ({ position }: GoalFlagProps) => {
  const reachGoal = useGameStore((state) => state.reachGoal);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 2.8, 10]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.7, 2.28, 0]}>
        <planeGeometry args={[1.4, 0.72]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.35} side={2} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.65, 0.8, 0.14, 16]} />
        <meshStandardMaterial color="#8b6f47" roughness={1} />
      </mesh>
      <CuboidCollider
        args={[1, 2, 1]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') {
            reachGoal();
          }
        }}
      />
    </RigidBody>
  );
};
