import React, { useState } from "react";
import { SubTabs } from "../shared/WmShared";
import VisitorGuideMain  from "./VisitorGuideMain";
import VisitorGuideCards from "./VisitorGuideCards";
import VisitorMetroMap   from "./VisitorMetroMap";

const TABS = ["Main", "Cards", "Metro Map"];

export default function VisitorGuideTab() {
  const [active, setActive] = useState("Main");
  return (
    <div>
      <SubTabs tabs={TABS} active={active} onChange={setActive} />
      {active === "Main"      && <VisitorGuideMain />}
      {active === "Cards"     && <VisitorGuideCards />}
      {active === "Metro Map" && <VisitorMetroMap />}
    </div>
  );
}
