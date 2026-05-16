import React, { useEffect, useMemo, useState } from "react";
import TabShell from "../TabShell";
import {
  MdChair,
  MdAdd,
  MdRemove,
  MdDelete,
  MdSearch,
  MdClose,
  MdCheck,
  MdReceiptLong,
  MdStore,
  MdLock,
  MdLockOpen,
  MdSend,
  MdHourglassTop,
} from "react-icons/md";
import { useFurnitureStore } from "../store/useFurnitureStore";
import { getExhibitor } from "../api/base";

const IMG_BASE = "https://www.inoptics.in/api/uploads";

const imgSrc = (raw) => {
  if (!raw) return "";
  if (/^https?:/i.test(raw)) return raw;
  return `${IMG_BASE}/${raw}`;
};

export default function AdditionalFurniture() {
  const {
    catalog,
    vendor,
    selected,
    isSaved,
    loading,
    saving,
    billing,
    fetchAll,
    addItem,
    removeItem,
    setQuantity,
    save,
    requestUnlock,
  } = useFurnitureStore();

  const [showAdd, setShowAdd] = useState(false);
  const [unlockSent, setUnlockSent] = useState(false);
  const exhibitor = getExhibitor();
  const isDelhi = (exhibitor?.state || "").trim().toLowerCase() === "delhi";
  const vendorInfo = vendor?.[0] || null;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalQty = selected.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const subTotal = billing.amount || 0;

  return (
    <TabShell
      title="Furniture Components"
      Icon={MdChair}
      subtitle="Select and manage your required furniture components."
    >
      <div className="flex justify-end -mt-2 mb-2">
        <StatusPill isSaved={isSaved} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ===================== LEFT — TABLE ===================== */}
        <div className="lg:col-span-2 bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => setShowAdd(true)}
              disabled={isSaved}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <MdAdd size={16} /> Add Furniture
            </button>
            <p className="text-[12.5px] text-zinc-500">
              Add and select furniture components
            </p>
          </div>

          <div className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-zinc-100">
            <p className="text-[14px] font-bold text-[#02062c]">
              Selected Furniture{" "}
              <span className="ml-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {selected.length} Items
              </span>
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            {loading ? (
              <TableSkel />
            ) : selected.length === 0 ? (
              <EmptyState />
            ) : (
              <table className="w-full">
                <thead className="bg-blue-50/50">
                  <tr>
                    {["#", "Furniture", "Unit Price (₹)", "Quantity", "Total (₹)", "Action"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-[11px] font-bold text-zinc-600 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selected.map((item, i) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50/40"
                    >
                      <td className="px-3 py-3 text-[13px] text-zinc-500">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                            {item.image ? (
                              <img
                                src={imgSrc(item.image)}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <MdChair size={20} className="text-zinc-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-800 truncate">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-[11.5px] text-zinc-400 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-zinc-700">
                        {Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <QtyStepper
                          value={item.quantity || 1}
                          onChange={(v) => setQuantity(i, v)}
                          disabled={isSaved}
                        />
                      </td>
                      <td className="px-3 py-3 text-[13px] font-bold text-emerald-700">
                        {((item.quantity || 1) * item.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => removeItem(i)}
                          disabled={isSaved}
                          className="w-9 h-9 rounded text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Remove"
                        >
                          <MdDelete size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {loading ? (
              <TableSkel />
            ) : selected.length === 0 ? (
              <EmptyState />
            ) : (
              selected.map((item, i) => (
                <div key={item.id} className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img
                        src={imgSrc(item.image)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <MdChair size={24} className="text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold text-zinc-800">
                        {i + 1}. {item.name}
                      </p>
                      {!isSaved && (
                        <button
                          onClick={() => removeItem(i)}
                          className="w-8 h-8 rounded text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0"
                        >
                          <MdDelete size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-[11.5px] text-zinc-500 mt-0.5">
                      Unit: ₹{Number(item.price).toFixed(2)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyStepper
                        value={item.quantity || 1}
                        onChange={(v) => setQuantity(i, v)}
                        disabled={isSaved}
                      />
                      <span className="text-[13px] font-bold text-emerald-700">
                        ₹{((item.quantity || 1) * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selected.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/40">
              <p className="text-[12.5px] text-zinc-500">
                Total Items: <b className="text-zinc-800">{totalQty}</b>
              </p>
              <p className="text-[13.5px] font-bold text-[#02062c]">
                Grand Total:{" "}
                <span className="text-blue-700">
                  ₹ {subTotal.toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ===================== RIGHT — BILLING + VENDOR ===================== */}
        <div className="space-y-4">
          {/* Billing summary */}
          <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <MdReceiptLong size={15} />
              </div>
              <h3 className="text-[13.5px] font-bold text-[#02062c]">
                Billing Summary
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <SumRow label="Total Items" value={selected.length} />
              <SumRow label="Total Quantity" value={totalQty} />
              <div className="border-t border-zinc-100 my-2" />
              <SumRow label="Sub Total" value={`₹ ${subTotal.toFixed(2)}`} />
              {isDelhi ? (
                <>
                  <SumRow label="CGST (9%)" value={`₹ ${(billing.cgst || 0).toFixed(2)}`} muted />
                  <SumRow label="SGST (9%)" value={`₹ ${(billing.sgst || 0).toFixed(2)}`} muted />
                </>
              ) : (
                <SumRow label="GST (18%)" value={`₹ ${(billing.igst || 0).toFixed(2)}`} muted />
              )}
              <div className="border-t-2 border-zinc-200 mt-2 pt-2 flex items-center justify-between">
                <span className="text-[13px] font-bold text-blue-700">Grand Total</span>
                <span className="text-[16px] font-bold text-blue-700">
                  ₹ {(billing.grandTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Vendor */}
          <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <MdStore size={15} />
              </div>
              <h3 className="text-[13.5px] font-bold text-[#02062c]">
                Vendor Details
              </h3>
            </div>
            <div className="p-4">
              {!vendorInfo ? (
                <p className="text-[12.5px] text-zinc-400 py-2">
                  Vendor info unavailable
                </p>
              ) : (
                <ul className="space-y-2">
                  <VendorLine label="Vendor" value={vendorInfo.vendor_name} />
                  <VendorLine
                    label="Company"
                    value={vendorInfo.company_name}
                  />
                  <VendorLine
                    label="Email"
                    value={vendorInfo.email || vendorInfo.vendor_email}
                  />
                  <VendorLine
                    label="Phone"
                    value={vendorInfo.contact_number || vendorInfo.mobile}
                  />
                </ul>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {isSaved ? (
              <button
                onClick={async () => {
                  await requestUnlock();
                  setUnlockSent(true);
                }}
                disabled={saving || unlockSent}
                className="w-full inline-flex items-center justify-center gap-2 h-11 text-[13px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded shadow-sm disabled:opacity-60"
              >
                {unlockSent ? (
                  <>
                    <MdHourglassTop size={16} /> Unlock Requested
                  </>
                ) : (
                  <>
                    <MdLockOpen size={16} /> Unlock Request
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={save}
                disabled={saving || selected.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 h-11 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm disabled:opacity-60"
              >
                <MdSend size={15} />
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <AddFurnitureModal
          catalog={catalog}
          selected={selected}
          onAdd={addItem}
          onClose={() => setShowAdd(false)}
        />
      )}
    </TabShell>
  );
}

function StatusPill({ isSaved }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
        isSaved
          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
          : "text-amber-700 bg-amber-50 border-amber-200"
      }`}
    >
      {isSaved ? <MdLock size={11} /> : <MdLockOpen size={11} />}
      Status: {isSaved ? "Submitted" : "Draft"}
    </span>
  );
}

function QtyStepper({ value, onChange, disabled }) {
  return (
    <div className="inline-flex items-center border border-zinc-200 rounded overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, Number(value) - 1))}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed border-r border-zinc-200"
      >
        <MdRemove size={14} />
      </button>
      <input
        type="number"
        min="1"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-12 h-8 text-center text-[13px] font-semibold focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-500"
      />
      <button
        type="button"
        onClick={() => onChange(Number(value) + 1)}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed border-l border-zinc-200"
      >
        <MdAdd size={14} />
      </button>
    </div>
  );
}

function AddFurnitureModal({ catalog, selected, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState({});

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...catalog].sort((a, b) => {
      const piA = parseInt((a.name || "").match(/PI-(\d+)/)?.[1] || 0);
      const piB = parseInt((b.name || "").match(/PI-(\d+)/)?.[1] || 0);
      return piA - piB;
    });
    if (!q) return list;
    return list.filter((i) =>
      (i.name || i.furniture_name || "").toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const toggle = (item) => {
    if (selectedIds.has(item.id)) return;
    setPicked((p) => ({ ...p, [item.id]: p[item.id] ? null : item }));
  };

  const pickedCount = Object.values(picked).filter(Boolean).length;

  const handleAdd = () => {
    Object.values(picked).forEach((item) => item && onAdd(item));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#02062c]">Add Furniture</h3>
            <p className="text-[11.5px] text-zinc-500">
              Select furniture components to add
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded text-zinc-500 hover:bg-zinc-100 flex items-center justify-center"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <MdSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search furniture..."
              className="w-full h-9 pl-9 pr-3 text-[13px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-zinc-400 py-10">
              No furniture found
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const alreadySel = selectedIds.has(item.id);
                const isPicked = !!picked[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !alreadySel && toggle(item)}
                    disabled={alreadySel}
                    className={`relative rounded border-2 p-2.5 text-center transition-all ${
                      alreadySel
                        ? "border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed"
                        : isPicked
                          ? "border-blue-500 bg-blue-50/40 shadow"
                          : "border-zinc-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {(isPicked || alreadySel) && (
                      <span
                        className={`absolute top-1.5 left-1.5 w-5 h-5 rounded flex items-center justify-center text-white ${
                          alreadySel ? "bg-zinc-400" : "bg-blue-600"
                        }`}
                      >
                        <MdCheck size={12} />
                      </span>
                    )}
                    <div className="aspect-square w-full bg-zinc-50 rounded overflow-hidden mb-2 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={imgSrc(item.image)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <MdChair size={28} className="text-zinc-300" />
                      )}
                    </div>
                    <p className="text-[12px] font-semibold text-zinc-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11.5px] font-bold text-blue-700 mt-0.5">
                      ₹ {Number(item.price).toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 h-10 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={pickedCount === 0}
            className="inline-flex items-center gap-1.5 px-5 h-10 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-60"
          >
            <MdCheck size={15} /> Add Selected ({pickedCount})
          </button>
        </div>
      </div>
    </div>
  );
}

function SumRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className={muted ? "text-zinc-500" : "text-zinc-600"}>{label}</span>
      <span className={`font-semibold ${muted ? "text-zinc-600" : "text-zinc-800"}`}>
        {value}
      </span>
    </div>
  );
}

function VendorLine({ label, value }) {
  return (
    <li className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className="font-semibold text-zinc-800 text-right truncate">
        {value || "—"}
      </span>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="py-14 text-center">
      <div className="w-14 h-14 rounded bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-300">
        <MdChair size={26} />
      </div>
      <p className="text-[13px] text-zinc-500">No furniture selected yet</p>
      <p className="text-[12px] text-zinc-400 mt-1">
        Click "Add Furniture" to get started
      </p>
    </div>
  );
}

function TableSkel() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-zinc-100 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/5 bg-zinc-100 rounded animate-pulse" />
            <div className="h-2.5 w-1/4 bg-zinc-100 rounded animate-pulse" />
          </div>
          <div className="w-20 h-8 bg-zinc-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
