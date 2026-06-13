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
  lavaJets?: readonly {
    position: Position;
    radius: number;
    height: number;
    interval: number;
    activeTime: number;
    phase?: number;
  }[];
  sweepTraps?: readonly {
    position: Position;
    length: number;
    speed: number;
    phase?: number;
  }[];
  pendulumTraps?: readonly {
    position: Position;
    length: number;
    speed: number;
    phase?: number;
  }[];
  crusherTraps?: readonly {
    position: Position;
    width: number;
    speed: number;
    phase?: number;
  }[];
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
      { index: 8, position: [-33, 9.95, 98] },
      { index: 9, position: [-23, 11.65, 113] },
      { index: 10, position: [-33, 13.35, 129] },
      { index: 11, position: [-23, 15.05, 145] },
      { index: 12, position: [-32, 16.75, 161] },
      { index: 13, position: [-28, 18.45, 177] },
      { index: 14, position: [-28, 17.9, 184] },
      { index: 15, position: [-22, 14.45, 199] },
      { index: 16, position: [-28, 12.25, 210] },
      { index: 17, position: [-20, 13.95, 222] },
      { index: 18, position: [-12, 15.8, 234] },
      { index: 19, position: [-5, 17.5, 246] },
      { index: 20, position: [0, 19.45, 258] },
      { index: 21, position: [7, 21.3, 270] },
      { index: 22, position: [-2, 22.95, 282] },
      { index: 23, position: [7, 24.65, 294] },
      { index: 24, position: [0, 26.45, 306] },
      { index: 25, position: [-8, 28.25, 318] },
      { index: 26, position: [3, 30.05, 330] },
      { index: 27, position: [-7, 31.85, 342] },
      { index: 28, position: [4, 33.65, 354] },
      { index: 29, position: [0, 35.45, 366] },
    ],
    goal: [0, 35.45, 366],
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
        { position: [-14, 4.6, 89], size: [28, 9.2, 5], color: '#59645b' },
        { position: [-28, 7.4, 82], size: [25, 2, 16], color: '#687b86' },
        { position: [-33, 9.1, 98], size: [10, 1.4, 6], color: '#718691' },
        { position: [-23, 9.95, 113], size: [9, 3.1, 6], color: '#687e89' },
        { position: [-33, 10.8, 129], size: [8, 4.8, 6], color: '#607681' },
        { position: [-23, 11.65, 145], size: [8, 6.5, 6], color: '#586f7a' },
        { position: [-32, 12.5, 161], size: [8, 8.2, 6], color: '#526975' },
        { position: [-28, 13.35, 177], size: [10, 9.9, 7], color: '#4b626e' },
        { position: [-28, 12.5, 188], size: [12, 8.6, 8], color: '#4a4641' },
        { position: [-22, 10.85, 199], size: [13, 6.9, 8], color: '#4d3f37' },
        { position: [-28, 9.45, 210], size: [12, 5.3, 8], color: '#493630' },
        { position: [-20, 10.6, 222], size: [10, 6.4, 8], color: '#5a5650' },
        { position: [-12, 11.85, 234], size: [9, 7.6, 8], color: '#625f58' },
        { position: [-5, 12.85, 246], size: [9, 9.0, 8], color: '#6b665e' },
        { position: [0, 14.1, 258], size: [10, 10.4, 8], color: '#716b62' },
        { position: [7, 15.25, 270], size: [9, 11.8, 8], color: '#69645d' },
        { position: [-2, 16.2, 282], size: [9, 13.2, 8], color: '#625e58' },
        { position: [7, 17.2, 294], size: [8, 14.6, 8], color: '#5c5954' },
        { position: [0, 18.3, 306], size: [11, 16.0, 9], color: '#69655f' },
        { position: [-8, 19.2, 318], size: [10, 17.8, 9], color: '#625e58' },
        { position: [3, 20.1, 330], size: [11, 19.6, 9], color: '#595650' },
        { position: [-7, 21.0, 342], size: [10, 21.4, 9], color: '#514f4a' },
        { position: [4, 21.9, 354], size: [10, 23.2, 9], color: '#494844' },
        { position: [0, 22.8, 366], size: [13, 25.0, 10], color: '#42413e' },
      ],
      trapFloors: [
        { position: [-1, 2.57, 28], size: [2.65, 0.3, 2.7], color: '#8fb879', delay: 0.42 },
        { position: [0, 6.02, 58], size: [2.7, 0.3, 2.7], color: '#8fb879', delay: 0.5 },
        { position: [1, 8.32, 78], size: [2.8, 0.3, 2.7], color: '#8fb879', delay: 0.56 },
        { position: [-25.2, 15.25, 193.5], size: [2.45, 0.3, 2.55], color: '#7a4632', delay: 0.34 },
        { position: [-24.6, 13.25, 204.5], size: [2.55, 0.3, 2.65], color: '#7a4632', delay: 0.4 },
        { position: [-16, 14.85, 228], size: [2.5, 0.3, 2.6], color: '#807468', delay: 0.46 },
        { position: [3.6, 20.15, 264], size: [2.45, 0.3, 2.5], color: '#8b806f', delay: 0.28 },
        { position: [2.5, 23.55, 288], size: [2.35, 0.3, 2.45], color: '#83796b', delay: 0.52 },
      ],
      ambushDrops: [
        { kind: 'crate', triggerPosition: [0, 2.5, 20], dropPosition: [5.2, 11, 23], restPosition: [5.2, 3.0, 23], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [0, 3.65, 30], dropPosition: [-5.2, 12, 33], restPosition: [-5.2, 4.35, 33], rollDirection: [1, 0, 0] },
        { kind: 'tree', triggerPosition: [0, 5.9, 50], dropPosition: [4.5, 15, 53], restPosition: [4.5, 6.25, 53], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [0, 7.1, 60], dropPosition: [-4.2, 17, 63], restPosition: [-4.2, 7.8, 63], rollDirection: [1, 0, 0] },
        { kind: 'rock', triggerPosition: [-29, 11.65, 112], dropPosition: [-25, 21.4, 115], restPosition: [-25, 12.32, 115], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [-29, 16.75, 160], dropPosition: [-31, 26.4, 163], restPosition: [-31, 17.42, 163], rollDirection: [1, 0, 0] },
        { kind: 'tree', triggerPosition: [7, 21.3, 267], dropPosition: [9, 32, 270], restPosition: [9, 21.92, 270], rollDirection: [-1, 0, 0] },
        { kind: 'crate', triggerPosition: [-2, 22.95, 279], dropPosition: [-5, 34, 282], restPosition: [-5, 23.48, 282], rollDirection: [1, 0, 0] },
        { kind: 'rock', triggerPosition: [7, 24.65, 291], dropPosition: [5, 36, 294], restPosition: [5, 25.32, 294], rollDirection: [-1, 0, 0] },
      ],
      snareTraps: [
        { position: [4.5, 2.55, 25], rotation: 0.2 },
        { position: [-4.2, 4.82, 45], rotation: -0.18 },
        { position: [3.8, 7.12, 65], rotation: 0.5 },
      ],
      icePatches: [
        { position: [-29, 10.0, 103], size: [3.4, 0.08, 2.4] },
        { position: [-27, 11.7, 119], size: [3.2, 0.08, 2.4] },
        { position: [-29, 13.4, 135], size: [3.2, 0.08, 2.4] },
        { position: [-27, 15.1, 151], size: [3.2, 0.08, 2.4] },
      ],
      iceRafts: [
        { position: [-28, 10.02, 105.5], size: [3.8, 0.34, 3.8], axis: 'x', distance: 4.2, speed: 0.82 },
        { position: [-28, 11.72, 121], size: [3.6, 0.34, 3.8], axis: 'x', distance: 4.6, speed: 0.96 },
        { position: [-28, 13.42, 137], size: [3.5, 0.34, 3.8], axis: 'x', distance: 4.8, speed: 1.08 },
        { position: [-28, 15.12, 153], size: [3.3, 0.34, 3.7], axis: 'x', distance: 5.1, speed: 1.18 },
        { position: [-28, 16.82, 169], size: [3.2, 0.34, 3.6], axis: 'x', distance: 4.4, speed: 1.3 },
      ],
      windZones: [
        { position: [-28, 15.3, 137], size: [13, 3.4, 8], push: [2.2, 0, 0] },
        { position: [-28, 17, 153], size: [14, 3.4, 8], push: [-2.65, 0, 0] },
        { position: [-28, 18.7, 169], size: [13, 3.4, 8], push: [3, 0, 0] },
      ],
      lavaJets: [
        { position: [-31.5, 16.85, 188.2], radius: 1.05, height: 3.8, interval: 2.4, activeTime: 0.72, phase: 0.2 },
        { position: [-18.8, 14.35, 200.4], radius: 0.95, height: 3.4, interval: 2.15, activeTime: 0.62, phase: 0.88 },
        { position: [-30.8, 12.15, 211.6], radius: 1.0, height: 3.6, interval: 2.35, activeTime: 0.7, phase: 1.35 },
        { position: [8.5, 24.55, 294.5], radius: 0.88, height: 3.2, interval: 2.8, activeTime: 0.55, phase: 0.7 },
      ],
      sweepTraps: [
        { position: [-20, 13.9, 222.4], length: 5.4, speed: 1.35, phase: 0.2 },
        { position: [-12, 15.75, 234.2], length: 4.8, speed: 1.55, phase: 1.1 },
        { position: [-5, 17.45, 246.2], length: 5.2, speed: 1.75, phase: 0.55 },
        { position: [7, 21.25, 270.6], length: 4.8, speed: 1.9, phase: 0.15 },
        { position: [0, 26.4, 304.4], length: 5.8, speed: 2.1, phase: 1.25 },
      ],
      pendulumTraps: [
        { position: [-12, 20.1, 235], length: 3.8, speed: 1.55, phase: 0.4 },
        { position: [7, 28.7, 295], length: 3.9, speed: 1.85, phase: 1.2 },
        { position: [0, 29.7, 305], length: 3.6, speed: 2.05, phase: 2.0 },
      ],
      crusherTraps: [
        { position: [-8, 28.16, 318], width: 7.4, speed: 1.35, phase: 0.2 },
        { position: [3, 29.96, 330], width: 8.2, speed: 1.55, phase: 2.1 },
        { position: [4, 33.56, 354], width: 7.6, speed: 1.8, phase: 4.0 },
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
        { kind: 'rock', triggerPosition: [0, 3.25, 28], dropPosition: [8, 13, 31], restPosition: [8, 3.92, 31], rollDirection: [-1, 0, 0] },
        { kind: 'rock', triggerPosition: [0, 8.35, 76], dropPosition: [-7, 18, 79], restPosition: [-7, 9.02, 79], rollDirection: [1, 0, 0] },
      ],
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
      pendulumTraps: [
        { position: [5, 10.0, 63], length: 3.2, speed: 1.45, phase: 0.7 },
      ],
    },
  },
} as const satisfies Record<number, {
  checkpoints: readonly LevelCheckpoint[];
  goal: readonly [number, number, number];
  gameplay: LevelGameplay;
}>;
