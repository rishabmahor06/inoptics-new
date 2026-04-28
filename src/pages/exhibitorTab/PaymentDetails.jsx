import React, { useEffect, useMemo } from "react";
import {
  MdPayment, MdRefresh, MdEdit, MdDelete, MdAdd, MdCheck, MdClose,
  MdReceiptLong, MdBolt, MdBadge, MdBusinessCenter, MdStorefront,
} from "react-icons/md";
import { useNavStore }                  from "../../store/useNavStore";
import { useExhibitorStallsStore }      from "../../store/exhibitor/useExhibitorStallsStore";
import { useExhibitorPowerStore }       from "../../store/exhibitor/useExhibitorPowerStore";
import { useExhibitorPaymentsStore }    from "../../store/exhibitor/useExhibitorPaymentsStore";

const BADGE_RATE = 100;

/* ================== helpers ================== */

function computeStallSummary(stallList = []) {
  const total           = stallList.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const discountedAmt   = stallList.reduce((s, r) => s + (parseFloat(r.discounted_amount) || 0), 0);
  const sgst            = stallList.reduce((s, r) => s + (parseFloat(r.sgst_9_percent)  || 0), 0);
  const cgst            = stallList.reduce((s, r) => s + (parseFloat(r.cgst_9_percent)  || 0), 0);
  const igst            = stallList.reduce((s, r) => s + (parseFloat(r.igst_18_percent) || 0), 0);
  const grand           = stallList.reduce((s, r) => s + (parseFloat(r.grand_total)     || 0), 0);
  const currency        = stallList[0]?.currency || "INR";
  return { total, discounted_amount: discountedAmt, sgst, cgst, igst, grand_total: grand, currency };
}

function computeBadgeSummary(extraBadges, state) {
  const count   = parseInt(extraBadges || 0, 10);
  const total   = count * BADGE_RATE;
  const isDelhi = (state || "").toLowerCase() === "delhi";
  const cgst    = isDelhi ? total * 0.09 : 0;
  const sgst    = isDelhi ? total * 0.09 : 0;
  const igst    = isDelhi ? 0            : total * 0.18;
  return { count, total, cgst, sgst, igst, grandTotal: total + cgst + sgst + igst };
}

const totalPaidWithTDS = (list) =>
  list.reduce((s, p) => s + (parseFloat(p.amount) || 0) + (parseFloat(p.tds) || 0), 0);

/* ================== main page ================== */

