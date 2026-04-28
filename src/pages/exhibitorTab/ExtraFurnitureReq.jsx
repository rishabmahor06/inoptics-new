import React, { useEffect, useMemo } from "react";
import {
  MdAdd,
  MdChair,
  MdCheckCircle,
  MdClose,
  MdDelete,
  MdEmail,
  MdInventory2,
  MdLockOpen,
  MdRefresh,
  MdRemove,
  MdSearch,
  MdShoppingBag,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useExhibitorFurnitureStore } from "../../store/exhibitor/useExhibitorFurnitureStore";

const API = "https://inoptics.in/api";
const MAIL_TEMPLATE = "InOptics 2026 @ Extra Furniture Request Confirmation";

const formatCurrency = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

export default function ExtraFurnitureReq() {
  const { editingExhibitor: ex } = useNavStore();
  const {
    catalogRows,
    selectedFurniture,
    vendorDetails,
    billing,
    lockState,
    hasExistingData,
    loading,
    saving,
    isSendingMail,
    showCatalog,
    catalogSearch,
    initForCompany,
    setShowCatalog,
    setCatalogSearch,
    addFurniture,
    removeFurniture,
    setQuantity,
    changeQuantityBy,
    saveFurniture,
    unlockFurniture,
    sendFurnitureMail,
  } = useExhibitorFurnitureStore();

  useEffect(() => {
    if (ex) initForCompany(ex);
  }, [ex, initForCompany]);

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    if (!query) return catalogRows;
    return catalogRows.filter((item) =>
      String(item.name || "").toLowerCase().includes(query),
    );
  }, [catalogRows, catalogSearch]);

  const isLocked = Number(lockState?.is_locked || 0) === 1;
  const unlockRequested = Number(lockState?.unlock_requested || 0) === 1;
  const isDelhi = String(ex?.state || "").trim().toLowerCase() === "delhi";

  if (!ex) return null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_22rem]">
      <div className="space-y-4">
        

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Selected Furniture</h4>
              <p className="text-[12px] text-zinc-500">Add items from the catalog and adjust quantities before saving</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton
                onClick={() => setShowCatalog(true)}
                disabled={isLocked}
                icon={<MdAdd size={16} />}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Add Furniture
              </ActionButton>
              <ActionButton
                onClick={() => saveFurniture(ex)}
                disabled={saving || isLocked || !selectedFurniture.length}
                icon={<MdCheckCircle size={16} />}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {saving ? "Saving..." : hasExistingData ? "Update" : "Submit"}
              </ActionButton>
              {isLocked && (
                <ActionButton
                  onClick={() => unlockFurniture(ex)}
                  disabled={isSendingMail}
                  icon={<MdLockOpen size={16} />}
                  className={
                    unlockRequested
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }
                >
                  {unlockRequested ? "Unlock Requested" : "Unlock"}
                </ActionButton>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-4 py-14 text-zinc-500">
              <MdRefresh size={22} className="animate-spin text-blue-600" />
              <span className="text-[14px]">Loading furniture details...</span>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[54rem]">
                  <thead className="bg-zinc-50">
                    <tr>
                      {["ID", "Image", "Name", "Price", "Qty", "Amount", "Tax", "Total", "Action"].map((heading) => (
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
                    {selectedFurniture.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center text-[14px] text-zinc-400">
                          No furniture selected yet
                        </td>
                      </tr>
                    ) : (
                      selectedFurniture.map((item, index) => {
                        const amount = Number(item.price) * Number(item.quantity);
                        const tax = isDelhi ? amount * 0.18 : amount * 0.18;
                        const total = amount + tax;

                        return (
                          <tr key={`${item.id}-${index}`} className="border-t border-zinc-100 align-top hover:bg-zinc-50/80">
                            <td className="px-4 py-3 text-[13px] text-zinc-400">{index + 1}</td>
                            <td className="px-4 py-3">
                              <FurnitureThumb image={item.image} name={item.name} />
                            </td>
                            <td className="px-4 py-3 text-[13px] font-semibold text-zinc-900">{item.name}</td>
                            <td className="px-4 py-3 text-[13px] text-zinc-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3">
                              <QtyControl
                                value={item.quantity}
                                disabled={isLocked}
                                onDecrement={() => changeQuantityBy(index, -1, ex.state)}
                                onIncrement={() => changeQuantityBy(index, 1, ex.state)}
                                onChange={(value) => setQuantity(index, value, ex.state)}
                              />
                            </td>
                            <td className="px-4 py-3 text-[13px] text-zinc-600">{formatCurrency(amount)}</td>
                            <td className="px-4 py-3 text-[13px] text-zinc-600">
                              {isDelhi
                                ? `CGST+SGST ${formatCurrency(amount * 0.18)}`
                                : `IGST ${formatCurrency(amount * 0.18)}`}
                            </td>
                            <td className="px-4 py-3 text-[13px] font-semibold text-blue-700">{formatCurrency(total)}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeFurniture(index, ex.state)}
                                disabled={isLocked}
                                className="inline-flex h-9 w-20 items-center justify-center rounded border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <MdDelete size={15} /> Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-zinc-100 lg:hidden">
                {selectedFurniture.length === 0 ? (
                  <p className="px-4 py-12 text-center text-[14px] text-zinc-400">No furniture selected yet</p>
                ) : (
                  selectedFurniture.map((item, index) => {
                    const amount = Number(item.price) * Number(item.quantity);
                    const tax = amount * 0.18;
                    const total = amount + tax;

                    return (
                      <div key={`${item.id}-${index}`} className="space-y-3 p-4">
                        <div className="flex items-start gap-3">
                          <FurnitureThumb image={item.image} name={item.name} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                              Item {index + 1}
                            </p>
                            <p className="mt-1 text-[15px] font-semibold text-zinc-900">{item.name}</p>
                            <p className="text-[12px] text-zinc-500">{formatCurrency(item.price)} per piece</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFurniture(index, ex.state)}
                            disabled={isLocked}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 disabled:opacity-50"
                          >
                            <MdDelete size={15} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <QtyControl
                            value={item.quantity}
                            disabled={isLocked}
                            onDecrement={() => changeQuantityBy(index, -1, ex.state)}
                            onIncrement={() => changeQuantityBy(index, 1, ex.state)}
                            onChange={(value) => setQuantity(index, value, ex.state)}
                          />
                          <span className="text-[16px] font-bold text-blue-700">{formatCurrency(total)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[12px]">
                          <MetaCard label="Amount" value={formatCurrency(amount)} />
                          <MetaCard label={isDelhi ? "CGST + SGST" : "IGST"} value={formatCurrency(tax)} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MdShoppingBag size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Billing Summary</h4>
              <p className="text-[12px] text-zinc-500">Live totals based on current selection</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <SummaryRow label="Total" value={formatCurrency(billing.amount)} />
            {isDelhi ? (
              <>
                <SummaryRow label="CGST (9%)" value={formatCurrency(billing.cgst)} />
                <SummaryRow label="SGST (9%)" value={formatCurrency(billing.sgst)} />
              </>
            ) : (
              <SummaryRow label="IGST (18%)" value={formatCurrency(billing.igst)} />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <span className="text-[14px] font-bold text-zinc-900">Grand Total</span>
            <span className="text-[18px] font-bold text-blue-700">{formatCurrency(billing.grandTotal)}</span>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MdInventory2 size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Vendor Details</h4>
              <p className="text-[12px] text-zinc-500">Primary vendor contact for furniture dispatch</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {vendorDetails.length > 0 ? (
              vendorDetails.map((vendor) => (
                <div key={vendor.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <VendorLine label="Vendor Name" value={vendor.vendor_name} />
                  <VendorLine label="Company Name" value={vendor.company_name} />
                  <VendorLine label="Email" value={vendor.email || vendor.vendor_email} />
                  <VendorLine label="Contact No" value={vendor.contact_number || vendor.mobile} />
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-[13px] text-zinc-500">
                No vendors found
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Actions</h4>
              <p className="text-[12px] text-zinc-500">Send confirmation mail or unlock the section</p>
            </div>
            <StatusPill
              label={isLocked ? unlockRequested ? "Unlock Requested" : "Locked" : hasExistingData ? "Saved" : "Draft"}
              tone={isLocked ? (unlockRequested ? "amber" : "rose") : hasExistingData ? "emerald" : "blue"}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5">
            <ActionButton
              onClick={() => sendFurnitureMail(ex, MAIL_TEMPLATE)}
              disabled={isSendingMail || !selectedFurniture.length}
              icon={<MdEmail size={16} />}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {isSendingMail ? "Sending..." : "Send Mail"}
            </ActionButton>
          </div>
        </section>
      </aside>

      {showCatalog && (
        <CatalogModal
          rows={filteredCatalog}
          selectedFurniture={selectedFurniture}
          search={catalogSearch}
          onSearchChange={setCatalogSearch}
          onClose={() => setShowCatalog(false)}
          onAdd={(item) => addFurniture(item, ex.state)}
        />
      )}
    </div>
  );
}

function CatalogModal({ rows, selectedFurniture, search, onSearchChange, onClose, onAdd }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div>
            <h3 className="text-[16px] font-bold text-zinc-900">Furniture Catalog</h3>
            <p className="text-[12px] text-zinc-500">Choose items to add into the exhibitor furniture list</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-300 hover:text-zinc-200"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="border-b border-zinc-100 px-5 py-4">
          <div className="relative max-w-sm">
            <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search furniture..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-10 w-full rounded border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-zinc-500">
              <MdChair size={34} className="text-zinc-300" />
              <p className="text-[14px]">No furniture items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {rows.map((item) => {
                const alreadyAdded = selectedFurniture.some((row) => String(row.id) === String(item.id));
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-xl border bg-white transition ${
                      alreadyAdded ? "border-emerald-300 ring-1 ring-emerald-200" : "border-zinc-200 hover:shadow-md"
                    }`}
                  >
                    <div className="relative aspect-square bg-zinc-50">
                      <img
                        src={`${API}/uploads/${item.image}`}
                        alt={item.name}
                        className="h-full w-full object-contain p-3"
                      />
                      {alreadyAdded && (
                        <div className="absolute right-2 top-2 rounded bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white">
                          Added
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-[13px] font-semibold text-zinc-900">{item.name}</p>
                      <p className="mt-1 text-[14px] font-bold text-blue-700">{formatCurrency(item.price)}</p>
                      <button
                        type="button"
                        onClick={() => !alreadyAdded && onAdd(item)}
                        disabled={alreadyAdded}
                        className={`mt-3 inline-flex h-9 w-full items-center justify-center rounded px-3 text-[12px] font-semibold transition ${
                          alreadyAdded
                            ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {alreadyAdded ? "Selected" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FurnitureThumb({ image, name }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
      {image ? (
        <img src={`${API}/uploads/${image}`} alt={name} className="h-full w-full object-cover" />
      ) : (
        <MdChair size={24} className="text-zinc-300" />
      )}
    </div>
  );
}

function QtyControl({ value, disabled, onDecrement, onIncrement, onChange }) {
  return (
    <div className="inline-flex items-center rounded-lg bg-zinc-100">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
      >
        <MdRemove size={16} />
      </button>
      <input
        type="number"
        min="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-9 w-14 border-x border-zinc-200 bg-white text-center text-[13px] font-semibold text-zinc-900 outline-none"
      />
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
      >
        <MdAdd size={16} />
      </button>
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-[14px] font-bold text-zinc-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  );
}

function VendorLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px]">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-800">{value || "—"}</span>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${toneMap[tone] || toneMap.blue}`}>
      {label}
    </span>
  );
}

function MetaCard({ label, value }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2">
      <p className="text-zinc-400">{label}</p>
      <p className="font-semibold text-zinc-700">{value}</p>
    </div>
  );
}
