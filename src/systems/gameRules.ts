export type ProgressState = {
  level: number;
  maxLevels: number;
  falls: number;
  teleportVersion: number;
  started: boolean;
};

export const applyHazardHit = (state: ProgressState) => ({
  falls: state.falls + 1,
  lose: false,
  started: state.started,
  teleportVersion: state.teleportVersion + 1,
});

export const applyGoalReached = (state: ProgressState) => {
  if (state.level >= state.maxLevels) {
    return { win: true, started: false };
  }

  return {
    level: state.level + 1,
    teleportVersion: state.teleportVersion + 1,
  };
};
