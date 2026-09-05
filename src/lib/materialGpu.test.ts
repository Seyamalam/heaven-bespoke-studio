import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startMaterialStudy } from "./materialGpu";
import type { MaterialSettings } from "./materialGpu";

const { initialize } = vi.hoisted(() => ({ initialize: vi.fn() }));
vi.mock("vgpu", () => ({
  init: initialize,
  effect: vi.fn(),
  frame: vi.fn(),
  surface: vi.fn(),
}));

const settings: MaterialSettings = {
  color: [0.5, 0.5, 0.4],
  kind: 0,
  light: [0.2, 0.2],
  warmth: 0.15,
  zoom: 1.4,
};
// No canvas API is accessed before initialization succeeds. These tests cover
// devices without WebGPU and closing the dialog during asynchronous startup.
const canvas = {} as HTMLCanvasElement;

beforeEach(() => {
  initialize.mockReset();
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe("material study availability and cleanup", () => {
  it("offers a still preview when GPU initialization fails", async () => {
    initialize.mockRejectedValue(new Error("WebGPU is unavailable"));
    const ready = vi.fn();
    const unavailable = vi.fn();
    const study = startMaterialStudy(canvas, settings, ready, unavailable);
    await Promise.resolve();
    expect(unavailable).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
    expect(() => study.update({ ...settings, warmth: 0.9 })).not.toThrow();
    study.dispose();
  });

  it("releases a GPU that finishes initializing after the dialog closes", async () => {
    const dispose = vi.fn();
    let resolve!: (gpu: { dispose: () => void }) => void;
    initialize.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const ready = vi.fn();
    const unavailable = vi.fn();
    const study = startMaterialStudy(canvas, settings, ready, unavailable);
    study.dispose();
    resolve({ dispose });
    await Promise.resolve();
    expect(dispose).toHaveBeenCalledOnce();
    expect(ready).not.toHaveBeenCalled();
    expect(unavailable).not.toHaveBeenCalled();
  });

  it("does not update a closed dialog after initialization rejects", async () => {
    initialize.mockRejectedValue(new Error("Adapter unavailable"));
    const unavailable = vi.fn();
    const study = startMaterialStudy(canvas, settings, vi.fn(), unavailable);
    study.dispose();
    await Promise.resolve();
    expect(unavailable).not.toHaveBeenCalled();
  });
});
