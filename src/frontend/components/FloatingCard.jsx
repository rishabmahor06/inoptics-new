import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaFacebookF, FaWhatsapp, FaXTwitter, FaInstagram,
  FaYoutube, FaLinkedinIn,
} from "react-icons/fa6";

/*
  index.html me add karo:
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
*/

const FONT = "'Plus Jakarta Sans', sans-serif";
const API  = "https://inoptics.in/api/get_floatingcard_details.php";

/* ── Social config ── */
const SOCIALS = [
  { id: "fb",  label: "Facebook",  href: "https://www.facebook.com/inopticsonoptics",                color: "#1877F2", bg: "#1877F2", Icon: FaFacebookF  },
  { id: "ig",  label: "Instagram", href: "https://www.instagram.com/inoptic99/",                     color: "#E1306C", bg: "#E1306C", Icon: FaInstagram  },
  { id: "tw",  label: "Twitter",   href: "https://x.com/in_inoptics",                                color: "#1DA1F2", bg: "#1DA1F2", Icon: FaXTwitter   },
  { id: "yt",  label: "YouTube",   href: "https://www.youtube.com/channel/UCZzX2F7ztBatHyOkZo2cmQw", color: "#FF0000", bg: "#FF0000", Icon: FaYoutube    },
  { id: "li",  label: "LinkedIn",  href: "https://www.linkedin.com/company/inoptics",                color: "#0A66C2", bg: "#0A66C2", Icon: FaLinkedinIn },
];

/* ══════════════ DRAG HOOK ══════════════ */
function useDrag(initFn) {
  const [pos, setPos]  = useState(() =>
    typeof window !== "undefined" ? initFn() : { x: 100, y: 100 }
  );
  const active  = useRef(false);
  const startM  = useRef({ x: 0, y: 0 });
  const startP  = useRef({ x: 0, y: 0 });
  const elRef   = useRef(null);

  const begin = (cx, cy) => {
    active.current = true;
    startM.current = { x: cx, y: cy };
    startP.current = { ...pos };
  };

  const onMouseDown  = (e) => { if (e.button !== 0) return; e.preventDefault(); begin(e.clientX, e.clientY); };
  const onTouchStart = (e) => { const t = e.touches[0]; begin(t.clientX, t.clientY); };

  useEffect(() => {
    const move = (cx, cy) => {
      if (!active.current || !elRef.current) return;
      const W = window.innerWidth,  H = window.innerHeight;
      const w = elRef.current.offsetWidth, h = elRef.current.offsetHeight;
      setPos({
        x: Math.min(Math.max(0, startP.current.x + cx - startM.current.x), W - w),
        y: Math.min(Math.max(0, startP.current.y + cy - startM.current.y), H - h),
      });
    };
    const mm = (e) => move(e.clientX, e.clientY);
    const tm = (e) => { const t = e.touches[0]; move(t.clientX, t.clientY); };
    const up = ()  => { active.current = false; };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup",   up);
    window.addEventListener("touchmove", tm, { passive: true });
    window.addEventListener("touchend",  up);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup",   up);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend",  up);
    };
  }, []);

  return { elRef, pos, setPos, onMouseDown, onTouchStart };
}

/* ══════════════ SOCIAL ICON (single row) ══════════════ */
const SocialIcon = ({ social, hovered, onHover, onLeave }) => {
  const { id, label, href, color, bg, Icon } = social;
  const isHovered = hovered === id;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      {/* Hover label pill — slides left */}
      <div
        style={{
          position: "absolute",
          right: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: 160,
          background: "#fff",
          borderRadius: 14,
          padding: "0 10px 0 16px",
          height: 44,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          pointerEvents: "none",
          transformOrigin: "right center",
          transform: isHovered ? "scaleX(1) translateX(0)" : "scaleX(0) translateX(20px)",
          opacity: isHovered ? 1 : 0,
          transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#222", whiteSpace: "nowrap", fontFamily: FONT }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 3px 10px ${color}55`, flexShrink: 0,
        }}>
          <Icon size={15} color="#fff" />
        </div>
      </div>

      {/* The circular icon */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={onLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", cursor: "pointer", flexShrink: 0,
          boxShadow: isHovered ? `0 6px 20px ${color}66` : `0 3px 12px ${color}44`,
          transform: isHovered ? "scale(1.12)" : "scale(1)",
          transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <Icon size={17} color="#fff" />
      </a>
    </div>
  );
};

/* ══════════════ ICON STRIP (right bar, standalone) ══════════════ */
const IconStrip = ({ onPlusClick }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 10,
      padding: "16px 0",
    }}>
      {SOCIALS.map((s) => (
        <SocialIcon
          key={s.id}
          social={s}
          hovered={hovered}
          onHover={setHovered}
          onLeave={() => setHovered(null)}
        />
      ))}
      {/* Plus button */}
      <div style={{ marginTop: 4 }}>
        <button
          onClick={onPlusClick}
          title="Open card"
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#fff",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 14px rgba(0,0,0,0.14)",
            fontSize: 22, fontWeight: 300, color: "#333",
            transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            fontFamily: FONT,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(90deg)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,0,0,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(0,0,0,0.14)"; }}
        >
          +
        </button>
      </div>
    </div>
  );
};

