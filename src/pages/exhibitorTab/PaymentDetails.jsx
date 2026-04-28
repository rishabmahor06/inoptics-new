import React, { useEffect, useMemo, useState } from "react";
import {
  MdPayment, MdRefresh, MdEdit, MdDelete, MdAdd, MdCheck, MdClose,
  MdReceiptLong, MdBolt, MdBadge, MdBusinessCenter, MdStorefront,
  MdArrowBack,
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
  const discountPct     = stallList[0]?.discount_percent || 0;
  return { total, discounted_amount: discountedAmt, sgst, cgst, igst, grand_total: grand, currency, discountPct };
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

const fmt = (n) => Number(n || 0).toFixed(2);

/* ================== main page ================== */

export default function PaymentDetails() {
  const { editingExhibitor: ex } = useNavStore();
  const [activeSection, setActiveSection] = useState(null); // null | "stall" | "power" | "badge"

  /* live data from sibling stores */
  const stallList     = useExhibitorStallsStore((s) => s.stallList);
  const fetchStalls   = useExhibitorStallsStore((s) => s.fetchStallsByCompany);

  const powerTotal    = useExhibitorPowerStore((s) => s.totalPrice);
  const powerCgst     = useExhibitorPowerStore((s) => s.cgst);
  const powerSgst     = useExhibitorPowerStore((s) => s.sgst);
  const powerIgst     = useExhibitorPowerStore((s) => s.igst);
  const powerGrand    = useExhibitorPowerStore((s) => s.grandTotal);
  const previewList   = useExhibitorPowerStore((s) => s.previewList);
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
  const powerPending = (powerGrand || 0) - totalPaidWithTDS(powerPayments);
  const badgePending = (badgeSummary.grandTotal || 0) - totalPaidWithTDS(badgePayments);

  const refreshAll = () => {
    fetchAll(ex);
    if (ex.company_name) fetchStalls(ex.company_name);
    fetchPowerData(ex);
  };

  /* ============== render ============== */

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="px-2.5 h-9 text-[12px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1"
            >
              <MdArrowBack size={14} /> Back
            </button>
          )}
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center">
            <MdPayment size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">
              {activeSection === "stall"  && "Stall Payment"}
              {activeSection === "power"  && "Power Payment"}
              {activeSection === "badge"  && "Exhibitor Badges Payment"}
              {!activeSection && "Payment Details"}
            </h3>
            <p className="text-[12px] text-zinc-400">{ex.company_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="px-3 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5"
            >
              <MdClose size={14} /> Close
            </button>
          )}
          <button
            onClick={refreshAll}
            disabled={loading}
            className="px-3 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5 disabled:opacity-60"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ============== CARDS VIEW ============== */}
      {!activeSection && (
        <>
          {/* Top: Company + Booth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CompanyCard ex={ex} />
            <BoothCard stallList={stallList} />
          </div>

          {/* 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <SummaryCard
              icon={<MdReceiptLong size={18} className="text-white" />}
              iconBg="bg-blue-600"
              title="Stall Particulars"
              onAdd={() => setActiveSection("stall")}
            >
              <BillRow label="Total" value={`${fmt(stallSummary.total)} ${stallSummary.currency}`} />
              {stallSummary.discounted_amount > 0 && (
                <BillRow label={`Discount (${stallSummary.discountPct}%)`}
                  value={`${fmt(stallSummary.discounted_amount)} ${stallSummary.currency}`} />
              )}
              {exState.toLowerCase() === "delhi" ? (
                <>
                  <BillRow label="SGST (9%)" value={`${fmt(stallSummary.sgst)} ${stallSummary.currency}`} />
                  <BillRow label="CGST (9%)" value={`${fmt(stallSummary.cgst)} ${stallSummary.currency}`} />
                </>
              ) : (
                <BillRow label="IGST (18%)" value={`${fmt(stallSummary.igst)} ${stallSummary.currency}`} />
              )}
              <GrandTotalRow value={`${fmt(stallSummary.grand_total)} ${stallSummary.currency}`} />
              <PendingRow pending={stallPending} currency={stallSummary.currency} />
            </SummaryCard>

            <SummaryCard
              icon={<MdBolt size={18} className="text-white" />}
              iconBg="bg-amber-500"
              title="Power Requirement"
              onAdd={() => setActiveSection("power")}
            >
              <BillRow label="Total" value={`${fmt(powerTotal)} ₹`} />
              {exState.toLowerCase() === "delhi" ? (
                <>
                  <BillRow label="CGST (9%)" value={`${fmt(powerCgst)} ₹`} />
                  <BillRow label="SGST (9%)" value={`${fmt(powerSgst)} ₹`} />
                </>
              ) : (
                <BillRow label="IGST (18%)" value={`${fmt(powerIgst)} ₹`} />
              )}
              <GrandTotalRow value={`${fmt(powerGrand)} ₹`} />
              <PendingRow pending={powerPending} currency="₹" />
            </SummaryCard>

            <SummaryCard
              icon={<MdBadge size={18} className="text-white" />}
              iconBg="bg-emerald-600"
              title="Exhibitor Badges"
              onAdd={() => setActiveSection("badge")}
            >
              <BillRow label="Extra Badges" value={badgeSummary.count} />
              <BillRow label="Total Amount" value={`₹${fmt(badgeSummary.total)}`} />
              {exState.toLowerCase() === "delhi" ? (
                <>
                  <BillRow label="CGST (9%)" value={`₹${fmt(badgeSummary.cgst)}`} />
                  <BillRow label="SGST (9%)" value={`₹${fmt(badgeSummary.sgst)}`} />
                </>
              ) : (
                <BillRow label="IGST (18%)" value={`₹${fmt(badgeSummary.igst)}`} />
              )}
              <GrandTotalRow value={`₹${fmt(badgeSummary.grandTotal)}`} />
              <PendingRow pending={badgePending} currency="₹" />
            </SummaryCard>
          </div>
        </>
      )}

      {/* ============== STALL DETAIL VIEW ============== */}
      {activeSection === "stall" && (
        <DetailView
          particulars={
            stallList.length > 1 ? (
              <MultiStallParticulars stallList={stallList} />
            ) : (
              <SingleStallParticulars stall={stallList[0]} />
            )
          }
          billing={
            <StallBillingBreakdown
              summary={stallSummary}
              payments={stallPayments}
              pending={stallPending}
              exState={exState}
            />
          }
          form={
            <PaymentForm
              form={stallForm}
              editing={editingStall}
              setField={setStallField}
              onAdd={() => addStall(ex)}
              onUpdate={() => updateStall(ex)}
              onCancel={resetStallForm}
            />
          }
          list={stallPayments}
          editing={editingStall}
          onEdit={loadStallForEdit}
          onDelete={(i) => deleteStall(ex, i)}
        />
      )}

      {/* ============== POWER DETAIL VIEW ============== */}
      {activeSection === "power" && (
        <DetailView
          particulars={<PowerParticulars previewList={previewList} />}
          billing={
            <PowerBillingBreakdown
              total={powerTotal} cgst={powerCgst} sgst={powerSgst} igst={powerIgst} grand={powerGrand}
              payments={powerPayments}
              pending={powerPending}
              exState={exState}
            />
          }
          form={
            <PaymentForm
              form={powerForm}
              editing={editingPower}
              setField={setPowerField}
              onAdd={() => addPower(ex)}
              onUpdate={() => updatePower(ex)}
              onCancel={resetPowerForm}
            />
          }
          list={powerPayments}
          editing={editingPower}
          onEdit={loadPowerForEdit}
          onDelete={(i) => deletePower(ex, i)}
        />
      )}

      {/* ============== BADGE DETAIL VIEW ============== */}
      {activeSection === "badge" && (
        <DetailView
          particulars={<BadgeParticulars ex={ex} summary={badgeSummary} />}
          billing={
            <BadgeBillingBreakdown
              summary={badgeSummary}
              payments={badgePayments}
              pending={badgePending}
              exState={exState}
            />
          }
          form={
            <PaymentForm
              form={badgeForm}
              editing={editingBadge}
              setField={setBadgeField}
              onAdd={() => addBadge(ex)}
              onUpdate={() => updateBadge(ex)}
              onCancel={resetBadgeForm}
            />
          }
          list={badgePayments}
          editing={editingBadge}
          onEdit={loadBadgeForEdit}
          onDelete={(i) => deleteBadge(ex, i)}
        />
      )}
    </div>
  );
}

