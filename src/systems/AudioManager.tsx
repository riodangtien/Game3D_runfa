import { useEffect, useRef } from 'react';
import { useGameStore } from './gameStore';

const toneByEvent: Record<string, [number, number]> = {
  jump: [240, 0.08],
  checkpoint: [620, 0.18],
  hazard: [95, 0.22],
  level: [420, 0.42],
  land: [150, 0.06],
};

export const AudioManager = () => {
  const started = useGameStore((state) => state.started);
  const soundEvent = useGameStore((state) => state.soundEvent);
  const soundVersion = useGameStore((state) => state.soundVersion);
  const contextRef = useRef<AudioContext | null>(null);
  const windRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!started) return;
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    void context.resume();

    if (!windRef.current) {
      const wind = context.createOscillator();
      const gain = context.createGain();
      wind.type = 'sine';
      wind.frequency.value = 58;
      gain.gain.value = 0.012;
      wind.connect(gain).connect(context.destination);
      wind.start();
      windRef.current = wind;
    }
  }, [started]);

  useEffect(() => {
    const config = toneByEvent[soundEvent];
    const context = contextRef.current;
    if (!context || !config || soundVersion === 0) return;
    const [frequency, duration] = config;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = soundEvent === 'hazard' ? 'sawtooth' : 'sine';
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, [soundEvent, soundVersion]);

  return null;
};
