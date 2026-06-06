import assert from 'node:assert/strict';
import test from 'node:test';
import { useMultiplayerStore } from '../src/systems/multiplayerStore.ts';

test('multiplayer room state switches between race and tether modes', () => {
  const store = useMultiplayerStore.getState();
  store.setRoomState({ mode: 'tether', role: 'host', status: 'waiting', roomCode: 'ABC123' });
  assert.equal(useMultiplayerStore.getState().mode, 'tether');
  assert.equal(useMultiplayerStore.getState().roomCode, 'ABC123');
  assert.equal(useMultiplayerStore.getState().status, 'waiting');
});

test('multiplayer reset returns the game to single player', () => {
  const store = useMultiplayerStore.getState();
  store.setRemote({ name: 'Partner', position: [2, 3, 4], finished: true });
  store.triggerTetherFall();
  store.resetMultiplayer();
  const state = useMultiplayerStore.getState();
  assert.equal(state.mode, 'single');
  assert.equal(state.status, 'idle');
  assert.equal(state.remote.name, '');
  assert.equal(state.remote.finished, false);
});
