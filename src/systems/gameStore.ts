import { create } from 'zustand';
import { applyGoalReached, applyHazardHit } from './gameRules';

export type Vec3 = { x: number; y: number; z: number };

const defaultCheckpoint: Vec3 = { x: 0, y: 1.05, z: 0 };
const levelTwoSpawn: Vec3 = { x: 0, y: 1.05, z: 0 };

type GameState = {
  level: number;
  maxLevels: number;
  teleportVersion: number;
  runVersion: number;
  cameraSensitivity: number;
  soundVolume: number;
  transitionTime: number;
  respawnTime: number;
  soundEvent: string;
  soundVersion: number;
  hitVersion: number;
  started: boolean;
  paused: boolean;
  instructionOpen: boolean;
  time: number;
  stamina: number;
  maxStamina: number;
  exhaustedTime: number;
  slippery: boolean;
  wind: Vec3;
  checkpointsHit: number;
  totalCheckpoints: number;
  lastCheckpoint: Vec3;
  falls: number;
  maxFalls: number;
  win: boolean;
  lose: boolean;
  start: () => void;
  setPaused: (value: boolean) => void;
  setInstructionOpen: (value: boolean) => void;
  reset: () => void;
  restart: () => void;
  updateTime: (dt: number) => void;
  tickTransition: (dt: number) => void;
  tickRespawn: (dt: number) => void;
  emitSound: (event: string) => void;
  setCheckpoint: (pos: Vec3, index: number) => void;
  setTotalCheckpoints: (count: number) => void;
  setCameraSensitivity: (value: number) => void;
  setSoundVolume: (value: number) => void;
  addFall: () => void;
  hitHazard: () => void;
  setWin: () => void;
  reachGoal: () => void;
  setSlippery: (value: boolean) => void;
  setWind: (value: Vec3) => void;
  setExhaustedTime: (value: number) => void;
  updateExhausted: (dt: number) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  maxLevels: 2,
  teleportVersion: 0,
  runVersion: 0,
  cameraSensitivity: 0.7,
  soundVolume: 0.65,
  transitionTime: 0,
  respawnTime: 0,
  soundEvent: '',
  soundVersion: 0,
  hitVersion: 0,
  started: false,
  paused: false,
  instructionOpen: false,
  time: 0,
  stamina: 100,
  maxStamina: 100,
  exhaustedTime: 0,
  slippery: false,
  wind: { x: 0, y: 0, z: 0 },
  checkpointsHit: 0,
  totalCheckpoints: 0,
  lastCheckpoint: defaultCheckpoint,
  falls: 0,
  maxFalls: 5,
  win: false,
  lose: false,
  start: () => set({ started: true }),
  setPaused: (value) => set({ paused: value }),
  setInstructionOpen: (value) => set({ instructionOpen: value }),
  reset: () =>
    set((state) => ({
      started: false,
      paused: false,
      instructionOpen: false,
      level: 1,
      teleportVersion: state.teleportVersion + 1,
      runVersion: state.runVersion + 1,
      time: 0,
      transitionTime: 0,
      respawnTime: 0,
      stamina: 100,
      exhaustedTime: 0,
      slippery: false,
      wind: { x: 0, y: 0, z: 0 },
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    })),
  restart: () =>
    set((state) => ({
      started: true,
      paused: false,
      instructionOpen: false,
      level: 1,
      teleportVersion: state.teleportVersion + 1,
      runVersion: state.runVersion + 1,
      time: 0,
      transitionTime: 0,
      respawnTime: 0,
      stamina: 100,
      exhaustedTime: 0,
      slippery: false,
      wind: { x: 0, y: 0, z: 0 },
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    })),
  updateTime: (dt) => {
    const { started, paused, win, lose } = get();
    if (!started || paused || win || lose) return;
    set((state) => ({ time: state.time + dt }));
  },
  tickTransition: (dt) => set((state) => ({ transitionTime: Math.max(0, state.transitionTime - dt) })),
  tickRespawn: (dt) =>
    set((state) => {
      if (state.respawnTime <= 0) return state;
      const respawnTime = Math.max(0, state.respawnTime - dt);
      return {
        respawnTime,
        teleportVersion: respawnTime === 0 ? state.teleportVersion + 1 : state.teleportVersion,
      };
    }),
  emitSound: (event) => set((state) => ({ soundEvent: event, soundVersion: state.soundVersion + 1 })),
  setCheckpoint: (pos, index) =>
    set((state) => ({
      lastCheckpoint: pos,
      checkpointsHit: Math.max(state.checkpointsHit, index),
      soundEvent: 'checkpoint',
      soundVersion: state.soundVersion + 1,
    })),
  setTotalCheckpoints: (count) => set({ totalCheckpoints: count }),
  setCameraSensitivity: (value) => set({ cameraSensitivity: value }),
  setSoundVolume: (value) => set({ soundVolume: value }),
  addFall: () =>
    set((state) => {
      const falls = state.falls + 1;
      return {
        falls,
        lose: falls >= state.maxFalls,
        started: falls >= state.maxFalls ? false : state.started,
      };
    }),
  setWin: () => set({ win: true, started: false }),
  reachGoal: () =>
    set((state) => {
      const progress = applyGoalReached(state);
      if ('win' in progress) return progress;

      return {
        ...progress,
        stamina: state.maxStamina,
        exhaustedTime: 0,
        slippery: false,
        wind: { x: 0, y: 0, z: 0 },
        transitionTime: 2.1,
        soundEvent: 'level',
        soundVersion: state.soundVersion + 1,
        checkpointsHit: 0,
        lastCheckpoint: levelTwoSpawn,
      };
    }),
  hitHazard: () =>
    set((state) => {
      if (state.respawnTime > 0) return state;
      const progress = applyHazardHit(state);
      return {
        ...progress,
        wind: { x: 0, y: 0, z: 0 },
        teleportVersion: state.teleportVersion,
        respawnTime: progress.lose ? 0 : 0.78,
        soundEvent: 'hazard',
        soundVersion: state.soundVersion + 1,
        hitVersion: state.hitVersion + 1,
      };
    }),
  setSlippery: (value) => set({ slippery: value }),
  setWind: (value) => set({ wind: value }),
  setExhaustedTime: (value) => set({ exhaustedTime: value }),
  updateExhausted: (dt) =>
    set((state) => ({
      exhaustedTime: Math.max(0, state.exhaustedTime - dt),
    })),
}));
