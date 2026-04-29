import React, { useEffect } from "react";
import { MdGavel, MdLockOpen, MdCheckCircle, MdWarning } from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useExhibitorUndertakingStore } from "../../store/exhibitor/useExhibitorUndertakingStore";

export default function Undertaking() {
  const { editingExhibitor: ex } = useNavStore();

  const declaration = useExhibitorUndertakingStore((s) => s.declaration);
  const status      = useExhibitorUndertakingStore((s) => s.status);
  const loading     = useExhibitorUndertakingStore((s) => s.loading);
  const unlocking   = useExhibitorUndertakingStore((s) => s.unlocking);
  const initForCompany = useExhibitorUndertakingStore((s) => s.initForCompany);
  const unlock         = useExhibitorUndertakingStore((s) => s.unlock);

  useEffect(() => { if (ex) initForCompany(ex); }, [ex, initForCompany]);

  if (!ex) return null;

  const handleUnlock = () => {
    if (!window.confirm(`Unlock undertaking for ${ex.company_name}?`)) return;
    unlock(ex.company_name);
  };

  return (
    <div className="space-y-3">
      {/* header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center shrink-0">
          <MdGavel size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Terms & Declaration</h3>
          <p className="text-[12px] text-zinc-400">{ex.company_name}</p>
        </div>

        {/* status pill */}
        {status === 1 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            <MdCheckCircle size={13} /> Accepted
          </span>
        )}
        {status === 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
            <MdWarning size={13} /> Not Accepted
          </span>
        )}
      </div>

      {/* body */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
        {status === null || loading ? (
          <div className="py-10 text-center text-[13px] text-zinc-400">Loading...</div>
        ) : status === 0 ? (
          <div className="px-4 py-3 text-[13px] bg-amber-50 border border-amber-200 text-amber-800 rounded">
            <span className="font-semibold">{ex.company_name}</span> has NOT accepted the Undertaking.
          </div>
        ) : (
          <>
            <ol className="list-decimal pl-5 space-y-2.5 text-[13px] text-zinc-700 leading-relaxed">
              {declaration.map((point, i) => (
                <li key={i}>
                  <span className="font-semibold text-zinc-900">{point.title}:</span>{" "}
                  <span className="text-zinc-600 wrap-break-word">{point.text}</span>
                </li>
              ))}
              {declaration.length === 0 && (
                <li className="list-none text-zinc-400 italic">No declaration points found.</li>
              )}
            </ol>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-4 h-10 text-[13px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <MdLockOpen size={16} />
                {unlocking ? "Unlocking..." : "Unlock Undertaking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
