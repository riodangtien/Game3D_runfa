import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';
import { IcePatch } from './IcePatch';
import { TrapFloor } from './TrapFloor';
import { AmbushDrop } from './AmbushDrop';
import { SnareTrap } from './SnareTrap';
import { MountainVillage } from './MountainVillage';
import { LEVELS, type LevelGameplay } from '../../data/levels';
import { MovingIceRaft } from './MovingIceRaft';
import { WindZone } from './WindZone';
import { InstructionBoard } from './InstructionBoard';
import { LobbyLeaderboardBoard } from './LobbyLeaderboardBoard';
import { Snowfall } from './Snowfall';
import { LavaJetTrap } from './LavaJetTrap';
import { SweepTrap } from './SweepTrap';

const blocks = LEVELS[1].gameplay.blocks;
const COLLIDER_EDGE_SKIN = 0.02;
const SNOW_BLOCK_START = 10;
const VOLCANO_BLOCK_START = 17;
const ROCK_BLOCK_START = 20;

const trees = [
  [-9.6, 0.05, 4.8], [9.6, 0.05, 5.2], [-8.8, 1.25, 13.8], [8.8, 2.4, 23.8],
  [-8.8, 3.55, 33.8], [8.4, 4.7, 43.8], [-8.2, 5.85, 53.8], [7.8, 7, 63.8],
  [-7.2, 8.15, 73.8],
] as const;

const snowBlocks = LEVELS[2].gameplay.blocks;
const snowGameplay = LEVELS[2].gameplay;

const routeSnowTrees = [
  [-39, 8.45, 86], [-17, 8.45, 87], [-36, 13.25, 129], [-20, 14.95, 145], [-23, 18.35, 177],
] as const;

const levelTwoSnowTrees = [
  [-8, 1.45, 16], [8, 3.15, 31], [-8, 4.85, 47], [8, 6.55, 63], [-7, 8.25, 79], [5, 9.95, 95],
] as const;


type TerrainBlock = {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  color: string;
};

type TerrainBiome = 'grass' | 'snow' | 'volcano' | 'rock';

const getRouteBiome = (index: number): TerrainBiome => {
  if (index >= ROCK_BLOCK_START) return 'rock';
  if (index >= VOLCANO_BLOCK_START) return 'volcano';
  if (index >= SNOW_BLOCK_START) return 'snow';
  return 'grass';
};

