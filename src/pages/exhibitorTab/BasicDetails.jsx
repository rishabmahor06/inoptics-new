import React, { useEffect } from "react";
import {
  MdSave, MdEmail, MdSwapHoriz, MdBusinessCenter, MdLockReset,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useExhibitorBasicStore } from "../../store/exhibitor/useExhibitorBasicStore";

export default function BasicDetails() {
  const { editingExhibitor: ex } = useNavStore();
  const {
    formData, errors, saving, isSendingMail,
    loadFrom, setField, handleSubmit, handleSendMail,
  } = useExhibitorBasicStore();

  /* hydrate form when an exhibitor is selected (or cleared) */
  useEffect(() => {
    loadFrom(ex);
  }, [ex, loadFrom]);

  if (!ex) return null;

  const isEdit = !!formData.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* ============= MAIN FORM ============= */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="lg:col-span-2 space-y-4"
      >
        {/* Header row */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center shrink-0">
            <MdBusinessCenter size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Basic Details</h3>
            <p className="text-[12px] text-zinc-400">Edit exhibitor profile information</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          {/* Company Name */}
          <FormField
            label="Company Name" required error={errors.company_name}
            value={formData.company_name}
            onChange={(v) => setField("company_name", v)}
          />

          {/* Name */}
          <FormField
            label="Name" required error={errors.name}
            value={formData.name}
            onChange={(v) => setField("name", v)}
          />

          {/* Address */}
          <FormField
            label="Address" required error={errors.address}
            value={formData.address}
            onChange={(v) => setField("address", v)}
          />

          {/* City / State / Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField
              label="City" required error={errors.city}
              value={formData.city}
              onChange={(v) => setField("city", v)}
            />
            <FormField
              label="State" required error={errors.state}
              value={formData.state}
              onChange={(v) => setField("state", v)}
            />
            <FormField
              label="Pincode" required error={errors.pin}
              value={formData.pin}
              onChange={(v) => setField("pin", v)}
            />
          </div>

          {/* Mobile / Telephone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Mobile" required error={errors.mobile}
              placeholder="9876543210, 8765432109"
              value={formData.mobile}
              onChange={(v) => setField("mobile", v)}
            />
            <FormField
              label="Telephone"
              value={formData.telephone}
              onChange={(v) => setField("telephone", v)}
            />
          </div>

          {/* Email / Secondary Emails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Email" required error={errors.email}
              value={formData.email}
              onChange={(v) => setField("email", v)}
            />
            <FormField
              label="Secondary Emails"
              placeholder="email1@example.com, email2@example.com"
              value={formData.secondary_emails}
              onChange={(v) => setField("secondary_emails", v)}
            />
          </div>

          {/* GST + buttons */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2 border-t border-zinc-100">
            <div className="flex-1">
              <FormField
                label="GST"
                value={formData.gst}
                onChange={(v) => setField("gst", v)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              {isEdit && (
                <button
                  type="button"
                  disabled={isSendingMail}
                  onClick={() => handleSendMail("Exhibitor Login & Password")}
                  className="px-4 h-10 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <MdEmail size={16} />
                  {isSendingMail ? "Sending..." : "Send Mail"}
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <MdSave size={16} />
                {saving ? "Saving..." : isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </div>

          {/* Password readout (edit mode only) */}
          {isEdit && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded">
              <MdLockReset size={16} className="text-zinc-500 shrink-0" />
              <p className="text-[13px] text-zinc-700">
                Password:{" "}
                <span className="font-mono font-semibold text-zinc-900">
                  {formData.password || "N/A"}
                </span>
              </p>
            </div>
          )}
        </div>

        {isSendingMail && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl px-6 py-5 flex flex-col items-center gap-3 shadow-xl">
              <span className="block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-zinc-700">Sending mail, please wait...</p>
            </div>
          </div>
        )}
      </form>

      {/* ============= UPDATE COMPANY NAME PANEL ============= */}
      <UpdateCompanyName />
    </div>
  );
}

/* ================= reusable field ================= */

function FormField({ label, value, onChange, required, error, placeholder = "", type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-[14px] border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? "border-red-300 bg-red-50" : "border-zinc-200"
        }`}
      />
      {error && <p className="text-[11px] text-red-500">This field is required</p>}
    </div>
  );
}

/* ================= Update Company Name (sidebar) ================= */

function UpdateCompanyName() {
  const {
    oldCompany, newCompany, updatingCompany,
    setOldCompany, setNewCompany, handleUpdateCompanyName,
  } = useExhibitorBasicStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center shrink-0">
          <MdSwapHoriz size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Update Company Name</h3>
          <p className="text-[12px] text-zinc-400">Rename across all related records</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
        <FormField
          label="Old Company Name"
          value={oldCompany}
          onChange={setOldCompany}
          placeholder="Current name"
        />
        <FormField
          label="New Company Name"
          value={newCompany}
          onChange={setNewCompany}
          placeholder="Enter new name"
        />

        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[12px] text-amber-800 leading-relaxed">
          This will update the company name everywhere it appears (badges, payments, forms, power records, etc). Proceed with caution.
        </div>

        <button
          type="button"
          onClick={handleUpdateCompanyName}
          disabled={updatingCompany || !oldCompany || !newCompany}
          className="w-full px-4 h-10 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
        >
          <MdSwapHoriz size={16} />
          {updatingCompany ? "Updating..." : "Update Company"}
        </button>
      </div>
    </div>
  );
}
