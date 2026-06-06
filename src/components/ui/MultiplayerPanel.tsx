import { useState } from 'react';
import { loadPlayerName } from '../../systems/leaderboard';
import {
  closeMultiplayerConnection,
  createMultiplayerRoom,
  joinMultiplayerRoom,
} from '../../systems/multiplayerNetwork';
import { useMultiplayerStore, type MultiplayerMode } from '../../systems/multiplayerStore';

const modeCopy: Record<Exclude<MultiplayerMode, 'single'>, { title: string; description: string }> = {
  race: {
    title: 'Đua tự do',
    description: 'Hai người cùng leo. Ai chạm cờ đích trước sẽ thắng.',
  },
  tether: {
    title: 'Nối dây sinh tồn',
    description: 'Hai người bị nối bằng dây. Đi quá xa hoặc một người rơi sẽ kéo người còn lại.',
  },
};

export const MultiplayerPanel = () => {
  const open = useMultiplayerStore((state) => state.dialogOpen);
  const status = useMultiplayerStore((state) => state.status);
  const roomCode = useMultiplayerStore((state) => state.roomCode);
  const mode = useMultiplayerStore((state) => state.mode);
  const error = useMultiplayerStore((state) => state.error);
  const remoteName = useMultiplayerStore((state) => state.remote.name);
  const setDialogOpen = useMultiplayerStore((state) => state.setDialogOpen);
  const resetMultiplayer = useMultiplayerStore((state) => state.resetMultiplayer);
  const [selectedMode, setSelectedMode] = useState<Exclude<MultiplayerMode, 'single'>>('race');
  const [joinCode, setJoinCode] = useState('');
  const playerName = loadPlayerName();

  if (!open) return null;

  const close = () => {
    if (status !== 'connected') {
      closeMultiplayerConnection();
      resetMultiplayer();
    } else {
      setDialogOpen(false);
    }
  };

  return (
    <div className="multiplayer-overlay">
      <div aria-label="Chế độ hai người" className="multiplayer-card" role="dialog">
        <button aria-label="Đóng" className="multiplayer-close" type="button" onClick={close}>×</button>
        <div className="multiplayer-kicker">Adventure Guild</div>
        <div className="title">Chơi hai người</div>
        <div className="subtitle">Tạo phòng rồi gửi mã cho người chơi còn lại, hoặc nhập mã đã nhận.</div>

        <div className="mode-grid">
          {(Object.keys(modeCopy) as Array<Exclude<MultiplayerMode, 'single'>>).map((nextMode) => (
            <button
              className={selectedMode === nextMode ? 'mode-card selected' : 'mode-card'}
              key={nextMode}
              type="button"
              onClick={() => setSelectedMode(nextMode)}
              onPointerDown={(event) => {
                event.stopPropagation();
                setSelectedMode(nextMode);
              }}
            >
              <strong>{modeCopy[nextMode].title}</strong>
              <span>{modeCopy[nextMode].description}</span>
            </button>
          ))}
        </div>

        {(status === 'idle' || status === 'error') && (
          <div className="room-actions">
            <button className="btn" type="button" onClick={() => createMultiplayerRoom(selectedMode, playerName)}>
              Tạo phòng {modeCopy[selectedMode].title}
            </button>
            <div className="room-divider"><span>hoặc nhập mã phòng</span></div>
            <div className="join-room">
              <input
                aria-label="Mã phòng"
                maxLength={6}
                placeholder="ABC123"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              />
              <button
                className="btn ghost"
                disabled={joinCode.trim().length !== 6}
                type="button"
                onClick={() => joinMultiplayerRoom(joinCode, playerName)}
              >
                Vào phòng
              </button>
            </div>
          </div>
        )}

        {(status === 'connecting' || status === 'waiting') && (
          <div className="room-waiting">
            <span>{status === 'connecting' ? 'Đang kết nối...' : 'Đang chờ người chơi thứ hai'}</span>
            <strong>{roomCode}</strong>
            <small>Gửi mã này cho bạn của bạn. Không cần tải lại trang.</small>
          </div>
        )}

        {status === 'connected' && (
          <div className="room-connected">
            <span className="connection-dot" />
            <div>
              <strong>Đã kết nối với {remoteName || 'người chơi thứ hai'}</strong>
              <small>{mode === 'tether' ? modeCopy.tether.description : modeCopy.race.description}</small>
            </div>
            <button className="btn" type="button" onClick={() => setDialogOpen(false)}>Bắt đầu</button>
          </div>
        )}

        {error && <div className="room-error">{error}</div>}
      </div>
    </div>
  );
};
