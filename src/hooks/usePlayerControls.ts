import { useEffect, useState } from 'react';

const INITIAL_MOVEMENT = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

export const usePlayerControls = () => {
  const [movement, setMovement] = useState(INITIAL_MOVEMENT);

  useEffect(() => {
    const shouldBlock = (code: string) =>
      [
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Space',
        'ShiftLeft',
        'ShiftRight',
      ].includes(code);

    const setControl = (key: keyof typeof INITIAL_MOVEMENT, value: boolean) => {
      setMovement((current) => current[key] === value ? current : { ...current, [key]: value });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldBlock(e.code)) {
        e.preventDefault();
      }
      if (e.repeat) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControl('forward', true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControl('backward', true);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControl('left', true);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControl('right', true);
          break;
        case 'Space':
          setControl('jump', true);
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControl('sprint', true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (shouldBlock(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControl('forward', false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControl('backward', false);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControl('left', false);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControl('right', false);
          break;
        case 'Space':
          setControl('jump', false);
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControl('sprint', false);
          break;
      }
    };
    const handleBlur = () => setMovement(INITIAL_MOVEMENT);

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return movement;
};
