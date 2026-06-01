import assert from 'node:assert/strict';
import test from 'node:test';
import { applyGoalReached, applyHazardHit } from '../src/systems/gameRules.ts';
import { LEVELS } from '../src/data/levels.ts';

const baseState = {
  level: 1,
  maxLevels: 2,
  falls: 0,
  maxFalls: 5,
  teleportVersion: 3,
  started: true,
};

test('hazard hit consumes one fall and triggers respawn', () => {
  assert.deepEqual(applyHazardHit(baseState), {
    falls: 1,
    lose: false,
    started: true,
    teleportVersion: 4,
  });
});

test('last allowed hazard hit ends the run', () => {
  assert.deepEqual(applyHazardHit({ ...baseState, falls: 4 }), {
    falls: 5,
    lose: true,
    started: false,
    teleportVersion: 4,
  });
});

test('first summit advances to level two and teleports', () => {
  assert.deepEqual(applyGoalReached(baseState), {
    level: 2,
    teleportVersion: 4,
  });
});

test('second summit wins the game', () => {
  assert.deepEqual(applyGoalReached({ ...baseState, level: 2 }), {
    win: true,
    started: false,
  });
});

test('checkpoint routes climb steadily without impossible height jumps', () => {
  for (const level of Object.values(LEVELS)) {
    for (let index = 1; index < level.checkpoints.length; index += 1) {
      const previous = level.checkpoints[index - 1].position;
      const current = level.checkpoints[index].position;
      assert.ok(current[1] > previous[1], 'checkpoint height should increase');
      assert.ok(current[1] - previous[1] <= 2, 'checkpoint height jump should remain playable');
    }
  }
});

test('levels provide a substantial climb before the summit', () => {
  assert.ok(LEVELS[1].checkpoints.length >= 7);
  assert.ok(LEVELS[2].checkpoints.length >= 8);
  assert.ok(LEVELS[1].goal[2] >= 60);
  assert.ok(LEVELS[2].goal[2] >= 59);
});

test('hazards do not overlap checkpoint centers', () => {
  for (const level of Object.values(LEVELS)) {
    for (const hazard of level.hazards) {
      for (const checkpoint of level.checkpoints) {
        const dx = hazard.position[0] - checkpoint.position[0];
        const dz = hazard.position[2] - checkpoint.position[2];
        assert.ok(Math.hypot(dx, dz) > 1, 'hazard should leave checkpoint a safe landing area');
      }
    }
  }
});

test('levels contain enough varied traps to reward careful observation', () => {
  assert.ok(LEVELS[1].hazards.length >= 12);
  assert.ok(LEVELS[2].hazards.length >= 12);
  assert.ok(LEVELS[1].hazards.some((hazard) => hazard.cycleSpeed !== undefined));
  assert.ok(LEVELS[2].hazards.some((hazard) => hazard.cycleSpeed !== undefined));
});

test('each level exposes distinct traversal mechanics', () => {
  assert.ok(LEVELS[1].gameplay.bridges.length > 0);
  assert.ok((LEVELS[2].gameplay.icePatches?.length ?? 0) > 0);
  assert.ok((LEVELS[2].gameplay.movingPlatforms?.length ?? 0) > 0);
});
