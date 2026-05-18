import React, { useEffect } from "react";
import TabShell from "../TabShell";
import {
  MdPayments,
  MdAccountBalance,
  MdStorefront,
  MdPower,
  MdBadge,
  MdCheckCircle,
  MdWarning,
  MdRefresh,
} from "react-icons/md";
import { usePaymentStore, BANK_DETAILS } from "../store/usePaymentStore";
import { getExhibitor } from "../api/base";

export default function Payment() {
  const {
    stallSummary,
    stallCleared,
    power,
    powerCleared,
    badgeBilling,
    badgeCleared,
    exhibitor: storeExhibitor,
    loading,
    fetchAll,
  } = usePaymentStore();
  const exhibitor = storeExhibitor || getExhibitor();
  const isDelhi = (exhibitor?.state || "").trim().toLowerCase() === "delhi";
  const currency = stallSummary?.currency || "₹";

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <TabShell
      title="Payments"
      Icon={MdPayments}
      subtitle="Bank details, billing summary and pending dues"
    >
      <div className="flex justify-end mb-3">
        <button
          onClick={fetchAll}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded disabled:opacity-60"
        >
          <MdRefresh size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <BankCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <StallCard
          summary={stallSummary}
          cleared={stallCleared}
          isDelhi={isDelhi}
          currency={currency}
        />
        <PowerCard
          power={power}
          cleared={powerCleared}
          isDelhi={isDelhi}
          currency={currency}
        />
        <BadgeCard
          billing={badgeBilling}
          cleared={badgeCleared}
          currency={currency}
        />
      </div>
    </TabShell>
  );
}

/* ============== Bank Details ============== */

