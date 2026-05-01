import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/* ─────────────────────────────────────────
   Add to index.html:
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
───────────────────────────────────────── */

// ── Skeleton loaders ──
const SkeletonHero = () => (
  <div className="animate-pulse mb-12">
    <div className="h-8 bg-gray-200 rounded-full w-2/3 mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded-full w-full" />
      <div className="h-4 bg-gray-100 rounded-full w-5/6" />
      <div className="h-4 bg-gray-100 rounded-full w-4/5" />
    </div>
  </div>
);

const SkeletonCard = ({ reverse }) => (
  <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-10 animate-pulse`}>
    <div className="flex-1 space-y-3 py-2">
      <div className="h-4 bg-gray-200 rounded-full w-full" />
      <div className="h-4 bg-gray-200 rounded-full w-5/6" />
      <div className="h-4 bg-gray-100 rounded-full w-4/6" />
      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
      <div className="h-4 bg-gray-100 rounded-full w-2/3" />
    </div>
    <div className="flex-1">
      <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
    </div>
  </div>
);

// ── Travel card (text + image alternating layout) ──
const TravelCard = ({ card, index }) => {
  const isReverse = card.position?.toLowerCase() === "left";
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Transport mode icon based on card description heuristic
  const icons = [
    // Airplane
    <svg key="air" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>,
    // Train
    <svg key="train" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>,
    // Car/Road
    <svg key="car" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>,
    // Metro/Bus
    <svg key="metro" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>,
  ];

  const icon = icons[index % icons.length];

  return (
    <div
      className="group"
      style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${index * 100}ms` }}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-100 to-transparent" />
      </div>

      {/* Content row */}
      <div className={`flex flex-col ${isReverse ? "md:flex-row-reverse" : "md:flex-row"} gap-6 md:gap-10 items-start`}>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="travel-prose text-gray-600 text-[15px] leading-relaxed
              [&_p]:mb-3 [&_p:last-child]:mb-0
              [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-800 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2
              [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:mb-3
              [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
              [&_ul_li]:before:content-['›'] [&_ul_li]:before:text-amber-400 [&_ul_li]:before:font-bold [&_ul_li]:before:flex-shrink-0 [&_ul_li]:before:mt-0.5
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li]:mb-1
              [&_strong]:font-semibold [&_strong]:text-gray-800
              [&_a]:text-amber-600 [&_a]:underline [&_a]:underline-offset-2
              [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:mb-3
              [&_th]:bg-gray-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-gray-200
              [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-gray-100"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        </div>

        {/* Image */}
        <div className="flex-1 w-full md:max-w-[48%]">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] shadow-sm group-hover:shadow-md transition-shadow duration-300">
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {!imgError ? (
              <img
                src={card.image}
                alt={`Travel info ${index + 1}`}
                className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgError(true); setImgLoaded(true); }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                </svg>
                <span className="text-xs text-gray-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>Image unavailable</span>
              </div>
            )}

            {/* Bottom image label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                How to Reach · Step {index + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Error state ──
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      Failed to Load
    </h3>
    <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      Could not fetch travel information. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Try Again
    </button>
  </div>
);

// ── Map CTA banner ──
const MapBanner = () => (
  <div
    className="mt-14 rounded-2xl bg-gray-950 overflow-hidden relative"
    style={{ animation: "fadeUp 0.5s ease 0.5s both" }}
  >
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "28px 28px",
      }}
    />
    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-7 sm:p-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span
            className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Venue Location
          </span>
        </div>
        <h3
          className="text-2xl font-normal text-white mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          View on <em>Google Maps</em>
        </h3>
        <p className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Get turn-by-turn directions to the InOptics 2026 venue
        </p>
      </div>
      <a
        href="https://maps.google.com/?q=InOptics+2026"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 inline-flex items-center gap-2.5 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-400/30"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        Open Maps
      </a>
    </div>
  </div>
);

// ── Quick stats strip ──
const StatsStrip = () => (
  <div
    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
    style={{ animation: "fadeUp 0.45s ease 0.15s both" }}
  >
    {[
      { icon: "✈️", label: "Nearest Airport", value: "~30 min" },
      { icon: "🚆", label: "Railway Station", value: "~15 min" },
      { icon: "🚌", label: "Metro / Bus", value: "~10 min" },
      { icon: "🅿️", label: "Free Parking", value: "Available" },
    ].map((stat, i) => (
      <div
        key={i}
        className="bg-white border border-gray-100 rounded-xl px-4 py-4 text-center shadow-sm"
        style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60 + 100}ms` }}
      >
        <div className="text-2xl mb-1">{stat.icon}</div>
        <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {stat.value}
        </div>
        <div className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {stat.label}
        </div>
      </div>
    ))}
  </div>
);

// ── Main component ──
const TravelInfo = () => {
  const [travelMain, setTravelMain]   = useState({});
  const [travelCards, setTravelCards] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [errorMain, setErrorMain]     = useState(false);
  const [errorCards, setErrorCards]   = useState(false);

  const location = useLocation();
  const queryParams   = new URLSearchParams(location.search);
  const fromExhibitor = queryParams.get("from") === "exhibitor";

  useEffect(() => {
    fetchTravelMain();
    fetchTravelCards();
  }, []);

  const fetchTravelMain = async () => {
    setLoadingMain(true);
    setErrorMain(false);
    try {
      const res  = await fetch("https://inoptics.in/api/get_reach_main.php");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTravelMain(data || {});
    } catch {
      setErrorMain(true);
    } finally {
      setLoadingMain(false);
    }
  };

  const fetchTravelCards = async () => {
    setLoadingCards(true);
    setErrorCards(false);
    try {
      const res  = await fetch("https://inoptics.in/api/get_reach_cards.php");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTravelCards(Array.isArray(data) ? data : []);
    } catch {
      setErrorCards(true);
    } finally {
      setLoadingCards(false);
    }
  };

  const retryAll = () => {
    fetchTravelMain();
    fetchTravelCards();
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f9f9f8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* ── Exhibitor notice banner ── */}
          {fromExhibitor && (
            <div
              className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4"
              style={{ animation: "fadeUp 0.35s ease both" }}
            >
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-sm text-amber-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                You've been redirected from the <strong>Exhibitor Portal</strong>. Here's how to reach the InOptics 2026 venue.
              </p>
            </div>
          )}

          {/* ── Page header ── */}
          <div className="mb-10" style={{ animation: "fadeUp 0.4s ease both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                InOptics 2026
              </span>
            </div>

            {loadingMain ? (
              <SkeletonHero />
            ) : errorMain ? (
              <div>
                <h1
                  className="text-4xl sm:text-5xl font-normal text-gray-950 leading-tight mb-3"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  How to <em>Reach Us</em>
                </h1>
                <p className="text-sm text-red-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Could not load description.
                  <button onClick={fetchTravelMain} className="underline ml-1 hover:text-red-600">Retry</button>
                </p>
              </div>
            ) : (
              <>
                <h1
                  className="text-4xl sm:text-5xl font-normal text-gray-950 leading-tight mb-4"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  dangerouslySetInnerHTML={{ __html: travelMain.title || "How to <em>Reach Us</em>" }}
                />
                {travelMain.text && (
                  <div
                    className="text-gray-500 text-base leading-relaxed max-w-2xl
                      [&_p]:mb-2 [&_a]:text-amber-600 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-gray-700"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: travelMain.text }}
                  />
                )}
              </>
            )}
          </div>

          {/* ── Quick stats ── */}
          {!loadingMain && !errorMain && <StatsStrip />}

          {/* ── Section label ── */}
          {!loadingCards && travelCards.length > 0 && (
            <div className="flex items-center gap-4 mb-10" style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600 px-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Ways to Reach
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-amber-200 to-transparent" />
            </div>
          )}

          {/* ── Travel cards ── */}
          {loadingCards ? (
            <div className="space-y-14">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} reverse={i % 2 !== 0} />
              ))}
            </div>
          ) : errorCards ? (
            <ErrorState onRetry={retryAll} />
          ) : travelCards.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No travel information available at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {travelCards.map((card, idx) => (
                <TravelCard key={card.id || idx} card={card} index={idx} />
              ))}
            </div>
          )}

          {/* ── Map CTA ── */}
          {!loadingCards && !errorCards && travelCards.length > 0 && <MapBanner />}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TravelInfo;