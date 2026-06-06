import assert from 'node:assert/strict';
import test from 'node:test';
import { isPlayerProgress } from '../src/systems/playerProgress.ts';

test('player progress accepts a saved checkpoint payload', () => {
  assert.equal(
    isPlayerProgress({
      level: 1,
      checkpointsHit: 4,
      lastCheckpoint: { x: 3, y: 4.8, z: 43 },
    }),
    true
  );
});

test('player progress rejects broken checkpoint data', () => {
  assert.equal(
    isPlayerProgress({
      level: 1,
      checkpointsHit: 4,
      lastCheckpoint: { x: 3, y: 'bad', z: 43 },
    }),
    false
  );
});
