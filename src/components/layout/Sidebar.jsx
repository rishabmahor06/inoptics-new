import React, { useState } from "react";
import {
  MdDashboard,
  MdStorefront,
  MdBrandingWatermark,
  MdBadge,
  MdElectricBolt,
  MdHistory,
  MdChair,
  MdLock,
  MdPayment,
  MdMessage,
  MdTableChart,
  MdDescription,
  MdTune,
  MdLanguage,
  MdEngineering,
  MdPersonAdd,
  MdFileDownload,
  MdSupportAgent,
  MdPermMedia,
  MdLogout,
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdLabel,
  MdEmail,
  MdSend,
} from "react-icons/md";
import { FaHardHat } from "react-icons/fa";
import { useNavStore } from "../../store/useNavStore";

const menuGroups = [
  {
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", icon: MdDashboard },
      {
        id: "exhibitor-dashboard",
        label: "Exhibitor Dashboard",
        icon: MdStorefront,
      },
    ],
  },
  {
    label: "Exhibitor",
    items: [
      { id: "exhibitors", label: "Exhibitors", icon: MdStorefront },
      {
        id: "promotes-brands",
        label: "Promotes Your Brands",
        icon: MdBrandingWatermark,
      },
      { id: "fascia-name", label: "Fascia Name", icon: MdLabel },
      { id: "exhibitor-power", label: "Exhibitor Power", icon: MdElectricBolt },
      { id: "exhibitor-history", label: "Exhibitor History", icon: MdHistory },
      { id: "exhibitor-badges", label: "Exhibitor Badges", icon: MdBadge },
      { id: "extra-furniture", label: "Extra Furniture", icon: MdChair },
      {
        id: "contractor-badges",
        label: "Contractor Badges",
        icon: FaHardHat,
      },
      {
        id: "mandatory-forms",
        label: "Exhibitor Mandatory Forms",
        icon: MdDescription,
      },
      { id: "unlock-contractor", label: "Unlock Contractor", icon: MdLock },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "payments", label: "Payments", icon: MdPayment },
      { id: "communication", label: "Communication", icon: MdMessage },
      {
        id: "stalls-management",
        label: "Stalls Management",
        icon: MdTableChart,
      },
      { id: "forms", label: "Forms", icon: MdDescription },
      { id: "masters", label: "Masters", icon: MdTune },
      {
        id: "website-management",
        label: "Website Management",
        icon: MdLanguage,
      },
      { id: "contractor", label: "Contractor", icon: MdEngineering },
      {
        id: "new-exhibitor-request",
        label: "New Exhibitor Request",
        icon: MdPersonAdd,
      },
      
    ],
  },
  {
    label: "Support & Media",
    items: [
      {
        id: "contact-support",
        label: "Contact Support",
        icon: MdSupportAgent,
      },
      { id: "media", label: "Media", icon: MdPermMedia },
      { id: "export", label: "Export", icon: MdFileDownload },
    ],
  },
];

const MASTER_SUB_ITEMS = [
  { id: 'business_requirement',  label: 'Business Requirement' },
  { id: 'products',              label: 'Products' },
  { id: 'taxes',                 label: 'Taxes' },
  { id: 'currency',              label: 'Currency' },
  { id: 'proforma',              label: 'Proforma' },
  { id: 'badges_limit',          label: 'Badges Limit' },
  { id: 'power_requirement',     label: 'Power Requirement' },
  { id: 'message_rules',         label: 'Message Rules' },
  { id: 'exhibitor_series_edit', label: 'Exhibitor Series Edit' },
  { id: 'furniture_requirement', label: 'Furniture Requirement' },
];

