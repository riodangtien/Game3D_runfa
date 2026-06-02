import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useMemo } from 'react';
import * as THREE from 'three';

type Position = readonly [number, number, number];

const makeTexture = (kind: 'plaster' | 'roof' | 'wood', color: string) => {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  const base = new THREE.Color(color);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const noise = ((x * 37 + y * 61 + x * y * 7) % 19) / 18 - 0.5;
      const roofJoint = kind === 'roof' && (y % 14 < 2 || (x + (Math.floor(y / 14) % 2) * 8) % 16 < 2);
      const woodGrain = kind === 'wood' && (x % 11 < 2 || Math.abs(Math.sin(y * 0.34 + x * 0.08)) > 0.93);
      const shade = roofJoint ? -0.24 : woodGrain ? -0.16 : noise * (kind === 'plaster' ? 0.1 : 0.07);
      pixels[index] = THREE.MathUtils.clamp((base.r + shade) * 255, 0, 255);
      pixels[index + 1] = THREE.MathUtils.clamp((base.g + shade) * 255, 0, 255);
      pixels[index + 2] = THREE.MathUtils.clamp((base.b + shade) * 255, 0, 255);
      pixels[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, size, size);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'plaster' ? 2 : 3, kind === 'roof' ? 2 : 3);
  texture.needsUpdate = true;
  return texture;
};

const Roof = ({ color = '#a9583c', thatch = false }: { color?: string; thatch?: boolean }) => {
  const roofTexture = useMemo(() => makeTexture('roof', thatch ? '#c79651' : color), [color, thatch]);

  return (
    <group position={[0, 2.52, 0]}>
      <mesh position={[-1.12, 0.7, 0]} rotation={[0, 0, 0.56]} castShadow>
        <boxGeometry args={[2.72, 0.2, 4.05]} />
        <meshStandardMaterial map={roofTexture} roughness={1} />
      </mesh>
      <mesh position={[1.12, 0.7, 0]} rotation={[0, 0, -0.56]} castShadow>
        <boxGeometry args={[2.72, 0.2, 4.05]} />
        <meshStandardMaterial map={roofTexture} roughness={1} />
      </mesh>
      <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 4.18, 10]} />
        <meshStandardMaterial color={thatch ? '#a87843' : '#71372d'} roughness={1} />
      </mesh>
    </group>
  );
};

const StoneFoundation = () => (
  <group>
    {[-1.82, -1.18, -0.54, 0.1, 0.74, 1.38, 2.02].map((x, index) => (
      <mesh
        key={`foundation-front-${x}`}
        position={[x, 0.37 + (index % 2) * 0.05, 1.88]}
        rotation={[index * 0.08, index * 0.14, index % 2 === 0 ? 0.05 : -0.06]}
        scale={[0.36, 0.28 + (index % 3) * 0.04, 0.24]}
        castShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#776e61' : '#8b8171'} roughness={1} />
      </mesh>
    ))}
    {[-1.5, -0.72, 0.06, 0.84, 1.62].map((z, index) => (
      <mesh
        key={`foundation-side-${z}`}
        position={[2.28, 0.36 + (index % 2) * 0.05, z]}
        rotation={[index * 0.06, index * 0.28, index % 2 === 0 ? -0.04 : 0.07]}
        scale={[0.24, 0.3, 0.4]}
        castShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#776e61' : '#918777'} roughness={1} />
      </mesh>
    ))}
  </group>
);

const Gable = ({ texture }: { texture: THREE.Texture }) => {
  const shape = useMemo(() => {
    const triangle = new THREE.Shape();
    triangle.moveTo(-2.22, 0);
    triangle.lineTo(0, 1.48);
    triangle.lineTo(2.22, 0);
    triangle.closePath();
    return triangle;
  }, []);

  return (
    <>
      {[1.7, -1.7].map((z) => (
        <mesh key={`gable-${z}`} position={[0, 2.66, z]} rotation={[0, z < 0 ? Math.PI : 0, 0]} castShadow>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.96} />
        </mesh>
      ))}
    </>
  );
};

