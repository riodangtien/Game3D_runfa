import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

const distantMountains = [
  [-58, -9, 108, 9, 14],
  [58, -10, 118, 10, 16],
] as const;

const hills = [
  [-36, -5.8, 24, 12, 5],
  [34, -5.9, 28, 12, 5],
] as const;

const river = [
  [-20, -3.68, 10, 7, 12, -0.35],
  [-17, -3.67, 21, 7, 14, 0.24],
  [-21, -3.66, 34, 8, 16, -0.22],
  [-17, -3.65, 49, 9, 18, 0.2],
  [-22, -3.64, 66, 10, 20, -0.16],
] as const;

const forest = [
  [-31, -2.8, 12, 1.3], [-27, -2.8, 18, 1.5], [-33, -2.8, 24, 1.1],
  [-23, -2.8, 29, 1.35], [27, -2.8, 14, 1.4], [33, -2.8, 19, 1.2],
  [26, -2.8, 28, 1.55], [39, -2.8, 32, 1.35], [31, -2.8, 38, 1.1],
] as const;

export const ScenicBackdrop = () => {
  const level = useGameStore((state) => state.level);
  const snow = level === 2;

  return (
    <group>
      <mesh position={[0, -4.25, 48]} receiveShadow>
        <boxGeometry args={[116, 1, 142]} />
        <meshStandardMaterial color={snow ? '#9eb3b8' : '#607b5a'} roughness={1} />
      </mesh>

      {river.map(([x, y, z, width, depth, rotation], index) => (
        <mesh key={`river-${index}`} position={[x, y, z]} rotation={[0, rotation, 0]} scale={[width, 1, depth]}>
          <cylinderGeometry args={[1, 1, 0.08, 16]} />
          <meshStandardMaterial
            color={snow ? '#91d4df' : '#4d9ea8'}
            emissive={snow ? '#77b7c2' : '#326e7b'}
            emissiveIntensity={0.16}
            metalness={0.08}
            roughness={0.38}
          />
        </mesh>
      ))}

      {hills.map(([x, y, z, radius, height], index) => (
        <mesh key={`hill-${index}`} position={[x, y + height / 2, z]} scale={[1, 1, 0.84]}>
          <coneGeometry args={[radius, height, 9]} />
          <meshStandardMaterial color={snow ? '#879ca3' : index % 2 === 0 ? '#55714f' : '#66805a'} roughness={1} />
        </mesh>
      ))}

      {forest.map(([x, y, z, scale], index) => (
        <group key={`forest-${index}`} position={[x, y, z]} scale={scale}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1.6, 7]} />
            <meshStandardMaterial color="#583d2d" roughness={1} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <coneGeometry args={[0.95, 2.8, 8]} />
            <meshStandardMaterial color={snow ? '#4d6971' : index % 2 === 0 ? '#2f6049' : '#3d6e50'} roughness={1} />
          </mesh>
        </group>
      ))}

      {distantMountains.map(([x, y, z, radius, height], index) => (
        <group key={`distant-mountain-${index}`} position={[x, y, z]} rotation={[0, index * 0.42, 0]}>
          <mesh position={[0, height / 2, 0]}>
            <coneGeometry args={[radius, height, 8]} />
            <meshStandardMaterial color={snow ? '#71858e' : index % 2 === 0 ? '#6b7f79' : '#768b83'} roughness={1} />
          </mesh>
          <mesh position={[0, height * 0.72, 0]}>
            <coneGeometry args={[radius * 0.48, height * 0.36, 8]} />
            <meshStandardMaterial color={snow ? '#dcebed' : '#d4e1d8'} roughness={1} />
          </mesh>
        </group>
      ))}

      <mesh position={[-22, 24, 88]}>
        <circleGeometry args={[5.2, 32]} />
        <meshBasicMaterial color="#ffd48a" side={THREE.DoubleSide} />
      </mesh>

      {[
        [-13, 15, 34, 0.2],
        [-9, 17, 38, -0.1],
        [14, 18, 44, 0.18],
        [19, 16, 48, -0.16],
      ].map(([x, y, z, tilt], index) => (
        <group key={`bird-${index}`} position={[x, y, z]} rotation={[0, 0, tilt]}>
          <mesh position={[-0.26, 0, 0]} rotation={[0, 0, 0.42]}>
            <boxGeometry args={[0.52, 0.05, 0.12]} />
            <meshBasicMaterial color="#38484a" />
          </mesh>
          <mesh position={[0.26, 0, 0]} rotation={[0, 0, -0.42]}>
            <boxGeometry args={[0.52, 0.05, 0.12]} />
            <meshBasicMaterial color="#38484a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
