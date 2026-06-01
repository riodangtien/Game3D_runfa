import { useGameStore } from './gameStore';

export const applyStaminaDelta = (delta: number, exhaustedCooldown = 2.5) => {
  const { stamina, maxStamina, exhaustedTime } = useGameStore.getState();
  const next = Math.min(maxStamina, Math.max(0, stamina + delta));
  useGameStore.setState({ stamina: next });

  if (next <= 0 && exhaustedTime <= 0) {
    useGameStore.setState({ exhaustedTime: exhaustedCooldown });
  }
};

export const tickExhaustion = (dt: number) => {
  const { exhaustedTime } = useGameStore.getState();
  if (exhaustedTime > 0) {
    useGameStore.setState({ exhaustedTime: Math.max(0, exhaustedTime - dt) });
  }
};
