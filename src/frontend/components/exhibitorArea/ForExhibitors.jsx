import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaWarehouse, FaTags, FaEye } from "react-icons/fa";
import {
  MdArrowOutward, MdLogin, MdHowToReg, MdLightbulb, MdCheckCircle,
} from "react-icons/md";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";

const COUNTERS = [
  { Icon: FaUsers,     end: 349,   suffix: "",  label: "Exhibitors",          tint: "from-blue-500 to-cyan-500"   },
  { Icon: FaWarehouse, end: 24000, suffix: "",  label: "Exhibition Area (sqm)", tint: "from-emerald-500 to-teal-500" },
  { Icon: FaTags,      end: 1500,  suffix: "+", label: "Brands",              tint: "from-purple-500 to-pink-500"  },
  { Icon: FaEye,       end: 20000, suffix: "+", label: "Visitors",            tint: "from-amber-500 to-orange-500" },
];

const QUICK_LINKS = [
  { to: "/why-exhibit",      label: "Why Exhibit",         desc: "Discover the value of being an InOptics exhibitor", Icon: MdLightbulb },
  { to: "/become-exhibitor", label: "Become an Exhibitor", desc: "Apply now and reserve your stall",                  Icon: MdHowToReg  },
  { to: "/exhibitor-login",  label: "Exhibitor Login",     desc: "Access your exhibitor dashboard",                   Icon: MdLogin     },
];

