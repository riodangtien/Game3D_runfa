export type LevelCheckpoint = {
  index: number;
  position: readonly [number, number, number];
};

type Position = readonly [number, number, number];
export type AmbushKind = 'rock' | 'tree' | 'crate';

export type LevelGameplay = {
  blocks: readonly { position: Position; size: Position; color: string }[];
  trapFloors: readonly { position: Position; size: Position; color: string; delay?: number }[];
  ambushDrops: readonly {
    kind: AmbushKind;
    triggerPosition: Position;
    dropPosition: Position;
    restPosition: Position;
    rollDirection: Position;
  }[];
  chestTraps: readonly { position: Position; chargeDirection?: Position }[];
  snareTraps: readonly { position: Position; rotation?: number }[];
  icePatches?: readonly { position: Position; size: Position }[];
  iceRafts?: readonly {
    position: Position;
    size: Position;
    axis: 'x' | 'z';
    distance: number;
    speed: number;
  }[];
  windZones?: readonly { position: Position; size: Position; push: Position }[];
};

export const LEVELS = {
  1: {
    checkpoints: [
      { index: 1, position: [-2, 1.35, 13] },
      { index: 2, position: [3, 2.5, 23] },
      { index: 3, position: [-3, 3.65, 33] },
      { index: 4, position: [3, 4.8, 43] },
      { index: 5, position: [-2, 5.95, 53] },
      { index: 6, position: [2, 7.1, 63] },
      { index: 7, position: [-1, 8.25, 73] },
    ],
    goal: [0, 9.45, 83],
    gameplay: {
      blocks: [
        { position: [0, -1, 0], size: [27, 2, 16], color: '#59675d' },
        { position: [-2, 0.6, 13], size: [15, 1.2, 7], color: '#68766b' },
        { position: [3, 1.18, 23], size: [14, 2.35, 7], color: '#657266' },
        { position: [-3, 1.75, 33], size: [14, 3.5, 7], color: '#626e62' },
        { position: [3, 2.33, 43], size: [13, 4.65, 7], color: '#5f6b60' },
        { position: [-2, 2.9, 53], size: [13, 5.8, 7], color: '#5c675d' },
        { position: [2, 3.48, 63], size: [12, 6.95, 7], color: '#59645b' },
        { position: [-1, 4.05, 73], size: [12, 8.1, 7], color: '#566158' },
        { position: [0, 4.63, 83], size: [12, 9.25, 7], color: '#525e55' },
      ],
      trapFloors: [
        { position: [-1, 2.57, 28], size: [2.65, 0.3, 2.7], color: '#8fb879', delay: 0.42 },
        { position: [0, 6.02, 58], size: [2.7, 0.3, 2.7], color: '#8fb879', delay: 0.5 },
        { position: [-1, 7.17, 68], size: [2.65, 0.3, 2.7], color: '#8fb879', delay: 0.38 },
        { position: [1, 8.32, 78], size: [2.8, 0.3, 2.7], color: '#8fb879', delay: 0.56 },
        { position: [0.4, 4.87, 38], size: [2.6, 0.3, 2.65], color: '#8fb879', delay: 0.31 },
      ],
      ambushDrops: [
        { kind: 'crate', triggerPosition: [3, 2.5, 20], dropPosition: [3, 11, 23], restPosition: [3, 2.98, 23], rollDirection: [1, 0, 0] },
        { kind: 'rock', triggerPosition: [3, 3.7, 30], dropPosition: [3, 12, 33], restPosition: [3, 4.32, 33], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [3, 4.8, 40], dropPosition: [3, 14, 43], restPosition: [3, 5.48, 43], rollDirection: [-1, 0, 0] },
        { kind: 'tree', triggerPosition: [3, 5.9, 50], dropPosition: [3, 15, 53], restPosition: [3, 6.22, 53], rollDirection: [0, 0, -1] },
        { kind: 'rock', triggerPosition: [2, 7.1, 60], dropPosition: [2, 17, 63], restPosition: [2, 7.78, 63], rollDirection: [-1, 0, 0] },
        { kind: 'crate', triggerPosition: [2, 8.2, 70], dropPosition: [2, 18, 73], restPosition: [2, 8.73, 73], rollDirection: [1, 0, 0] },
        { kind: 'tree', triggerPosition: [-2, 4.8, 46], dropPosition: [-2, 15, 49], restPosition: [-2, 5.42, 49], rollDirection: [0, 0, -1] },
        { kind: 'rock', triggerPosition: [-1, 8.25, 76], dropPosition: [-1, 19, 79], restPosition: [-1, 8.92, 79], rollDirection: [-1, 0, 0] },
      ],
      chestTraps: [
        { position: [4.8, 4.82, 43], chargeDirection: [-1, 0, 0] },
        { position: [-3.8, 7.12, 63], chargeDirection: [1, 0, 0] },
        { position: [3.8, 5.97, 53], chargeDirection: [-1, 0, 0] },
      ],
      snareTraps: [
        { position: [-1.4, 2.57, 23], rotation: 0.2 },
        { position: [1.6, 5.97, 53], rotation: -0.35 },
        { position: [-1.2, 8.27, 73], rotation: 0.5 },
        { position: [1.1, 4.82, 43], rotation: -0.18 },
      ],
    },
  },
  2: {
    checkpoints: [
      { index: 1, position: [-5, 1.55, 16] },
      { index: 2, position: [5, 3.25, 31] },
      { index: 3, position: [-5, 4.95, 47] },
      { index: 4, position: [5, 6.65, 63] },
      { index: 5, position: [-4, 8.35, 79] },
      { index: 6, position: [0, 10.05, 95] },
    ],
    goal: [0, 10.05, 95],
    gameplay: {
      blocks: [
        { position: [0, -1, 0], size: [25, 2, 16], color: '#687b86' },
        { position: [-5, 0.7, 16], size: [10, 1.4, 6], color: '#718691' },
        { position: [5, 1.55, 31], size: [9, 3.1, 6], color: '#687e89' },
        { position: [-5, 2.4, 47], size: [8, 4.8, 6], color: '#607681' },
        { position: [5, 3.25, 63], size: [8, 6.5, 6], color: '#586f7a' },
        { position: [-4, 4.1, 79], size: [8, 8.2, 6], color: '#526975' },
        { position: [0, 4.95, 95], size: [10, 9.9, 7], color: '#4b626e' },
      ],
      trapFloors: [],
      ambushDrops: [
        { kind: 'rock', triggerPosition: [-5, 1.55, 13], dropPosition: [-5, 11, 16], restPosition: [-5, 2.22, 16], rollDirection: [1, 0, 0] },
        { kind: 'rock', triggerPosition: [5, 3.25, 28], dropPosition: [5, 13, 31], restPosition: [5, 3.92, 31], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [-5, 4.95, 44], dropPosition: [-5, 15, 47], restPosition: [-5, 5.62, 47], rollDirection: [1, 0, 0] },
        { kind: 'rock', triggerPosition: [-4, 8.35, 76], dropPosition: [-4, 18, 79], restPosition: [-4, 9.02, 79], rollDirection: [1, 0, 0] },
      ],
      chestTraps: [],
      snareTraps: [],
      icePatches: [
        { position: [-5, 1.43, 16], size: [4, 0.08, 3] },
        { position: [5, 3.13, 31], size: [3.8, 0.08, 3] },
        { position: [-5, 4.83, 47], size: [3.6, 0.08, 3] },
        { position: [5, 6.53, 63], size: [3.6, 0.08, 3] },
        { position: [-4, 8.23, 79], size: [3.6, 0.08, 3] },
      ],
      iceRafts: [
        { position: [0, 1.62, 23.5], size: [3.8, 0.34, 3.8], axis: 'x', distance: 4.2, speed: 0.82 },
        { position: [0, 3.32, 39], size: [3.6, 0.34, 3.8], axis: 'x', distance: 4.6, speed: 0.96 },
        { position: [0, 5.02, 55], size: [3.5, 0.34, 3.8], axis: 'x', distance: 4.8, speed: 1.08 },
        { position: [0, 6.72, 71], size: [3.3, 0.34, 3.7], axis: 'x', distance: 5.1, speed: 1.18 },
        { position: [0, 8.42, 87], size: [3.2, 0.34, 3.6], axis: 'x', distance: 4.4, speed: 1.3 },
      ],
      windZones: [
        { position: [0, 6.9, 55], size: [13, 3.4, 8], push: [2.2, 0, 0] },
        { position: [0, 8.6, 71], size: [14, 3.4, 8], push: [-2.65, 0, 0] },
        { position: [0, 10.3, 87], size: [13, 3.4, 8], push: [3, 0, 0] },
      ],
    },
  },
} as const satisfies Record<number, {
  checkpoints: readonly LevelCheckpoint[];
  goal: readonly [number, number, number];
  gameplay: LevelGameplay;
}>;
