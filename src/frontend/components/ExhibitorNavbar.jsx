import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import {
  MdHome, MdLightbulb, MdHowToReg, MdGavel, MdCampaign,
  MdLogin, MdMap, MdArrowBack,
} from "react-icons/md";
import Logo from "../../assets/INOP_BLUE.png";

const NAV_ITEMS = [
  { to: "/for-exhibitors",          label: "Overview",            short: "Home",       Icon: MdHome     },
  { to: "/why-exhibit",             label: "Why Exhibit",         short: "Why",        Icon: MdLightbulb },
  { to: "/become-exhibitor",        label: "Become Exhibitor",    short: "Apply",      Icon: MdHowToReg  },
  { to: "/rules-policy",            label: "Rules & Policy",      short: "Rules",      Icon: MdGavel     },
  { to: "/increase-visibility",     label: "Increase Visibility", short: "Visibility", Icon: MdCampaign  },
  { to: "/exhibitor-exhibition-map",label: "Exhibition Map",      short: "Map",        Icon: MdMap       },
];

export default function ExhibitorNavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  /* close drawer on route change */
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* ============ DESKTOP / MOBILE TOP BAR ============ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 h-[77px] transition-all
          ${scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-md"
            : "bg-white/80 backdrop-blur-sm border-b border-transparent"}
        `}
      >
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">

          {/* Logo + section badge */}
          <Link to="/for-exhibitors" className="flex items-center gap-3 shrink-0 group">
            <img src={Logo} alt="InOptics" className="h-9 sm:h-10 w-auto" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              Exhibitor Area
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold uppercase tracking-wider rounded-lg transition-all
                      ${active
                        ? "text-blue-700 bg-blue-50"
                        : "text-zinc-700 hover:text-blue-700 hover:bg-blue-50"}`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 h-10 text-[12px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
            >
              <MdArrowBack size={14} /> Public Site
            </Link>
            <Link
              to="/exhibitor-login"
              className={`inline-flex items-center gap-1.5 px-4 h-10 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all
                ${isActive("/exhibitor-login")
                  ? "bg-blue-700 text-white"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"}`}
            >
              <MdLogin size={14} /> Login
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="xl:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <IoIosClose size={28} /> : <IoIosMenu size={26} />}
          </button>
        </div>
      </nav>

      {/* ============ MOBILE DRAWER ============ */}
      <div
        className={`xl:hidden fixed inset-0 z-30 transition-opacity ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
        <div
          className={`absolute top-[77px] right-0 w-[88%] max-w-[360px] h-[calc(100vh-77px)] bg-white shadow-2xl overflow-y-auto transition-transform
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Section header */}
          <div className="px-5 py-4 bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300">
                Exhibitor Area
              </span>
            </div>
            <h3 className="mt-1 text-[18px] font-light tracking-tight font-[Playfair_Display,serif]">
              Welcome, Exhibitor
            </h3>
          </div>

          {/* Links */}
          <ul className="py-2">
            {NAV_ITEMS.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-3 px-5 py-3.5 text-[14px] font-semibold border-b border-zinc-100 transition-colors
                      ${active
                        ? "text-blue-700 bg-blue-50"
                        : "text-zinc-700 hover:bg-zinc-50"}`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center
                      ${active
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-600"}`}>
                      <Icon size={16} />
                    </span>
                    <span className="flex-1">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="p-5 space-y-2 border-t border-zinc-100">
            <Link
              to="/exhibitor-login"
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 h-12 text-[13px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <MdLogin size={16} /> Exhibitor Login
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 h-12 text-[13px] font-bold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
            >
              <MdArrowBack size={14} /> Back to Public Site
            </Link>
          </div>

          {/* Footer hint */}
          <div className="px-5 py-4 text-[11px] text-zinc-400 text-center">
            InOptics 2026 · Exhibitor Portal
          </div>
        </div>
      </div>

      {/* Spacer so content sits below fixed navbar */}
      <div className="h-[77px]" aria-hidden />
    </>
  );
}
