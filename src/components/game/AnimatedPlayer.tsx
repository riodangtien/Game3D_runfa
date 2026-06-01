import { useAnimations, useGLTF } from '@react-three/drei';
import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AnimState } from './Player';

type AnimatedPlayerProps = {
  state: AnimState;
};

const clipByState: Record<AnimState, string> = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  jump: 'Jump',
  fall: 'WalkJump',
  // RobotExpressive has no climb clip. Keep this mapping isolated for an art swap.
  climb: 'WalkJump',
  land: 'Standing',
  hit: 'Punch',
};

export const AnimatedPlayer = forwardRef<THREE.Group, AnimatedPlayerProps>(({ state }, ref) => {
  const { scene, animations } = useGLTF('/models/RobotExpressive.glb');
  const instance = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, instance);

  useEffect(() => {
    instance.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [instance]);

  useEffect(() => {
    const action = actions[clipByState[state]];
    if (!action) return;
    action.reset().fadeIn(0.16).play();
    return () => {
      action.fadeOut(0.14);
    };
  }, [actions, state]);

  return (
    <group ref={ref} position={[0, -0.92, 0]} rotation={[0, Math.PI, 0]} scale={0.3}>
      <primitive object={instance} />
    </group>
  );
});

useGLTF.preload('/models/RobotExpressive.glb');
