import { effect, frame, init, surface } from "vgpu";
import shader from "../shaders/material.wgsl?raw";

export type MaterialSettings = {
  color: [number, number, number];
  kind: number;
  light: [number, number];
  warmth: number;
  zoom: number;
};
export function rgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}
export function startMaterialStudy(
  canvas: HTMLCanvasElement,
  initial: MaterialSettings,
  onReady: () => void,
  onUnavailable: () => void,
) {
  let disposed = false;
  let gpu: Awaited<ReturnType<typeof init>> | undefined;
  let paint: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;
  let requestedFrame = 0;
  let settings = initial;
  const schedule = () => {
    if (!paint || disposed || requestedFrame) return;
    requestedFrame = requestAnimationFrame(() => {
      requestedFrame = 0;
      paint?.();
    });
  };
  void (async () => {
    try {
      gpu = await init();
      if (disposed) {
        gpu.dispose();
        return;
      }
      const view = surface(gpu, canvas, { dpr: [1, 1.5] });
      const study = effect(gpu, shader, {
        label: "Heaven material light study",
        set: { params: { ...settings, aspect: view.size[0] / view.size[1] } },
      });
      const renderGpu = gpu;
      if (disposed) return;
      paint = () => {
        try {
          study.set({
            params: { ...settings, aspect: view.size[0] / view.size[1] },
          });
          frame(renderGpu, (f) => f.pass(view, study));
        } catch {
          if (!disposed) onUnavailable();
        }
      };
      unsubscribe = view.onResize(schedule);
      paint();
      onReady();
    } catch {
      if (!disposed) onUnavailable();
    }
  })();
  return {
    update(next: MaterialSettings) {
      settings = next;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(requestedFrame);
      unsubscribe?.();
      gpu?.dispose();
    },
  };
}
