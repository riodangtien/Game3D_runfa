import { Canvas } from '@react-three/fiber';
import { GameScene } from './components/game/GameScene';
import { UIManager } from './components/ui/UIManager';
import { AudioManager } from './systems/AudioManager';
import { useGameStore } from './systems/gameStore';

function App() {
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const performanceMode = graphicsQuality === 'performance';

  return (
    <div className="app">
      <Canvas
        shadows={!performanceMode}
        dpr={performanceMode ? 0.75 : 1}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 440 }}
      >
        <GameScene />
      </Canvas>
      <UIManager />
      <AudioManager />
    </div>
  );
}

export default App;
