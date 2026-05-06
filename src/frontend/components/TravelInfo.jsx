import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/*
  ── Add to index.html ──────────────────────────────────────────────
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  ──────────────────────────────────────────────────────────────────
  Cormorant Garamond  → elegant serif for headings / display text
  Inter               → clean, crisp sans-serif for body / UI
*/

const SERIF  = "'Cormorant Garamond', Georgia, serif";
const SANS   = "'Inter', system-ui, sans-serif";

/* ── Scroll-reveal hook ── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on];
}

/* ────────────────────────────────────────
   TRANSPORT CONFIG
──────────────────────────────────────── */
const MODES = [
  {
    label: "By Air", num: "01",
    color: "#2563EB", bg: "#EFF6FF", ring: "#BFDBFE",
    bar: "from-blue-400 to-blue-200",
    icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>,
  },
  {
    label: "By Rail", num: "02",
    color: "#7C3AED", bg: "#F5F3FF", ring: "#DDD6FE",
    bar: "from-violet-400 to-violet-200",
    icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="4" y="3" width="16" height="13" rx="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16M8 19l-2 2M16 19l2 2M9 15l-1 4M15 15l1 4"/></svg>,
  },
  {
    label: "By Bus", num: "03",
    color: "#059669", bg: "#ECFDF5", ring: "#A7F3D0",
    bar: "from-emerald-400 to-emerald-200",
    icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 6v6M16 6v6M3 6h18M3 12h18"/><rect x="3" y="3" width="18" height="14" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M5 17v2M19 17v2M5 19h14"/></svg>,
  },
  {
    label: "By Road", num: "04",
    color: "#D97706", bg: "#FFFBEB", ring: "#FDE68A",
    bar: "from-amber-400 to-amber-200",
    icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3v-3l3-6h12l3 6v3h-2M5 17h14M7 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"/></svg>,
  },
];

const STATS = [
  { emoji: "✈️", val: "~30 min",   sub: "Nearest Airport"  },
  { emoji: "🚆", val: "~15 min",   sub: "Railway Station"  },
  { emoji: "🚌", val: "~10 min",   sub: "Metro / Bus"      },
  { emoji: "🅿️", val: "Available", sub: "Free Parking"     },
];

/* ────────────────────────────────────────
   GLOBAL PROSE STYLES injected via <style>
  (ensures dangerouslySetInnerHTML content
   also gets correct fonts + no underlines)
──────────────────────────────────────── */
const GLOBAL_STYLES = `
  .travel-prose * {
    font-family: 'Inter', system-ui, sans-serif !important;
    text-decoration: none !important;
  }
  .travel-prose {
    font-size: 15px;
    line-height: 1.85;
    color: #4B5563;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  .travel-prose p          { margin-bottom: 0.85rem; }
  .travel-prose p:last-child { margin-bottom: 0; }
  .travel-prose h1,.travel-prose h2,.travel-prose h3 {
    font-family: 'Cormorant Garamond', Georgia, serif !important;
    color: #111827;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.6rem;
  }
  .travel-prose h1 { font-size: 1.6rem; }
  .travel-prose h2 { font-size: 1.35rem; }
  .travel-prose h3 { font-size: 1.15rem; }
  .travel-prose strong {
    font-weight: 600;
    color: #1F2937;
    font-family: 'Inter', system-ui, sans-serif !important;
  }
  .travel-prose em {
    font-style: italic;
    color: #374151;
    font-family: 'Cormorant Garamond', Georgia, serif !important;
    font-size: 1.05em;
  }
  .travel-prose a {
    color: inherit;
    text-decoration: none !important;
    font-weight: 500;
    border-bottom: 1px solid rgba(0,0,0,0.15);
    transition: border-color 0.2s;
  }
  .travel-prose a:hover { border-bottom-color: rgba(0,0,0,0.45); }
  .travel-prose ul { list-style: none; padding: 0; margin: 0.5rem 0 0.85rem; }
  .travel-prose ul li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 6px;
    color: #4B5563;
  }
  .travel-prose ul li::before {
    content: '→';
    color: #9CA3AF;
    font-weight: 600;
    font-size: 13px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .travel-prose ol { padding-left: 1.25rem; margin-bottom: 0.85rem; }
  .travel-prose ol li { margin-bottom: 5px; color: #4B5563; }
  .travel-prose table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 0.85rem; }
  .travel-prose th {
    background: #F9FAFB;
    padding: 8px 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border: 1px solid #E5E7EB;
  }
  .travel-prose td { padding: 8px 12px; border: 1px solid #F3F4F6; color: #4B5563; }
  .hero-prose * {
    font-family: 'Inter', system-ui, sans-serif !important;
    text-decoration: none !important;
  }
  .hero-prose {
    font-size: 15px;
    line-height: 1.8;
    color: rgba(255,255,255,0.55);
    font-weight: 300;
    letter-spacing: 0.01em;
  }
  .hero-prose p { margin-bottom: 0.5rem; }
  .hero-prose strong { color: rgba(255,255,255,0.9); font-weight: 600; }
  .hero-prose a { color: #FCD34D; text-decoration: none !important; }
`;

