import { useMemo } from 'react';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useGameStore } from '../../systems/gameStore';

export const DebugHUD = () => {
  const input = usePlayerControls();
  const started = useGameStore((state) => state.started);
  const stamina = useGameStore((state) => state.stamina);

  const activeKeys = useMemo(() => {
    return Object.entries(input)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(', ');
  }, [input]);

  return (
    <div className="debug-hud">
      <div>started: {String(started)}</div>
      <div>stamina: {Math.round(stamina)}</div>
      <div>keys: {activeKeys || 'none'}</div>
    </div>
  );
};
