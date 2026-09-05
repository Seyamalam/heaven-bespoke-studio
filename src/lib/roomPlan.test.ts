import { describe, expect, it } from "vitest";
import { defaultDesign } from "./design";
import { defaultRoom } from "./room";
import {
  copyArrangement,
  defaultWidths,
  clearances,
  footprint,
  overlappingPieces,
  parseSharedRoom,
  placePiece,
  roomLink,
} from "./roomPlan";
import type { RoomSnapshot } from "./roomPlan";
const snapshot = (): RoomSnapshot => ({
  version: 1,
  design: { ...defaultDesign },
  settings: { ...defaultRoom },
  placements: copyArrangement("gather"),
  widths: { ...defaultWidths },
});
describe("room links", () => {
  it("restores a complete room without carrying URL queries or personal fields", () => {
    const s = {
      ...snapshot(),
      name: "Private name",
      message: "Private message",
    };
    s.settings.daylight = 25;
    s.settings.lamp = true;
    s.placements.chair = placePiece("chair", 84, -1.8, 1.1, Math.PI / 2);
    const url = roomLink("https://example.com/?tracking=1", s);
    expect(new URL(url).search).toBe("");
    expect(parseSharedRoom(new URL(url).hash)).toEqual({
      ...s,
      name: undefined,
      message: undefined,
    });
    expect(
      atob(new URL(url).hash.slice(6).replace(/-/g, "+").replace(/_/g, "/")),
    ).not.toContain("Private");
  });
  it.each([
    "",
    "#home",
    "#room=broken",
    "#room=" + btoa('{"version":9}'),
    "#room=" + "a".repeat(5000),
  ])("ignores unsupported or corrupt links: %s", (hash) =>
    expect(parseSharedRoom(hash)).toBeNull(),
  );
  it("rejects off-room furniture and inconsistent selected width", () => {
    const s = snapshot();
    s.placements.sofa.position[0] = 3;
    expect(parseSharedRoom("#room=" + btoa(JSON.stringify(s)))).toBeNull();
    const inconsistent = snapshot();
    inconsistent.widths.sofa = 300;
    expect(() => roomLink("https://example.com", inconsistent)).toThrow();
  });
  it("rejects inherited property names as choices", () => {
    const s = snapshot();
    Object.assign(s.settings, { wall: "__proto__" });
    expect(parseSharedRoom("#room=" + btoa(JSON.stringify(s)))).toBeNull();
  });
});
it("preserves widths for pieces other than the selected one", () => {
  const s = snapshot();
  s.widths.chair = 96;
  const restored = parseSharedRoom(
    new URL(roomLink("https://example.com", s)).hash,
  );
  expect(restored?.widths).toEqual({ sofa: 240, chair: 96, table: 120 });
});
it.each(["daylight", "lamp", "width", "elevation"])(
  "rejects invalid %s in a shared plan",
  (field) => {
    const s = snapshot();
    if (field === "daylight") s.settings.daylight = 1000;
    if (field === "lamp") Object.assign(s.settings, { lamp: "yes" });
    if (field === "width") s.widths.table = 0;
    if (field === "elevation") s.placements.chair.position[1] = 9;
    expect(parseSharedRoom("#room=" + btoa(JSON.stringify(s)))).toBeNull();
  },
);
describe("placement and measurements", () => {
  it("snaps the ground position to five centimeters", () =>
    expect(placePiece("table", 120, 0.123, 0.876, 0).position).toEqual([
      0.1, 0, 0.9,
    ]));
  it.each([0, Math.PI / 4, Math.PI / 2, Math.PI, 5.8])(
    "keeps a wide rotated sofa inside the room at %s radians",
    (rotation) => {
      const pose = placePiece("sofa", 300, -50, 50, rotation),
        half = footprint("sofa", 300, pose.rotation);
      expect(pose.position[0] - half.x).toBeGreaterThanOrEqual(-3.081);
      expect(pose.position[2] + half.z).toBeLessThanOrEqual(2.381);
      expect(
        Object.values(clearances("sofa", 300, pose)).every((n) => n >= 0),
      ).toBe(true);
    },
  );
  it("detects overlapping furniture and clears after moving it apart", () => {
    const p = copyArrangement("gather");
    p.chair = { position: [0.3, 0, -1.25], rotation: Math.PI / 4 };
    expect(overlappingPieces(p, defaultWidths)).toContainEqual([
      "sofa",
      "chair",
    ]);
    p.chair = placePiece("chair", 84, -2, 1.5, 0);
    expect(overlappingPieces(p, defaultWidths)).not.toContainEqual([
      "sofa",
      "chair",
    ]);
  });
  it("copies arrangements without mutating the preset", () => {
    const p = copyArrangement("gather");
    p.sofa.position[0] = 99;
    expect(copyArrangement("gather").sofa.position[0]).toBe(0.3);
  });
});
