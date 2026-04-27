import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdSearch, MdExpandMore, MdHistory } from "react-icons/md";

const API = "https://www.inoptics.in/api";

export default function PowerHistoryTab() {
  const [grouped, setGrouped]   = useState({});
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/fetch_all_power_history.php`);
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        const map = {};
        json.data.forEach((item) => {
          const name = item.company_name?.trim();
          if (!name) return;
          if (!map[name]) map[name] = [];
          map[name].push(item);
        });
        setGrouped(map);
        setCompanies(Object.keys(map).sort((a, b) => a.localeCompare(b)));
      } else {
        toast.error("No power history found");
      }
    } catch {
      toast.error("Failed to load power history");
    }
    setLoading(false);
  };

  const filtered = companies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    } catch { return date; }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-[15px] font-bold text-zinc-900">Power Requirement History</h3>
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
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdHistory size={42} className="text-zinc-200" />
          <p className="text-base">No power history found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((company) => {
            const isOpen = openCompany === company;
            const items  = grouped[company] || [];
            return (
              <div key={company} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div
                  onClick={() => setOpenCompany(isOpen ? null : company)}
                  className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-semibold text-zinc-800 text-[15px] truncate">{company}</span>
                    <span className="text-[12px] text-zinc-400 shrink-0">
                      {items.length} record{items.length !== 1 ? "s" : ""}
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
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {["Day", "Price/KW", "Power", "Phase", "Total", "Date"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[13px] font-semibold text-zinc-500 uppercase tracking-widest">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                              <td className="px-4 py-3 text-[15px] font-semibold text-zinc-800">{item.day}</td>
                              <td className="px-4 py-3 text-[15px] text-zinc-700">{item.price_per_kw}</td>
                              <td className="px-4 py-3 text-[15px] text-zinc-700">{item.power_required}</td>
                              <td className="px-4 py-3 text-[15px] text-zinc-700">{item.phase}</td>
                              <td className="px-4 py-3 text-[15px] font-semibold text-blue-700">₹{Number(item.total_amount || 0).toFixed(2)}</td>
                              <td className="px-4 py-3 text-[13px] text-zinc-500">{formatDate(item.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-zinc-100">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-[15px] text-zinc-800">{item.day}</p>
                            <span className="text-[15px] font-bold text-blue-700">
                              ₹{Number(item.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
                            <div><span className="text-zinc-400">Price/KW: </span><b className="text-zinc-700">{item.price_per_kw}</b></div>
                            <div><span className="text-zinc-400">Power: </span><b className="text-zinc-700">{item.power_required}</b></div>
                            <div><span className="text-zinc-400">Phase: </span><b className="text-zinc-700">{item.phase}</b></div>
                          </div>
                          <p className="text-[12px] text-zinc-400 pt-1">{formatDate(item.created_at)}</p>
                        </div>
                      ))}
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
