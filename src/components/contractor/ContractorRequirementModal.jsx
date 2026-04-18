import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = 'https://inoptics.in/api';

const emptyForm = {
  company_name: '',
  name: '',
  email: '',
  address: '',
  country: '',
  city: '',
  pincode: '',
  phone_numbers: '',
  mobile_numbers: '',
};

export default function ContractorRequirementModal({ mode, editItem, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editItem) {
      setForm({
        company_name:   editItem.company_name   || '',
        name:           editItem.name           || '',
        email:          editItem.email          || '',
        address:        editItem.address        || '',
        country:        editItem.state || editItem.country || '',
        city:           editItem.city           || '',
        pincode:        editItem.pincode        || '',
        phone_numbers:  editItem.phone_numbers  || '',
        mobile_numbers: editItem.mobile_numbers || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [mode, editItem]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.company_name.trim() || !form.name.trim()) {
      toast.error('Company Name and Name are required');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'add') {
        const res = await fetch(`${API}/add_contractor_requirement.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        toast.success(data.message || 'Added successfully');
      } else {
        const res = await fetch(`${API}/update_contractor_requirement.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, ...form }),
        });
        const data = await res.json();
        toast.success(data.message || 'Updated successfully');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(mode === 'add' ? 'Error adding contractor' : 'Error updating contractor');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: 'Company Name', key: 'company_name', required: true },
    { label: 'Name', key: 'name', required: true },
    { label: 'Email (comma-separated)', key: 'email' },
    { label: 'Address', key: 'address' },
    { label: 'State', key: 'country' },
    { label: 'City', key: 'city' },
    { label: 'Pincode', key: 'pincode' },
    { label: 'Phone Number (comma-separated)', key: 'phone_numbers' },
    { label: 'Mobile Number (comma-separated)', key: 'mobile_numbers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-800">
              {mode === 'add' ? 'Add Contractor Requirement' : 'Edit Contractor Requirement'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'add' ? 'Fill in the details to add a new contractor' : `Editing: ${editItem?.company_name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ label, key, required }) => (
              <div key={key} className={key === 'address' || key === 'email' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  {label}
                  {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-zinc-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? 'Saving...' : mode === 'add' ? 'Add Contractor' : 'Update Contractor'}
          </button>
        </div>

      </div>
    </div>
  );
}
