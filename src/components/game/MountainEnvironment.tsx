import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { ClimbZone } from './ClimbZone';
import { useGameStore } from '../../systems/gameStore';
import { Hazard } from './Hazard';
import { FallingRock } from './FallingRock';
import { IcePatch } from './IcePatch';
import { MovingPlatform } from './MovingPlatform';
import { WoodBridge } from './WoodBridge';
import { LEVELS } from '../../data/levels';

const blocks = LEVELS[1].gameplay.blocks;
const COLLIDER_EDGE_SKIN = 0.08;

const rocks = [
  { position: [5, 0.3, -6], scale: [1.4, 1, 1.2] },
  { position: [-8, 0.4, -4], scale: [1, 0.75, 0.9] },
  { position: [10, 0.3, 7], scale: [0.9, 0.75, 1] },
  { position: [-10, 2.8, 12], scale: [1.2, 0.9, 1.1] },
  { position: [8, 5.6, 22], scale: [1.3, 1.1, 1.2] },
  { position: [-2, 9.8, 34], scale: [1.1, 0.9, 1.1] },
];

const trees = [
  [-7, 0.1, 5], [7, 0.1, 5], [-8, 1.4, 11], [8, 1.4, 12],
  [-12, 0.1, 16], [10, 0.1, 17], [-10, 2.6, 19], [-2, 2.6, 20],
  [9, 4, 26], [-7, 5.3, 33], [4, 6.9, 39],
] as const;

const trailStones = [
  [-1.8, 0.08, 1.5], [1.3, 0.08, 3.3], [-0.8, 0.08, 5.2],
  [1.2, 1.38, 10], [-4.5, 2.68, 18], [3.5, 4.08, 25], [-1.5, 5.38, 32],
] as const;

const distantPeaks = [
  [-30, -4, 38, 18], [25, -5, 44, 22], [-20, -6, 62, 27], [38, -7, 68, 30],
] as const;

const cliffFaces = blocks.slice(1).flatMap((block, index) => {
  const [x, y, z] = block.position;
  const [width, height, depth] = block.size;
  return [
    { position: [x - width * 0.34, y - height * 0.72, z - depth / 2 - 0.22], scale: [width * 0.42, height * 0.92, 0.6], rotation: [0.08, 0.2, 0.08] },
    { position: [x + width * 0.23, y - height * 0.68, z - depth / 2 - 0.26], scale: [width * 0.4, height * 0.86, 0.7], rotation: [-0.05, -0.18, -0.05] },
    { position: [x - width / 2 - 0.24, y - height * 0.66, z + depth * 0.1], scale: [0.55, height * 0.9, depth * 0.48], rotation: [0.1, 0, 0.08] },
    { position: [x + width / 2 + 0.24, y - height * 0.62, z - depth * 0.04], scale: [0.55, height * 0.86, depth * 0.46], rotation: [-0.08, 0.1, -0.06] },
  ].map((face, faceIndex) => ({ ...face, shade: index + faceIndex }));
});

const grassTufts = [
  [-4, 0.06, -2], [-1, 0.06, 2], [4, 0.06, 3], [7, 0.06, 7],
  [-6, 1.36, 9], [6, 1.36, 11], [-8, 2.56, 18], [-1, 2.56, 19],
  [2, 3.96, 24], [7, 3.96, 26], [-5, 5.26, 31], [1, 5.26, 33],
] as const;

const smallRocks = [
  [-4, 0.12, 4], [2, 0.14, 7], [7, 1.46, 11], [-7, 2.66, 19],
  [1, 2.68, 18], [1, 4.08, 26], [7, 4.1, 24], [-5, 5.38, 32],
] as const;

const snowBlocks = LEVELS[2].gameplay.blocks;
const snowGameplay = LEVELS[2].gameplay;

const snowCliffs = snowBlocks.slice(1).flatMap((block, index) => {
  const [x, y, z] = block.position;
  const [width, height, depth] = block.size;
  return [
    { position: [x - width * 0.24, y - height * 0.72, z - depth / 2 - 0.22], scale: [width * 0.42, height * 0.9, 0.65], rotation: [0.08, 0.15, 0.08] },
    { position: [x + width * 0.27, y - height * 0.68, z - depth / 2 - 0.24], scale: [width * 0.4, height * 0.86, 0.7], rotation: [-0.06, -0.16, -0.06] },
    { position: [x - width / 2 - 0.22, y - height * 0.64, z], scale: [0.5, height * 0.86, depth * 0.42], rotation: [0.08, 0, 0.06] },
  ].map((face, faceIndex) => ({ ...face, shade: index + faceIndex }));
});

