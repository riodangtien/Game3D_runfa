import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBox } from '@react-three/drei';
import { useGameStore } from '../../systems/gameStore';
import { IcePatch } from './IcePatch';
import { TrapFloor } from './TrapFloor';
import { AmbushDrop } from './AmbushDrop';
import { ChestTrap } from './ChestTrap';
import { SnareTrap } from './SnareTrap';
import { MountainVillage } from './MountainVillage';
import { LEVELS } from '../../data/levels';
import { MovingIceRaft } from './MovingIceRaft';
import { WindZone } from './WindZone';
import { InstructionBoard } from './InstructionBoard';
import { Snowfall } from './Snowfall';

const blocks = LEVELS[1].gameplay.blocks;
const COLLIDER_EDGE_SKIN = 0.08;
const SNOW_BLOCK_START = 10;

const trees = [
  [-7, 0.05, 4], [7, 0.05, 5], [-7, 1.25, 13], [8, 2.4, 23],
  [-8, 3.55, 33], [8, 4.7, 43], [-7, 5.85, 53], [7, 7, 63],
  [-6, 8.15, 73],
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

const RockyTerrace = ({ block, index, snow = false }: { block: TerrainBlock; index: number; snow?: boolean }) => {
  const [width, height, depth] = block.size;
  const halfHeight = height / 2;
  const surfaceColor = snow ? '#dcecef' : index === 0 ? '#718e69' : '#7f9c68';
  const cliffColor = snow ? '#60727c' : index % 2 === 0 ? '#4d5a50' : '#556057';
  const trailColor = snow ? '#b9d1d5' : '#9d855f';
  const edgeRocks = [
    [-width * 0.48, halfHeight - 0.42, -depth * 0.34, 0.72, 0.54, 0.68],
    [width * 0.46, halfHeight - 0.68, depth * 0.28, 0.82, 0.7, 0.76],
  ] as const;

  if (snow) {
    return (
      <group position={block.position as [number, number, number]}>
        <RoundedBox args={block.size as [number, number, number]} radius={0.72} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={block.color} roughness={1} />
        </RoundedBox>
        <mesh position={[0, -0.24, 0]} castShadow receiveShadow scale={[width * 0.46, 1, depth * 0.49]}>
          <cylinderGeometry args={[1.08, 0.92, Math.max(0.8, height + 0.14), 10]} />
          <meshStandardMaterial color="#405866" roughness={1} />
        </mesh>
        <mesh position={[0, halfHeight + 0.085, 0]} receiveShadow scale={[width * 0.51, 1, depth * 0.53]}>
          <cylinderGeometry args={[1, 0.96, 0.18, 18]} />
          <meshStandardMaterial color="#e5edf0" roughness={0.92} />
        </mesh>
        <mesh position={[0, -halfHeight - 0.05, 0]} receiveShadow scale={[width * 0.42, 1, depth * 0.45]}>
          <cylinderGeometry args={[1, 0.86, 0.18, 10]} />
          <meshStandardMaterial color="#314854" roughness={1} />
        </mesh>
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
      <mesh position={[0, -0.16, 0]} castShadow receiveShadow scale={[width * 0.5, 1, depth * 0.52]}>
        <cylinderGeometry args={[1, 1.14, Math.max(0.75, height + 0.26), 9]} />
        <meshStandardMaterial color={cliffColor} roughness={1} />
      </mesh>
      <mesh position={[0, halfHeight + 0.058, 0]} receiveShadow scale={[width * 0.5, 1, depth * 0.52]}>
        <cylinderGeometry args={[1, 1.03, 0.12, 12]} />
        <meshStandardMaterial color={surfaceColor} roughness={1} />
      </mesh>
      {edgeRocks.map(([x, y, z, sx, sy, sz], rockIndex) => (
        <mesh
          key={`edge-rock-${rockIndex}`}
          position={[x, Math.max(-halfHeight + 0.25, y), z]}
          rotation={[rockIndex * 0.47, rockIndex * 0.82, rockIndex * 0.31]}
          scale={[sx, sy, sz]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rockIndex % 2 === 0 ? cliffColor : snow ? '#71848d' : '#616a60'} roughness={1} />
        </mesh>
      ))}
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
              <meshStandardMaterial color={snow ? '#d7e7e9' : '#b49d74'} roughness={1} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

const isSnowAmbush = (triggerPosition: readonly [number, number, number]) =>
  triggerPosition[0] < -15 && triggerPosition[2] > 90;

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

const SnowSideDecor = ({ position = [0, 0, 0] as const }: { position?: readonly [number, number, number] }) => {
  const fenceSegments = [
    [-41.0, 8.62, 78.7, 0.36],
    [-41.0, 8.62, 84.2, 0.08],
    [-15.4, 8.62, 78.9, -0.34],
    [-15.2, 8.62, 84.3, -0.1],
    [-34.6, 8.62, 89.1, 1.2],
    [-22.2, 8.62, 89.2, -1.16],
  ] as const;
  const lamps = [
    [-34.2, 8.55, 80.0],
    [-22.2, 8.55, 80.0],
    [-34.0, 8.55, 87.0],
    [-22.0, 8.55, 87.0],
  ] as const;
  const crates = [
    [-35.6, 8.58, 76.9, 0.18],
    [-19.6, 8.58, 77.2, -0.12],
  ] as const;

  return (
    <group position={position as [number, number, number]}>
      <RoundedBox args={[8.6, 0.06, 1.65]} radius={0.34} smoothness={4} position={[-28, 8.52, 80.2]} receiveShadow>
        <meshStandardMaterial color="#c9d8dc" roughness={1} />
      </RoundedBox>
      {[
        [-37.1, 8.5, 80.0, 3.8, 2.8, 0.18],
        [-18.9, 8.5, 80.2, 3.3, 2.4, -0.22],
        [-28.2, 8.5, 88.6, 2.6, 2.0, 0.08],
      ].map(([x, y, z, sx, sz, rotation], index) => (
        <RoundedBox
          key={`snow-house-pad-${index}`}
          args={[sx, 0.055, sz]}
          radius={0.28}
          smoothness={4}
          position={[x, y, z]}
          rotation={[0, rotation, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#e8f1f2" roughness={0.98} />
        </RoundedBox>
      ))}
      {fenceSegments.map(([x, y, z, rotation], index) => (
        <group key={`snow-fence-${index}`} position={[x, y, z]} rotation={[0, rotation, 0]}>
          {[-0.75, 0, 0.75].map((offset) => (
            <mesh key={`snow-fence-post-${offset}`} position={[offset, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.055, 0.72, 6]} />
              <meshStandardMaterial color="#5d493c" roughness={1} />
            </mesh>
          ))}
          {[0.22, 0.48].map((height) => (
            <mesh key={`snow-fence-rail-${height}`} position={[0, height, 0]} castShadow>
              <boxGeometry args={[1.72, 0.06, 0.08]} />
              <meshStandardMaterial color="#6c5445" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      {lamps.map(([x, y, z], index) => (
        <group key={`snow-lamp-${index}`} position={[x, y, z]}>
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
        </group>
      ))}
      {crates.map(([x, y, z, rotation], index) => (
        <group key={`snow-crate-stack-${index}`} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <RoundedBox args={[0.52, 0.46, 0.52]} radius={0.05} smoothness={2} position={[0, 0.24, 0]} castShadow>
            <meshStandardMaterial color="#80573d" roughness={1} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.34, 0.42]} radius={0.05} smoothness={2} position={[0.42, 0.18, -0.12]} castShadow>
            <meshStandardMaterial color="#9a6847" roughness={1} />
          </RoundedBox>
        </group>
      ))}
      {[
        [-39.2, 8.53, 87.4, 0.86],
        [-16.8, 8.53, 86.8, 0.72],
        [-31.4, 8.53, 76.8, 0.62],
        [-24.6, 8.53, 76.9, 0.58],
      ].map(([x, y, z, scale], index) => (
        <group key={`snow-drift-${index}`} position={[x, y, z]} rotation={[0, index * 0.48, 0]} scale={scale}>
          <RoundedBox args={[1.62, 0.16, 0.78]} radius={0.18} smoothness={3} receiveShadow>
            <meshStandardMaterial color="#edf5f6" roughness={0.96} />
          </RoundedBox>
          <RoundedBox args={[0.82, 0.12, 0.52]} radius={0.16} smoothness={3} position={[0.42, 0.08, 0.18]} receiveShadow>
            <meshStandardMaterial color="#d7e7e9" roughness={0.96} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
};

export const MountainEnvironment = () => {
  const level = useGameStore((state) => state.level);
  const runVersion = useGameStore((state) => state.runVersion);
  const config = LEVELS[level as keyof typeof LEVELS];

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
            <RockyTerrace key={`snow-block-${index}`} block={block} index={index} snow />
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
      <SnowSideDecor />
      <SnowCabin />
      <SnowAFrameHouse />
      <SnowSupplyShed />
      <Snowfall />
      <RigidBody type="fixed" colliders={false}>
        {blocks.map((block, index) => (
          <RockyTerrace key={`block-${index}`} block={block} index={index} snow={index >= SNOW_BLOCK_START} />
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

      {config.gameplay.trapFloors.map((floor, index) => <TrapFloor key={`trap-floor-${index}`} {...floor} />)}
      {config.gameplay.icePatches?.map((patch, index) => <IcePatch key={`ice-${index}`} {...patch} />)}
      {config.gameplay.iceRafts?.map((raft, index) => <MovingIceRaft key={`ice-raft-${index}`} {...raft} />)}
      {config.gameplay.windZones?.map((zone, index) => <WindZone key={`wind-zone-${index}`} {...zone} />)}
      {config.gameplay.ambushDrops.map((ambush, index) => (
        <AmbushDrop
          key={`ambush-${runVersion}-${index}`}
          {...ambush}
          showMarker={!isSnowAmbush(ambush.triggerPosition)}
        />
      ))}
      {config.gameplay.chestTraps.map((chest, index) => <ChestTrap key={`chest-${index}`} {...chest} />)}
      {config.gameplay.snareTraps.map((snare, index) => <SnareTrap key={`snare-${runVersion}-${index}`} {...snare} />)}
    </group>
  );
};
