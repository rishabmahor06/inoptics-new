import React, { useState } from "react";
import ExhibitorSidebar, { TABS } from "./ExhibitorSidebar";
import ExhibitorTopbar from "./ExhibitorTopbar";

import Dashboard            from "./tabs/Dashboard";
import Profile              from "./tabs/Profile";
import MailsInbox           from "./tabs/MailsInbox";
import AdditionalFurniture  from "./tabs/AdditionalFurniture";
import AdditionalPower      from "./tabs/AdditionalPower";
import MandatoryForms       from "./tabs/MandatoryForms";
import ExhibitorBadges      from "./tabs/ExhibitorBadges";
import ContractorBadges     from "./tabs/ContractorBadges";
import FasciaName           from "./tabs/FasciaName";
import Payment              from "./tabs/Payment";

import { useMailboxStore } from "./store/useMailboxStore";

const COMPONENTS = {
  "dashboard":            Dashboard,
  "profile":              Profile,
  "mails-inbox":          MailsInbox,
  "additional-furniture": AdditionalFurniture,
  "additional-power":     AdditionalPower,
  "mandatory-forms":      MandatoryForms,
  "exhibitor-badges":     ExhibitorBadges,
  "contractor-badges":    ContractorBadges,
  "fascia-name":          FasciaName,
  "payment":              Payment,
};

export default function ExhibitorPanel() {
  const [active, setActive] = useState(TABS[0].key);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ActivePage = COMPONENTS[active] || Dashboard;

  const mails = useMailboxStore((s) => s.mails);
  const unreadCount = mails.filter(
    (m) => Number(m.is_read) === 0 || m.is_read === "0"
  ).length;

  return (
    <div className="min-h-screen bg-[#f0f0ef] flex flex-col lg:flex-row">
      <ExhibitorSidebar
        active={active}
        onChange={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <ExhibitorTopbar
          active={active}
          onMenuClick={() => setMobileOpen(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 min-w-0 p-2 lg:p-0">
          <ActivePage />
        </main>
      </div>
    </div>
  );
}
