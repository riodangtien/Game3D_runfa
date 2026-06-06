import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useMultiplayerStore } from '../../systems/multiplayerStore';
import { AnimatedPlayer } from './AnimatedPlayer';

const TetherRope = () => {
  const points = 14;
  const lineRef = useRef<THREE.LineSegments | null>(null);

  useFrame(() => {
    if (!lineRef.current) return;
    const { localPosition, remote } = useMultiplayerStore.getState();
    const remotePosition = remote.position;
    const ropePoints: THREE.Vector3[] = [];
    let previous: THREE.Vector3 | null = null;
    for (let index = 0; index < points; index += 1) {
      const t = index / (points - 1);
      const current = new THREE.Vector3(
        THREE.MathUtils.lerp(localPosition[0], remotePosition[0], t),
        THREE.MathUtils.lerp(localPosition[1] + 0.35, remotePosition[1] + 0.35, t) -
          Math.sin(Math.PI * t) * 0.55,
        THREE.MathUtils.lerp(localPosition[2], remotePosition[2], t)
      );
      if (previous) ropePoints.push(previous, current);
      previous = current;
    }
    lineRef.current.geometry.setFromPoints(ropePoints);
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#d97738" linewidth={2} />
    </lineSegments>
  );
};

export const RemotePlayer = () => {
  const status = useMultiplayerStore((state) => state.status);
  const mode = useMultiplayerStore((state) => state.mode);
  const remote = useMultiplayerStore((state) => state.remote);
  const modelRef = useRef<THREE.Group | null>(null);

  if (status !== 'connected') return null;

  return (
    <>
      <group position={remote.position} rotation={[0, remote.rotation, 0]}>
        <Suspense fallback={null}>
          <AnimatedPlayer ref={modelRef} state={remote.animation} />
        </Suspense>
        <Html center distanceFactor={9} position={[0, 1.35, 0]} style={{ pointerEvents: 'none' }}>
          <div className="remote-player-name">{remote.name || 'Người chơi 2'}</div>
        </Html>
      </group>
      {mode === 'tether' && <TetherRope />}
    </>
  );
};
