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

  return (
    <div>
      {/* Back + company header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setEditingExhibitor(null)}
          className="flex items-center gap-1.5 bg-zinc-100 border-0 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-zinc-600 cursor-pointer hover:bg-zinc-200 transition-colors"
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-zinc-100 px-1 [scrollbar-width:none]">
          {TABS.map(tab => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-3 text-[13px] whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer border-0 bg-transparent
                  ${active
                    ? 'font-bold text-zinc-900 border-b-zinc-900'
                    : 'font-medium text-zinc-500 border-b-transparent hover:text-zinc-900'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
