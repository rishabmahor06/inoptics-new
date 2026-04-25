import React from "react";
import {
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdRadioButtonUnchecked,
} from "react-icons/md";

export default function AddressCard({ addr, onEdit, onDelete, onSetActive }) {
  const isActive = addr.is_active == 1;
  const hasData = !!(addr.address || addr.state);

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-4 transition-all h-full
      ${isActive ? "border-blue-400 bg-blue-50/60 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            {addr.label || "Address"}
          </p>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full mt-0.5">
              <MdCheckCircle size={10} /> Active
            </span>
          )}
        </div>
        {!isActive && hasData && (
          <button
            onClick={() => onSetActive(addr.id)}
            title="Set as active"
            className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <MdRadioButtonUnchecked size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      {hasData ? (
        <div className="flex-1 space-y-0.5 text-[14px] text-zinc-900">
          {addr.address && (
            <p className="font-medium text-zinc-900">{addr.address}</p>
          )}

          {addr.city && <p>{addr.city}</p>}

          {addr.state && <p>{addr.state}</p>}

          {addr.pincode && <p>{addr.pincode}</p>}

          {addr.phone && <p className="text-zinc-900">Ph: {addr.phone}</p>}

          {addr.email && (
            <p className="text-zinc-900 truncate">Email: {addr.email}</p>
          )}

          {addr.gst && <p className="text-zinc-900">GST: {addr.gst}</p>}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-900 text-[12px] italic">
            No data — click Edit to fill
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100">
        <button
          onClick={() => onEdit(addr)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <MdEdit size={12} /> Edit
        </button>
        {hasData && (
          <button
            onClick={() => onDelete(addr.label)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <MdDelete size={12} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
