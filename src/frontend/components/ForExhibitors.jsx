import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaWarehouse, FaTags, FaEye } from "react-icons/fa";
import {
  MdArrowOutward, MdLogin, MdHowToReg, MdLightbulb, MdCheckCircle,
} from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/* ─────────────────────────────────────────────────────────────
   ⚠️  APP.JSX ROUTING FIX (agar wahan galat wrap hai)
   ─────────────────────────────────────────────────────────────
   Make sure /for-exhibitors route is PUBLIC — NOT inside any
   PrivateRoute / ExhibitorProtectedRoute wrapper.

   CORRECT in App.jsx:
     <Route path="/for-exhibitors" element={<ForExhibitors />} />

   WRONG (causes 1-second flash + redirect):
     <Route element={<ExhibitorProtectedRoute />}>
       <Route path="/for-exhibitors" element={<ForExhibitors />} />
     </Route>
   ───────────────────────────────────────────────────────────── */

const COUNTERS = [
  { Icon: FaUsers,     end: 349,   suffix: "",  label: "Exhibitors",             tint: "from-blue-500 to-cyan-500"    },
  { Icon: FaWarehouse, end: 24000, suffix: "",  label: "Exhibition Area (sqm)",  tint: "from-emerald-500 to-teal-500" },
  { Icon: FaTags,      end: 1500,  suffix: "+", label: "Brands",                 tint: "from-purple-500 to-pink-500"  },
  { Icon: FaEye,       end: 20000, suffix: "+", label: "Visitors",               tint: "from-amber-500 to-orange-500" },
];

const QUICK_LINKS = [
  { to: "/why-exhibit",      label: "Why Exhibit",         desc: "Discover the value of being an InOptics exhibitor", Icon: MdLightbulb },
  { to: "/become-exhibitor", label: "Become an Exhibitor", desc: "Apply now and reserve your stall",                  Icon: MdHowToReg  },
  { to: "/exhibitor-login",  label: "Exhibitor Login",     desc: "Access your exhibitor dashboard",                   Icon: MdLogin     },
];

/* ── Skeleton loaders ── */
const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3.5 rounded-full bg-white/10"
        style={{ width: `${[100, 85, 70][i] ?? 80}%` }} />
    ))}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-zinc-100 p-6 animate-pulse">
    <div className="h-5 w-2/5 bg-zinc-200 rounded-full mb-4" />
    <div className="space-y-2">
      {[100, 90, 80, 60].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
      ))}
    </div>
  </div>
);

/* ── Counter card ── */
const CounterCard = ({ Icon, end, suffix, label, tint, inView }) => (
  <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-lg p-4 sm:p-6 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} />
    <div className={`relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg mb-3`}>
      <Icon size={20} />
    </div>
    <h2 className="relative text-2xl sm:text-3xl lg:text-4xl text-[#02062c] font-bold tracking-tight leading-tight"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {inView ? <><CountUp end={end} duration={3} separator="," />{suffix}</> : "0"}
    </h2>
    <p className="relative text-[11px] sm:text-[12px] text-zinc-500 mt-1 font-bold uppercase tracking-widest">
      {label}
    </p>
  </div>
);

