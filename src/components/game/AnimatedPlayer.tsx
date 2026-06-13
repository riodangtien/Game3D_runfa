import { useAnimations, useGLTF } from '@react-three/drei';
import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AnimState } from './Player';

type AnimatedPlayerProps = {
  state: AnimState;
  castShadow?: boolean;
};

const playerModelUrl = `${import.meta.env.BASE_URL}models/RobotExpressive.glb`;

const clipByState: Record<AnimState, string> = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  jump: 'Jump',
  fall: 'WalkJump',
  // RobotExpressive has no climb clip. Keep this mapping isolated for an art swap.
  climb: 'WalkJump',
  land: 'Standing',
  hit: 'Death',
};

export const AnimatedPlayer = forwardRef<THREE.Group, AnimatedPlayerProps>(({ state, castShadow = true }, ref) => {
  const { scene, animations } = useGLTF(playerModelUrl);
  const instance = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, instance);

  useEffect(() => {
    instance.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = castShadow;
      }
    });
  }, [castShadow, instance]);

  useEffect(() => {
    const action = actions[clipByState[state]];
    if (!action) return;
    action.clampWhenFinished = state === 'hit';
    action.setLoop(state === 'hit' ? THREE.LoopOnce : THREE.LoopRepeat, state === 'hit' ? 1 : Infinity);
    action.reset().fadeIn(0.16).play();
    return () => {
      action.fadeOut(0.14);
    };
  }, [actions, state]);

  return (
    <group ref={ref} position={[0, -0.72, 0]} rotation={[0, Math.PI, 0]} scale={0.3}>
      <primitive object={instance} />
    </group>
  );
});

useGLTF.preload(playerModelUrl);
