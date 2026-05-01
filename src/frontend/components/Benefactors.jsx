import React, { useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

/* ─────────────────────────────────────────
   Add to index.html:
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
───────────────────────────────────────── */

// ── Tier config — controls badge color, size, label ──
const TIER_CONFIG = {
  Platinum: {
    label: "Platinum Sponsor",
    badgeBg: "bg-[#e8e8f0]",
    badgeText: "text-[#5b5b8a]",
    badgeBorder: "border-[#c8c8e8]",
    ringColor: "ring-[#c8c8e8]",
    dotColor: "bg-[#9898c8]",
    accentBar: "from-[#b8b8d8] via-[#dcdcf0] to-[#b8b8d8]",
    imgSize: "max-h-36 sm:max-h-44",
    cardPad: "p-8 sm:p-12",
    titleSize: "text-xs sm:text-sm",
    glow: "shadow-[0_0_40px_rgba(180,180,220,0.25)]",
    crown: true,
  },
  Gold: {
    label: "Gold Sponsor",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    ringColor: "ring-amber-200",
    dotColor: "bg-amber-400",
    accentBar: "from-amber-300 via-yellow-200 to-amber-300",
    imgSize: "max-h-28 sm:max-h-36",
    cardPad: "p-6 sm:p-10",
    titleSize: "text-xs sm:text-sm",
    glow: "shadow-[0_0_32px_rgba(251,191,36,0.18)]",
    crown: false,
  },
  Silver: {
    label: "Silver Sponsor",
    badgeBg: "bg-gray-50",
    badgeText: "text-gray-600",
    badgeBorder: "border-gray-200",
    ringColor: "ring-gray-200",
    dotColor: "bg-gray-400",
    accentBar: "from-gray-300 via-gray-100 to-gray-300",
    imgSize: "max-h-24 sm:max-h-28",
    cardPad: "p-6 sm:p-8",
    titleSize: "text-xs",
    glow: "shadow-[0_0_24px_rgba(160,160,160,0.12)]",
    crown: false,
  },
  Media: {
    label: "Media Partner",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    badgeBorder: "border-blue-100",
    ringColor: "ring-blue-100",
    dotColor: "bg-blue-400",
    accentBar: "from-blue-200 via-blue-50 to-blue-200",
    imgSize: "max-h-20 sm:max-h-24",
    cardPad: "p-5 sm:p-7",
    titleSize: "text-xs",
    glow: "shadow-sm",
    crown: false,
  },
  Foreign: {
    label: "Foreign Partner",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-100",
    ringColor: "ring-emerald-100",
    dotColor: "bg-emerald-400",
    accentBar: "from-emerald-200 via-emerald-50 to-emerald-200",
    imgSize: "max-h-20 sm:max-h-24",
    cardPad: "p-5 sm:p-7",
    titleSize: "text-xs",
    glow: "shadow-sm",
    crown: false,
  },
  Organisers: {
    label: "Organised By",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-600",
    badgeBorder: "border-rose-100",
    ringColor: "ring-rose-100",
    dotColor: "bg-rose-400",
    accentBar: "from-rose-200 via-rose-50 to-rose-200",
    imgSize: "max-h-20 sm:max-h-24",
    cardPad: "p-5 sm:p-7",
    titleSize: "text-xs",
    glow: "shadow-sm",
    crown: false,
  },
  Memberof: {
    label: "Member Of",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-600",
    badgeBorder: "border-violet-100",
    ringColor: "ring-violet-100",
    dotColor: "bg-violet-400",
    accentBar: "from-violet-200 via-violet-50 to-violet-200",
    imgSize: "max-h-20 sm:max-h-24",
    cardPad: "p-5 sm:p-7",
    titleSize: "text-xs",
    glow: "shadow-sm",
    crown: false,
  },
};

// ── Crown SVG for Platinum ──
const CrownIcon = () => (
  <svg className="w-5 h-5 text-[#9898c8]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 19h20v2H2v-2zm2-3l3-7 5 4 4-6 3 4V16H4zm8-6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
  </svg>
);

// ── Single sponsor card ──
const SponsorCard = ({ sponsor, tier, index, wide = false }) => {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG["Media"];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`
        relative bg-white border border-gray-100 rounded-2xl overflow-hidden
        ring-1 ${cfg.ringColor} ${cfg.glow}
        hover:scale-[1.02] hover:shadow-xl transition-all duration-300
        flex flex-col items-center justify-center
        ${cfg.cardPad}
        ${wide ? "col-span-full sm:col-span-1" : ""}
      `}
      style={{ animation: `fadeUp 0.5s ease both`, animationDelay: `${index * 80}ms` }}
    >
      {/* Top accent gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.accentBar}`} />

      {/* Crown badge (Platinum only) */}
      {cfg.crown && (
        <div className="absolute top-4 left-4">
          <CrownIcon />
        </div>
      )}

      {/* Tier badge */}
      <div className={`
        absolute top-4 right-4
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border
        ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}
      `}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
        <span className={`font-semibold uppercase tracking-widest ${cfg.titleSize}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {cfg.label}
        </span>
      </div>

      {/* Logo image */}
      <div className="flex items-center justify-center w-full mt-6 mb-4">
        {!imgError ? (
          <img
            src={`https://inoptics.in/api/${sponsor.image_path}`}
            alt={sponsor.name}
            className={`object-contain w-auto ${cfg.imgSize} transition-all duration-300`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
            </svg>
            <span className="text-xs text-gray-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>Image unavailable</span>
          </div>
        )}
      </div>

      {/* Sponsor name */}
      <p
        className="text-center text-sm font-semibold text-gray-700 mt-1 leading-snug"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {sponsor.name}
      </p>
    </div>
  );
};

