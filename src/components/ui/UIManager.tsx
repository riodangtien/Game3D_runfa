import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../systems/gameStore';
import {
  getLeaderboardStorageKey,
  loadLeaderboard,
  loadPlayerName,
  recordLeaderboardScore,
  savePlayerName,
  type LeaderboardEntry,
} from '../../systems/leaderboard';
import { LEVELS } from '../../data/levels';
import { useMultiplayerStore } from '../../systems/multiplayerStore';
import { MultiplayerPanel } from './MultiplayerPanel';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${paddedSeconds}`;
};

const Leaderboard = ({
  entries,
  currentName,
  compact = false,
}: {
  entries: LeaderboardEntry[];
  currentName: string;
  compact?: boolean;
}) => (
  <div className={compact ? 'leaderboard compact' : 'leaderboard'}>
    <div className="leaderboard-titlebar">
      <span>Summit Records</span>
      <small>Fastest explorers</small>
    </div>
    <div className="leaderboard-head">
      <span>Hạng</span>
      <span>Người chơi</span>
      <span>Thời gian</span>
      <span>Ngã</span>
    </div>
    {entries.length === 0 ? (
      <div className="leaderboard-empty">No records yet. Be the first climber.</div>
    ) : (
      entries.map((entry, index) => (
        <div className={entry.name === currentName ? 'leaderboard-row current' : 'leaderboard-row'} key={entry.id}>
          <span className={`leaderboard-rank rank-${index + 1}`}>{index < 3 ? ['I', 'II', 'III'][index] : `#${index + 1}`}</span>
          <span>{entry.name}</span>
          <span>{formatTime(entry.time)}</span>
          <span>{entry.falls}</span>
        </div>
      ))
    )}
  </div>
);

