import assert from 'node:assert/strict';
import test from 'node:test';
import { compareScores, sortLeaderboard, type LeaderboardEntry } from '../src/systems/leaderboard.ts';

const entry = (name: string, time: number, falls: number): LeaderboardEntry => ({
  id: name,
  name,
  time,
  falls,
  completedAt: '2026-01-01T00:00:00.000Z',
});

test('leaderboard ranks faster times first', () => {
  const sorted = sortLeaderboard([
    entry('Slow', 180, 0),
    entry('Fast', 100, 5),
    entry('Middle', 140, 1),
  ]);

  assert.deepEqual(sorted.map((item) => item.name), ['Fast', 'Middle', 'Slow']);
});

test('leaderboard uses falls as tiebreaker after time', () => {
  assert.equal(compareScores(entry('Clean', 100, 1), entry('Messy', 100, 4)), -3);
});

test('leaderboard keeps only top ten records', () => {
  const sorted = sortLeaderboard(Array.from({ length: 12 }, (_, index) => entry(`P${index}`, 200 - index, index)));

  assert.equal(sorted.length, 10);
  assert.equal(sorted[0].name, 'P11');
});
