import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  DataTexture,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
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
export function FurnitureModel({
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
export function ContextMonitor({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) {
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
