import React, { useEffect, useState, useRef } from "react";
import TabShell from "../TabShell";
import {
  MdBadge,
  MdAddCircle,
  MdUpload,
  MdEdit,
  MdLock,
  MdLockOpen,
  MdClose,
  MdVerified,
  MdCurrencyRupee,
  MdInfoOutline,
  MdReceiptLong,
  MdImage,
  MdHourglassTop,
} from "react-icons/md";
import toast from "react-hot-toast";
import { useExhibitorBadgeStore } from "../store/useExhibitorBadgeStore";
import { getExhibitor } from "../api/base";

export default function ExhibitorBadges() {
  const {
    badges,
    freeBadges,
    freeRemaining,
    extraPaidBadges,
    unlockApprovedMap,
    loading,
    saving,
    billing,
    fetchAll,
    createBadge,
    updateBadge,
    submitAll,
    requestUnlock,
    relockAfterUpdate,
  } = useExhibitorBadgeStore();
  const exhibitor = getExhibitor();

  const [showAdd, setShowAdd] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const sortedBadges = [...badges].sort(
    (a, b) => (a.badge_series_num || 0) - (b.badge_series_num || 0)
  );

  return (
    <TabShell>
      {/* ============ TOP STATS + ACTION ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <StatCard
          label="Free Badges Allotted"
          value={freeBadges}
          tone="emerald"
          Icon={MdVerified}
        />
        <StatCard
          label="Free Remaining"
          value={freeRemaining}
          tone="blue"
          Icon={MdBadge}
        />
        <StatCard
          label="Extra Requested"
          value={extraPaidBadges}
          tone="amber"
          Icon={MdCurrencyRupee}
        />
        <div className="bg-white rounded border border-zinc-200 shadow-sm p-3 flex flex-col gap-2 justify-center">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 h-10 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <MdAddCircle size={16} /> Add Badge
          </button>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={badges.length === 0}
            className="w-full inline-flex items-center justify-center gap-1.5 h-10 text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-60 transition-colors"
          >
            <MdUpload size={15} /> Submit All
          </button>
        </div>
      </div>

      {/* ============ POLICY + BILLING ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
        <PolicyCard freeBadges={freeBadges} />
        <BillingCard billing={billing} />
      </div>

      {/* ============ BADGES TABLE ============ */}
      <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden mt-4">
        <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <MdBadge size={15} />
            </div>
            <h3 className="text-[13.5px] font-bold text-[#02062c]">
              Badges List
            </h3>
            <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {badges.length}
            </span>
          </div>
        </div>

        {loading ? (
          <TableSkel />
        ) : badges.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50/80 border-b border-zinc-100">
                  <tr>
                    {["#", "Photo", "Name", "Stall", "City", "Type", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedBadges.map((b, i) => {
                    const isFree = i < freeBadges;
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-zinc-50 hover:bg-zinc-50/60"
                      >
                        <td className="px-3 py-3 text-[12.5px] text-zinc-500">
                          {i + 1}
                        </td>
                        <td className="px-3 py-3">
                          <BadgeAvatar src={b.photo} name={b.name} />
                        </td>
                        <td className="px-3 py-3 text-[13px] font-semibold text-zinc-800">
                          {b.name}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-zinc-700">
                          {b.stall_no || "—"}
                        </td>
                        <td className="px-3 py-3 text-[13px] text-zinc-700">
                          {b.city || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <TypePill free={isFree} />
                        </td>
                        <td className="px-3 py-3">
                          <ActionButtons
                            badge={b}
                            unlockApproved={unlockApprovedMap[b.id] === 1}
                            onEdit={() => setEditing(b)}
                            onUnlock={() => requestUnlock(b)}
                            onSubmitUpdate={() => relockAfterUpdate(b.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-zinc-100">
              {sortedBadges.map((b, i) => {
                const isFree = i < freeBadges;
                return (
                  <div key={b.id} className="p-4 flex gap-3">
                    <BadgeAvatar src={b.photo} name={b.name} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[13.5px] text-zinc-800 truncate">
                          {i + 1}. {b.name}
                        </p>
                        <TypePill free={isFree} />
                      </div>
                      <p className="text-[11.5px] text-zinc-500 mt-0.5">
                        Stall: {b.stall_no || "—"} · {b.city || "—"}
                      </p>
                      <div className="mt-2">
                        <ActionButtons
                          badge={b}
                          unlockApproved={unlockApprovedMap[b.id] === 1}
                          onEdit={() => setEditing(b)}
                          onUnlock={() => requestUnlock(b)}
                          onSubmitUpdate={() => relockAfterUpdate(b.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showAdd && (
        <AddBadgeModal
          exhibitor={exhibitor}
          stallNo={
            useExhibitorBadgeStore.getState().stallList?.[0]?.stall_number || ""
          }
          freeRemaining={freeRemaining}
          saving={saving}
          onClose={() => setShowAdd(false)}
          onSave={async (data) => {
            const ok = await createBadge(data);
            if (ok) setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <EditBadgeModal
          badge={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={async (b) => {
            const ok = await updateBadge(b);
            if (ok) setEditing(null);
          }}
        />
      )}

      {showSubmitConfirm && (
        <ConfirmModal
          title="Confirm Submission"
          message="Once submitted, badges will be locked. Unlock requires admin approval. Additional badges can still be added (charges apply)."
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={async () => {
            setShowSubmitConfirm(false);
            await submitAll();
          }}
        />
      )}
    </TabShell>
  );
}

/* ============== Stat Card ============== */

function StatCard({ label, value, tone = "blue", Icon }) {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
  };
  const t = tones[tone] || tones.blue;
  return (
    <div className="bg-white rounded border border-zinc-200 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded flex items-center justify-center ${t.bg} ${t.text}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#02062c] leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ============== Policy + Billing ============== */

function PolicyCard({ freeBadges }) {
  return (
    <div className="lg:col-span-3 bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60 flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
          <MdInfoOutline size={15} />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#02062c]">
          Exhibitor Badge Policy
        </h3>
      </div>
      <div className="p-4 sm:p-5 text-[13px] text-zinc-700 leading-relaxed space-y-2">
        <p>
          As per your stall size, you will receive{" "}
          <strong className="text-blue-700">{freeBadges}</strong> complimentary
          badge{freeBadges === 1 ? "" : "s"} for the exhibition.
        </p>
        <p>
          Additional badges can be requested at{" "}
          <strong>₹100 per badge</strong>. Requests after{" "}
          <strong>20th March 2026</strong> are charged at <strong>₹200 per badge</strong>.
        </p>
        <p>
          Once submitted, changes will be locked. Updates require an unlock
          request from the organiser. Please ensure all details are correct
          before submitting.
        </p>
      </div>
    </div>
  );
}

function BillingCard({ billing }) {
  return (
    <div className="lg:col-span-2 bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60 flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
          <MdReceiptLong size={15} />
        </div>
        <h3 className="text-[13.5px] font-bold text-[#02062c]">
          Billing Summary
        </h3>
      </div>
      <div className="p-4 space-y-2">
        <Row label="Extra Badges" value={billing.paidCount} />
        <Row label="Rate per Badge" value={`₹ ${billing.rate}`} />
        <Row label="Subtotal" value={`₹ ${billing.subtotal.toFixed(2)}`} />
        {billing.isDelhi ? (
          <>
            <Row label="CGST (9%)" value={`₹ ${billing.cgst.toFixed(2)}`} muted />
            <Row label="SGST (9%)" value={`₹ ${billing.sgst.toFixed(2)}`} muted />
          </>
        ) : (
          <Row label="IGST (18%)" value={`₹ ${billing.igst.toFixed(2)}`} muted />
        )}
        <div className="border-t-2 border-zinc-200 mt-1 pt-2 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#02062c]">Grand Total</span>
          <span className="text-[16px] font-bold text-emerald-700">
            ₹ {billing.grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className={muted ? "text-zinc-500" : "text-zinc-600"}>{label}</span>
      <span className={`font-semibold ${muted ? "text-zinc-600" : "text-zinc-800"}`}>
        {value}
      </span>
    </div>
  );
}

/* ============== Badge cells ============== */

function BadgeAvatar({ src, name, size = 40 }) {
  return (
    <div
      className="rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={`https://inoptics.in/${src}`}
          alt={name || "badge"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <MdImage size={size * 0.5} className="text-zinc-300" />
      )}
    </div>
  );
}

function TypePill({ free }) {
  return free ? (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
      <MdVerified size={11} /> Free
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
      <MdCurrencyRupee size={11} /> Paid
    </span>
  );
}

function ActionButtons({ badge, unlockApproved, onEdit, onUnlock, onSubmitUpdate }) {
  const lock = Number(badge.badge_lock);
  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {lock === 0 && (
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center"
          title="Edit"
        >
          <MdEdit size={14} />
        </button>
      )}
      {lock === 0 && unlockApproved && (
        <button
          onClick={onSubmitUpdate}
          className="px-2.5 h-8 inline-flex items-center gap-1 text-[11.5px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
        >
          Submit Update
        </button>
      )}
      {lock === 1 && (
        <button
          onClick={onUnlock}
          className="w-8 h-8 rounded text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center"
          title="Request unlock"
        >
          <MdLock size={14} />
        </button>
      )}
      {lock === 2 && (
        <span className="inline-flex items-center gap-1 px-2 h-8 text-[10.5px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded">
          <MdHourglassTop size={11} /> Pending
        </span>
      )}
    </div>
  );
}

/* ============== Add modal ============== */

function AddBadgeModal({ exhibitor, stallNo, freeRemaining, saving, onClose, onSave }) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    setPhoto(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  return (
    <ModalShell onClose={onClose} title="Exhibitor Badge Registration">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {freeRemaining > 0 ? (
          <TypePill free />
        ) : (
          <TypePill free={false} />
        )}
        <span className="text-[11.5px] text-zinc-500">
          Free Remaining:{" "}
          <strong className="text-zinc-800">{freeRemaining}</strong>
        </span>
      </div>
      <p className="text-[12.5px] text-zinc-500 mb-4 leading-relaxed">
        Additional badges at ₹100 + GST per badge. After 20 Mar 2026, ₹200 per
        badge.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <DisField label="Company" value={exhibitor?.company_name} />
        <DisField label="Stall No" value={stallNo} />
        <DisField label="State" value={exhibitor?.state} />
        <DisField label="City" value={exhibitor?.city} />
      </div>

      <div className="mb-3">
        <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
          Exhibitor Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter candidate name"
          autoFocus
          className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
          Photo (optional, max 2MB)
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onPhoto}
            className="text-[12px] flex-1"
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-14 h-14 rounded object-cover border border-zinc-200"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
        <button
          onClick={onClose}
          disabled={saving}
          className="px-4 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ name, photo })}
          disabled={saving || !name.trim()}
          className="px-5 h-10 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Generate Badge"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ============== Edit modal ============== */

function EditBadgeModal({ badge, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    id: badge.id,
    name: badge.name || "",
    stall_no: badge.stall_no || "",
    state: badge.state || "",
    city: badge.city || "",
    candidate_photo: null,
    preview: badge.photo ? `https://inoptics.in/${badge.photo}` : null,
  });

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((p) => ({
      ...p,
      candidate_photo: f,
      preview: URL.createObjectURL(f),
    }));
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <ModalShell onClose={onClose} title="Edit Badge">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <FormField label="Name *" value={form.name} onChange={set("name")} />
        <FormField label="Stall" value={form.stall_no} onChange={set("stall_no")} />
        <FormField label="State" value={form.state} onChange={set("state")} />
        <FormField label="City" value={form.city} onChange={set("city")} />
      </div>
      <div className="mb-4">
        <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
          Photo
        </label>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={onPhoto} className="text-[12px] flex-1" />
          {form.preview && (
            <img
              src={form.preview}
              alt="preview"
              className="w-14 h-14 rounded object-cover border border-zinc-200"
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
        <button
          onClick={onClose}
          disabled={saving}
          className="px-4 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim()}
          className="px-5 h-10 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </ModalShell>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-zinc-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function DisField({ label, value }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-zinc-500 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value || "—"}
        readOnly
        className="w-full px-3 py-2 text-[13px] border border-zinc-200 bg-zinc-50 text-zinc-600 rounded cursor-not-allowed"
      />
    </div>
  );
}

/* ============== Confirm modal ============== */

function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-5 pt-6 pb-2 text-center">
          <div className="w-14 h-14 rounded bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-3">
            <MdLock size={26} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
          <p className="mt-2 text-[13px] text-zinc-500 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-5 pb-5 pt-3 flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== Modal shell ============== */

function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#02062c]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded text-zinc-500 hover:bg-zinc-100 flex items-center justify-center"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ============== Empty + Skel ============== */

function EmptyState({ onAdd }) {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 rounded bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-300">
        <MdBadge size={26} />
      </div>
      <p className="text-[13px] text-zinc-500 mb-3">No badges yet</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 h-10 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
      >
        <MdAddCircle size={15} /> Add First Badge
      </button>
    </div>
  );
}

function TableSkel() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-zinc-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/5 bg-zinc-100 rounded animate-pulse" />
            <div className="h-2.5 w-1/4 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
