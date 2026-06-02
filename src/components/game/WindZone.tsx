import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../systems/gameStore';

type WindZoneProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  push: readonly [number, number, number];
};

export const WindZone = ({ position, size, push }: WindZoneProps) => {
  const setWind = useGameStore((state) => state.setWind);
  const direction = Math.sign(push[0] || push[2]) || 1;

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
      {[-2.1, -0.8, 0.7, 2].map((z, index) => (
        <mesh
          key={`wind-streak-${z}`}
          position={[direction * (index % 2 === 0 ? -2.3 : 1.4), 0.5 + (index % 3) * 0.42, z]}
          rotation={[0, 0, direction > 0 ? -0.12 : 0.12]}
        >
          <boxGeometry args={[3.2 + index * 0.4, 0.035, 0.035]} />
          <meshStandardMaterial color="#d9fbff" transparent opacity={0.34} emissive="#9ee7ee" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </RigidBody>
  );
};
