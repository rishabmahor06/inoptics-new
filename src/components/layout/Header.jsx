import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavStore, TAB_LABELS } from '../../store/useNavStore';
import { useNotificationsStore } from '../../store/useNotificationsStore';
import {
  MdSupportAgent, MdPersonAdd, MdBolt, MdBadge,
  MdAccessTime, MdNotificationsNone, MdDoneAll,
} from 'react-icons/md';

const SearchIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const BellIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const SOURCE_META = {
  "contact-support":   { Icon: MdSupportAgent, tone: "blue",    },
  "new-exhibitor":     { Icon: MdPersonAdd,    tone: "emerald", },
  "power-unlock":      { Icon: MdBolt,         tone: "amber",   },
  "contractor-badge":  { Icon: MdBadge,        tone: "violet",  },
};

const TONE_CLASSES = {
  blue:    "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber:   "bg-amber-100 text-amber-600",
  violet:  "bg-violet-100 text-violet-600",
  zinc:    "bg-zinc-100 text-zinc-400",
};

const formatWhen = (s) => {
  if (!s) return "";
  const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(String(s));
  const d = new Date(hasTZ ? s : String(s).replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return String(s);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export default function Header({ onMenuClick }) {
  const { activeTab, setActiveTab } = useNavStore();
  const title = TAB_LABELS[activeTab] || 'Dashboard';

  const items        = useNotificationsStore((s) => s.items);
  const seen         = useNotificationsStore((s) => s.seen);
  const startPolling = useNotificationsStore((s) => s.startPolling);
  const stopPolling  = useNotificationsStore((s) => s.stopPolling);
  const markAllRead  = useNotificationsStore((s) => s.markAllRead);
  const markOneRead  = useNotificationsStore((s) => s.markOneRead);

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = useMemo(
    () => items.filter((n) => !seen.has(n.key)).length,
    [items, seen],
  );

  const handleItemClick = (n) => {
    markOneRead(n.key);
    if (n.sourceTab && setActiveTab) setActiveTab(n.sourceTab);
    setOpen(false);
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-zinc-200 shrink-0 gap-3 relative">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
        >
          <MenuIcon />
        </button>
        <h1 className="text-xl max-[480px]:text-[17px] font-bold text-zinc-900 tracking-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded px-3 py-1.5 text-zinc-400 w-50 max-sm:w-35">
          <SearchIcon />
          <input
            placeholder="Search"
            className="border-0 bg-transparent outline-none text-[13px] text-zinc-600 w-full placeholder:text-zinc-400"
          />
        </div>

        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div
              ref={panelRef}
              className="absolute right-0 mt-2 w-80 max-w-[92vw] bg-white border border-zinc-200 rounded shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-100 bg-zinc-50">
                <div>
                  <p className="text-[12.5px] font-bold text-zinc-900 leading-tight">Notifications</p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">
                    {unreadCount > 0
                      ? <><span className="text-red-600 font-semibold">{unreadCount} new</span> · {items.length} total</>
                      : `${items.length} total`}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 hover:text-blue-700"
                    title="Mark all as read"
                  >
                    <MdDoneAll size={13} /> Mark read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[55vh] overflow-y-auto divide-y divide-zinc-100">
                {items.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                      <MdNotificationsNone size={20} />
                    </div>
                    <p className="mt-2 text-[12px] text-zinc-500">No new notifications</p>
                  </div>
                ) : items.slice(0, 30).map((n) => {
                  const isNew = !seen.has(n.key);
                  const meta  = SOURCE_META[n.source] || { Icon: MdNotificationsNone, tone: "zinc" };
                  const Icon  = meta.Icon;
                  return (
                    <button
                      key={n.key}
                      onClick={() => handleItemClick(n)}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 transition-colors flex gap-2.5 ${
                        isNew ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        isNew ? TONE_CLASSES[meta.tone] : "bg-zinc-100 text-zinc-400"
                      }`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {n.sourceLabel}
                          </span>
                          {isNew && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                        <p className="text-[12.5px] font-semibold text-zinc-900 truncate mt-0.5">
                          {n.title}
                        </p>
                        {n.company && (
                          <p className="text-[11px] text-zinc-600 truncate mt-0.5">{n.company}</p>
                        )}
                        {n.subtitle && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {String(n.subtitle).replace(/\\r\\n/g, " ").slice(0, 100)}
                          </p>
                        )}
                        <p className="text-[10.5px] text-zinc-400 mt-1 flex items-center gap-1">
                          <MdAccessTime size={10} /> {formatWhen(n.time)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