export const UIManager = () => {
  const started = useGameStore((state) => state.started);
  const level = useGameStore((state) => state.level);
  const maxLevels = useGameStore((state) => state.maxLevels);
  const time = useGameStore((state) => Math.floor(state.time));
  const stamina = useGameStore((state) => state.stamina);
  const maxStamina = useGameStore((state) => state.maxStamina);
  const exhaustedTime = useGameStore((state) => state.exhaustedTime);
  const transitionTime = useGameStore((state) => state.transitionTime);
  const cameraSensitivity = useGameStore((state) => state.cameraSensitivity);
  const soundVolume = useGameStore((state) => state.soundVolume);
  const checkpointsHit = useGameStore((state) => state.checkpointsHit);
  const totalCheckpoints = useGameStore((state) => state.totalCheckpoints);
  const falls = useGameStore((state) => state.falls);
  const win = useGameStore((state) => state.win);
  const lose = useGameStore((state) => state.lose);
  const instructionOpen = useGameStore((state) => state.instructionOpen);
  const start = useGameStore((state) => state.start);
  const restart = useGameStore((state) => state.restart);
  const setPaused = useGameStore((state) => state.setPaused);
  const setInstructionOpen = useGameStore((state) => state.setInstructionOpen);
  const setCameraSensitivity = useGameStore((state) => state.setCameraSensitivity);
  const setSoundVolume = useGameStore((state) => state.setSoundVolume);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const multiplayerOpen = useMultiplayerStore((state) => state.dialogOpen);
  const multiplayerStatus = useMultiplayerStore((state) => state.status);
  const multiplayerMode = useMultiplayerStore((state) => state.mode);
  const remoteName = useMultiplayerStore((state) => state.remote.name);
  const remoteWinner = useMultiplayerStore((state) => state.remoteWinner);
  const [playerName, setPlayerName] = useState(() => loadPlayerName());
  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());
  const [latestRecord, setLatestRecord] = useState<{ entry: LeaderboardEntry; isNewRecord: boolean } | null>(null);
  const savedWinKey = useRef('');

  const staminaPercent = useMemo(() => (stamina / maxStamina) * 100, [stamina, maxStamina]);
  const displayedTotalCheckpoints =
    totalCheckpoints || LEVELS[level as keyof typeof LEVELS].checkpoints.length;
  const displayedCheckpointsHit = Math.min(checkpointsHit, displayedTotalCheckpoints);

  const beginGame = () => {
    const savedName = savePlayerName(playerName);
    setPlayerName(savedName);
    setLatestRecord(null);
    savedWinKey.current = '';
    start();
  };

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mountain-climber-leaderboard') : null;
    const refreshLeaderboard = () => setLeaderboard(loadLeaderboard());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === getLeaderboardStorageKey()) refreshLeaderboard();
    };

    window.addEventListener('storage', handleStorage);
    channel?.addEventListener('message', refreshLeaderboard);
    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.removeEventListener('message', refreshLeaderboard);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    if (!win) return;
    const winKey = `${playerName}-${time}-${falls}`;
    if (savedWinKey.current === winKey) return;
    savedWinKey.current = winKey;
    window.setTimeout(() => {
      const result = recordLeaderboardScore({ name: playerName, time, falls });
      setLatestRecord({ entry: result.entry, isNewRecord: result.isNewRecord });
      setLeaderboard(result.leaderboard);
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('mountain-climber-leaderboard');
        channel.postMessage({ type: 'leaderboard-updated' });
        channel.close();
      }
    }, 0);
  }, [falls, playerName, time, win]);

  useEffect(() => {
    setPaused((settingsOpen || instructionOpen || multiplayerOpen) && started);
    if ((settingsOpen || instructionOpen || multiplayerOpen) && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [instructionOpen, multiplayerOpen, setPaused, settingsOpen, started]);

  useEffect(() => {
    if (!settingsOpen && !instructionOpen) return;
    const closePanel = (event: KeyboardEvent) => {
      if (event.code !== 'Escape') return;
      setSettingsOpen(false);
      setInstructionOpen(false);
    };
    window.addEventListener('keydown', closePanel);
    return () => window.removeEventListener('keydown', closePanel);
  }, [instructionOpen, setInstructionOpen, settingsOpen]);

  return (
    <div className={multiplayerOpen ? 'hud modal-open' : 'hud'}>
      <div className="hud-top">
        <div className="panel">
          <div className="label">Level</div>
          <div className="value">
            {level}/{maxLevels}
          </div>
        </div>
        <div className="panel">
          <div className="label">Time</div>
          <div className="value">{formatTime(time)}</div>
        </div>
        <div className="panel">
          <div className="label">Checkpoints</div>
          <div className="value">
            {displayedCheckpointsHit}/{displayedTotalCheckpoints}
          </div>
        </div>
        <div className="panel">
          <div className="label">Falls</div>
          <div className="value">{falls}</div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="panel stamina">
          <div className="label">Stamina</div>
          <div className="bar">
            <div className="fill" style={{ width: `${staminaPercent}%` }} />
          </div>
          {exhaustedTime > 0 && <div className="hint">Exhausted</div>}
        </div>
        <div className="actions">
          <button className="btn ghost" type="button" onClick={restart}>
            Restart
          </button>
        </div>
      </div>

      <div className="settings-anchor">
        <button
          aria-expanded={settingsOpen}
          className="btn ghost settings-toggle"
          type="button"
          onClick={() => setSettingsOpen((open) => !open)}
        >
          Settings
        </button>
        {settingsOpen && (
          <div aria-label="Game settings" className="settings-panel" role="dialog">
            <div className="settings-title">Game Settings</div>
            <label className="settings-control" htmlFor="camera-sensitivity">
              <span>Mouse look speed <output>{cameraSensitivity.toFixed(2)}</output></span>
              <input
                id="camera-sensitivity"
                min="0.35"
                max="2.4"
                step="0.05"
                type="range"
                value={cameraSensitivity}
                onChange={(event) => setCameraSensitivity(Number(event.target.value))}
              />
            </label>
            <label className="settings-control" htmlFor="sound-volume">
              <span>Sound volume <output>{Math.round(soundVolume * 100)}%</output></span>
              <input
                id="sound-volume"
                min="0"
                max="1"
                step="0.05"
                type="range"
                value={soundVolume}
                onChange={(event) => setSoundVolume(Number(event.target.value))}
              />
            </label>
            <div className="settings-help">
              {started ? 'Game paused while settings are open. ' : ''}
              Click the game to capture the mouse again. Use the wheel to zoom.
            </div>
          </div>
        )}
      </div>

      {started && <div className="mouse-hint">Click the game, then move the mouse to look around</div>}
      {multiplayerStatus === 'connected' && (
        <div className="multiplayer-status">
          <span className="connection-dot" />
          <strong>{multiplayerMode === 'tether' ? 'Nối dây' : 'Đua 2 người'}</strong>
          <span>{remoteName || 'Người chơi 2'}</span>
        </div>
      )}
      {remoteWinner && !win && (
        <div className="remote-winner">{remoteWinner} đã tới đích trước!</div>
      )}
      <MultiplayerPanel />

      {instructionOpen && (
        <div className="instruction-overlay">
          <div aria-label="How to play" className="instruction-card" role="dialog">
            <div className="instruction-kicker">Mountain Trail Notice</div>
            <div className="title">How To Play</div>
            <div className="subtitle">Read this before starting the climb. Traps may be hidden in ordinary-looking ground.</div>
            <div className="tutorial-grid instruction-grid">
              <span><b>WASD</b> Move</span>
              <span><b>Mouse</b> Look around</span>
              <span><b>Space</b> Jump</span>
              <span><b>Shift</b> Sprint</span>
              <span><b>Wheel</b> Zoom camera</span>
              <span><b>Esc</b> Release mouse</span>
            </div>
            <div className="instruction-note">Reach each checkpoint. Watch the path carefully: rocks, trees and floors can turn into traps after you step forward.</div>
            <button className="btn" type="button" onClick={() => setInstructionOpen(false)}>Close Guide</button>
          </div>
        </div>
      )}

      {!started && !win && !lose && (
        <div className="tutorial">
          <div className="tutorial-card">
            <div className="tutorial-kicker">Low-poly Adventure</div>
            <div className="title">Mountain Climber</div>
            <div className="subtitle">Reach the summit. A wooden guide board is waiting near the village entrance.</div>
            <label className="player-name" htmlFor="player-name">
              <span>Climber name</span>
              <input
                id="player-name"
                maxLength={18}
                placeholder="Enter your name"
                type="text"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
              />
            </label>
            {checkpointsHit > 0 && (
              <div className="resume-note">
                Saved checkpoint {displayedCheckpointsHit}/{displayedTotalCheckpoints}. Start Climbing will continue from there.
              </div>
            )}
            <Leaderboard entries={leaderboard.slice(0, 5)} currentName={playerName} compact />
            <button className="btn" type="button" onClick={beginGame}>Start Climbing</button>
          </div>
        </div>
      )}

      {transitionTime > 0 && (
        <div className="level-transition">
          <div className="transition-title">Frozen Ridge Ahead</div>
          <div className="subtitle">The left route continues into ice and wind.</div>
        </div>
      )}

      {win && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="title">Summit Reached</div>
            <div className="subtitle">Your climb was a success.</div>
            <div className="tutorial-grid">
              <span><b>Time</b> {formatTime(time)}</span>
              <span><b>Deaths</b> {falls}</span>
            </div>
            {latestRecord && (
              <div className={latestRecord.isNewRecord ? 'record-note new' : 'record-note'}>
                {latestRecord.isNewRecord ? 'New record saved!' : `Best record kept: ${formatTime(latestRecord.entry.time)} / ${latestRecord.entry.falls} falls`}
              </div>
            )}
            <Leaderboard entries={leaderboard} currentName={playerName} compact />
            <button className="btn" type="button" onClick={restart}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {lose && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="title">Out of Attempts</div>
            <div className="subtitle">Take a breath and try again.</div>
            <button className="btn" type="button" onClick={restart}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
