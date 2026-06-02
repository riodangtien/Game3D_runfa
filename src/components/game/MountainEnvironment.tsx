import { CuboidCollider, RigidBody } from '@react-three/rapier';
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
import { FrozenRidgeDecor } from './FrozenRidgeDecor';
import { InstructionBoard } from './InstructionBoard';

const blocks = LEVELS[1].gameplay.blocks;
const COLLIDER_EDGE_SKIN = 0.08;

const trees = [
  [-7, 0.05, 4], [7, 0.05, 5], [-7, 1.25, 13], [8, 2.4, 23],
  [-8, 3.55, 33], [8, 4.7, 43], [-7, 5.85, 53], [7, 7, 63],
  [-6, 8.15, 73],
] as const;

const distantPeaks = [
  [-30, -4, 38, 18], [25, -5, 44, 22], [-20, -6, 62, 27], [38, -7, 68, 30],
] as const;

const snowBlocks = LEVELS[2].gameplay.blocks;
const snowGameplay = LEVELS[2].gameplay;

const snowTrees = [
  [-8, 0.05, 4], [8, 0.05, 5], [-8, 1.45, 16], [8, 3.15, 31],
  [-8, 4.85, 47], [8, 6.55, 63], [-7, 8.25, 79], [5, 9.95, 95],
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
    [-width * 0.22, halfHeight - 0.48, depth * 0.5, 0.86, 0.58, 0.58],
    [width * 0.28, halfHeight - 0.75, -depth * 0.49, 0.72, 0.82, 0.62],
  ] as const;

  return (
    <group position={block.position as [number, number, number]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={block.size as [number, number, number]} />
        <meshStandardMaterial color={block.color} roughness={1} />
      </mesh>
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow scale={[width * 0.54, 1, depth * 0.57]}>
        <cylinderGeometry args={[1, 1.14, Math.max(0.75, height + 0.26), 9]} />
        <meshStandardMaterial color={cliffColor} roughness={1} />
      </mesh>
      <mesh position={[0, halfHeight + 0.055, 0]} receiveShadow scale={[width * 0.52, 1, depth * 0.54]}>
        <cylinderGeometry args={[1, 1.04, 0.11, 10]} />
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
          <mesh position={[-0.72, halfHeight + 0.125, -0.25]} scale={[1.45, 1, 0.72]} receiveShadow>
            <cylinderGeometry args={[1, 1, 0.035, 10]} />
            <meshStandardMaterial color={trailColor} roughness={1} />
          </mesh>
          <mesh position={[0.94, halfHeight + 0.126, 0.48]} scale={[1.18, 1, 0.62]} receiveShadow>
            <cylinderGeometry args={[1, 1, 0.036, 9]} />
            <meshStandardMaterial color={trailColor} roughness={1} />
          </mesh>
          <mesh position={[width * 0.26, halfHeight + 0.18, -depth * 0.22]} rotation={[0.3, index, 0.2]} scale={[0.3, 0.22, 0.34]} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={snow ? '#84959d' : '#667064'} roughness={1} />
          </mesh>
        </>
      )}
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
        <FrozenRidgeDecor />
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
        {snowGameplay.ambushDrops.map((ambush, index) => <AmbushDrop key={`ambush-${runVersion}-${index}`} {...ambush} />)}
        {snowTrees.map((tree, index) => (
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
      <RigidBody type="fixed" colliders={false}>
        {blocks.map((block, index) => (
          <RockyTerrace key={`block-${index}`} block={block} index={index} />
        ))}
        {blocks.map((block, index) => (
          <CuboidCollider
            key={`block-collider-${index}`}
            args={[block.size[0] / 2 - COLLIDER_EDGE_SKIN, block.size[1] / 2, block.size[2] / 2 - COLLIDER_EDGE_SKIN]}
            position={block.position as [number, number, number]}
          />
        ))}
      </RigidBody>

      {trees.map((tree, index) => (
        <RigidBody key={`tree-${index}`} type="fixed" colliders={false} position={tree}>
          <CuboidCollider args={[0.16, 0.8, 0.16]} position={[0, 0.8, 0]} />
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
        </RigidBody>
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

      {config.gameplay.trapFloors.map((floor, index) => <TrapFloor key={`trap-floor-${index}`} {...floor} />)}
      {config.gameplay.ambushDrops.map((ambush, index) => <AmbushDrop key={`ambush-${runVersion}-${index}`} {...ambush} />)}
      {config.gameplay.chestTraps.map((chest, index) => <ChestTrap key={`chest-${index}`} {...chest} />)}
      {config.gameplay.snareTraps.map((snare, index) => <SnareTrap key={`snare-${runVersion}-${index}`} {...snare} />)}
    </group>
  );
};
