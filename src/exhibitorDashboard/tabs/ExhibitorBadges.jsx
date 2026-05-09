import React from "react";
import TabShell from "../TabShell";
import { MdBadge } from "react-icons/md";

export default function ExhibitorBadges() {
  return (
    <TabShell title="Exhibitor Badges" Icon={MdBadge} subtitle="Generate and manage badges for your team">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <MdBadge size={26} />
        </div>
        <p className="text-[14px] text-zinc-500">No exhibitor badges yet — coming soon.</p>
      </div>
    </TabShell>
  );
}