/* ══════════════ SKELETON ══════════════ */
const Skeleton = () => (
  <div style={{ padding: "8px 0", animation: "fadeIn 0.3s ease" }}>
    {[70, 55, 100, 90, 80].map((w, i) => (
      <div key={i} style={{
        height: i === 0 ? 32 : 13, borderRadius: 8, marginBottom: i === 0 ? 18 : 10,
        width: `${w}%`,
        background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
        backgroundSize: "300% 100%",
        animation: `shimmer 1.5s infinite`,
        animationDelay: `${i * 0.1}s`,
      }} />
    ))}
  </div>
);

/* ══════════════ CARD CONTENT (API-driven) ══════════════ */
const CardContent = ({ cards, loading, activeTab, setActiveTab }) => {
  const current = cards[activeTab] ?? null;

  if (loading) return <Skeleton />;

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#bbb", fontSize: 14, fontFamily: FONT }}>
        📭 No updates available
      </div>
    );
  }

  return (
    <div>
      {/* Tabs — only if multiple cards */}
      {cards.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {cards.map((_, i) => (
            <button key={i}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, padding: "6px 4px", borderRadius: 10, border: "none",
                fontSize: 10.5, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s ease", fontFamily: FONT,
                background: activeTab === i ? "#EF4444" : "rgba(0,0,0,0.06)",
                color: activeTab === i ? "#fff" : "#999",
                boxShadow: activeTab === i ? "0 3px 12px rgba(239,68,68,0.35)" : "none",
              }}>
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div>
          {/* Title */}
          <div
            style={{ marginBottom: 10 }}
            dangerouslySetInnerHTML={{ __html: current.title }}
          />

          {/* Red divider */}
          <div style={{
            width: 48, height: 3.5, borderRadius: 4,
            background: "#EF4444",
            margin: "14px 0",
          }} />

          {/* Description */}
          <div
            style={{
              fontSize: 13.5, lineHeight: 1.75, color: "#444", fontFamily: FONT,
            }}
            className="
              [&_p]:mb-3 [&_p:last-child]:mb-0
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-2
              [&_strong]:font-bold [&_strong]:text-gray-900
              [&_a]:text-blue-600 [&_a]:underline
              [&_ul]:space-y-2 [&_ul]:pl-0 [&_ul]:list-none
              [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
              [&_ul_li]:before:content-['•'] [&_ul_li]:before:text-red-400 [&_ul_li]:before:font-bold
            "
            dangerouslySetInnerHTML={{ __html: current.description }}
          />
        </div>
      )}

      {/* Dot pagination */}
      {cards.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
          {cards.map((_, i) => (
            <button key={i}
              onClick={() => setActiveTab(i)}
              style={{
                height: 6, border: "none", cursor: "pointer",
                borderRadius: 99, padding: 0,
                width: activeTab === i ? 22 : 6,
                background: activeTab === i ? "#EF4444" : "#ddd",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════ MAIN FLOATING COMPONENT ══════════════ */
export default function FloatingSocial() {
  const [cards,     setCards]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [open,      setOpen]      = useState(false);
  const [rendered,  setRendered]  = useState(false);
  const [animOut,   setAnimOut]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hovered,   setHovered]   = useState(null);

  /* Card dimensions */
  const CARD_W     = 320;
  const STRIP_W    = 66;
  const TOTAL_W    = CARD_W + STRIP_W;
  const CARD_H_EST = 460;

  const getDefaultPos = useCallback(() => ({
    x: Math.max(10, window.innerWidth  - TOTAL_W - 16),
    y: Math.max(10, window.innerHeight / 2 - CARD_H_EST / 2),
  }), []);

  const { elRef, pos, setPos, onMouseDown, onTouchStart } = useDrag(getDefaultPos);

  /* Fetch */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(API);
        const d = await r.json();
        setCards(Array.isArray(d) ? d : []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  /* Auto-open on mount */
  useEffect(() => {
    const t = setTimeout(() => {
      setPos(getDefaultPos());
      setRendered(true);
      requestAnimationFrame(() => setOpen(true));
    }, 500);
    return () => clearTimeout(t);
  }, []);

  /* Open card */
  const openCard = () => {
    setPos(getDefaultPos());
    setRendered(true);
    setAnimOut(false);
    requestAnimationFrame(() => setOpen(true));
  };

  /* Close / Minimise */
  const closeCard = () => {
    setAnimOut(true);
    setTimeout(() => {
      setOpen(false);
      setRendered(false);
      setAnimOut(false);
    }, 350);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 300% 0; }
          100% { background-position: -300% 0; }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.5; transform:scale(0.8); }
        }
        @keyframes slideInRight {
          0%   { opacity:0; transform:translateX(80px) scale(0.93); }
          100% { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes slideOutRight {
          0%   { opacity:1; transform:translateX(0) scale(1); }
          100% { opacity:0; transform:translateX(80px) scale(0.93); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        .floating-card-enter { animation: slideInRight 0.42s cubic-bezier(0.34,1.4,0.64,1) both; }
        .floating-card-exit  { animation: slideOutRight 0.32s cubic-bezier(0.4,0,0.8,1) both; }
      `}</style>

      {/* ── STANDALONE ICON STRIP (when card is closed) ── */}
      {!rendered && (
        <div style={{
          position: "fixed",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 0,
          padding: "16px 0",
        }}>
          {SOCIALS.map((s) => (
            <div key={s.id} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 10 }}>
              {/* Hover label */}
              <div style={{
                position: "absolute",
                right: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: 160,
                background: "#fff",
                borderRadius: 14,
                padding: "0 10px 0 16px",
                height: 44,
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                pointerEvents: "none",
                transformOrigin: "right center",
                transform: hovered === s.id ? "scaleX(1)" : "scaleX(0)",
                opacity: hovered === s.id ? 1 : 0,
                transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#222", fontFamily: FONT }}>{s.label}</span>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 3px 10px ${s.color}55`,
                }}>
                  <s.Icon size={15} color="#fff" />
                </div>
              </div>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: `0 3px 12px ${s.color}44`,
                  transform: hovered === s.id ? "scale(1.12)" : "scale(1)",
                  transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <s.Icon size={17} color="#fff" />
              </a>
            </div>
          ))}
          {/* Plus */}
          <button
            onClick={openCard}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 14px rgba(0,0,0,0.14)",
              fontSize: 22, fontWeight: 300, color: "#333",
              transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(90deg)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; }}
          >+</button>
        </div>
      )}

      {/* ── FULL CARD + ICON STRIP (when open) ── */}
      {rendered && (
        <div
          ref={elRef}
          className={animOut ? "floating-card-exit" : "floating-card-enter"}
          style={{
            position: "fixed",
            left: pos.x,
            top:  pos.y,
            zIndex: 9999,
            display: "flex",
            alignItems: "stretch",
            touchAction: "none",
          }}
        >
          {/* ─── LEFT: Card content ─── */}
          <div style={{
            width: CARD_W,
            background: "#fff",
            borderRadius: "20px 0 0 20px",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}>
            {/* ── Minimize button — top left red square ── */}
            <div
              style={{ position: "absolute", top: 14, left: 14, zIndex: 10 }}
              onMouseDown={e => e.stopPropagation()}
            >
              <button
                onClick={closeCard}
                title="Minimise"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#EF4444",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.40)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.background = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#EF4444"; }}
              >
                <svg width="14" height="3" viewBox="0 0 14 3" fill="none">
                  <rect width="14" height="3" rx="1.5" fill="white"/>
                </svg>
              </button>
            </div>

            {/* ── Drag handle dots — top center ── */}
            <div
              style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                paddingTop: 18, paddingBottom: 6, cursor: "grab",
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, opacity: 0.25 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#555" }} />
                ))}
              </div>
            </div>

            {/* ── Main content ── */}
            <div
              style={{ flex: 1, padding: "12px 28px 28px", cursor: "default" }}
              onMouseDown={e => e.stopPropagation()}
            >
              <CardContent
                cards={cards}
                loading={loading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>

          {/* ─── DIVIDER LINE ─── */}
          <div style={{ width: 1, background: "#ececec", flexShrink: 0 }} />

          {/* ─── RIGHT: Icon strip ─── */}
          <div style={{
            width: STRIP_W,
            background: "#fff",
            borderRadius: "0 20px 20px 0",
            boxShadow: "8px 0 40px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "20px 0",
          }}>
            {SOCIALS.map((s) => (
              <div key={s.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {/* Hover label — slides LEFT */}
                <div style={{
                  position: "absolute",
                  right: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: 165,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "0 10px 0 16px",
                  height: 44,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                  pointerEvents: "none",
                  transformOrigin: "right center",
                  transform: hovered === s.id ? "scaleX(1)" : "scaleX(0)",
                  opacity: hovered === s.id ? 1 : 0,
                  transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
                  zIndex: 10,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#222", whiteSpace: "nowrap", fontFamily: FONT }}>
                    {s.label}
                  </span>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", background: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 3px 10px ${s.color}55`, flexShrink: 0,
                  }}>
                    <s.Icon size={14} color="#fff" />
                  </div>
                </div>

                {/* Icon circle */}
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none",
                    boxShadow: hovered === s.id ? `0 5px 18px ${s.color}66` : `0 2px 10px ${s.color}33`,
                    transform: hovered === s.id ? "scale(1.12)" : "scale(1)",
                    transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <s.Icon size={16} color="#fff" />
                </a>
              </div>
            ))}

            {/* Plus button — closes card */}
            <div style={{ marginTop: 4 }}>
              <button
                onClick={closeCard}
                onMouseDown={e => e.stopPropagation()}
                title="Close card"
                style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#fff", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  fontSize: 22, fontWeight: 300, color: "#555",
                  transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                  fontFamily: FONT,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1) rotate(45deg)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)"; }}
              >+</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}