const RockyTerrace = ({
  block,
  index,
  biome = 'grass',
}: {
  block: TerrainBlock;
  index: number;
  biome?: TerrainBiome;
}) => {
  const [width, height, depth] = block.size;
  const halfHeight = height / 2;
  const snow = biome === 'snow';
  const volcano = biome === 'volcano';
  const rock = biome === 'rock';
  const surfaceColor = snow
    ? '#dcecef'
    : volcano
      ? '#5a4a40'
      : rock
        ? '#817a6e'
        : index === 0
          ? '#718e69'
          : '#7f9c68';
  const trailColor = snow ? '#b9d1d5' : volcano ? '#9a5a38' : rock ? '#b8a27a' : '#9d855f';
  if (snow) {
    return (
      <group position={block.position as [number, number, number]}>
        <RoundedBox args={block.size as [number, number, number]} radius={0.72} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={block.color} roughness={1} />
        </RoundedBox>
        <RoundedBox
          args={[Math.max(0.4, width - 0.18), 0.16, Math.max(0.4, depth - 0.18)]}
          radius={0.18}
          smoothness={3}
          position={[0, halfHeight + 0.06, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#e5edf0" roughness={0.92} />
        </RoundedBox>
        {index > SNOW_BLOCK_START && (
          <>
            <mesh
              position={[0.02, halfHeight + 0.19, 0.05]}
              rotation={[0, index % 2 === 0 ? 0.2 : -0.22, 0]}
              scale={[Math.min(width * 0.22, 1.55), 1, Math.min(depth * 0.38, 1.25)]}
              receiveShadow
            >
              <cylinderGeometry args={[1, 1, 0.03, 14]} />
              <meshStandardMaterial color="#bfd4d8" roughness={1} transparent opacity={0.72} />
            </mesh>
          </>
        )}
      </group>
    );
  }

  return (
    <group position={block.position as [number, number, number]}>
      <RoundedBox args={block.size as [number, number, number]} radius={0.46} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={block.color} roughness={1} />
      </RoundedBox>
      <RoundedBox
        args={[Math.max(0.4, width - 0.16), 0.12, Math.max(0.4, depth - 0.16)]}
        radius={0.15}
        smoothness={3}
        position={[0, halfHeight + 0.045, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={surfaceColor} roughness={1} />
      </RoundedBox>
      {index > 0 && (
        <>
          <mesh
            position={[0.02, halfHeight + 0.125, 0.08]}
            rotation={[0, index % 2 === 0 ? 0.22 : -0.18, 0]}
            scale={[Math.min(width * 0.2, 1.65), 1, Math.min(depth * 0.42, 1.45)]}
            receiveShadow
          >
            <cylinderGeometry args={[1, 1, 0.035, 14]} />
            <meshStandardMaterial color={trailColor} roughness={1} />
          </mesh>
          {[-0.52, 0.48].map((offset, stoneIndex) => (
            <mesh
              key={`route-stone-${stoneIndex}`}
              position={[offset, halfHeight + 0.15, stoneIndex % 2 === 0 ? -0.52 : 0.58]}
              rotation={[0.08, index * 0.38 + stoneIndex, 0.04]}
              scale={[0.36, 0.08, 0.28]}
              receiveShadow
            >
              <cylinderGeometry args={[1, 1, 0.04, 8]} />
              <meshStandardMaterial color={snow ? '#d7e7e9' : volcano ? '#c66a36' : rock ? '#c3b08b' : '#b49d74'} roughness={1} />
            </mesh>
          ))}
          {volcano && (
            <mesh
              position={[0, halfHeight + 0.17, -depth * 0.23]}
              rotation={[0, index % 2 === 0 ? 0.12 : -0.2, 0]}
              scale={[Math.min(width * 0.2, 1.25), 1, 0.26]}
              receiveShadow
            >
              <cylinderGeometry args={[1, 1, 0.026, 10]} />
              <meshStandardMaterial color="#f97316" emissive="#dc2626" emissiveIntensity={0.85} roughness={0.7} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
};

const isSnowAmbush = (triggerPosition: readonly [number, number, number]) =>
  triggerPosition[0] < -15 && triggerPosition[2] > 90;

const VolcanoVent = ({ position, scale = 1 }: { position: readonly [number, number, number]; scale?: number }) => (
  <RigidBody type="fixed" colliders={false} position={position}>
    <CuboidCollider args={[0.58 * scale, 0.46 * scale, 0.58 * scale]} position={[0, 0.46 * scale, 0]} />
  <group scale={scale}>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <coneGeometry args={[0.82, 0.62, 7]} />
      <meshStandardMaterial color="#2f2c2a" roughness={1} />
    </mesh>
    <mesh position={[0, 0.53, 0]} castShadow>
      <cylinderGeometry args={[0.28, 0.42, 0.18, 9]} />
      <meshStandardMaterial color="#1f1f1f" roughness={1} />
    </mesh>
    <mesh position={[0, 0.64, 0]}>
      <cylinderGeometry args={[0.2, 0.28, 0.05, 12]} />
      <meshStandardMaterial color="#f97316" emissive="#ef4444" emissiveIntensity={1.8} roughness={0.55} />
    </mesh>
    {[0.35, 0.7, 1.05].map((height, index) => (
      <mesh key={`vent-smoke-${index}`} position={[0.08 * index, 0.9 + height * 0.42, -0.05 * index]} scale={0.28 + index * 0.12}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#5b5551" transparent opacity={0.28 - index * 0.05} roughness={1} />
      </mesh>
    ))}
  </group>
  </RigidBody>
);

const RockSpire = ({ position, scale = 1 }: { position: readonly [number, number, number]; scale?: number }) => (
  <RigidBody type="fixed" colliders={false} position={position}>
    <CuboidCollider args={[0.46 * scale, 0.96 * scale, 0.46 * scale]} position={[0, 0.96 * scale, 0]} />
  <group scale={scale}>
    <mesh position={[0, 0.85, 0]} rotation={[0.05, 0.2, -0.04]} castShadow>
      <coneGeometry args={[0.8, 1.9, 6]} />
      <meshStandardMaterial color="#5f5a51" roughness={1} />
    </mesh>
    <mesh position={[0.36, 0.38, 0.22]} rotation={[0.3, 0.2, 0.2]} castShadow>
      <dodecahedronGeometry args={[0.36, 0]} />
      <meshStandardMaterial color="#4b4741" roughness={1} />
    </mesh>
  </group>
  </RigidBody>
);

const VolcanoRouteDecor = () => {
  const lavaPools = [
    [-34.8, 16.86, 187.6, 1.0, 0.54],
    [-17.0, 14.36, 199.4, 0.88, 0.42],
    [-31.8, 12.16, 210.4, 0.92, -0.35],
  ] as const;
  const vents = [
    [-34.2, 16.9, 189.8, 0.72],
    [-16.2, 14.42, 202.0, 0.58],
    [-31.8, 12.25, 212.2, 0.66],
  ] as const;
  const rockSpires = [
    [-23.4, 13.92, 221.1, 0.82],
    [-8.4, 15.78, 233.1, 0.86],
    [-1.6, 17.48, 246.4, 0.78],
    [3.2, 19.42, 257.2, 1.05],
  ] as const;

  return (
    <group>
      <mesh position={[-28, 16.82, 185.2]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow>
        <ringGeometry args={[2.5, 3.65, 20]} />
        <meshStandardMaterial color="#3a302b" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-23.2, 14.32, 199.2]} rotation={[-Math.PI / 2, 0, -0.18]} receiveShadow>
        <ringGeometry args={[2.1, 3.1, 18]} />
        <meshStandardMaterial color="#3c312c" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {lavaPools.map(([x, y, z, scale, rotation], index) => (
        <group key={`lava-pool-${index}`} position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <cylinderGeometry args={[1, 1, 0.05, 14]} />
            <meshStandardMaterial color="#f97316" emissive="#dc2626" emissiveIntensity={1.55} roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.055, 0]} scale={[1.2, 1, 0.72]}>
            <torusGeometry args={[0.68, 0.06, 6, 14]} />
            <meshStandardMaterial color="#2c2927" roughness={1} />
          </mesh>
        </group>
      ))}
      {vents.map(([x, y, z, scale], index) => (
        <VolcanoVent key={`volcano-vent-${index}`} position={[x, y, z]} scale={scale} />
      ))}
      {rockSpires.map(([x, y, z, scale], index) => (
        <RockSpire key={`rock-spire-${index}`} position={[x, y, z]} scale={scale} />
      ))}
      {[
        [-25.6, 16.9, 184.4, -0.38],
        [-20.5, 14.4, 203.6, 0.5],
        [-15.2, 15.75, 235.8, -0.25],
      ].map(([x, y, z, rotation], index) => (
        <RigidBody key={`route-warning-${index}`} type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <CuboidCollider args={[0.38, 0.5, 0.12]} position={[0.18, 0.5, 0]} />
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.9, 6]} />
            <meshStandardMaterial color="#4f3326" roughness={1} />
          </mesh>
          <mesh position={[0.22, 0.88, 0]} rotation={[0, 0, 0.1]} castShadow>
            <boxGeometry args={[0.58, 0.24, 0.08]} />
            <meshStandardMaterial color="#a35b35" roughness={1} />
          </mesh>
        </RigidBody>
      ))}
      {[
        [-36.2, 16.9, 184.5, 0.42],
        [-17.0, 14.42, 197.2, -0.28],
        [-33.5, 12.25, 207.4, 0.16],
        [-17.8, 13.95, 222.8, -0.22],
        [-9.5, 15.78, 235.2, 0.36],
      ].map(([x, y, z, rotation], index) => (
        <RigidBody key={`basalt-step-${index}`} type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <CuboidCollider args={[0.85, 0.34, 0.3]} position={[0, 0.34, 0]} />
          {[0, 0.55, 1.1].map((offset, stepIndex) => (
            <mesh key={`basalt-column-${stepIndex}`} position={[offset - 0.55, 0.24 + stepIndex * 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.28, 0.48 + stepIndex * 0.12, 6]} />
              <meshStandardMaterial color={stepIndex % 2 === 0 ? '#383633' : '#4a4540'} roughness={1} />
            </mesh>
          ))}
        </RigidBody>
      ))}
    </group>
  );
};

const SnowCabin = ({ position = [-37.1, 8.35, 80.0] as const }: { position?: readonly [number, number, number] }) => (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, 0.36, 0]}>
    <CuboidCollider args={[1.5, 1.05, 1.2]} position={[0, 0.98, 0]} />
    <RoundedBox args={[2.7, 1.36, 2.1]} radius={0.22} smoothness={4} position={[0, 0.78, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#d9e8eb" roughness={0.94} />
    </RoundedBox>
    <mesh position={[-0.72, 1.54, 0]} rotation={[0, 0, 0.54]} castShadow>
      <boxGeometry args={[1.72, 0.18, 2.52]} />
      <meshStandardMaterial color="#48606a" roughness={1} />
    </mesh>
    <mesh position={[0.72, 1.54, 0]} rotation={[0, 0, -0.54]} castShadow>
      <boxGeometry args={[1.72, 0.18, 2.52]} />
      <meshStandardMaterial color="#536b74" roughness={1} />
    </mesh>
    <mesh position={[0, 1.93, 0]} castShadow>
      <boxGeometry args={[0.24, 0.16, 2.64]} />
      <meshStandardMaterial color="#334f59" roughness={1} />
    </mesh>
    {[-0.42, 0.42].map((x, index) => (
      <RoundedBox
        key={`cabin-roof-snow-${index}`}
        args={[1.28, 0.12, 2.08]}
        radius={0.12}
        smoothness={3}
        position={[x, 1.68, 0]}
        rotation={[0, 0, index === 0 ? 0.54 : -0.54]}
        castShadow
      >
        <meshStandardMaterial color="#f2f8f9" roughness={0.95} />
      </RoundedBox>
    ))}
    <mesh position={[0, 0.7, 1.08]} castShadow>
      <boxGeometry args={[0.72, 1.02, 0.12]} />
      <meshStandardMaterial color="#4a352c" roughness={1} />
    </mesh>
    <mesh position={[0.24, 0.72, 1.16]}>
      <sphereGeometry args={[0.05, 8, 6]} />
      <meshStandardMaterial color="#f4c76f" emissive="#f59e0b" emissiveIntensity={0.8} roughness={0.45} />
    </mesh>
    {[-0.88, 0.88].map((x, index) => (
      <group key={`snow-cabin-window-${index}`} position={[x, 0.92, 1.1]}>
        <mesh>
          <boxGeometry args={[0.42, 0.38, 0.08]} />
          <meshStandardMaterial color="#9bd2d8" emissive="#7fb8bf" emissiveIntensity={0.18} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <boxGeometry args={[0.5, 0.06, 0.05]} />
          <meshStandardMaterial color="#3c2d27" roughness={1} />
        </mesh>
        <mesh position={[0, -0.28, 0.04]}>
          <boxGeometry args={[0.56, 0.08, 0.12]} />
          <meshStandardMaterial color="#f2f8f9" roughness={0.92} />
        </mesh>
      </group>
    ))}
    <mesh position={[0.92, 2.0, -0.42]} rotation={[0.08, 0, 0]} castShadow>
      <boxGeometry args={[0.34, 0.74, 0.38]} />
      <meshStandardMaterial color="#6d5f56" roughness={1} />
    </mesh>
  </RigidBody>
);

const SnowAFrameHouse = ({
  position = [-18.9, 8.35, 80.2] as const,
  rotation = -0.42,
}: {
  position?: readonly [number, number, number];
  rotation?: number;
}) => (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
    <CuboidCollider args={[1.35, 1.0, 1.15]} position={[0, 0.95, 0]} />
    <RoundedBox args={[2.25, 1.08, 1.72]} radius={0.18} smoothness={3} position={[0, 0.68, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#cadcdf" roughness={0.96} />
    </RoundedBox>
    <mesh position={[-0.55, 1.26, 0]} rotation={[0, 0, 0.72]} castShadow>
      <boxGeometry args={[2.18, 0.24, 2.02]} />
      <meshStandardMaterial color="#2f5560" roughness={1} />
    </mesh>
    <mesh position={[0.55, 1.26, 0]} rotation={[0, 0, -0.72]} castShadow>
      <boxGeometry args={[2.18, 0.24, 2.02]} />
      <meshStandardMaterial color="#38656f" roughness={1} />
    </mesh>
    <mesh position={[0, 1.76, 0]} castShadow>
      <boxGeometry args={[0.18, 0.14, 2.18]} />
      <meshStandardMaterial color="#27444d" roughness={1} />
    </mesh>
    {[-0.36, 0.36].map((x, index) => (
      <RoundedBox
        key={`aframe-roof-snow-${index}`}
        args={[1.34, 0.11, 1.72]}
        radius={0.12}
        smoothness={3}
        position={[x, 1.44, 0]}
        rotation={[0, 0, index === 0 ? 0.72 : -0.72]}
        castShadow
      >
        <meshStandardMaterial color="#eef7f8" roughness={0.94} />
      </RoundedBox>
    ))}
    <mesh position={[0, 0.62, 0.9]} castShadow>
      <boxGeometry args={[0.62, 0.86, 0.12]} />
      <meshStandardMaterial color="#3d2c25" roughness={1} />
    </mesh>
    {[-0.74, 0.74].map((x, index) => (
      <mesh key={`aframe-window-${index}`} position={[x, 0.83, 0.92]} castShadow>
        <boxGeometry args={[0.34, 0.32, 0.09]} />
        <meshStandardMaterial color="#8fd0d9" emissive="#6caeb7" emissiveIntensity={0.12} roughness={0.42} />
      </mesh>
    ))}
    <mesh position={[0.74, 1.62, -0.42]} castShadow>
      <boxGeometry args={[0.28, 0.62, 0.32]} />
      <meshStandardMaterial color="#6f594e" roughness={1} />
    </mesh>
  </RigidBody>
);

const SnowSupplyShed = ({
  position = [-28.2, 8.35, 88.6] as const,
  rotation = 0.18,
}: {
  position?: readonly [number, number, number];
  rotation?: number;
}) => (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
    <CuboidCollider args={[1.0, 0.8, 0.8]} position={[0, 0.72, 0]} />
    <RoundedBox args={[1.75, 1.06, 1.35]} radius={0.14} smoothness={3} position={[0, 0.58, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#b7c8cc" roughness={0.98} />
    </RoundedBox>
    <mesh position={[0, 1.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[1.05, 1.05, 1.58, 3]} />
      <meshStandardMaterial color="#516874" roughness={1} />
    </mesh>
    <mesh position={[0, 1.58, 0]} scale={[0.9, 0.22, 0.62]} castShadow>
      <sphereGeometry args={[1, 10, 5]} />
      <meshStandardMaterial color="#f4fbfc" roughness={0.94} />
    </mesh>
    <mesh position={[0, 0.5, 0.73]}>
      <boxGeometry args={[0.5, 0.74, 0.08]} />
      <meshStandardMaterial color="#46362e" roughness={1} />
    </mesh>
  </RigidBody>
);

const SnowWoodPile = ({ position, rotation = 0 }: { position: readonly [number, number, number]; rotation?: number }) => (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
    <CuboidCollider args={[0.62, 0.28, 0.44]} position={[0, 0.22, 0]} />
    {[-0.32, 0, 0.32].map((offset, index) => (
      <mesh key={`wood-log-${index}`} position={[offset, 0.12 + index * 0.045, 0]} rotation={[Math.PI / 2, 0, 0.08 * index]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.92, 8]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#775137' : '#8b6040'} roughness={1} />
      </mesh>
    ))}
    <RoundedBox args={[1.05, 0.08, 0.12]} radius={0.03} smoothness={2} position={[0, 0.05, -0.34]} castShadow>
      <meshStandardMaterial color="#5c3f2e" roughness={1} />
    </RoundedBox>
  </RigidBody>
);

const SnowSideDecor = ({ position = [0, 0, 0] as const }: { position?: readonly [number, number, number] }) => {
  const fenceSegments = [
    [-39.6, 8.62, 77.2, 0.04, 4.2],
    [-16.4, 8.62, 77.2, -0.04, 4.0],
    [-39.0, 8.62, 88.4, 0.46, 3.6],
    [-16.9, 8.62, 88.3, -0.46, 3.6],
  ] as const;
  const lamps = [
    [-34.0, 8.55, 78.6],
    [-22.0, 8.55, 78.6],
    [-34.0, 8.55, 87.0],
    [-22.0, 8.55, 87.0],
  ] as const;
  const snowPines = [
    [-40.4, 8.55, 80.0, 0.58],
    [-16.0, 8.55, 80.0, 0.54],
    [-38.5, 8.55, 88.8, 0.46],
    [-17.8, 8.55, 88.8, 0.44],
    [-31.6, 8.55, 76.0, 0.38],
    [-24.4, 8.55, 76.0, 0.38],
  ] as const;

  return (
    <group position={position as [number, number, number]}>
      {[
        [-37.1, 8.5, 80.0, 3.8, 2.65, 0.18],
        [-18.9, 8.5, 80.2, 3.5, 2.45, -0.22],
        [-28.2, 8.5, 88.6, 2.55, 1.9, 0.08],
      ].map(([x, y, z, sx, sz, rotation], index) => (
        <RigidBody key={`snow-house-pad-${index}`} type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <CuboidCollider args={[sx / 2, 0.04, sz / 2]} />
          <RoundedBox args={[sx, 0.07, sz]} radius={0.22} smoothness={3} receiveShadow>
            <meshStandardMaterial color="#e8f1f2" roughness={0.98} />
          </RoundedBox>
        </RigidBody>
      ))}
      {fenceSegments.map(([x, y, z, rotation, length], index) => (
        <RigidBody key={`snow-fence-${index}`} type="fixed" colliders={false} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <CuboidCollider args={[length / 2, 0.42, 0.12]} position={[0, 0.46, 0]} />
          {Array.from({ length: Math.floor(length / 0.7) + 1 }, (_, postIndex) => -length / 2 + postIndex * 0.7).map((offset) => (
            <mesh key={`snow-fence-post-${offset}`} position={[offset, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.055, 0.72, 6]} />
              <meshStandardMaterial color="#5d493c" roughness={1} />
            </mesh>
          ))}
          {[0.22, 0.48].map((height) => (
            <mesh key={`snow-fence-rail-${height}`} position={[0, height, 0]} castShadow>
              <boxGeometry args={[length + 0.14, 0.06, 0.08]} />
              <meshStandardMaterial color="#6c5445" roughness={1} />
            </mesh>
          ))}
        </RigidBody>
      ))}
      {lamps.map(([x, y, z], index) => (
        <RigidBody key={`snow-lamp-${index}`} type="fixed" colliders={false} position={[x, y, z]}>
          <CuboidCollider args={[0.18, 0.78, 0.18]} position={[0, 0.78, 0]} />
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.055, 1.16, 7]} />
            <meshStandardMaterial color="#4f3a30" roughness={1} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial color="#fee6a5" emissive="#f59e0b" emissiveIntensity={1.15} roughness={0.52} />
          </mesh>
          <mesh position={[0, 1.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.24, 0.26, 4]} />
            <meshStandardMaterial color="#5b4034" roughness={1} />
          </mesh>
        </RigidBody>
      ))}
      {snowPines.map(([x, y, z, scale], index) => (
        <RigidBody key={`snow-village-pine-${index}`} type="fixed" colliders={false} position={[x, y, z]}>
          <CuboidCollider args={[0.18 * scale, 0.72 * scale, 0.18 * scale]} position={[0, 0.72 * scale, 0]} />
        <group scale={scale}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.5, 7]} />
            <meshStandardMaterial color="#554236" roughness={1} />
          </mesh>
          <mesh position={[0, 1.58, 0]} castShadow>
            <coneGeometry args={[0.86, 1.82, 8]} />
            <meshStandardMaterial color="#2f5661" roughness={1} />
          </mesh>
          <mesh position={[0, 2.14, 0]} castShadow>
            <coneGeometry args={[0.62, 1.28, 8]} />
            <meshStandardMaterial color="#edf5f6" roughness={1} />
          </mesh>
        </group>
        </RigidBody>
      ))}
      <RigidBody type="fixed" colliders={false} position={[-28, 8.56, 81.8]}>
        <CuboidCollider args={[2.2, 0.18, 1.15]} position={[0, 0.18, 0]} />
        <RoundedBox args={[4.4, 0.24, 2.3]} radius={0.28} smoothness={4} position={[0, 0.12, 0]} receiveShadow>
          <meshStandardMaterial color="#dfeaec" roughness={0.98} />
        </RoundedBox>
        <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.76, 1.12, 18]} />
          <meshStandardMaterial color="#9fc0c6" roughness={1} side={2} />
        </mesh>
      </RigidBody>
      <SnowWoodPile position={[-36.8, 8.58, 78.8]} rotation={0.2} />
      <SnowWoodPile position={[-19.2, 8.58, 78.8]} rotation={-0.2} />
      {[
        [-39.0, 8.53, 86.9, 0.5],
        [-17.0, 8.53, 86.8, 0.46],
        [-34.2, 8.53, 76.8, 0.36],
        [-21.7, 8.53, 76.8, 0.34],
      ].map(([x, y, z, scale], index) => (
        <RigidBody key={`snow-drift-${index}`} type="fixed" colliders={false} position={[x, y, z]} rotation={[0, index * 0.48, 0]}>
          <CuboidCollider args={[0.82 * scale, 0.12 * scale, 0.42 * scale]} position={[0.1 * scale, 0.08 * scale, 0]} />
          <group scale={scale}>
          <RoundedBox args={[1.62, 0.16, 0.78]} radius={0.18} smoothness={3} receiveShadow>
            <meshStandardMaterial color="#edf5f6" roughness={0.96} />
          </RoundedBox>
          <RoundedBox args={[0.82, 0.12, 0.52]} radius={0.16} smoothness={3} position={[0.42, 0.08, 0.18]} receiveShadow>
            <meshStandardMaterial color="#d7e7e9" roughness={0.96} />
          </RoundedBox>
          </group>
        </RigidBody>
      ))}
    </group>
  );
};

export const MountainEnvironment = () => {
  const level = useGameStore((state) => state.level);
  const runVersion = useGameStore((state) => state.runVersion);
  const config = LEVELS[level as keyof typeof LEVELS];
  const gameplay = config.gameplay as LevelGameplay;

  if (level === 2) {
    return (
      <group>
        <SnowSideDecor position={[28, 1.44, 0]} />
        <SnowCabin position={[-9.1, 9.79, 80.0]} />
        <SnowAFrameHouse position={[9.1, 9.79, 80.2]} rotation={0.38} />
        <SnowSupplyShed position={[0, 9.79, 88.6]} rotation={-0.12} />
        <Snowfall />
        <RigidBody type="fixed" colliders={false}>
          {snowBlocks.map((block, index) => (
            <RockyTerrace key={`snow-block-${index}`} block={block} index={index} biome="snow" />
          ))}
          {snowBlocks.map((block, index) => (
            <CuboidCollider
              key={`snow-collider-${index}`}
              args={[block.size[0] / 2 - COLLIDER_EDGE_SKIN, block.size[1] / 2, block.size[2] / 2 - COLLIDER_EDGE_SKIN]}
              position={block.position as [number, number, number]}
            />
          ))}
        </RigidBody>

        {snowGameplay.icePatches.map((patch, index) => <IcePatch key={`ice-${index}`} {...patch} />)}
        {snowGameplay.iceRafts?.map((raft, index) => <MovingIceRaft key={`ice-raft-${index}`} {...raft} />)}
        {snowGameplay.windZones?.map((zone, index) => <WindZone key={`wind-zone-${index}`} {...zone} />)}
        {snowGameplay.ambushDrops.map((ambush, index) => (
          <AmbushDrop key={`ambush-${runVersion}-${index}`} {...ambush} showMarker={false} />
        ))}
        {levelTwoSnowTrees.map((tree, index) => (
          <RigidBody key={`snow-tree-${index}`} type="fixed" colliders={false} position={tree}>
            <CuboidCollider args={[0.15, 0.72, 0.15]} position={[0, 0.72, 0]} />
            <mesh position={[0, 0.72, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 1.44, 7]} />
              <meshStandardMaterial color="#55483c" roughness={1} />
            </mesh>
            <mesh position={[0, 1.55, 0]} castShadow>
              <coneGeometry args={[0.8, 1.9, 8]} />
              <meshStandardMaterial color="#426270" roughness={1} />
            </mesh>
            <mesh position={[0, 2.12, 0]} castShadow>
              <coneGeometry args={[0.58, 1.35, 8]} />
              <meshStandardMaterial color="#d9e9ec" roughness={1} />
            </mesh>
          </RigidBody>
        ))}
      </group>
    );
  }

  return (
    <group>
      <MountainVillage />
      <InstructionBoard />
      <LobbyLeaderboardBoard />
      <SnowSideDecor />
      <SnowCabin />
      <SnowAFrameHouse />
      <SnowSupplyShed />
      <Snowfall />
      <VolcanoRouteDecor />
      <RigidBody type="fixed" colliders={false}>
        {blocks.map((block, index) => (
          <RockyTerrace key={`block-${index}`} block={block} index={index} biome={getRouteBiome(index)} />
        ))}
        {blocks.map((block, index) => (
          <CuboidCollider
            key={`block-collider-${index}`}
            args={[block.size[0] / 2 - COLLIDER_EDGE_SKIN, block.size[1] / 2, block.size[2] / 2 - COLLIDER_EDGE_SKIN]}
            position={block.position as [number, number, number]}
          />
        ))}
      </RigidBody>

      {[...trees, ...routeSnowTrees].map((tree, index) => {
        const snow = index >= trees.length;
        return (
          <RigidBody key={`tree-${index}`} type="fixed" colliders={false} position={tree}>
            <CuboidCollider args={[0.16, 0.8, 0.16]} position={[0, 0.8, 0]} />
            <mesh position={[0, 0.8, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.16, 1.6, 7]} />
              <meshStandardMaterial color={snow ? '#55483c' : '#62452f'} roughness={1} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <coneGeometry args={[0.9, 2.3, 8]} />
              <meshStandardMaterial color={snow ? '#426270' : '#315b48'} roughness={1} />
            </mesh>
            <mesh position={[0, 2.45, 0]} castShadow>
              <coneGeometry args={[0.65, 1.7, 8]} />
              <meshStandardMaterial color={snow ? '#d9e9ec' : '#3b7258'} roughness={1} />
            </mesh>
          </RigidBody>
        );
      })}

      {gameplay.trapFloors.map((floor, index) => <TrapFloor key={`trap-floor-${index}`} {...floor} />)}
      {gameplay.icePatches?.map((patch, index) => <IcePatch key={`ice-${index}`} {...patch} />)}
      {gameplay.iceRafts?.map((raft, index) => <MovingIceRaft key={`ice-raft-${index}`} {...raft} />)}
      {gameplay.windZones?.map((zone, index) => <WindZone key={`wind-zone-${index}`} {...zone} />)}
      {gameplay.lavaJets?.map((jet, index) => <LavaJetTrap key={`lava-jet-${index}`} {...jet} />)}
      {gameplay.sweepTraps?.map((trap, index) => <SweepTrap key={`sweep-trap-${index}`} {...trap} />)}
      {gameplay.ambushDrops.map((ambush, index) => (
        <AmbushDrop
          key={`ambush-${runVersion}-${index}`}
          {...ambush}
          showMarker={!isSnowAmbush(ambush.triggerPosition)}
        />
      ))}
      {gameplay.snareTraps.map((snare, index) => <SnareTrap key={`snare-${runVersion}-${index}`} {...snare} />)}
    </group>
  );
};
