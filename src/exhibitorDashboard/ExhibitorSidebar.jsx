import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPerson,
  MdMail,
  MdChair,
  MdPower,
  MdAssignment,
  MdBadge,
  MdEngineering,
  MdLabel,
  MdPayments,
  MdLogout,
  MdClose,
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

export default function ExhibitorSidebar({
  active,
  onChange,
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("isExhibitorLoggedIn");
    localStorage.removeItem("exhibitorInfo");
    navigate("/exhibitor-login", { replace: true });
  };

  const SidebarContent = (
    <>
      {/* Brand pill — matches admin */}
      <div className="h-14 flex items-center px-3 border-b border-zinc-200 shrink-0">
        <span className="flex-1 text-sm h-8 font-bold bg-zinc-900 flex items-center justify-center rounded text-white whitespace-nowrap px-4">
          Exhibitor Panel
        </span>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 ml-2"
          aria-label="Close"
        >
          <MdClose size={18} />
        </button>
      </div>

      {/* Section label */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 px-2">
          Exhibitor
        </p>
      </div>

      {/* Tab list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1 text-left truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-200 shrink-0">
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <MdLogout size={17} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-zinc-200">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-72 max-w-[85%] bg-white shadow-2xl flex flex-col transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
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
            className="bg-white rounded shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="w-14 h-14 rounded bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
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
                className="flex-1 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 h-10 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center justify-center gap-1.5"
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
