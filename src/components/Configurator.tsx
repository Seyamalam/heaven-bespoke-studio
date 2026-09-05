import { Component, lazy, Suspense, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Microscope,
  Moon,
  RotateCcw,
  Ruler,
  Sun,
  X,
} from "lucide-react";
import {
  defaultDesign,
  fabrics,
  furniture,
  saveDesign,
  selectProduct,
  woods,
} from "../lib/design";
import type { Design, FurnitureKey } from "../lib/design";

const MaterialLab = lazy(() => import("./MaterialLab"));
const FurnitureScene = lazy(() => import("./FurnitureScene"));
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function Configurator({
  design,
  onChange,
  onConsult,
  onSave,
}: {
  design: Design;
  onChange: (design: Design) => void;
  onConsult: () => void;
  onSave: () => void;
}) {
  const [materialOpen, setMaterialOpen] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [dimensions, setDimensions] = useState(false);
  const [evening, setEvening] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [viewVersion, setViewVersion] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const piece = furniture[design.product];
  const material = fabrics[design.fabric];
  const wood = woods[design.wood];
  function change(next: Design) {
    onChange(next);
    setStatus("");
  }
  function save() {
    if (saveDesign(design)) {
      setStatus("Saved on this device");
      onSave();
    } else {
      setStatus(
        "Saving is unavailable. Your direction is still ready to include in a consultation.",
      );
    }
  }
  function resetView() {
    setRotation(0);
    setViewVersion((v) => v + 1);
  }
  const poster = (
    <img
      className="model-poster"
      src={`/images/${design.product}-poster.webp`}
      alt={`Illustrative ${piece.name} in its original studio finish; use 3D to preview your choices`}
      width="1200"
      height="900"
      loading="lazy"
    />
  );
  return (
    <section id="studio" className="studio section-pad">
      <div className="section-heading studio-heading">
        <div>
          <span className="eyebrow">
            <span className="tiny-dot" /> THE BESPOKE STUDIO
          </span>
          <h2>
            A little more <em>you.</em>
          </h2>
        </div>
        <p>
          A different shade. A better fit.
          <br />
          Play with the possibilities. We’ll take it from here.
        </p>
      </div>
      <div className={`studio-layout ${expanded ? "studio-expanded" : ""}`}>
        <div
          className="model-stage"
          style={
            {
              "--chosen-fabric": material.color,
              "--chosen-wood": wood.color,
            } as CSSProperties
          }
        >
          <div className="stage-top">
            <span className="stage-label">YOUR PIECE, YOUR PERSPECTIVE</span>
            <button
              className="icon-button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={
                expanded ? "Reduce studio view" : "Expand studio view"
              }
              aria-pressed={expanded}
            >
              {expanded ? <X size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>
          <div className="model-viewport" aria-label={`${piece.name} preview`}>
            {interactive && !contextLost ? (
              <SceneBoundary
                key={`${design.product}-${viewVersion}`}
                fallback={
                  <div className="model-fallback">
                    {poster}
                    <p>
                      3D isn’t available here. You can still choose your
                      finishes and start a consultation.
                    </p>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="model-loading">
                      {poster}
                      <span className="loading-pill">
                        <span className="loading-dot" /> Bringing your piece
                        into view…
                      </span>
                    </div>
                  }
                >
                  <FurnitureScene
                    design={design}
                    evening={evening}
                    rotation={rotation}
                    viewVersion={viewVersion}
                    onUnavailable={() => setContextLost(true)}
                  />
                </Suspense>
              </SceneBoundary>
            ) : (
              <>
                {poster}
                <button
                  className="load-model"
                  onClick={() => {
                    setContextLost(false);
                    setInteractive(true);
                  }}
                >
                  <Box size={18} />{" "}
                  {contextLost ? "Try 3D again" : "Explore in 3D"}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </>
            )}
            {dimensions && (
              <div className="dimension-guide">
                <span>{design.width} cm wide</span>
                <div />
                <small>
                  {piece.depth} cm deep · {piece.height} cm high
                </small>
              </div>
            )}
          </div>
          <div className="stage-bottom">
            <span>
              <span className="tiny-dot" />{" "}
              {interactive && !contextLost
                ? "Drag to rotate · pinch to zoom"
                : "A closer look is one click away"}
            </span>
            <div className="view-tools">
              <button
                className="icon-button"
                disabled={!interactive || contextLost}
                aria-label="Rotate piece left"
                onClick={() => setRotation((r) => r - Math.PI / 4)}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                className="icon-button"
                disabled={!interactive || contextLost}
                aria-label="Rotate piece right"
                onClick={() => setRotation((r) => r + Math.PI / 4)}
              >
                <ChevronRight size={17} />
              </button>
              <button
                className="icon-button"
                disabled={!interactive || contextLost}
                aria-label="Reset camera"
                onClick={resetView}
              >
                <RotateCcw size={16} />
              </button>
              <span className="tool-divider" />
              <button
                className="icon-button"
                aria-label="Show dimensions"
                aria-pressed={dimensions}
                onClick={() => setDimensions((d) => !d)}
              >
                <Ruler size={17} />
              </button>
              <button
                className="icon-button"
                disabled={!interactive || contextLost}
                aria-label={evening ? "Use daylight" : "Use evening light"}
                aria-pressed={evening}
                onClick={() => setEvening((e) => !e)}
              >
                {evening ? <Moon size={17} /> : <Sun size={17} />}
              </button>
            </div>
          </div>
        </div>
        <div className="material-panel">
          <div
            className="piece-tabs"
            role="group"
            aria-label="Choose furniture"
          >
            {(Object.keys(furniture) as FurnitureKey[]).map((key) => (
              <button
                key={key}
                aria-pressed={design.product === key}
                className={design.product === key ? "active" : ""}
                onClick={() => {
                  change(selectProduct(design, key));
                  resetView();
                }}
              >
                {furniture[key].short}
              </button>
            ))}
          </div>
          <div className="piece-title">
            <h3>{piece.name}</h3>
            <p>{piece.subtitle}</p>
            <span>BESPOKE DESIGN CONCEPT</span>
          </div>
          {piece.upholstered && (
            <fieldset className="sample-field">
              <legend>
                Upholstery <span>{material.name}</span>
              </legend>
              <div className="fabric-samples">
                {Object.entries(fabrics).map(([key, fabric]) => (
                  <label
                    key={key}
                    className="fabric-sample"
                    style={{ "--sample": fabric.color } as CSSProperties}
                  >
                    <input
                      type="radio"
                      name="fabric"
                      value={key}
                      checked={design.fabric === key}
                      onChange={() =>
                        change({ ...design, fabric: key as Design["fabric"] })
                      }
                    />
                    <span className="fabric-chip">
                      {design.fabric === key && <Check size={18} />}
                    </span>
                    <span>{fabric.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset className="sample-field wood-field">
            <legend>
              Wood finish <span>{wood.name}</span>
            </legend>
            <div className="wood-samples">
              {Object.entries(woods).map(([key, finish]) => (
                <label
                  key={key}
                  className="wood-sample"
                  style={{ "--sample": finish.color } as CSSProperties}
                >
                  <input
                    type="radio"
                    name="wood"
                    value={key}
                    checked={design.wood === key}
                    onChange={() =>
                      change({ ...design, wood: key as Design["wood"] })
                    }
                  />
                  <span className="wood-chip">
                    {design.wood === key && <Check size={15} />}
                  </span>
                  <span className="sr-only">{finish.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            className="material-lab-trigger"
            onClick={() => setMaterialOpen(true)}
          >
            <Microscope size={15} />
            <span>
              Meet the materials
              <small>Move the light. Explore the texture.</small>
            </span>
            <ArrowUpRight size={15} />
          </button>
          <label className="width-control">
            Make room for your life{" "}
            <strong>
              {design.width} <small>cm</small>
            </strong>
            <input
              aria-label="Furniture width"
              type="range"
              min={piece.min}
              max={piece.max}
              step={2}
              value={design.width}
              onChange={(event) =>
                change({ ...design, width: Number(event.target.value) })
              }
            />
            <span className="range-ends">
              <span>{piece.min} cm</span>
              <span>{piece.max} cm</span>
            </span>
          </label>
          {!interactive && (
            <p className="preview-note">
              Your choices are ready. Open 3D to see finishes and size change.
            </p>
          )}
          <button className="button button-dark full-width" onClick={onConsult}>
            Bring this idea to life <ArrowUpRight size={18} />
          </button>
          <div className="save-row">
            <button className="text-button" onClick={save}>
              {status === "Saved on this device" ? (
                <Check size={15} />
              ) : (
                <Bookmark size={15} />
              )}{" "}
              Save my direction
            </button>
            <button
              className="text-button"
              onClick={() => {
                change({ ...defaultDesign });
                resetView();
              }}
            >
              Reset
            </button>
          </div>
          <p className="save-status" role="status">
            {status || "A starting point, made personal with our designers."}
          </p>
        </div>
      </div>
      {contextLost && (
        <p className="context-note" role="status">
          The 3D preview paused on this device. Your choices are safe; try again
          or continue with your consultation.
        </p>
      )}
      {materialOpen && (
        <Suspense fallback={<p role="status">Opening the material study…</p>}>
          <MaterialLab
            design={design}
            onChange={change}
            onClose={() => setMaterialOpen(false)}
          />
        </Suspense>
      )}
      <div className="studio-footnote">
        <p>
          Illustrative models and finishes. Final materials, dimensions, and
          pricing are confirmed during your consultation.
        </p>
        <a href="#process">
          How bespoke works <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
