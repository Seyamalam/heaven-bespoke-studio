import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  MessageCircle,
  MoveUpRight,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { parseSharedRoom } from "./lib/roomPlan";
import RoomExplorer from "./components/RoomExplorer";
import Configurator from "./components/Configurator";
import Consultation from "./components/Consultation";
import { defaultDesign, loadDesign, rooms, selectProduct } from "./lib/design";
import type { Design, FurnitureKey, RoomKey } from "./lib/design";

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="Heaven Furniture Mart home"
    >
      <svg
        width="38"
        height="44"
        viewBox="0 0 38 44"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 39V19C5 11.3 11.3 5 19 5S33 11.3 33 19v20M12 39V20a7 7 0 0 1 14 0v19M5 28h28M19 1v4M2 9l4 4M36 9l-4 4"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
      <span>
        heaven<small>FURNITURE MART</small>
      </span>
    </a>
  );
}
const craftDetails = [
  {
    name: "Honest materials",
    text: "Beautiful wood, considered fabrics, and finishes you’ll want to reach out and touch. Find your combination with our designers.",
    detail: "Wood. Texture. Character.",
  },
  {
    name: "Made by skilled hands",
    text: "In-house craftsmanship brings your ideas into everyday life, with care in the proportions, the joinery, and the smallest finishing touch.",
    detail: "Considered down to the last detail.",
  },
  {
    name: "A fit that feels right",
    text: "A compact corner or a room for gathering. Your piece is designed around your space, with delivery and installation included.",
    detail: "Your measurements. Your way.",
  },
];
const faqs = [
  [
    "Can I customize the size and finish?",
    "Yes. Bespoke furniture is at the heart of Heaven. Share your space, preferred dimensions, and material direction during your consultation. The team will help confirm a practical design and quote.",
  ],
  [
    "Is the design consultation really free?",
    "Yes. The initial design consultation is free. It’s a chance to discuss your ideas, space, and what you’re looking for before deciding on a piece.",
  ],
  [
    "Can I see the furniture in person?",
    "Visit the Heaven Furniture Mart showroom on Agrabad Access Road, Chattogram. Call ahead or message the team on WhatsApp to arrange your visit and confirm opening hours.",
  ],
  [
    "Do you arrange delivery and installation?",
    "Delivery and installation are included according to the company brief. Confirm your location, access requirements, and arrangements with the team when requesting a quote.",
  ],
  [
    "Are these exact products available to order?",
    "The interiors and interactive models on this concept site are illustrative design directions. Heaven’s team will confirm the actual materials, dimensions, feasibility, availability, and pricing for your bespoke piece.",
  ],
];

