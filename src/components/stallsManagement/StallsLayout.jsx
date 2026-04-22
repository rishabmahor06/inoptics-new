import React, { useState } from 'react';
import StallAreas from './StallAreas';
import StallNumbers from './StallNumbers';
import HallNumbers from './HallNumbers';
import StallCategories from './StallCategories';

const TABS = [
  { key: 'stall_areas',      label: 'Stall Areas' },
  { key: 'stall_numbers',    label: 'Stall Numbers' },
  { key: 'hall_numbers',     label: 'Hall Numbers' },
  { key: 'stall_categories', label: 'Stall Categories' },
];

const COMPONENTS = {
  stall_areas:      StallAreas,
  stall_numbers:    StallNumbers,
  hall_numbers:     HallNumbers,
  stall_categories: StallCategories,
};

export default function StallsLayout() {
  const [active, setActive] = useState('stall_areas');
  const ActiveComp = COMPONENTS[active];

  return (
    <div>
      {/* Tab Bar */}
      <div className="border-b border-zinc-200 mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2.5 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-all mr-0.5
                ${active === tab.key
                  ? 'text-blue-700 border-blue-600'
                  : 'text-zinc-500 border-transparent hover:text-zinc-800 hover:border-zinc-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ActiveComp />
    </div>
  );
}
