import Peer, { type DataConnection } from 'peerjs';
import type { AnimState } from '../components/game/Player';
import { useGameStore } from './gameStore';
import { useMultiplayerStore, type MultiplayerMode } from './multiplayerStore';

type RoomMessage =
  | { type: 'hello'; name: string }
  | { type: 'room'; mode: MultiplayerMode; name: string }
  | {
      type: 'state';
      name: string;
      position: [number, number, number];
      rotation: number;
      animation: AnimState;
      falls: number;
      finished: boolean;
    }
  | { type: 'fall' }
  | { type: 'finish'; name: string };

let peer: Peer | null = null;
let connection: DataConnection | null = null;
let localChannel: BroadcastChannel | null = null;
let localName = 'Climber';
let hostedMode: MultiplayerMode = 'race';
let lastPublishAt = 0;
const sessionId = Math.random().toString(36).slice(2);

const roomPeerId = (code: string) => `runfa-room-${code.toUpperCase()}`;
const makeRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const send = (message: RoomMessage) => {
  if (connection?.open) connection.send(message);
  localChannel?.postMessage({ sender: sessionId, message });
};

const openLocalChannel = (code: string) => {
  localChannel?.close();
  localChannel = new BroadcastChannel(`runfa-room-${code.toUpperCase()}`);
  localChannel.onmessage = (event: MessageEvent<{ sender?: string; message?: unknown }>) => {
    if (event.data?.sender === sessionId) return;
    handleMessage(event.data?.message);
  };
};

const handleMessage = (message: unknown) => {
  if (!message || typeof message !== 'object' || !('type' in message)) return;
  const data = message as RoomMessage;
  const multiplayer = useMultiplayerStore.getState();

  if (data.type === 'hello') {
    multiplayer.setRemote({ name: data.name });
    send({ type: 'room', mode: hostedMode, name: localName });
    multiplayer.setRoomState({ status: 'connected', error: '' });
    useGameStore.getState().restart();
  }
  if (data.type === 'room') {
    multiplayer.setRemote({ name: data.name });
    multiplayer.setRoomState({ mode: data.mode, status: 'connected', error: '' });
    useGameStore.getState().restart();
  }
  if (data.type === 'state') {
    multiplayer.setRemote({
      name: data.name,
      position: data.position,
      rotation: data.rotation,
      animation: data.animation,
      falls: data.falls,
      finished: data.finished,
    });
  }
  if (data.type === 'fall' && multiplayer.mode === 'tether') multiplayer.triggerTetherFall();
  if (data.type === 'finish') multiplayer.setRemoteWinner(data.name);
};

const bindConnection = (nextConnection: DataConnection, isHost: boolean) => {
  connection?.close();
  connection = nextConnection;
  connection.on('data', handleMessage);
  connection.on('open', () => {
    useMultiplayerStore.getState().setRoomState({ status: 'connected', error: '' });
    if (!isHost) send({ type: 'hello', name: localName });
  });
  connection.on('close', () => {
    if (useMultiplayerStore.getState().status === 'connected' && localChannel) return;
    useMultiplayerStore.getState().setRoomState({
      status: 'error',
      error: 'Người chơi còn lại đã ngắt kết nối.',
    });
  });
  connection.on('error', () => {
    if (useMultiplayerStore.getState().status === 'connected' && localChannel) return;
    useMultiplayerStore.getState().setRoomState({
      status: 'error',
      error: 'Kết nối phòng bị lỗi. Hãy thử lại mã phòng.',
    });
  });
};

export const closeMultiplayerConnection = () => {
  connection?.close();
  peer?.destroy();
  localChannel?.close();
  connection = null;
  peer = null;
  localChannel = null;
  lastPublishAt = 0;
};

export const createMultiplayerRoom = (mode: Exclude<MultiplayerMode, 'single'>, name: string) => {
  closeMultiplayerConnection();
  const code = makeRoomCode();
  localName = name || 'Climber 1';
  hostedMode = mode;
  openLocalChannel(code);
  useMultiplayerStore.getState().setRoomState({
    mode,
    role: 'host',
    status: 'connecting',
    roomCode: code,
    error: '',
  });

  peer = new Peer(roomPeerId(code));
  peer.on('open', () => {
    useMultiplayerStore.getState().setRoomState({ status: 'waiting' });
  });
  peer.on('connection', (nextConnection) => bindConnection(nextConnection, true));
  peer.on('error', () => {
    if (useMultiplayerStore.getState().status === 'connected') return;
    useMultiplayerStore.getState().setRoomState({
      status: 'error',
      error: 'Không thể tạo phòng. Hãy tạo lại để nhận mã mới.',
    });
  });
};

export const joinMultiplayerRoom = (code: string, name: string) => {
  closeMultiplayerConnection();
  const normalizedCode = code.trim().toUpperCase();
  localName = name || 'Climber 2';
  openLocalChannel(normalizedCode);
  useMultiplayerStore.getState().setRoomState({
    role: 'guest',
    status: 'connecting',
    roomCode: normalizedCode,
    error: '',
  });

  peer = new Peer();
  peer.on('open', () => {
    if (!peer) return;
    bindConnection(peer.connect(roomPeerId(normalizedCode), { reliable: true }), false);
  });
  peer.on('error', () => {
    if (useMultiplayerStore.getState().status === 'connected') return;
    useMultiplayerStore.getState().setRoomState({
      status: 'error',
      error: 'Không tìm thấy phòng hoặc kết nối đã đóng.',
    });
  });
  window.setTimeout(() => send({ type: 'hello', name: localName }), 40);
};

export const publishPlayerState = (state: {
  position: [number, number, number];
  rotation: number;
  animation: AnimState;
  falls: number;
  finished: boolean;
}) => {
  const now = Date.now();
  if (now - lastPublishAt < 66) return;
  lastPublishAt = now;
  send({ type: 'state', name: localName, ...state });
};

export const notifyMultiplayerFall = () => send({ type: 'fall' });
export const notifyMultiplayerFinish = () => send({ type: 'finish', name: localName });
