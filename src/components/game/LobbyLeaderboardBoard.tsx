import { Html, RoundedBox } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useEffect, useState } from 'react';
import {
  getLeaderboardStorageKey,
  loadLeaderboard,
  loadPlayerName,
  type LeaderboardEntry,
} from '../../systems/leaderboard';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const LeaderboardRows = ({ entries, playerName }: { entries: LeaderboardEntry[]; playerName: string }) => (
  <div className="world-leaderboard-card">
    <div className="world-leaderboard-kicker">Village Hall</div>
    <div className="world-leaderboard-title">Summit Records</div>
    {entries.length === 0 ? (
      <div className="world-leaderboard-empty">No records yet</div>
    ) : (
      entries.slice(0, 5).map((entry, index) => (
        <div className={entry.name === playerName ? 'world-leaderboard-row current' : 'world-leaderboard-row'} key={entry.id}>
          <span className={`world-rank rank-${index + 1}`}>{index < 3 ? ['I', 'II', 'III'][index] : `#${index + 1}`}</span>
          <strong>{entry.name}</strong>
          <span>{formatTime(entry.time)}</span>
          <span>{entry.falls} falls</span>
        </div>
      ))
    )}
  </div>
);

export const LobbyLeaderboardBoard = () => {
  const [entries, setEntries] = useState(() => loadLeaderboard());
  const [playerName, setPlayerName] = useState(() => loadPlayerName());

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mountain-climber-leaderboard') : null;
    const refreshLeaderboard = () => {
      setEntries(loadLeaderboard());
      setPlayerName(loadPlayerName());
    };
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

  return (
    <RigidBody type="fixed" colliders={false} position={[3.2, 0, 3.55]} rotation={[0, -0.28, 0]}>
      <CuboidCollider args={[1.82, 1.48, 0.18]} position={[0, 1.58, 0]} />
      {[-1.48, 1.48].map((x) => (
        <mesh key={`leaderboard-post-${x}`} position={[x, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.17, 1.84, 8]} />
          <meshStandardMaterial color="#51331f" roughness={1} />
        </mesh>
      ))}
      <RoundedBox args={[3.85, 2.08, 0.32]} radius={0.1} smoothness={4} position={[0, 1.94, 0]} castShadow>
        <meshStandardMaterial color="#543522" roughness={0.96} />
      </RoundedBox>
      <mesh position={[0, 1.94, -0.175]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[3.48, 1.7]} />
        <meshStandardMaterial color="#ead69c" roughness={1} />
      </mesh>
      <Html center distanceFactor={6.2} position={[0, 1.96, -0.22]} style={{ pointerEvents: 'none' }}>
        <LeaderboardRows entries={entries} playerName={playerName} />
      </Html>
    </RigidBody>
  );
};
