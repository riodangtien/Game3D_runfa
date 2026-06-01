import { RigidBody } from '@react-three/rapier';

export const Ground = () => {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="grey" />
      </mesh>
    </RigidBody>
  );
};
