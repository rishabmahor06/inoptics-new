import React from 'react';
import { useNavStore } from '../../store/useNavStore';

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 min-h-9.5">
        {value || <span className="text-zinc-300">—</span>}
      </div>
    </div>
  );
}

export default function BasicDetails() {
  const { editingExhibitor: ex } = useNavStore();
  if (!ex) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Field label="Company Name"   value={ex.company_name} />
      <Field label="Contact Person" value={ex.contact_person} />
      <Field label="Email"          value={ex.email} />
      <Field label="Mobile"         value={ex.mobile} />
      <Field label="Phone"          value={ex.phone} />
      <Field label="Address"        value={ex.address} />
      <Field label="City"           value={ex.city} />
      <Field label="State"          value={ex.state} />
      <Field label="Country"        value={ex.country} />
      <Field label="PIN Code"       value={ex.pincode} />
      <Field label="GST Number"     value={ex.gst_number} />
      <Field label="PAN Number"     value={ex.pan_number} />
      <Field label="Website"        value={ex.website} />
      <Field label="Exhibitor Code" value={ex.exhibitor_code} />
    </div>
  );
}
