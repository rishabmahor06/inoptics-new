import React, { useState } from 'react';
import {
  MdDashboard, MdDescription, MdGavel, MdListAlt,
  MdEvent, MdPeople, MdMap, MdMail,
} from 'react-icons/md';

import OverviewTab        from './ExhibitorDashboard/tabs/OverviewTab';
import InstructionsTab    from './ExhibitorDashboard/tabs/InstructionsTab';
import RulesTab           from './ExhibitorDashboard/tabs/RulesTab';
import GuidelinesTab      from './ExhibitorDashboard/tabs/GuidelinesTab';
import EventScheduleTab   from './ExhibitorDashboard/tabs/EventScheduleTab';
import DashboardScheduleTab from './ExhibitorDashboard/tabs/DashboardScheduleTab';
import ExhibitionMapTab   from './ExhibitorDashboard/tabs/ExhibitionMapTab';
import MailsTab           from './ExhibitorDashboard/tabs/MailsTab';

const TABS = [
  { id: 'overview',       label: 'Overview',         icon: MdDashboard   },
  { id: 'instructions',   label: 'Instructions',     icon: MdDescription },
  { id: 'rules',          label: 'Rules & Policy',   icon: MdGavel       },
  { id: 'guidelines',     label: 'Guidelines',       icon: MdListAlt     },
  { id: 'event_schedule', label: 'Event Schedule',   icon: MdEvent       },
  { id: 'dash_schedule',  label: 'Dashboard Sched.', icon: MdPeople      },
  { id: 'exhibition_map', label: 'Exhibition Map',   icon: MdMap         },
  { id: 'mails',          label: 'Mails',            icon: MdMail        },
];

export default function ExhibitorDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
          <MdDashboard size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-zinc-800 leading-none">Exhibitor Dashboard</h2>
          <p className="text-[12px] text-zinc-400 mt-0.5">Manage all exhibitor portal content</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-1.5 flex flex-wrap gap-1">
        {TABS.map(t => {
          const Icon   = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-xl transition-colors
                ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'}`}>
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'overview'       && <OverviewTab />}
      {tab === 'instructions'   && <InstructionsTab />}
      {tab === 'rules'          && <RulesTab />}
      {tab === 'guidelines'     && <GuidelinesTab />}
      {tab === 'event_schedule' && <EventScheduleTab />}
      {tab === 'dash_schedule'  && <DashboardScheduleTab />}
      {tab === 'exhibition_map' && <ExhibitionMapTab />}
      {tab === 'mails'          && <MailsTab />}
    </div>
  );
}
