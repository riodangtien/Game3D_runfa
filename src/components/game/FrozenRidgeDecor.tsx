const iceSpikes = [
  [-10, 0.2, 12, 2.8],
  [9, 0.2, 19, 3.6],
  [-10, 0.2, 34, 4.4],
  [10, 0.2, 50, 4.8],
  [-10, 0.2, 66, 5.3],
  [9, 0.2, 82, 6.2],
] as const;

const ridgeWalls = [
  [-15, -3.8, 38, 10, 20],
  [15, -4.6, 50, 12, 24],
  [-17, -6.2, 72, 15, 30],
  [17, -7.4, 88, 18, 35],
] as const;

export const FrozenRidgeDecor = () => (
  <group>
    {ridgeWalls.map(([x, y, z, width, height], index) => (
      <group key={`ridge-wall-${index}`} position={[x, y, z]} rotation={[0, index % 2 === 0 ? 0.12 : -0.12, 0]}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[width, height, 6]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#60747e' : '#526872'} roughness={1} />
        </mesh>
        <mesh position={[0, height * 0.34, 0]}>
          <coneGeometry args={[width * 0.57, height * 0.42, 6]} />
          <meshStandardMaterial color="#e4f1f3" roughness={0.88} />
        </mesh>
      </group>
    ))}
    {iceSpikes.map(([x, y, z, height], index) => (
      <group key={`ice-spike-${index}`} position={[x, y, z]} rotation={[0, index * 0.47, 0]}>
        <mesh position={[0, height / 2, 0]} castShadow>
          <coneGeometry args={[0.74 + height * 0.08, height, 7]} />
          <meshStandardMaterial color="#b8e3e8" roughness={0.3} transparent opacity={0.88} />
        </mesh>
        <mesh position={[0.82, height * 0.28, 0.35]} rotation={[0.16, 0, -0.12]} castShadow>
          <coneGeometry args={[0.42, height * 0.58, 6]} />
          <meshStandardMaterial color="#d9f4f6" roughness={0.24} transparent opacity={0.84} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, -1.55, 52]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 104]} />
      <meshStandardMaterial color="#7bb6bf" roughness={0.2} metalness={0.08} />
    </mesh>
  </group>
);
