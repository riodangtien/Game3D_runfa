import assert from 'node:assert/strict';
import test from 'node:test';
import { applyGoalReached, applyHazardHit } from '../src/systems/gameRules.ts';
import { LEVELS } from '../src/data/levels.ts';

const baseState = {
  level: 1,
  maxLevels: 1,
  falls: 0,
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

test('hazard hits never end the run by fall count', () => {
  assert.deepEqual(applyHazardHit({ ...baseState, falls: 24 }), {
    falls: 25,
    lose: false,
    started: true,
    teleportVersion: 4,
  });
});

test('summit wins the single connected route', () => {
  assert.deepEqual(applyGoalReached(baseState), {
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
  assert.ok(LEVELS[2].checkpoints.length >= 6);
  assert.ok(LEVELS[1].goal[2] >= 60);
  assert.ok(LEVELS[2].goal[2] >= 59);
});

test('terraces rise from ground without floating support blocks', () => {
  for (const block of LEVELS[1].gameplay.blocks.slice(1, 10)) {
    assert.ok(Math.abs(block.position[1] - block.size[1] / 2) < 0.01, 'raised terrace should meet the ground');
  }
  for (const block of LEVELS[2].gameplay.blocks.slice(1)) {
    assert.ok(Math.abs(block.position[1] - block.size[1] / 2) < 0.01, 'raised terrace should meet the ground');
  }
});

test('level one islands leave visible gaps within jumping distance', () => {
  const blocks = LEVELS[1].gameplay.blocks.slice(1, 9);
  for (let index = 1; index < blocks.length; index += 1) {
    const previous = blocks[index - 1];
    const current = blocks[index];
    const gap = current.position[2] - current.size[2] / 2 - (previous.position[2] + previous.size[2] / 2);
    assert.ok(gap >= 2, 'neighboring islands should be visibly separated');
    assert.ok(gap <= 3.5, 'neighboring islands should remain within jumping distance');
  }
});

test('level one connects the frozen ridge on the left side', () => {
  const snowBlocks = LEVELS[1].gameplay.blocks.slice(10);
  assert.ok(snowBlocks.length >= 7);
  assert.ok(snowBlocks.every((block) => block.position[0] < -20), 'frozen ridge should sit left of the mountain route');
  assert.equal(LEVELS[1].gameplay.iceRafts?.length, 5);
  assert.ok((LEVELS[1].gameplay.windZones?.length ?? 0) >= 3);
});

test('level two crosses wide glacier gaps using moving ice rafts', () => {
  const blocks = LEVELS[2].gameplay.blocks.slice(1);
  for (let index = 1; index < blocks.length; index += 1) {
    const previous = blocks[index - 1];
    const current = blocks[index];
    const gap = current.position[2] - current.size[2] / 2 - (previous.position[2] + previous.size[2] / 2);
    assert.ok(gap >= 9, 'glacier ledges should require moving rafts instead of direct jumps');
  }
  assert.equal(LEVELS[2].gameplay.iceRafts?.length, blocks.length - 1);
});

test('bait trap floors sit in gaps instead of overlapping safe terraces', () => {
  for (const level of Object.values(LEVELS)) {
    for (const floor of level.gameplay.trapFloors) {
      const overlapsSafeTerrace = level.gameplay.blocks.slice(1).some((block) => {
        const overlapsX = Math.abs(floor.position[0] - block.position[0]) < (floor.size[0] + block.size[0]) / 2;
        const overlapsZ = Math.abs(floor.position[2] - block.position[2]) < (floor.size[2] + block.size[2]) / 2;
        return overlapsX && overlapsZ;
      });
      assert.equal(overlapsSafeTerrace, false, 'bait trap floor should fall into an open gap');
    }
  }
});

test('each level exposes distinct traversal mechanics', () => {
  assert.ok(LEVELS[1].gameplay.trapFloors.length > 0);
  assert.ok(LEVELS[1].gameplay.ambushDrops.some((ambush) => ambush.kind === 'tree'));
  assert.ok(LEVELS[1].gameplay.ambushDrops.some((ambush) => ambush.kind === 'crate'));
  assert.ok(LEVELS[1].gameplay.chestTraps.length > 0);
  assert.ok((LEVELS[1].gameplay.icePatches?.length ?? 0) > 0);
  assert.ok((LEVELS[1].gameplay.iceRafts?.length ?? 0) > 0);
  assert.ok((LEVELS[1].gameplay.windZones?.length ?? 0) > 0);
  assert.ok(LEVELS[2].gameplay.ambushDrops.every((ambush) => ambush.kind === 'rock'));
  assert.ok((LEVELS[2].gameplay.icePatches?.length ?? 0) > 0);
  assert.ok((LEVELS[2].gameplay.iceRafts?.length ?? 0) > 0);
  assert.ok((LEVELS[2].gameplay.windZones?.length ?? 0) > 0);
});

test('ambush objects land below their hidden spawn and roll after impact', () => {
  for (const level of Object.values(LEVELS)) {
    for (const ambush of level.gameplay.ambushDrops) {
      assert.ok(ambush.restPosition[1] < ambush.dropPosition[1], 'ambush object should land below its hidden spawn');
      assert.ok(
        Math.hypot(ambush.rollDirection[0], ambush.rollDirection[2]) > 0,
        'ambush object should roll sideways after landing'
      );
    }
  }
});

test('difficulty curve keeps dense mixed trap layouts', () => {
  assert.ok(LEVELS[1].gameplay.ambushDrops.length >= 6);
  assert.ok(LEVELS[1].gameplay.trapFloors.length >= 4);
  assert.ok(LEVELS[1].gameplay.snareTraps.length >= 3);
  assert.ok(LEVELS[1].gameplay.chestTraps.length >= 2);
  assert.ok((LEVELS[1].gameplay.icePatches?.length ?? 0) >= 4);
  assert.ok((LEVELS[1].gameplay.iceRafts?.length ?? 0) >= 5);
  assert.ok((LEVELS[1].gameplay.windZones?.length ?? 0) >= 3);

  assert.ok(LEVELS[2].gameplay.ambushDrops.length >= 4);
  assert.ok((LEVELS[2].gameplay.icePatches?.length ?? 0) >= 5);
  assert.ok((LEVELS[2].gameplay.iceRafts?.length ?? 0) >= 5);
  assert.ok((LEVELS[2].gameplay.windZones?.length ?? 0) >= 3);
});
