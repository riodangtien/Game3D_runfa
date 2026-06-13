import { Physics } from '@react-three/rapier';
import { Cloud, Sky } from '@react-three/drei';
import { PlayerController } from './PlayerController';
import { MountainEnvironment } from './MountainEnvironment';
import { CheckpointSystem } from '../../systems/CheckpointSystem';
import { GameManager } from '../../systems/GameManager';
import { useGameStore } from '../../systems/gameStore';
import { ScenicBackdrop } from './ScenicBackdrop';
import { RemotePlayer } from './RemotePlayer';

export const GameScene = () => {
  const level = useGameStore((state) => state.level);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const performanceMode = graphicsQuality === 'performance';
  const skyColor = level === 1 ? '#9fc6d5' : '#bfd5dc';

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 42, 132]} />
      <Sky sunPosition={[-22, 24, 88]} turbidity={6.5} rayleigh={1.42} mieCoefficient={0.006} />
      {level === 1 && !performanceMode && <Cloud position={[-12, 19, -22]} speed={0.12} opacity={0.18} segments={10} />}
      <ambientLight intensity={0.46} />
      <hemisphereLight intensity={0.68} groundColor={level === 1 ? '#465247' : '#687983'} />
      <directionalLight position={[-24, 30, -18]} intensity={0.42} color="#d5e5dc" />
      <directionalLight
        castShadow={!performanceMode}
        position={[48, 72, 22]}
        intensity={1.78}
        color="#ffe0ab"
        shadow-mapSize-width={performanceMode ? 256 : 512}
        shadow-mapSize-height={performanceMode ? 256 : 512}
        shadow-bias={-0.00015}
      />
      <ScenicBackdrop />
      <Physics gravity={[0, -20, 0]} timeStep={1 / 60} interpolate>
        <GameManager />
        <PlayerController />
        <RemotePlayer />
        <MountainEnvironment />
        <CheckpointSystem />
      </Physics>
    </>
  );
};
