import React, { useState } from 'react';
import {
  MdDashboard, MdDescription, MdGavel, MdListAlt,
  MdEvent, MdPeople, MdMap, MdMail,
} from 'react-icons/md';

import OverviewTab          from './ExhibitorDashboard/tabs/OverviewTab';
import InstructionsTab      from './ExhibitorDashboard/tabs/InstructionsTab';
import RulesTab             from './ExhibitorDashboard/tabs/RulesTab';
import GuidelinesTab        from './ExhibitorDashboard/tabs/GuidelinesTab';
import EventScheduleTab     from './ExhibitorDashboard/tabs/EventScheduleTab';
import DashboardScheduleTab from './ExhibitorDashboard/tabs/DashboardScheduleTab';
import ExhibitionMapTab     from './ExhibitorDashboard/tabs/ExhibitionMapTab';
import MailsTab             from './ExhibitorDashboard/tabs/MailsTab';

const TABS = [
  { id: 'overview',       label: 'Overview',        icon: MdDashboard   },
  { id: 'instructions',   label: 'Instructions',    icon: MdDescription },
  { id: 'rules',          label: 'Rules & Policy',  icon: MdGavel       },
  { id: 'guidelines',     label: 'Guidelines',      icon: MdListAlt     },
  { id: 'event_schedule', label: 'Event Schedule',  icon: MdEvent       },
  { id: 'dash_schedule',  label: 'Dash. Schedule',  icon: MdPeople      },
  { id: 'exhibition_map', label: 'Exhibition Map',  icon: MdMap         },
  { id: 'mails',          label: 'Mails',           icon: MdMail        },
];

export default function ExhibitorDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="p-0 sm:p-0 lg:p-0 space-y-4">

    

      {/* Tab card — Communication style */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-zinc-100 [scrollbar-width:none]">
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0
                  ${active ? 'font-bold text-zinc-900' : 'font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'}`}
              >
                <Icon size={15} />
                {t.label}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${active ? 'bg-zinc-900' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-0">
          {tab === 'overview'       && <OverviewTab />}
          {tab === 'instructions'   && <InstructionsTab />}
          {tab === 'rules'          && <RulesTab />}
          {tab === 'guidelines'     && <GuidelinesTab />}
          {tab === 'event_schedule' && <EventScheduleTab />}
          {tab === 'dash_schedule'  && <DashboardScheduleTab />}
          {tab === 'exhibition_map' && <ExhibitionMapTab />}
          {tab === 'mails'          && <MailsTab />}
        </div>
      </div>
    </div>
  );
}
