import React, { useState } from "react";
import ExhibitorSidebar, { TABS } from "./ExhibitorSidebar";

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
  const ActivePage = COMPONENTS[active] || Dashboard;

  return (
    <div className="min-h-screen bg-[#fafafb] font-[Quicksand,sans-serif] flex flex-col lg:flex-row">
      <ExhibitorSidebar active={active} onChange={setActive} />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
        <ActivePage />
      </main>
    </div>
  );
}
