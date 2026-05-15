import React, { useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

const TIER_CONFIG = {
  Platinum: {
    label: "Title Sponsor",
    dot: "bg-violet-500",
    chipBg: "bg-violet-50",
    chipText: "text-violet-700",
    chipBorder: "border-violet-200",
    ring: "hover:ring-violet-300",
    bar: "bg-violet-500",
    grid: "grid-cols-1",
    wrap: "max-w-sm mx-auto",
    imgH: "h-28 sm:h-32",
  },
  Gold: {
    label: "Gold Sponsor",
    dot: "bg-amber-500",
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
    chipBorder: "border-amber-200",
    ring: "hover:ring-amber-300",
    bar: "bg-amber-500",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-20 sm:h-24",
  },
  Silver: {
    label: "Silver Sponsor",
    dot: "bg-zinc-400",
    chipBg: "bg-zinc-50",
    chipText: "text-zinc-700",
    chipBorder: "border-zinc-200",
    ring: "hover:ring-zinc-300",
    bar: "bg-zinc-400",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-16 sm:h-20",
  },
  Media: {
    label: "Media Partner",
    dot: "bg-blue-500",
    chipBg: "bg-blue-50",
    chipText: "text-blue-700",
    chipBorder: "border-blue-200",
    ring: "hover:ring-blue-300",
    bar: "bg-blue-500",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-16 sm:h-20",
  },
  Foreign: {
    label: "Foreign Partner",
    dot: "bg-emerald-500",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
    chipBorder: "border-emerald-200",
    ring: "hover:ring-emerald-300",
    bar: "bg-emerald-500",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-16 sm:h-20",
  },
  Organisers: {
    label: "Organised By",
    dot: "bg-rose-500",
    chipBg: "bg-rose-50",
    chipText: "text-rose-700",
    chipBorder: "border-rose-200",
    ring: "hover:ring-rose-300",
    bar: "bg-rose-500",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-16 sm:h-20",
  },
  Memberof: {
    label: "Member Of",
    dot: "bg-purple-500",
    chipBg: "bg-purple-50",
    chipText: "text-purple-700",
    chipBorder: "border-purple-200",
    ring: "hover:ring-purple-300",
    bar: "bg-purple-500",
    grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    wrap: "",
    imgH: "h-16 sm:h-20",
  },
};

const TIER_ORDER = ["Platinum", "Gold", "Silver", "Media", "Foreign"];

const SponsorCard = ({ sponsor, tier }) => {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.Media;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col items-center justify-between p-4 sm:p-5 ring-1 ring-transparent ${cfg.ring} hover:-translate-y-1 hover:shadow-lg shadow-sm transition-all duration-300`}
    >
      <span className={`absolute top-0 inset-x-0 h-0.5 ${cfg.bar} group-hover:h-1 transition-all`} />

      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${cfg.chipBg} ${cfg.chipBorder} self-start mb-4`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${cfg.chipText}`}>
          {sponsor.name} || {cfg.label}
        </span>
      </div>

      <div className={`flex items-center justify-center w-full flex-1 ${cfg.imgH} py-1`}>
        {!imgError ? (
          <img
            src={`https://inoptics.in/api/${sponsor.image_path}`}
            alt={sponsor.name}
            onError={() => setImgError(true)}
            className="object-contain w-full h-full grayscale-15 group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M3 9l4.5 4.5L12 9l4.5 6L21 9" />
            </svg>
          </div>
        )}
      </div>

      
    </div>
  );
};