function BankCard() {
  return (
    <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
          <MdAccountBalance size={15} />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#02062c]">
          Our Bank Details
        </h3>
        <span className="ml-auto text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400">
          A/C: RSD EXPOSITIONS
        </span>
      </div>
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {BANK_DETAILS.map((b, i) => (
          <div
            key={i}
            className="border border-zinc-100 rounded p-3 bg-zinc-50/40"
          >
            <p className="text-[13px] font-bold text-[#02062c] truncate">
              {b.bank}
            </p>
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400 mt-2">
              A/C No.
            </p>
            <p className="text-[13px] font-mono text-zinc-800">{b.acc}</p>
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400 mt-1.5">
              IFSC
            </p>
            <p className="text-[12.5px] font-mono text-zinc-800">{b.ifsc}</p>
            <p className="text-[11px] text-zinc-500 mt-1.5">{b.addr}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============== Stall Card ============== */

function StallCard({ summary, cleared, isDelhi, currency }) {
  if (!summary) return <CardShell title="Stall Particulars" Icon={MdStorefront}><Skel /></CardShell>;
  const pending = Math.max(0, summary.grand_total - cleared);
  const discountPct =
    summary.total > 0
      ? ((summary.discounted_amount / summary.total) * 100).toFixed(0)
      : 0;

  return (
    <CardShell
      title="Stall Particulars"
      Icon={MdStorefront}
      tone="blue"
      paid={pending <= 0 && summary.grand_total > 0}
    >
      {summary.stalls?.length > 0 && (
        <div className="space-y-1.5 mb-3 pb-3 border-b border-dashed border-zinc-200">
          {summary.stalls.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-2 text-[12px] bg-zinc-50/60 border border-zinc-100 rounded px-2.5 py-1.5"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                  Stall #
                </p>
                <p className="font-bold text-zinc-800">{s.stall_number || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                  Area
                </p>
                <p className="font-bold text-zinc-800">
                  {s.stall_area ? `${s.stall_area}m²` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                  Rate
                </p>
                <p className="font-bold text-zinc-800">
                  {s.stall_price
                    ? `${s.currency || currency} ${s.stall_price}`
                    : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <BillingRows currency={currency}>
        <Row label="Total" value={summary.total} currency={currency} />
        {summary.discounted_amount > 0 && (
          <Row
            label={`Discount (${discountPct}%)`}
            value={summary.discounted_amount}
            currency={currency}
          />
        )}
        {isDelhi ? (
          <>
            <Row label="SGST (9%)" value={summary.sgst} currency={currency} muted />
            <Row label="CGST (9%)" value={summary.cgst} currency={currency} muted />
          </>
        ) : (
          <Row label="IGST (18%)" value={summary.igst} currency={currency} muted />
        )}
        <Row label="Grand Total" value={summary.grand_total} currency={currency} total />
        <Row label="Amount Received" value={cleared} currency={currency} />
        <StatusRow pending={pending} currency={currency} grandTotal={summary.grand_total} />
      </BillingRows>
    </CardShell>
  );
}

/* ============== Power Card ============== */

function PowerCard({ power, cleared, isDelhi, currency }) {
  const pending = Math.max(0, power.grandTotal - cleared);

  return (
    <CardShell
      title="Power Requirement"
      Icon={MdPower}
      tone="amber"
      paid={pending <= 0 && power.grandTotal > 0}
    >
      {power.rows?.length > 0 && (
        <div className="mb-3 pb-3 border-b border-dashed border-zinc-200">
          <div className="grid grid-cols-5 gap-1 px-2 py-1.5 bg-zinc-50 rounded-t text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            <span>Day</span>
            <span>Phase</span>
            <span className="text-right">₹/KW</span>
            <span className="text-right">KW</span>
            <span className="text-right">Amt</span>
          </div>
          {power.rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-1 px-2 py-1.5 text-[11.5px] border-b border-zinc-50 last:border-b-0"
            >
              <span className="font-medium text-zinc-700 truncate">
                {r.day?.replace(/days?/i, "").trim() || "—"}
              </span>
              <span className="text-zinc-600 truncate">
                {r.phase?.replace(/phase?/i, "").trim() || "—"}
              </span>
              <span className="text-right text-zinc-700">{r.pricePerKw}</span>
              <span className="text-right text-zinc-700">{r.powerRequired}</span>
              <span className="text-right font-bold text-emerald-700">
                {r.totalAmount}
              </span>
            </div>
          ))}
        </div>
      )}

      <BillingRows currency={currency}>
        <Row label="Total" value={power.totalPrice} currency={currency} />
        {isDelhi ? (
          <>
            <Row label="CGST (9%)" value={power.cgst} currency={currency} muted />
            <Row label="SGST (9%)" value={power.sgst} currency={currency} muted />
          </>
        ) : (
          <Row label="IGST (18%)" value={power.igst} currency={currency} muted />
        )}
        <Row label="Grand Total" value={power.grandTotal} currency={currency} total />
        <Row label="Amount Received" value={cleared} currency={currency} />
        <StatusRow pending={pending} currency={currency} grandTotal={power.grandTotal} />
      </BillingRows>
    </CardShell>
  );
}

/* ============== Badge Card ============== */

function BadgeCard({ billing, cleared, currency }) {
  if (!billing) return <CardShell title="Exhibitor Paid Badges" Icon={MdBadge}><Skel /></CardShell>;
  const pending = Math.max(0, billing.grandTotal - cleared);

  return (
    <CardShell
      title="Exhibitor Paid Badges"
      Icon={MdBadge}
      tone="purple"
      paid={pending <= 0 && billing.grandTotal > 0}
    >
      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-dashed border-zinc-200">
        <div className="bg-zinc-50/60 border border-zinc-100 rounded px-2.5 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
            Per Badge
          </p>
          <p className="text-[14px] font-bold text-[#02062c]">
            {currency} {billing.rate}
          </p>
        </div>
        <div className="bg-zinc-50/60 border border-zinc-100 rounded px-2.5 py-2 text-center">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
            Extra Badges
          </p>
          <p className="text-[14px] font-bold text-[#02062c]">
            {billing.count}
          </p>
        </div>
      </div>

      <BillingRows currency={currency}>
        <Row label="Total" value={billing.total} currency={currency} />
        {billing.isDelhi ? (
          <>
            <Row label="CGST (9%)" value={billing.cgst} currency={currency} muted />
            <Row label="SGST (9%)" value={billing.sgst} currency={currency} muted />
          </>
        ) : (
          <Row label="IGST (18%)" value={billing.igst} currency={currency} muted />
        )}
        <Row label="Grand Total" value={billing.grandTotal} currency={currency} total />
        <Row label="Amount Received" value={cleared} currency={currency} />
        <StatusRow pending={pending} currency={currency} grandTotal={billing.grandTotal} />
      </BillingRows>
    </CardShell>
  );
}

/* ============== Reusable bits ============== */

function CardShell({ title, Icon, tone = "blue", paid, children }) {
  const tones = {
    blue: "from-blue-500 to-indigo-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500",
  };
  return (
    <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
      <div className="relative">
        <div className={`h-1.5 bg-linear-to-r ${tones[tone]}`} />
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-700 flex items-center justify-center">
                <Icon size={15} />
              </div>
            )}
            <h3 className="text-[13.5px] font-bold text-[#02062c]">{title}</h3>
          </div>
          {paid && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <MdCheckCircle size={11} /> Paid
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}

function BillingRows({ children }) {
  return <div className="space-y-1.5">{children}</div>;
}

function Row({ label, value = 0, currency = "₹", total, muted }) {
  return (
    <div
      className={`flex items-center justify-between text-[12.5px] ${
        total ? "pt-1.5 border-t border-zinc-100" : ""
      }`}
    >
      <span className={muted ? "text-zinc-500" : "text-zinc-600"}>{label}</span>
      <span
        className={`font-semibold ${
          total ? "text-[14px] text-[#02062c]" : muted ? "text-zinc-600" : "text-zinc-800"
        }`}
      >
        {currency} {Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

function StatusRow({ pending, currency, grandTotal }) {
  const isPaid = pending <= 0 && grandTotal > 0;
  return (
    <div
      className={`mt-2 flex items-center justify-between px-3 py-2 rounded border ${
        isPaid
          ? "bg-emerald-50 border-emerald-200"
          : pending > 0
            ? "bg-red-50 border-red-200"
            : "bg-zinc-50 border-zinc-200"
      }`}
    >
      <span
        className={`inline-flex items-center gap-1 text-[12px] font-bold ${
          isPaid ? "text-emerald-700" : pending > 0 ? "text-red-700" : "text-zinc-600"
        }`}
      >
        {isPaid ? <MdCheckCircle size={14} /> : <MdWarning size={14} />}
        {isPaid ? "Amount Paid" : "Balance Due"}
      </span>
      <span
        className={`text-[14px] font-bold ${
          isPaid ? "text-emerald-700" : pending > 0 ? "text-red-700" : "text-zinc-700"
        }`}
      >
        {currency} {Number(pending || 0).toFixed(2)}
      </span>
    </div>
  );
}

function Skel() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-4 bg-zinc-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
