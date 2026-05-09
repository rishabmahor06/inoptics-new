import React, { useState } from "react";
import { SubTabs } from "../shared/WmShared";
import ForExhibitorsMain  from "./ForExhibitorsMain";
import ForExhibitorsCards from "./ForExhibitorsCards";

const TABS = ["Main", "Cards"];

export default function ForExhibitorsTab() {
  const [active, setActive] = useState("Main");
  return (
    <div>
      <SubTabs tabs={TABS} active={active} onChange={setActive} />
      {active === "Main"  && <ForExhibitorsMain />}
      {active === "Cards" && <ForExhibitorsCards />}
    </div>
  );
}
