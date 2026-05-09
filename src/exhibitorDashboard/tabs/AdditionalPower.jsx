import React, { useEffect } from "react";
import TabShell from "../TabShell";
import {
  MdPower,
  MdEdit,
  MdLock,
  MdLockOpen,
  MdCheckCircle,
  MdAdd,
  MdArrowBack,
  MdArrowForward,
  MdClose,
  MdInfoOutline,
  MdDelete,
} from "react-icons/md";
import { usePowerStore } from "../store/usePowerStore";
import { getExhibitor } from "../api/base";

export default function AdditionalPower() {
  const s = usePowerStore();
  const exhibitor = getExhibitor();

  useEffect(() => {
    s.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!exhibitor?.company_name) {
    return (
      <TabShell
        title="Additional Power"
        Icon={MdPower}
        subtitle="Power requirements & connection requests"
      >
        <Empty text="Exhibitor info not loaded yet." />
      </TabShell>
    );
  }

  return (
    <TabShell
      title="Additional Power"
      Icon={MdPower}
      subtitle="Submit your power requirements for setup & exhibition days"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT — Form */}
        <div className="lg:col-span-2">
          <FormCard />
        </div>

        {/* RIGHT — Guidelines + Table + Billing */}
        <div className="lg:col-span-3 space-y-4">
          <GuidelinesCard />
          <PowerTableCard />
          <BillingCard exhibitor={exhibitor} />
        </div>
      </div>

      {s.showEditPopup && <EditModal />}
    </TabShell>
  );
}

/* ============== Form Card ============== */

