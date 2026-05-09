import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard, MdPerson, MdMail, MdChair, MdPower, MdAssignment,
  MdBadge, MdEngineering, MdLabel, MdPayments, MdLogout, MdMenu, MdClose,
} from "react-icons/md";

export const TABS = [
  { key: "dashboard",            label: "Dashboard",            Icon: MdDashboard   },
  { key: "profile",              label: "Profile",              Icon: MdPerson      },
  { key: "mails-inbox",          label: "Mails Inbox",          Icon: MdMail        },
  { key: "additional-furniture", label: "Additional Furniture", Icon: MdChair       },
  { key: "additional-power",     label: "Additional Power",     Icon: MdPower       },
  { key: "mandatory-forms",      label: "Mandatory Forms",      Icon: MdAssignment  },
  { key: "exhibitor-badges",     label: "Exhibitor Badges",     Icon: MdBadge       },
  { key: "contractor-badges",    label: "Contractor Badges",    Icon: MdEngineering },
  { key: "fascia-name",          label: "Fascia Name",          Icon: MdLabel       },
  { key: "payment",              label: "Payment",              Icon: MdPayments    },
];

export default function ExhibitorSidebar({ active, onChange }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const exhibitor = (() => {
    try { return JSON.parse(localStorage.getItem("exhibitorInfo") || "null"); }
    catch { return null; }
  })();

  const confirmLogout = () => {
    localStorage.removeItem("isExhibitorLoggedIn");
    localStorage.removeItem("exhibitorInfo");
    navigate("/exhibitor-login", { replace: true });
  };

  const SidebarContent = (
    <>
      {/* Brand / user header */}
      <div className="px-5 py-5 bg-gradient-to-br from-[#02062c] to-[#1e3a8a] text-white">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300">Exhibitor Portal</p>
        <h2 className="mt-1 text-[15px] font-bold truncate">
          {exhibitor?.company_name || exhibitor?.companyName || "Welcome"}
        </h2>
        {exhibitor?.email && (
          <p className="text-[11px] text-blue-200 truncate mt-0.5">{exhibitor.email}</p>
        )}
      </div>

      {/* Tab list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => { onChange(key); setMobileOpen(false); }}
              className={`group relative w-full flex items-center gap-3 px-5 py-3 text-[13px] font-semibold transition-colors
                ${isActive
                  ? "text-blue-700 bg-blue-50"
                  : "text-zinc-700 hover:text-blue-700 hover:bg-zinc-50"}`}
            >
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />}
              <Icon size={17} className={isActive ? "text-blue-600" : "text-zinc-500 group-hover:text-blue-600"} />
              <span className="flex-1 text-left">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-100">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-3.5 h-11 text-[12px] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
        >
          <MdLogout size={14} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-zinc-200 shadow-sm h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-700"
        >
          <MdMenu size={22} />
        </button>
        <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-zinc-700">Exhibitor</p>
        <span className="w-10" aria-hidden />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-zinc-200">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <aside
          className={`absolute top-0 left-0 h-full w-72 max-w-[85%] bg-white shadow-2xl flex flex-col transition-transform
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white z-10"
          >
            <MdClose size={20} />
          </button>
          {SidebarContent}
        </aside>
      </div>

      {/* Logout confirm */}
      {showLogout && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLogout(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
                <MdLogout size={26} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Sign out?</h3>
              <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">
                You'll be returned to the login screen and your session will end.
              </p>
            </div>
            <div className="px-5 pb-5 pt-3 flex items-center gap-2">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 h-10 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                autoFocus
              >
                <MdLogout size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
