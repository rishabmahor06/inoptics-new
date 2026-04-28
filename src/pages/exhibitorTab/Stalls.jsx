import React, { useEffect } from "react";
import {
  MdAdd, MdEdit, MdDelete, MdEmail, MdReceiptLong, MdCalculate,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useHallNumbersStore }     from "../../store/stallsManagement/useHallNumbersStore";
import { useStallNumbersStore }    from "../../store/stallsManagement/useStallNumbersStore";
import { useStallCategoriesStore } from "../../store/stallsManagement/useStallCategoriesStore";
import { useStallAreasStore }      from "../../store/stallsManagement/useStallAreasStore";
import {
  useExhibitorStallsStore, customRoundHelper as customRound,
} from "../../store/exhibitor/useExhibitorStallsStore";

const CURRENCIES = ["Rupees", "Dollar", "Euro"];

export default function Stalls() {
  const { editingExhibitor: ex } = useNavStore();

  /* dropdown source-of-truth (live via shared zustand stores) */
  const halls         = useHallNumbersStore((s) => s.rows);
  const fetchHalls    = useHallNumbersStore((s) => s.fetch);
  const stallNos      = useStallNumbersStore((s) => s.rows);
  const fetchStallNos = useStallNumbersStore((s) => s.fetch);
  const categories    = useStallCategoriesStore((s) => s.rows);
  const fetchCats     = useStallCategoriesStore((s) => s.fetch);
  const areas         = useStallAreasStore((s) => s.rows);
  const fetchAreas    = useStallAreasStore((s) => s.fetch);

  const {
    stallList, formData, errors, editingIndex, isSendingMail, saving,
    initForCompany, setField, selectCategory, selectCurrency,
    submitStall, updateStall, deleteStall, editStall, sendStallsMail,
  } = useExhibitorStallsStore();

  /* boot: load dropdown sources + reset form for current exhibitor */
  useEffect(() => { fetchHalls(); fetchStallNos(); fetchCats(); fetchAreas(); }, [fetchHalls, fetchStallNos, fetchCats, fetchAreas]);
  useEffect(() => { if (ex) initForCompany(ex); }, [ex, initForCompany]);

  if (!ex) return null;

  const isEditing = editingIndex !== null;
  const exState   = ex.state || "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) updateStall(exState);
    else           submitStall(exState);
  };

  return (
    <div className="space-y-5">
      {/* ============= FORM + BILLING ============= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center">
              <MdCalculate size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">
                {isEditing ? "Edit Stall" : "Add Stall"}
              </h3>
              <p className="text-[12px] text-zinc-400">
                {ex.company_name} · {ex.state || "—"}
              </p>
            </div>
          </div>

          {/* Row 1 — Hall + Stall */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Hall Number" required error={errors.hall_number}
              value={formData.hall_number}
              onChange={(v) => setField("hall_number", v, exState)}
              options={halls.map((h) => h.hall_number)}
            />
            <SelectField
              label="Stall Number" required error={errors.stall_number}
              value={formData.stall_number}
              onChange={(v) => setField("stall_number", v, exState)}
              options={stallNos.map((s) => s.stall_number)}
            />
          </div>

          {/* Row 2 — Category + Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Stall Category" required error={errors.stall_category}
              value={formData.stall_category}
              onChange={(v) => selectCategory(v, categories, exState)}
              options={categories.map((c) => c.category)}
            />
            <SelectField
              label="Stall Area" required error={errors.stall_area}
              value={formData.stall_area}
              onChange={(v) => setField("stall_area", v, exState)}
              options={areas.map((a) => a.area)}
            />
          </div>

          {/* Row 3 — Currency + Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Currency" required error={errors.currency}
              value={formData.currency}
              onChange={(v) => selectCurrency(v, categories, exState)}
              options={CURRENCIES}
            />
            <InputField
              label="Discount (%)" type="number"
              value={formData.discount}
              onChange={(v) => setField("discount", v, exState)}
              placeholder="0"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
            {stallList.length > 0 && (
              <button
                type="button"
                disabled={isSendingMail}
                onClick={() => sendStallsMail(ex)}
                className="px-4 h-10 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <MdEmail size={16} />
                {isSendingMail ? "Sending..." : "Send Mail"}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`px-4 h-10 text-[13px] font-semibold text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
                isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isEditing ? <MdEdit size={16} /> : <MdAdd size={16} />}
              {saving ? "Saving..." : isEditing ? "Update Stall" : "Add Stall"}
            </button>
          </div>
        </form>

        {/* BILLING / PARTICULARS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center">
              <MdReceiptLong size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Billing</h3>
              <p className="text-[12px] text-zinc-400">Live calculation</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Particulars</p>
            <BillRow label="Stall Number"  value={formData.stall_number || "-"} />
            <BillRow label="Hall Number"   value={formData.hall_number || "-"} />
            <BillRow label="Category"      value={formData.stall_category || "-"} />
            <BillRow label="Area"          value={formData.stall_area || "-"} />
            <BillRow
              label="Price (per sq mtr)"
              value={`${formData.stall_price || "-"} ${formData.currency || ""}`}
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Billing Details</p>
            <BillRow
              label="Total"
              value={`${customRound(formData.total)} ${formData.currency || ""}`}
            />
            {parseFloat(formData.discount) > 0 && (
              <>
                <BillRow
                  label={`Discount (${formData.discount}%)`}
                  value={`${customRound(formData.discounted_amount)} ${formData.currency || ""}`}
                />
                <BillRow
                  label="After Discount"
                  value={`${customRound(formData.total_after_discount)} ${formData.currency || ""}`}
                  bold
                />
              </>
            )}
            {exState.toLowerCase() === "delhi" && formData.currency === "Rupees" ? (
              <>
                <BillRow label="SGST (9%)" value={`${customRound(formData.sgst9)} ${formData.currency}`} />
                <BillRow label="CGST (9%)" value={`${customRound(formData.cgst9)} ${formData.currency}`} />
              </>
            ) : (
              <BillRow
                label="IGST (18%)"
                value={`${customRound(formData.igst18)} ${formData.currency || ""}`}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-zinc-900">
            <span className="text-[14px] font-bold text-zinc-900">Grand Total</span>
            <span className="text-[16px] font-bold text-blue-700">
              {customRound(formData.grand_total)} {formData.currency || ""}
            </span>
          </div>
        </div>
      </div>

      {/* ============= TABLE ============= */}
      <StallsTable
        stallList={stallList}
        editStall={(s, i) => editStall(s, i, exState)}
        deleteStall={deleteStall}
      />

      {/* sending overlay */}
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

function InputField({ label, value, onChange, type = "text", placeholder = "", required, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-[14px] border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-300 bg-red-50" : "border-zinc-200"
        }`}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-[14px] border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-300 bg-red-50" : "border-zinc-200"
        }`}
      >
        <option value="">-- Select --</option>
        {options?.filter(Boolean).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function BillRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-zinc-500">{label}:</span>
      <span className={`text-[13px] ${bold ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"}`}>
        {value}
      </span>
    </div>
  );
}

/* ================= table ================= */

const COLUMNS = [
  { label: "Stall #",     key: "stall_number" },
  { label: "Hall",        key: "hall_number" },
  { label: "Category",    key: "stall_category" },
  { label: "Price",       key: "stall_price" },
  { label: "Currency",    key: "currency" },
  { label: "Area",        key: "stall_area" },
  { label: "Total",       key: "total" },
  { label: "Disc %",      key: "discount_percent" },
  { label: "Disc Amt",    key: "discounted_amount" },
  { label: "After Disc",  key: "total_after_discount" },
  { label: "SGST 9%",     key: "sgst_9_percent" },
  { label: "CGST 9%",     key: "cgst_9_percent" },
  { label: "IGST 18%",    key: "igst_18_percent" },
  { label: "Grand Total", key: "grand_total" },
];

function StallsTable({ stallList, editStall, deleteStall }) {
  const visible = COLUMNS.filter((c) =>
    stallList.some((s) => s[c.key] !== null && s[c.key] !== undefined && s[c.key] !== ""),
  );

  if (stallList.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl py-12 text-center text-[14px] text-zinc-400">
        No stalls added yet
      </div>
    );
  }

  const sumCol = (key) =>
    Math.round(stallList.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0));

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              {visible.map((c) => (
                <th key={c.key} className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody>
            {stallList.map((stall, i) => (
              <tr key={stall.id || i} className="hover:bg-zinc-50 border-b border-zinc-50">
                {visible.map((c) => {
                  let v = stall[c.key];
                  if (c.key === "stall_area" && v != null && v !== "") {
                    const num = parseFloat(v);
                    if (!isNaN(num)) v = `${Number.isInteger(num) ? num : num.toFixed(2)} sq mtr`;
                  }
                  return (
                    <td key={c.key} className="px-3 py-3 text-[13px] text-zinc-700 whitespace-nowrap">
                      {v ?? "—"}
                    </td>
                  );
                })}
                <td className="px-3 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => editStall(stall, i)}
                      className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                      title="Edit"
                    >
                      <MdEdit size={14} />
                    </button>
                    <button
                      onClick={() => deleteStall(i)}
                      className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                      title="Delete"
                    >
                      <MdDelete size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Grand-total row */}
            {stallList.length >= 2 && (
              <tr className="bg-blue-50 font-bold">
                {visible.map((c) => {
                  let cell = "";
                  switch (c.key) {
                    case "stall_number":         cell = stallList.map((s) => s.stall_number).join(", "); break;
                    case "total":                cell = sumCol("total"); break;
                    case "discount_percent":     cell = stallList[0]?.discount_percent || 0; break;
                    case "discounted_amount":    cell = sumCol("discounted_amount"); break;
                    case "total_after_discount": cell = sumCol("total_after_discount"); break;
                    case "sgst_9_percent":       cell = sumCol("sgst_9_percent"); break;
                    case "cgst_9_percent":       cell = sumCol("cgst_9_percent"); break;
                    case "igst_18_percent":      cell = sumCol("igst_18_percent"); break;
                    case "grand_total":          cell = sumCol("grand_total"); break;
                    default: cell = "";
                  }
                  return (
                    <td key={c.key} className="px-3 py-3 text-[13px] text-zinc-800 whitespace-nowrap">
                      {cell !== "" && cell !== 0 ? cell : ""}
                    </td>
                  );
                })}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet cards */}
      <div className="xl:hidden divide-y divide-zinc-100">
        {stallList.map((stall, i) => (
          <div key={stall.id || i} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                <p className="font-semibold text-[14px] text-zinc-800">
                  Stall {stall.stall_number} · Hall {stall.hall_number || "—"}
                </p>
                <p className="text-[12px] text-zinc-500">{stall.stall_category}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => editStall(stall, i)}
                  className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                >
                  <MdEdit size={13} />
                </button>
                <button
                  onClick={() => deleteStall(i)}
                  className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                >
                  <MdDelete size={13} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <div><span className="text-zinc-400">Area: </span><b className="text-zinc-700">{stall.stall_area} sq mtr</b></div>
              <div><span className="text-zinc-400">Price: </span><b className="text-zinc-700">{stall.stall_price} {stall.currency}</b></div>
              <div><span className="text-zinc-400">Total: </span><b className="text-zinc-700">{stall.total}</b></div>
              {parseFloat(stall.discount_percent) > 0 && (
                <div><span className="text-zinc-400">Disc: </span><b className="text-zinc-700">{stall.discount_percent}%</b></div>
              )}
              <div className="col-span-2 pt-1 border-t border-zinc-100 mt-1">
                <span className="text-zinc-400">Grand Total: </span>
                <b className="text-blue-700 text-[13px]">{stall.grand_total} {stall.currency}</b>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