export default function PaymentDetails() {
  const { editingExhibitor: ex } = useNavStore();

  /* live data from sibling stores */
  const stallList = useExhibitorStallsStore((s) => s.stallList);
  const fetchStalls = useExhibitorStallsStore((s) => s.fetchStallsByCompany);

  const powerTotals = useExhibitorPowerStore((s) => ({
    totalPrice: s.totalPrice, cgst: s.cgst, sgst: s.sgst, igst: s.igst, grandTotal: s.grandTotal,
  }));
  const fetchPowerData = useExhibitorPowerStore((s) => s.fetchPowerData);

  const {
    stallPayments, powerPayments, badgePayments, loading,
    stallForm, powerForm, badgeForm,
    editingStall, editingPower, editingBadge,
    fetchAll, initForCompany,
    setStallField, setPowerField, setBadgeField,
    resetStallForm, resetPowerForm, resetBadgeForm,
    loadStallForEdit, loadPowerForEdit, loadBadgeForEdit,
    addStall, updateStall, deleteStall,
    addPower, updatePower, deletePower,
    addBadge, updateBadge, deleteBadge,
  } = useExhibitorPaymentsStore();

  /* boot */
  useEffect(() => { if (ex) initForCompany(ex); }, [ex, initForCompany]);

  const exState      = ex?.state || "";
  const stallSummary = useMemo(() => computeStallSummary(stallList), [stallList]);
  const badgeSummary = useMemo(() => computeBadgeSummary(ex?.extra_badges, exState), [ex?.extra_badges, exState]);

  if (!ex) return null;

  const stallPending = (stallSummary.grand_total || 0) - totalPaidWithTDS(stallPayments);
  const powerPending = (powerTotals.grandTotal || 0) - totalPaidWithTDS(powerPayments);
  const badgePending = (badgeSummary.grandTotal || 0) - totalPaidWithTDS(badgePayments);

  const refreshAll = () => {
    fetchAll(ex);
    if (ex.company_name) fetchStalls(ex.company_name);
    fetchPowerData(ex);
  };

  return (
    <div className="space-y-5">
      {/* ============== HEADER ============== */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center">
            <MdPayment size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Payment Details</h3>
            <p className="text-[12px] text-zinc-400">{ex.company_name}</p>
          </div>
        </div>
        <button
          onClick={refreshAll}
          disabled={loading}
          className="px-3 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
          title="Refresh"
        >
          <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ============== TOP: COMPANY + BOOTH ============== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Company Details */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <MdBusinessCenter size={16} className="text-white" />
            </div>
            <h4 className="text-[14px] font-bold text-zinc-900">Company Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <DetailRow label="Company Name" value={ex.company_name} />
            <DetailRow label="Address"      value={ex.address} />
            <DetailRow label="City"         value={ex.city} />
            <DetailRow label="State"        value={ex.state} />
            <DetailRow label="Pincode"      value={ex.pin || ex.pincode} />
            <DetailRow label="Mobile"       value={ex.mobile} />
            <DetailRow label="Email"        value={ex.email} />
            <DetailRow label="GST"          value={ex.gst || ex.gst_number} />
          </div>
        </div>

        {/* Booth Details */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center">
              <MdStorefront size={16} className="text-white" />
            </div>
            <h4 className="text-[14px] font-bold text-zinc-900">Booth Details</h4>
            <span className="text-[12px] text-zinc-400 ml-auto">
              {stallList.length} stall{stallList.length !== 1 ? "s" : ""}
            </span>
          </div>
          {stallList.length === 0 ? (
            <p className="text-[13px] text-zinc-400 py-4">No stalls assigned</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    {["Stall No", "Category", "Area"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stallList.map((s, i) => (
                    <tr key={i} className="border-b border-zinc-50 last:border-b-0">
                      <td className="px-3 py-2 text-[13px] font-semibold text-zinc-800">{s.stall_number || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-zinc-700">{s.stall_category || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-zinc-700">
                        {s.stall_area ? `${parseFloat(s.stall_area).toFixed(0)} sq mtr` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============== STALL PAYMENTS ============== */}
      <PaymentSection
        icon={<MdReceiptLong size={18} className="text-white" />}
        iconBg="bg-blue-600"
        title="Stall Payment"
        currency={stallSummary.currency}
        billing={(
          <>
            <BillRow label="Total" value={`${stallSummary.total.toFixed(2)} ${stallSummary.currency}`} />
            {stallSummary.discounted_amount > 0 && (
              <BillRow label="Discount" value={`${stallSummary.discounted_amount.toFixed(2)} ${stallSummary.currency}`} />
            )}
            {exState.toLowerCase() === "delhi" ? (
              <>
                <BillRow label="SGST (9%)" value={`${stallSummary.sgst.toFixed(2)} ${stallSummary.currency}`} />
                <BillRow label="CGST (9%)" value={`${stallSummary.cgst.toFixed(2)} ${stallSummary.currency}`} />
              </>
            ) : (
              <BillRow label="IGST (18%)" value={`${stallSummary.igst.toFixed(2)} ${stallSummary.currency}`} />
            )}
            <GrandTotalRow value={`${stallSummary.grand_total.toFixed(2)} ${stallSummary.currency}`} />
            <PendingRow pending={stallPending} currency={stallSummary.currency} />
          </>
        )}
        form={stallForm}
        editing={editingStall}
        setField={setStallField}
        onAdd={() => addStall(ex)}
        onUpdate={() => updateStall(ex)}
        onCancel={resetStallForm}
        list={stallPayments}
        onEdit={loadStallForEdit}
        onDelete={(i) => deleteStall(ex, i)}
      />

      {/* ============== POWER PAYMENTS ============== */}
      <PaymentSection
        icon={<MdBolt size={18} className="text-white" />}
        iconBg="bg-amber-500"
        title="Power Payment"
        currency="₹"
        billing={(
          <>
            <BillRow label="Total" value={`${powerTotals.totalPrice.toFixed(2)} ₹`} />
            {exState.toLowerCase() === "delhi" ? (
              <>
                <BillRow label="CGST (9%)" value={`${powerTotals.cgst.toFixed(2)} ₹`} />
                <BillRow label="SGST (9%)" value={`${powerTotals.sgst.toFixed(2)} ₹`} />
              </>
            ) : (
              <BillRow label="IGST (18%)" value={`${powerTotals.igst.toFixed(2)} ₹`} />
            )}
            <GrandTotalRow value={`${powerTotals.grandTotal.toFixed(2)} ₹`} />
            <PendingRow pending={powerPending} currency="₹" />
          </>
        )}
        form={powerForm}
        editing={editingPower}
        setField={setPowerField}
        onAdd={() => addPower(ex)}
        onUpdate={() => updatePower(ex)}
        onCancel={resetPowerForm}
        list={powerPayments}
        onEdit={loadPowerForEdit}
        onDelete={(i) => deletePower(ex, i)}
      />

      {/* ============== BADGE PAYMENTS ============== */}
      <PaymentSection
        icon={<MdBadge size={18} className="text-white" />}
        iconBg="bg-emerald-600"
        title="Exhibitor Badges Payment"
        currency="₹"
        billing={(
          <>
            <BillRow label="Free Badges"  value={ex.free_badges  || 0} />
            <BillRow label="Extra Badges" value={badgeSummary.count} />
            <BillRow label="Total"        value={`₹ ${badgeSummary.total.toFixed(2)}`} />
            {exState.toLowerCase() === "delhi" ? (
              <>
                <BillRow label="CGST (9%)" value={`₹ ${badgeSummary.cgst.toFixed(2)}`} />
                <BillRow label="SGST (9%)" value={`₹ ${badgeSummary.sgst.toFixed(2)}`} />
              </>
            ) : (
              <BillRow label="IGST (18%)" value={`₹ ${badgeSummary.igst.toFixed(2)}`} />
            )}
            <GrandTotalRow value={`₹ ${badgeSummary.grandTotal.toFixed(2)}`} />
            <PendingRow pending={badgePending} currency="₹" />
          </>
        )}
        form={badgeForm}
        editing={editingBadge}
        setField={setBadgeField}
        onAdd={() => addBadge(ex)}
        onUpdate={() => updateBadge(ex)}
        onCancel={resetBadgeForm}
        list={badgePayments}
        onEdit={loadBadgeForEdit}
        onDelete={(i) => deleteBadge(ex, i)}
      />
    </div>
  );
}

/* ================== sub-components ================== */

function DetailRow({ label, value }) {
  return (
    <div className="text-[13px]">
      <span className="text-zinc-400">{label}: </span>
      <span className="font-semibold text-zinc-800">{value || "—"}</span>
    </div>
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

function GrandTotalRow({ value }) {
  return (
    <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-zinc-900">
      <span className="text-[13px] font-bold text-zinc-900">Grand Total</span>
      <span className="text-[15px] font-bold text-blue-700">{value}</span>
    </div>
  );
}

function PendingRow({ pending, currency }) {
  const cleared = pending <= 0;
  return (
    <div className={`flex items-center justify-between gap-2 mt-1 px-2.5 py-1.5 rounded ${
      cleared ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
    }`}>
      <span className="text-[12px] font-bold uppercase tracking-wider">
        {cleared ? "Payment Cleared" : "Pending"}
      </span>
      <span className="text-[13px] font-bold">
        {cleared ? `0.00 ${currency}` : `${pending.toFixed(2)} ${currency}`}
      </span>
    </div>
  );
}

function PaymentSection({
  icon, iconBg, title, billing,
  form, editing, setField, onAdd, onUpdate, onCancel,
  list, onEdit, onDelete,
}) {
  const isEditing = editing !== null && editing !== undefined;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      {/* header */}
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
        <div className={`w-9 h-9 rounded ${iconBg} flex items-center justify-center`}>{icon}</div>
        <h4 className="text-[15px] font-bold text-zinc-900">{title}</h4>
        <span className="text-[12px] text-zinc-400 ml-auto">
          {list.length} payment{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* billing + form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Billing summary */}
          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 space-y-1.5">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Billing</p>
            {billing}
          </div>

          {/* Form */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              {isEditing ? "Edit Payment" : "Add Payment"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Payment Type" placeholder="CHQ/NEFT/IMPS"
                value={form.type} onChange={(v) => setField("type", v)} />
              <Input label="Payment Date" type="date"
                value={form.date} onChange={(v) => setField("date", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Exhibitor Bank" placeholder="Bank name"
                value={form.exhibitorBank} onChange={(v) => setField("exhibitorBank", v)} />
              <Input label="Receiver Bank" placeholder="Bank name"
                value={form.receiverBank} onChange={(v) => setField("receiverBank", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Amount" type="number" placeholder="0"
                value={form.amount} onChange={(v) => setField("amount", v)} />
              <Input label="TDS" type="number" placeholder="0"
                value={form.tds} onChange={(v) => setField("tds", v)} />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isEditing && (
                <button
                  onClick={onCancel}
                  className="px-3 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5"
                >
                  <MdClose size={14} /> Cancel
                </button>
              )}
              {isEditing ? (
                <button
                  onClick={onUpdate}
                  className="px-3 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5"
                >
                  <MdCheck size={14} /> Update Payment
                </button>
              ) : (
                <button
                  onClick={onAdd}
                  className="px-3 h-10 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5"
                >
                  <MdAdd size={14} /> Add Payment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* added payments list */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Added Payments</p>
          {list.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-zinc-400">No payments added yet</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto border border-zinc-200 rounded">
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr>
                      {["Type", "Date", "Exhibitor Bank", "Receiver Bank", "Amount", "TDS", "Action"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p, i) => (
                      <tr key={i} className={`border-b border-zinc-50 last:border-b-0 ${editing === i ? "bg-blue-50" : "hover:bg-zinc-50"}`}>
                        <td className="px-3 py-2.5 text-[13px] font-semibold text-zinc-800">{p.type || "—"}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{p.date || "—"}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{p.exhibitorBank || "—"}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{p.receiverBank || "—"}</td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold text-blue-700">{Number(p.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-[13px] text-zinc-700">{Number(p.tds || 0).toFixed(2)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onEdit(i)}
                              className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                              title="Edit"
                            >
                              <MdEdit size={13} />
                            </button>
                            <button
                              onClick={() => onDelete(i)}
                              className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                              title="Delete"
                            >
                              <MdDelete size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-zinc-100 border border-zinc-200 rounded">
                {list.map((p, i) => (
                  <div key={i} className={`p-3 space-y-1.5 ${editing === i ? "bg-blue-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                        <p className="font-semibold text-[14px] text-zinc-800">{p.type || "—"}</p>
                        <p className="text-[12px] text-zinc-500">{p.date || "—"}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => onEdit(i)}
                          className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                        >
                          <MdEdit size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(i)}
                          className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                        >
                          <MdDelete size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                      <div><span className="text-zinc-400">Exhibitor: </span><b className="text-zinc-700">{p.exhibitorBank || "—"}</b></div>
                      <div><span className="text-zinc-400">Receiver: </span><b className="text-zinc-700">{p.receiverBank || "—"}</b></div>
                      <div><span className="text-zinc-400">Amount: </span><b className="text-blue-700">{Number(p.amount || 0).toFixed(2)}</b></div>
                      <div><span className="text-zinc-400">TDS: </span><b className="text-zinc-700">{Number(p.tds || 0).toFixed(2)}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 h-10 text-[14px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
