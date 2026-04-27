import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  MdSearch, MdFileDownload, MdLock, MdLockOpen, MdHourglassEmpty,
  MdCheckCircle, MdRefresh, MdBadge,
} from "react-icons/md";

const API = "https://inoptics.in/api";

const ContractorBadges = ({ exhibitorData = [] }) => {
  const [rows, setRows]               = useState([]);
  const [searchTerm, setSearchTerm]   = useState("");
  const [payments, setPayments]       = useState({});
  const [paidRows, setPaidRows]       = useState({});
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(null);

  const getKey = (row) =>
    row.exhibitor_company_name?.toLowerCase() +
    "_" +
    row.contractor_company_name?.toLowerCase();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchBadges(), fetchPayments()]);
    setLoading(false);
  };

  const fetchBadges = async () => {
    try {
      const res  = await fetch(`${API}/get_all_contractor_badges.php`);
      const data = await res.json();
      if (data.success) setRows(data.records);
    } catch { toast.error("Failed to load badges"); }
  };

  const fetchPayments = async () => {
    try {
      const res  = await fetch(`${API}/fetch_all_exhibitor_contractor_payments.php`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || {});
        setPaidRows(data.paidRows || {});
      }
    } catch { /* silent */ }
  };

  const handlePaymentChange = (key, value) => {
    setPayments((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), payment: value },
    }));
  };

  const handleSubmit = async (row) => {
    const key = getKey(row);
    setSubmitting(key);
    try {
      await fetch(`${API}/exhibitor_contractor_payments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:    row.exhibitor_company_name,
          contractor_name: row.contractor_company_name,
          badge_quantity:  row.badge_quantity,
          payment:         payments[key]?.payment || "",
        }),
      });
      toast.success("Payment saved");
      fetchPayments();
    } catch {
      toast.error("Save failed");
    }
    setSubmitting(null);
  };

  const exportExcel = () => {
    if (!rows.length) { toast.error("No data to export"); return; }
    const data = rows.map((row, i) => {
      const stall_no = exhibitorData?.find(
        (ex) => ex.company_name?.toLowerCase() === row.exhibitor_company_name?.toLowerCase(),
      )?.stall_no || "-";
      const key = getKey(row);
      return {
        "ID": i + 1,
        "Exhibitor Company": row.exhibitor_company_name,
        "Stall No": stall_no,
        "Contractor Company": row.contractor_company_name,
        "Badge Qty": row.badge_quantity,
        "Status": row.is_locked == 1 ? "Locked" : row.is_locked == 2 ? "Requested" : "Unlocked",
        "Payment": payments[key]?.payment || "",
        "Paid": paidRows[key] ? "Yes" : "No",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contractor Badges");
    XLSX.writeFile(wb, "Contractor_Badges_Report.xlsx");
    toast.success("Excel exported");
  };

  const filteredRows = rows.filter((r) =>
    `${r.exhibitor_company_name} ${r.contractor_company_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const stallFor = (companyName) =>
    exhibitorData?.find(
      (ex) => ex.company_name?.toLowerCase() === companyName?.toLowerCase(),
    )?.stall_no || "—";

  const statusBadge = (lock) => {
    if (lock == 1) return { label: "Locked",    cls: "bg-red-50 text-red-700 border-red-200",       Icon: MdLock };
    if (lock == 2) return { label: "Requested", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: MdHourglassEmpty };
    return                    { label: "Unlocked",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: MdLockOpen };
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportExcel}
            className="px-3 py-2 text-[14px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 transition-colors"
          >
            <MdFileDownload size={16} /> Export Excel
          </button>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
            {rows.length} records
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search exhibitor or contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="h-10 px-3 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5 transition-colors disabled:opacity-60 shrink-0"
            title="Refresh"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 text-center text-zinc-500 text-base">
          Loading...
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdBadge size={42} className="text-zinc-200" />
          <p className="text-base">No contractor badges found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  {["#", "Exhibitor Company", "Stall", "Contractor Company", "Qty", "Status", "Payment", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => {
                  const key   = getKey(row);
                  const stall = stallFor(row.exhibitor_company_name);
                  const sb    = statusBadge(row.is_locked);
                  const isPaid = !!paidRows[key];

                  return (
                    <tr key={row.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                      <td className="px-4 py-3 text-[13px] text-zinc-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-3 text-[14px] font-semibold text-zinc-800">
                        {row.exhibitor_company_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                          {stall}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[14px] text-zinc-700">{row.contractor_company_name}</td>
                      <td className="px-4 py-3 text-[14px] font-semibold text-blue-700">{row.badge_quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-full ${sb.cls}`}>
                          <sb.Icon size={12} /> {sb.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Amount"
                            value={payments[key]?.payment || ""}
                            disabled={isPaid}
                            onChange={(e) => handlePaymentChange(key, e.target.value)}
                            className="w-28 px-2 py-1.5 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-emerald-50 disabled:text-emerald-700 disabled:border-emerald-200"
                          />
                          <button
                            onClick={() => handleSubmit(row)}
                            disabled={isPaid || submitting === key}
                            className={`px-2.5 py-1.5 text-[12px] font-semibold rounded transition-colors flex items-center gap-1 ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                            }`}
                          >
                            {isPaid ? (<><MdCheckCircle size={13} /> Paid</>) : submitting === key ? "..." : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.is_locked == 2 && (
                            <button className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1 transition-colors">
                              <MdLockOpen size={12} /> Unlock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <div className="xl:hidden divide-y divide-zinc-100">
            {filteredRows.map((row, i) => {
              const key   = getKey(row);
              const stall = stallFor(row.exhibitor_company_name);
              const sb    = statusBadge(row.is_locked);
              const isPaid = !!paidRows[key];

              return (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                      <p className="font-semibold text-[14px] text-zinc-800 truncate">
                        {row.exhibitor_company_name}
                      </p>
                      <p className="text-[12px] text-zinc-500 truncate">
                        Contractor: <b className="text-zinc-700">{row.contractor_company_name}</b>
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full shrink-0 ${sb.cls}`}>
                      <sb.Icon size={11} /> {sb.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                    <div>
                      <span className="text-zinc-400">Stall: </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                        {stall}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Qty: </span>
                      <b className="text-blue-700">{row.badge_quantity}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100">
                    <input
                      type="text"
                      placeholder="Payment amount"
                      value={payments[key]?.payment || ""}
                      disabled={isPaid}
                      onChange={(e) => handlePaymentChange(key, e.target.value)}
                      className="flex-1 px-2 py-1.5 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-emerald-50 disabled:text-emerald-700 disabled:border-emerald-200"
                    />
                    <button
                      onClick={() => handleSubmit(row)}
                      disabled={isPaid || submitting === key}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded transition-colors flex items-center gap-1 shrink-0 ${
                        isPaid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                          : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                      }`}
                    >
                      {isPaid ? (<><MdCheckCircle size={13} /> Paid</>) : submitting === key ? "..." : "Save"}
                    </button>
                    {row.is_locked == 2 && (
                      <button className="px-2.5 py-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1 transition-colors shrink-0">
                        <MdLockOpen size={12} /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorBadges;
