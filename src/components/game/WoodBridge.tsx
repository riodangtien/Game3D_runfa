import { CuboidCollider, RigidBody } from '@react-three/rapier';

type WoodBridgeProps = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
};

export const WoodBridge = ({ position, size }: WoodBridgeProps) => (
  <RigidBody type="fixed" colliders={false} position={position}>
    {[-0.4, -0.2, 0, 0.2, 0.4].map((offset) => (
      <mesh
        key={offset}
        position={size[0] >= size[2] ? [offset * size[0], 0, 0] : [0, 0, offset * size[2]]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={size[0] >= size[2]
            ? [size[0] / 5.4, size[1], size[2]]
            : [size[0], size[1], size[2] / 5.4]}
        />
        <meshStandardMaterial color="#765438" roughness={1} />
      </mesh>
    ))}
    <CuboidCollider
      args={[size[0] / 2 - 0.08, size[1] / 2 - 0.02, size[2] / 2 - 0.08]}
      position={[0, -0.03, 0]}
    />
  </RigidBody>
);