/* ================== top cards ================== */

function CompanyCard({ ex }) {
  return (
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
  );
}

function BoothCard({ stallList }) {
  return (
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
  );
}

function SummaryCard({ icon, iconBg, title, onAdd, children }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded ${iconBg} flex items-center justify-center`}>{icon}</div>
        <h4 className="text-[14px] font-bold text-zinc-900">{title}</h4>
      </div>
      <div className="space-y-1.5 flex-1">{children}</div>
      <div className="flex justify-end pt-2">
        <button
          onClick={onAdd}
          className="px-4 h-10 text-[13px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center gap-1.5"
        >
          <MdAdd size={14} /> Add Payment
        </button>
      </div>
    </div>
  );
}

/* ================== detail wrapper ================== */

function DetailView({ particulars, billing, form, list, editing, onEdit, onDelete }) {
  return (
    <div className="space-y-5">
      {/* Top: particulars + billing on left | form on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-5">
          {particulars}
          {billing}
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-[14px] font-bold text-blue-700 uppercase tracking-wider mb-4">Payment Details</h3>
          {form}
        </div>
      </div>

      {/* Added payments */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-zinc-100">
          <h4 className="text-[14px] font-bold text-blue-700 uppercase tracking-wider">Added Payments</h4>
        </div>
        {list.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-zinc-400">No payments added yet</p>
        ) : (
          <PaymentsTable list={list} editing={editing} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

/* ================== particulars ================== */

function SingleStallParticulars({ stall }) {
  if (!stall) return <p className="text-zinc-400 text-[13px]">No stall data</p>;
  const total = (parseFloat(stall.stall_area || 0) * parseFloat(stall.stall_price || 0)) || 0;
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Particulars</h3>
      <div className="space-y-1.5">
        <BillRow label="Stall Number" value={stall.stall_number || "—"} />
        <BillRow label="Hall Number"  value={stall.hall_number || "—"} />
        <BillRow label="Stall Category" value={stall.stall_category || "—"} />
        <BillRow label="Stall Area"   value={stall.stall_area ? `${parseFloat(stall.stall_area).toFixed(0)} sq mtr` : "—"} />
        <BillRow label="Stall Price (per sq mtrs)" value={`${stall.stall_price || "—"} ${stall.currency || ""}`} />
        <BillRow label="Total" value={`${fmt(total)} ${stall.currency || ""}`} />
      </div>
    </div>
  );
}

function MultiStallParticulars({ stallList }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Particulars</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              {["Stall No", "Category", "Area", "Price (per sq.mtrs)", "Total"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
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
                <td className="px-3 py-2 text-[13px] text-zinc-700">{s.stall_price || "—"} {s.currency || ""}</td>
                <td className="px-3 py-2 text-[13px] font-semibold text-zinc-800">
                  {fmt((parseFloat(s.stall_area) || 0) * (parseFloat(s.stall_price) || 0))}
                </td>
              </tr>
            ))}
            <tr className="bg-zinc-100 font-bold">
              <td colSpan="4" className="px-3 py-2 text-[13px] text-zinc-800 text-right">Total</td>
              <td className="px-3 py-2 text-[13px] text-zinc-900">
                {fmt(stallList.reduce((s, r) => s + (parseFloat(r.stall_area) || 0) * (parseFloat(r.stall_price) || 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PowerParticulars({ previewList }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Particulars</h3>
      {previewList.length === 0 ? (
        <p className="text-[13px] text-zinc-400">No power entries</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                {["Day", "Price/KW", "Power", "Phase", "Amount"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewList.map((it, i) => (
                <tr key={i} className="border-b border-zinc-50 last:border-b-0">
                  <td className="px-3 py-2 text-[13px] font-semibold text-zinc-800">{it.day}</td>
                  <td className="px-3 py-2 text-[13px] text-zinc-700">₹{it.pricePerKw}</td>
                  <td className="px-3 py-2 text-[13px] text-zinc-700">{it.powerRequired} KW</td>
                  <td className="px-3 py-2 text-[13px] text-zinc-700">{it.phase}</td>
                  <td className="px-3 py-2 text-[13px] font-semibold text-zinc-800">₹{it.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BadgeParticulars({ ex, summary }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Particulars</h3>
      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3">
        <p className="text-[13px] text-amber-800">
          As per your stall size, you receive{" "}
          <strong>{ex.free_badges || 0}</strong> complimentary badge
          {ex.free_badges === 1 ? "" : "s"} for the exhibition.
        </p>
      </div>
      <div className="space-y-1.5">
        <BillRow label="Free Badges"    value={ex.free_badges || 0} />
        <BillRow label="Extra Badges"   value={summary.count} />
        <BillRow label="Rate per Badge" value={`₹${BADGE_RATE.toFixed(2)}`} />
        <BillRow label="Total"          value={`₹${fmt(summary.total)}`} />
      </div>
    </div>
  );
}

/* ================== billing breakdowns (with per-payment rows) ================== */

function StallBillingBreakdown({ summary, payments, pending, exState }) {
  const isDelhi = exState.toLowerCase() === "delhi";
  const totalPaid = totalPaidWithTDS(payments);
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Billing Details</h3>
      <div className="space-y-1.5">
        <BillRow label="Total" value={`${fmt(summary.total)} ${summary.currency}`} />
        {summary.discounted_amount > 0 && (
          <>
            <BillRow label={`Discount (${summary.discountPct}%)`} value={`${fmt(summary.discounted_amount)} ${summary.currency}`} />
            <BillRow label={`Total After Discount (${summary.discountPct}%)`}
              value={`${fmt(summary.total - summary.discounted_amount)} ${summary.currency}`} />
          </>
        )}
        {isDelhi ? (
          <>
            <BillRow label="SGST (9%)" value={`${fmt(summary.sgst)} ${summary.currency}`} />
            <BillRow label="CGST (9%)" value={`${fmt(summary.cgst)} ${summary.currency}`} />
          </>
        ) : (
          <BillRow label="IGST (18%)" value={`${fmt(summary.igst)} ${summary.currency}`} />
        )}
        <GrandTotalRow value={`${fmt(summary.grand_total)} ${summary.currency}`} />

        {payments.length > 0 && (
          <div className="pt-3">
            {payments.map((p, i) => (
              <React.Fragment key={i}>
                <BillRow label={`Payment ${i + 1}`} value={`${fmt(p.amount)} ${summary.currency}`} />
                <BillRow label={`TDS ${i + 1}`}     value={`${fmt(p.tds)} ${summary.currency}`} />
              </React.Fragment>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-zinc-300">
              <span className="text-[13px] font-bold text-zinc-900">Total Payment After TDS</span>
              <span className="text-[14px] font-bold text-zinc-900">{fmt(totalPaid)} {summary.currency}</span>
            </div>
            <PendingRow pending={pending} currency={summary.currency} />
          </div>
        )}
      </div>
    </div>
  );
}

function PowerBillingBreakdown({ total, cgst, sgst, igst, grand, payments, pending, exState }) {
  const isDelhi = exState.toLowerCase() === "delhi";
  const totalPaid = totalPaidWithTDS(payments);
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Billing Details</h3>
      <div className="space-y-1.5">
        <BillRow label="Total" value={`${fmt(total)} ₹`} />
        {isDelhi ? (
          <>
            <BillRow label="SGST (9%)" value={`${fmt(sgst)} ₹`} />
            <BillRow label="CGST (9%)" value={`${fmt(cgst)} ₹`} />
          </>
        ) : (
          <BillRow label="IGST (18%)" value={`${fmt(igst)} ₹`} />
        )}
        <GrandTotalRow value={`${fmt(grand)} ₹`} />

        {payments.length > 0 && (
          <div className="pt-3">
            {payments.map((p, i) => (
              <React.Fragment key={i}>
                <BillRow label={`Payment ${i + 1}`} value={`${fmt(p.amount)} ₹`} />
                <BillRow label={`TDS ${i + 1}`}     value={`${fmt(p.tds)} ₹`} />
              </React.Fragment>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-zinc-300">
              <span className="text-[13px] font-bold text-zinc-900">Total Payment After TDS</span>
              <span className="text-[14px] font-bold text-zinc-900">{fmt(totalPaid)} ₹</span>
            </div>
            <PendingRow pending={pending} currency="₹" />
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeBillingBreakdown({ summary, payments, pending, exState }) {
  const isDelhi = exState.toLowerCase() === "delhi";
  const totalPaid = totalPaidWithTDS(payments);
  return (
    <div>
      <h3 className="text-[15px] font-bold text-zinc-900 mb-3">Billing Details</h3>
      <div className="space-y-1.5">
        <BillRow label="Total" value={`₹${fmt(summary.total)}`} />
        {isDelhi ? (
          <>
            <BillRow label="CGST (9%)" value={`₹${fmt(summary.cgst)}`} />
            <BillRow label="SGST (9%)" value={`₹${fmt(summary.sgst)}`} />
          </>
        ) : (
          <BillRow label="IGST (18%)" value={`₹${fmt(summary.igst)}`} />
        )}
        <GrandTotalRow value={`₹${fmt(summary.grandTotal)}`} />

        {payments.length > 0 && (
          <div className="pt-3">
            {payments.map((p, i) => (
              <React.Fragment key={i}>
                <BillRow label={`Payment ${i + 1}`} value={`₹${fmt(p.amount)}`} />
                <BillRow label={`TDS ${i + 1}`}     value={`₹${fmt(p.tds)}`} />
              </React.Fragment>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-dashed border-zinc-300">
              <span className="text-[13px] font-bold text-zinc-900">Total Payment After TDS</span>
              <span className="text-[14px] font-bold text-zinc-900">₹{fmt(totalPaid)}</span>
            </div>
            <PendingRow pending={pending} currency="₹" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== form + table ================== */

function PaymentForm({ form, editing, setField, onAdd, onUpdate, onCancel }) {
  const isEditing = editing !== null && editing !== undefined;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Payment Type" placeholder="CHQ/NEFT/IMPS"
          value={form.type} onChange={(v) => setField("type", v)} />
        <Input label="Payment Date" type="date"
          value={form.date} onChange={(v) => setField("date", v)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Name of Exhibitor Bank" placeholder="Exhibitor Bank Name"
          value={form.exhibitorBank} onChange={(v) => setField("exhibitorBank", v)} />
        <Input label="Name of Receiver Bank" placeholder="Receiver Bank Name"
          value={form.receiverBank} onChange={(v) => setField("receiverBank", v)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Amount" type="number" placeholder="Amount"
          value={form.amount} onChange={(v) => setField("amount", v)} />
        <Input label="TDS" type="number" placeholder="TDS"
          value={form.tds} onChange={(v) => setField("tds", v)} />
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-end pt-1">
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
            className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5"
          >
            <MdCheck size={14} /> Update Payment
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="px-4 h-10 text-[13px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center gap-1.5"
          >
            <MdAdd size={14} /> Add Payment
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentsTable({ list, editing, onEdit, onDelete }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              {["Payment Type", "Payment Date", "Exhibitor Bank", "Receiver Bank", "Received Payment", "TDS", "Action"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={i} className={`border-b border-zinc-50 last:border-b-0 ${editing === i ? "bg-blue-50" : "hover:bg-zinc-50"}`}>
                <td className="px-4 py-3 text-[13px] font-semibold text-zinc-800">{p.type || "—"}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-700">{p.date || "—"}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-700">{p.exhibitorBank || "—"}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-700">{p.receiverBank || "—"}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-blue-700">{fmt(p.amount)}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-700">{fmt(p.tds)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEdit(i)}
                      className="px-2.5 py-1 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1"
                    >
                      <MdEdit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(i)}
                      className="px-2.5 py-1 text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-1"
                    >
                      <MdDelete size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-zinc-100">
        {list.map((p, i) => (
          <div key={i} className={`p-4 space-y-2 ${editing === i ? "bg-blue-50" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                <p className="font-semibold text-[14px] text-zinc-800">{p.type || "—"}</p>
                <p className="text-[12px] text-zinc-500">{p.date || "—"}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onEdit(i)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1"
                >
                  <MdEdit size={12} /> Edit
                </button>
                <button
                  onClick={() => onDelete(i)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-1"
                >
                  <MdDelete size={12} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <div><span className="text-zinc-400">Exhibitor: </span><b className="text-zinc-700">{p.exhibitorBank || "—"}</b></div>
              <div><span className="text-zinc-400">Receiver: </span><b className="text-zinc-700">{p.receiverBank || "—"}</b></div>
              <div><span className="text-zinc-400">Amount: </span><b className="text-blue-700">{fmt(p.amount)}</b></div>
              <div><span className="text-zinc-400">TDS: </span><b className="text-zinc-700">{fmt(p.tds)}</b></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================== reusable bits ================== */

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
    <div className="flex items-center justify-between gap-2 py-1 border-b border-dashed border-zinc-100 last:border-b-0">
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
        {cleared ? "Payment Cleared" : "Pending Amount"}
      </span>
      <span className="text-[13px] font-bold">
        {cleared ? `0.00 ${currency}` : `${fmt(pending)} ${currency}`}
      </span>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] font-semibold text-zinc-700">{label}:</label>
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
