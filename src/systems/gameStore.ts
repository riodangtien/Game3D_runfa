import { create } from 'zustand';
import { applyGoalReached, applyHazardHit } from './gameRules';
import { clearPlayerProgress, loadPlayerProgress, savePlayerProgress } from './playerProgress';

export type Vec3 = { x: number; y: number; z: number };
export type GraphicsQuality = 'performance' | 'balanced';

const defaultCheckpoint: Vec3 = { x: 0, y: 1.05, z: 0 };
const savedProgress = loadPlayerProgress();
const initialProgress = savedProgress?.level === 1 ? savedProgress : null;
const SETTINGS_KEY = 'mountain-climber-settings';
const loadSettings = () => {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const settings = parsed as Record<string, unknown>;
    return {
      cameraSensitivity:
        typeof settings.cameraSensitivity === 'number'
          ? Math.min(2.4, Math.max(0.35, settings.cameraSensitivity))
          : 1.1,
      soundVolume:
        typeof settings.soundVolume === 'number'
          ? Math.min(1, Math.max(0, settings.soundVolume))
          : 0.65,
      graphicsQuality:
        settings.graphicsQuality === 'performance' ? 'performance' as const : 'balanced' as const,
    };
  } catch {
    return null;
  }
};
const savedSettings = loadSettings();
const saveSettings = (settings: {
  cameraSensitivity: number;
  soundVolume: number;
  graphicsQuality: GraphicsQuality;
}) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
type GameState = {
  level: number;
  maxLevels: number;
  teleportVersion: number;
  runVersion: number;
  cameraSensitivity: number;
  soundVolume: number;
  graphicsQuality: GraphicsQuality;
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
  platformVelocity: Vec3;
  checkpointsHit: number;
  totalCheckpoints: number;
  lastCheckpoint: Vec3;
  falls: number;
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
  setGraphicsQuality: (value: GraphicsQuality) => void;
  addFall: () => void;
  hitHazard: () => void;
  setWin: () => void;
  reachGoal: () => void;
  setSlippery: (value: boolean) => void;
  setWind: (value: Vec3) => void;
  setPlatformVelocity: (value: Vec3) => void;
  setExhaustedTime: (value: number) => void;
  updateExhausted: (dt: number) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  level: initialProgress?.level ?? 1,
  maxLevels: 1,
  teleportVersion: 0,
  runVersion: 0,
  cameraSensitivity: savedSettings?.cameraSensitivity ?? 1.1,
  soundVolume: savedSettings?.soundVolume ?? 0.65,
  graphicsQuality: savedSettings?.graphicsQuality ?? 'balanced',
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
  platformVelocity: { x: 0, y: 0, z: 0 },
  checkpointsHit: initialProgress?.checkpointsHit ?? 0,
  totalCheckpoints: 0,
  lastCheckpoint: initialProgress?.lastCheckpoint ?? defaultCheckpoint,
  falls: 0,
  win: false,
  lose: false,
  start: () => set({ started: true }),
  setPaused: (value) => set({ paused: value }),
  setInstructionOpen: (value) => set({ instructionOpen: value }),
  reset: () => {
    clearPlayerProgress();
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
      platformVelocity: { x: 0, y: 0, z: 0 },
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    }));
  },
  restart: () => {
    clearPlayerProgress();
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
      platformVelocity: { x: 0, y: 0, z: 0 },
      checkpointsHit: 0,
      lastCheckpoint: defaultCheckpoint,
      falls: 0,
      win: false,
      lose: false,
    }));
  },
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
    set((state) => {
      const checkpointsHit = Math.max(state.checkpointsHit, index);
      savePlayerProgress({
        level: state.level,
        checkpointsHit,
        lastCheckpoint: pos,
      });
      return {
        lastCheckpoint: pos,
        checkpointsHit,
        soundEvent: 'checkpoint',
        soundVersion: state.soundVersion + 1,
      };
    }),
  setTotalCheckpoints: (count) => set({ totalCheckpoints: count }),
  setCameraSensitivity: (cameraSensitivity) =>
    set((state) => {
      saveSettings({
        cameraSensitivity,
        soundVolume: state.soundVolume,
        graphicsQuality: state.graphicsQuality,
      });
      return { cameraSensitivity };
    }),
  setSoundVolume: (soundVolume) =>
    set((state) => {
      saveSettings({
        cameraSensitivity: state.cameraSensitivity,
        soundVolume,
        graphicsQuality: state.graphicsQuality,
      });
      return { soundVolume };
    }),
  setGraphicsQuality: (graphicsQuality) =>
    set((state) => {
      saveSettings({
        cameraSensitivity: state.cameraSensitivity,
        soundVolume: state.soundVolume,
        graphicsQuality,
      });
      return { graphicsQuality };
    }),
  addFall: () =>
    set((state) => {
      const falls = state.falls + 1;
      return {
        falls,
        lose: false,
        started: state.started,
      };
    }),
  hitHazard: () =>
    set((state) => {
      if (state.respawnTime > 0) return state;
      return {
        ...applyHazardHit(state),
        wind: { x: 0, y: 0, z: 0 },
        platformVelocity: { x: 0, y: 0, z: 0 },
        teleportVersion: state.teleportVersion,
        respawnTime: 0.78,
        soundEvent: 'hazard',
        soundVersion: state.soundVersion + 1,
        hitVersion: state.hitVersion + 1,
      };
    }),
  setWin: () => set({ win: true, started: false }),
  reachGoal: () =>
    set((state) => {
      const progress = applyGoalReached(state);
      if ('win' in progress && progress.win) clearPlayerProgress();
      return progress;
    }),
  setSlippery: (value) => set({ slippery: value }),
  setWind: (value) => set({ wind: value }),
  setPlatformVelocity: (value) =>
    set((state) => {
      const current = state.platformVelocity;
      if (
        Math.abs(current.x - value.x) < 0.02 &&
        Math.abs(current.y - value.y) < 0.02 &&
        Math.abs(current.z - value.z) < 0.02
      ) {
        return state;
      }
      return { platformVelocity: value };
    }),
  setExhaustedTime: (value) => set({ exhaustedTime: value }),
  updateExhausted: (dt) =>
    set((state) => ({
      exhaustedTime: Math.max(0, state.exhaustedTime - dt),
    })),
}));
