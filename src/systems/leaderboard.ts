export type LeaderboardEntry = {
  id: string;
  name: string;
  time: number;
  falls: number;
  completedAt: string;
};

const STORAGE_KEY = 'mountain-climber-leaderboard';
const PLAYER_NAME_KEY = 'mountain-climber-player-name';
const MAX_ENTRIES = 10;

const isBrowser = typeof window !== 'undefined';

const normalizeName = (name: string) => {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  return cleaned.length > 0 ? cleaned.slice(0, 18) : 'Player';
};

const isEntry = (value: unknown): value is LeaderboardEntry => {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.time === 'number' &&
    Number.isFinite(entry.time) &&
    typeof entry.falls === 'number' &&
    Number.isFinite(entry.falls) &&
    typeof entry.completedAt === 'string'
  );
};

export const compareScores = (a: Pick<LeaderboardEntry, 'time' | 'falls'>, b: Pick<LeaderboardEntry, 'time' | 'falls'>) => {
  if (a.time !== b.time) return a.time - b.time;
  return a.falls - b.falls;
};

export const sortLeaderboard = (entries: LeaderboardEntry[]) =>
  [...entries].sort(compareScores).slice(0, MAX_ENTRIES);

export const loadPlayerName = () => {
  if (!isBrowser) return 'Player';
  return normalizeName(window.localStorage.getItem(PLAYER_NAME_KEY) ?? 'Player');
};

export const savePlayerName = (name: string) => {
  const normalized = normalizeName(name);
  if (isBrowser) window.localStorage.setItem(PLAYER_NAME_KEY, normalized);
  return normalized;
};

export const loadLeaderboard = (): LeaderboardEntry[] => {
  if (!isBrowser) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return sortLeaderboard(Array.isArray(parsed) ? parsed.filter(isEntry) : []);
  } catch {
    return [];
  }
};

const saveLeaderboard = (entries: LeaderboardEntry[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortLeaderboard(entries)));
};

export const recordLeaderboardScore = ({
  name,
  time,
  falls,
}: {
  name: string;
  time: number;
  falls: number;
}) => {
  const normalized = savePlayerName(name);
  const nextEntry: LeaderboardEntry = {
    id: `${normalized.toLowerCase()}-${Date.now()}`,
    name: normalized,
    time: Math.max(0, Math.floor(time)),
    falls: Math.max(0, Math.floor(falls)),
    completedAt: new Date().toISOString(),
  };
  const entries = loadLeaderboard();
  const existing = entries.find((entry) => entry.name.toLowerCase() === normalized.toLowerCase());
  const shouldSave = !existing || compareScores(nextEntry, existing) < 0;
  const nextEntries = shouldSave
    ? [...entries.filter((entry) => entry.name.toLowerCase() !== normalized.toLowerCase()), nextEntry]
    : entries;

  saveLeaderboard(nextEntries);
  return {
    entry: shouldSave ? nextEntry : existing ?? nextEntry,
    isNewRecord: shouldSave,
    leaderboard: sortLeaderboard(nextEntries),
  };
};

export const getLeaderboardStorageKey = () => STORAGE_KEY;
