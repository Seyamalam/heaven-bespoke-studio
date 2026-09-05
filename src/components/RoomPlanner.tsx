import { Move, RotateCcw, RotateCw, Ruler } from "lucide-react";
import { furniture } from "../lib/design";
import type { FurnitureKey } from "../lib/design";
import { clearances, overlappingPieces } from "../lib/roomPlan";
import type { Placements, Pose, Widths } from "../lib/roomPlan";
export default function RoomPlanner({
  product,
  placements,
  widths,
  arranging,
  onToggle,
  onMove,
}: {
  product: FurnitureKey;
  placements: Placements;
  widths: Widths;
  arranging: boolean;
  onToggle: () => void;
  onMove: (key: FurnitureKey, pose: Pose) => void;
}) {
  const pose = placements[product],
    gaps = clearances(product, widths[product], pose),
    overlaps = overlappingPieces(placements, widths);
  return (
    <div className="room-planner">
      <button
        className={`room-arrange-button ${arranging ? "active" : ""}`}
        aria-pressed={arranging}
        onClick={onToggle}
      >
        <Move size={16} />
        {arranging ? "Finish arranging" : "Arrange your furniture"}
        <Ruler size={15} />
      </button>
      {arranging && (
        <div className="placement-tools">
          <p>
            Drag a piece across the floor, or use these controls. Positions snap
            to 5 cm.
          </p>
          <span className="eyebrow">
            POSITION OF {furniture[product].short.toUpperCase()}
          </span>
          <label>
            From the left edge{" "}
            <strong>{Math.round((pose.position[0] + 3.2) * 100)} cm</strong>
            <input
              type="range"
              min="0"
              max="640"
              step="5"
              aria-label="Furniture centre from left edge"
              value={Math.round((pose.position[0] + 3.2) * 100)}
              onChange={(e) =>
                onMove(product, {
                  ...pose,
                  position: [
                    Number(e.target.value) / 100 - 3.2,
                    0,
                    pose.position[2],
                  ],
                })
              }
            />
          </label>
          <label>
            From the back wall{" "}
            <strong>{Math.round((pose.position[2] + 2.5) * 100)} cm</strong>
            <input
              type="range"
              min="0"
              max="500"
              step="5"
              aria-label="Furniture centre from back wall"
              value={Math.round((pose.position[2] + 2.5) * 100)}
              onChange={(e) =>
                onMove(product, {
                  ...pose,
                  position: [
                    pose.position[0],
                    0,
                    Number(e.target.value) / 100 - 2.5,
                  ],
                })
              }
            />
          </label>
          <small>Position measurements refer to the centre of the piece.</small>
          <div className="placement-rotation">
            <button
              aria-label="Turn furniture left 15 degrees"
              onClick={() =>
                onMove(product, {
                  ...pose,
                  rotation: pose.rotation - Math.PI / 12,
                })
              }
            >
              <RotateCcw size={15} /> 15°
            </button>
            <span>{Math.round((pose.rotation * 180) / Math.PI) % 360}°</span>
            <button
              aria-label="Turn furniture right 15 degrees"
              onClick={() =>
                onMove(product, {
                  ...pose,
                  rotation: pose.rotation + Math.PI / 12,
                })
              }
            >
              15° <RotateCw size={15} />
            </button>
          </div>
          <span className="eyebrow">SPACE AROUND YOUR PIECE</span>
          <dl className="placement-gaps">
            {Object.entries(gaps).map(([key, value]) => (
              <div key={key}>
                <dt>
                  {key === "left"
                    ? "Left wall"
                    : key === "back"
                      ? "Back wall"
                      : key === "right"
                        ? "Right edge"
                        : "Front edge"}
                </dt>
                <dd>{value} cm</dd>
              </div>
            ))}
          </dl>
          <p
            className={`placement-warning ${overlaps.length ? "has-overlap" : ""}`}
            role="status"
          >
            {overlaps.length
              ? overlaps
                  .map(
                    ([a, b]) =>
                      `${furniture[a].short} and ${furniture[b].short.toLowerCase()} overlap.`,
                  )
                  .join(" ")
              : "Your furniture footprints are clear of each other."}
          </p>
          <small>
            Approximate layout only. Confirm access and final measurements with
            your designer.
          </small>
        </div>
      )}
    </div>
  );
}
