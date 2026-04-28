import React, { useEffect, useMemo } from "react";
import {
  MdAdd,
  MdBolt,
  MdDelete,
  MdElectricBolt,
  MdEmail,
  MdInfoOutline,
  MdLock,
  MdLockOpen,
  MdReceiptLong,
  MdSave,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { usePowerTypesStore } from "../../store/master/usePowerTypesStore";
import { useExhibitorPowerStore } from "../../store/exhibitor/useExhibitorPowerStore";

const GUIDELINES = [
  "Power requirements for setup days and exhibition days must be submitted separately.",
  "Power will be arranged as per the requirement form. Requests made after 28th February 2026 may incur additional charges.",
  "If unsure of your needs, please consult your fabricator for accurate details.",
  "Kindly ensure your contractor uses quality, thick wiring. Additional charges may apply if power usage exceeds the amount ordered.",
  "Thank you for your cooperation.",
];

const EMPTY_FORM = { powerRequired: "", phase: "", totalAmount: "" };

const formatCurrency = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

export default function PowerRequirement() {
  const { editingExhibitor: ex } = useNavStore();

  const powerData = usePowerTypesStore((s) => s.rows);
  const fetchPowerData = usePowerTypesStore((s) => s.fetch);

  const {
    forms,
    previewList,
    totalPrice,
    cgst,
    sgst,
    igst,
    grandTotal,
    isLocked,
    unlockRequested,
    isSendingMail,
    saving,
    hasExistingData,
    initForCompany,
    initFormsFromTypes,
    setFormField,
    addAllToList,
    submit,
    removeRow,
    unlockPower,
    sendUpdatePowerMail,
    sendPowerMail,
  } = useExhibitorPowerStore();

  const powerTypes = useMemo(
    () => [...new Set(powerData.map((item) => item.power_type?.trim()).filter(Boolean))],
    [powerData],
  );

  useEffect(() => {
    fetchPowerData();
  }, [fetchPowerData]);

  useEffect(() => {
    if (ex) initForCompany(ex);
  }, [ex, initForCompany]);

  useEffect(() => {
    if (powerData.length) initFormsFromTypes(powerData);
  }, [powerData, initFormsFromTypes]);

  if (!ex) return null;

  const exState = ex.state || "";
  const isDelhi = exState.toLowerCase() === "delhi";
  const filledFormsCount = Object.values(forms).filter((form) => form.powerRequired || form.phase).length;

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:overflow-hidden">
      <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_22rem]">
        <div className="flex min-h-0 flex-col gap-4">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-sm">
            <div className="border-b border-sky-100 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 shadow-sm">
                    <MdElectricBolt size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Exhibitor Utilities
                    </p>
                    <h3 className="mt-1 text-[20px] font-bold leading-tight text-zinc-900">
                      Power Requirement
                    </h3>
                    <p className="mt-1 text-[13px] text-zinc-500">
                      {ex.company_name} <span className="px-1 text-zinc-300">|</span> {ex.state || "State not set"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[24rem]">
                  <StatCard label="Power Types" value={powerTypes.length} tone="sky" />
                  <StatCard label="In Progress" value={filledFormsCount} tone="amber" />
                  <StatCard label="Added Rows" value={previewList.length} tone="emerald" />
                  <StatCard label="Status" value={isLocked ? "Locked" : "Open"} tone={isLocked ? "rose" : "blue"} />
                </div>
              </div>
            </div>

            {powerTypes.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="max-w-md rounded-3xl border border-dashed border-zinc-300 bg-white/80 px-6 py-10 text-center">
                  <MdBolt size={28} className="mx-auto mb-3 text-zinc-400" />
                  <p className="text-[15px] font-semibold text-zinc-800">No power types configured</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                    Add power day masters first, then this form will automatically show live sections here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 px-4 py-4 sm:px-5">
                  <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
                    {powerTypes.map((type, index) => {
                      const price = powerData.find((item) => item.power_type?.trim() === type)?.price ?? "";
                      const form = forms[type] || EMPTY_FORM;

                      return (
                        <FormSection
                          key={type}
                          index={index + 1}
                          type={type}
                          price={price}
                          form={form}
                          onChange={(field, value) => setFormField(type, field, value, powerData)}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-sky-100 bg-white/75 px-4 py-4 backdrop-blur sm:px-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-800">
                        Add all completed sections to the preview list
                      </p>
                      <p className="text-[12px] text-zinc-500">
                        Only rows with both power and phase selected will be added.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addAllToList(powerData, exState)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <MdAdd size={18} />
                      Add to List
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="flex min-h-[18rem] flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm lg:min-h-0 lg:flex-1">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
              <div>
                <h4 className="text-[16px] font-bold text-zinc-900">Added Power Entries</h4>
                <p className="text-[12px] text-zinc-500">Review entries before submitting</p>
              </div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-[12px] font-semibold text-zinc-600">
                {previewList.length} rows
              </div>
            </div>

            <div className="min-h-0 flex-1">
              {previewList.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6 py-10 text-center">
                  <div>
                    <p className="text-[15px] font-semibold text-zinc-800">No power entries yet</p>
                    <p className="mt-2 text-[13px] text-zinc-500">
                      Fill one or more sections above, then add them here for billing.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="hidden h-full md:block">
                    <div className="h-full overflow-auto">
                      <table className="w-full min-w-[44rem]">
                        <thead className="sticky top-0 z-10 bg-zinc-50">
                          <tr>
                            {["Days", "Price/KW", "Power", "Phase", "Total", "Action"].map((heading) => (
                              <th
                                key={heading}
                                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewList.map((item, index) => (
                            <tr
                              key={`${item.day}-${index}`}
                              className="border-b border-zinc-100 align-top transition-colors hover:bg-zinc-50/80"
                            >
                              <td className="px-4 py-3 text-[13px] font-semibold text-zinc-900">{item.day}</td>
                              <td className="px-4 py-3 text-[13px] text-zinc-600">{formatCurrency(item.pricePerKw)}</td>
                              <td className="px-4 py-3 text-[13px] text-zinc-600">{item.powerRequired} KW</td>
                              <td className="px-4 py-3 text-[13px] text-zinc-600">{item.phase}</td>
                              <td className="px-4 py-3 text-[13px] font-semibold text-blue-700">
                                {formatCurrency(item.totalAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeRow(item, ex)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                  title="Remove"
                                >
                                  <MdDelete size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="h-full overflow-auto md:hidden">
                    <div className="space-y-3 p-4">
                      {previewList.map((item, index) => (
                        <div key={`${item.day}-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Entry {index + 1}
                              </p>
                              <p className="mt-1 text-[15px] font-semibold text-zinc-900">{item.day}</p>
                              <p className="text-[12px] text-zinc-500">{item.phase}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRow(item, ex)}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600"
                              title="Remove"
                            >
                              <MdDelete size={15} />
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                            <MobileMeta label="Price / KW" value={formatCurrency(item.pricePerKw)} />
                            <MobileMeta label="Power" value={`${item.powerRequired} KW`} />
                            <div className="col-span-2 rounded-xl bg-white px-3 py-2">
                              <p className="text-zinc-400">Total</p>
                              <p className="text-[14px] font-semibold text-blue-700">
                                {formatCurrency(item.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <section className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-700 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <MdReceiptLong size={20} />
              </div>
              <div>
                <h4 className="text-[16px] font-bold">Power Billing</h4>
                <p className="text-[12px] text-blue-100">Live total based on added entries</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
              <BillingRow label="Total Price" value={formatCurrency(totalPrice)} />
              {isDelhi ? (
                <>
                  <BillingRow label="CGST (9%)" value={formatCurrency(cgst)} />
                  <BillingRow label="SGST (9%)" value={formatCurrency(sgst)} />
                </>
              ) : (
                <BillingRow label="IGST (18%)" value={formatCurrency(igst)} />
              )}
              <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
                <span className="text-[13px] font-semibold text-blue-100">Grand Total</span>
                <span className="text-[20px] font-bold">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                <MdInfoOutline size={20} />
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-zinc-900">Guidelines</h4>
                <p className="text-[12px] text-zinc-500">Important notes before submission</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {GUIDELINES.map((guideline, index) => (
                <div key={guideline} className="flex gap-3 rounded-2xl bg-amber-50 px-3 py-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-amber-700 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="text-[12px] leading-relaxed text-zinc-600">{guideline}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-[16px] font-bold text-zinc-900">Actions</h4>
                <p className="text-[12px] text-zinc-500">Submit, send mail, or unlock request</p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  isLocked ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isLocked ? "Locked" : "Editable"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {hasExistingData && (
                <ActionButton
                  onClick={() => sendUpdatePowerMail(ex)}
                  disabled={isSendingMail}
                  icon={<MdEmail size={17} />}
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  Send Update Power Mail
                </ActionButton>
              )}

              <ActionButton
                onClick={() => sendPowerMail(ex)}
                disabled={isSendingMail}
                icon={<MdEmail size={17} />}
                className="bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Send Mail
              </ActionButton>

              <ActionButton
                onClick={() => submit(ex)}
                disabled={saving || !previewList.length}
                icon={<MdSave size={17} />}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Saving..." : hasExistingData ? "Update" : "Submit"}
              </ActionButton>

              {isLocked && (
                <ActionButton
                  onClick={() => !unlockRequested && unlockPower(ex)}
                  disabled={unlockRequested}
                  icon={unlockRequested ? <MdLock size={17} /> : <MdLockOpen size={17} />}
                  className={
                    unlockRequested
                      ? "bg-zinc-200 text-zinc-500"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }
                >
                  {unlockRequested ? "Unlock Requested" : "Unlock"}
                </ActionButton>
              )}
            </div>
          </section>
        </aside>
      </div>

      {isSendingMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-xl">
            <span className="block h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-[13px] text-zinc-700">Sending mail, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FormSection({ index, type, price, form, onChange }) {
  const hasValue = !!form.powerRequired || !!form.phase;

  return (
    <div className="rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.32)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-[12px] font-bold text-white shadow-sm">
            {index}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Day Type</p>
            <h4 className="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-zinc-900">
              <MdBolt size={16} className="text-amber-500" />
              {type}
            </h4>
          </div>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            hasValue ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {hasValue ? "Drafted" : "Blank"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadField label="Type" value={type} />
        <ReadField label="Price per KW" value={price ? formatCurrency(price) : "—"} />
        <InputField
          label="Power Required (KW)"
          type="number"
          value={form.powerRequired}
          onChange={(value) => onChange("powerRequired", value)}
          placeholder="0"
        />
        <ReadField
          label="Total Amount"
          value={form.totalAmount ? formatCurrency(form.totalAmount) : "—"}
          emphasized={!!form.totalAmount}
        />
      </div>

      <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Phase
        </label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PhaseButton
            label="Single Phase"
            current={form.phase}
            onClick={(value) => onChange("phase", value)}
          />
          <PhaseButton
            label="Three Phase"
            current={form.phase}
            onClick={(value) => onChange("phase", value)}
          />
        </div>
      </div>

      <p className="mt-3 text-[12px] text-zinc-500">
        Total is calculated automatically from power required multiplied by the configured price.
      </p>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
  };

  return (
    <div className={`rounded-2xl border px-3 py-3 ${toneMap[tone] || toneMap.sky}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function ReadField({ label, value, emphasized = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      <div
        className={`flex min-h-11 items-center rounded-2xl border px-3 text-[14px] ${
          emphasized
            ? "border-blue-200 bg-blue-50 font-semibold text-blue-700"
            : "border-zinc-200 bg-zinc-50 text-zinc-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-[14px] text-zinc-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function PhaseButton({ label, current, onClick }) {
  const active = current === label;

  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`flex h-11 items-center justify-center rounded-2xl border px-3 text-[13px] font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({ onClick, disabled, icon, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function BillingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-blue-100">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function MobileMeta({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-zinc-400">{label}</p>
      <p className="font-semibold text-zinc-700">{value}</p>
    </div>
  );
}
