import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdSearch, MdLock, MdLockOpen, MdRefresh, MdEmail, MdBusiness,
} from "react-icons/md";

const API = "https://inoptics.in/api";

export default function UnlockContractor() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [processing, setProcessing] = useState(null);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    fetchUnlockRequests();
  }, []);

  const fetchUnlockRequests = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin_unlock_requests.php`);
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
      else                     setRequests(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load unlock requests");
    }
    setLoading(false);
  };

  const handleUnlock = async (company) => {
    if (!window.confirm(`Unlock contractor form for ${company}?`)) return;
    setProcessing(company);
    try {
      const res  = await fetch(`${API}/admin_unlock_contractor.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitor_company: company }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        toast.success("Contractor form unlocked successfully!");
        setRequests((prev) => prev.filter((item) => item.exhibitor_company !== company));
      } else {
        toast.error("Unlock failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while unlocking");
    }
    setProcessing(null);
  };

  const filtered = requests.filter((r) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (r.exhibitor_company || "").toLowerCase().includes(term) ||
      (r.exhibitor_email   || "").toLowerCase().includes(term) ||
      (r.contractor_name   || "").toLowerCase().includes(term) ||
      (r.contractor_email  || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-[15px] font-bold text-zinc-900">Contractor Unlock Requests</h3>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
            {requests.length} pending
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search company, email, contractor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchUnlockRequests}
            disabled={loading}
            className="h-10 px-3 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60 shrink-0"
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
          Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdLock size={42} className="text-zinc-200" />
          <p className="text-base">No unlock requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  {["#", "Exhibitor Company", "Exhibitor Email", "Contractor", "Contractor Email", "Requested At", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => (
                  <tr key={req.exhibitor_company || i} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                    <td className="px-4 py-3 text-[13px] text-zinc-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 text-[14px] font-semibold text-zinc-800">
                      {req.exhibitor_company || "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-600 break-all">
                      {req.exhibitor_email || "—"}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-zinc-700">
                      {req.contractor_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-600 break-all">
                      {req.contractor_email || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-zinc-500 whitespace-nowrap">
                      {req.requested_at || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnlock(req.exhibitor_company)}
                        disabled={processing === req.exhibitor_company}
                        className="px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-wait"
                      >
                        {processing === req.exhibitor_company ? (
                          <>
                            <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Unlocking...
                          </>
                        ) : (
                          <>
                            <MdLockOpen size={13} /> Unlock
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet cards */}
          <div className="lg:hidden divide-y divide-zinc-100">
            {filtered.map((req, i) => (
              <div key={req.exhibitor_company || i} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MdBusiness size={14} className="text-zinc-400 shrink-0" />
                      <p className="font-semibold text-[14px] text-zinc-800 truncate">
                        {req.exhibitor_company || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                      <MdEmail size={12} className="text-zinc-400 shrink-0" />
                      <p className="text-[12px] text-zinc-500 truncate">{req.exhibitor_email || "—"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlock(req.exhibitor_company)}
                    disabled={processing === req.exhibitor_company}
                    className="px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-wait shrink-0"
                  >
                    {processing === req.exhibitor_company ? (
                      <>
                        <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      <>
                        <MdLockOpen size={13} /> Unlock
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-zinc-50 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Contractor</p>
                  <p className="text-[13px] font-semibold text-zinc-800">{req.contractor_name || "—"}</p>
                  <p className="text-[12px] text-zinc-500 break-all">{req.contractor_email || "—"}</p>
                </div>

                {req.requested_at && (
                  <p className="text-[11px] text-zinc-400">
                    Requested: <span className="text-zinc-600">{req.requested_at}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
