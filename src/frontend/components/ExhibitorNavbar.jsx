import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { MdLogin, MdArrowBack } from "react-icons/md";
import Logo from "../../assets/INOP_BLUE.png";

const NAV_ITEMS = [
  { to: "/for-exhibitors", label: "For Exhibitors" },
  { to: "/exhibitor-exhibition-map", label: "Exhibition Map" },
  { to: "/why-exhibit", label: "Why Exhibit" },
  { to: "/become-exhibitor", label: "Become An Exhibitor" },
  { to: "/rules-policy", label: "Rules & Policy" },
  {
    to: "/reach-venue",
    label: "How To Reach Venue",
    state: { fromExhibitor: true },
  },
  { to: "/exhibitor-login", label: "Login" },
];

export default function ExhibitorNavbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 h-[77px] transition-all
          ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"}`}
      >
        <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/home" className="shrink-0">
            <img src={Logo} alt="InOptics" className="h-9 sm:h-10 w-auto" />
          </Link>

          {/* Desktop links — text-only with sliding underline */}
          <ul className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, state }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    state={state}
                    className={`group relative px-3 py-3 text-[14px] font-medium whitespace-nowrap transition-colors
                      ${active ? "text-blue-600" : "text-zinc-700 hover:text-blue-600"}`}
                  >
                    {label}
                    {/* Sliding underline */}
                    <span
                      className={`absolute left-3 right-3 bottom-1.5 h-0.5 bg-blue-600 origin-left transition-transform duration-300 ease-out
                        ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right action — Public Site */}
          <Link
            to="/exhibitor-login"
            className="px-3.5 h-10 text-[12px] flex justify-center items-center sm:block md:hidden lg:hidden font-bold uppercase tracking-wider bg-[#172E75] hover:bg-[#2c448d] text-white rounded transition-colors"
          >
            Login
          </Link>
          <button
            onClick={() => window.open("https://rsdebadge.in/", "_blank")}
            className="px-3.5 h-10 text-[12px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
          >
            Visitors Badge
          </button>

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

      {/* MOBILE DRAWER */}
      <div
        className={`xl:hidden fixed inset-0 z-30 transition-opacity ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-[77px] right-0 w-[88%] max-w-[360px] h-[calc(100vh-77px)] bg-white shadow-2xl overflow-y-auto transition-transform
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <ul className="py-2">
            {NAV_ITEMS.map(({ to, label, state }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    state={state}
                    className={`relative block px-5 py-4 text-[15px] font-medium border-b border-zinc-100 transition-colors
                      ${
                        active
                          ? "text-blue-600 bg-blue-50"
                          : "text-zinc-700 hover:text-blue-600 hover:bg-zinc-50"
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />
                    )}
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="p-5 border-t border-zinc-100">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 h-12 text-[13px] font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors"
            >
              <MdArrowBack size={14} /> Back to Public Site
            </Link>
          </div>

          <div className="px-5 py-4 text-[11px] text-zinc-400 text-center">
            InOptics 2026 · Exhibitor Portal
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[77px]" aria-hidden />
    </>
  );
}
