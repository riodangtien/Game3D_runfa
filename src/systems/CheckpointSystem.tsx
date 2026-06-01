import { useEffect } from 'react';
import { Checkpoint } from '../components/game/Checkpoint';
import { GoalFlag } from '../components/game/GoalFlag';
import { useGameStore } from './gameStore';
import { LEVELS } from '../data/levels';

export const CheckpointSystem = () => {
  const setTotalCheckpoints = useGameStore((state) => state.setTotalCheckpoints);
  const level = useGameStore((state) => state.level);
  const config = LEVELS[level as keyof typeof LEVELS];
  const checkpoints = config.checkpoints;

  useEffect(() => {
    setTotalCheckpoints(checkpoints.length);
  }, [checkpoints.length, setTotalCheckpoints]);

  return (
    <group>
      {checkpoints.map((checkpoint) => (
        <Checkpoint
          key={checkpoint.index}
          index={checkpoint.index}
          position={checkpoint.position}
        />
      ))}
      <GoalFlag position={config.goal} />
    </group>
  );
};
