import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import {
  DataTexture,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  Color,
  PCFShadowMap,
  Group,
} from "three";
import { fabrics, furniture, woods } from "../lib/design";
import type { Design } from "../lib/design";

function makeTexture(kind: "fabric" | "wood") {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const grain =
        kind === "fabric"
          ? 200 + 25 * Math.sin((x * Math.PI) / 2) * Math.cos((y * Math.PI) / 2)
          : 180 +
            35 *
              Math.sin(
                y * 0.45 + Math.sin(x * 0.035) * 3 + Math.sin(y * 0.1) * 1.5,
              );
      const index = (y * size + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = grain;
      data[index + 3] = 255;
    }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "fabric" ? 18 : 2, kind === "fabric" ? 18 : 3);
  texture.needsUpdate = true;
  return texture;
}
function Model({
  design,
  rotation,
  scene,
}: {
  design: Design;
  rotation: number;
  scene: Group;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const { clone, ownedMaterials, textures } = useMemo(() => {
    const clone = scene.clone(true);
    const ownedMaterials: MeshStandardMaterial[] = [];
    const textures = {
      fabric: makeTexture("fabric"),
      wood: makeTexture("wood"),
    };
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const originals = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const copies = originals.map((source) => {
        const mat = source.clone() as MeshStandardMaterial;
        if (mat.name.startsWith("Fabric")) {
          mat.bumpMap = textures.fabric;
          mat.bumpScale = 0.0006;
          mat.roughness = 0.95;
        }
        if (mat.name.startsWith("Wood")) {
          mat.bumpMap = textures.wood;
          mat.bumpScale = 0.003;
          mat.roughness = 0.48;
        }
        ownedMaterials.push(mat);
        return mat;
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });
    return { clone, ownedMaterials, textures };
  }, [scene]);
  useEffect(() => {
    for (const material of ownedMaterials) {
      if (material.name.startsWith("Fabric"))
        material.color.set(fabrics[design.fabric].color);
      if (material.name.startsWith("Wood"))
        material.color.set(woods[design.wood].color);
    }
    invalidate();
  }, [design.fabric, design.wood, ownedMaterials, invalidate]);
  useEffect(
    () => () => {
      ownedMaterials.forEach((m) => m.dispose());
      textures.fabric.dispose();
      textures.wood.dispose();
    },
    [ownedMaterials, textures],
  );
  return (
    <group
      rotation={[0, rotation, 0]}
      scale={[design.width / furniture[design.product].width, 1, 1]}
    >
      <primitive object={clone} dispose={null} />
    </group>
  );
}
function ContextMonitor({ onUnavailable }: { onUnavailable: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onUnavailable]);
  return null;
}
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
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
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
      <Model scene={scene} design={design} rotation={rotation} />
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
