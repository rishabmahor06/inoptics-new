import React from "react";
import { Link } from "react-router-dom";
import {
  MdDirectionsTransit, MdMap, MdWbSunny, MdPlace, MdGroups, MdArrowForward,
} from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const TILES = [
  { to: "/visitor-guide/metro-map",      label: "Metro Map",      desc: "Plan your journey via Delhi Metro to reach the venue.",          icon: <MdDirectionsTransit size={28} />, tint: "from-blue-500 to-cyan-500" },
  { to: "/visitor-guide/exhibition-map", label: "Exhibition Map", desc: "Save time — find booths quickly with our hall layout.",          icon: <MdMap size={28} />,               tint: "from-emerald-500 to-teal-500" },
  { to: "/visitor-guide/weather",        label: "Weather",        desc: "Live forecast and conditions for your trip to New Delhi.",       icon: <MdWbSunny size={28} />,           tint: "from-amber-500 to-orange-500" },
  { to: "/visitor-guide/tourist-spots",  label: "Tourist Spots",  desc: "Top attractions to explore around the city.",                    icon: <MdPlace size={28} />,             tint: "from-pink-500 to-rose-500" },
  { to: "/visitor-guide/exhibitor-list", label: "Exhibitor List", desc: "Browse all participating exhibitors and their brands.",          icon: <MdGroups size={28} />,            tint: "from-purple-500 to-indigo-500" },
];

export default function VisitorGuide() {
  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10 sm:py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">— Visitor Guide —</span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
            Everything you need{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              to plan your visit
            </span>
          </h1>
          <p className="mt-4 text-[14px] sm:text-[15px] text-zinc-600 leading-relaxed">
            Get directions, weather, tourist info, and the full exhibitor list — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {TILES.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group relative bg-white rounded-2xl border border-zinc-100 p-6 sm:p-7 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.tint} opacity-10 group-hover:opacity-20 transition-opacity`} aria-hidden />
              <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${t.tint} text-white shadow-lg`}>
                {t.icon}
              </div>
              <h3 className="relative mt-5 text-[18px] font-bold text-[#02062c] tracking-tight">{t.label}</h3>
              <p className="relative mt-2 text-[13px] text-zinc-600 leading-relaxed">{t.desc}</p>
              <div className="relative mt-5 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-800">
                Explore <MdArrowForward size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
