import { Canvas, useLoader, useThree } from "@react-three/fiber";
// import { Model } from './SamplePetal';
import { Environment, Html, useProgress } from "@react-three/drei";
import { RGBELoader } from "three-stdlib";
import { Suspense } from "react";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

useLoader.preload(RGBELoader, "/qwantani_dusk_2_puresky_1k.hdr");

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <span style={{ whiteSpace: "nowrap" }}>
        {progress.toFixed(0)}% loaded
      </span>
    </Html>
  );
}

export default function Breeze3D({
  setHoveredIndex,
}: {
  setHoveredIndex: Function;
}) {
  return (
    <div className="w-full h-full">
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 14], fov: 30 }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[5, 8, 3]}
            intensity={2}
            color="#fff5e6"
          />
          <directionalLight
            position={[-3, -2, -5]}
            intensity={1}
            color="#b8c8e8"
          />
          <directionalLight
            position={[0, 3, -8]}
            intensity={1}
            color="#ffd4a8"
          />
          <Environment files="qwantani_dusk_2_puresky_1k.hdr" />
          <Model setHoveredIndex={setHoveredIndex} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// One shared geometry for all spheres
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

interface MeshData {
  pos: number[];
  scale: number;
}

const MESH_DATA: MeshData[] = [
  { pos: [0.045, 0, -0.96], scale: 0.082 },
  { pos: [0.48, 0.691, -0.822], scale: 0.053 },
  { pos: [1.089, 0, -0.96], scale: 0.067 },
  { pos: [1.129, 1.129, -0.96], scale: 0.067 },
  { pos: [1.473, 1.603, -0.96], scale: 0.067 },
  { pos: [-1.304, 0.401, -0.96], scale: 0.035 },
  { pos: [-0.672, 0.085, -0.96], scale: 0.035 },
  { pos: [0.045, 0, -0.96], scale: 0.082 },
  { pos: [-0.768, 0.627, -0.96], scale: 0.09 },
  { pos: [-0.386, 1.347, -0.908], scale: 0.09 },
  { pos: [1.484, 1.217, -0.933], scale: 0.067 },
  { pos: [-1.208, 2.111, -0.96], scale: 0.067 },
  { pos: [-1.706, 2.488, -0.974], scale: 0.041 },
  { pos: [-1.614, 0.965, -0.954], scale: 0.053 },
  { pos: [-1.801, 0.119, -0.96], scale: 0.035 },
  { pos: [1.834, 0.606, -0.963], scale: 0.019 },
  { pos: [-1.731, 0.107, -0.955], scale: 0.023 },
  { pos: [-1.784, 0.133, -1.014], scale: 0.017 },
] as const;

const SPHERE_COUNT = MESH_DATA.length;

function BluebellMaterial() {
  return (
    <meshPhysicalMaterial
      color="#bebee5"
      metalness={0.3}
      roughness={0.15}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      envMapIntensity={2.5}
      reflectivity={1.0}
      side={THREE.DoubleSide}
    />
  );
}

export function Model({ setHoveredIndex }: { setHoveredIndex: Function }) {
  const { viewport } = useThree();

  // Content bounding box in local units
  const contentMinX = Math.min(...MESH_DATA.map((m) => m.pos[0]));
  const contentMaxX = Math.max(...MESH_DATA.map((m) => m.pos[0]));
  const contentMinY = Math.min(...MESH_DATA.map((m) => m.pos[1]));
  const contentMaxY = Math.max(...MESH_DATA.map((m) => m.pos[1]));
  const contentWidth = contentMaxX - contentMinX; // 3.635
  const contentHeight = contentMaxY - contentMinY; // 2.488

  // How much of the viewport the content should occupy
  const targetFractionX = 0.6;
  const targetFractionY = 0.75;
  const targetW = viewport.width * targetFractionX;
  const targetH = viewport.height * targetFractionY;

  // Per-axis scale factors
  const scaleX = targetW / contentWidth;
  const scaleY = targetH / contentHeight;

  // Bottom-align with padding
  const paddingFraction = 0.02;
  const groupY = -viewport.height / 2 + viewport.height * paddingFraction;

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const elapsedRef = useRef(0);
  const hoveredRef = useRef<Set<number>>(new Set());

  const STAGGER_DELAY = 0.12;
  const INTRO_SPEED = 6;

  const randoms = useMemo(
    () =>
      Array.from({ length: SPHERE_COUNT }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        w: Math.random(),
      })),
    [],
  );

  const localTimes = useRef<number[]>(
    Array.from({ length: SPHERE_COUNT }, () => 0),
  );

  useFrame((_, delta) => {
    elapsedRef.current += delta * 0.5;
    const t = elapsedRef.current;

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const r = randoms[i];
      const base = MESH_DATA[i].pos;

      // --- Intro scale ---
      const sphereTime = t * 2 - i * STAGGER_DELAY;
      const rawProgress = Math.max(0, Math.min(1, sphereTime * INTRO_SPEED));
      const bounce =
        1 + 0.35 * Math.sin(rawProgress * Math.PI) * (1 - rawProgress);
      // Use average scale for sphere size to keep them round
      const avgScale = (scaleX + scaleY) / 2;
      mesh.scale.setScalar(
        MESH_DATA[i].scale * avgScale * rawProgress * bounce,
      );

      // --- Only advance local time when not hovered ---
      if (!hoveredRef.current.has(i)) {
        localTimes.current[i] += delta * 0.5;
      }
      const lt = localTimes.current[i];

      // Oscillation amplitude scaled per axis
      const oscX =
        Math.sin(lt * r.z + 6.28318 * r.w) * (0.05 + 0.15 * r.x) * scaleX;
      const oscY =
        Math.sin(lt * r.y + 6.28318 * r.x) * (0.05 + 0.15 * r.w) * scaleY;
      const oscZ = Math.sin(lt * r.w + 6.28318 * r.y) * (0.05 + 0.15 * r.z);

      // Remap local pos to viewport range, then add oscillation
      const t_x = (base[0] - contentMinX) / contentWidth;
      const t_y = (base[1] - contentMinY) / contentHeight;

      mesh.position.set(
        -targetW / 2 + t_x * targetW + oscX,
        t_y * targetH + oscY,
        base[2] + oscZ,
      );
    });
  });

  const handlePointerEnter = (i: number) => {
    hoveredRef.current.add(i);
    setHoveredIndex(i);
  };

  const handlePointerLeave = (i: number) => {
    hoveredRef.current.delete(i);
    setHoveredIndex(null);
  };

  return (
    <group dispose={null} scale={1} position={[0, groupY, 0]}>
      {MESH_DATA.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          castShadow
          receiveShadow
          geometry={sphereGeometry}
          position={d.pos as [number, number, number]}
          onPointerEnter={() => handlePointerEnter(i)}
          onPointerLeave={() => handlePointerLeave(i)}
        >
          <BluebellMaterial />
        </mesh>
      ))}
    </group>
  );
}
