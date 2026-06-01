import { useFrame } from '@react-three/fiber';
import { forwardRef, useRef } from 'react';
import type * as React from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

export type AnimState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'climb' | 'land' | 'hit';

type PlayerModelProps = {
  bodyRef: React.MutableRefObject<RapierRigidBody | null>;
  state: AnimState;
};

export const PlayerModel = forwardRef<THREE.Group, PlayerModelProps>(({ bodyRef, state }, ref) => {
  const timeRef = useRef(0);
  const torsoRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!bodyRef.current) return;
    timeRef.current += dt;

    const velocity = bodyRef.current.linvel();
    const speed = Math.hypot(velocity.x, velocity.z);

    const walkSpeed = state === 'run' ? 8 : 5;
    const swing = Math.sin(timeRef.current * walkSpeed) * (state === 'run' ? 0.72 : 0.42);
    const breathe = Math.sin(timeRef.current * 2) * 0.03;
    const poseBlend = 1 - Math.exp(-14 * dt);
    let leftArm = swing;
    let rightArm = -swing;
    let leftLeg = -swing;
    let rightLeg = swing;

    if (torsoRef.current) {
      torsoRef.current.rotation.x = speed > 0.2 ? -0.1 : 0;
      torsoRef.current.position.y = breathe;
    }

    if (headRef.current) {
      headRef.current.position.y = 0.45 + breathe * 0.6;
    }

    if (state === 'idle') {
      leftArm = breathe * 0.8;
      rightArm = -breathe * 0.8;
      leftLeg = 0;
      rightLeg = 0;
    }

    if (state === 'climb') {
      leftArm = -1.25 + swing * 0.35;
      rightArm = -1.25 - swing * 0.35;
      leftLeg = 0.72 - swing * 0.22;
      rightLeg = 0.72 + swing * 0.22;
    }

    if (state === 'jump') {
      leftArm = -1.05;
      rightArm = -1.05;
      leftLeg = 0.52;
      rightLeg = 0.52;
    }

    if (state === 'fall') {
      leftArm = 0.52;
      rightArm = 0.52;
      leftLeg = -0.46;
      rightLeg = -0.46;
    }

    if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, leftArm, poseBlend);
    if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, rightArm, poseBlend);
    if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, leftLeg, poseBlend);
    if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, rightLeg, poseBlend);
  });

  return (
    <group ref={ref} position={[0, 0.35, 0]} scale={1.18}>
      <mesh ref={torsoRef} castShadow>
        <capsuleGeometry args={[0.29, 0.62, 8, 14]} />
        <meshStandardMaterial color="#c95b36" roughness={0.78} />
      </mesh>
      <mesh ref={headRef} position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.265, 18, 14]} />
        <meshStandardMaterial color="#f5c99b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.51, -0.22]} castShadow>
        <sphereGeometry args={[0.24, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5a3827" roughness={0.95} />
      </mesh>
      <mesh position={[-0.09, 0.48, 0.245]}>
        <sphereGeometry args={[0.026, 8, 8]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <mesh position={[0.09, 0.48, 0.245]}>
        <sphereGeometry args={[0.026, 8, 8]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <mesh position={[0, 0.63, 0.01]} castShadow>
        <sphereGeometry args={[0.295, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d96b2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.64, -0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.075, 18]} />
        <meshStandardMaterial color="#d96b2b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, -0.3]} castShadow>
        <capsuleGeometry args={[0.22, 0.34, 6, 10]} />
        <meshStandardMaterial color="#34495e" roughness={0.92} />
      </mesh>
      <mesh position={[-0.2, 0.08, -0.12]} rotation={[0.18, 0, -0.1]} castShadow>
        <boxGeometry args={[0.055, 0.68, 0.055]} />
        <meshStandardMaterial color="#e2a34b" roughness={0.82} />
      </mesh>
      <mesh position={[0.2, 0.08, -0.12]} rotation={[0.18, 0, 0.1]} castShadow>
        <boxGeometry args={[0.055, 0.68, 0.055]} />
        <meshStandardMaterial color="#e2a34b" roughness={0.82} />
      </mesh>
      <mesh ref={leftArmRef} position={[-0.43, 0.08, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.5, 6, 10]} />
        <meshStandardMaterial color="#d95d39" roughness={0.85} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.43, 0.08, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.5, 6, 10]} />
        <meshStandardMaterial color="#d95d39" roughness={0.85} />
      </mesh>
      <mesh ref={leftLegRef} position={[-0.17, -0.62, 0]} castShadow>
        <capsuleGeometry args={[0.105, 0.55, 6, 10]} />
        <meshStandardMaterial color="#263b50" roughness={0.9} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.17, -0.62, 0]} castShadow>
        <capsuleGeometry args={[0.105, 0.55, 6, 10]} />
        <meshStandardMaterial color="#263b50" roughness={0.9} />
      </mesh>
      <mesh position={[-0.17, -0.96, -0.05]} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.42]} />
        <meshStandardMaterial color="#3f2b22" roughness={1} />
      </mesh>
      <mesh position={[0.17, -0.96, -0.05]} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.42]} />
        <meshStandardMaterial color="#3f2b22" roughness={1} />
      </mesh>
      <mesh position={[0, 0.48, -0.27]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.24]} />
        <meshStandardMaterial color="#422f3f" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.14, -0.43]} castShadow>
        <boxGeometry args={[0.42, 0.09, 0.12]} />
        <meshStandardMaterial color="#e2a34b" roughness={0.82} />
      </mesh>
    </group>
  );
});
