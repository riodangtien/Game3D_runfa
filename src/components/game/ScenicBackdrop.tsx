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

const sideRidges = [
  [-30, -4.2, 8, 8, 5.5], [29, -4.4, 10, 7, 5],
  [-24, -3.8, 24, 7, 5], [25, -4.0, 27, 8, 6],
  [-34, -3.9, 42, 10, 7], [33, -4.1, 46, 9, 6],
  [-28, -1.0, 61, 9, 7], [27, -1.2, 65, 10, 8],
  [-39, 2.8, 78, 11, 8], [18, 2.4, 82, 9, 7],
  [-46, 5.0, 101, 10, 8], [-11, 4.8, 108, 9, 7],
  [-48, 7.4, 122, 10, 8], [-8, 7.1, 144, 9, 7],
  [-49, 8.2, 162, 11, 9], [-9, 8.0, 171, 10, 8],
  [-47, 8.8, 184, 11, 9], [-8, 9.2, 202, 10, 8],
  [-43, 9.8, 216, 10, 8], [-4, 10.0, 222, 9, 7],
  [-37, 11.2, 232, 10, 8], [18, 12.2, 252, 11, 9],
  [-28, 15.0, 274, 10, 8], [35, 16.2, 286, 12, 10],
  [-34, 18.0, 302, 11, 9], [31, 19.2, 316, 13, 11],
  [-32, 20.6, 330, 12, 10], [29, 21.8, 342, 13, 11],
  [-35, 23.0, 354, 14, 12], [32, 24.2, 368, 14, 12],
  [-27, 25.0, 382, 13, 11], [28, 25.4, 390, 14, 12],
] as const;

const river = [
  [-20, -3.68, 10, 7, 12, -0.35],
  [-17, -3.67, 21, 7, 14, 0.24],
  [-21, -3.66, 34, 8, 16, -0.22],
  [-17, -3.65, 49, 9, 18, 0.2],
  [-22, -3.64, 66, 10, 20, -0.16],
  [-44, 6.7, 100, 8, 18, 0.32],
  [-47, 9.8, 126, 7, 18, -0.24],
  [-44, 12.5, 152, 6, 18, 0.18],
] as const;

const forest = [
  [-31, -2.8, 12, 1.3], [-27, -2.8, 18, 1.5], [-33, -2.8, 24, 1.1],
  [-23, -2.8, 29, 1.35], [27, -2.8, 14, 1.4], [33, -2.8, 19, 1.2],
  [26, -2.8, 28, 1.55], [39, -2.8, 32, 1.35], [31, -2.8, 38, 1.1],
] as const;

const themedMountains = [
  [-48, -2.0, 42, 8, 12, '#55714f', '#d4e1d8'],
  [45, -2.2, 58, 9, 14, '#607964', '#d4e1d8'],
  [-55, 5.2, 112, 7, 13, '#657985', '#e8f4f6'],
  [-8, 5.8, 132, 7, 12, '#71848d', '#e8f4f6'],
  [-50, 8.2, 168, 8, 13, '#566772', '#e8f4f6'],
  [-49, 8.8, 205, 8, 12, '#332f2d', '#c4562c'],
  [-9, 7.8, 212, 6, 10, '#3a3330', '#e66a34'],
  [-38, 10.8, 236, 7, 13, '#56514b', '#9b9488'],
  [17, 11.8, 250, 8, 15, '#625d55', '#a8a094'],
  [-32, 14.6, 282, 8, 14, '#57534e', '#aaa39a'],
  [34, 16.2, 304, 9, 16, '#625d57', '#b8b0a5'],
  [-34, 19.8, 328, 10, 18, '#514f4a', '#979187'],
  [31, 21.0, 348, 11, 20, '#484743', '#8b877f'],
  [-29, 23.0, 370, 12, 22, '#41413e', '#817d76'],
  [30, 23.8, 388, 11, 21, '#3b3c39', '#77746e'],
] as const;

const lavaFlow = [
  [-42, 7.0, 194, 5.2, 14, 0.15],
  [-39, 7.2, 208, 4.7, 16, -0.18],
  [-33, 8.6, 224, 4.0, 14, 0.26],
] as const;

export const ScenicBackdrop = () => {
  const level = useGameStore((state) => state.level);
  const snow = level === 2;

  return (
    <group>
      <mesh position={[0, -4.25, 185]} receiveShadow>
        <boxGeometry args={[116, 1, 430]} />
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

      {lavaFlow.map(([x, y, z, width, depth, rotation], index) => (
        <mesh key={`lava-flow-${index}`} position={[x, y, z]} rotation={[0, rotation, 0]} scale={[width, 1, depth]}>
          <cylinderGeometry args={[1, 1, 0.09, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#dc2626" emissiveIntensity={1.25} roughness={0.5} />
        </mesh>
      ))}

      {hills.map(([x, y, z, radius, height], index) => (
        <mesh key={`hill-${index}`} position={[x, y + height / 2, z]} scale={[1, 1, 0.84]}>
          <coneGeometry args={[radius, height, 9]} />
          <meshStandardMaterial color={snow ? '#879ca3' : index % 2 === 0 ? '#55714f' : '#66805a'} roughness={1} />
        </mesh>
      ))}

      {sideRidges.map(([x, y, z, radius, height], index) => {
        const snowy = snow || (z >= 92 && z < 184);
        const volcanic = z >= 184 && z < 224;
        return (
          <group key={`side-ridge-${index}`} position={[x, y, z]} rotation={[0, index * 0.37, 0]}>
            <mesh position={[0, height / 2, 0]} scale={[1, 1, 0.76]}>
              <coneGeometry args={[radius, height, 9]} />
              <meshStandardMaterial color={volcanic ? '#3c3531' : snowy ? '#667b84' : index % 2 === 0 ? '#536d4c' : '#617b55'} roughness={1} />
            </mesh>
            <mesh position={[0, height * 0.79, 0]} scale={[1, 1, 0.76]}>
              <coneGeometry args={[radius * 0.38, height * 0.3, 9]} />
              <meshStandardMaterial color={volcanic ? '#8f4931' : snowy ? '#e5eff1' : '#879b73'} roughness={1} />
            </mesh>
          </group>
        );
      })}

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

      {themedMountains.map(([x, y, z, radius, height, color, capColor], index) => (
        <group key={`themed-mountain-${index}`} position={[x, y, z]} rotation={[0, index * 0.24, 0]}>
          <mesh position={[0, height / 2, 0]}>
            <coneGeometry args={[radius, height, 8]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
          <mesh position={[0, height * 0.76, 0]}>
            <coneGeometry args={[radius * 0.42, height * 0.34, 8]} />
            <meshStandardMaterial color={capColor} emissive={index >= 5 && index <= 6 ? '#7f1d1d' : '#000000'} emissiveIntensity={index >= 5 && index <= 6 ? 0.35 : 0} roughness={1} />
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
