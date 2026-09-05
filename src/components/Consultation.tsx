import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, X } from "lucide-react";
import {
  buildInquiry,
  fabrics,
  furniture,
  woods,
  whatsappUrl,
} from "../lib/design";
import type { Design, Inquiry } from "../lib/design";

export default function Consultation({
  design,
  category,
  includeDesign,
  onClose,
  planUrl,
}: {
  design: Design;
  category: string;
  includeDesign: boolean;
  onClose: () => void;
  planUrl?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<"details" | "review">("details");
  const [inquiry, setInquiry] = useState<Inquiry>({
    name: "",
    category,
    roomSize: "",
    notes: "",
    includeDesign,
  });
  const [includeRoom, setIncludeRoom] = useState(!!planUrl);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const product = furniture[design.product];
  useEffect(() => {
    const target = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    target.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    heading.current?.focus();
    return () => {
      target.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  function update(key: keyof Inquiry, value: string | boolean) {
    setInquiry((current) => ({ ...current, [key]: value }));
  }
  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="consult-dialog"
      aria-labelledby="consult-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="icon-button dialog-close"
          onClick={onClose}
          aria-label="Close consultation"
        >
          <X size={21} />
        </button>
        <span className="eyebrow">LET’S MAKE ROOM FOR YOU</span>
        <h2 ref={heading} tabIndex={-1} id="consult-title">
          {step === "details" ? (
            <>
              Every home starts
              <br />
              with a conversation.
            </>
          ) : (
            <>
              Your next chapter,
              <br />
              <em>ready to begin.</em>
            </>
          )}
        </h2>
        <p className="muted">
          {step === "details"
            ? "Tell us a little about your space. Your first design consultation is on us."
            : "Review or edit your message. WhatsApp will open with it ready for you to send."}
        </p>
        <div className="dialog-steps">
          <span className={step === "details" ? "active" : ""}>
            01 &nbsp; Your space
          </span>
          <span className={step === "review" ? "active" : ""}>
            02 &nbsp; Your conversation
          </span>
        </div>
        {step === "details" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(
                buildInquiry(design, inquiry) +
                  (includeRoom && planUrl
                    ? `\n\nMy room layout and lighting: ${planUrl}`
                    : ""),
              );
              setStep("review");
              heading.current?.focus();
            }}
          >
            <div className="form-grid">
              <label>
                Your name
                <input
                  name="name"
                  required
                  maxLength={80}
                  autoComplete="given-name"
                  placeholder="What should we call you?"
                  value={inquiry.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                I’m thinking about
                <select
                  value={inquiry.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option>Living room</option>
                  <option>Bedroom</option>
                  <option>Dining room</option>
                  <option>Office & study</option>
                  <option>A whole home</option>
                  <option>A custom piece</option>
                </select>
              </label>
            </div>
            <label>
              Approximate room size <span className="optional">optional</span>
              <input
                maxLength={100}
                placeholder="e.g. 12 × 14 ft, or still measuring"
                value={inquiry.roomSize}
                onChange={(e) => update("roomSize", e.target.value)}
              />
            </label>
            <label>
              What do you have in mind?{" "}
              <span className="optional">optional</span>
              <textarea
                rows={3}
                maxLength={1000}
                placeholder="A favorite style, a tricky corner, a move-in date…"
                value={inquiry.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </label>
            <label className="include-design">
              <input
                type="checkbox"
                checked={inquiry.includeDesign}
                onChange={(e) => update("includeDesign", e.target.checked)}
              />
              <span>
                Include my studio direction
                <small>
                  {product.name} · {design.width} cm ·{" "}
                  {product.upholstered
                    ? `${fabrics[design.fabric].name} · `
                    : ""}
                  {woods[design.wood].name}
                </small>
              </span>
            </label>
            {planUrl && (
              <label className="include-design">
                <input
                  type="checkbox"
                  checked={includeRoom}
                  onChange={(e) => setIncludeRoom(e.target.checked)}
                />
                <span>
                  Include my room plan
                  <small>
                    A link with furniture positions, finishes, and lighting.
                  </small>
                </span>
              </label>
            )}
            <button className="button button-dark full-width" type="submit">
              Review your inquiry <ArrowUpRight size={18} />
            </button>
            <p className="form-note">
              No commitment. Your details stay here until you choose to send
              them in WhatsApp.
            </p>
          </form>
        ) : (
          <div>
            <label>
              Your message
              <textarea
                className="message-preview"
                rows={10}
                maxLength={2400}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setCopied(false);
                }}
              />
            </label>
            <a
              className={`button button-dark full-width ${!message.trim() ? "disabled" : ""}`}
              aria-disabled={!message.trim()}
              href={message.trim() ? whatsappUrl(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> Continue in WhatsApp{" "}
              <ArrowUpRight size={18} />
            </a>
            <div className="review-actions">
              <button
                className="text-button"
                onClick={() => setStep("details")}
              >
                <ArrowLeft size={15} /> Edit details
              </button>
              <button
                className="text-button"
                disabled={!message.trim()}
                onClick={copyMessage}
              >
                {copied ? (
                  <>
                    <Check size={15} /> Copied
                  </>
                ) : (
                  "Copy message"
                )}
              </button>
            </div>
            {copyError && (
              <p role="status">
                Select the message above and copy it manually.
              </p>
            )}
            <p className="form-note">
              Prefer a call? <a href="tel:+8801960481983">+880 1960-481983</a>
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
