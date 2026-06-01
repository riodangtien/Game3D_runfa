import { useMemo } from 'react';
import { useGameStore } from '../../systems/gameStore';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${paddedSeconds}`;
};

export const UIManager = () => {
  const {
    started,
    level,
    maxLevels,
    time,
    stamina,
    maxStamina,
    exhaustedTime,
    transitionTime,
    cameraSensitivity,
    checkpointsHit,
    totalCheckpoints,
    falls,
    maxFalls,
    win,
    lose,
    start,
    restart,
    setCameraSensitivity,
  } = useGameStore();

  const staminaPercent = useMemo(() => (stamina / maxStamina) * 100, [stamina, maxStamina]);

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
          <div className="value">
            {falls}/{maxFalls}
          </div>
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

      <div className="camera-settings">
        <label htmlFor="camera-sensitivity">Mouse</label>
        <input
          id="camera-sensitivity"
          min="0.2"
          max="1.35"
          step="0.05"
          type="range"
          value={cameraSensitivity}
          onChange={(event) => setCameraSensitivity(Number(event.target.value))}
        />
      </div>

      {started && <div className="mouse-hint">Click the game, then move the mouse to look around</div>}

      {!started && !win && !lose && (
        <div className="tutorial">
          <div className="tutorial-card">
            <div className="title">Mountain Climber</div>
            <div className="subtitle">Reach the summit, avoid hidden traps and use checkpoints.</div>
            <div className="tutorial-grid">
              <span><b>WASD</b> Move</span>
              <span><b>Mouse</b> Look</span>
              <span><b>Space</b> Jump</span>
              <span><b>Shift</b> Sprint</span>
              <span><b>Wheel</b> Zoom</span>
              <span><b>Esc</b> Release mouse</span>
            </div>
            <button className="btn" type="button" onClick={start}>Start Climbing</button>
          </div>
        </div>
      )}

      {transitionTime > 0 && (
        <div className="level-transition">
          <div className="transition-title">Entering the Frozen Ridge</div>
          <div className="subtitle">The ice changes how you move.</div>
        </div>
      )}

      {win && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="title">Summit Reached</div>
            <div className="subtitle">Your climb was a success.</div>
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
