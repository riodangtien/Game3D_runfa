import { Html } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Suspense, useRef } from 'react';
import type * as THREE from 'three';
import { useMultiplayerStore } from '../../systems/multiplayerStore';
import { AnimatedPlayer } from './AnimatedPlayer';

export const MultiplayerGuide = () => {
  const modelRef = useRef<THREE.Group | null>(null);
  const setDialogOpen = useMultiplayerStore((state) => state.setDialogOpen);
  const openMultiplayer = () => {
    setDialogOpen(true);
    if (document.pointerLockElement) document.exitPointerLock();
  };

  return (
    <RigidBody type="fixed" colliders={false} position={[5.8, 1.02, 3.0]} rotation={[0, -0.35, 0]}>
      <CuboidCollider args={[0.42, 0.92, 0.42]} />
      <CuboidCollider args={[1.65, 0.52, 0.42]} position={[0, -0.45, -0.86]} />
      <group position={[0, -0.45, -0.86]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.3, 1.02, 0.82]} />
          <meshStandardMaterial color="#74472d" roughness={0.94} />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[3.55, 0.16, 1.02]} />
          <meshStandardMaterial color="#9a6941" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, -0.43]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.08]} />
          <meshStandardMaterial color="#d5b46f" roughness={0.88} />
        </mesh>
      </group>
      <group
        onClick={(event) => {
          event.stopPropagation();
          openMultiplayer();
        }}
      >
        <Suspense fallback={null}>
          <AnimatedPlayer ref={modelRef} state="idle" />
        </Suspense>
        <Html center distanceFactor={8} position={[0, 1.4, 0]} style={{ pointerEvents: 'auto' }}>
          <button
            className="multiplayer-npc-label"
            type="button"
            onClick={openMultiplayer}
            onPointerDown={(event) => {
              event.stopPropagation();
              openMultiplayer();
            }}
          >
            <strong>ĐỘI THÁM HIỂM</strong>
            <span>Bấm để chơi 2 người</span>
          </button>
        </Html>
      </group>
    </RigidBody>
  );
};
