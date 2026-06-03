import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../../systems/gameStore';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${paddedSeconds}`;
};

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

  const staminaPercent = useMemo(() => (stamina / maxStamina) * 100, [stamina, maxStamina]);

  useEffect(() => {
    setPaused((settingsOpen || instructionOpen) && started);
    if ((settingsOpen || instructionOpen) && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [instructionOpen, setPaused, settingsOpen, started]);

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
    <div className="hud">
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
            {checkpointsHit}/{totalCheckpoints}
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
          {!started && !win && !lose && (
            <button className="btn" type="button" onClick={start}>
              Start Game
            </button>
          )}
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
            <div className="title">Mountain Climber</div>
            <div className="subtitle">Reach the summit. A wooden guide board is waiting near the village entrance.</div>
            <button className="btn" type="button" onClick={start}>Start Climbing</button>
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
