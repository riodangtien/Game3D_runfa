import { Physics } from '@react-three/rapier';
import { Cloud, Sky } from '@react-three/drei';
import { PlayerController } from './PlayerController';
import { MountainEnvironment } from './MountainEnvironment';
import { CheckpointSystem } from '../../systems/CheckpointSystem';
import { GameManager } from '../../systems/GameManager';
import { useGameStore } from '../../systems/gameStore';

export const GameScene = () => {
  const level = useGameStore((state) => state.level);
  const skyColor = level === 1 ? '#b9d5dd' : '#d8e6ea';

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 32, 108]} />
      <Sky sunPosition={[68, 28, 54]} turbidity={7} rayleigh={1.4} />
      <Cloud position={[-12, 19, -22]} speed={0.16} opacity={0.28} />
      <Cloud position={[14, 24, -34]} speed={0.12} opacity={0.24} />
      <Cloud position={[2, 27, 28]} speed={0.1} opacity={0.2} />
      <ambientLight intensity={0.58} />
      <hemisphereLight intensity={0.75} groundColor={level === 1 ? '#4d5f52' : '#71808a'} />
      <directionalLight position={[-24, 30, -18]} intensity={0.5} color="#d8edf0" />
      <directionalLight
        castShadow
        position={[48, 72, 22]}
        intensity={2.15}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00015}
      />
      <Physics gravity={[0, -20, 0]}>
        <GameManager />
        <PlayerController />
        <MountainEnvironment />
        <CheckpointSystem />
      </Physics>
    </>
  );
};
