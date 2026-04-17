import React, { useState } from 'react';
import {
  MdDashboard, MdStorefront, MdBrandingWatermark, MdBadge, MdElectricBolt,
  MdHistory, MdChair, MdLock, MdPayment, MdMessage, MdTableChart,
  MdDescription, MdTune, MdLanguage, MdEngineering, MdPersonAdd,
  MdFileDownload, MdSupportAgent, MdPermMedia, MdLogout,
  MdChevronLeft, MdChevronRight, MdExpandMore, MdExpandLess,
  MdClose, MdLabel,
} from 'react-icons/md';
import { FaHardHat } from 'react-icons/fa';
import { useNavStore } from '../../store/useNavStore';

const menuGroups = [
  {
    label: null,
    items: [
      { id: 'dashboard',           label: 'Dashboard',           icon: MdDashboard },
      { id: 'exhibitor-dashboard', label: 'Exhibitor Dashboard', icon: MdStorefront },
    ],
  },
  {
    label: 'Exhibitor',
    items: [
      { id: 'exhibitors',        label: 'Exhibitors',                icon: MdStorefront },
      { id: 'promotes-brands',   label: 'Promotes Your Brands',      icon: MdBrandingWatermark },
      { id: 'fascia-name',       label: 'Fascia Name',               icon: MdLabel },
      { id: 'exhibitor-power',   label: 'Exhibitor Power',           icon: MdElectricBolt },
      { id: 'exhibitor-history', label: 'Exhibitor History',         icon: MdHistory },
      { id: 'exhibitor-badges',  label: 'Exhibitor Badges',          icon: MdBadge },
      { id: 'extra-furniture',   label: 'Extra Furniture',           icon: MdChair },
      { id: 'contractor-badges', label: 'Contractor Badges',         icon: FaHardHat },
      { id: 'mandatory-forms',   label: 'Exhibitor Mandatory Forms', icon: MdDescription },
      { id: 'unlock-contractor', label: 'Unlock Contractor',         icon: MdLock },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'payments',              label: 'Payments',              icon: MdPayment },
      { id: 'communication',         label: 'Communication',         icon: MdMessage },
      { id: 'stalls-management',     label: 'Stalls Management',     icon: MdTableChart },
      { id: 'forms',                 label: 'Forms',                 icon: MdDescription },
      { id: 'masters',               label: 'Masters',               icon: MdTune },
      { id: 'website-management',    label: 'Website Management',    icon: MdLanguage },
      { id: 'contractor',            label: 'Contractor',            icon: MdEngineering },
      { id: 'new-exhibitor-request', label: 'New Exhibitor Request', icon: MdPersonAdd },
      { id: 'export-contractor',     label: 'Export Contractor',     icon: MdFileDownload },
    ],
  },
  {
    label: 'Support & Media',
    items: [
      { id: 'contact-support', label: 'Contact Support', icon: MdSupportAgent },
      { id: 'media',           label: 'Media',           icon: MdPermMedia },
      { id: 'export',          label: 'Export',          icon: MdFileDownload },
    ],
  },
];

function NavItem({ item, collapsed }) {
  const { activeTab, setActiveTab } = useNavStore();
  const active = activeTab === item.id;
  const Icon = item.icon;

  return (
    <button
      title={collapsed ? item.label : undefined}
      onClick={() => setActiveTab(item.id)}
      className={`flex items-center w-full rounded-lg text-[13px] font-medium transition-all duration-100 px-2.5 py-2 border-0 text-left whitespace-nowrap overflow-hidden cursor-pointer
        ${collapsed ? 'justify-center' : 'justify-start gap-2.5'}
        ${active
          ? 'bg-zinc-900 text-white'
          : 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        }`}
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="overflow-hidden text-ellipsis">{item.label}</span>}
    </button>
  );
}

function SectionGroup({ group, collapsed, collapsedSections, toggleSection }) {
  const isOpen = !collapsedSections[group.label];

  return (
    <div className="mb-0.5">
      {group.label && !collapsed && (
        <button
          onClick={() => toggleSection(group.label)}
          className="flex items-center justify-between w-full px-2.5 py-1.5 bg-transparent border-0 cursor-pointer text-zinc-400 hover:bg-zinc-50 rounded-md transition-all"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">{group.label}</span>
          {isOpen ? <MdExpandLess size={14} /> : <MdExpandMore size={14} />}
        </button>
      )}
      {group.label && collapsed && <div className="border-t border-zinc-100 my-1.5 mx-1.5" />}
      {(!group.label || isOpen || collapsed) &&
        group.items.map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed} />
        ))}
    </div>
  );
}

export default function Sidebar({ collapsed, onCollapse, onMobileClose, isMobile }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (label) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-58'} h-full bg-white border-r border-zinc-200 flex flex-col overflow-hidden transition-all duration-200 ease-in-out`}>

      {/* Logo row */}
      <div className={`h-14 flex items-center px-3 border-b border-zinc-100 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-[13px] font-bold">A</span>
            </div>
            <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">Admin Panel</span>
          </div>
        )}

        {!isMobile && (
          <button
            onClick={onCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 border-0 cursor-pointer shrink-0 transition-all"
          >
            {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          </button>
        )}

        {isMobile && (
          <button
            onClick={onMobileClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 border-0 cursor-pointer shrink-0 transition-all"
          >
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 [scrollbar-width:thin] [scrollbar-color:#e4e4e7_transparent]">
        {menuGroups.map((group, i) => (
          <SectionGroup
            key={i}
            group={group}
            collapsed={collapsed}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-zinc-100 shrink-0">
        <button
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center w-full rounded-lg px-2.5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 border-0 cursor-pointer transition-all duration-100
            ${collapsed ? 'justify-center' : 'justify-start gap-2.5'}`}
        >
          <MdLogout size={17} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
