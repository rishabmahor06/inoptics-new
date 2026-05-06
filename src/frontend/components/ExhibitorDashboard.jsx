import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdLogout, MdDashboard, MdStorefront, MdPayments, MdBadge,
  MdPower, MdInventory, MdAssignment, MdNotifications,
  MdArrowOutward, MdShield, MdTrendingUp,
} from "react-icons/md";

const QUICK_TILES = [
  { Icon: MdStorefront,  label: "Stalls",            value: "2",      tint: "from-blue-500 to-cyan-500" },
  { Icon: MdPayments,    label: "Payments Pending",  value: "₹0",     tint: "from-amber-500 to-orange-500" },
  { Icon: MdBadge,       label: "Badges Booked",     value: "12",     tint: "from-purple-500 to-pink-500" },
  { Icon: MdPower,       label: "Power Required",    value: "5 KW",   tint: "from-emerald-500 to-teal-500" },
];

const ACTION_CARDS = [
  { Icon: MdInventory,   title: "Manage Brands & Products",    desc: "Add or update the brands and products you'll display." },
  { Icon: MdAssignment,  title: "Submit Mandatory Forms",      desc: "Complete required compliance and event paperwork." },
  { Icon: MdPayments,    title: "Payments & Invoices",         desc: "Track receipts, invoices, and pending dues." },
  { Icon: MdBadge,       title: "Print Badges",                desc: "Generate badges for your team and contractors." },
];

export default function ExhibitorDashboard() {
  const navigate = useNavigate();
  const [exhibitor, setExhibitor] = useState(null);

  /* Auth guard — if not logged in, kick to login */
  useEffect(() => {
    const loggedIn = localStorage.getItem("isExhibitorLoggedIn");
    if (!loggedIn) {
      navigate("/exhibitor-login", { replace: true });
      return;
    }
    try {
      const info = JSON.parse(localStorage.getItem("exhibitorInfo") || "null");
      setExhibitor(info);
    } catch { setExhibitor(null); }
  }, [navigate]);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("isExhibitorLoggedIn");
    localStorage.removeItem("exhibitorInfo");
    navigate("/exhibitor-login", { replace: true });
  };

  const name    = exhibitor?.name || exhibitor?.company_name || "Exhibitor";
  const company = exhibitor?.company_name || "InOptics 2026";
  const email   = exhibitor?.email || "";

  return (
    <div className="min-h-screen bg-[#fafafb] font-[Quicksand,sans-serif]">

      {/* ============ TOPBAR ============ */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <MdShield size={18} />
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-[0.25em] uppercase text-zinc-500">
                Exhibitor Portal
              </p>
              <p className="text-[14px] font-bold text-[#02062c] -mt-0.5 tracking-tight">
                InOptics 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden sm:inline-flex items-center justify-center w-10 h-10 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <MdNotifications size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 h-10 text-[12px] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
              title="Logout"
            >
              <MdLogout size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight font-[Playfair_Display,serif] leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent italic">
              {name}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-blue-200">
            <span className="inline-flex items-center gap-1.5">
              <MdStorefront size={14} className="text-amber-300" />
              {company}
            </span>
            {email && (
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-300/50" />
                {email}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-8 sm:-mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_TILES.map(({ Icon, label, value, tint }, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl border border-zinc-100 shadow-lg p-4 sm:p-6 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all"
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className={`relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg mb-3`}>
                <Icon size={20} />
              </div>
              <h2 className="relative text-2xl sm:text-3xl font-bold text-[#02062c] tracking-tight font-[Montserrat,sans-serif] leading-tight">
                {value}
              </h2>
              <p className="relative text-[11px] sm:text-[12px] text-zinc-500 mt-1 font-bold uppercase tracking-widest">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MAIN ============ */}
      <section className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-12 sm:mt-16 mb-16 sm:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Action cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              <h3 className="text-[15px] font-bold uppercase tracking-widest text-[#02062c]">
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {ACTION_CARDS.map(({ Icon, title, desc }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => alert(`"${title}" — coming soon in production build`)}
                  className="group relative text-left bg-white rounded-2xl border border-zinc-100 hover:border-blue-200 shadow-sm hover:shadow-xl p-5 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-[#02062c] tracking-tight leading-snug">
                        {title}
                      </h4>
                      <p className="mt-1 text-[12px] text-zinc-500 leading-snug">
                        {desc}
                      </p>
                    </div>
                    <MdArrowOutward
                      size={16}
                      className="shrink-0 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Account card */}
            <div className="bg-gradient-to-br from-[#02062c] to-[#1e3a8a] rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                    Account
                  </span>
                </div>
                <p className="text-[18px] font-bold tracking-tight">{company}</p>
                {email && <p className="text-[12px] text-blue-200 mt-0.5 break-all">{email}</p>}

                <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                  <Stat label="Member Since" value="2026" />
                  <Stat label="Status"       value="Active" badge />
                  <Stat label="Stall ID"     value="—" />
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 h-10 text-[12px] font-bold uppercase tracking-wider bg-white/10 hover:bg-red-500/40 border border-white/15 hover:border-red-400 text-white rounded-xl transition-all"
                >
                  <MdLogout size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* Demo notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <MdTrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-amber-900">Demo Dashboard</p>
                  <p className="text-[12px] text-amber-800 mt-0.5 leading-relaxed">
                    This is a placeholder exhibitor dashboard. Production version will pull live stall, payment, and badge data from the API.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-blue-200/80 uppercase tracking-wider font-semibold">{label}</span>
      {badge ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {value}
        </span>
      ) : (
        <span className="text-white font-bold">{value}</span>
      )}
    </div>
  );
}
