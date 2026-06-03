import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import type { AmbushKind } from '../../data/levels';
import { useGameStore } from '../../systems/gameStore';

type AmbushDropProps = {
  kind: AmbushKind;
  triggerPosition: readonly [number, number, number];
  dropPosition: readonly [number, number, number];
  restPosition: readonly [number, number, number];
  rollDirection: readonly [number, number, number];
  showMarker?: boolean;
};

export const AmbushDrop = ({
  kind,
  triggerPosition,
  dropPosition,
  restPosition,
  rollDirection,
  showMarker = true,
}: AmbushDropProps) => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const objectRef = useRef<THREE.Group | null>(null);
  const triggeredAt = useRef<number | null>(null);
  const surpriseDelay = useRef(0.5);
  const activeTime = useRef(0);
  const canHit = useRef(true);
  const impactRef = useRef<THREE.Group | null>(null);
  const impactTimer = useRef(0);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);
  const [visible, setVisible] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);

  useFrame((_, dt) => {
    if (paused || !bodyRef.current) return;
    activeTime.current += dt;
    if (impactTimer.current > 0) {
      impactTimer.current = Math.max(0, impactTimer.current - dt);
      const progress = 1 - impactTimer.current / 0.46;
      if (impactRef.current) {
        const scale = 0.6 + progress * 2.4;
        impactRef.current.scale.setScalar(scale);
        impactRef.current.rotation.y += dt * 5;
      }
      if (impactTimer.current === 0) setImpactVisible(false);
    }
    const triggered = triggeredAt.current;
    if (triggered === null) return;
    const elapsed = activeTime.current - triggered;
    const fallDistance = THREE.MathUtils.clamp(
      (elapsed - surpriseDelay.current) * 11.5,
      0,
      dropPosition[1] - restPosition[1]
    );
    const landingTime = surpriseDelay.current + (dropPosition[1] - restPosition[1]) / 11.5;
    const rollProgress = THREE.MathUtils.clamp((elapsed - landingTime) * 0.9, 0, 1);
    const rollDistance = rollProgress * (kind === 'tree' ? 2.4 : 1.8);
    setVisible(fallDistance > Math.max(0, dropPosition[1] - restPosition[1] - 4.8));

    bodyRef.current.setNextKinematicTranslation({
      x: dropPosition[0] + rollDirection[0] * rollDistance,
      y: dropPosition[1] - fallDistance,
      z: dropPosition[2] + rollDirection[2] * rollDistance,
    });

    if (objectRef.current) {
      const rotation = rollDistance / (kind === 'tree' ? 0.42 : 0.72);
      if (kind === 'tree') objectRef.current.rotation.x = rotation;
      else objectRef.current.rotation.z = -rotation * Math.sign(rollDirection[0] || 1);
    }
  });

  const trigger = () => {
    if (triggeredAt.current !== null) return;
    triggeredAt.current = activeTime.current;
    surpriseDelay.current = 0.18 + Math.random() * 1.18;
    canHit.current = true;
  };

  return (
    <>
      {showMarker && (
        <group position={triggerPosition as [number, number, number]}>
          <mesh position={[0, -0.58, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[kind === 'tree' ? 1.16 : 0.94, 18]} />
            <meshStandardMaterial
              color={kind === 'tree' ? '#7c6a50' : '#6f6254'}
              roughness={1}
              transparent
              opacity={0.34}
              side={THREE.DoubleSide}
            />
          </mesh>
          {[0, 1, 2].map((line) => (
            <mesh
              key={`ambush-crack-${line}`}
              position={[line * 0.34 - 0.32, -0.54, line % 2 === 0 ? 0.12 : -0.18]}
              rotation={[-Math.PI / 2, 0, line * 0.72 - 0.34]}
            >
              <boxGeometry args={[0.72 - line * 0.12, 0.035, 0.028]} />
              <meshStandardMaterial color="#3f342c" roughness={1} transparent opacity={0.58} />
            </mesh>
          ))}
          {[[-0.72, -0.48], [0.58, 0.44]].map(([x, z], pebbleIndex) => (
            <mesh
              key={`ambush-pebble-${pebbleIndex}`}
              position={[x, -0.45, z]}
              rotation={[0.2, pebbleIndex * 0.8, 0.1]}
              scale={[0.16, 0.1, 0.14]}
              castShadow
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#5f5a50" roughness={1} />
            </mesh>
          ))}
        </group>
      )}
      <RigidBody type="fixed" colliders={false} position={triggerPosition}>
        <CuboidCollider
          args={[2.3, 1.3, 2.2]}
          sensor
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name === 'player') trigger();
          }}
        />
      </RigidBody>
      <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={dropPosition}>
        <group ref={objectRef} visible={visible}>
          {kind === 'rock' && (
            <mesh castShadow>
              <dodecahedronGeometry args={[0.82, 0]} />
              <meshStandardMaterial color="#4b5563" roughness={1} />
            </mesh>
          )}
          {kind === 'crate' && (
            <mesh castShadow>
              <boxGeometry args={[1.25, 1.25, 1.25]} />
              <meshStandardMaterial color="#8b5a32" roughness={0.9} />
            </mesh>
          )}
          {kind === 'tree' && (
            <group rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.2, 0.28, 3.6, 8]} />
                <meshStandardMaterial color="#62452f" roughness={1} />
              </mesh>
              <mesh position={[0, 2, 0]} castShadow>
                <coneGeometry args={[0.9, 2.5, 8]} />
                <meshStandardMaterial color="#315b48" roughness={1} />
              </mesh>
            </group>
          )}
        </group>
        <CuboidCollider args={kind === 'tree' ? [2.1, 0.42, 0.55] : [0.78, 0.78, 0.78]} friction={0.82} />
        <CuboidCollider
          args={kind === 'tree' ? [2.2, 0.5, 0.65] : [0.9, 0.9, 0.9]}
          sensor
          onIntersectionEnter={({ other }) => {
            if (triggeredAt.current !== null && canHit.current && other.rigidBodyObject?.name === 'player') {
              canHit.current = false;
              impactTimer.current = 0.46;
              setImpactVisible(true);
              hitHazard();
            }
          }}
        />
        <group ref={impactRef} visible={impactVisible}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.5, 16]} />
            <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={1.4} transparent opacity={0.82} side={THREE.DoubleSide} />
          </mesh>
          {[
            [0.58, 0.16, 0],
            [-0.42, 0.22, 0.34],
            [0.18, 0.12, -0.54],
            [-0.12, 0.28, -0.48],
          ].map((position, index) => (
            <mesh key={`impact-shard-${index}`} position={position as [number, number, number]} rotation={[index * 0.4, index, 0.3]}>
              <tetrahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#d6a56e" roughness={0.95} />
            </mesh>
          ))}
        </group>
      </RigidBody>
    </>
  );
};
