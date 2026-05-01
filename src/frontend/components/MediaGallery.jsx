import React, { useEffect, useState, useCallback } from "react";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/* ─────────────────────────────────────────
   Add to index.html:
   <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
───────────────────────────────────────── */

// ── Skeleton loaders ──
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse shadow-sm">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
    </div>
  </div>
);

const SkeletonThumb = () => (
  <div className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
);

// ── Gallery cover card ──
const GalleryCard = ({ title, images, index, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
      style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${index * 70}ms` }}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] overflow-hidden relative bg-gray-100">
        {!imgError ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Count badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {images.length} photos
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-gray-900 font-semibold text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </p>
      </div>
    </button>
  );
};

// ── Thumbnail in gallery view ──
const GalleryThumb = ({ src, alt, index, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group aspect-square rounded-xl overflow-hidden bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
      style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 40}ms` }}
      aria-label={`Open image ${index + 1}`}
    >
      {!loaded && !error && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
          </svg>
        </div>
      )}
      {/* Hover zoom icon */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803zM10.5 7.5v6m3-3h-6" />
        </svg>
      </div>
    </button>
  );
};

// ── Lightbox modal ──
const Modal = ({ images, currentIndex, onClose, onNext, onPrev, galleryTitle }) => {
  if (currentIndex === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Image */}
      <div
        className="relative max-w-5xl w-full mx-16 sm:mx-24 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${galleryTitle} ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
          style={{ animation: "scaleIn 0.2s ease" }}
          draggable={false}
        />
        {/* Caption */}
        <p
          className="mt-4 text-white/50 text-xs text-center"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {galleryTitle} — Photo {currentIndex + 1}
        </p>

        {/* Thumbnail strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto max-w-full pb-1 px-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { /* handled via parent */ onPrev(); onNext(); /* trick to re-render */ }}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex ? "border-amber-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

// ── Empty state ──
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-28 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      No Galleries Yet
    </h3>
    <p className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      Media gallery content will appear here once uploaded.
    </p>
  </div>
);

// ── Error state ──
const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-28 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
      Failed to Load Gallery
    </h3>
    <p className="text-sm text-gray-400 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      Something went wrong. Please try again.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Retry
    </button>
  </div>
);

// ── Main component ──
const MediaGallery = () => {
  const [galleries, setGalleries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeGallery, setActiveGallery] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://inoptics.in/api/get_mediagallery_details.php");
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      if (Array.isArray(data)) {
        const grouped = data.reduce((acc, item) => {
          const key = item.heading || "Untitled";
          if (!acc[key]) acc[key] = [];
          acc[key].push(`https://inoptics.in/api/uploads/${item.image}`);
          return acc;
        }, {});
        setGalleries(grouped);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = modalIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalIndex]);

  // Keyboard nav
  const handleKey = useCallback((e) => {
    if (modalIndex === null || !activeGallery) return;
    const imgs = galleries[activeGallery] || [];
    if (e.key === "ArrowRight") setModalIndex(i => (i + 1) % imgs.length);
    else if (e.key === "ArrowLeft") setModalIndex(i => (i - 1 + imgs.length) % imgs.length);
    else if (e.key === "Escape") setModalIndex(null);
  }, [modalIndex, activeGallery, galleries]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Filtered cards
  const cards = Object.entries(galleries).filter(([title]) =>
    title.toLowerCase().includes(search.toLowerCase())
  );

  const activeImages = activeGallery ? galleries[activeGallery] || [] : [];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="min-h-screen bg-[#f9f9f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* ── Page header ── */}
          {!activeGallery && (
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
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                <div>
                  <h1
                    className="text-4xl sm:text-5xl font-normal text-gray-950 leading-tight mb-3"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Media <em>Gallery</em>
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-px bg-gray-300" />
                    <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {loading ? "Loading galleries…" : `${Object.keys(galleries).length} galleries`}
                    </p>
                  </div>
                </div>

                {/* Search */}
                {!loading && !error && Object.keys(galleries).length > 0 && (
                  <div className="relative w-full sm:w-64" style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search galleries…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Gallery view header ── */}
          {activeGallery && (
            <div
              className="flex items-center justify-between mb-8 flex-wrap gap-4"
              style={{ animation: "fadeUp 0.35s ease both" }}
            >
              <div>
                <button
                  onClick={() => { setActiveGallery(null); setModalIndex(null); }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors group"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <svg
                    className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Galleries
                </button>
                <h2
                  className="text-3xl sm:text-4xl font-normal text-gray-950"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {activeGallery}
                </h2>
                <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {activeImages.length} {activeImages.length === 1 ? "photo" : "photos"} · Click to enlarge
                </p>
              </div>

              {/* Keyboard hint */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">←</kbd>
                <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">→</kbd>
                <span className="ml-1">Navigate</span>
                <span className="mx-1 text-gray-200">|</span>
                <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">Esc</kbd>
                <span className="ml-1">Close</span>
              </div>
            </div>
          )}

          {/* ── Content ── */}
          {loading ? (
            activeGallery ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => <SkeletonThumb key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState onRetry={fetchData} />
          ) : !activeGallery ? (
            cards.length === 0 ? (
              search ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    No galleries match "<span className="font-medium text-gray-600">{search}</span>"
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-3 text-amber-600 text-sm hover:underline"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <EmptyState />
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {cards.map(([title, images], idx) => (
                  <GalleryCard
                    key={title}
                    title={title}
                    images={images}
                    index={idx}
                    onClick={() => {
                      setActiveGallery(title);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>
            )
          ) : (
            /* Thumbnail grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {activeImages.map((img, idx) => (
                <GalleryThumb
                  key={idx}
                  src={img}
                  alt={`${activeGallery} photo ${idx + 1}`}
                  index={idx}
                  onClick={() => setModalIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Lightbox */}
      <Modal
        images={activeImages}
        currentIndex={modalIndex}
        galleryTitle={activeGallery}
        onClose={() => setModalIndex(null)}
        onNext={() => setModalIndex(i => (i + 1) % activeImages.length)}
        onPrev={() => setModalIndex(i => (i - 1 + activeImages.length) % activeImages.length)}
      />
    </>
  );
};

export default MediaGallery;