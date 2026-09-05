import { Component, lazy, Suspense, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowUpRight,
  Box,
  Check,
  LampDesk,
  Maximize2,
  Moon,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { fabrics, furniture, selectProduct, woods } from "../lib/design";
import type { Design, FurnitureKey } from "../lib/design";
import { defaultRoom, roomViews, wallTones } from "../lib/room";
import type { RoomSettings, RoomView } from "../lib/room";
const RoomScene = lazy(() => import("./RoomScene"));
class RoomBoundary extends Component<
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
export default function RoomExplorer({
  design,
  onChange,
  onCustomize,
  onConsult,
}: {
  design: Design;
  onChange: (d: Design) => void;
  onCustomize: () => void;
  onConsult: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [settings, setSettings] = useState<RoomSettings>(defaultRoom);
  const [version, setVersion] = useState(0);
  const [retryVersion, setRetryVersion] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [picked, setPicked] = useState(false);
  const update = (patch: Partial<RoomSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));
  function select(product: FurnitureKey) {
    if (product !== design.product) onChange(selectProduct(design, product));
    setPicked(true);
  }
  const poster = (
    <img
      className="room-poster"
      src="/images/living.webp"
      alt="Illustrative living room; enter the interactive room to explore its layout"
      width="1536"
      height="1024"
      loading="lazy"
    />
  );
  const fallback = (
    <div className="room-entry">
      {poster}
      <div>
        <span className="eyebrow">YOUR ROOM IS STILL HERE</span>
        <h3>A different way to explore.</h3>
        <p>
          Use the controls to choose finishes, or continue to your consultation.
        </p>
        <button
          className="button button-light"
          onClick={() => {
            setUnavailable(false);
            setRetryVersion((v) => v + 1);
          }}
        >
          Try the room again <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
  return (
    <section
      id="room"
      className={`room-experience section-pad ${expanded ? "room-expanded" : ""}`}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">A ROOM FOR POSSIBILITIES</span>
          <h2>
            Come in.
            <br />
            <em>Make yourself at home.</em>
          </h2>
        </div>
        <p>
          Move around. Change the mood.
          <br />
          See how your pieces live together.
        </p>
      </div>
      <div className="room-shell">
        <div className="room-scene-wrap">
          {!entered ? (
            <div className="room-entry">
              {poster}
              <div>
                <span className="eyebrow">THE LIVING ROOM, REIMAGINED</span>
                <h3>
                  Your own little
                  <br />
                  <em>corner of Heaven.</em>
                </h3>
                <button
                  className="button button-light"
                  onClick={() => setEntered(true)}
                >
                  <Box size={18} /> Step inside the room{" "}
                  <ArrowUpRight size={17} />
                </button>
                <p>A space to explore, at your own pace.</p>
              </div>
            </div>
          ) : unavailable ? (
            fallback
          ) : (
            <RoomBoundary key={retryVersion} fallback={fallback}>
              <Suspense
                fallback={
                  <div className="room-entry">
                    {poster}
                    <div>
                      <span className="loading-pill">
                        <span className="loading-dot" /> Opening the windows.
                        Making room…
                      </span>
                    </div>
                  </div>
                }
              >
                <RoomScene
                  design={design}
                  settings={settings}
                  viewVersion={version}
                  onSelect={select}
                  onUnavailable={() => setUnavailable(true)}
                />
              </Suspense>
            </RoomBoundary>
          )}
          {entered && (
            <>
              <div className="room-scene-top">
                <span>
                  <span className="tiny-dot" /> THE LIVING ROOM{" "}
                  <small>Illustrative space · 6.4 × 5 m</small>
                </span>
                <div>
                  <button
                    className="icon-button"
                    aria-label={
                      expanded ? "Reduce room view" : "Expand room view"
                    }
                    aria-pressed={expanded}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <X size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Leave interactive room"
                    onClick={() => {
                      setEntered(false);
                      setExpanded(false);
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div
                className="room-camera-bar"
                role="group"
                aria-label="Room camera views"
              >
                {Object.entries(roomViews).map(([key, name]) => (
                  <button
                    key={key}
                    aria-pressed={settings.view === key}
                    onClick={() => {
                      update({ view: key as RoomView });
                      setVersion((v) => v + 1);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="room-hint">
                Drag to look around · select a piece to make it yours
              </div>
            </>
          )}
        </div>
        <aside className="room-controls" aria-label="Room design controls">
          <div className="room-control-heading">
            <span className="eyebrow">MAKE IT FEEL LIKE YOU</span>
            <h3>A room, your way.</h3>
          </div>
          <fieldset className="room-field">
            <legend>
              Make space for{" "}
              <span>
                {settings.layout === "gather"
                  ? "Good company"
                  : "Quiet moments"}
              </span>
            </legend>
            <div className="room-segment">
              <button
                aria-pressed={settings.layout === "gather"}
                onClick={() => update({ layout: "gather" })}
              >
                Gather together
              </button>
              <button
                aria-pressed={settings.layout === "unwind"}
                onClick={() => update({ layout: "unwind" })}
              >
                Time to unwind
              </button>
            </div>
          </fieldset>
          <fieldset className="room-field">
            <legend>
              Set the mood{" "}
              <span>
                {settings.daylight < 35
                  ? "Evening"
                  : settings.daylight < 65
                    ? "Golden hour"
                    : "Daylight"}
              </span>
            </legend>
            <label className="room-light-slider">
              <Moon size={15} />
              <input
                type="range"
                min="10"
                max="100"
                value={settings.daylight}
                aria-label="Room daylight"
                onChange={(e) => update({ daylight: Number(e.target.value) })}
              />
              <Sun size={15} />
            </label>
            <div className="room-switches">
              <button
                aria-pressed={settings.lamp}
                onClick={() => update({ lamp: !settings.lamp })}
              >
                <LampDesk size={15} /> Lamp {settings.lamp ? "on" : "off"}
              </button>
              <button
                aria-pressed={!settings.curtains}
                onClick={() => update({ curtains: !settings.curtains })}
              >
                Curtains {settings.curtains ? "drawn" : "open"}
              </button>
            </div>
          </fieldset>
          <fieldset className="room-field">
            <legend>
              A backdrop to your life{" "}
              <span>{wallTones[settings.wall].name}</span>
            </legend>
            <div className="room-wall-tones">
              {Object.entries(wallTones).map(([key, w]) => (
                <label
                  key={key}
                  style={{ "--sample": w.color } as CSSProperties}
                >
                  <input
                    type="radio"
                    name="room-wall"
                    checked={settings.wall === key}
                    onChange={() =>
                      update({ wall: key as RoomSettings["wall"] })
                    }
                  />
                  <span>{settings.wall === key && <Check size={16} />}</span>
                  <small>{w.name}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="room-piece-editor">
            <span className="eyebrow">SELECT A PIECE</span>
            <div className="room-segment room-piece-tabs">
              {(Object.keys(furniture) as FurnitureKey[]).map((key) => (
                <button
                  key={key}
                  aria-pressed={design.product === key}
                  onClick={() => select(key)}
                >
                  {furniture[key].short}
                </button>
              ))}
            </div>
            <h4>{furniture[design.product].name}</h4>
            <div
              className="room-finish-row"
              role="group"
              aria-label="Room furniture finishes"
            >
              {Object.entries(
                furniture[design.product].upholstered ? fabrics : woods,
              ).map(([key, m]) => (
                <button
                  key={key}
                  style={{ "--sample": m.color } as CSSProperties}
                  aria-label={`Room finish: ${m.name}`}
                  aria-pressed={
                    (furniture[design.product].upholstered
                      ? design.fabric
                      : design.wood) === key
                  }
                  onClick={() =>
                    onChange(
                      furniture[design.product].upholstered
                        ? { ...design, fabric: key as Design["fabric"] }
                        : { ...design, wood: key as Design["wood"] },
                    )
                  }
                >
                  {(furniture[design.product].upholstered
                    ? design.fabric
                    : design.wood) === key && <Check size={15} />}
                </button>
              ))}
            </div>
            <p className="room-selection-status" role="status">
              {picked
                ? `${furniture[design.product].short} selected. Explore its finishes.`
                : "Select furniture in the room or use the buttons above."}
            </p>
            <button className="text-button" onClick={onCustomize}>
              Fine-tune this piece <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="button button-dark full-width" onClick={onConsult}>
            Let’s talk about your room <ArrowUpRight size={17} />
          </button>
          <div className="room-quality">
            <label>
              View quality{" "}
              <select
                aria-label="Room render quality"
                value={settings.quality}
                onChange={(e) =>
                  update({ quality: e.target.value as RoomSettings["quality"] })
                }
              >
                <option value="balanced">Balanced</option>
                <option value="detail">Fine detail</option>
              </select>
            </label>
            <button
              className="text-button"
              onClick={() => {
                setSettings({ ...defaultRoom });
                setVersion((v) => v + 1);
              }}
            >
              <RotateCcw size={13} /> Reset room
            </button>
          </div>
        </aside>
      </div>
      <p className="room-disclaimer">
        An illustrative room to explore proportions and finishes. Your selected
        piece follows you into the bespoke studio and consultation.
      </p>
    </section>
  );
}
