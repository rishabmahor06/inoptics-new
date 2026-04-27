import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MdSearch, MdExpandMore, MdHistory, MdVisibility, MdDelete,
} from "react-icons/md";

const SITE = "https://inoptics.in";
const API  = `${SITE}/api`;

export default function FormsHistoryTab() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [openCompany, setOpenCompany] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/get_contractor_form_history.php`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRows(data.data);
        if (data.data.length) {
          setOpenCompany({ [data.data[0].company_name]: true });
        }
      } else {
        toast.error("History load failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      const res  = await fetch(`${API}/delete_contractor_form_history.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Deleted successfully");
        fetchHistory();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed");
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.company_name]) map[r.company_name] = [];
      map[r.company_name].push(r);
    });
    return map;
  }, [rows]);

  const filtered = Object.keys(grouped)
    .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const toggleCompany = (name) =>
    setOpenCompany((prev) => ({ ...prev, [name]: !prev[name] }));

  const buildFileUrl = (path) => {
    if (!path) return "#";
    const fileName = path.split("/").pop();
    return `${SITE}/api/company-signed-forms/${fileName}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    try { return new Date(date).toLocaleString("en-IN"); }
    catch { return date; }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-[15px] font-bold text-zinc-900">Contractor Forms History</h3>
        <div className="relative w-full sm:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-10 text-center text-zinc-500 text-base">
          Loading history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdHistory size={42} className="text-zinc-200" />
          <p className="text-base">No forms history found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((company) => {
            const isOpen = !!openCompany[company];
            const items  = grouped[company] || [];
            return (
              <div key={company} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div
                  onClick={() => toggleCompany(company)}
                  className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-semibold text-zinc-800 text-[15px] truncate">{company}</span>
                    <span className="text-[12px] text-zinc-400 shrink-0">
                      {items.length} form{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <MdExpandMore
                    size={22}
                    className={`text-zinc-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {isOpen && (
                  <div className="border-t border-zinc-100">
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {["Form Type", "File Name", "File", "Status", "Reject Reason", "Created", "Action"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[13px] font-semibold text-zinc-500 uppercase tracking-widest">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((r) => {
                            const fileUrl  = buildFileUrl(r.file_path);
                            const fileName = r.file_path?.split("/").pop() || "—";
                            const status   = r.approval_status || "—";
                            const isApprov = status === "approved";
                            const isReject = status === "rejected";
                            return (
                              <tr key={r.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                                <td className="px-4 py-3 text-[15px] font-semibold text-zinc-800 capitalize">
                                  {(r.form_type || "").replace(/_/g, " ")}
                                </td>
                                <td className="px-4 py-3 text-[13px] text-zinc-600 font-mono truncate max-w-xs">{fileName}</td>
                                <td className="px-4 py-3">
                                  {r.file_path ? (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[13px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                                    >
                                      <MdVisibility size={14} /> View
                                    </a>
                                  ) : (
                                    <span className="text-zinc-300">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2.5 py-1 text-[12px] font-semibold rounded-full capitalize ${
                                    isApprov ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isReject ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                  }`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[14px] text-zinc-600">{r.reject_reason || "—"}</td>
                                <td className="px-4 py-3 text-[13px] text-zinc-500">{formatDate(r.created_at)}</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleDelete(r.id)}
                                    className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <MdDelete size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/tablet cards */}
                    <div className="lg:hidden divide-y divide-zinc-100">
                      {items.map((r) => {
                        const fileUrl  = buildFileUrl(r.file_path);
                        const fileName = r.file_path?.split("/").pop() || "—";
                        const status   = r.approval_status || "—";
                        const isApprov = status === "approved";
                        const isReject = status === "rejected";
                        return (
                          <div key={r.id} className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-[15px] text-zinc-800 capitalize">
                                  {(r.form_type || "").replace(/_/g, " ")}
                                </p>
                                <p className="text-[12px] text-zinc-400 font-mono truncate">{fileName}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full capitalize ${
                                  isApprov ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isReject ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                }`}>
                                  {status}
                                </span>
                                <button
                                  onClick={() => handleDelete(r.id)}
                                  className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md"
                                >
                                  <MdDelete size={14} />
                                </button>
                              </div>
                            </div>
                            {r.reject_reason && (
                              <p className="text-[13px] text-zinc-600">
                                <span className="text-zinc-400">Reason: </span>{r.reject_reason}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <p className="text-[12px] text-zinc-400">{formatDate(r.created_at)}</p>
                              {r.file_path && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md"
                                >
                                  <MdVisibility size={13} /> View
                                </a>
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
          })}
        </div>
      )}
    </div>
  );
}
