import React, { useState } from 'react';
import { MdArrowBack, MdStorefront } from 'react-icons/md';
import { useNavStore } from '../../store/useNavStore';
import BasicDetails        from './BasicDetails';
import Stalls              from './Stalls';
import PowerRequirement    from './PowerRequirement';
import ExhibitorBadgesTab  from './ExhibitorBadgesTab';
import AppointedContractor from './AppointedContractor';
import ExtraFurnitureReq   from './ExtraFurnitureReq';
import PaymentDetails      from './PaymentDetails';
import Brands              from './Brands';

const TABS = [
  { id: 'basic',      label: 'Basic Details',               component: BasicDetails },
  { id: 'stalls',     label: 'Stalls',                      component: Stalls },
  { id: 'power',      label: 'Power Requirement',           component: PowerRequirement },
  { id: 'badges',     label: 'Exhibitor Badges',            component: ExhibitorBadgesTab },
  { id: 'contractor', label: 'Appointed Contractor',        component: AppointedContractor },
  { id: 'furniture',  label: 'Extra Furniture Requirement', component: ExtraFurnitureReq },
  { id: 'payment',    label: 'Payment Details',             component: PaymentDetails },
  { id: 'brands',     label: 'Brands',                      component: Brands },
];

export default function ExhibitorEditView() {
  const { editingExhibitor: ex, setEditingExhibitor } = useNavStore();
  const [activeSubTab, setActiveSubTab] = useState('basic');

  if (!ex) return null;

  const ActiveComponent = TABS.find(t => t.id === activeSubTab)?.component || BasicDetails;
  const isPowerTab = activeSubTab === 'power';

  return (
    <div className={isPowerTab ? 'flex h-full min-h-0 flex-col' : ''}>
      {/* Back + company header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setEditingExhibitor(null)}
          className="flex items-center gap-1.5 bg-zinc-100 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-zinc-600 cursor-pointer hover:bg-zinc-200 transition-colors"
        >
          <MdArrowBack size={16} /> Back
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[9px] bg-zinc-900 flex items-center justify-center shrink-0">
            <MdStorefront size={18} className="text-white" />
          </div>
          <div>
            <div className="text-[17px] font-bold text-zinc-900 leading-tight">{ex.company_name}</div>
            {ex.email && <div className="text-xs text-zinc-500">{ex.email}</div>}
          </div>
        </div>
      </div>

      {/* Card with sub-tabs */}
      <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${isPowerTab ? 'flex min-h-0 flex-1 flex-col' : ''}`}>

        {/* Tab bar — using relative + absolute bottom line to avoid border conflict with button reset */}
        <div className="flex overflow-x-auto border-b border-zinc-100 [scrollbar-width:none]">
          {TABS.map(tab => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative px-4 py-3 text-[13px] whitespace-nowrap transition-colors cursor-pointer shrink-0
                  ${active
                    ? 'font-bold text-zinc-900'
                    : 'font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                  }`}
              >
                {tab.label}
                {/* Active underline indicator */}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${active ? 'bg-zinc-900' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={isPowerTab ? 'flex-1 min-h-0 overflow-hidden p-5' : 'p-5'}>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
