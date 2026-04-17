import React from 'react';
import { useNavStore, TAB_LABELS } from '../../store/useNavStore';

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

export default function Header({ onMenuClick }) {
  const { activeTab } = useNavStore();
  const title = TAB_LABELS[activeTab] || 'Dashboard';

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-zinc-200 shrink-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0"
        >
          <MenuIcon />
        </button>
        <h1 className="text-xl max-[480px]:text-[17px] font-bold text-zinc-900 tracking-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-400 w-50 max-sm:w-35">
          <SearchIcon />
          <input
            placeholder="Search"
            className="border-0 bg-transparent outline-none text-[13px] text-zinc-600 w-full placeholder:text-zinc-400"
          />
        </div>

        <button className="relative flex items-center justify-center w-9 h-9 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all shrink-0">
          <BellIcon />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white leading-none">
            4
          </span>
        </button>
      </div>
    </header>
  );
}
