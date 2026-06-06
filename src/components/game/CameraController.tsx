import { useFrame } from '@react-three/fiber';
import { RapierRigidBody, useRapier } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

type CameraControllerProps = {
  target: React.MutableRefObject<RapierRigidBody | null>;
};

const MOUSE_SENSITIVITY_X = 0.00082;
const MOUSE_SENSITIVITY_Y = 0.00052;
const MOUSE_DEAD_ZONE = 1;
const MAX_MOUSE_DELTA_X = 40;
const MAX_MOUSE_DELTA_Y = 30;
const CAMERA_ROTATION_SMOOTHING = 8;
const CAMERA_POSITION_SMOOTHING = 9;
const CAMERA_COLLISION_IN_SMOOTHING = 18;
const CAMERA_COLLISION_OUT_SMOOTHING = 5;

export const CameraController = ({ target }: CameraControllerProps) => {
  const started = useGameStore((state) => state.started);
  const sensitivity = useGameStore((state) => state.cameraSensitivity);
  const { rapier, world } = useRapier();
  const yaw = useRef(0);
  const pitch = useRef(0.35);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0.35);
  const desiredPosition = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const zoom = useRef(8);
  const collisionDistance = useRef(8);

  useEffect(() => {
    const handleCanvasClick = (event: MouseEvent) => {
      if (started && event.target instanceof HTMLCanvasElement && !document.pointerLockElement) {
        void event.target.requestPointerLock().catch(() => {
          // Some embedded browsers decline pointer lock; keep the game usable without surfacing an error.
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!started || !document.pointerLockElement) return;
      const movementX = Math.abs(event.movementX) <= MOUSE_DEAD_ZONE
        ? 0
        : THREE.MathUtils.clamp(event.movementX, -MAX_MOUSE_DELTA_X, MAX_MOUSE_DELTA_X);
      const movementY = Math.abs(event.movementY) <= MOUSE_DEAD_ZONE
        ? 0
        : THREE.MathUtils.clamp(event.movementY, -MAX_MOUSE_DELTA_Y, MAX_MOUSE_DELTA_Y);
      targetYaw.current -= movementX * MOUSE_SENSITIVITY_X * sensitivity;
      targetPitch.current = THREE.MathUtils.clamp(
        targetPitch.current + movementY * MOUSE_SENSITIVITY_Y * sensitivity,
        -0.15,
        0.85
      );
    };

    const handleWheel = (event: WheelEvent) => {
      zoom.current = THREE.MathUtils.clamp(zoom.current + event.deltaY * 0.006, 4.8, 10.5);
    };

    document.addEventListener('click', handleCanvasClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [sensitivity, started]);

  useFrame((state, dt) => {
    if (!target.current) return;
    const frameDt = Math.min(dt, 1 / 45);

    const position = target.current.translation();
    const distance = zoom.current;
    const rotationBlend = 1 - Math.exp(-CAMERA_ROTATION_SMOOTHING * frameDt);
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, rotationBlend);
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, rotationBlend);
    const horizontalDistance = Math.cos(pitch.current) * distance;
    desiredPosition.current.set(
      position.x - Math.sin(yaw.current) * horizontalDistance,
      position.y + 1.5 + Math.sin(pitch.current) * distance,
      position.z - Math.cos(yaw.current) * horizontalDistance
    );
    lookAt.current.set(position.x, position.y + 1.5, position.z);
    cameraDirection.current.copy(desiredPosition.current).sub(lookAt.current).normalize();
    const cameraHit = world.castRay(
      new rapier.Ray(lookAt.current, cameraDirection.current),
      distance,
      true,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      undefined,
      target.current
    );

    const clearDistance = cameraHit ? Math.max(1.8, cameraHit.timeOfImpact - 0.3) : distance;
    const collisionSmoothing = clearDistance < collisionDistance.current
      ? CAMERA_COLLISION_IN_SMOOTHING
      : CAMERA_COLLISION_OUT_SMOOTHING;
    collisionDistance.current = THREE.MathUtils.lerp(
      collisionDistance.current,
      clearDistance,
      1 - Math.exp(-collisionSmoothing * frameDt)
    );
    desiredPosition.current.copy(lookAt.current).addScaledVector(cameraDirection.current, collisionDistance.current);

    state.camera.position.lerp(desiredPosition.current, 1 - Math.exp(-CAMERA_POSITION_SMOOTHING * frameDt));
    state.camera.lookAt(lookAt.current);
  });

  return null;
};
