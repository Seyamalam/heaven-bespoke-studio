import type { FurnitureKey } from "./design";

export const roomViews = {
  overview: "The whole room",
  sofa: "Settle in",
  chair: "The reading corner",
  top: "See the layout",
} as const;
export type RoomView = keyof typeof roomViews;
export const wallTones = {
  chalk: { name: "Warm chalk", color: "#ded9ca" },
  sage: { name: "Quiet sage", color: "#b7bca7" },
  sand: { name: "Soft sand", color: "#c7b39c" },
} as const;
export type RoomSettings = {
  view: RoomView;
  layout: "gather" | "unwind";
  wall: keyof typeof wallTones;
  daylight: number;
  lamp: boolean;
  curtains: boolean;
  quality: "balanced" | "detail";
};
export const defaultRoom: RoomSettings = {
  view: "overview",
  layout: "gather",
  wall: "chalk",
  daylight: 72,
  lamp: false,
  curtains: true,
  quality: "balanced",
};
export const arrangements: Record<
  RoomSettings["layout"],
  Record<FurnitureKey, { position: [number, number, number]; rotation: number }>
> = {
  gather: {
    sofa: { position: [0.3, 0, -1.25], rotation: 0 },
    chair: { position: [-1.65, 0, 0.45], rotation: 0.65 },
    table: { position: [0.3, 0, 0.45], rotation: 0 },
  },
  unwind: {
    sofa: { position: [0.65, 0, -1.25], rotation: 0 },
    chair: { position: [-1.65, 0, -0.6], rotation: 1.1 },
    table: { position: [0.55, 0, 0.45], rotation: 0 },
  },
};
