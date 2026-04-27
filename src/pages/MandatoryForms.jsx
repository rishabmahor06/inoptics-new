import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdSearch, MdExpandMore, MdRefresh, MdVisibility, MdLockOpen,
  MdLock, MdCheckCircle, MdHourglassEmpty, MdDescription,
} from "react-icons/md";

const API = "https://inoptics.in/api";

const STEP_FORM_MAP = {
  1: "appointed",
  2: "undertaking",
  3: "booth_design",
  4: "contractor_badge",
};

const FORM_LABELS = {
  appointed:        "Appointed Contractor",
  undertaking:      "Undertaking",
  booth_design:     "Booth Design",
  contractor_badge: "Contractor Badge",
};

export default function MandatoryForms() {
  const [requests, setRequests]     = useState({});
  const [formsMap, setFormsMap]     = useState({});
  const [loading, setLoading]       = useState(false);
  const [openCompany, setOpenCompany] = useState(null);
  const [search, setSearch]         = useState("");
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchUploadedForms()]);
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res  = await fetch(`${API}/get_all_contractor_unlock_requests.php`);
      const data = await res.json();
      if (data.success) setRequests(data.data || {});
    } catch { toast.error("Unlock fetch failed"); }
  };

  const fetchUploadedForms = async () => {
    try {
      const res  = await fetch(`${API}/get_all_uploaded_exhibitor_forms.php`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) return;
      const grouped = {};
      json.data.forEach((row) => {
        const company = row.exhibitor_company_name?.trim();
        if (!company) return;
        if (!grouped[company]) grouped[company] = [];
        grouped[company].push(row);
      });
      setFormsMap(grouped);
    } catch { toast.error("Forms fetch failed"); }
  };

  const updateStatus = async (company, step) => {
    setProcessing(`${company}-${step}`);
    try {
      const fd = new FormData();
      fd.append("exhibitor_company_name", company);
      fd.append("step_number", step);
      fd.append("status", "approved");
      const res  = await fetch(`${API}/admin_contractor_step_unlock.php`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success("Unlocked successfully");
        fetchRequests();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    }
    setProcessing(null);
  };

  const filteredCompanies = Object.entries(formsMap)
    .filter(([company]) => company.toLowerCase().includes(search.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  /* status pill helpers */
  const statusBadge = (status) => {
    if (status === "approved") return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: MdCheckCircle, label: "Approved" };
    if (status === "pending")  return { cls: "bg-amber-50 text-amber-700 border-amber-200",       Icon: MdHourglassEmpty, label: "Pending" };
    return                            { cls: "bg-red-100 text-red-600 border-red-200",          Icon: MdLock,           label: "Locked" };
  };

  /* per-company aggregate counts (for header) */
  const countByStatus = (company, forms) => {
    const companyRequests = requests[company] || [];
    let pending = 0, approved = 0;
    forms.forEach((form) => {
      const stepNumber = Object.keys(STEP_FORM_MAP).find((k) => STEP_FORM_MAP[k] === form.form_type);
      const matched    = companyRequests.find((r) => r.step_number == stepNumber);
      if (matched?.status === "pending")  pending++;
      if (matched?.status === "approved") approved++;
    });
    return { pending, approved };
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-[15px] font-bold text-zinc-900">Exhibitor Mandatory Forms</h3>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
            {Object.keys(formsMap).length} companies
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="h-10 px-3 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5 transition-colors disabled:opacity-60 shrink-0"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 text-center text-zinc-500 text-base">
          Loading...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdDescription size={42} className="text-zinc-200" />
          <p className="text-base">No mandatory forms found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCompanies.map(([company, forms]) => {
            const isOpen           = openCompany === company;
            const { pending, approved } = countByStatus(company, forms);

            return (
              <div key={company} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  onClick={() => setOpenCompany(isOpen ? null : company)}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span className="font-semibold text-zinc-800 text-[15px] truncate">{company}</span>
                    <span className="text-[12px] text-zinc-400 shrink-0">
                      {forms.length} form{forms.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pending > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                        <MdHourglassEmpty size={11} /> {pending} pending
                      </span>
                    )}
                    {approved > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        <MdCheckCircle size={11} /> {approved} approved
                      </span>
                    )}
                    <MdExpandMore
                      size={22}
                      className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Body */}
                {isOpen && (
                  <div className="border-t border-zinc-100">
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {["Step", "Form Type", "File", "Status", "Action"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {forms.map((form) => {
                            const stepNumber = Object.keys(STEP_FORM_MAP).find((k) => STEP_FORM_MAP[k] === form.form_type);
                            const matched    = (requests[company] || []).find((r) => r.step_number == stepNumber);
                            const sb         = statusBadge(matched?.status);
                            const fileUrl    = form.file_preview_url || `${API}/${form.file_path}`;
                            const procKey    = `${company}-${stepNumber}`;

                            return (
                              <tr key={form.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                                <td className="px-4 py-3">
                                  {stepNumber ? (
                                    <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                      Step {stepNumber}
                                    </span>
                                  ) : <span className="text-zinc-300">—</span>}
                                </td>
                                <td className="px-4 py-3 text-[14px] font-semibold text-zinc-800 capitalize">
                                  {FORM_LABELS[form.form_type] || (form.form_type || "").replace(/_/g, " ")}
                                </td>
                                <td className="px-4 py-3">
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                                  >
                                    <MdVisibility size={13} /> View
                                  </a>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold border rounded-full capitalize ${sb.cls}`}>
                                    <sb.Icon size={12} /> {sb.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {matched?.status === "pending" ? (
                                    <button
                                      onClick={() => updateStatus(company, stepNumber)}
                                      disabled={processing === procKey}
                                      className="px-2.5 py-1 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1 transition-colors disabled:opacity-60"
                                    >
                                      {processing === procKey ? (
                                        <>
                                          <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Unlocking...
                                        </>
                                      ) : (
                                        <><MdLockOpen size={13} /> Unlock</>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="text-zinc-300 text-[12px]">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="lg:hidden divide-y divide-zinc-100">
                      {forms.map((form) => {
                        const stepNumber = Object.keys(STEP_FORM_MAP).find((k) => STEP_FORM_MAP[k] === form.form_type);
                        const matched    = (requests[company] || []).find((r) => r.step_number == stepNumber);
                        const sb         = statusBadge(matched?.status);
                        const fileUrl    = form.file_preview_url || `${API}/${form.file_path}`;
                        const procKey    = `${company}-${stepNumber}`;

                        return (
                          <div key={form.id} className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                {stepNumber && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                    Step {stepNumber}
                                  </span>
                                )}
                                <p className="font-semibold text-[14px] text-zinc-800 capitalize mt-1">
                                  {FORM_LABELS[form.form_type] || (form.form_type || "").replace(/_/g, " ")}
                                </p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full capitalize shrink-0 ${sb.cls}`}>
                                <sb.Icon size={11} /> {sb.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                              >
                                <MdVisibility size={13} /> View File
                              </a>
                              {matched?.status === "pending" && (
                                <button
                                  onClick={() => updateStatus(company, stepNumber)}
                                  disabled={processing === procKey}
                                  className="px-2.5 py-1 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1 transition-colors disabled:opacity-60"
                                >
                                  {processing === procKey ? (
                                    <>
                                      <span className="block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </>
                                  ) : (
                                    <><MdLockOpen size={13} /> Unlock</>
                                  )}
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
          })}
        </div>
      )}
    </div>
  );
}
