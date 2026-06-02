import { useFrame } from '@react-three/fiber';
import { useGameStore } from './gameStore';
import { tickExhaustion } from './StaminaSystem';

export const GameManager = () => {
  const updateTime = useGameStore((state) => state.updateTime);
  const tickTransition = useGameStore((state) => state.tickTransition);
  const tickRespawn = useGameStore((state) => state.tickRespawn);
  const paused = useGameStore((state) => state.paused);

  useFrame((_, dt) => {
    if (paused) return;
    updateTime(dt);
    tickTransition(dt);
    tickRespawn(dt);
    tickExhaustion(dt);
  });

  return null;
};