// ── Section divider with label ──
const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-4 my-10" style={{ animation: "fadeUp 0.4s ease both" }}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
    <span
      className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 px-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {label}
    </span>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
  </div>
);

// ── Skeleton ──
const SkeletonCard = ({ tall = false }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl animate-pulse ${tall ? "p-10" : "p-6"}`}>
    <div className="flex justify-end mb-6">
      <div className="h-5 w-24 bg-gray-100 rounded-full" />
    </div>
    <div className={`mx-auto bg-gray-200 rounded-lg ${tall ? "h-32 w-48" : "h-20 w-36"}`} />
    <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto mt-5" />
  </div>
);

// ── Empty state ──
const EmptyState = ({ onRetry, isError }) => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${isError ? "bg-red-50" : "bg-gray-100"}`}>
      <svg className={`w-8 h-8 ${isError ? "text-red-300" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {isError
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        }
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      {isError ? "Failed to Load" : "No Sponsors Yet"}
    </h3>
    <p className="text-sm text-gray-400 mb-6 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {isError ? "Could not fetch sponsor data. Please try again." : "Benefactor information will appear here once published."}
    </p>
    {isError && (
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
    )}
  </div>
);

// ── Main component ──
const Benefactors = () => {
  const [sponsorImages, setSponsorImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSponsors = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://inoptics.in/api/get_sponsor_images_list.php");
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setSponsorImages(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors(); }, []);

  // helper: find sponsor by type (case-insensitive)
  const get = (type) =>
    sponsorImages.find(s => s.sponsor_type?.toLowerCase() === type.toLowerCase());

  const platinum   = get("Platinum");
  const gold       = get("Gold");
  const silver     = get("Silver");
  const media      = get("Media");
  const foreign    = get("Foreign");
  const organisers = get("Organisers");
  const memberof   = get("Memberof");

  const hasAny = platinum || gold || silver || media || foreign || organisers || memberof;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f9f9f8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* ── Page header ── */}
          <div className="mb-12" style={{ animation: "fadeUp 0.4s ease both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                InOptics 2026
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-normal text-gray-950 leading-tight mb-3"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Our <em>Benefactors</em>
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-10 h-px bg-gray-300" />
              <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Proud supporters of InOptics 2026
              </p>
            </div>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="space-y-6">
              <SkeletonCard tall />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SkeletonCard /><SkeletonCard />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : error ? (
            <EmptyState isError onRetry={fetchSponsors} />
          ) : !hasAny ? (
            <EmptyState />
          ) : (
            <div>

              {/* ── PLATINUM ── */}
              {platinum && (
                <>
                  <SectionDivider label="Title Sponsor" />
                  <div className="grid grid-cols-1 max-w-lg mx-auto">
                    <SponsorCard sponsor={platinum} tier="Platinum" index={0} />
                  </div>
                </>
              )}

              {/* ── GOLD ── */}
              {gold && (
                <>
                  <SectionDivider label="Gold Sponsor" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                    <SponsorCard sponsor={gold} tier="Gold" index={0} wide />
                  </div>
                </>
              )}

              {/* ── SILVER ── */}
              {silver && (
                <>
                  <SectionDivider label="Silver Sponsor" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <SponsorCard sponsor={silver} tier="Silver" index={0} />
                  </div>
                </>
              )}

              {/* ── MEDIA + FOREIGN ── */}
              {(media || foreign) && (
                <>
                  <SectionDivider label="Partners" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {media   && <SponsorCard sponsor={media}   tier="Media"   index={0} />}
                    {foreign && <SponsorCard sponsor={foreign} tier="Foreign" index={1} />}
                  </div>
                </>
              )}

              {/* ── ORGANISERS + MEMBER OF ── */}
              {(organisers || memberof) && (
                <>
                  <SectionDivider label="Association" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {organisers && <SponsorCard sponsor={organisers} tier="Organisers" index={0} />}
                    {memberof   && <SponsorCard sponsor={memberof}   tier="Memberof"   index={1} />}
                  </div>
                </>
              )}

              {/* ── Footer CTA ── */}
              <div
                className="mt-16 text-center py-10 border-t border-gray-100"
                style={{ animation: "fadeUp 0.5s ease 0.4s both" }}
              >
                <p
                  className="text-sm text-gray-400 mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Interested in sponsoring InOptics 2026?
                </p>
                <a
                  href="mailto:sponsor@inoptics.in"
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Become a Sponsor
                </a>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Benefactors;