import { create } from 'zustand';
import { applyGoalReached, applyHazardHit } from './gameRules';

export type Vec3 = { x: number; y: number; z: number };

const defaultCheckpoint: Vec3 = { x: 0, y: 1.05, z: 0 };
const levelTwoSpawn: Vec3 = { x: 0, y: 1.05, z: 0 };

type GameState = {
  level: number;
  maxLevels: number;
  teleportVersion: number;
  cameraSensitivity: number;
  transitionTime: number;
  soundEvent: string;
  soundVersion: number;
  hitVersion: number;
  started: boolean;
  time: number;
  stamina: number;
  maxStamina: number;
  exhaustedTime: number;
  inClimbZone: boolean;
  slippery: boolean;
  checkpointsHit: number;
  totalCheckpoints: number;
  lastCheckpoint: Vec3;
  falls: number;
  maxFalls: number;
  win: boolean;
  lose: boolean;
  start: () => void;
  reset: () => void;
  restart: () => void;
  updateTime: (dt: number) => void;
  tickTransition: (dt: number) => void;
  emitSound: (event: string) => void;
  setCheckpoint: (pos: Vec3, index: number) => void;
  setTotalCheckpoints: (count: number) => void;
  setCameraSensitivity: (value: number) => void;
  addFall: () => void;
  hitHazard: () => void;
  setWin: () => void;
  reachGoal: () => void;
  setInClimbZone: (value: boolean) => void;
  setSlippery: (value: boolean) => void;
  setExhaustedTime: (value: number) => void;
  updateExhausted: (dt: number) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  maxLevels: 2,
  teleportVersion: 0,
  cameraSensitivity: 0.7,
  transitionTime: 0,
  soundEvent: '',
  soundVersion: 0,
  hitVersion: 0,
  started: false,
  time: 0,
  stamina: 100,
  maxStamina: 100,
  exhaustedTime: 0,
  inClimbZone: false,
  slippery: false,
  checkpointsHit: 0,
  totalCheckpoints: 0,
  lastCheckpoint: defaultCheckpoint,
  falls: 0,
  maxFalls: 5,
  win: false,
  lose: false,
  start: () => set({ started: true }),
  reset: () =>
    set((state) => ({
      started: false,
      level: 1,
      teleportVersion: state.teleportVersion + 1,
      time: 0,
      transitionTime: 0,
      stamina: 100,
      exhaustedTime: 0,
      inClimbZone: false,
      slippery: false,
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    })),
  restart: () =>
    set((state) => ({
      started: true,
      level: 1,
      teleportVersion: state.teleportVersion + 1,
      time: 0,
      transitionTime: 0,
      stamina: 100,
      exhaustedTime: 0,
      inClimbZone: false,
      slippery: false,
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    })),
  updateTime: (dt) => {
    const { started, win, lose } = get();
    if (!started || win || lose) return;
    set((state) => ({ time: state.time + dt }));
  },
  tickTransition: (dt) => set((state) => ({ transitionTime: Math.max(0, state.transitionTime - dt) })),
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
        inClimbZone: false,
        slippery: false,
        transitionTime: 2.1,
        soundEvent: 'level',
        soundVersion: state.soundVersion + 1,
        checkpointsHit: 0,
        lastCheckpoint: levelTwoSpawn,
      };
    }),
  hitHazard: () =>
    set((state) => {
      return {
        ...applyHazardHit(state),
        soundEvent: 'hazard',
        soundVersion: state.soundVersion + 1,
        hitVersion: state.hitVersion + 1,
      };
    }),
  setInClimbZone: (value) => set({ inClimbZone: value }),
  setSlippery: (value) => set({ slippery: value }),
  setExhaustedTime: (value) => set({ exhaustedTime: value }),
  updateExhausted: (dt) =>
    set((state) => ({
      exhaustedTime: Math.max(0, state.exhaustedTime - dt),
    })),
}));