const TierSection = ({ tier, sponsors }) => {
  const cfg = TIER_CONFIG[tier];
  if (!cfg || !sponsors.length) return null;

  return (
    <section className="mb-12 sm:mb-14">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 h-px bg-zinc-200" />
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} opacity-70`} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            {cfg.label}
          </span>
          <span className="text-[11px] font-semibold text-zinc-300">· {sponsors.length}</span>
        </div>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      <div className={`grid gap-4 sm:gap-5 ${cfg.grid} ${cfg.wrap}`}>
        {sponsors.map((s, i) => (
          <SponsorCard key={s.id || i} sponsor={s} tier={tier} />
        ))}
      </div>
    </section>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-zinc-200 p-6 animate-pulse min-h-[160px]">
    <div className="h-5 w-20 bg-zinc-100 rounded-full mb-4" />
    <div className="h-16 bg-zinc-50 rounded-lg mb-3" />
    <div className="h-2.5 w-3/5 bg-zinc-100 rounded-full mx-auto" />
  </div>
);

const EmptyState = ({ onRetry, isError }) => (
  <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center px-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isError ? "bg-rose-50" : "bg-zinc-100"}`}>
      <svg className={`w-6 h-6 ${isError ? "text-rose-400" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {isError ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" />
        )}
      </svg>
    </div>
    <h3 className="text-xl font-light text-zinc-900 mb-2">
      {isError ? "Failed to Load" : "No Sponsors Yet"}
    </h3>
    <p className="text-[13px] text-zinc-400 max-w-xs mb-6 leading-relaxed">
      {isError
        ? "Could not fetch sponsor data. Please try again."
        : "Sponsor information will appear here once published."}
    </p>
    {isError && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    )}
  </div>
);

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

  useEffect(() => {
    fetchSponsors();
  }, []);

  const TIER_MATCHERS = {
    Platinum:   (t) => t === "platinum" || t === "title" || t === "diamond",
    Gold:       (t) => t === "gold" || t === "co-title",
    Silver:     (t) => t === "silver" || t === "bronze" || t === "associate" || t === "supporting",
    Media:      (t) => t.includes("media"),
    Foreign:    (t) => t.includes("foreign") || t.includes("knowledge") || t.includes("technology") || t.includes("hospitality") || t.includes("logistics") || t.includes("exhibition"),
    Organisers: (t) => t.includes("organis") || t.includes("organiz"),
    Memberof:   (t) => t.includes("member"),
  };

  const getAll = (tier) => {
    const matcher = TIER_MATCHERS[tier];
    if (!matcher) return [];
    return sponsorImages.filter((s) => {
      const tokens = String(s.sponsor_type || "")
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return tokens.some((t) => matcher(t));
    });
  };

  const tierData = TIER_ORDER.map((tier) => ({ tier, sponsors: getAll(tier) }));

  // "Other" type sponsors whose image filename mentions gold/silver — show only on mobile
  const mobileOnlyOthers = sponsorImages.filter((s) => {
    const tokens = String(s.sponsor_type || "").toLowerCase().split(",").map(t => t.trim());
    if (!tokens.includes("other")) return false;
    const path = (s.image_path || "").toLowerCase();
    return /gold|silver/.test(path);
  });

  const hasAny =
    tierData.some((t) => t.sponsors.length > 0) ||
    mobileOnlyOthers.length > 0 ||
    getAll("Organisers").length > 0 ||
    getAll("Memberof").length > 0;
  const totalCount = sponsorImages.length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="mb-5 sm:mb-6">
          <Breadcrumbs />
        </div>

        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="w-7 h-px bg-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              InOptics 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-zinc-900 leading-tight tracking-tight mb-3 sm:mb-4">
            Our <span className="italic font-normal">Benefactors</span>
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] sm:text-[14px] text-zinc-400">
            <p>Proud supporters of InOptics 2026</p>
            {!loading && !error && totalCount > 0 && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="font-medium text-zinc-600">
                  {totalCount} {totalCount === 1 ? "partner" : "partners"}
                </span>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 max-w-sm mx-auto w-full gap-4">
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : error ? (
          <EmptyState isError onRetry={fetchSponsors} />
        ) : !hasAny ? (
          <EmptyState />
        ) : (
          <>
            {tierData.map(({ tier, sponsors }) =>
              sponsors.length > 0 ? (
                <TierSection key={tier} tier={tier} sponsors={sponsors} />
              ) : null
            )}

            {mobileOnlyOthers.length > 0 && (
              <div className="md:hidden">
                <TierSection tier="Silver" sponsors={mobileOnlyOthers} />
              </div>
            )}

            {(getAll("Organisers").length > 0 || getAll("Memberof").length > 0) && (
              <section className="mb-12 sm:mb-14">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    Organised By &amp; Member Of
                  </span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>
                <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {getAll("Organisers").map((s, i) => (
                    <SponsorCard key={`org-${s.id || i}`} sponsor={s} tier="Organisers" />
                  ))}
                  {getAll("Memberof").map((s, i) => (
                    <SponsorCard key={`mem-${s.id || i}`} sponsor={s} tier="Memberof" />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-zinc-200 text-center">
              <p className="text-[13px] text-zinc-400 mb-5">
                Interested in sponsoring InOptics 2027?
              </p>
              <a
                href="mailto:sponsor@inoptics.in"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-700 text-white text-[13px] font-medium rounded-xl transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Become a Sponsor
              </a>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Benefactors;
