import React from "react";
import TabShell from "../TabShell";
import { MdPayments } from "react-icons/md";

export default function Payment() {
  return (
    <TabShell title="Payment" Icon={MdPayments} subtitle="Invoices, receipts and pending dues">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <MdPayments size={26} />
        </div>
        <p className="text-[14px] text-zinc-500">No payments yet — coming soon.</p>
      </div>
    </TabShell>
  );
}
