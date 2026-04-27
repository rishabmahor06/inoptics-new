import React, { useState } from 'react';
import { MdBolt, MdAssignment } from 'react-icons/md';

import PowerHistoryTab from './ExhibitorHistory/PowerHistoryTab';
import FormsHistoryTab from './ExhibitorHistory/FormsHistoryTab';

const TABS = [
  { id: 'power', label: 'Power History',     icon: MdBolt },
  { id: 'forms', label: 'Contractor Forms',  icon: MdAssignment },
];

export default function ExhibitorHistory() {
  const [tab, setTab] = useState('power');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-zinc-100 [scrollbar-width:none]">
          {TABS.map((t) => {
            const Icon   = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-[14px] whitespace-nowrap transition-colors cursor-pointer shrink-0
                  ${active ? 'font-bold text-zinc-900' : 'font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
              >
                <Icon size={16} />
                {t.label}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${active ? 'bg-zinc-900' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {tab === 'power' && <PowerHistoryTab />}
          {tab === 'forms' && <FormsHistoryTab />}
        </div>
      </div>
    </div>
  );
}
