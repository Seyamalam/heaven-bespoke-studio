import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Color, PCFShadowMap } from "three";
import type { Design } from "../lib/design";
import { FurnitureModel, ContextMonitor } from "./FurnitureObjects";

export default function FurnitureScene({
  design,
  evening,
  rotation,
  viewVersion,
  onUnavailable,
}: {
  design: Design;
  evening: boolean;
  rotation: number;
  viewVersion: number;
  onUnavailable: () => void;
}) {
  const { scene } = useGLTF(`/models/${design.product}.glb`);
  const distance = design.product === "sofa" ? 3.25 : 1.95;
  return (
    <Canvas
      key={viewVersion}
      shadows={{ type: PCFShadowMap }}
      frameloop="demand"
      dpr={[1, 1.6]}
      camera={{
        position: [distance * 0.6, distance * 0.46, distance * 0.85],
        fov: 38,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      fallback={<span aria-hidden="true" />}
      aria-label="Interactive furniture model. Use the nearby buttons to rotate without dragging."
    >
      <ContextMonitor onUnavailable={onUnavailable} />
      <ambientLight
        intensity={evening ? 0.7 : 1.5}
        color={evening ? "#f5cf9b" : "#ffffff"}
      />
      <hemisphereLight args={["#fbf5e9", "#776557", 1.1]} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={evening ? 2.8 : 3.2}
        color={evening ? "#ffca8f" : "#fff9e8"}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={1} />
      <FurnitureModel scene={scene} design={design} rotation={rotation} />
      <ContactShadows
        position={[0, -0.014, 0]}
        opacity={0.38}
        scale={8}
        blur={2.5}
        far={2.8}
        resolution={256}
        color={new Color("#534533")}
        frames={1}
        key={`${design.product}-${design.width}-${rotation}`}
      />
      <OrbitControls
        target={[0, design.product === "table" ? 0.22 : 0.42, 0]}
        enablePan={false}
        minDistance={distance * 0.7}
        maxDistance={distance * 1.65}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping={false}
        makeDefault
      />
    </Canvas>
  );
}