/* ── Quick link item ── */
const QuickLinkItem = ({ to, label, desc, Icon }) => (
  <li>
    <Link to={to}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 transition-all">
      <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-[#02062c] transition-colors">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-white">{label}</p>
        <p className="text-[11px] text-blue-200 truncate">{desc}</p>
      </div>
      <MdArrowOutward size={14}
        className="text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  </li>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT — ForExhibitors
   ⚠️  This is a PUBLIC page — no auth check needed here.
   ══════════════════════════════════════════════════════════════ */
export default function ForExhibitors() {
  const [mainData,   setMainData]   = useState(null);
  const [cards,      setCards]      = useState([]);
  const [mainLoad,   setMainLoad]   = useState(true);
  const [cardsLoad,  setCardsLoad]  = useState(true);
  const [mainError,  setMainError]  = useState(false);
  const [cardsError, setCardsError] = useState(false);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  /* ── Fetch exhibitors main (hero text) ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitors_main.php");
        if (!r.ok) throw new Error("bad response");
        const d = await r.json();
        if (!cancelled) {
          const parsed = Array.isArray(d) ? (d[0] ?? {}) : (d && typeof d === "object" ? d : {});
          setMainData(parsed);
        }
      } catch {
        if (!cancelled) setMainError(true);
      } finally {
        if (!cancelled) setMainLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Fetch exhibitors cards ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitors_cards.php");
        if (!r.ok) throw new Error("bad response");
        const d = await r.json();
        if (!cancelled) setCards(Array.isArray(d) ? d : []);
      } catch {
        if (!cancelled) setCardsError(true);
      } finally {
        if (!cancelled) setCardsLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Split cards ── */
  const featuredCard = cards.find(c => String(c.id) === "2");
  const otherCards   = cards.filter(c => String(c.id) !== "2");

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <Breadcrumbs />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #02062c 0%, #0a1450 50%, #1e3a8a 100%)" }}>
        {/* Blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 lg:py-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              For Exhibitors
            </span>
          </div>

          {/* Title */}
          {mainLoad ? (
            <div className="animate-pulse">
              <div className="h-12 w-3/4 bg-white/10 rounded-xl mb-4" />
              <div className="h-12 w-1/2 bg-white/10 rounded-xl" />
            </div>
          ) : (
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight max-w-3xl
                [&_em]:bg-gradient-to-r [&_em]:from-amber-300 [&_em]:to-pink-300 [&_em]:bg-clip-text [&_em]:text-transparent [&_em]:not-italic [&_em]:font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}
              dangerouslySetInnerHTML={{
                __html: mainData?.header || "Showcase your brand at <em>InOptics 2026</em>",
              }}
            />
          )}

          {/* Sub text */}
          <div className="mt-5 max-w-2xl">
            {mainLoad ? (
              <SkeletonText lines={3} />
            ) : mainError ? (
              <p className="text-blue-200 text-sm">Essential resources and guidelines for exhibitors at InOptics.</p>
            ) : (
              <div
                className="text-[14px] sm:text-[16px] text-blue-200 leading-relaxed
                  [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-amber-300 [&_a]:no-underline [&_a]:font-semibold
                  [&_strong]:font-bold [&_strong]:text-white"
                dangerouslySetInnerHTML={{
                  __html: mainData?.text || "Essential resources and guidelines for exhibitors at InOptics.",
                }}
              />
            )}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/become-exhibitor"
              className="group inline-flex items-center gap-2 px-6 h-12 bg-amber-400 hover:bg-amber-300 text-[#02062c] text-[13px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all">
              Become an Exhibitor
              <MdArrowOutward size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link to="/exhibitor-login"
              className="inline-flex items-center gap-2 px-6 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[13px] font-bold uppercase tracking-wider rounded-xl border border-white/20 transition-all">
              <MdLogin size={16} /> Exhibitor Login
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ COUNTERS ══════════ */}
      <section ref={ref}
        className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-10 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {COUNTERS.map((c, i) => (
            <CounterCard key={i} {...c} inView={inView} />
          ))}
        </div>
      </section>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-16 sm:mt-20 mb-16 sm:mb-24 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* ── LEFT: Cards ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Featured card (id=2) */}
            {cardsLoad ? (
              <SkeletonCard />
            ) : cardsError ? (
              <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
                <p className="text-red-400 text-sm mb-3">Failed to load content.</p>
                <button
                  onClick={() => { setCardsError(false); setCardsLoad(true); window.location.reload(); }}
                  className="text-sm font-semibold text-blue-600 hover:underline">
                  Retry
                </button>
              </div>
            ) : featuredCard ? (
              <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl p-6 sm:p-8 overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
                <h2
                  className="text-2xl sm:text-3xl font-light tracking-tight text-[#02062c] mb-4
                    [&_strong]:font-bold [&_em]:italic"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  dangerouslySetInnerHTML={{ __html: featuredCard.title }}
                />
                <div
                  className="text-[14px] sm:text-[15px] text-zinc-700 leading-relaxed
                    [&_p]:mb-3 [&_p:last-child]:mb-0
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#02062c] [&_h2]:mb-2
                    [&_h3]:text-lg  [&_h3]:font-bold [&_h3]:text-[#02062c] [&_h3]:mb-2
                    [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:mb-3
                    [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
                    [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-blue-500 [&_ul_li]:before:font-bold [&_ul_li]:before:flex-shrink-0 [&_ul_li]:before:mt-0.5
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                    [&_strong]:font-bold [&_strong]:text-[#02062c]
                    [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-blue-800"
                  dangerouslySetInnerHTML={{ __html: featuredCard.description }}
                />
              </div>
            ) : null}

            {/* Other cards */}
            {!cardsLoad && !cardsError && otherCards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {otherCards.map((card) => (
                  <div key={card.id}
                    className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
                    <MdCheckCircle size={20} className="text-emerald-500 mb-3" />
                    <h3
                      className="text-[16px] font-bold text-[#02062c] mb-2 leading-snug [&_strong]:font-bold"
                      dangerouslySetInnerHTML={{ __html: card.title }}
                    />
                    <div
                      className="text-[13px] text-zinc-600 leading-relaxed
                        [&_p]:mb-2 [&_p:last-child]:mb-0
                        [&_strong]:font-bold [&_strong]:text-[#02062c]
                        [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!cardsLoad && !cardsError && !featuredCard && otherCards.length === 0 && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                  <MdLightbulb size={26} className="text-zinc-300" />
                </div>
                <p className="text-zinc-400 text-sm">No exhibitor content available yet.</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Quick links */}
            <div className="rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #02062c 0%, #1e3a8a 100%)" }}>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
              <h3 className="relative text-[14px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-1">
                Quick Links
              </h3>
              <p className="relative text-[12px] text-blue-200 mb-5">
                Everything you need to get started
              </p>
              <ul className="relative space-y-2">
                {QUICK_LINKS.map((link) => (
                  <QuickLinkItem key={link.to} {...link} />
                ))}
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg mb-4">
                <MdLightbulb size={26} />
              </div>
              <h4 className="text-[15px] font-bold text-[#02062c] mb-1">Need Help?</h4>
              <p className="text-[13px] text-zinc-500 mb-4 leading-relaxed">
                Our team is ready to assist with any exhibitor enquiries.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#02062c] hover:bg-[#0a1450] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg transition-colors">
                Contact Us <MdArrowOutward size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}