export default function ForExhibitors() {
  const [exhibitorsMain,  setExhibitorsMain]  = useState({});
  const [exhibitorsCards, setExhibitorsCards] = useState([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitors_main.php");
        const d = await r.json();
        setExhibitorsMain(Array.isArray(d) ? d[0] : d || {});
      } catch (e) { console.error("Exhibitors Main fetch failed", e); }
    })();
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitors_cards.php");
        const d = await r.json();
        setExhibitorsCards(Array.isArray(d) ? d : []);
      } catch (e) { console.error("Exhibitors Cards fetch failed", e); }
    })();
  }, []);

  /* only show cards whose status is active */
  const isActive = (c) => {
    const v = c?.status ?? c?.active ?? c?.is_active;
    if (v === undefined || v === null) return false;
    const s = String(v).toLowerCase();
    return s === "1" || s === "true" || s === "active" || s === "yes";
  };
  const activeCards = exhibitorsCards.filter(isActive);

  /* card with id="2" rendered separately on the left side */
  const featuredCard = activeCards.find((c) => String(c.id) === "2");
  const otherCards   = activeCards.filter((c) => String(c.id) !== "2");

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-[Quicksand,sans-serif]">
      <Breadcrumbs />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 lg:py-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              For Exhibitors
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif] leading-tight max-w-3xl
              [&_em]:bg-gradient-to-r [&_em]:from-amber-300 [&_em]:to-pink-300 [&_em]:bg-clip-text [&_em]:text-transparent [&_em]:not-italic [&_em]:font-light"
            dangerouslySetInnerHTML={{ __html: exhibitorsMain?.header || "Showcase your brand at <em>InOptics 2026</em>" }}
          />
          <div
            className="mt-5 text-[14px] sm:text-[16px] text-blue-200 leading-relaxed max-w-2xl
              [&_p]:mb-2 [&_a]:text-amber-300 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-white
              [&_strong]:font-bold [&_strong]:text-white"
            dangerouslySetInnerHTML={{
              __html: exhibitorsMain?.text ||
                "This section provides essential resources and guidelines for exhibitors at In-Optics.",
            }}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/become-exhibitor"
              className="group inline-flex items-center gap-2 px-6 h-12 bg-amber-400 hover:bg-amber-300 text-[#02062c] text-[13px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all"
            >
              Become an Exhibitor
              <MdArrowOutward size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              to="/exhibitor-login"
              className="inline-flex items-center gap-2 px-6 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[13px] font-bold uppercase tracking-wider rounded-xl border border-white/20 transition-all"
            >
              <MdLogin size={16} /> Exhibitor Login
            </Link>
          </div>
        </div>
      </section>

      {/* ============ STATS (overlapping hero) ============ */}
      <section ref={ref} className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-10 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {COUNTERS.map(({ Icon, end, suffix, label, tint }, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl border border-zinc-100 shadow-lg p-4 sm:p-6 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all"
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} aria-hidden />
              <div className={`relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg mb-3`}>
                <Icon size={20} />
              </div>
              <h2 className="relative text-2xl sm:text-3xl lg:text-4xl text-[#02062c] font-bold tracking-tight font-[Montserrat,sans-serif] leading-tight">
                {inView ? (
                  <>
                    <CountUp end={end} duration={3} separator="," />
                    {suffix}
                  </>
                ) : "0"}
              </h2>
              <p className="relative text-[11px] sm:text-[12px] text-zinc-500 mt-1 font-bold uppercase tracking-widest">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-16 sm:mt-20 mb-16 sm:mb-24 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* LEFT: featured info card + other cards */}
          <div className="lg:col-span-8 space-y-6">
            {featuredCard && (
              <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl p-6 sm:p-8 overflow-hidden transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
                <h2
                  className="text-2xl sm:text-3xl font-light tracking-tight text-[#02062c] mb-4 font-[Playfair_Display,serif]
                    [&_strong]:font-bold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: featuredCard.title }}
                />
                <div
                  className="text-[14px] sm:text-[15px] text-zinc-700 leading-relaxed
                    [&_p]:mb-3 [&_p:last-child]:mb-0
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#02062c] [&_h2]:mb-2
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#02062c] [&_h3]:mb-2
                    [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:mb-3
                    [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
                    [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-blue-500 [&_ul_li]:before:font-bold [&_ul_li]:before:flex-shrink-0 [&_ul_li]:before:mt-0.5
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                    [&_strong]:font-bold [&_strong]:text-[#02062c]
                    [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-blue-800"
                  dangerouslySetInnerHTML={{ __html: featuredCard.description }}
                />
              </div>
            )}

            {/* other cards (if any beyond id=2) */}
            {otherCards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {otherCards.map((card) => (
                  <div
                    key={card.id}
                    className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl p-5 sm:p-6 overflow-hidden transition-all hover:-translate-y-0.5"
                  >
                    <MdCheckCircle size={20} className="text-emerald-00 mb-3" />
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

            {/* fallback when no cards loaded */}
            {!featuredCard && otherCards.length === 0 && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center text-zinc-400 animate-pulse">
                <div className="h-5 w-1/2 mx-auto bg-zinc-200 rounded mb-3" />
                <div className="h-3 w-3/4 mx-auto bg-zinc-100 rounded mb-2" />
                <div className="h-3 w-2/3 mx-auto bg-zinc-100 rounded" />
              </div>
            )}
          </div>

          {/* RIGHT: Quick links sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-[#02062c] to-[#1e3a8a] rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
              <h3 className="relative text-[14px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-1">
                Quick Links
              </h3>
              <p className="relative text-[12px] text-blue-200 mb-5">
                Everything you need to get started
              </p>

              <ul className="relative space-y-2">
                {QUICK_LINKS.map(({ to, label, desc, Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-[#02062c] transition-colors">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-white">{label}</p>
                        <p className="text-[11px] text-blue-200 truncate">{desc}</p>
                      </div>
                      <MdArrowOutward size={14} className="text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help card */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg mb-4">
                <MdLightbulb size={26} />
              </div>
              <h4 className="text-[15px] font-bold text-[#02062c] mb-1">Need Help?</h4>
              <p className="text-[13px] text-zinc-500 mb-4 leading-relaxed">
                Our team is ready to assist with any exhibitor enquiries.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#02062c] hover:bg-[#0a1450] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Contact Us
                <MdArrowOutward size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
