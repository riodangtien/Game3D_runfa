export type Vec3 = { x: number; y: number; z: number };
export type PlayerProgress = {
  level: number;
  checkpointsHit: number;
  lastCheckpoint: Vec3;
};

const STORAGE_KEY = 'mountain-climber-player-progress';
const isBrowser = typeof window !== 'undefined';

const isFiniteVec3 = (value: unknown): value is Vec3 => {
  if (!value || typeof value !== 'object') return false;
  const vector = value as Record<string, unknown>;
  return (
    typeof vector.x === 'number' &&
    Number.isFinite(vector.x) &&
    typeof vector.y === 'number' &&
    Number.isFinite(vector.y) &&
    typeof vector.z === 'number' &&
    Number.isFinite(vector.z)
  );
};

export const isPlayerProgress = (value: unknown): value is PlayerProgress => {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Record<string, unknown>;
  return (
    typeof progress.level === 'number' &&
    Number.isInteger(progress.level) &&
    progress.level >= 1 &&
    typeof progress.checkpointsHit === 'number' &&
    Number.isInteger(progress.checkpointsHit) &&
    progress.checkpointsHit >= 0 &&
    isFiniteVec3(progress.lastCheckpoint)
  );
};

export const loadPlayerProgress = (): PlayerProgress | null => {
  if (!isBrowser) return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    return isPlayerProgress(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const savePlayerProgress = (progress: PlayerProgress) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const clearPlayerProgress = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getPlayerProgressStorageKey = () => STORAGE_KEY;