const iceCrystals = [
  [-6, 0.4, 5], [8, 0.45, 10], [-7, 3.2, 16], [7, 4.8, 23], [-5, 6.6, 30], [3, 8.7, 37],
] as const;

const snowRocks = [
  { position: [-8, 0.45, -3], scale: [1.5, 1.1, 1.2] },
  { position: [9, 0.35, 2], scale: [1.1, 0.9, 1] },
  { position: [6, 2.1, 10], scale: [0.9, 0.75, 0.85] },
  { position: [-6, 4, 18], scale: [1, 0.85, 0.9] },
];

export const MountainEnvironment = () => {
  const level = useGameStore((state) => state.level);
  const config = LEVELS[level as keyof typeof LEVELS];

  if (level === 2) {
    return (
      <group>
        <RigidBody type="fixed" colliders={false}>
          {snowBlocks.map((block, index) => (
            <mesh key={`snow-block-${index}`} position={block.position as [number, number, number]} castShadow receiveShadow>
              <boxGeometry args={block.size as [number, number, number]} />
              <meshStandardMaterial color={block.color} roughness={0.9} />
            </mesh>
          ))}
          {snowBlocks.map((block, index) => (
            <mesh
              key={`snow-cap-${index}`}
              position={[block.position[0], block.position[1] + block.size[1] / 2 + 0.06, block.position[2]]}
              receiveShadow
            >
              <boxGeometry args={[block.size[0] + 0.1, 0.12, block.size[2] + 0.1]} />
              <meshStandardMaterial color="#e8f3f5" roughness={0.85} />
            </mesh>
          ))}
          {snowBlocks.map((block, index) => (
            <CuboidCollider
              key={`snow-collider-${index}`}
              args={[block.size[0] / 2 - COLLIDER_EDGE_SKIN, block.size[1] / 2, block.size[2] / 2 - COLLIDER_EDGE_SKIN]}
              position={block.position as [number, number, number]}
            />
          ))}
        </RigidBody>

        {snowRocks.map((rock, index) => (
          <mesh key={`snow-rock-${index}`} position={rock.position as [number, number, number]} scale={rock.scale as [number, number, number]} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#536470" roughness={0.95} />
          </mesh>
        ))}

        {snowCliffs.map((face, index) => (
          <mesh
            key={`snow-cliff-${index}`}
            position={face.position as [number, number, number]}
            scale={face.scale as [number, number, number]}
            rotation={face.rotation as [number, number, number]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={face.shade % 2 === 0 ? '#637785' : '#536674'} roughness={1} />
          </mesh>
        ))}

        {iceCrystals.map((position, index) => (
          <group key={`crystal-${index}`} position={position}>
            <mesh rotation={[0, index * 0.7, 0]} castShadow>
              <octahedronGeometry args={[0.45, 0]} />
              <meshStandardMaterial color="#9ee9f4" emissive="#4cc9e8" emissiveIntensity={0.45} roughness={0.35} />
            </mesh>
            <mesh position={[0.35, -0.08, 0.12]} scale={0.6} castShadow>
              <octahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color="#d5f8fb" emissive="#83e4f1" emissiveIntensity={0.35} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {config.hazards.map((hazard, index) => <Hazard key={`hazard-${index}`} {...hazard} />)}
        {snowGameplay.icePatches.map((patch, index) => <IcePatch key={`ice-${index}`} {...patch} />)}
        {snowGameplay.movingPlatforms.map((platform, index) => <MovingPlatform key={`platform-${index}`} {...platform} />)}
        {config.gameplay.fallingRocks.map((rock, index) => <FallingRock key={`falling-rock-${index}`} {...rock} />)}
        {config.gameplay.climbZones.map((zone, index) => <ClimbZone key={`climb-zone-${index}`} {...zone} />)}
      </group>
    );
  }

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        {blocks.map((block, index) => (
          <mesh key={`block-${index}`} position={block.position as [number, number, number]} castShadow receiveShadow>
            <boxGeometry args={block.size as [number, number, number]} />
            <meshStandardMaterial color={block.color} roughness={1} />
          </mesh>
        ))}
        {blocks.map((block, index) => (
          <mesh
            key={`grass-${index}`}
            position={[block.position[0], block.position[1] + block.size[1] / 2 + 0.04, block.position[2]]}
            receiveShadow
          >
            <boxGeometry args={[block.size[0] + 0.08, 0.08, block.size[2] + 0.08]} />
            <meshStandardMaterial color={index === 0 ? '#71936b' : '#83a36f'} roughness={1} />
          </mesh>
        ))}
        {blocks.map((block, index) => (
          <CuboidCollider
            key={`block-collider-${index}`}
            args={[block.size[0] / 2 - COLLIDER_EDGE_SKIN, block.size[1] / 2, block.size[2] / 2 - COLLIDER_EDGE_SKIN]}
            position={block.position as [number, number, number]}
          />
        ))}
      </RigidBody>

      {rocks.map((rock, index) => (
        <mesh
          key={`rock-${index}`}
          position={rock.position as [number, number, number]}
          scale={rock.scale as [number, number, number]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#52545a" roughness={1} />
        </mesh>
      ))}

      {cliffFaces.map((face, index) => (
        <mesh
          key={`cliff-${index}`}
          position={face.position as [number, number, number]}
          scale={face.scale as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={face.shade % 2 === 0 ? '#667366' : '#748071'} roughness={1} />
        </mesh>
      ))}

      {smallRocks.map((position, index) => (
        <mesh key={`small-rock-${index}`} position={position} scale={[0.34 + (index % 3) * 0.12, 0.22 + (index % 2) * 0.08, 0.3]} rotation={[0, index * 0.8, 0]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#6b7169' : '#545b56'} roughness={1} />
        </mesh>
      ))}

      {grassTufts.map((position, index) => (
        <group key={`grass-tuft-${index}`} position={position} rotation={[0, index * 0.7, 0]}>
          {[-0.14, 0, 0.14].map((offset) => (
            <mesh key={offset} position={[offset, 0.22, 0]} rotation={[0, 0, offset * 1.8]}>
              <coneGeometry args={[0.09, 0.5, 5]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#4d7a48' : '#668a52'} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {trailStones.map((stone, index) => (
        <mesh key={`trail-${index}`} position={stone} rotation={[0, index * 0.7, 0]} receiveShadow>
          <cylinderGeometry args={[0.7, 0.8, 0.12, 7]} />
          <meshStandardMaterial color="#c6b58e" roughness={1} />
        </mesh>
      ))}

      {trees.map((tree, index) => (
        <group key={`tree-${index}`} position={tree}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.16, 1.6, 7]} />
            <meshStandardMaterial color="#62452f" roughness={1} />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <coneGeometry args={[0.9, 2.3, 8]} />
            <meshStandardMaterial color="#315b48" roughness={1} />
          </mesh>
          <mesh position={[0, 2.45, 0]} castShadow>
            <coneGeometry args={[0.65, 1.7, 8]} />
            <meshStandardMaterial color="#3b7258" roughness={1} />
          </mesh>
        </group>
      ))}

      {distantPeaks.map(([x, y, z, size], index) => (
        <group key={`peak-${index}`} position={[x, y, z]} rotation={[0, index * 0.6, 0]}>
          <mesh>
            <coneGeometry args={[size, size * 1.5, 7]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#71808b' : '#637581'} roughness={1} />
          </mesh>
          <mesh position={[0, size * 0.34, 0]}>
            <coneGeometry args={[size * 0.56, size * 0.64, 7]} />
            <meshStandardMaterial color="#d8e4e6" roughness={1} />
          </mesh>
        </group>
      ))}

      {config.hazards.map((hazard, index) => <Hazard key={`hazard-${index}`} {...hazard} />)}
      {config.gameplay.bridges.map((bridge, index) => <WoodBridge key={`bridge-${index}`} {...bridge} />)}
      {config.gameplay.fallingRocks.map((rock, index) => <FallingRock key={`falling-rock-${index}`} {...rock} />)}
      {config.gameplay.climbZones.map((zone, index) => <ClimbZone key={`climb-zone-${index}`} {...zone} />)}
    </group>
  );
};
