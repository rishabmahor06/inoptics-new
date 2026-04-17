import React from 'react';
import { MdDashboard, MdPeople, MdPayment, MdTrendingUp } from 'react-icons/md';

const cards = [
  { label: 'Total Exhibitors', value: '—', icon: MdPeople,     color: '#6366f1' },
  { label: 'Payments Done',    value: '—', icon: MdPayment,    color: '#10b981' },
  { label: 'Active Stalls',    value: '—', icon: MdDashboard,  color: '#f59e0b' },
  { label: 'Growth Rate',      value: '—', icon: MdTrendingUp, color: '#3b82f6' },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: c.color + '18' }}>
              <Icon size={22} style={{ color: c.color }} />
            </div>
            <div>
              <div className="text-[22px] font-bold text-zinc-900">{c.value}</div>
              <div className="text-xs text-zinc-500">{c.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
