import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { useNavStore } from './store/useNavStore';

import Dashboard           from './pages/Dashboard';
import ExhibitorDashboard  from './pages/ExhibitorDashboard';
import Exhibitors          from './pages/Exhibitors';
import PromotesBrands      from './pages/PromotesBrands';
import FasciaName          from './pages/FasciaName';
import ExhibitorPower      from './pages/ExhibitorPower';
import ExhibitorHistory    from './pages/ExhibitorHistory';
import ExhibitorBadges     from './pages/ExhibitorBadges';
import ExtraFurniture      from './pages/ExtraFurniture';
import ContractorBadges    from './pages/ContractorBadges';
import MandatoryForms      from './pages/MandatoryForms';
import UnlockContractor    from './pages/UnlockContractor';
import Payments            from './pages/Payments';
import Communication       from './pages/Communication';
import StallsManagement    from './pages/StallsManagement';
import Forms               from './pages/Forms';
import Masters             from './pages/Masters';
import WebsiteManagement   from './pages/WebsiteManagement';
import Contractor          from './pages/Contractor';
import NewExhibitorRequest from './pages/NewExhibitorRequest';
import ExportContractor    from './pages/ExportContractor';
import ContactSupport      from './pages/ContactSupport';
import Media               from './pages/Media';
import Export              from './pages/Export';

const PAGE_MAP = {
  'dashboard':             Dashboard,
  'exhibitor-dashboard':   ExhibitorDashboard,
  'exhibitors':            Exhibitors,
  'promotes-brands':       PromotesBrands,
  'fascia-name':           FasciaName,
  'exhibitor-power':       ExhibitorPower,
  'exhibitor-history':     ExhibitorHistory,
  'exhibitor-badges':      ExhibitorBadges,
  'extra-furniture':       ExtraFurniture,
  'contractor-badges':     ContractorBadges,
  'mandatory-forms':       MandatoryForms,
  'unlock-contractor':     UnlockContractor,
  'payments':              Payments,
  'communication':         Communication,
  'stalls-management':     StallsManagement,
  'forms':                 Forms,
  'masters':               Masters,
  'website-management':    WebsiteManagement,
  'contractor':            Contractor,
  'new-exhibitor-request': NewExhibitorRequest,
  'export-contractor':     ExportContractor,
  'contact-support':       ContactSupport,
  'media':                 Media,
  'export':                Export,
};

export default function App() {
  const { activeTab } = useNavStore();
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile,          setIsMobile]          = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const ActivePage = PAGE_MAP[activeTab] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden relative bg-[#f0f0ef]">
      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30"
        />
      )}

      {/* Sidebar */}
      <div className={
        isMobile
          ? `fixed top-0 left-0 h-screen z-40 transition-transform duration-200 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'shrink-0 h-screen'
      }>
        <Sidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(prev => !prev)}
          onMobileClose={() => setMobileSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(prev => !prev)} />
        <div className={`flex-1 min-h-0 ${activeTab === 'dashboard' ? 'overflow-y-auto lg:overflow-hidden' : 'overflow-y-auto p-2 lg:p-0'}`}>
          <ActivePage />
        </div>
      </div>
    </div>
  );
}
