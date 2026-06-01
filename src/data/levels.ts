export type LevelCheckpoint = {
  index: number;
  position: readonly [number, number, number];
};

export type LevelHazard = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  phase: number;
  cycleSpeed?: number;
};

type Position = readonly [number, number, number];

export type LevelGameplay = {
  blocks: readonly { position: Position; size: Position; color: string }[];
  bridges: readonly { position: Position; size: Position }[];
  fallingRocks: readonly { position: Position; phase: number }[];
  climbZones: readonly { position: Position; size: Position }[];
  icePatches?: readonly { position: Position; size: Position }[];
  movingPlatforms?: readonly { position: Position; axis: 'x' | 'z'; distance: number; speed: number }[];
};

export const LEVELS = {
  1: {
    checkpoints: [
      { index: 1, position: [0, 1.45, 10] },
      { index: 2, position: [-5, 2.7, 18] },
      { index: 3, position: [4, 4.1, 25] },
      { index: 4, position: [-2, 5.4, 32] },
      { index: 5, position: [0, 6.95, 39] },
      { index: 6, position: [-5, 8.25, 46] },
      { index: 7, position: [3, 9.7, 53] },
    ],
    goal: [0, 11.25, 61],
    hazards: [
      { position: [4, 0.05, 6], size: [3.6, 0.16, 1.8], phase: 0.8, cycleSpeed: 2.05 },
      { position: [-5, 0.05, 4.5], size: [2.2, 0.16, 1.5], phase: 4.1, cycleSpeed: 2.72 },
      { position: [-1, 1.39, 12], size: [3.4, 0.16, 1.6], phase: 3.2, cycleSpeed: 2.38 },
      { position: [5, 1.39, 9], size: [2.2, 0.16, 1.4], phase: 5.7, cycleSpeed: 1.84 },
      { position: [0, 2.54, 20], size: [3.6, 0.16, 1.6], phase: 1.7 },
      { position: [-7, 2.54, 18.7], size: [2.1, 0.16, 1.35], phase: 4.5, cycleSpeed: 2.91 },
      { position: [3, 3.94, 27], size: [3.2, 0.16, 1.6], phase: 4.9 },
      { position: [7, 3.94, 24], size: [2, 0.16, 1.4], phase: 2.35, cycleSpeed: 1.93 },
      { position: [-5, 5.24, 31], size: [2.1, 0.16, 1.35], phase: 0.45, cycleSpeed: 2.63 },
      { position: [4, 6.84, 40.5], size: [3.2, 0.16, 1.6], phase: 2.6 },
      { position: [-1, 8.14, 47], size: [3.4, 0.16, 1.6], phase: 5.3 },
      { position: [-7, 8.14, 45], size: [2, 0.16, 1.3], phase: 1.9, cycleSpeed: 2.82 },
      { position: [5, 9.54, 54], size: [3.2, 0.16, 1.6], phase: 1.1 },
    ],
    gameplay: {
      blocks: [
        { position: [0, -1, 0], size: [46, 2, 44], color: '#59675d' },
        { position: [0, 0.65, 10], size: [18, 1.3, 10], color: '#68766b' },
        { position: [-5, 1.9, 18], size: [14, 1.2, 7], color: '#657266' },
        { position: [4, 3.2, 25], size: [13, 1.4, 7], color: '#626e62' },
        { position: [-2, 4.5, 32], size: [12, 1.4, 7], color: '#5f6b60' },
        { position: [0, 6, 39], size: [11, 1.6, 8], color: '#5c675d' },
        { position: [-5, 7.35, 46], size: [10, 1.5, 7], color: '#59645b' },
        { position: [3, 8.75, 53], size: [10, 1.6, 7], color: '#566158' },
        { position: [0, 10.2, 60], size: [10, 1.8, 8], color: '#525e55' },
      ],
      bridges: [
        { position: [-4, 2.66, 15.2], size: [4.6, 0.18, 1.7] },
        { position: [1, 5.34, 35], size: [4.2, 0.18, 1.6] },
        { position: [-2.5, 8.2, 43], size: [2, 0.18, 4.5] },
        { position: [0, 9.65, 50], size: [2, 0.18, 4.6] },
      ],
      fallingRocks: [
        { position: [2, 12, 19], phase: 0.2 },
        { position: [-3, 14, 31], phase: 0.7 },
        { position: [1, 16, 46], phase: 0.42 },
        { position: [-2, 18, 55], phase: 0.86 },
      ],
      climbZones: [
        { position: [-5, 2.2, 14.8], size: [6, 2.2, 1] },
        { position: [0, 6.2, 35.1], size: [5, 2.4, 1] },
        { position: [-5, 8.6, 43.1], size: [4.6, 2.5, 1] },
        { position: [0, 10.7, 57.1], size: [4.6, 2.7, 1] },
      ],
    },
  },
  2: {
    checkpoints: [
      { index: 1, position: [-6, 1.5, 8] },
      { index: 2, position: [5, 2.5, 14] },
      { index: 3, position: [-5, 3.7, 20] },
      { index: 4, position: [6, 5.1, 26] },
      { index: 5, position: [-3, 6.7, 32] },
      { index: 6, position: [0, 8.5, 38] },
      { index: 7, position: [7, 9.9, 45] },
      { index: 8, position: [-6, 11.45, 52] },
    ],
    goal: [0, 13.15, 60],
    hazards: [
      { position: [0, 0.05, 4], size: [5, 0.16, 2.2], phase: 0.3, cycleSpeed: 2.57 },
      { position: [-7, 0.05, 6.5], size: [2.2, 0.16, 1.5], phase: 4.8, cycleSpeed: 1.88 },
      { position: [0, 0.05, 12], size: [5.5, 0.16, 2], phase: 2.1 },
      { position: [0, 0.05, 19], size: [5, 0.16, 2], phase: 4.4 },
      { position: [0, 0.05, 27], size: [5.5, 0.16, 2], phase: 1.35 },
      { position: [-8, 1.44, 9.5], size: [2, 0.16, 1.35], phase: 3.6, cycleSpeed: 2.95 },
      { position: [7, 2.44, 15], size: [2, 0.16, 1.35], phase: 5.4, cycleSpeed: 1.79 },
      { position: [-7, 3.64, 21], size: [2.1, 0.16, 1.35], phase: 0.7, cycleSpeed: 2.69 },
      { position: [8, 5.04, 27], size: [2, 0.16, 1.35], phase: 2.9, cycleSpeed: 2.13 },
      { position: [-5, 6.64, 33], size: [2, 0.16, 1.35], phase: 4.65, cycleSpeed: 2.84 },
      { position: [-2.5, 8.29, 39], size: [3.2, 0.16, 1.7], phase: 3.7 },
      { position: [5.5, 9.69, 46], size: [3, 0.16, 1.7], phase: 0.95 },
      { position: [-4, 11.29, 53], size: [3.4, 0.16, 1.7], phase: 5.1 },
    ],
    gameplay: {
      blocks: [
        { position: [0, -1, 0], size: [42, 2, 40], color: '#6e7d89' },
        { position: [-6, 0.7, 8], size: [8, 1.4, 6], color: '#778895' },
        { position: [5, 1.65, 14], size: [7, 1.5, 6], color: '#71818e' },
        { position: [-5, 2.75, 20], size: [7, 1.7, 5], color: '#687985' },
        { position: [6, 4.1, 26], size: [7, 1.8, 5], color: '#62717d' },
        { position: [-3, 5.7, 32], size: [7, 1.8, 5], color: '#596a76' },
        { position: [0, 7.35, 38], size: [8, 2, 6], color: '#52636f' },
        { position: [7, 8.85, 45], size: [7, 1.8, 5], color: '#4e606c' },
        { position: [-6, 10.4, 52], size: [7, 1.8, 5], color: '#4b5c68' },
        { position: [0, 12, 59], size: [8, 2, 6], color: '#475864' },
      ],
      bridges: [],
      fallingRocks: [
        { position: [-1, 12, 13], phase: 0.1 },
        { position: [4, 15, 25], phase: 0.56 },
        { position: [-2, 18, 41], phase: 0.32 },
        { position: [3, 20, 53], phase: 0.78 },
      ],
      climbZones: [
        { position: [-5, 3.6, 17.4], size: [4, 2.4, 1] },
        { position: [-3, 6.8, 29.4], size: [4, 2.6, 1] },
        { position: [7, 9.7, 42.4], size: [4, 2.6, 1] },
        { position: [0, 12.8, 56.4], size: [4.2, 2.8, 1] },
      ],
      icePatches: [
        { position: [-5.8, 1.44, 8], size: [4.2, 0.08, 3.4] },
        { position: [5, 2.44, 14], size: [3.8, 0.08, 3] },
        { position: [-3, 6.64, 32], size: [3.8, 0.08, 3] },
        { position: [7, 9.79, 45], size: [3.8, 0.08, 3] },
        { position: [-6, 11.34, 52], size: [3.6, 0.08, 3] },
      ],
      movingPlatforms: [
        { position: [0, 3.2, 18], axis: 'x', distance: 4.2, speed: 0.82 },
        { position: [1, 5.5, 28], axis: 'z', distance: 2.4, speed: 1.08 },
        { position: [0, 9.2, 42], axis: 'x', distance: 4.8, speed: 0.9 },
        { position: [0, 11.6, 55], axis: 'z', distance: 2.8, speed: 1.16 },
      ],
    },
  },
} as const satisfies Record<number, {
  checkpoints: readonly LevelCheckpoint[];
  goal: readonly [number, number, number];
  hazards: readonly LevelHazard[];
  gameplay: LevelGameplay;
}>;