const Cottage = ({
  position,
  rotation = 0,
  wall = '#d7c28f',
  roof = '#a9583c',
  thatch = false,
}: {
  position: Position;
  rotation?: number;
  wall?: string;
  roof?: string;
  thatch?: boolean;
}) => {
  const plasterTexture = useMemo(() => makeTexture('plaster', wall), [wall]);
  const woodTexture = useMemo(() => makeTexture('wood', '#765136'), []);

  return (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
    <CuboidCollider args={[2.25, 1.65, 1.72]} position={[0, 1.65, 0]} />
    <group>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.48, 3.65]} />
        <meshStandardMaterial color="#786653" roughness={1} />
      </mesh>
      <StoneFoundation />
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.45, 2.45, 3.38]} />
        <meshStandardMaterial map={plasterTexture} roughness={0.96} />
      </mesh>
      <Gable texture={plasterTexture} />
      <Roof color={roof} thatch={thatch} />
      {[-1.9, 1.9].map((x) => (
        <mesh key={`corner-${x}`} position={[x, 1.48, 1.73]} castShadow>
          <boxGeometry args={[0.22, 2.65, 0.18]} />
          <meshStandardMaterial map={woodTexture} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2.32, 1.73]} castShadow>
        <boxGeometry args={[4.08, 0.2, 0.2]} />
        <meshStandardMaterial map={woodTexture} roughness={1} />
      </mesh>
      <mesh position={[0, 0.95, 1.78]} castShadow>
        <boxGeometry args={[1.05, 1.8, 0.18]} />
        <meshStandardMaterial color="#4b3024" roughness={1} />
      </mesh>
      {[-0.68, 0.68].map((x) => (
        <mesh key={`door-frame-${x}`} position={[x, 1.02, 1.9]} castShadow>
          <boxGeometry args={[0.16, 2.16, 0.16]} />
          <meshStandardMaterial map={woodTexture} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2.04, 1.9]} castShadow>
        <boxGeometry args={[1.5, 0.18, 0.16]} />
        <meshStandardMaterial map={woodTexture} roughness={1} />
      </mesh>
      <mesh position={[0.31, 1.04, 1.91]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#d2a253" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.84, 1.79]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.53, 0.53, 0.18, 18, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#4b3024" roughness={1} />
      </mesh>
      <mesh position={[-1.28, 1.48, 1.79]}>
        <boxGeometry args={[0.76, 0.82, 0.12]} />
        <meshStandardMaterial color="#8cc5c4" emissive="#5a9ea2" emissiveIntensity={0.28} roughness={0.42} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={`side-window-${side}`} position={[side * 2.24, 1.5, -0.28]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.78, 0.84, 0.12]} />
            <meshStandardMaterial color="#8cc5c4" emissive="#5a9ea2" emissiveIntensity={0.22} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.88, 0.12, 0.12]} />
            <meshStandardMaterial color="#5f432e" roughness={1} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.12, 0.94, 0.12]} />
            <meshStandardMaterial color="#5f432e" roughness={1} />
          </mesh>
        </group>
      ))}
      <mesh position={[-1.28, 1.48, 1.87]}>
        <boxGeometry args={[0.86, 0.12, 0.12]} />
        <meshStandardMaterial color="#5f432e" roughness={1} />
      </mesh>
      <mesh position={[-1.28, 1.48, 1.87]}>
        <boxGeometry args={[0.12, 0.94, 0.12]} />
        <meshStandardMaterial color="#5f432e" roughness={1} />
      </mesh>
      <group position={[-1.28, 0.98, 1.98]}>
        <mesh castShadow>
          <boxGeometry args={[1.08, 0.22, 0.34]} />
          <meshStandardMaterial color="#805438" roughness={1} />
        </mesh>
        {[-0.36, -0.12, 0.16, 0.38].map((x, index) => (
          <mesh key={`flower-${x}`} position={[x, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#d87d5e' : '#e7c767'} roughness={1} />
          </mesh>
        ))}
      </group>
      <mesh position={[1.34, 3.38, 0]} castShadow>
        <boxGeometry args={[0.58, 1.18, 0.68]} />
        <meshStandardMaterial color="#88715e" roughness={1} />
      </mesh>
      <mesh position={[0, 0.52, 1.95]} rotation={[-0.08, 0, 0]} receiveShadow>
        <boxGeometry args={[1.48, 0.12, 0.68]} />
        <meshStandardMaterial color="#ad8158" roughness={1} />
      </mesh>
      <mesh position={[1.62, 0.74, 1.94]} rotation={[0.06, -0.12, -0.04]} castShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.9, 10]} />
        <meshStandardMaterial color="#9b643f" roughness={1} />
      </mesh>
      <mesh position={[1.62, 1.2, 1.94]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.07, 7, 12]} />
        <meshStandardMaterial color="#6c432c" roughness={1} />
      </mesh>
    </group>
  </RigidBody>
  );
};

