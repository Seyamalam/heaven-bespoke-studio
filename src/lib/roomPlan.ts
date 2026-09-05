import { furniture, parseDesign } from "./design";
import type { Design, FurnitureKey } from "./design";
import { arrangements, roomViews, wallTones } from "./room";
import type { RoomSettings } from "./room";
export type Pose = { position: [number, number, number]; rotation: number };
export type Placements = Record<FurnitureKey, Pose>;
export type Widths = Record<FurnitureKey, number>;
export type RoomSnapshot = {
  version: 1;
  design: Design;
  settings: RoomSettings;
  placements: Placements;
  widths: Widths;
};
export const pieceKeys: FurnitureKey[] = ["sofa", "chair", "table"];
export const defaultWidths: Widths = { sofa: 240, chair: 84, table: 120 };
export function copyArrangement(layout: RoomSettings["layout"]): Placements {
  return Object.fromEntries(
    pieceKeys.map((key) => [
      key,
      {
        position: [...arrangements[layout][key].position],
        rotation: arrangements[layout][key].rotation,
      },
    ]),
  ) as Placements;
}
const round = (n: number) => Math.round(n * 1000) / 1000;
export function footprint(key: FurnitureKey, width: number, rotation: number) {
  const w = width / 200,
    d = furniture[key].depth / 200;
  return {
    x: Math.abs(Math.cos(rotation)) * w + Math.abs(Math.sin(rotation)) * d,
    z: Math.abs(Math.sin(rotation)) * w + Math.abs(Math.cos(rotation)) * d,
  };
}
export function placePiece(
  key: FurnitureKey,
  width: number,
  x: number,
  z: number,
  rotation: number,
): Pose {
  const angle = round(
    ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
  );
  const half = footprint(key, width, angle);
  const snapped = (n: number) => Math.round(n / 0.05) * 0.05;
  return {
    position: [
      round(Math.max(-3.08 + half.x, Math.min(3.08 - half.x, snapped(x)))),
      0,
      round(Math.max(-2.36 + half.z, Math.min(2.38 - half.z, snapped(z)))),
    ],
    rotation: angle,
  };
}
export function clearances(key: FurnitureKey, width: number, pose: Pose) {
  const half = footprint(key, width, pose.rotation);
  return {
    left: Math.round((pose.position[0] - half.x + 3.14) * 100),
    back: Math.round((pose.position[2] - half.z + 2.44) * 100),
    right: Math.round((3.2 - pose.position[0] - half.x) * 100),
    front: Math.round((2.5 - pose.position[2] - half.z) * 100),
  };
}
function corners(key: FurnitureKey, width: number, pose: Pose) {
  const w = width / 200,
    d = furniture[key].depth / 200,
    c = Math.cos(pose.rotation),
    s = Math.sin(pose.rotation);
  return [
    [-w, -d],
    [w, -d],
    [w, d],
    [-w, d],
  ].map(([x, z]) => [
    pose.position[0] + x * c + z * s,
    pose.position[2] - x * s + z * c,
  ]);
}
export function overlappingPieces(
  placements: Placements,
  widths: Widths,
): [FurnitureKey, FurnitureKey][] {
  const overlaps: [FurnitureKey, FurnitureKey][] = [];
  for (let i = 0; i < pieceKeys.length; i++)
    for (let j = i + 1; j < pieceKeys.length; j++) {
      const a = pieceKeys[i],
        b = pieceKeys[j],
        ca = corners(a, widths[a], placements[a]),
        cb = corners(b, widths[b], placements[b]);
      const axes = [placements[a].rotation, placements[b].rotation].flatMap(
        (r) => [
          [Math.cos(r), -Math.sin(r)],
          [Math.sin(r), Math.cos(r)],
        ],
      );
      const separated = axes.some(([x, z]) => {
        const pa = ca.map((p) => p[0] * x + p[1] * z),
          pb = cb.map((p) => p[0] * x + p[1] * z);
        return (
          Math.max(...pa) <= Math.min(...pb) + 0.005 ||
          Math.max(...pb) <= Math.min(...pa) + 0.005
        );
      });
      if (!separated) overlaps.push([a, b]);
    }
  return overlaps;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function numberIn(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}
export function parseSharedRoom(hash: string): RoomSnapshot | null {
  if (!hash.startsWith("#room=") || hash.length > 4000) return null;
  try {
    const decoded: unknown = JSON.parse(
      atob(hash.slice(6).replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      !isRecord(decoded) ||
      decoded.version !== 1 ||
      !isRecord(decoded.settings) ||
      !isRecord(decoded.placements) ||
      !isRecord(decoded.widths)
    )
      return null;
    const design = parseDesign(JSON.stringify(decoded.design));
    if (!design) return null;
    const s = decoded.settings;
    if (
      typeof s.view !== "string" ||
      !Object.hasOwn(roomViews, s.view) ||
      !["gather", "unwind"].includes(String(s.layout)) ||
      typeof s.wall !== "string" ||
      !Object.hasOwn(wallTones, s.wall) ||
      !numberIn(s.daylight, 10, 100) ||
      typeof s.lamp !== "boolean" ||
      typeof s.curtains !== "boolean" ||
      !["balanced", "detail"].includes(String(s.quality))
    )
      return null;
    const settings: RoomSettings = {
      view: s.view as RoomSettings["view"],
      layout: s.layout as RoomSettings["layout"],
      wall: s.wall as RoomSettings["wall"],
      daylight: s.daylight,
      lamp: s.lamp,
      curtains: s.curtains,
      quality: s.quality as RoomSettings["quality"],
    };
    const widths = { ...defaultWidths },
      placements = copyArrangement(settings.layout);
    for (const key of pieceKeys) {
      const width = decoded.widths[key],
        pose = decoded.placements[key];
      if (
        !numberIn(width, furniture[key].min, furniture[key].max) ||
        !isRecord(pose) ||
        !Array.isArray(pose.position) ||
        pose.position.length !== 3 ||
        !numberIn(pose.position[0], -3.2, 3.2) ||
        pose.position[1] !== 0 ||
        !numberIn(pose.position[2], -2.5, 2.5) ||
        !numberIn(pose.rotation, 0, 6.284)
      )
        return null;
      widths[key] = width;
      const half = footprint(key, width, pose.rotation);
      if (
        Math.abs(pose.position[0]) + half.x > 3.2 ||
        Math.abs(pose.position[2]) + half.z > 2.5
      )
        return null;
      placements[key] = {
        position: [pose.position[0], 0, pose.position[2]],
        rotation: pose.rotation,
      };
    }
    if (widths[design.product] !== design.width) return null;
    return { version: 1, design, settings, placements, widths };
  } catch {
    return null;
  }
}
export function roomLink(base: string, snapshot: RoomSnapshot): string {
  // Re-parse to whitelist fields and reject invalid state before creating a link.
  const raw = btoa(JSON.stringify(snapshot));
  const clean = parseSharedRoom("#room=" + raw);
  if (!clean)
    throw new Error(
      "This room could not be shared. Reset its layout and try again.",
    );
  const url = new URL(base);
  url.search = "";
  url.hash =
    "room=" +
    btoa(JSON.stringify(clean))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return url.toString();
}