function MastersNavItem({ collapsed }) {
  const { activeTab, masterSubTab, setMasterSubTab, setActiveTab } = useNavStore();
  const isActive = activeTab === 'masters';
  const [open, setOpen] = useState(isActive);

  function handleMain() {
    setActiveTab('masters');
    setOpen(prev => !prev);
  }

  return (
    <div>
      <button
        type="button"
        title={collapsed ? 'Masters' : ''}
        onClick={handleMain}
        className={`flex items-center w-full rounded-lg text-sm font-medium px-3 py-2 transition-all duration-150
          ${collapsed ? 'justify-center' : 'gap-3'}
          ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
      >
        <MdTune size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">Masters</span>
            {open ? <MdExpandLess size={16} className="shrink-0" /> : <MdExpandMore size={16} className="shrink-0" />}
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-0.5 ml-3 pl-3 border-l-2 border-zinc-200 space-y-0.5">
          {MASTER_SUB_ITEMS.map(sub => {
            const subActive = isActive && masterSubTab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setMasterSubTab(sub.id)}
                className={`flex items-center gap-2.5 w-full rounded-lg text-[13px] font-medium px-2.5 py-1.5 transition-all duration-150
                  ${subActive ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'}`}
              >
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const COMM_SUB_ITEMS = [
  { id: 'emails',    label: 'Emails Master',    icon: MdEmail },
  { id: 'bulk',      label: 'Send Bulk Emails', icon: MdSend },
  { id: 'power',     label: 'Power Vendor',     icon: MdElectricBolt },
  { id: 'furniture', label: 'Furniture Vendor', icon: MdChair },
];

function CommNavItem({ collapsed }) {
  const { activeTab, communicationSubTab, setCommunicationSubTab, setActiveTab } = useNavStore();
  const isActive = activeTab === 'communication';
  const [open, setOpen] = useState(isActive);

  function handleMain() {
    setActiveTab('communication');
    setOpen(prev => !prev);
  }

  return (
    <div>
      <button
        type="button"
        title={collapsed ? 'Communication' : ''}
        onClick={handleMain}
        className={`flex items-center w-full rounded-lg text-sm font-medium px-3 py-2 transition-all duration-150
          ${collapsed ? 'justify-center' : 'gap-3'}
          ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
      >
        <MdMessage size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left">Communication</span>
            {open
              ? <MdExpandLess size={16} className="shrink-0" />
              : <MdExpandMore size={16} className="shrink-0" />
            }
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-0.5 ml-3 pl-3 border-l-2 border-zinc-200 space-y-0.5">
          {COMM_SUB_ITEMS.map(sub => {
            const SubIcon = sub.icon;
            const subActive = isActive && communicationSubTab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setCommunicationSubTab(sub.id)}
                className={`flex items-center gap-2.5 w-full rounded-lg text-[13px] font-medium px-2.5 py-1.5 transition-all duration-150
                  ${subActive
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                  }`}
              >
                <SubIcon size={15} className="shrink-0" />
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavItem({ item, collapsed }) {
  const { activeTab, setActiveTab } = useNavStore();

  if (item.id === 'communication') return <CommNavItem collapsed={collapsed} />;
  if (item.id === 'masters') return <MastersNavItem collapsed={collapsed} />;

  const active = activeTab === item.id;
  const Icon = item.icon;

  return (
    <button
      type="button"
      title={collapsed ? item.label : ""}
      onClick={() => setActiveTab(item.id)}
      className={`flex items-center w-full rounded-lg text-sm font-medium px-3 py-2 transition-all duration-150
        ${collapsed ? "justify-center" : "gap-3"}
        ${
          active
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

function SectionGroup({
  group,
  collapsed,
  collapsedSections,
  toggleSection,
}) {
  const isOpen = !collapsedSections[group.label];

  return (
    <div className="mb-1">
      {group.label && !collapsed && (
        <button
          type="button"
          onClick={() => toggleSection(group.label)}
          className="flex items-center justify-between w-full px-3 py-2 text-zinc-400 hover:bg-zinc-50 rounded-md"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {group.label}
          </span>

          {isOpen ? (
            <MdExpandLess size={16} />
          ) : (
            <MdExpandMore size={16} />
          )}
        </button>
      )}

      {group.label && collapsed && (
        <div className="border-t border-zinc-200 my-2 mx-2" />
      )}

      {(!group.label || isOpen || collapsed) &&
        group.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
          />
        ))}
    </div>
  );
}

export default function Sidebar({
  collapsed = false,
  onCollapse,
  onMobileClose,
  isMobile = false,
}) {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (label) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-white border-r border-zinc-200 flex flex-col overflow-hidden transition-all duration-200`}
    >
      {/* Header */}
      <div
        className={`h-14 px-3 border-b border-zinc-100 flex items-center shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              A
            </div>

            <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">
              Admin Panel
            </span>
          </div>
        )}

        {!isMobile ? (
          <button
            type="button"
            onClick={onCollapse}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {collapsed ? (
              <MdChevronRight size={20} />
            ) : (
              <MdChevronLeft size={20} />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onMobileClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
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

      {/* Footer */}
      <div className="p-2 border-t border-zinc-100">
        <button
          type="button"
          className={`flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <MdLogout size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}