import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/* ─────────────────────────────────────────
   Add to your index.html / global CSS:
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
───────────────────────────────────────── */

// ── Skeleton card for loading state ──
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 animate-pulse shadow-sm">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="h-3 w-24 bg-gray-200 rounded-full" />
      <div className="h-3 w-16 bg-gray-100 rounded-full ml-auto" />
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-full" />
      <div className="h-4 bg-gray-200 rounded-full w-5/6" />
      <div className="h-4 bg-gray-100 rounded-full w-4/6" />
      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
    </div>
    <div className="mt-6 h-3 w-28 bg-gray-100 rounded-full" />
  </div>
);

// ── Individual press release card ──
const PressCard = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);

  // Strip HTML to get plain text for preview
  const plainText = item.description
    ? item.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const isLong = plainText.length > 300;
  const preview = isLong && !expanded ? plainText.slice(0, 300) + "…" : null;

  return (
    <article
      className="group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 80}ms`, animation: "fadeUp 0.5s ease both" }}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 md:p-8">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            {/* Index badge */}
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center text-xs font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Press Release
            </span>
          </div>

          {/* Official icon */}
          <div className="flex items-center gap-1.5 text-gray-400 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Official
          </div>
        </div>

        {/* Content */}
        <div
          className="press-release-body text-gray-600 text-[15px] leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
        >
          {isLong && !expanded ? (
            <p>{preview}</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: item.description || "No description available." }}
              className="[&_p]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-800 [&_a]:text-amber-600 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500"
            />
          )}
        </div>

        {/* Read more / less toggle */}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-amber-600 transition-colors duration-200 group/btn"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>{expanded ? "Show less" : "Read full release"}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : "group-hover/btn:translate-y-0.5"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={expanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        )}
      </div>

      {/* Share footer */}
      <div className="flex items-center justify-between px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          InOptics 2026
        </span>
        <div className="flex items-center gap-3">
          {/* Share icon */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "InOptics Press Release", text: plainText.slice(0, 120) });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          {/* Print icon */}
          <button onClick={() => window.print()} className="text-gray-400 hover:text-gray-700 transition-colors" title="Print">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

// ── Empty state ──
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      No Press Releases Yet
    </h3>
    <p className="text-sm text-gray-500 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      Press releases will appear here once they are published by the InOptics team.
    </p>
  </div>
);

// ── Error state ──
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      Failed to Load
    </h3>
    <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      Could not fetch press release data. Please try again.
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

// ── Main component ──
const PressRelease = () => {
  const [pressReleaseDetails, setPressReleaseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPressReleaseDetails();
  }, []);

  const fetchPressReleaseDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://inoptics.in/api/get_pressrelease_details.php");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setPressReleaseDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch Press Release Details", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media print {
          .no-print { display: none !important; }
          .press-release-body { color: #111 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#f9f9f8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          {/* Breadcrumbs */}
          <div className="no-print mb-6">
            <Breadcrumbs />
          </div>

          {/* ── Page header ── */}
          <div
            className="mb-10 md:mb-12"
            style={{ animation: "fadeUp 0.4s ease both" }}
          >
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Official Communications
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl font-normal text-gray-950 leading-tight mb-4"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Press <em>Releases</em>
            </h1>

            {/* Divider + sub */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200 max-w-[60px]" />
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Official announcements from InOptics 2026
              </p>
            </div>
          </div>

          {/* ── Content area ── */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <ErrorState onRetry={fetchPressReleaseDetails} />
          ) : pressReleaseDetails.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Count pill */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-sm text-gray-500 font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {pressReleaseDetails.length} release{pressReleaseDetails.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={() => window.print()}
                  className="no-print inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print all
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-6">
                {pressReleaseDetails.map((item, index) => (
                  <PressCard key={item.id || index} item={item} index={index} />
                ))}
              </div>

              {/* Bottom CTA */}
              <div
                className="mt-12 text-center"
                style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${pressReleaseDetails.length * 80 + 100}ms` }}
              >
                <p className="text-sm text-gray-400 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  For media enquiries, contact the InOptics press team
                </p>
                <a
                  href="mailto:press@inoptics.in"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-amber-600 border border-gray-200 hover:border-amber-300 bg-white rounded-xl px-5 py-2.5 shadow-sm transition-all duration-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  press@inoptics.in
                </a>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PressRelease;