export default function App() {
  const [design, setDesign] = useState<Design>(
    () =>
      parseSharedRoom(window.location.hash)?.design ??
      loadDesign() ?? { ...defaultDesign },
  );
  const [hasSaved, setHasSaved] = useState(() => !!loadDesign());
  const [activeRoom, setActiveRoom] = useState<RoomKey>("living");
  const [menuOpen, setMenuOpen] = useState(false);
  const [consultation, setConsultation] = useState<{
    category: string;
    includeDesign: boolean;
  } | null>(null);
  const [activeCraft, setActiveCraft] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const room = rooms.find((r) => r.id === activeRoom)!;
  function consult(category: string = room.category, includeDesign = false) {
    setMenuOpen(false);
    setConsultation({ category, includeDesign });
  }
  function studio(product?: FurnitureKey) {
    if (product) setDesign((current) => selectProduct(current, product));
    document.getElementById("studio")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function restoreDesign() {
    const saved = loadDesign();
    if (saved) setDesign(saved);
    studio();
  }
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header id="home" className="site-header">
        <Brand />
        <nav
          aria-label="Main navigation"
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          id="main-menu"
        >
          <a href="#collections" onClick={() => setMenuOpen(false)}>
            Our collections
          </a>
          <a href="#room" onClick={() => setMenuOpen(false)}>
            Step inside
          </a>
          <a href="#studio" onClick={() => setMenuOpen(false)}>
            The bespoke studio <span className="nav-new">3D</span>
          </a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>
            Visit us
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button saved-button"
            aria-label={
              hasSaved ? "Restore saved design" : "Explore and save a design"
            }
            onClick={restoreDesign}
          >
            <Bookmark size={19} fill={hasSaved ? "currentColor" : "none"} />
            {hasSaved && <span className="saved-dot" />}
          </button>
          <button className="header-consult" onClick={() => consult()}>
            Let’s talk <ArrowUpRight size={17} />
          </button>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-intro">
            <div>
              <p className="eyebrow">
                <span className="little-star">✳</span> DESIGNED. CRAFTED.
                CUSTOMIZED.
              </p>
              <h1>
                A home,
                <br />
                unmistakably <em>yours.</em>
              </h1>
            </div>
            <div className="hero-aside">
              <p>
                Furniture shaped around your space,
                <br className="desktop-break" /> your rituals, your way of
                living.
              </p>
              <button className="button button-dark" onClick={() => consult()}>
                Start your consultation <ArrowUpRight size={18} />
              </button>
              <span className="hero-note">
                Thoughtfully made in Chattogram, since 2020.
              </span>
            </div>
          </div>
          <div className="hero-image-wrap">
            {rooms
              .filter((r) => r.id === activeRoom)
              .map((r) => (
                <picture
                  key={r.id}
                  className={`hero-picture ${r.id === activeRoom ? "active" : ""}`}
                  aria-hidden={r.id !== activeRoom}
                >
                  <source
                    srcSet={`/images/${r.id}-800.webp 800w, ${r.image} 1536w`}
                    sizes="(max-width: 700px) 100vw, 96vw"
                  />
                  <img
                    src={r.image}
                    alt={r.alt}
                    width="1536"
                    height="1024"
                    fetchPriority={r.id === "living" ? "high" : "auto"}
                    loading={r.id === "living" ? "eager" : "lazy"}
                  />
                </picture>
              ))}
            <span className="hero-image-caption">SPACES TO CALL YOUR OWN</span>
            <div className="hero-hotspots">
              {activeRoom === "living" ? (
                <>
                  <button
                    className="hotspot hotspot-sofa"
                    aria-label="Customize a sofa in the studio"
                    onClick={() => studio("sofa")}
                  >
                    <Plus size={18} />
                    <span>
                      Make it your sofa <ArrowUpRight size={13} />
                    </span>
                  </button>
                  <button
                    className="hotspot hotspot-table"
                    aria-label="Customize a coffee table in the studio"
                    onClick={() => studio("table")}
                  >
                    <Plus size={18} />
                    <span>
                      A table, your way <ArrowUpRight size={13} />
                    </span>
                  </button>
                </>
              ) : (
                <button
                  className="hotspot hotspot-sofa"
                  aria-label={`Discuss your ${room.name.toLowerCase()}`}
                  onClick={() => consult(room.category)}
                >
                  <Plus size={18} />
                  <span>
                    Make this your direction <ArrowUpRight size={13} />
                  </span>
                </button>
              )}
            </div>
            <div className="hero-image-bottom">
              <div className="room-caption" aria-live="polite">
                <span>A HEAVEN STATE OF MIND</span>
                <h2>{room.label}</h2>
              </div>
              <div
                className="room-switcher"
                role="group"
                aria-label="Explore a room"
              >
                {rooms.map((r, i) => (
                  <button
                    key={r.id}
                    aria-pressed={activeRoom === r.id}
                    onClick={() => setActiveRoom(r.id)}
                  >
                    <span>0{i + 1}</span>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-under">
            <span>Illustrative interiors. Real possibilities.</span>
            <a href="#collections">
              A little inspiration, this way <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <section className="brand-statement section-pad">
          <span className="eyebrow">MORE THAN A PIECE OF FURNITURE</span>
          <h2>
            It’s where life <em>happens.</em>
          </h2>
          <p>
            The unhurried mornings. The conversations that run late.
            <br />
            We make furniture for the moments that make a home.
          </p>
          <div className="trust-strip">
            <span>
              <Check /> Made to your space
            </span>
            <span>
              <Check /> Free design consultation
            </span>
            <span>
              <Check /> Delivery & installation included
            </span>
          </div>
        </section>
        <section className="collections section-pad" id="collections">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                THOUGHTFULLY CURATED. PERSONALLY YOURS.
              </span>
              <h2>
                Find your kind of <em>home.</em>
              </h2>
            </div>
            <a className="text-link" href="#studio">
              Or create something your own <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="collection-grid">
            {rooms.map((r, i) => (
              <button
                key={r.id}
                className="collection-card"
                onClick={() => {
                  setActiveRoom(r.id);
                  consult(r.category);
                }}
                aria-label={`Plan your ${r.name.toLowerCase()}`}
              >
                <div className="collection-image">
                  <img
                    src={r.image}
                    alt={r.alt}
                    width="600"
                    height="700"
                    loading="lazy"
                    sizes="(max-width: 700px) 90vw, 32vw"
                    srcSet={`/images/${r.id}-800.webp 800w, ${r.image} 1536w`}
                  />
                  <span className="collection-explore">
                    Let’s imagine your space <ArrowUpRight size={19} />
                  </span>
                </div>
                <div className="collection-title">
                  <div>
                    <span className="collection-label">
                      {
                        [
                          "GATHER. UNWIND. REPEAT.",
                          "YOUR OWN QUIET WORLD.",
                          "GOOD COMPANY STARTS HERE.",
                        ][i]
                      }
                    </span>
                    <h3>
                      {r.name === "Living"
                        ? "Living, beautifully."
                        : r.name === "Bedroom"
                          ? "Rest, reimagined."
                          : "Gather, together."}
                    </h3>
                  </div>
                  <ArrowUpRight size={23} strokeWidth={1} />
                </div>
              </button>
            ))}
          </div>
          <p className="collections-note">
            A starting point for your imagination. Every piece can become
            something personal.
          </p>
        </section>
        <RoomExplorer
          design={design}
          onChange={setDesign}
          onCustomize={() => studio()}
          onConsult={() => consult("Living room", true)}
        />
        <Configurator
          design={design}
          onChange={setDesign}
          onConsult={() => consult("Living room", true)}
          onSave={() => setHasSaved(true)}
        />
        <section className="craft section-pad" id="craft">
          <div className="craft-image">
            <img
              src="/images/materials.webp"
              alt="Illustrative material study of walnut joinery, woven upholstery samples and brass detailing"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <span className="image-tag">GOOD DESIGN IS IN THE DETAILS.</span>
          </div>
          <div className="craft-copy">
            <span className="eyebrow">THE BEAUTY IS IN THE MAKING</span>
            <h2>
              Considered.
              <br />
              Crafted.
              <br />
              <em>Kept for years.</em>
            </h2>
            <p>
              There’s a difference you can feel. In the grain of the wood. The
              softness of a seat. The way a piece fits, just right.
            </p>
            <div className="craft-accordion">
              {craftDetails.map((detail, i) => (
                <div
                  className={activeCraft === i ? "active" : ""}
                  key={detail.name}
                >
                  <button
                    aria-expanded={activeCraft === i}
                    aria-controls={`craft-detail-${i}`}
                    onClick={() => setActiveCraft(i)}
                  >
                    {detail.name}
                    <Plus size={18} />
                  </button>
                  <div id={`craft-detail-${i}`} hidden={activeCraft !== i}>
                    <p>{detail.text}</p>
                    <small>{detail.detail}</small>
                  </div>
                </div>
              ))}
            </div>
            <a href="#process" className="text-link">
              Get to know our process <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section className="process section-pad" id="process">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM A THOUGHT TO YOUR HOME</span>
              <h2>
                Made personal.
                <br />
                <em>Made simple.</em>
              </h2>
            </div>
            <p>
              You bring the idea.
              <br />
              We help make it feel like home.
            </p>
          </div>
          <div className="process-grid">
            {[
              {
                title: "Let’s get to know your space.",
                text: "Tell us about your home, your style, and the way you live. Start with a free design consultation.",
              },
              {
                title: "Find your perfect combination.",
                text: "Explore proportions, materials, and finishes together. We’ll shape the details and confirm your quote.",
              },
              {
                title: "Leave the making to us.",
                text: "Our in-house team crafts your piece, then takes care of delivery and installation. You make yourself at home.",
              },
            ].map((item, i) => (
              <div key={item.title} className="process-step">
                <span className="step-number">0{i + 1}</span>
                {i < 2 && (
                  <ArrowRight
                    className="step-arrow"
                    size={24}
                    strokeWidth={1}
                  />
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="invitation">
          <div className="invitation-top">
            <span className="eyebrow">
              NOTHING OFF THE SHELF. EVERYTHING ABOUT YOU.
            </span>
            <Sparkles size={25} strokeWidth={1} />
          </div>
          <div className="invitation-main">
            <h2>
              You’ve imagined it.
              <br />
              <em>Let’s make it yours.</em>
            </h2>
            <div>
              <p>
                A room to rethink. A corner to love.
                <br />A home to begin. We’d love to hear about it.
              </p>
              <button className="button button-light" onClick={() => consult()}>
                Start your consultation <ArrowUpRight size={19} />
              </button>
              <small>Complimentary. Personal. A good place to start.</small>
            </div>
          </div>
          <div className="invitation-bottom">
            <span>BESPOKE FURNITURE & INTERIOR STYLING</span>
            <span>
              CHATTOGRAM, BANGLADESH <MoveUpRight size={16} />
            </span>
          </div>
        </section>
        <section className="faq section-pad">
          <div>
            <span className="eyebrow">A FEW THINGS YOU MIGHT WONDER</span>
            <h2>
              Good questions.
              <br />
              <em>Honest answers.</em>
            </h2>
            <p>Something else on your mind?</p>
            <button className="text-link" onClick={() => consult()}>
              Let’s talk about it <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="visit section-pad" id="visit">
          <div className="visit-copy">
            <span className="eyebrow">
              <MapPin size={13} /> THE HEAVEN SHOWROOM
            </span>
            <h2>
              Come in.
              <br />
              <em>Feel at home.</em>
            </h2>
            <p>
              Some things are better experienced in person.
              <br />
              Feel the textures. Find your favorite seat.
              <br />
              Let’s talk about your space.
            </p>
            <address>
              Agrabad Access Road
              <br />
              Chattogram, Bangladesh
            </address>
            <a
              className="text-link"
              href="https://www.google.com/maps/search/?api=1&query=Heaven+Furniture+Mart+Agrabad+Access+Road+Chattogram"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find your way here <ArrowUpRight size={18} />
            </a>
            <span className="visit-hours">
              Call ahead to arrange a visit and confirm opening hours.
            </span>
          </div>
          <div className="visit-card">
            <span className="eyebrow">YOUR HOME. OUR NEXT CONVERSATION.</span>
            <a href="tel:+8801960481983">
              +880 1960-481983 <ArrowUpRight size={23} />
            </a>
            <a
              className="visit-email"
              href="mailto:heavenfurnituremart@gmail.com"
            >
              heavenfurnituremart@gmail.com <ArrowUpRight size={16} />
            </a>
            <div className="visit-card-bottom">
              <Brand />
              <ArrowDownRight size={68} strokeWidth={0.7} />
            </div>
            <span className="visit-card-line">
              DESIGNED. CRAFTED. CUSTOMIZED.
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <Brand light />
          <p>
            Thoughtfully made.
            <br />
            Unmistakably yours.
          </p>
          <div className="footer-socials">
            <a
              href="https://www.facebook.com/HeavenFurnitureMart"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook <ArrowUpRight size={14} />
            </a>
            <a
              href="https://www.instagram.com/heaven_furniture_ltd"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Heaven Furniture Mart · Hackathon concept</span>
          <span>
            Generated interiors & original 3D models are illustrative.
          </span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
      <div className="mobile-cta">
        <span>
          Your space. Your way.<small>Free design consultation</small>
        </span>
        <button className="button button-dark" onClick={() => consult()}>
          <MessageCircle size={16} /> Let’s talk <ArrowUpRight size={16} />
        </button>
      </div>
      {consultation && (
        <Consultation
          design={design}
          {...consultation}
          onClose={() => setConsultation(null)}
        />
      )}
    </>
  );
}