/* ── Skeletons ── */
const SkeletonHero = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-12 bg-white/10 rounded-2xl w-3/4" />
    <div className="h-12 bg-white/10 rounded-2xl w-1/2" />
    <div className="space-y-2 mt-5">
      {[100, 85, 70].map((w, i) => (
        <div key={i} className="h-3.5 bg-white/8 rounded-full" style={{ width: `${w}%` }} />
      ))}
    </div>
  </div>
);

const SkeletonCard = ({ flip }) => (
  <div className={`flex flex-col ${flip ? "lg:flex-row-reverse" : "lg:flex-row"} overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm animate-pulse`}>
    <div className="lg:w-5/12 min-h-[260px] bg-gradient-to-br from-gray-200 to-gray-100" />
    <div className="lg:w-7/12 p-10 flex flex-col justify-center gap-4">
      <div className="h-1 w-12 bg-gray-200 rounded-full" />
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 rounded-xl bg-gray-200" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-2.5 mt-1">
        {[100, 88, 76, 62].map((w, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded-full" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────
   HERO
──────────────────────────────────────── */
const Hero = ({ title, text, loading, error, onRetry }) => {
  const [ref, on] = useReveal(0.04);
  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-[28px] mb-16"
      style={{
        background: "linear-gradient(150deg, #0a0f1e 0%, #111827 55%, #0d1a2a 100%)",
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(22px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.18) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(37,99,235,0.14) 0%, transparent 55%),
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 32px 32px",
        }} />

      {/* Top edge shimmer */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent 0%,rgba(245,158,11,0.8) 40%,rgba(245,158,11,0.8) 60%,transparent 100%)" }} />

      <div className="relative z-10 px-8 sm:px-14 py-14 sm:py-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-7">
          <span className="block w-7 h-px bg-amber-400" />
          <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-amber-400"
            style={{ fontFamily: SANS }}>
            InOptics 2026 &nbsp;·&nbsp; Travel Guide
          </span>
        </div>

        {/* Title */}
        {loading ? <SkeletonHero /> : error ? (
          <div>
            <h1 className="text-5xl sm:text-6xl text-white font-semibold leading-[1.1] mb-3"
              style={{ fontFamily: SERIF }}>
              How to <em>Reach Us</em>
            </h1>
            <button onClick={onRetry}
              className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors mt-2"
              style={{ fontFamily: SANS }}>
              ↻ Reload content
            </button>
          </div>
        ) : (
          <>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl text-white font-semibold leading-[1.08] mb-7
                [&_em]:italic [&_em]:font-normal [&_em]:text-amber-300"
              style={{ fontFamily: SERIF }}
              dangerouslySetInnerHTML={{ __html: title || "How to <em>Reach Us</em>" }}
            />
            {text && (
              <div
                className="hero-prose max-w-2xl mb-10"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            )}
          </>
        )}

        {/* Stats chips */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 border border-white/10"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
              >
                <span className="text-[1.6rem] leading-none flex-shrink-0">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="text-white text-[15px] font-semibold leading-tight truncate"
                    style={{ fontFamily: SANS }}>{s.val}</p>
                  <p className="text-white/38 text-[11px] mt-0.5 truncate"
                    style={{ fontFamily: SANS }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ────────────────────────────────────────
   SECTION HEADING
──────────────────────────────────────── */
const SectionHead = ({ count }) => {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      className="flex items-end gap-6 mb-12"
      style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(16px)", transition: "all 0.55s ease" }}
    >
      <span
        className="text-[80px] sm:text-[100px] leading-none font-semibold text-gray-100 select-none"
        style={{ fontFamily: SERIF, lineHeight: 0.9, letterSpacing: "-0.02em" }}>
        {String(count).padStart(2, "0")}
      </span>
      <div className="pb-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight"
          style={{ fontFamily: SERIF }}>
          Ways to Reach <em className="not-italic text-amber-500">the Venue</em>
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-normal"
          style={{ fontFamily: SANS }}>
          Pick the route that works best for you
        </p>
      </div>
      <div className="hidden sm:block flex-1 mb-3">
        <div className="h-px bg-gradient-to-r from-amber-200 via-gray-200 to-transparent" />
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   TRAVEL CARD
──────────────────────────────────────── */
const TravelCard = ({ card, index }) => {
  const [ref, on]           = useReveal(0.08);
  const [imgOk, setImgOk]   = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const isFlip  = card.position?.toLowerCase() === "left";
  const mode    = MODES[index % MODES.length];

  return (
    <div
      ref={ref}
      className="group"
      style={{
        opacity:   on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${index * 90}ms, transform 0.65s ease ${index * 90}ms`,
      }}
    >
      {/* ── Step label row ── */}
      <div className="flex items-center gap-4 mb-5 pl-1">
        {/* Numbered badge */}
        <span
          className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold border-2 select-none"
          style={{
            fontFamily: SANS,
            color: mode.color,
            background: mode.bg,
            borderColor: mode.ring,
          }}>
          {mode.num}
        </span>
        {/* Mode chip */}
        <span
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border"
          style={{ fontFamily: SANS, color: mode.color, background: mode.bg, borderColor: mode.ring }}>
          <span style={{ color: mode.color }}>{mode.icon}</span>
          {mode.label}
        </span>
        {/* Thin rule */}
        <div className={`flex-1 h-px hidden sm:block bg-gradient-to-r ${mode.bar} opacity-40`} />
      </div>

      {/* ── Card shell ── */}
      <div
        className={`flex flex-col ${isFlip ? "lg:flex-row-reverse" : "lg:flex-row"} overflow-hidden rounded-[28px] border border-gray-100 bg-white group-hover:border-gray-200 group-hover:shadow-2xl transition-all duration-500`}
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.055)" }}
      >
        {/* ── Image ── */}
        <div className="lg:w-[44%] relative overflow-hidden bg-gray-100 min-h-[240px] sm:min-h-[300px]">
          {!imgOk && !imgErr && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-50 animate-pulse" />
          )}
          {!imgErr ? (
            <img
              src={card.image}
              alt={`Route ${index + 1}`}
              draggable={false}
              onLoad={() => setImgOk(true)}
              onError={() => { setImgErr(true); setImgOk(true); }}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ${imgOk ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
              <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"/>
              </svg>
              <span className="text-xs text-gray-300" style={{ fontFamily: SANS }}>No image</span>
            </div>
          )}

          {/* Vignette overlay */}
          <div className={`absolute inset-0 ${isFlip ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-black/25 via-transparent to-transparent`} />

          {/* Big number watermark */}
          <span
            className="absolute bottom-4 right-4 leading-none text-white/10 font-semibold select-none"
            style={{ fontFamily: SERIF, fontSize: "6rem" }}>
            {mode.num}
          </span>
        </div>

        {/* ── Text ── */}
        <div className="lg:w-[56%] flex flex-col justify-center px-8 sm:px-12 py-10">
          {/* Colored bar */}
          <div className={`w-12 h-[3px] rounded-full bg-gradient-to-r ${mode.bar} mb-7`} />

          {/* API description — travel-prose class for clean styling */}
          <div
            className="travel-prose"
            dangerouslySetInnerHTML={{ __html: card.description }}
          />

          {/* Maps link */}
          <a
            href="https://maps.google.com/?q=InOptics+2026"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-[13px] font-medium text-gray-400 hover:text-gray-700 transition-colors duration-200 self-start group/lnk"
            style={{ fontFamily: SANS, textDecoration: "none" }}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            View on Google Maps
            <svg className="w-3 h-3 group-hover/lnk:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   MAP CTA BANNER
──────────────────────────────────────── */
const MapBanner = () => {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      className="mt-20 rounded-[28px] overflow-hidden relative"
      style={{
        background: "linear-gradient(150deg, #0a0f1e 0%, #111827 60%, #0d1a2a 100%)",
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(24px)",
        transition: "all 0.7s ease",
      }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse at 90% 50%, rgba(245,158,11,0.18) 0%,transparent 55%), radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "100% 100%, 28px 28px",
        }} />
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(245,158,11,0.7),transparent)" }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 sm:px-14 py-12 sm:py-14">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
            <span className="w-7 h-px bg-amber-400" />
            <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-amber-400"
              style={{ fontFamily: SANS }}>
              Venue Location
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-semibold text-white leading-[1.1] mb-4
              [&_em]:italic [&_em]:font-normal [&_em]:text-amber-300"
            style={{ fontFamily: SERIF }}>
            Find the <em>Venue</em>
          </h2>
          <p className="text-white/45 text-[15px] leading-relaxed max-w-sm font-light"
            style={{ fontFamily: SANS }}>
            Open Google Maps for real-time directions, traffic updates and estimated arrival.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          <a
            href="https://maps.google.com/?q=InOptics+2026"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-[1.03]"
            style={{
              fontFamily: SANS,
              background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
              color: "#000",
              boxShadow: "0 6px 28px rgba(245,158,11,0.4)",
              textDecoration: "none",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 36px rgba(245,158,11,0.6)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(245,158,11,0.4)"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
            Open Google Maps
          </a>
          <a
            href="mailto:info@inoptics.in"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200 border border-white/12 hover:border-white/25 hover:bg-white/10"
            style={{ fontFamily: SANS, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.06)", textDecoration: "none" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Error state ── */
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: SERIF }}>
      Couldn't load travel info
    </h3>
    <p className="text-sm text-gray-400 mb-6 font-light" style={{ fontFamily: SANS }}>
      Something went wrong. Please try again.
    </p>
    <button onClick={onRetry}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
      style={{ fontFamily: SANS }}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      Try Again
    </button>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const TravelInfo = () => {
  const [travelMain,   setMain]  = useState({});
  const [travelCards,  setCards] = useState([]);
  const [loadingMain,  setLM]   = useState(true);
  const [loadingCards, setLC]   = useState(true);
  const [errorMain,    setEM]   = useState(false);
  const [errorCards,   setEC]   = useState(false);

  const fromExhibitor = new URLSearchParams(useLocation().search).get("from") === "exhibitor";

  useEffect(() => { fetchMain(); fetchCards(); }, []);

  const fetchMain = async () => {
    setLM(true); setEM(false);
    try {
      const r = await fetch("https://inoptics.in/api/get_reach_main.php");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setMain(d && !Array.isArray(d) && typeof d === "object" ? d : {});
    } catch { setEM(true); }
    finally { setLM(false); }
  };

  const fetchCards = async () => {
    setLC(true); setEC(false);
    try {
      const r = await fetch("https://inoptics.in/api/get_reach_cards.php");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCards(Array.isArray(d) ? d : []);
    } catch { setEC(true); }
    finally { setLC(false); }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="min-h-screen bg-[#F7F7F6]" style={{ fontFamily: SANS }}>
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          <div className="mb-8"><Breadcrumbs /></div>

          {/* Exhibitor notice */}
          {fromExhibitor && (
            <div className="mb-8 flex items-start gap-3.5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
              <p className="text-[14px] text-amber-800 font-light" style={{ fontFamily: SANS }}>
                You were redirected from the <strong className="font-semibold">Exhibitor Portal</strong>.
                Here's how to reach the InOptics 2026 venue.
              </p>
            </div>
          )}

          {/* Hero */}
          <Hero
            title={travelMain?.title}
            text={travelMain?.text}
            loading={loadingMain}
            error={errorMain}
            onRetry={fetchMain}
          />

          {/* Cards */}
          {loadingCards ? (
            <div className="space-y-10">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} flip={i % 2 !== 0} />)}
            </div>
          ) : errorCards ? (
            <ErrorState onRetry={fetchCards} />
          ) : travelCards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-400 font-light" style={{ fontFamily: SANS }}>
                No travel information available yet.
              </p>
            </div>
          ) : (
            <>
              <SectionHead count={travelCards.length} />
              <div className="space-y-12">
                {travelCards.map((card, idx) => (
                  <TravelCard key={card.id || idx} card={card} index={idx} />
                ))}
              </div>
            </>
          )}

          {!loadingCards && !errorCards && travelCards.length > 0 && <MapBanner />}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TravelInfo;