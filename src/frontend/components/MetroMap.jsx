import React, { useEffect, useState } from "react";
import { MdDirectionsTransit, MdImageNotSupported } from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

export default function MetroMap() {
  const [metroData, setMetroData] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_visitor_metro_map.php");
        const d = await r.json();
        setMetroData(Array.isArray(d) ? d : []);
      } catch (err) {
        console.error("Failed to fetch Visitor Metro Map", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6 sm:mb-8">
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg">
            <MdDirectionsTransit size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">Visitor Guide</span>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
              Delhi Metro Map
            </h1>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-7 mb-6">
          {loading ? (
            <p className="text-zinc-500 text-[14px]">Loading description...</p>
          ) : (
            <div
              className="text-[14px] sm:text-[15px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: metroData[0]?.description || "Plan your journey via the Delhi Metro. Use the official map below for routes, interchanges, and stations.",
              }}
            />
          )}
        </div>

        {/* Map image */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-3 sm:p-5 overflow-hidden">
          {loading ? (
            <div className="aspect-[4/3] sm:aspect-video bg-zinc-100 rounded-xl animate-pulse" />
          ) : metroData[0]?.image ? (
            <img
              src={metroData[0].image}
              alt="Delhi Metro Map"
              className="w-full h-auto rounded-xl"
            />
          ) : (
            <div className="aspect-[4/3] sm:aspect-video bg-zinc-50 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400">
              <MdImageNotSupported size={48} />
              <p className="text-[13px]">No metro map available yet</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
