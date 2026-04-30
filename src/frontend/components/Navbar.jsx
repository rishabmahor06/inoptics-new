import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import Logo from "../../assets/INOP_BLUE.png";

const VISITOR_GUIDE_PATHS = ["/visitor-guide", "/visitor-guide/metro-map", "/visitor-guide/exhibition-map", "/visitor-guide/weather", "/visitor-guide/tourist-spots", "/visitor-guide/exhibitor-list"];
const PRESS_PATHS         = ["/press", "/press/press-release", "/press/media-gallery"];

const NAV_ITEMS = [
  { type: "link",     label: "Home",                to: "/home" },
  { type: "link",     label: "About Us",            to: "/about" },
  { type: "dropdown", label: "Visitor Guide",       to: "/visitor-guide", paths: VISITOR_GUIDE_PATHS,
    children: [
      { label: "Metro Map",      to: "/visitor-guide/metro-map" },
      { label: "Weather Info",   to: "/visitor-guide/weather" },
      { label: "Tourist Spots",  to: "/visitor-guide/tourist-spots" },
      { label: "Exhibitor List", to: "/visitor-guide/exhibitor-list" },
    ] },
  { type: "dropdown", label: "Press", to: "/press", paths: PRESS_PATHS,
    children: [
      { label: "Press Release", to: "/press/press-release" },
      { label: "Media Gallery", to: "/press/media-gallery" },
    ] },
  { type: "link",     label: "Our Partners",        to: "/benefactors" },
  { type: "link",     label: "How To Reach Venue",  to: "/reach-venue", state: { from: "main-navbar" } },
  { type: "link",     label: "Contact Us",          to: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState(null);

  const isActive    = (to)    => location.pathname === to;
  const isPathGroup = (paths) => paths.some((p) => location.pathname === p);

  return (
    <>
      {/* Desktop / Tablet navbar */}
      <nav className="navbar fixed top-0 left-0 right-0 z-40 h-[77px] bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center">
            <img src={Logo} alt="InOptics" className="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => {
              const active =
                item.type === "link"
                  ? isActive(item.to)
                  : isPathGroup(item.paths);

              if (item.type === "link") {
                return (
                  <li key={i}>
                    <Link
                      to={item.to}
                      state={item.state}
                      className={`px-3 py-2 text-[13px] font-semibold uppercase tracking-wider rounded transition-colors
                        ${active ? "text-blue-700 bg-blue-50" : "text-zinc-700 hover:text-blue-700 hover:bg-blue-50"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={i} className="relative group">
                  <Link
                    to={item.to}
                    className={`flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-wider rounded transition-colors
                      ${active ? "text-blue-700 bg-blue-50" : "text-zinc-700 hover:text-blue-700 hover:bg-blue-50"}`}
                  >
                    {item.label}
                    <MdKeyboardArrowDown size={16} className="group-hover:rotate-180 transition-transform" />
                  </Link>
                  <ul className="absolute left-0 top-full mt-1 min-w-[200px] bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {item.children.map((c, j) => (
                      <li key={j}>
                        <Link
                          to={c.to}
                          className="block px-4 py-2.5 text-[13px] text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.open("/for-exhibitors", "_blank")}
              className="px-3.5 h-10 text-[12px] font-bold uppercase tracking-wider bg-[#02062c] hover:bg-[#0a1450] text-white rounded transition-colors"
            >
              Exhibitors Area
            </button>
            <button
              onClick={() => window.open("https://rsdebadge.in/", "_blank")}
              className="px-3.5 h-10 text-[12px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
            >
              Visitors Badge
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <IoIosClose size={28} /> : <IoIosMenu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-30 transition-opacity ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-[77px] right-0 w-[85%] max-w-[340px] h-[calc(100vh-77px)] bg-white shadow-xl overflow-y-auto transition-transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <ul className="py-2">
            {NAV_ITEMS.map((item, i) => {
              if (item.type === "link") {
                return (
                  <li key={i}>
                    <Link
                      to={item.to}
                      state={item.state}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-5 py-3 text-[14px] font-semibold uppercase tracking-wider border-b border-zinc-100
                        ${isActive(item.to) ? "text-blue-700 bg-blue-50" : "text-zinc-700"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const open = openSub === i;
              return (
                <li key={i} className="border-b border-zinc-100">
                  <button
                    onClick={() => setOpenSub(open ? null : i)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-[14px] font-semibold uppercase tracking-wider
                      ${isPathGroup(item.paths) ? "text-blue-700 bg-blue-50" : "text-zinc-700"}`}
                  >
                    {item.label}
                    <MdKeyboardArrowDown size={18} className={`${open ? "rotate-180" : ""} transition-transform`} />
                  </button>
                  {open && (
                    <ul className="bg-zinc-50">
                      {item.children.map((c, j) => (
                        <li key={j}>
                          <Link
                            to={c.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-8 py-2.5 text-[13px] text-zinc-700 hover:text-blue-700"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="p-5 space-y-2 border-t border-zinc-100">
            <button
              onClick={() => { window.open("/for-exhibitors", "_blank"); setIsMenuOpen(false); }}
              className="w-full px-3.5 h-11 text-[13px] font-bold uppercase tracking-wider bg-[#02062c] hover:bg-[#0a1450] text-white rounded"
            >
              Exhibitors Area
            </button>
            <button
              onClick={() => { window.open("https://rsdebadge.in/", "_blank"); setIsMenuOpen(false); }}
              className="w-full px-3.5 h-11 text-[13px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded"
            >
              Visitors Badge
            </button>
          </div>
        </div>
      </div>

      {/* Spacer so content sits below fixed navbar */}
      <div className="h-[77px]" aria-hidden />
    </>
  );
}
