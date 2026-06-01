import { useFrame } from '@react-three/fiber';
import { useGameStore } from './gameStore';
import { tickExhaustion } from './StaminaSystem';

export const GameManager = () => {
  const updateTime = useGameStore((state) => state.updateTime);
  const tickTransition = useGameStore((state) => state.tickTransition);

  useFrame((_, dt) => {
    updateTime(dt);
    tickTransition(dt);
    tickExhaustion(dt);
  });

  return null;
};
