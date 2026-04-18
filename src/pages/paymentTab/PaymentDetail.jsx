import React, { useEffect, useState } from "react";
import {
  MdArrowBack,
  MdBusiness,
  MdStorefront,
  MdElectricBolt,
  MdBadge,
  MdCheckCircle,
  MdPendingActions,
  MdReceiptLong,
  MdMail,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";

function safeNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmt(v) {
  return Math.round(safeNum(v)).toLocaleString("en-IN");
}

function fmtFull(v) {
  return safeNum(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const TH =
  "px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap bg-zinc-50";
const TD =
  "px-3 py-3 text-[13px] text-zinc-700 whitespace-nowrap border-b border-zinc-50";
const TDR =
  "px-3 py-3 text-[13px] text-right whitespace-nowrap tabular-nums border-b border-zinc-50";

/* ─── Billing row inside cards ─── */
function BRow({ label, value, bold, color }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0 ${bold ? "font-bold" : ""}`}
    >
      <span className={`text-[13px] ${color || "text-zinc-600"}`}>{label}</span>
      <span className={`text-[13px] tabular-nums ${color || "text-zinc-800"}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── Card wrapper ─── */
function ChargeCard({ icon, title, accentBg, children }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col">
      <div
        className={`px-5 py-4 flex items-center justify-between border-b border-zinc-100 ${accentBg}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <h4 className="text-[13px] font-bold text-zinc-900">{title}</h4>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors shrink-0">
          <MdMail size={13} /> Send Mail
        </button>
      </div>
      <div className="p-4 flex-1 space-y-4">{children}</div>
    </div>
  );
}

/* ─── Stat pill ─── */
function StatPill({ icon, label, value, bg }) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
          {label}
        </p>
        <p className="text-lg font-bold text-zinc-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function PaymentDetail() {
  const { selectedPayment: ex, setSelectedPayment } = useNavStore();

  const [stallRows, setStallRows] = useState([]);
  const [payments, setPayments] = useState([]);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    if (!ex) return;
    setDetailLoading(true);

    const ALL_FIELDS = [
      "Company Name",
      "Stall Number",
      "Stall Category",
      "Stall Price",
      "Stall Area",
      "Total",
      "Discount(%)",
      "Discount Amount",
      "Total After Discount",
      "SGST(9%)",
      "CGST(9%)",
      "IGST(18%)",
      "Grand Total",
    ];

    Promise.all([
      fetch("https://inoptics.in/api/fetch_excel_stall_details.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: ALL_FIELDS }),
      })
        .then((r) => r.json())
        .then((d) => {
          const arr = d.data || (Array.isArray(d) ? d : []);
          const companyName = ex.company_name.trim().toUpperCase();
          return arr.filter(
            (row) =>
              (row["Company Name"] || "").trim().toUpperCase() === companyName,
          );
        })
        .catch(() => []),

      fetch("https://inoptics.in/api/get_exhibitor_payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: ex.company_name }),
      })
        .then((r) => r.json())
        .then((d) => d.records || [])
        .catch(() => []),
    ])
      .then(([stalls, pays]) => {
        setStallRows(stalls);
        setPayments(pays);
      })
      .finally(() => setDetailLoading(false));
  }, [ex]);

  if (!ex) return null;

  /* ── Pending calcs ── */
  const stallPending = Math.max(
    0,
    safeNum(ex.stallTotal) - safeNum(ex.stallPaid) - safeNum(ex.stall_tds),
  );
  const powerPending = Math.max(
    0,
    safeNum(ex.power) - safeNum(ex.powerPaid) - safeNum(ex.power_tds),
  );
  const badgePending = Math.max(
    0,
    safeNum(ex.exhibitorBadgesTotal) -
      safeNum(ex.badgePaid) -
      safeNum(ex.badge_tds),
  );

  const raw = ex.raw_rows?.[0] || {};
  const isIGST = safeNum(raw.power_igst) > 0;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white px-3 py-2">
  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
    
    {/* Left Section */}
    <div className="flex items-start gap-3 min-w-0 flex-1">
      
      {/* Back Button */}
      <button
        onClick={() => setSelectedPayment(null)}
        className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition flex items-center justify-center shrink-0"
      >
        <MdArrowBack size={17} className="text-zinc-700" />
      </button>

      {/* Company + Stall Info */}
      <div className="min-w-0 flex-1">
        <h2 className="text-base md:text-lg font-bold text-zinc-900 truncate">
          {ex.company_name}
        </h2>

        {stallRows.length === 1 ? (
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              Stall:{" "}
              <span className="font-semibold text-zinc-900">
                {stallRows[0]["Stall Number"]}
              </span>
            </span>

            <span className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              {stallRows[0]["Stall Category"]}
            </span>

            <span className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              {stallRows[0]["Stall Area"]}
            </span>
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50">
                <tr>
                  <th className={TH}>Stall</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Area</th>
                </tr>
              </thead>
              <tbody>
                {stallRows.map((s, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className={TD}>{s["Stall Number"]}</td>
                    <td className={TD}>{s["Stall Category"]}</td>
                    <td className={TD}>{s["Stall Area"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Right Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:min-w-[520px] w-full xl:w-auto">
      
      {/* Total */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <MdReceiptLong size={16} className="text-zinc-700" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
            Total
          </p>
          <p className="text-sm font-bold text-zinc-900">
            ₹{fmt(ex.total)}
          </p>
        </div>
      </div>

      {/* Received */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <MdCheckCircle size={16} className="text-emerald-700" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">
            Received
          </p>
          <p className="text-sm font-bold text-emerald-700">
            ₹{fmt(ex.paid_total)}
          </p>
        </div>
      </div>

      {/* Pending */}
      <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <MdPendingActions size={16} className="text-red-600" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold">
            Pending
          </p>
          <p className="text-sm font-bold text-red-600">
            ₹{fmt(ex.pending)}
          </p>
        </div>
      </div>

    </div>
  </div>
</div>

      {/* ── 3 Cards ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* ── Stall Charges ── */}
        <ChargeCard
          icon={<MdStorefront size={16} className="text-zinc-700" />}
          title="Stall Charges"
          accentBg="bg-zinc-50"
        >
          {detailLoading ? (
            <p className="text-[13px] text-zinc-400 italic">Loading…</p>
          ) : stallRows.length === 0 ? (
            <p className="text-[13px] text-zinc-400 italic">
              No stall data found.
            </p>
          ) : (
            <>
              {/* Stall info */}
              {stallRows.length === 1 ? (
                <div className="bg-zinc-50 rounded-lg px-3 py-2 space-y-1 text-[13px]">
                  <p>
                    <span className="text-zinc-400 font-medium">Stall:</span>{" "}
                    <span className="font-semibold text-zinc-900">
                      {stallRows[0]["Stall Number"]}
                    </span>
                  </p>
                  <p>
                    <span className="text-zinc-400 font-medium">Category:</span>{" "}
                    {stallRows[0]["Stall Category"]}
                  </p>
                  <p>
                    <span className="text-zinc-400 font-medium">Area:</span>{" "}
                    {stallRows[0]["Stall Area"]}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-zinc-100">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className={TH}>Stall No</th>
                        <th className={TH}>Category</th>
                        <th className={TH}>Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stallRows.map((s, i) => (
                        <tr key={i}>
                          <td className={TD}>{s["Stall Number"]}</td>
                          <td className={TD}>{s["Stall Category"]}</td>
                          <td className={TD}>{s["Stall Area"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Billing breakdown — use first row or aggregate */}
              {(() => {
                const agg = stallRows.reduce(
                  (acc, r) => ({
                    total: acc.total + safeNum(r["Total"]),
                    discAmt: acc.discAmt + safeNum(r["Discount Amount"]),
                    afterDisc:
                      acc.afterDisc + safeNum(r["Total After Discount"]),
                    sgst: acc.sgst + safeNum(r["SGST(9%)"]),
                    cgst: acc.cgst + safeNum(r["CGST(9%)"]),
                    igst: acc.igst + safeNum(r["IGST(18%)"]),
                    grand: acc.grand + safeNum(r["Grand Total"]),
                    discPct: r["Discount(%)"],
                  }),
                  {
                    total: 0,
                    discAmt: 0,
                    afterDisc: 0,
                    sgst: 0,
                    cgst: 0,
                    igst: 0,
                    grand: 0,
                    discPct: 0,
                  },
                );
                const useIGST = agg.igst > 0;
                return (
                  <div className="space-y-0.5">
                    <BRow label="Total" value={`₹${fmt(agg.total)}`} />
                    {agg.discAmt > 0 && (
                      <BRow
                        label={`Discount (${agg.discPct}%)`}
                        value={`- ₹${fmt(agg.discAmt)}`}
                        color="text-red-500"
                      />
                    )}
                    {agg.discAmt > 0 && (
                      <BRow
                        label="Total After Discount"
                        value={`₹${fmt(agg.afterDisc)}`}
                      />
                    )}
                    {useIGST ? (
                      <BRow label="IGST (18%)" value={`₹${fmt(agg.igst)}`} />
                    ) : (
                      <>
                        <BRow label="SGST (9%)" value={`₹${fmt(agg.sgst)}`} />
                        <BRow label="CGST (9%)" value={`₹${fmt(agg.cgst)}`} />
                      </>
                    )}
                    <div className="border-t border-zinc-200 pt-1 mt-1">
                      <BRow
                        label="Grand Total"
                        value={`₹${fmt(agg.grand)}`}
                        bold
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Stall payments */}
              {payments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
                    Payments
                  </p>
                  {payments.map((p, i) => (
                    <div key={i} className="space-y-0.5">
                      <BRow
                        label={`Payment ${i + 1}`}
                        value={`₹${fmtFull(p.amount_paid)}`}
                        color="text-emerald-700"
                      />
                      {safeNum(p.tds) > 0 && (
                        <BRow
                          label={`TDS ${i + 1}`}
                          value={`₹${fmtFull(p.tds)}`}
                          color="text-blue-600"
                        />
                      )}
                    </div>
                  ))}
                  <div className="border-t border-zinc-200 pt-1 mt-1">
                    <BRow
                      label="Total Paid"
                      value={`₹${fmt(ex.stallPaid)}`}
                      bold
                      color="text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-2 mt-1">
                <BRow
                  label={
                    stallPending > 0 ? "Pending Amount" : "Payment Cleared"
                  }
                  value={
                    stallPending > 0 ? `₹${fmt(stallPending)}` : "✓ Cleared"
                  }
                  bold
                  color={stallPending > 0 ? "text-red-500" : "text-emerald-600"}
                />
              </div>
            </>
          )}
        </ChargeCard>

        {/* ── Power Charges ── */}
        <ChargeCard
          icon={<MdElectricBolt size={16} className="text-amber-600" />}
          title="Power Charges"
          accentBg="bg-amber-50/40"
        >
          {safeNum(ex.power) === 0 ? (
            <p className="text-[13px] text-zinc-400 italic">
              No power data found.
            </p>
          ) : (
            <>
              <div className="space-y-0.5">
                <BRow
                  label="Base Amount"
                  value={`₹${fmt(raw.power_base || 0)}`}
                />
                {isIGST ? (
                  <BRow
                    label="IGST (18%)"
                    value={`₹${fmt(raw.power_igst || 0)}`}
                  />
                ) : (
                  <>
                    <BRow
                      label="SGST (9%)"
                      value={`₹${fmt(raw.power_sgst || 0)}`}
                    />
                    <BRow
                      label="CGST (9%)"
                      value={`₹${fmt(raw.power_cgst || 0)}`}
                    />
                  </>
                )}
                <div className="border-t border-zinc-200 pt-1 mt-1">
                  <BRow label="Grand Total" value={`₹${fmt(ex.power)}`} bold />
                </div>
              </div>

              {ex.powerPaid > 0 && (
                <div className="space-y-0.5">
                  {ex.power_payments_arr?.map((amt, i) => (
                    <BRow
                      key={i}
                      label={`Payment ${i + 1}`}
                      value={`₹${fmt(amt)}`}
                      color="text-emerald-700"
                    />
                  ))}
                  <div className="border-t border-zinc-200 pt-1">
                    <BRow
                      label="Total Paid"
                      value={`₹${fmt(ex.powerPaid)}`}
                      bold
                      color="text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-2">
                <BRow
                  label={
                    powerPending > 0 ? "Pending Amount" : "Payment Cleared"
                  }
                  value={
                    powerPending > 0 ? `₹${fmt(powerPending)}` : "✓ Cleared"
                  }
                  bold
                  color={powerPending > 0 ? "text-red-500" : "text-emerald-600"}
                />
              </div>
            </>
          )}
        </ChargeCard>

        {/* ── Exhibitor Badges ── */}
        <ChargeCard
          icon={<MdBadge size={16} className="text-blue-600" />}
          title="Exhibitor Badges"
          accentBg="bg-blue-50/40"
        >
          {safeNum(ex.exhibitorBadgesTotal) === 0 ? (
            <p className="text-[13px] text-zinc-400 italic">
              No badge data found.
            </p>
          ) : (
            <>
              <div className="space-y-0.5">
                <BRow label="Extra Badges" value={safeNum(raw.badge_count)} />
                <BRow
                  label="Total"
                  value={`₹${fmt(ex.exhibitorBadgesTotal)}`}
                />
                {safeNum(ex.badge_tds) > 0 && (
                  <BRow
                    label="TDS Deducted"
                    value={`₹${fmt(ex.badge_tds)}`}
                    color="text-blue-600"
                  />
                )}
                <div className="border-t border-zinc-200 pt-1 mt-1">
                  <BRow
                    label="Grand Total"
                    value={`₹${fmt(ex.exhibitorBadgesTotal)}`}
                    bold
                  />
                </div>
              </div>

              {ex.badgePaid > 0 && (
                <div className="space-y-0.5">
                  {ex.badge_payments_arr?.map((amt, i) => (
                    <BRow
                      key={i}
                      label={`Payment ${i + 1}`}
                      value={`₹${fmt(amt)}`}
                      color="text-emerald-700"
                    />
                  ))}
                  <div className="border-t border-zinc-200 pt-1">
                    <BRow
                      label="Total Paid"
                      value={`₹${fmt(ex.badgePaid)}`}
                      bold
                      color="text-emerald-700"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-2">
                <BRow
                  label={
                    badgePending > 0 ? "Pending Amount" : "Payment Cleared"
                  }
                  value={
                    badgePending > 0 ? `₹${fmt(badgePending)}` : "✓ Cleared"
                  }
                  bold
                  color={badgePending > 0 ? "text-red-500" : "text-emerald-600"}
                />
              </div>
            </>
          )}
        </ChargeCard>
      </div>

      {/* ── Payment Summary Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Payment Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse">
            <thead>
              <tr>
                <th className={TH}>Particulars</th>
                <th className={`${TH} text-right`}>Received Amount</th>
                <th className={`${TH} text-right`}>TDS</th>
                <th className={TH}>Payment Date</th>
                <th className={TH}>Exhibitor Bank</th>
                <th className={TH}>Receiver Bank</th>
                <th className={TH}>Payment Type</th>
              </tr>
            </thead>
            <tbody>
              {detailLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-sm text-zinc-400"
                  >
                    Loading payments…
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-sm text-zinc-400"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <tr
                    key={p.id || i}
                    className="hover:bg-zinc-50/60 transition-colors"
                  >
                    <td className={`${TD} font-semibold text-zinc-900`}>
                      Stall Payment {i + 1}
                    </td>
                    <td className={`${TDR} text-emerald-700 font-medium`}>
                      ₹{fmtFull(p.amount_paid)}
                    </td>
                    <td className={`${TDR} text-blue-600`}>
                      ₹{fmtFull(p.tds)}
                    </td>
                    <td className={TD}>{p.payment_date || "—"}</td>
                    <td className={TD}>{p.name_of_exhibitor_bank || "—"}</td>
                    <td className={TD}>{p.name_of_receiver_bank || "—"}</td>
                    <td className={TD}>{p.payment_type || "—"}</td>
                  </tr>
                ))
              )}

              {/* Grand Total row */}
              {!detailLoading && (
                <tr className="bg-zinc-900 text-white font-bold">
                  <td className="px-3 py-3 text-[13px]">Grand Total</td>
                  <td className="px-3 py-3 text-[13px] text-right text-emerald-300 tabular-nums">
                    ₹{fmt(ex.paid_total)}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-right text-blue-300 tabular-nums">
                    ₹{fmt(ex.total_tds)}
                  </td>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-[13px] text-zinc-400"
                  >
                    Pending: ₹{fmt(ex.pending)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
