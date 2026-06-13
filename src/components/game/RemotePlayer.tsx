import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useMultiplayerStore } from '../../systems/multiplayerStore';
import { AnimatedPlayer } from './AnimatedPlayer';

const remoteTarget = new THREE.Vector3();

const TetherRope = () => {
  const points = 10;
  const lineRef = useRef<THREE.LineSegments | null>(null);

  useFrame(() => {
    if (!lineRef.current) return;
    const { localPosition, remote } = useMultiplayerStore.getState();
    const ropePoints: THREE.Vector3[] = [];
    let previous: THREE.Vector3 | null = null;
    for (let index = 0; index < points; index += 1) {
      const t = index / (points - 1);
      const current = new THREE.Vector3(
        THREE.MathUtils.lerp(localPosition[0], remote.position[0], t),
        THREE.MathUtils.lerp(localPosition[1] + 0.35, remote.position[1] + 0.35, t) -
          Math.sin(Math.PI * t) * 0.55,
        THREE.MathUtils.lerp(localPosition[2], remote.position[2], t)
      );
      if (previous) ropePoints.push(previous, current);
      previous = current;
    }
    lineRef.current.geometry.setFromPoints(ropePoints);
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#d97738" />
    </lineSegments>
  );
};

export const RemotePlayer = () => {
  const status = useMultiplayerStore((state) => state.status);
  const mode = useMultiplayerStore((state) => state.mode);
  const remoteName = useMultiplayerStore((state) => state.remote.name);
  const animation = useMultiplayerStore((state) => state.remote.animation);
  const playerRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useFrame((_, dt) => {
    if (!playerRef.current) return;
    const remote = useMultiplayerStore.getState().remote;
    remoteTarget.set(...remote.position);
    const blend = 1 - Math.exp(-12 * Math.min(dt, 1 / 30));
    playerRef.current.position.lerp(remoteTarget, blend);
    const rotationDelta = Math.atan2(
      Math.sin(remote.rotation - playerRef.current.rotation.y),
      Math.cos(remote.rotation - playerRef.current.rotation.y)
    );
    playerRef.current.rotation.y += rotationDelta * blend;
  });

  if (status !== 'connected') return null;

  return (
    <>
      <group ref={playerRef}>
        <Suspense fallback={null}>
          <AnimatedPlayer ref={modelRef} state={animation} castShadow={false} />
        </Suspense>
        <Html center distanceFactor={9} position={[0, 1.35, 0]} style={{ pointerEvents: 'none' }}>
          <div className="remote-player-name">{remoteName || 'Người chơi 2'}</div>
        </Html>
      </group>
      {mode === 'tether' && <TetherRope />}
    </>
  );
};
