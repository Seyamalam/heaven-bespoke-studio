import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import type { Group } from "three";
import type { Design, FurnitureKey } from "../lib/design";
import type { Pose } from "../lib/roomPlan";
import { FurnitureModel } from "./FurnitureObjects";
const ground = new Plane(new Vector3(0, 1, 0), 0);
export default function PlacedFurniture({
  piece,
  scene,
  design,
  pose,
  arranging,
  selected,
  onSelect,
  onMove,
}: {
  piece: FurnitureKey;
  scene: Group;
  design: Design;
  pose: Pose;
  arranging: boolean;
  selected: boolean;
  onSelect: (key: FurnitureKey) => void;
  onMove: (key: FurnitureKey, pose: Pose) => void;
}) {
  const drag = useRef<{ id: number; x: number; z: number } | null>(null);
  function end(event: ThreeEvent<PointerEvent>) {
    if (!drag.current) return;
    event.stopPropagation();
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* A canceled browser pointer may already have released capture. */
    }
    drag.current = null;
    document.body.style.cursor = arranging ? "grab" : "";
  }
  return (
    <group
      position={pose.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(piece);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = arranging ? "grab" : "pointer";
      }}
      onPointerOut={() => {
        if (!drag.current) document.body.style.cursor = "";
      }}
      onPointerDown={(event) => {
        if (!arranging) return;
        event.stopPropagation();
        onSelect(piece);
        const hit = event.ray.intersectPlane(ground, new Vector3());
        if (!hit) return;
        drag.current = {
          id: event.pointerId,
          x: hit.x - pose.position[0],
          z: hit.z - pose.position[2],
        };
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        document.body.style.cursor = "grabbing";
      }}
      onPointerMove={(event) => {
        if (!arranging || drag.current?.id !== event.pointerId) return;
        event.stopPropagation();
        const hit = event.ray.intersectPlane(ground, new Vector3());
        if (hit)
          onMove(piece, {
            position: [hit.x - drag.current.x, 0, hit.z - drag.current.z],
            rotation: pose.rotation,
          });
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => {
        drag.current = null;
        document.body.style.cursor = "";
      }}
    >
      <FurnitureModel scene={scene} design={design} rotation={pose.rotation} />
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <ringGeometry
            args={[
              piece === "sofa" ? 1.32 : 0.61,
              piece === "sofa" ? 1.34 : 0.63,
              64,
            ]}
          />
          <meshBasicMaterial
            color={arranging ? "#527967" : "#b39764"}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      )}
      {piece === "table" && (
        <group position={[0, 0.45, 0]} rotation={[0, pose.rotation, 0]}>
          <mesh rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.32, 0.035, 0.24]} />
            <meshStandardMaterial color="#ded8c9" />
          </mesh>
          <mesh position={[0.27, 0.065, 0]}>
            <cylinderGeometry args={[0.055, 0.068, 0.13, 20]} />
            <meshStandardMaterial color="#867258" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
