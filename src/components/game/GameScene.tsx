import { Physics } from '@react-three/rapier';
import { Cloud, Sky } from '@react-three/drei';
import { PlayerController } from './PlayerController';
import { MountainEnvironment } from './MountainEnvironment';
import { CheckpointSystem } from '../../systems/CheckpointSystem';
import { GameManager } from '../../systems/GameManager';
import { useGameStore } from '../../systems/gameStore';
import { ScenicBackdrop } from './ScenicBackdrop';

export const GameScene = () => {
  const level = useGameStore((state) => state.level);
  const skyColor = level === 1 ? '#9fc6d5' : '#bfd5dc';

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 42, 132]} />
      <Sky sunPosition={[-22, 24, 88]} turbidity={6.5} rayleigh={1.42} mieCoefficient={0.006} />
      <Cloud position={[-12, 19, -22]} speed={0.16} opacity={0.28} />
      <Cloud position={[14, 24, -34]} speed={0.12} opacity={0.24} />
      <Cloud position={[2, 27, 28]} speed={0.1} opacity={0.2} />
      <ambientLight intensity={0.46} />
      <hemisphereLight intensity={0.68} groundColor={level === 1 ? '#465247' : '#687983'} />
      <directionalLight position={[-24, 30, -18]} intensity={0.42} color="#d5e5dc" />
      <directionalLight
        castShadow
        position={[48, 72, 22]}
        intensity={1.78}
        color="#ffe0ab"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00015}
      />
      <ScenicBackdrop />
      <Physics gravity={[0, -20, 0]}>
        <GameManager />
        <PlayerController />
        <MountainEnvironment />
        <CheckpointSystem />
      </Physics>
    </>
  );
};
