import React, { useEffect, useMemo } from "react";
import {
  MdElectricBolt, MdSave, MdEmail, MdLockOpen, MdLock, MdDelete,
  MdAdd, MdInfoOutline, MdReceiptLong, MdBolt,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { usePowerTypesStore }      from "../../store/master/usePowerTypesStore";
import { useExhibitorPowerStore }  from "../../store/exhibitor/useExhibitorPowerStore";

const GUIDELINES = [
  "Power requirements for setup days and exhibition days must be submitted separately.",
  "Power will be arranged as per the requirement form. Requests made after 28th February 2026 may incur additional charges.",
  "If unsure of your needs, please consult your fabricator for accurate details.",
  "Kindly ensure your contractor uses quality, thick wiring. Additional charges may apply if power usage exceeds the amount ordered.",
  "Thank you for your cooperation.",
];

export default function PowerRequirement() {
  const { editingExhibitor: ex } = useNavStore();

  /* live shared master data */
  const powerData      = usePowerTypesStore((s) => s.rows);
  const fetchPowerData = usePowerTypesStore((s) => s.fetch);

  const {
    forms, previewList, totalPrice, cgst, sgst, igst, grandTotal,
    isLocked, unlockRequested, isSendingMail, saving, hasExistingData,
    initForCompany, initFormsFromTypes, setFormField, addAllToList,
    submit, removeRow, unlockPower,
    sendUpdatePowerMail, sendPowerMail,
  } = useExhibitorPowerStore();

  const powerTypes = useMemo(
    () => [...new Set(powerData.map((i) => i.power_type?.trim()).filter(Boolean))],
    [powerData],
  );

  /* boot */
  useEffect(() => { fetchPowerData(); }, [fetchPowerData]);
  useEffect(() => { if (ex) initForCompany(ex); }, [ex, initForCompany]);
  useEffect(() => { if (powerData.length) initFormsFromTypes(powerData); }, [powerData, initFormsFromTypes]);

  if (!ex) return null;

  const exState = ex.state || "";

  return (
    <div className="space-y-5">
      {/* ================ TOP: FORM + GUIDELINES ================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORM (all sections at once) */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center">
              <MdElectricBolt size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Power Requirement</h3>
              <p className="text-[12px] text-zinc-400">{ex.company_name} · {ex.state || "—"}</p>
            </div>
          </div>

          {powerTypes.length === 0 ? (
            <p className="text-[13px] text-zinc-400 py-6 text-center">
              No power types configured. Add some in Masters → Power Requirement.
            </p>
          ) : (
            <>
              {/* sections */}
              <div className="space-y-4">
                {powerTypes.map((type, i) => {
                  const price = powerData.find((p) => p.power_type?.trim() === type)?.price ?? "";
                  const f     = forms[type] || { powerRequired: "", phase: "", totalAmount: "" };
                  return (
                    <React.Fragment key={type}>
                      {i > 0 && <SectionDivider />}
                      <FormSection
                        index={i + 1}
                        type={type}
                        price={price}
                        form={f}
                        onChange={(field, v) => setFormField(type, field, v, powerData)}
                      />
                    </React.Fragment>
                  );
                })}
              </div>

              {/* one global Add button */}
              <div className="flex justify-end pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => addAllToList(powerData, exState)}
                  className="px-4 h-10 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 transition-colors"
                >
                  <MdAdd size={16} /> Add to List
                </button>
              </div>
            </>
          )}
        </div>

        {/* GUIDELINES + ACTIONS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center">
              <MdInfoOutline size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Guidelines</h3>
              <p className="text-[12px] text-zinc-400">Read before submitting</p>
            </div>
          </div>

          <ul className="space-y-1.5 text-[12px] text-zinc-600 leading-relaxed">
            {GUIDELINES.map((g, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
            {hasExistingData && (
              <button
                onClick={() => sendUpdatePowerMail(ex)}
                disabled={isSendingMail}
                className="w-full px-3 h-10 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <MdEmail size={16} /> Send Update Power Mail
              </button>
            )}
            <button
              onClick={() => sendPowerMail(ex)}
              disabled={isSendingMail}
              className="w-full px-3 h-10 text-[13px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <MdEmail size={16} /> Send Mail
            </button>
            <button
              onClick={() => submit(ex)}
              disabled={saving || !previewList.length}
              className="w-full px-3 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <MdSave size={16} />
              {saving ? "Saving..." : hasExistingData ? "Update" : "Submit"}
            </button>
            {isLocked && (
              <button
                onClick={() => !unlockRequested && unlockPower(ex)}
                disabled={unlockRequested}
                className={`w-full px-3 h-10 text-[13px] font-semibold rounded flex items-center justify-center gap-1.5 transition-colors ${
                  unlockRequested
                    ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {unlockRequested ? <MdLock size={16} /> : <MdLockOpen size={16} />}
                {unlockRequested ? "Unlock Requested" : "Unlock"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================ TABLE + BILLING ================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* table */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50">
                <tr>
                  {["Days", "Price/KW", "Power", "Phase", "Total", "Action"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-[14px] text-zinc-400">
                      No power entries yet
                    </td>
                  </tr>
                ) : previewList.map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                    <td className="px-4 py-3 text-[14px] font-semibold text-zinc-800">{item.day}</td>
                    <td className="px-4 py-3 text-[14px] text-zinc-700">₹ {item.pricePerKw}</td>
                    <td className="px-4 py-3 text-[14px] text-zinc-700">{item.powerRequired} KW</td>
                    <td className="px-4 py-3 text-[14px] text-zinc-700">{item.phase}</td>
                    <td className="px-4 py-3 text-[14px] font-semibold text-blue-700">₹ {item.totalAmount}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeRow(item, ex)}
                        className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                        title="Remove"
                      >
                        <MdDelete size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {previewList.length === 0 ? (
              <p className="p-8 text-center text-[14px] text-zinc-400">No power entries yet</p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {previewList.map((item, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                        <p className="font-semibold text-[14px] text-zinc-800">{item.day}</p>
                        <p className="text-[12px] text-zinc-500">{item.phase}</p>
                      </div>
                      <button
                        onClick={() => removeRow(item, ex)}
                        className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded shrink-0"
                      >
                        <MdDelete size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                      <div><span className="text-zinc-400">Price/KW: </span><b className="text-zinc-700">₹ {item.pricePerKw}</b></div>
                      <div><span className="text-zinc-400">Power: </span><b className="text-zinc-700">{item.powerRequired} KW</b></div>
                      <div className="col-span-2 pt-1 border-t border-zinc-100 mt-1">
                        <span className="text-zinc-400">Total: </span>
                        <b className="text-blue-700 text-[13px]">₹ {item.totalAmount}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* billing */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center">
              <MdReceiptLong size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Power Billing</h3>
              <p className="text-[12px] text-zinc-400">Live calculation</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <BillRow label="Total Price" value={`${totalPrice.toFixed(2)} ₹`} />
            {exState.toLowerCase() === "delhi" ? (
              <>
                <BillRow label="CGST (9%)" value={`${cgst.toFixed(2)} ₹`} />
                <BillRow label="SGST (9%)" value={`${sgst.toFixed(2)} ₹`} />
              </>
            ) : (
              <BillRow label="IGST (18%)" value={`${igst.toFixed(2)} ₹`} />
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-zinc-900">
            <span className="text-[14px] font-bold text-zinc-900">Grand Total</span>
            <span className="text-[16px] font-bold text-blue-700">{grandTotal.toFixed(2)} ₹</span>
          </div>
        </div>
      </div>

      {/* sending mail overlay */}
      {isSendingMail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-5 flex flex-col items-center gap-3 shadow-xl">
            <span className="block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-zinc-700">Sending mail, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= sub-components ================= */

function FormSection({ index, type, price, form, onChange }) {
  return (
    <div className="space-y-3">
      {/* section header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-[12px] font-bold shrink-0">
          {index}
        </div>
        <div className="flex items-center gap-1.5 text-[14px] font-bold text-zinc-900">
          <MdBolt size={16} className="text-amber-500" />
          {type}
        </div>
      </div>

      {/* fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReadField label="Type"          value={type} />
        <ReadField label="Price per KW"  value={price ? `₹ ${price}` : "—"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField
          label="Power Required (KW)"
          type="number"
          value={form.powerRequired}
          onChange={(v) => onChange("powerRequired", v)}
          placeholder="0"
        />
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Phase</label>
          <div className="flex gap-3 h-10.5 items-center px-3 border border-zinc-200 rounded bg-white">
            <RadioOpt label="Single" value="Single Phase" current={form.phase} onChange={(v) => onChange("phase", v)} />
            <RadioOpt label="Three"  value="Three Phase"  current={form.phase} onChange={(v) => onChange("phase", v)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReadField label="Total Amount" value={form.totalAmount ? `₹ ${form.totalAmount}` : "—"} />
        <div /> {/* spacer to keep alignment */}
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-dashed border-zinc-300" />
      </div>
    </div>
  );
}

function ReadField({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <div className="px-3 h-10.5 flex items-center text-[14px] text-zinc-800 bg-zinc-50 border border-zinc-200 rounded">
        {value}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 h-10.5 text-[14px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function RadioOpt({ label, value, current, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] text-zinc-700 cursor-pointer">
      <input
        type="radio"
        checked={current === value}
        onChange={() => onChange(value)}
        className="accent-blue-600"
      />
      {label}
    </label>
  );
}

function BillRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-zinc-500">{label}:</span>
      <span className="text-[13px] font-semibold text-zinc-700">{value}</span>
    </div>
  );
}
