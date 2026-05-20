import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdGavel, MdCheckCircle, MdWarning, MdLock } from "react-icons/md";
import { apiGet, apiPostJson, getExhibitor } from "./api/base";

export default function UndertakingGate({ children }) {
  const ex = getExhibitor();
  const companyName = ex?.company_name || "";

  const [loading, setLoading]       = useState(true);
  const [accepted, setAccepted]     = useState(false);
  const [declaration, setDeclaration] = useState([]);
  const [checked, setChecked]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    if (!companyName) { setLoading(false); return; }
    setLoading(true);
    try {
      const [decl, statusRes] = await Promise.all([
        apiGet("get_exhibitor_declaration_undertaking.php"),
        apiGet(`get_undertaking_status.php?company_name=${encodeURIComponent(companyName)}`),
      ]);
      setDeclaration(Array.isArray(decl) ? decl : []);
      const row = Array.isArray(statusRes) ? statusRes[0] : statusRes;
      const raw = row?.undertaking_accepted ?? row?.accepted ?? row?.status ?? 0;
      setAccepted(String(raw).trim() === "1" || String(raw).toLowerCase() === "true");
    } catch (e) {
      console.error("Undertaking gate fetch failed:", e);
      setAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); /* eslint-disable-next-line */ }, []);

  const handleSubmit = async () => {
    if (!checked) { toast.error("Please tick the box to confirm"); return; }
    if (!companyName) { toast.error("Company name missing"); return; }
    setSubmitting(true);
    try {
      const res = await apiPostJson("accept_undertaking.php", { company_name: companyName });
      if (res?.success) {
        toast.success("Undertaking accepted. Welcome!");
        setAccepted(true);
      } else {
        toast.error(res?.message || "Failed to accept");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="text-center">
          <span className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-[13px] text-zinc-600">Checking undertaking status…</p>
        </div>
      </div>
    );
  }

  if (accepted) return <>{children}</>;

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-t-xl px-6 sm:px-8 py-6 text-white flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <MdGavel size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] sm:text-[22px] font-bold leading-tight">Terms & Declaration</h1>
            <p className="text-[13px] text-zinc-300 mt-1">
              Please read and accept the undertaking to access your exhibitor panel.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded">
            <MdLock size={13} /> Locked
          </div>
        </div>

        {/* Banner */}
        <div className="bg-amber-50 border-x border-amber-200 px-6 sm:px-8 py-3 flex items-center gap-2.5">
          <MdWarning size={18} className="text-amber-600 shrink-0" />
          <p className="text-[13px] text-amber-900">
            Access to the exhibitor panel is restricted until you accept the terms below.
          </p>
        </div>

        {/* Body */}
        <div className="bg-white border-x border-b border-zinc-200 rounded-b-xl shadow-sm px-6 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Company */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-5 border-b border-zinc-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Exhibitor</span>
            <span className="text-[15px] font-bold text-zinc-900">{companyName || "—"}</span>
          </div>

          {/* Declaration points */}
          {declaration.length === 0 ? (
            <p className="text-[13px] text-zinc-400 italic text-center py-6">
              No declaration points loaded.
            </p>
          ) : (
            <ol className="space-y-4">
              {declaration.map((point, i) => (
                <li key={point.id || i} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[12px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold text-zinc-900 leading-snug">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-zinc-600 leading-relaxed wrap-break-word">
                      {point.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Accept area */}
          <div className="border-t border-zinc-100 pt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-[13.5px] text-zinc-700 leading-relaxed select-none">
                I have read, understood and agree to the <strong className="text-zinc-900">Terms & Declaration</strong> stated above.
                I confirm that <strong>{companyName || "our company"}</strong> shall abide by these terms in full during the exhibition.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!checked || submitting}
                className="px-5 h-11 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MdCheckCircle size={17} />
                {submitting ? "Submitting…" : "Accept & Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
