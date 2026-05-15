import React from "react";
import { FaEdit, FaTrash, FaPaperPlane, FaCheck, FaTimes } from "react-icons/fa";

const PaymentRemarkSection = ({
  remarks = [],
  remarkText,
  setRemarkText,
  editingRemarkId,
  setEditingRemarkId,
  onSaveRemark,
  onUpdateRemark,
  onDeleteRemark,
  onEditRemark,
  onSendEmail,
}) => {
  const isEditing = Boolean(editingRemarkId);

  const handleCancelEdit = () => {
    setEditingRemarkId(null);
    setRemarkText("");
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Payment Remark
            </h3>
            <p className="text-sm text-slate-500">
              Add, update, and manage payment remarks from here.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            className="min-h-[110px] w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="Enter payment remark here..."
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            rows={4}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {onSendEmail && (
              <button
                type="button"
                onClick={onSendEmail}
                disabled={!remarks.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPaperPlane />
                Send Email
              </button>
            )}

            {!isEditing ? (
              <button
                type="button"
                onClick={onSaveRemark}
                disabled={!remarkText.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaCheck />
                Save Remark
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onUpdateRemark}
                  disabled={!remarkText.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaCheck />
                  Update Remark
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  <FaTimes />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {remarks.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-slate-900">
                Previous Remarks
              </h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {remarks.length} record(s)
              </span>
            </div>

            <div className="space-y-3">
              {remarks.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm leading-6 text-slate-700">
                        {item.remark}
                      </p>

                      {(item.created_at || item.date) && (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.created_at || item.date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onEditRemark(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRemark(item.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 transition hover:bg-rose-100"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRemarkSection;