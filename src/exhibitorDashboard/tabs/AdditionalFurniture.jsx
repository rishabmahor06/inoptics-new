import React from "react";
import TabShell from "../TabShell";
import { MdChair } from "react-icons/md";

export default function AdditionalFurniture() {
  return (
    <TabShell title="Additional Furniture" Icon={MdChair} subtitle="Request extra furniture for your stall">
      <Placeholder Icon={MdChair} text="No furniture requests yet — coming soon." />
    </TabShell>
  );
}

function Placeholder({ Icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-400">
        <Icon size={26} />
      </div>
      <p className="text-[14px] text-zinc-500">{text}</p>
    </div>
  );
}
