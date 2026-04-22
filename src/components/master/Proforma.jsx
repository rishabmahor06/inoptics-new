import React, { useEffect, useState } from 'react';
import { MdAdd, MdBusiness, MdMiscellaneousServices, MdPreview } from 'react-icons/md';
import { useProformaStore } from '../../store/master/useProformaStore';
import AddressCard    from './proforma/AddressCard';
import AddressModal   from './proforma/AddressModal';
import ServiceModal   from './proforma/ServiceModal';
import ServiceTable   from './proforma/ServiceTable';
import InvoicePreview from './proforma/InvoicePreview';

export default function Proforma() {
  const {
    addresses, services, loading,
    fetchAddresses, fetchServices,
    saveAddress, deleteAddress, setActiveAddress,
    addService, updateService, deleteService,
  } = useProformaStore();

  const [addrModal, setAddrModal]         = useState(null);
  const [svcModal, setSvcModal]           = useState(null);
  const [previewOpen, setPreviewOpen]     = useState(false);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => { fetchAddresses(); fetchServices(); }, []);

  const activeAddress = addresses.find(a => a.is_active == 1);

  const handleSaveAddress = (data) => saveAddress(data);

  const handleDeleteAddress = (label) => {
    if (window.confirm('Delete this address?')) deleteAddress(label);
  };

  const handleSaveService = (data) => data.oldName ? updateService(data) : addService(data);

  const handleDeleteService = (name) => {
    if (window.confirm('Delete this service?')) deleteService(name);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Proforma Invoice Configuration</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Manage company addresses, invoice services, and preview the template</p>
        </div>
        <button onClick={() => setPreviewOpen(p => !p)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold rounded-lg border transition-colors shadow-sm
            ${previewOpen
              ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
              : 'text-zinc-700 bg-white border-zinc-200 hover:bg-zinc-50'}`}>
          <MdPreview size={15} />
          {previewOpen ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className={`grid gap-5 ${previewOpen ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>

        {/* ── Left Config Panel ── */}
        <div className="space-y-5 min-w-0">

          {/* Company Addresses */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg"><MdBusiness size={15} className="text-blue-600" /></div>
                <div>
                  <p className="text-[13px] font-bold text-zinc-800">Company Addresses</p>
                  <p className="text-[11px] text-zinc-400">Select which address prints on invoices</p>
                </div>
              </div>
              <button onClick={() => setAddrModal({})}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <MdAdd size={14} /> Add Address
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map(n => <div key={n} className="h-36 bg-zinc-100 rounded-xl animate-pulse" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl">
                <p className="text-sm text-zinc-400">No addresses yet</p>
                <button onClick={() => setAddrModal({})}
                  className="mt-2 text-[12px] font-semibold text-blue-600 hover:underline">
                  + Add your first address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr.id ?? addr.label}
                    addr={addr}
                    onEdit={a => setAddrModal(a)}
                    onDelete={handleDeleteAddress}
                    onSetActive={setActiveAddress}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Select Service + Service List */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-50 rounded-lg"><MdMiscellaneousServices size={15} className="text-indigo-600" /></div>
              <div>
                <p className="text-[13px] font-bold text-zinc-800">Services</p>
                <p className="text-[11px] text-zinc-400">Configure line items for proforma invoices</p>
              </div>
            </div>

            {/* Service selector — always visible */}
            <div className="mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                Select Service for Preview
              </label>
              <select
                value={selectedService}
                onChange={e => {
                  setSelectedService(e.target.value);
                  if (e.target.value) setPreviewOpen(true);
                }}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select a service —</option>
                {services.map(svc => (
                  <option key={svc.name} value={svc.name}>{svc.name}</option>
                ))}
                <option value="__all__">Exhibition Services - All</option>
              </select>
            </div>

            <ServiceTable
              services={services}
              onEdit={svc => setSvcModal(svc)}
              onDelete={handleDeleteService}
              onAdd={() => setSvcModal({})}
            />
          </div>

          {/* Number Format Info */}
          {/* <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-3">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Invoice Number Format</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Stall Proforma', format: 'INOPD-2026 | [CODE] | [SERIAL] | [YEAR RANGE]' },
                { label: 'Power Proforma', format: 'INOPD-2026 | [CODE] | [SERIAL] | [YEAR RANGE]' },
              ].map(({ label, format }) => (
                <div key={label} className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{label}</p>
                  <code className="text-[11px] font-mono text-zinc-700 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 block leading-relaxed">{format}</code>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <p className="text-[11px] font-bold text-amber-700 mb-0.5">Note</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                Invoice numbers are auto-generated at creation. Configure the exhibitor badge series under <strong>Exhibitor Series Edit</strong>.
              </p>
            </div>
          </div> */}
        </div>

        {/* ── Right: Invoice Preview ── */}
        {previewOpen && (
          <div className="min-w-0 overflow-x-auto">
            <InvoicePreview
              activeAddress={activeAddress}
              services={services}
              selectedService={selectedService}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {addrModal !== null && (
        <AddressModal
          editing={addrModal}
          onClose={() => setAddrModal(null)}
          onSave={handleSaveAddress}
        />
      )}
      {svcModal !== null && (
        <ServiceModal
          editing={svcModal}
          onClose={() => setSvcModal(null)}
          onSave={handleSaveService}
        />
      )}
    </div>
  );
}