const MarketStall = ({ position, rotation = 0 }: { position: Position; rotation?: number }) => (
  <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
    <CuboidCollider args={[1.75, 0.82, 0.82]} position={[0, 0.82, 0]} />
    <group>
      <mesh position={[0, 0.54, 0]} castShadow>
        <boxGeometry args={[3.5, 1.08, 1.52]} />
        <meshStandardMaterial color="#8a5b38" roughness={1} />
      </mesh>
      {[-1.52, 1.52].map((x) => (
        <mesh key={`stall-post-${x}`} position={[x, 1.72, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 2.42, 8]} />
          <meshStandardMaterial color="#573924" roughness={1} />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2].map((x, index) => (
        <mesh key={`stall-awning-${x}`} position={[x, 2.72, 0]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.82, 0.14, 2.1]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#4b8b84' : '#e7d7a7'} roughness={0.86} />
        </mesh>
      ))}
      {[-1, -0.35, 0.35, 1].map((x, index) => (
        <mesh key={`produce-${x}`} position={[x, 1.17, 0.74]} castShadow>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#cf7040' : '#6d9b4c'} roughness={1} />
        </mesh>
      ))}
    </group>
  </RigidBody>
);

const Well = ({ position }: { position: Position }) => (
  <RigidBody type="fixed" colliders={false} position={position}>
    <CuboidCollider args={[1.08, 0.68, 1.08]} position={[0, 0.68, 0]} />
    <group>
      <mesh position={[0, 0.54, 0]} castShadow>
        <cylinderGeometry args={[1.12, 1.28, 1.08, 12]} />
        <meshStandardMaterial color="#7d7465" roughness={1} />
      </mesh>
      <mesh position={[0, 1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.89, 0.16, 7, 18]} />
        <meshStandardMaterial color="#aaa08d" roughness={1} />
      </mesh>
      {[-0.86, 0.86].map((x) => (
        <mesh key={`well-post-${x}`} position={[x, 2.04, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 2.25, 8]} />
          <meshStandardMaterial color="#60412d" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 3.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.18, 8]} />
        <meshStandardMaterial color="#60412d" roughness={1} />
      </mesh>
      <mesh position={[0, 3.22, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.58, 0.92, 4]} />
        <meshStandardMaterial color="#8d543c" roughness={1} />
      </mesh>
    </group>
  </RigidBody>
);

const Lantern = ({ position }: { position: Position }) => (
  <group position={position}>
    <mesh position={[0, 1.25, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.1, 2.5, 8]} />
      <meshStandardMaterial color="#5a3d2d" roughness={1} />
    </mesh>
    <mesh position={[0, 2.5, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.28, 0.5, 8]} />
      <meshStandardMaterial color="#f5bd65" emissive="#f59e0b" emissiveIntensity={1.5} roughness={0.5} />
    </mesh>
    <mesh position={[0, 2.82, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.36, 0.42, 4]} />
      <meshStandardMaterial color="#69452f" roughness={1} />
    </mesh>
  </group>
);

const BroadleafTree = ({ position, scale = 1 }: { position: Position; scale?: number }) => (
  <RigidBody type="fixed" colliders={false} position={position}>
    <CuboidCollider args={[0.28 * scale, 1.18 * scale, 0.28 * scale]} position={[0, 1.18 * scale, 0]} />
    <mesh position={[0, 1.2 * scale, 0]} castShadow>
      <cylinderGeometry args={[0.24 * scale, 0.36 * scale, 2.4 * scale, 9]} />
      <meshStandardMaterial color="#67462f" roughness={1} />
    </mesh>
    {[
      [0, 3.15, 0, 1.28],
      [-0.75, 2.72, 0.22, 0.92],
      [0.72, 2.68, -0.12, 0.96],
      [0.08, 2.62, 0.7, 0.84],
    ].map(([x, y, z, radius], index) => (
      <mesh key={`tree-crown-${index}`} position={[x * scale, y * scale, z * scale]} castShadow>
        <dodecahedronGeometry args={[radius * scale, 0]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#3e714e' : '#4f8658'} roughness={1} />
      </mesh>
    ))}
  </RigidBody>
);

const Fence = ({ position, rotation = 0, length = 5 }: { position: Position; rotation?: number; length?: number }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {Array.from({ length: Math.floor(length / 0.72) + 1 }, (_, index) => -length / 2 + index * 0.72).map((x) => (
      <mesh key={`fence-post-${x}`} position={[x, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.35, 7]} />
        <meshStandardMaterial color="#765136" roughness={1} />
      </mesh>
    ))}
    {[0.42, 0.88].map((y) => (
      <mesh key={`fence-rail-${y}`} position={[0, y, 0]} castShadow>
        <boxGeometry args={[length, 0.12, 0.14]} />
        <meshStandardMaterial color="#8b6040" roughness={1} />
      </mesh>
    ))}
  </group>
);

const Path = () => (
  <group>
    {[
      [0, 0.07, -6, 1.8, 1.25],
      [-0.45, 0.07, -3.7, 1.55, 1.05],
      [0.2, 0.07, -1.5, 1.7, 1.14],
      [-0.22, 0.07, 0.8, 1.62, 1.1],
      [0.35, 0.07, 3.2, 1.75, 1.14],
      [-0.12, 0.07, 5.6, 1.56, 1.02],
    ].map(([x, y, z, sx, sz], index) => (
      <mesh key={`path-stone-${index}`} position={[x, y, z]} rotation={[0, index * 0.28, 0]} scale={[sx, 1, sz]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.1, 10]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#aa956e' : '#b7a17b'} roughness={1} />
      </mesh>
    ))}
  </group>
);

const VillageScatter = () => (
  <group>
    {[
      [-5.4, 0.15, 2.6, 0.42],
      [-4.9, 0.12, -1.6, 0.3],
      [5.8, 0.14, -1.3, 0.36],
      [7.2, 0.12, 5.9, 0.28],
      [-7, 0.13, 6.1, 0.34],
      [3.2, 0.1, -5.7, 0.24],
    ].map(([x, y, z, scale], index) => (
      <mesh key={`yard-rock-${index}`} position={[x, y, z]} rotation={[index * 0.34, index * 0.6, index * 0.22]} scale={[scale, scale * 0.72, scale]} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={index % 2 === 0 ? '#767567' : '#8c8876'} roughness={1} />
      </mesh>
    ))}
    {[
      [-5.8, 0.02, -0.6, 0.74],
      [-4.4, 0.02, 4.3, 0.58],
      [5, 0.02, 5.6, 0.64],
      [6.6, 0.02, 0.4, 0.52],
      [-2.8, 0.02, -5.7, 0.48],
    ].map(([x, y, z, scale], index) => (
      <group key={`grass-clump-${index}`} position={[x, y, z]} scale={scale}>
        {[-0.22, 0, 0.22].map((offset) => (
          <mesh key={`grass-blade-${offset}`} position={[offset, 0.28, 0]} rotation={[0, 0, offset * 1.8]}>
            <coneGeometry args={[0.12, 0.58, 5]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#557a48' : '#668850'} roughness={1} />
          </mesh>
        ))}
      </group>
    ))}
    <group position={[-5.2, 0, 6.1]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.84, 10]} />
        <meshStandardMaterial color="#9f6945" roughness={1} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.06, 7, 12]} />
        <meshStandardMaterial color="#70462f" roughness={1} />
      </mesh>
    </group>
    <group position={[5.4, 0, -5.4]}>
      {[-0.42, 0, 0.42].map((x, index) => (
        <mesh key={`stacked-crate-${index}`} position={[x, 0.36 + (index % 2) * 0.18, 0]} rotation={[0, index * 0.28, 0]} castShadow>
          <boxGeometry args={[0.72, 0.72, 0.72]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#93613d' : '#a46f45'} roughness={1} />
        </mesh>
      ))}
    </group>
  </group>
);

export const MountainVillage = () => (
  <group>
    <Path />
    <VillageScatter />
    <Cottage position={[-10, 0, 2.6]} rotation={Math.PI / 2} wall="#d8c692" roof="#a4533d" />
    <Cottage position={[10, 0, 2.2]} rotation={-Math.PI / 2} wall="#d9c99d" roof="#8f4b39" />
    <Cottage position={[-8.4, 0, -5.6]} rotation={0.08} wall="#cda874" roof="#c69754" thatch />
    <MarketStall position={[8.5, 0, -5.3]} rotation={-0.12} />
    <Well position={[5.5, 0, 4.7]} />
    <BroadleafTree position={[-11.5, 0, -1.8]} scale={0.92} />
    <BroadleafTree position={[11.6, 0, -2.7]} scale={0.86} />
    <BroadleafTree position={[-5.8, 0, -6.4]} scale={0.72} />
    <Lantern position={[-3.1, 0, -3.4]} />
    <Lantern position={[3.4, 0, 2.8]} />
    <Fence position={[-9.2, 0, 7]} length={6.4} />
    <Fence position={[9.4, 0, 7]} length={6.1} />
    <Fence position={[-11.8, 0, -6.8]} rotation={Math.PI / 2} length={3.2} />
    <Fence position={[11.8, 0, -6.8]} rotation={Math.PI / 2} length={3.2} />
  </group>
);
