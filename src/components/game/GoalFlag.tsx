import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type GoalFlagProps = {
  position: readonly [number, number, number];
};

export const GoalFlag = ({ position }: GoalFlagProps) => {
  const reachGoal = useGameStore((state) => state.reachGoal);

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 2.6, 8]} />
        <meshStandardMaterial color="#68462e" roughness={1} />
      </mesh>
      <mesh position={[0.65, 2.16, 0]} rotation={[0, -0.08, -0.06]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial color="#bd5d34" emissive="#8f3e28" emissiveIntensity={0.22} side={2} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.76, 0.96, 0.32, 7]} />
        <meshStandardMaterial color="#566158" roughness={1} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.5, 1.2, 7]} />
        <meshStandardMaterial color="#647067" roughness={1} />
      </mesh>
      <mesh position={[0, 0.96, 0.35]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color="#ffd27a" emissive="#f97316" emissiveIntensity={2} side={2} />
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
