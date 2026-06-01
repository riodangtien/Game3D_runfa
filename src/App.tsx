import { Canvas } from '@react-three/fiber';
import { GameScene } from './components/game/GameScene';
import { UIManager } from './components/ui/UIManager';
import { AudioManager } from './systems/AudioManager';

function App() {
  return (
    <div className="app">
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 200 }}>
        <GameScene />
      </Canvas>
      <UIManager />
      <AudioManager />
    </div>
  );
}

export default App;
