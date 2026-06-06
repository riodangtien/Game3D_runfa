import { create } from 'zustand';
import type { AnimState } from '../components/game/Player';

export type MultiplayerMode = 'single' | 'race' | 'tether';
export type RoomStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'error';

export type NetworkPlayerState = {
  name: string;
  position: [number, number, number];
  rotation: number;
  animation: AnimState;
  falls: number;
  finished: boolean;
};

const emptyRemote: NetworkPlayerState = {
  name: '',
  position: [0, 1.05, 0],
  rotation: 0,
  animation: 'idle',
  falls: 0,
  finished: false,
};

type MultiplayerState = {
  dialogOpen: boolean;
  mode: MultiplayerMode;
  role: 'host' | 'guest' | null;
  status: RoomStatus;
  roomCode: string;
  error: string;
  remote: NetworkPlayerState;
  localPosition: [number, number, number];
  tetherFallVersion: number;
  remoteWinner: string;
  setDialogOpen: (open: boolean) => void;
  setRoomState: (patch: Partial<Pick<MultiplayerState, 'mode' | 'role' | 'status' | 'roomCode' | 'error'>>) => void;
  setRemote: (remote: Partial<NetworkPlayerState>) => void;
  setLocalPosition: (position: [number, number, number]) => void;
  triggerTetherFall: () => void;
  setRemoteWinner: (name: string) => void;
  resetMultiplayer: () => void;
};

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  dialogOpen: false,
  mode: 'single',
  role: null,
  status: 'idle',
  roomCode: '',
  error: '',
  remote: emptyRemote,
  localPosition: [0, 1.05, 0],
  tetherFallVersion: 0,
  remoteWinner: '',
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
  setRoomState: (patch) => set(patch),
  setRemote: (remote) => set((state) => ({ remote: { ...state.remote, ...remote } })),
  setLocalPosition: (localPosition) => set({ localPosition }),
  triggerTetherFall: () => set((state) => ({ tetherFallVersion: state.tetherFallVersion + 1 })),
  setRemoteWinner: (remoteWinner) => set({ remoteWinner }),
  resetMultiplayer: () =>
    set({
      dialogOpen: false,
      mode: 'single',
      role: null,
      status: 'idle',
      roomCode: '',
      error: '',
      remote: emptyRemote,
      tetherFallVersion: 0,
      remoteWinner: '',
    }),
}));
