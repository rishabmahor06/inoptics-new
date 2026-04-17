import React, { useEffect, useState } from "react";
import {
  MdPayment,
  MdSearch,
  MdVisibility,
  MdCheckCircle,
  MdPendingActions,
  MdReceiptLong,
} from "react-icons/md";
import { useNavStore } from "../store/useNavStore";
import PaymentDetail from "./paymentTab/PaymentDetail";

function safeNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function fmt(v) {
  return safeNum(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePayStr(str) {
  if (!str) return 0;
  return String(str)
    .split(",")
    .reduce((sum, v) => sum + safeNum(v.trim()), 0);
}

function parsePayArr(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map(safeNum);
}

async function fetchAllPayments() {
  const res = await fetch("https://inoptics.in/api/fetch_all_payments.php");
  const json = await res.json();

  let raw = [];
  if (Array.isArray(json.records)) raw = json.records;
  else if (Array.isArray(json.data)) raw = json.data;
  else if (Array.isArray(json)) raw = json;

  return raw.map((row) => ({
    company_name: row.company_name || "Unknown",

    stallTotal: safeNum(row.stall_total),
    power: safeNum(row.power_total),
    exhibitorBadgesTotal: safeNum(row.badges_total),

    stallPaid: parsePayStr(row.stall_payments),
    powerPaid: parsePayStr(row.power_payments),
    badgePaid: parsePayStr(row.badge_payments),

    stall_tds: safeNum(row.stall_tds_total),
    power_tds: safeNum(row.power_tds_total),
    badge_tds: safeNum(row.badge_tds_total),
    total_tds: safeNum(row.total_tds),

    paid_total: safeNum(row.paid_total),
    total: safeNum(row.total),
    pending: safeNum(row.pending),

    stall_payments_arr: parsePayArr(row.stall_payments),
    power_payments_arr: parsePayArr(row.power_payments),
    badge_payments_arr: parsePayArr(row.badge_payments),

    raw_rows: [row],
  }));
}

const COL_HEAD =
  "px-3 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap";
const COL_CELL = "px-3 py-3 text-[13px] text-zinc-700 whitespace-nowrap";
const AMT_CELL =
  "px-3 py-3 text-[13px] text-right whitespace-nowrap tabular-nums";

export default function Payments() {
  const { selectedPayment, setSelectedPayment } = useNavStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllPayments()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (selectedPayment) return <PaymentDetail />;

  const filtered = rows.filter((r) =>
    (r.company_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const grandTotal = filtered.reduce((s, r) => s + r.total, 0);
  const grandPaid = filtered.reduce((s, r) => s + r.paid_total, 0);
  const grandPending = filtered.reduce((s, r) => s + r.pending, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-900">All Payments</h3>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full lg:w-72">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company..."
                className="w-full h-10 pl-9 pr-3 text-sm border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
              />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {/* Total */}
              <div className="min-w-[170px] bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <MdReceiptLong size={18} className="text-zinc-700" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Total
                  </p>
                  <p className="text-sm font-bold text-zinc-900">
                    ₹{fmt(grandTotal)}
                  </p>
                </div>
              </div>

              {/* Received */}
              <div className="min-w-[170px] bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <MdCheckCircle size={18} className="text-emerald-600" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Received
                  </p>
                  <p className="text-sm font-bold text-emerald-700">
                    ₹{fmt(grandPaid)}
                  </p>
                </div>
              </div>

              {/* Pending */}
              <div className="min-w-[170px] bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <MdPendingActions size={18} className="text-amber-600" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Pending
                  </p>
                  <p className="text-sm font-bold text-amber-700">
                    ₹{fmt(grandPending)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdPayment size={44} />
            <p className="text-sm text-zinc-400">Loading payments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdPayment size={44} />
            <p className="text-sm text-zinc-400">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-200 text-zinc-900">
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    ID
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold min-w-[260px]">
                    Company Name
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Stall
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Power
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Ex Badge
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Stall Pay Received
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    TDS
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Power Pay Received
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    TDS
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Ex Badge Pay Received
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    TDS
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Total
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Received Amount
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Pending Amount
                  </th>
                  <th className="border border-slate-300 px-3 py-3 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, index) => {
                  const total =
                    item.stallTotal + item.power + item.exhibitorBadgesTotal;

                  const received =
                    item.stallPaid +
                    item.stall_tds +
                    item.powerPaid +
                    item.power_tds +
                    item.badgePaid +
                    item.badge_tds;

                  const pending = total - received;

                  return (
                    <tr
                      key={item.company_name}
                      className="hover:bg-zinc-50 transition"
                    >
                      <td className="border border-slate-200 px-3 py-2 text-center">
                        {index + 1}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 font-semibold whitespace-nowrap">
                        {item.company_name}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center">
                        {Math.round(item.stallTotal)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center">
                        {Math.round(item.power)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center">
                        {Math.round(item.exhibitorBadgesTotal)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-emerald-700 font-medium">
                        {Math.round(item.stallPaid)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-blue-600">
                        {Math.round(item.stall_tds)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-emerald-700 font-medium">
                        {Math.round(item.powerPaid)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-blue-600">
                        {Math.round(item.power_tds)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-emerald-700 font-medium">
                        {Math.round(item.badgePaid)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center text-blue-600">
                        {Math.round(item.badge_tds)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold">
                        {Math.round(total)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-emerald-700">
                        {Math.round(received)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center font-semibold text-red-500">
                        {Math.round(pending)}
                      </td>

                      <td className="border border-slate-200 px-3 py-2 text-center">
                        <button
                          onClick={() => setSelectedPayment(item)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-zinc-900 text-white font-semibold sticky bottom-0">
                  <td
                    colSpan={11}
                    className="border border-zinc-800 px-3 py-3 text-right"
                  >
                    Grand Total
                  </td>

                  <td className="border border-zinc-800 px-3 py-3 text-center">
                    {Math.round(grandTotal)}
                  </td>

                  <td className="border border-zinc-800 px-3 py-3 text-center text-emerald-300">
                    {Math.round(grandPaid)}
                  </td>

                  <td className="border border-zinc-800 px-3 py-3 text-center text-red-300">
                    {Math.round(grandPending)}
                  </td>

                  <td className="border border-zinc-800"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">
          {label}
        </p>
        <p className="text-xl font-bold text-zinc-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}
