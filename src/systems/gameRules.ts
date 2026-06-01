export type ProgressState = {
  level: number;
  maxLevels: number;
  falls: number;
  maxFalls: number;
  teleportVersion: number;
  started: boolean;
};

export const applyHazardHit = (state: ProgressState) => {
  const falls = state.falls + 1;
  return {
    falls,
    lose: falls >= state.maxFalls,
    started: falls >= state.maxFalls ? false : state.started,
    teleportVersion: state.teleportVersion + 1,
  };
};

export const applyGoalReached = (state: ProgressState) => {
  if (state.level >= state.maxLevels) {
    return { win: true, started: false };
  }

  return {
    level: state.level + 1,
    teleportVersion: state.teleportVersion + 1,
  };
};
