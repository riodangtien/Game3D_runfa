import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { lazy, Suspense } from 'react';
import * as THREE from 'three';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import type { AnimState } from './Player';
import { useGameStore } from '../../systems/gameStore';
import { applyStaminaDelta } from '../../systems/StaminaSystem';
import { CameraController } from './CameraController';
import { RapierRigidBody } from '@react-three/rapier';

const MOVE_SPEED = 5.5;
const SPRINT_MULT = 1.48;
const JUMP_FORCE = 9.6;
const STAMINA_DRAIN = 16;
const STAMINA_REGEN = 12;
const GROUND_ACCELERATION = 13;
const GROUND_BRAKING = 18;
const AIR_ACCELERATION = 4.2;
const ICE_ACCELERATION = 1.6;
const AnimatedPlayer = lazy(() =>
  import('./AnimatedPlayer').then((module) => ({ default: module.AnimatedPlayer }))
);

export const PlayerController = () => {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const input = usePlayerControls();
  const { rapier, world } = useRapier();
  const vectors = useRef({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    move: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
  });
  const animStateRef = useRef<AnimState>('idle');
  const jumpPressedLast = useRef(false);
  const groundedTime = useRef(0);
  const wasGrounded = useRef(true);
  const landTimer = useRef(0);
  const hitTimer = useRef(0);
  const [animState, setAnimState] = useState<AnimState>('idle');

  const started = useGameStore((state) => state.started);
  const paused = useGameStore((state) => state.paused);
  const win = useGameStore((state) => state.win);
  const lose = useGameStore((state) => state.lose);
  const stamina = useGameStore((state) => state.stamina);
  const exhaustedTime = useGameStore((state) => state.exhaustedTime);
  const slippery = useGameStore((state) => state.slippery);
  const wind = useGameStore((state) => state.wind);
  const platformVelocity = useGameStore((state) => state.platformVelocity);
  const addFall = useGameStore((state) => state.addFall);
  const lastCheckpoint = useGameStore((state) => state.lastCheckpoint);
  const teleportVersion = useGameStore((state) => state.teleportVersion);
  const transitionTime = useGameStore((state) => state.transitionTime);
  const respawnTime = useGameStore((state) => state.respawnTime);
  const emitSound = useGameStore((state) => state.emitSound);
  const hitVersion = useGameStore((state) => state.hitVersion);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.setTranslation(useGameStore.getState().lastCheckpoint, true);
    bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }, [teleportVersion]);

  useEffect(() => {
    if (hitVersion > 0) hitTimer.current = 0.5;
  }, [hitVersion]);

  useFrame((state, dt) => {
    if (!bodyRef.current) return;

    if (paused) {
      bodyRef.current.setGravityScale(0, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    if (respawnTime > 0) {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      if (animStateRef.current !== 'hit') {
        animStateRef.current = 'hit';
        setAnimState('hit');
      }
      return;
    }

    if (!started || win || lose || transitionTime > 0) {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const currentVelocity = bodyRef.current.linvel();
    const position = bodyRef.current.translation();
    const { forward, right, move, up } = vectors.current;

    state.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, up).normalize();

    move.set(0, 0, 0);
    if (input.forward) move.add(forward);
    if (input.backward) move.sub(forward);
    if (input.right) move.add(right);
    if (input.left) move.sub(right);

    const moveLength = move.length();
    if (moveLength > 0) move.normalize();

    if (modelRef.current) {
      const targetRotation = Math.atan2(forward.x, forward.z);
      const rotationBlend = 1 - Math.exp(-12 * dt);
      const rotationDelta = Math.atan2(
        Math.sin(targetRotation - modelRef.current.rotation.y),
        Math.cos(targetRotation - modelRef.current.rotation.y)
      );
      modelRef.current.rotation.y += rotationDelta * rotationBlend;
    }

    const sprinting = input.sprint && moveLength > 0 && stamina > 0 && exhaustedTime <= 0;
    const speed = MOVE_SPEED * (sprinting ? SPRINT_MULT : 1);

    const groundRay = world?.castRay
      ? world.castRay(
          new rapier.Ray(position, { x: 0, y: -1, z: 0 }),
          1.25,
          true,
          rapier.QueryFilterFlags.EXCLUDE_SENSORS,
          undefined,
          undefined,
          bodyRef.current
        )
      : null;
    const grounded = groundRay
      ? groundRay.collider && Math.abs(groundRay.timeOfImpact) <= 1.2
      : position.y <= 2.2;
    const canJump = Boolean(grounded && groundedTime.current >= 0.06 && currentVelocity.y <= 0.15);
    groundedTime.current = grounded ? groundedTime.current + dt : 0;
    landTimer.current = Math.max(0, landTimer.current - dt);
    hitTimer.current = Math.max(0, hitTimer.current - dt);
    if (!wasGrounded.current && grounded && currentVelocity.y < -1.1) {
      landTimer.current = 0.24;
      emitSound('land');
    }
    wasGrounded.current = grounded;

    bodyRef.current.setGravityScale(1, true);
    const acceleration = slippery
      ? ICE_ACCELERATION
      : grounded
        ? moveLength > 0
          ? GROUND_ACCELERATION
          : GROUND_BRAKING
        : AIR_ACCELERATION;
    const traction = 1 - Math.exp(-acceleration * dt);
    const carriedVelocityX = grounded ? platformVelocity.x : 0;
    const carriedVelocityZ = grounded ? platformVelocity.z : 0;
    const targetVelocityX =
      (!grounded && moveLength === 0 ? currentVelocity.x : move.x * speed) + wind.x + carriedVelocityX;
    const targetVelocityZ =
      (!grounded && moveLength === 0 ? currentVelocity.z : move.z * speed) + wind.z + carriedVelocityZ;
    bodyRef.current.setLinvel({
      x: THREE.MathUtils.lerp(currentVelocity.x, targetVelocityX, traction),
      y: currentVelocity.y,
      z: THREE.MathUtils.lerp(currentVelocity.z, targetVelocityZ, traction),
    }, true);

    const jumpJustPressed = input.jump && !jumpPressedLast.current;
    jumpPressedLast.current = input.jump;

    if (jumpJustPressed && canJump) {
      groundedTime.current = 0;
      emitSound('jump');
      bodyRef.current.setLinvel({
        x: moveLength > 0 ? THREE.MathUtils.lerp(currentVelocity.x, move.x * speed, 0.72) : currentVelocity.x,
        y: JUMP_FORCE,
        z: moveLength > 0 ? THREE.MathUtils.lerp(currentVelocity.z, move.z * speed, 0.72) : currentVelocity.z,
      }, true);
    }

    if (sprinting) {
      applyStaminaDelta(-STAMINA_DRAIN * dt);
    } else if (moveLength === 0 || !input.sprint) {
      applyStaminaDelta(STAMINA_REGEN * dt);
    }

    if (position.y < -6) {
      addFall();
      bodyRef.current.setTranslation(lastCheckpoint, true);
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    let nextState: AnimState = 'idle';
    if (hitTimer.current > 0) {
      nextState = 'hit';
    } else if (landTimer.current > 0) {
      nextState = 'land';
    } else if (!grounded && currentVelocity.y > 0.4) {
      nextState = 'jump';
    } else if (!grounded && currentVelocity.y < -0.6) {
      nextState = 'fall';
    } else if (moveLength > 0.2) {
      nextState = sprinting ? 'run' : 'walk';
    }

    if (nextState !== animStateRef.current) {
      animStateRef.current = nextState;
      setAnimState(nextState);
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        colliders={false}
        lockRotations
        name="player"
        position={[0, 1.05, 0]}
        canSleep={false}
        ccd
      >
        <CapsuleCollider args={[0.52, 0.32]} friction={0} />
        <Suspense fallback={null}>
          <AnimatedPlayer ref={modelRef} state={animState} />
        </Suspense>
      </RigidBody>
      <CameraController target={bodyRef} />
    </>
  );
};
