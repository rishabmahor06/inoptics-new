import React, { useEffect, useState } from "react";
import {
  MdPayment,
  MdSearch,
  MdVisibility,
  MdCheckCircle,
  MdPendingActions,
  MdReceiptLong,
  MdChair,
  MdElectricBolt,
  MdBadge,
  MdAccountBalance,
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
  const res  = await fetch("https://inoptics.in/api/fetch_all_payments.php");
  const json = await res.json();

  let raw = [];
  if (Array.isArray(json.records)) raw = json.records;
  else if (Array.isArray(json.data)) raw = json.data;
  else if (Array.isArray(json)) raw = json;

  /* Normalise company name for grouping key —
     lowercase + collapse whitespace so "BAUSCH & LOMB " and
     "bausch & lomb" both map to the same bucket */
  const normalise = (s) =>
    (s || "Unknown").trim().toLowerCase().replace(/\s+/g, " ");

  const grouped = {};

  raw.forEach((row) => {
    const key         = normalise(row.company_name);
    const displayName = (row.company_name || "Unknown").trim();

    if (!grouped[key]) {
      grouped[key] = {
        company_name:         displayName,
        stallTotal:           safeNum(row.stall_total),
        power:                safeNum(row.power_total),
        exhibitorBadgesTotal: safeNum(row.badges_total),
        stallPaid:            parsePayStr(row.stall_payments),
        powerPaid:            parsePayStr(row.power_payments),
        badgePaid:            parsePayStr(row.badge_payments),
        stall_tds:            safeNum(row.stall_tds_total),
        power_tds:            safeNum(row.power_tds_total),
        badge_tds:            safeNum(row.badge_tds_total),
        total_tds:            safeNum(row.total_tds),
        paid_total:           safeNum(row.paid_total),
        total:                safeNum(row.total),
        pending:              safeNum(row.pending),
        stall_payments_arr:   parsePayArr(row.stall_payments),
        power_payments_arr:   parsePayArr(row.power_payments),
        badge_payments_arr:   parsePayArr(row.badge_payments),
        raw_rows:             [row],
      };
    } else {
      const g = grouped[key];
      g.stallTotal           += safeNum(row.stall_total);
      g.power                += safeNum(row.power_total);
      g.exhibitorBadgesTotal += safeNum(row.badges_total);
      g.stallPaid            += parsePayStr(row.stall_payments);
      g.powerPaid            += parsePayStr(row.power_payments);
      g.badgePaid            += parsePayStr(row.badge_payments);
      g.stall_tds            += safeNum(row.stall_tds_total);
      g.power_tds            += safeNum(row.power_tds_total);
      g.badge_tds            += safeNum(row.badge_tds_total);
      g.total_tds            += safeNum(row.total_tds);
      g.paid_total           += safeNum(row.paid_total);
      g.total                += safeNum(row.total);
      g.pending              += safeNum(row.pending);
      g.stall_payments_arr    = g.stall_payments_arr.concat(parsePayArr(row.stall_payments));
      g.power_payments_arr    = g.power_payments_arr.concat(parsePayArr(row.power_payments));
      g.badge_payments_arr    = g.badge_payments_arr.concat(parsePayArr(row.badge_payments));
      g.raw_rows.push(row);
    }
  });

  /* Return values already deduplicated — one entry per company */
  return Object.values(grouped);
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
      .then(data => setRows([...data].sort((a, b) =>
        (a.company_name || '').localeCompare(b.company_name || '')
      )))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (selectedPayment) return <PaymentDetail />;

  /* rows is already sorted A→Z at load time */
  const filtered = rows.filter((r) =>
    (r.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  /* Totals always use ALL rows — not affected by search */
  const grandTotal   = rows.reduce((s, r) => s + r.total, 0);
  const grandPaid    = rows.reduce((s, r) => s + r.paid_total, 0);
  const grandPending = rows.reduce((s, r) => s + r.pending, 0);
  const grandStall   = rows.reduce((s, r) => s + r.stallTotal, 0);
  const grandPower   = rows.reduce((s, r) => s + r.power, 0);
  const grandBadge   = rows.reduce((s, r) => s + r.exhibitorBadgesTotal, 0);
  const grandTds     = rows.reduce((s, r) => s + r.stall_tds + r.power_tds + r.badge_tds, 0);

  const STAT_CARDS = [
    { label: 'Total',       value: grandTotal,   icon: <MdReceiptLong size={20} />,    iconBg: 'bg-zinc-100',    iconColor: 'text-zinc-600',    textColor: 'text-zinc-900'    },
    { label: 'Received',    value: grandPaid,    icon: <MdCheckCircle size={20} />,    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
    { label: 'Pending',     value: grandPending, icon: <MdPendingActions size={20} />, iconBg: 'bg-red-100',     iconColor: 'text-red-500',     textColor: 'text-red-600'     },
    { label: 'Stall Total', value: grandStall,   icon: <MdChair size={20} />,          iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    textColor: 'text-blue-700'    },
    { label: 'Power Total', value: grandPower,   icon: <MdElectricBolt size={20} />,   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   textColor: 'text-amber-700'   },
    { label: 'Ex Badge',    value: grandBadge,   icon: <MdBadge size={20} />,          iconBg: 'bg-purple-100',  iconColor: 'text-purple-600',  textColor: 'text-purple-700'  },
    { label: 'Total TDS',   value: grandTds,     icon: <MdAccountBalance size={20} />, iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600',  textColor: 'text-indigo-700'  },
  ];

  return (
    <div className="space-y-4">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="bg-white border border-zinc-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 ${c.iconColor}`}>
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold leading-none mb-1">
                {c.label}
              </p>
              <p className={`text-[15px] font-bold leading-none ${c.textColor} tabular-nums`}>
                ₹{fmt(c.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-[15px] font-bold text-zinc-900">All Payments</h3>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company..."
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdPayment size={44} />
            <p className="text-[15px] text-zinc-500">Loading payments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdPayment size={44} />
            <p className="text-[15px] text-zinc-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] border-collapse text-[14px]">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">ID</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px] min-w-65">Company Name</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Stall</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Power</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Ex Badge</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Stall Pay Received</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">TDS</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Power Pay Received</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">TDS</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Ex Badge Pay Received</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">TDS</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Total</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Received Amount</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Pending Amount</th>
                  <th className="border border-zinc-700 px-3 py-3 text-center font-semibold text-[13px]">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, index) => {
                  const total    = item.stallTotal + item.power + item.exhibitorBadgesTotal;
                  const received = item.stallPaid + item.stall_tds + item.powerPaid + item.power_tds + item.badgePaid + item.badge_tds;
                  const pending  = total - received;
                  const isOdd    = index % 2 !== 0;

                  return (
                    <tr key={index} className={`transition-colors hover:bg-blue-50/40 ${isOdd ? 'bg-zinc-50' : 'bg-white'}`}>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-zinc-600">{index + 1}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 font-semibold text-zinc-900 whitespace-nowrap">{item.company_name}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-zinc-800 tabular-nums">{Math.round(item.stallTotal).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-zinc-800 tabular-nums">{Math.round(item.power).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-zinc-800 tabular-nums">{Math.round(item.exhibitorBadgesTotal).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-emerald-700 font-semibold tabular-nums">{Math.round(item.stallPaid).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-blue-700 font-medium tabular-nums">{Math.round(item.stall_tds).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-emerald-700 font-semibold tabular-nums">{Math.round(item.powerPaid).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-blue-700 font-medium tabular-nums">{Math.round(item.power_tds).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-emerald-700 font-semibold tabular-nums">{Math.round(item.badgePaid).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center text-blue-700 font-medium tabular-nums">{Math.round(item.badge_tds).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center font-bold text-zinc-900 tabular-nums">{Math.round(total).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center font-bold text-emerald-700 tabular-nums">{Math.round(received).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center font-bold text-red-600 tabular-nums">{Math.round(pending).toLocaleString('en-IN')}</td>
                      <td className="border border-zinc-200 px-3 py-2.5 text-center">
                        <button onClick={() => setSelectedPayment(item)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[13px] font-semibold hover:bg-zinc-700 transition-colors">
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
