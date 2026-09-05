import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Moon, Move, Sun, X } from "lucide-react";
import { fabrics, woods } from "../lib/design";
import type { Design } from "../lib/design";
import type { CSSProperties } from "react";
import { rgb, startMaterialStudy } from "../lib/materialGpu";

export default function MaterialLab({
  design,
  onChange,
  onClose,
}: {
  design: Design;
  onChange: (next: Design) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const renderer = useRef<ReturnType<typeof startMaterialStudy> | null>(null);
  const [kind, setKind] = useState<"fabric" | "wood">(
    design.product === "table" ? "wood" : "fabric",
  );
  const [warmth, setWarmth] = useState(0.15);
  const [zoom, setZoom] = useState(1.4);
  const [light, setLight] = useState<[number, number]>([0.25, 0.2]);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const selected =
    kind === "fabric" ? fabrics[design.fabric] : woods[design.wood];
  const initial = useRef({
    color: rgb(selected.color),
    kind: kind === "wood" ? 1 : 0,
    warmth,
    zoom,
    light,
  });
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const target = dialog.current!;
    target.showModal();
    heading.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    renderer.current = startMaterialStudy(
      canvas.current!,
      initial.current,
      () => setReady(true),
      () => setUnavailable(true),
    );
    return () => {
      renderer.current?.dispose();
      target.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    renderer.current?.update({
      color: rgb(selected.color),
      kind: kind === "wood" ? 1 : 0,
      warmth,
      zoom,
      light,
    });
  }, [selected.color, kind, warmth, zoom, light]);
  return (
    <dialog
      ref={dialog}
      className="material-dialog"
      aria-labelledby="material-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="material-dialog-inner">
        <button
          className="icon-button dialog-close"
          aria-label="Close material study"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="material-dialog-heading">
          <span className="eyebrow">A DIFFERENCE YOU CAN ALMOST FEEL</span>
          <h2 id="material-title" tabIndex={-1} ref={heading}>
            Meet your <em>materials.</em>
          </h2>
          <p>Move the light. Find the texture. See what speaks to you.</p>
        </div>
        <div className="material-study-layout">
          <div
            className="material-canvas-wrap"
            style={{ background: selected.color }}
          >
            <img
              src={`/images/material-${kind === "fabric" ? design.fabric : design.wood}.webp`}
              alt={`Illustrative close-up of ${selected.name}`}
              className="material-fallback"
            />
            <canvas
              ref={canvas}
              className={ready && !unavailable ? "is-ready" : ""}
              tabIndex={unavailable ? -1 : 0}
              aria-label="Material light study. Move the pointer or use arrow keys to move the light."
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setLight([
                  (e.clientX - rect.left) / rect.width,
                  (e.clientY - rect.top) / rect.height,
                ]);
              }}
              onKeyDown={(e) => {
                const delta: Record<string, [number, number]> = {
                  ArrowLeft: [-0.08, 0],
                  ArrowRight: [0.08, 0],
                  ArrowUp: [0, -0.08],
                  ArrowDown: [0, 0.08],
                };
                if (delta[e.key]) {
                  e.preventDefault();
                  setLight(([x, y]) => [
                    Math.max(0, Math.min(1, x + delta[e.key][0])),
                    Math.max(0, Math.min(1, y + delta[e.key][1])),
                  ]);
                }
              }}
            />
            <div className="material-view-label">
              <span>{selected.name}</span>
              <span>
                <Move size={13} />{" "}
                {unavailable
                  ? "Still material preview"
                  : ready
                    ? "Move to explore the light"
                    : "Preparing your material…"}
              </span>
            </div>
          </div>
          <div className="material-study-controls">
            <div className="piece-tabs" role="group" aria-label="Material type">
              <button
                aria-pressed={kind === "fabric"}
                className={kind === "fabric" ? "active" : ""}
                onClick={() => setKind("fabric")}
                disabled={design.product === "table"}
              >
                Upholstery
              </button>
              <button
                aria-pressed={kind === "wood"}
                className={kind === "wood" ? "active" : ""}
                onClick={() => setKind("wood")}
              >
                Wood finish
              </button>
            </div>
            <h3>{selected.name}</h3>
            <p>
              {kind === "fabric"
                ? "A woven surface, full of little details. Explore how the threads catch the light."
                : "Grain gives every piece its own character. Explore the tone in a different light."}
            </p>
            <div className="lab-samples">
              {Object.entries(kind === "fabric" ? fabrics : woods).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className="lab-sample"
                    style={{ "--sample": value.color } as CSSProperties}
                  >
                    <input
                      type="radio"
                      name="study-finish"
                      checked={
                        (kind === "fabric" ? design.fabric : design.wood) ===
                        key
                      }
                      onChange={() => onChange({ ...design, [kind]: key })}
                    />
                    <span>
                      {(kind === "fabric" ? design.fabric : design.wood) ===
                        key && <Check size={15} />}
                    </span>
                    <small>{value.name}</small>
                  </label>
                ),
              )}
            </div>
            <label className="lab-slider">
              Set the mood{" "}
              <span>{warmth < 0.45 ? "Daylight" : "Warm evening"}</span>
              <input
                type="range"
                aria-label="Material light warmth"
                min="0"
                max="100"
                value={Math.round(warmth * 100)}
                disabled={unavailable}
                onChange={(e) => setWarmth(Number(e.target.value) / 100)}
              />
              <div>
                <Sun size={14} />
                <Moon size={14} />
              </div>
            </label>
            <label className="lab-slider">
              A closer look <span>{zoom.toFixed(1)}×</span>
              <input
                type="range"
                aria-label="Material magnification"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                disabled={unavailable}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <button className="button button-dark full-width" onClick={onClose}>
              Use this finish <ArrowUpRight size={17} />
            </button>
            <p className="lab-disclaimer">
              An illustrative material study. Ask to see physical samples during
              your consultation.
            </p>
            {unavailable && (
              <p className="lab-disclaimer" role="status">
                Live lighting isn’t available in this browser. You can still
                compare finishes.
              </p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