function FormCard() {
  const {
    formStep,
    pricePerKw,
    powerRequired,
    phase,
    isLocked,
    saving,
    previewList,
    setField,
    addRow,
    goNext,
    goPrevious,
    submit,
    requestUnlock,
    removePreviewRow,
  } = usePowerStore();

  const totalAmount =
    pricePerKw && powerRequired
      ? (Number(pricePerKw) * Number(powerRequired)).toFixed(2)
      : "";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <h3 className="text-[13.5px] font-bold text-[#02062c]">Power Form</h3>
      </div>

      {/* Stepper */}
      <div className="px-4 sm:px-5 pt-4">
        <Stepper step={formStep} />
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <Field label="Day Type">
          <input
            type="text"
            value={formStep === 0 ? "Setup Days" : "Exhibition Days"}
            disabled
            className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600"
          />
        </Field>
        <Field label="Price per KW (₹)">
          <input
            type="text"
            value={pricePerKw || ""}
            disabled
            className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600"
          />
        </Field>
        <Field label="Power Required (KW)" required>
          <input
            type="number"
            min="0"
            value={powerRequired}
            onChange={(e) => setField("powerRequired", e.target.value)}
            disabled={isLocked || saving}
            className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-50"
          />
        </Field>
        <Field label="Phase" required>
          <div className="flex gap-2">
            {["Single Phase", "Three Phase"].map((p) => (
              <label
                key={p}
                className={`flex-1 cursor-pointer px-3 py-2 text-[12.5px] font-semibold border rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  phase === p
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                } ${isLocked ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  name="phase"
                  value={p}
                  checked={phase === p}
                  onChange={(e) => setField("phase", e.target.value)}
                  disabled={isLocked}
                />
                {p}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Total Amount">
          <input
            type="text"
            value={totalAmount ? `₹ ${totalAmount}` : ""}
            disabled
            className="w-full px-3 py-2 text-[13px] font-bold border border-zinc-200 rounded-lg bg-emerald-50/40 text-emerald-700"
          />
        </Field>

        {/* Action buttons */}
        <div className="pt-2 border-t border-zinc-100 space-y-2">
          {isLocked ? (
            <button
              onClick={requestUnlock}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg disabled:opacity-60"
            >
              <MdLockOpen size={15} /> Request to Unlock
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {formStep === 1 && (
                  <button
                    onClick={goPrevious}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg"
                  >
                    <MdArrowBack size={15} /> Previous
                  </button>
                )}
                <button
                  onClick={addRow}
                  disabled={saving}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg ${
                    formStep === 0 ? "col-span-2" : ""
                  }`}
                >
                  <MdAdd size={16} /> Add Row
                </button>
              </div>

              {formStep === 0 ? (
                <button
                  onClick={goNext}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
                >
                  Next: Exhibition Days <MdArrowForward size={15} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={saving || previewList.length === 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                >
                  <MdLock size={15} />
                  {saving ? "Submitting..." : "Submit & Lock"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Pending preview rows */}
        {!isLocked && previewList.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed border-zinc-200">
            <p className="text-[10.5px] uppercase tracking-wider font-bold text-zinc-500 mb-2">
              Pending rows ({previewList.length})
            </p>
            <ul className="space-y-1.5">
              {previewList.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[12px]"
                >
                  <span className="font-semibold text-zinc-700">{r.day}</span>
                  <span className="text-zinc-400">·</span>
                  <span>{r.powerRequired} KW</span>
                  <span className="text-zinc-400">·</span>
                  <span>{r.phase}</span>
                  <span className="ml-auto font-bold text-emerald-700">
                    ₹{r.totalAmount}
                  </span>
                  <button
                    onClick={() => removePreviewRow(i)}
                    className="text-zinc-400 hover:text-red-600"
                    title="Remove"
                  >
                    <MdDelete size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = ["Setup Days", "Exhibition Days"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                i <= step
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-zinc-400 border-zinc-200"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[11.5px] font-semibold whitespace-nowrap ${
                i <= step ? "text-blue-700" : "text-zinc-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 ${i < step ? "bg-blue-600" : "bg-zinc-200"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============== Guidelines Card ============== */

function GuidelinesCard() {
  const items = [
    "Power requirements for setup days and exhibition days must be submitted separately.",
    "Power will be arranged as per the requirement form.",
    "Requests after the deadline may incur additional charges.",
    "If unsure, consult your fabricator.",
    "Ensure proper wiring is used.",
  ];
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <MdInfoOutline className="text-blue-600" size={18} />
        <p className="text-[12.5px] font-bold uppercase tracking-wider text-blue-700">
          Guidelines
        </p>
      </div>
      <ul className="text-[12px] text-zinc-700 space-y-1 list-disc pl-5 leading-relaxed">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ============== Power Table ============== */

function PowerTableCard() {
  const { powerData, isLocked, openEdit, loading } = usePowerStore();

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <h3 className="text-[13.5px] font-bold text-[#02062c]">
          Submitted Power Entries
        </h3>
        {isLocked ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <MdCheckCircle size={11} /> Locked
          </span>
        ) : powerData.length > 0 ? (
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg"
          >
            <MdEdit size={13} /> Edit
          </button>
        ) : null}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-100">
              {["Days", "₹/KW", "Power", "Phase", "Total", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 text-[13px]">
                  Loading...
                </td>
              </tr>
            ) : powerData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 text-[13px]">
                  No data submitted yet
                </td>
              </tr>
            ) : (
              powerData.map((row, i) => (
                <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/60">
                  <td className="px-4 py-3 text-[13px] font-medium text-zinc-800">{row.day}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-700">₹{row.price_per_kw}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-700">{row.power_required} KW</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-700">{row.phase}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-emerald-700">
                    ₹{Number(row.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {Number(row.is_locked) === 1 ? (
                      <MdLock className="text-zinc-500" size={14} />
                    ) : (
                      <MdLockOpen className="text-amber-500" size={14} />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-zinc-100">
        {loading ? (
          <p className="px-4 py-8 text-center text-zinc-400 text-[13px]">Loading...</p>
        ) : powerData.length === 0 ? (
          <p className="px-4 py-8 text-center text-zinc-400 text-[13px]">No data submitted yet</p>
        ) : (
          powerData.map((row, i) => (
            <div key={i} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[13px] text-[#02062c]">{row.day}</p>
                {Number(row.is_locked) === 1 ? (
                  <MdLock className="text-zinc-500" size={14} />
                ) : (
                  <MdLockOpen className="text-amber-500" size={14} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[12px] text-zinc-600">
                <span>₹/KW: <b>{row.price_per_kw}</b></span>
                <span>Power: <b>{row.power_required} KW</b></span>
                <span className="col-span-2">Phase: <b>{row.phase}</b></span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">Total</span>
                <span className="text-[14px] font-bold text-emerald-700">
                  ₹{Number(row.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============== Billing Card ============== */

function BillingCard({ exhibitor }) {
  const { totalPrice, sgst, cgst, igst, grandTotal } = usePowerStore();
  const isDelhi = (exhibitor?.state || "").trim().toLowerCase() === "delhi";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <h3 className="text-[13.5px] font-bold text-[#02062c]">Billing Summary</h3>
      </div>
      <div className="p-4 sm:p-5 space-y-2.5">
        <Row label="Company" value={exhibitor?.company_name || "—"} />
        <Row label="State" value={exhibitor?.state || "—"} />
        <div className="border-t border-zinc-100 pt-2.5 space-y-2">
          <Row label="Subtotal" value={`₹ ${totalPrice.toFixed(2)}`} />
          {isDelhi ? (
            <>
              <Row label="CGST (9%)" value={`₹ ${cgst.toFixed(2)}`} muted />
              <Row label="SGST (9%)" value={`₹ ${sgst.toFixed(2)}`} muted />
            </>
          ) : (
            <Row label="IGST (18%)" value={`₹ ${igst.toFixed(2)}`} muted />
          )}
        </div>
        <div className="border-t-2 border-zinc-200 pt-2.5 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#02062c]">Grand Total</span>
          <span className="text-[18px] font-bold text-emerald-700">
            ₹ {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={muted ? "text-zinc-500" : "text-zinc-600"}>{label}</span>
      <span className={`font-semibold ${muted ? "text-zinc-600" : "text-[#02062c]"}`}>
        {value}
      </span>
    </div>
  );
}

/* ============== Edit Modal ============== */

function EditModal() {
  const { editRows, saving, closeEdit, setEditRow, saveEdit } = usePowerStore();
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#02062c]">
            Edit Power Requirement
          </h3>
          <button
            onClick={closeEdit}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {editRows.map((row, index) => {
            const total = Number(row.power_required || 0) * Number(row.price_per_kw || 0);
            return (
              <div
                key={index}
                className="border border-zinc-200 rounded-xl p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[13px] text-[#02062c]">{row.day}</p>
                  <span className="text-[11px] text-zinc-500">
                    ₹{row.price_per_kw}/KW
                  </span>
                </div>
                <Field label="Power Required (KW)">
                  <input
                    type="number"
                    min="0"
                    value={row.power_required}
                    onChange={(e) => setEditRow(index, "power_required", e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field>
                <Field label="Phase">
                  <div className="flex gap-2">
                    {["Single Phase", "Three Phase"].map((p) => (
                      <label
                        key={p}
                        className={`flex-1 cursor-pointer px-3 py-2 text-[12px] font-semibold border rounded-lg text-center ${
                          row.phase === p
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name={`edit-phase-${index}`}
                          value={p}
                          checked={row.phase === p}
                          onChange={(e) => setEditRow(index, "phase", e.target.value)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </Field>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                    Total
                  </span>
                  <span className="text-[14px] font-bold text-emerald-700">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex justify-end gap-2">
          <button
            onClick={closeEdit}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Power"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== Helpers ============== */

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
      <p className="text-[14px] text-zinc-500">{text}</p>
    </div>
  );
}
