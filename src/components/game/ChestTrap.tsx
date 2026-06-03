import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type ChestTrapProps = {
  position: readonly [number, number, number];
  chargeDirection?: readonly [number, number, number];
};

export const ChestTrap = ({ position, chargeDirection = [0, 0, -1] }: ChestTrapProps) => {
  const enemyRef = useRef<RapierRigidBody | null>(null);
  const activeTime = useRef(0);
  const openedAt = useRef<number | null>(null);
  const canHit = useRef(true);
  const resolved = useRef(false);
  const enemyGroupRef = useRef<THREE.Group | null>(null);
  const swordRef = useRef<THREE.Mesh | null>(null);
  const paused = useGameStore((state) => state.paused);
  const hitHazard = useGameStore((state) => state.hitHazard);
  const [opened, setOpened] = useState(false);
  const [enemyVisible, setEnemyVisible] = useState(false);
  const enemySpawn = [
    position[0] - chargeDirection[0] * 1.8,
    position[1] + 0.84,
    position[2] - chargeDirection[2] * 1.8,
  ] as const;

  useFrame((_, dt) => {
    if (paused || !enemyRef.current) return;
    activeTime.current += dt;
    const triggered = openedAt.current;
    if (triggered === null) return;
    const elapsed = activeTime.current - triggered;
    const jumpProgress = THREE.MathUtils.clamp((elapsed - 0.28) * 2.6, 0, 1);
    const charge = THREE.MathUtils.clamp((elapsed - 0.72) * 2.1, 0, 3.2);
    const slashWindow = THREE.MathUtils.clamp((elapsed - 0.92) / 1.42, 0, 1);
    setEnemyVisible(elapsed > 0.22 && elapsed < 2.95);

    enemyRef.current.setNextKinematicTranslation({
      x: enemySpawn[0] + chargeDirection[0] * charge,
      y: position[1] + 0.84 + Math.sin(jumpProgress * Math.PI) * 1.05,
      z: enemySpawn[2] + chargeDirection[2] * charge,
    });

    if (enemyGroupRef.current) {
      enemyGroupRef.current.rotation.y = Math.atan2(chargeDirection[0], chargeDirection[2]) + Math.PI;
    }

    if (swordRef.current) {
      const slashPhase = Math.floor(slashWindow * 3);
      const slashLocal = slashWindow === 1 ? 1 : slashWindow * 3 - slashPhase;
      const slashSwing = Math.sin(slashLocal * Math.PI);
      swordRef.current.rotation.z = -0.95 + slashSwing * 2.25;
      swordRef.current.rotation.x = 0.18 + slashPhase * 0.12;
    }
    if (elapsed > 2.2) canHit.current = true;

    if (elapsed > 2.38 && !resolved.current) {
      resolved.current = true;
      canHit.current = false;
      hitHazard();
    }

    if (elapsed > 4.4) {
      openedAt.current = null;
      canHit.current = true;
      resolved.current = false;
      setOpened(false);
      setEnemyVisible(false);
      enemyRef.current.setNextKinematicTranslation({ x: enemySpawn[0], y: enemySpawn[1], z: enemySpawn[2] });
    }
  });

  const openChest = () => {
    if (openedAt.current !== null) return;
    openedAt.current = activeTime.current;
    canHit.current = false;
    resolved.current = false;
    setOpened(true);
  };

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={position}>
        <group>
          <mesh position={[0, 0.26, 0]} castShadow>
            <boxGeometry args={[1.35, 0.52, 0.86]} />
            <meshStandardMaterial color="#b7791f" roughness={0.7} metalness={0.25} />
          </mesh>
          <mesh position={[0, opened ? 0.88 : 0.62, opened ? -0.23 : 0]} rotation={[opened ? -1 : 0, 0, 0]} castShadow>
            <boxGeometry args={[1.35, 0.24, 0.86]} />
            <meshStandardMaterial color="#f6c453" roughness={0.55} metalness={0.32} />
          </mesh>
          <mesh position={[0, 0.42, 0.45]} castShadow>
            <boxGeometry args={[0.24, 0.28, 0.08]} />
            <meshStandardMaterial color="#fde68a" metalness={0.65} roughness={0.3} />
          </mesh>
        </group>
        <CuboidCollider
          args={[1.55, 1, 1.55]}
          sensor
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name === 'player') openChest();
          }}
        />
      </RigidBody>
      <RigidBody ref={enemyRef} type="kinematicPosition" colliders={false} position={enemySpawn}>
        <group ref={enemyGroupRef} visible={enemyVisible}>
          <mesh position={[0, 0.76, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.5, 1.18, 8]} />
            <meshStandardMaterial color="#6b1d24" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.4, 12, 10]} />
            <meshStandardMaterial color="#c98b63" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.67, -0.04]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.5, 0.74, 8]} />
            <meshStandardMaterial color="#2f3542" roughness={0.92} />
          </mesh>
          <mesh position={[-0.42, 0.94, 0]} rotation={[0, 0, -0.54]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.88, 8]} />
            <meshStandardMaterial color="#6b1d24" roughness={0.9} />
          </mesh>
          <mesh position={[0.42, 0.94, 0]} rotation={[0, 0, 0.54]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.88, 8]} />
            <meshStandardMaterial color="#6b1d24" roughness={0.9} />
          </mesh>
          <mesh position={[-0.2, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.72, 8]} />
            <meshStandardMaterial color="#26313f" roughness={0.92} />
          </mesh>
          <mesh position={[0.2, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.72, 8]} />
            <meshStandardMaterial color="#26313f" roughness={0.92} />
          </mesh>
          <mesh ref={swordRef} position={[0.72, 0.92, 0]} rotation={[0, 0, -0.72]} castShadow>
            <boxGeometry args={[0.13, 1.78, 0.08]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.75} roughness={0.28} />
          </mesh>
          <mesh position={[0.32, 0.5, -0.22]} rotation={[0.12, 0, 0]} castShadow>
            <coneGeometry args={[0.54, 1.16, 5]} />
            <meshStandardMaterial color="#202936" roughness={0.96} />
          </mesh>
        </group>
        <CuboidCollider
          args={[0.64, 1.25, 0.64]}
          sensor
          onIntersectionEnter={({ other }) => {
            if (enemyVisible && canHit.current && other.rigidBodyObject?.name === 'player') {
              canHit.current = false;
              hitHazard();
            }
          }}
        />
      </RigidBody>
    </>
  );
};
