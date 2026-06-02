import { Html, Text } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useState } from 'react';
import { useGameStore } from '../../systems/gameStore';

export const InstructionBoard = () => {
  const [hovered, setHovered] = useState(false);
  const setInstructionOpen = useGameStore((state) => state.setInstructionOpen);

  const openInstructions = () => {
    setInstructionOpen(true);
    if (document.pointerLockElement) document.exitPointerLock();
  };

  return (
    <RigidBody type="fixed" colliders={false} position={[-3.9, 0, 3.5]} rotation={[0, 0.22, 0]}>
      <CuboidCollider args={[1.45, 1.38, 0.16]} position={[0, 1.48, 0]} />
      <group
        onPointerDown={(event) => {
          event.stopPropagation();
          openInstructions();
        }}
        onClick={(event) => {
          event.stopPropagation();
          openInstructions();
        }}
        onPointerEnter={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
      {[-1.05, 1.05].map((x) => (
        <mesh key={`guide-post-${x}`} position={[x, 0.86, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1.72, 8]} />
          <meshStandardMaterial color="#5e3d27" roughness={1} />
        </mesh>
      ))}
      <mesh
        position={[0, 1.76, 0]}
        castShadow
      >
        <boxGeometry args={[2.9, 1.66, 0.22]} />
        <meshStandardMaterial color={hovered ? '#a86f42' : '#8b5a36'} roughness={0.94} />
      </mesh>
      <mesh position={[0, 1.76, -0.13]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.58, 1.34]} />
        <meshStandardMaterial color="#d8bd82" roughness={1} />
      </mesh>
      <Text
        position={[0, 2.02, -0.145]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.28}
        color="#4b3024"
        anchorX="center"
        anchorY="middle"
      >
        HOW TO PLAY
      </Text>
      <Text
        position={[0, 1.61, -0.146]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.17}
        color="#69452f"
        anchorX="center"
        anchorY="middle"
      >
        CLICK TO READ
      </Text>
      <Html center distanceFactor={8} position={[0, 1.76, -0.18]} style={{ pointerEvents: 'auto' }}>
        <button
          aria-label="Read guide"
          onClick={openInstructions}
          style={{
            width: '290px',
            height: '166px',
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
          }}
          type="button"
        />
      </Html>
      </group>
    </RigidBody>
  );
};
