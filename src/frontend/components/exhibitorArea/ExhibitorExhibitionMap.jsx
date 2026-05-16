import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MdMap, MdAdd, MdRemove, MdRefresh, MdDownload, MdImage,
  MdImageNotSupported, MdFullscreen, MdFullscreenExit, MdInfoOutline,
  MdOpenInNew, MdPanTool,
} from "react-icons/md";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

export default function ExhibitorExhibitionMap() {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);

  const [zoom,    setZoom]    = useState(1);
  const [offset,  setOffset]  = useState({ x: 0, y: 0 });
  const [isFs,    setIsFs]    = useState(false);

  const stageRef    = useRef(null);
  const imgRef      = useRef(null);
  const panState    = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const pinchState  = useRef({ active: false, startDist: 0, startZoom: 1 });

  /* ============ fetch ============ */
  const fetchExhibitionData = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const r = await fetch("https://inoptics.in/api/get_exhibition_map.php");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setExhibitionData(Array.isArray(d) ? d : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExhibitionData(); }, [fetchExhibitionData]);

  /* prefer first ACTIVE map; fall back to first row */
  const activeMap =
    exhibitionData.find((m) => {
      const s = String(m?.status ?? '').toLowerCase();
      return s === 'active' || s === '1' || s === 'true' || s === 'yes';
    }) || null;

  const firstRow = exhibitionData[0] || null;
  const isActive = !!activeMap;
  const imageUrl = activeMap?.image || null;

  /* ============ zoom ============ */
  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const zoomIn  = () => setZoom((z) => clampZoom(+(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => clampZoom(+(z - 0.25).toFixed(2)));
  const reset   = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  /* ============ pan (mouse) ============ */
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    panState.current = {
      active: true,
      startX: e.clientX, startY: e.clientY,
      baseX: offset.x,  baseY: offset.y,
    };
  };
  const onMouseMove = (e) => {
    if (!panState.current.active) return;
    setOffset({
      x: panState.current.baseX + (e.clientX - panState.current.startX),
      y: panState.current.baseY + (e.clientY - panState.current.startY),
    });
  };
  const onMouseUp = () => { panState.current.active = false; };

  /* ============ wheel zoom — native non-passive listener
     React's onWheel is passive by default, so e.preventDefault() inside
     a JSX handler fails silently. We attach a native listener with
     { passive: false } so the page doesn't scroll while zooming. ========= */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const handler = (e) => {
      // prevent page scroll over the map
      e.preventDefault();
      const zoomStep = 0.15;
      setZoom((prev) => clampZoom(prev + (e.deltaY < 0 ? zoomStep : -zoomStep)));
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [imageUrl]);

  /* ============ touch — pan + pinch ============ */
  const dist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchState.current = {
        active: true,
        startDist: dist(e.touches[0], e.touches[1]),
        startZoom: zoom,
      };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      panState.current = {
        active: true,
        startX: t.clientX, startY: t.clientY,
        baseX: offset.x,  baseY: offset.y,
      };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchState.current.active) {
      const d = dist(e.touches[0], e.touches[1]);
      const ratio = d / pinchState.current.startDist;
      setZoom(clampZoom(pinchState.current.startZoom * ratio));
    } else if (e.touches.length === 1 && panState.current.active) {
      const t = e.touches[0];
      setOffset({
        x: panState.current.baseX + (t.clientX - panState.current.startX),
        y: panState.current.baseY + (t.clientY - panState.current.startY),
      });
    }
  };
  const onTouchEnd = () => {
    panState.current.active = false;
    pinchState.current.active = false;
  };

  /* ============ fullscreen ============ */
  const toggleFs = () => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* ============ download (image) ============ */
  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const r    = await fetch(imageUrl, { mode: "cors" });
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `inoptics-exhibition-map.${blob.type.split("/")[1] || "png"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  /* ============ download as PDF ============ */
  const downloadPdf = async () => {
    if (!imageUrl) return;
    try {
      const { jsPDF } = await import("jspdf");

      const img = new Image();
      img.crossOrigin = "anonymous";
      const loaded = await new Promise((resolve) => {
        img.onload  = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
      });

      if (!loaded) {
        // fallback: open in new tab
        window.open(imageUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // Convert image to data URL via canvas (preserves quality)
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      // Match PDF orientation to image
      const orientation = img.naturalWidth >= img.naturalHeight ? "l" : "p";
      const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Fit image to page with margin
      const margin = 24;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;
      const ratio  = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
      const w      = img.naturalWidth  * ratio;
      const h      = img.naturalHeight * ratio;
      const x      = (pageW - w) / 2;
      const y      = (pageH - h) / 2;

      pdf.addImage(dataUrl, "JPEG", x, y, w, h, undefined, "FAST");
      pdf.save("inoptics-exhibition-map.pdf");
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Could not generate PDF. Opening image in a new tab instead.");
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  /* ============ render ============ */
  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-[Quicksand,sans-serif]">
      <Breadcrumbs />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              Exhibitor Area
            </span>
          </div>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <MdMap size={24} className="text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight font-[Playfair_Display,serif] leading-tight">
                Exhibition{" "}
                <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
                  Map
                </span>
              </h1>
              <p className="mt-2 text-[13px] sm:text-[15px] text-blue-200 leading-relaxed max-w-2xl">
                Save time, find the booths — your personal guide to InOptics 2026 hall layout.
                Pan, zoom, and download for offline use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8 mb-16 sm:mb-20 flex-1">

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Zoom controls */}
          <div className="inline-flex items-center bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
            <ToolbarBtn onClick={zoomOut} disabled={!imageUrl || zoom <= MIN_ZOOM} title="Zoom Out (Ctrl+-)">
              <MdRemove size={18} />
            </ToolbarBtn>
            <span className="px-3 text-[13px] font-bold text-[#02062c] min-w-16 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <ToolbarBtn onClick={zoomIn} disabled={!imageUrl || zoom >= MAX_ZOOM} title="Zoom In (Ctrl++)">
              <MdAdd size={18} />
            </ToolbarBtn>
            <span className="w-px h-6 bg-zinc-200 mx-1" />
            <ToolbarBtn onClick={reset} disabled={!imageUrl} title="Reset View">
              <MdRefresh size={16} />
            </ToolbarBtn>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleFs}
              disabled={!imageUrl}
              className="inline-flex items-center gap-1.5 px-3 h-10 text-[12px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Toggle Fullscreen"
            >
              {isFs ? <MdFullscreenExit size={16} /> : <MdFullscreen size={16} />}
              <span className="hidden sm:inline">{isFs ? "Exit" : "Fullscreen"}</span>
            </button>
            <button
              onClick={downloadImage}
              disabled={!imageUrl}
              className="inline-flex items-center gap-1.5 px-3 h-10 text-[12px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Image"
            >
              <MdImage size={16} />
              <span className="hidden sm:inline">Image</span>
            </button>
            <button
              onClick={downloadPdf}
              disabled={!imageUrl}
              className="inline-flex items-center gap-1.5 px-4 h-10 text-[12px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download as PDF"
            >
              <MdDownload size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <MdOpenInNew size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Map stage */}
        <div
          ref={stageRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`relative bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden select-none touch-none
            ${zoom > 1 ? (panState.current.active ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}
            ${isFs ? "rounded-none border-0" : "h-[55vh] sm:h-[65vh] lg:h-[72vh]"}`}
        >
          {/* checkerboard background */}
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #f4f4f5 25%, transparent 25%), linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f4f4f5 75%), linear-gradient(-45deg, transparent 75%, #f4f4f5 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, 10px 0",
            }}
          />

          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-blue-500 animate-spin" />
              <p className="text-[13px] text-zinc-500">Loading exhibition map...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <MdInfoOutline size={32} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-[#02062c]">Failed to load map</h3>
              <p className="text-[13px] text-zinc-500 max-w-md">
                Could not fetch the exhibition map. Please check your connection.
              </p>
              <button
                onClick={fetchExhibitionData}
                className="mt-2 inline-flex items-center gap-2 px-5 h-10 bg-[#02062c] hover:bg-[#0a1450] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                <MdRefresh size={14} /> Try Again
              </button>
            </div>
          ) : !isActive && firstRow ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-gradient-to-br from-amber-50 via-white to-blue-50">
              <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center shadow-sm">
                <MdInfoOutline size={38} className="text-amber-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#02062c] tracking-tight">
                We'll Be Back Soon
              </h3>
              <p className="text-[13px] sm:text-[14px] text-zinc-600 max-w-md leading-relaxed">
                The exhibition map is currently being updated. Please check back shortly —
                the latest layout will be available here soon.
              </p>
              <button
                onClick={fetchExhibitionData}
                className="mt-2 inline-flex items-center gap-2 px-5 h-10 bg-[#02062c] hover:bg-[#0a1450] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                <MdRefresh size={14} /> Refresh
              </button>
            </div>
          ) : !imageUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <MdImageNotSupported size={32} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-[#02062c]">No map available</h3>
              <p className="text-[13px] text-zinc-500 max-w-md">
                The exhibition map has not been published yet. Please check back later.
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                ref={imgRef}
                src={imageUrl}
                alt="InOptics 2026 Exhibition Hall Map"
                draggable={false}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/map-not-found.jpg";
                }}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              />
            </div>
          )}

          {/* Floating hint pill — bottom-right */}
          {imageUrl && !loading && !error && (
            <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold pointer-events-none">
              <MdPanTool size={12} />
              Drag to pan · Ctrl + Scroll to zoom
            </div>
          )}

          {/* Floating zoom % — bottom-left (visible on fullscreen for clarity) */}
          {imageUrl && !loading && !error && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-[11px] font-bold text-[#02062c] pointer-events-none">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Helper info row */}
        {imageUrl && !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <InfoChip
              icon={<MdPanTool size={16} />}
              tint="from-blue-500 to-cyan-500"
              title="Pan"
              desc="Click & drag (or swipe on mobile) to move around"
            />
            <InfoChip
              icon={<MdAdd size={16} />}
              tint="from-emerald-500 to-teal-500"
              title="Zoom"
              desc="Use +/- buttons, Ctrl+scroll, or pinch on mobile"
            />
            <InfoChip
              icon={<MdDownload size={16} />}
              tint="from-amber-500 to-orange-500"
              title="Download"
              desc="Save as image or high-quality PDF for offline use"
            />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

/* ============ sub-components ============ */

function ToolbarBtn({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center justify-center w-10 h-10 text-zinc-700 hover:bg-white hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

function InfoChip({ icon, tint, title, desc }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-3 flex items-start gap-3">
      <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${tint} text-white flex items-center justify-center shadow-md`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-[#02062c] uppercase tracking-wider">{title}</p>
        <p className="text-[12px] text-zinc-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
