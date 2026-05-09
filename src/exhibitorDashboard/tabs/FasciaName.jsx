import React, { useEffect, useMemo, useState } from "react";
import TabShell from "../TabShell";
import {
  MdLabel,
  MdBusiness,
  MdLocationCity,
  MdStorefront,
  MdCheckCircle,
  MdLock,
} from "react-icons/md";
import { useFasciaStore } from "../store/useFasciaStore";
import { getExhibitor } from "../api/base";

export default function FasciaName() {
  const { existingData, stallList, loading, saving, fetchAll, submit } =
    useFasciaStore();
  const [faciaName, setFaciaName] = useState("");
  const exhibitor = getExhibitor();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stallDisplay = useMemo(
    () =>
      Array.isArray(stallList)
        ? stallList.map((s) => s.stall_number).filter(Boolean).join(", ")
        : "",
    [stallList]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await submit(faciaName);
    if (ok) setFaciaName("");
  };

  return (
    <TabShell
      title="Fascia Name"
      Icon={MdLabel}
      subtitle="Name displayed on your stall fascia"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card title="Submit Fascia Name" Icon={MdLabel}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Company Name"
                Icon={MdBusiness}
                value={exhibitor?.company_name || ""}
                disabled
              />
              <Field
                label="Stall No"
                Icon={MdStorefront}
                value={stallDisplay}
                disabled
              />
              <Field
                label="City"
                Icon={MdLocationCity}
                value={exhibitor?.city || ""}
                disabled
              />
              <div>
                <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
                  <MdLabel size={13} />
                  Fascia Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={faciaName}
                  onChange={(e) => setFaciaName(e.target.value.toUpperCase())}
                  placeholder="ENTER FASCIA NAME"
                  required
                  className="w-full px-3 py-2.5 text-[14px] font-semibold tracking-wide uppercase border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-[11px] text-zinc-400">
                  Will be displayed in uppercase on your stall fascia
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60 transition-colors"
                >
                  {saving ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Existing fascia preview */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card title="Fascia Details" Icon={MdCheckCircle}>
              <Skel />
            </Card>
          ) : existingData ? (
            <FasciaPreviewCard data={existingData} />
          ) : (
            <Card title="Fascia Details" Icon={MdCheckCircle}>
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-2 text-zinc-300">
                  <MdLabel size={26} />
                </div>
                <p className="text-[13px] text-zinc-400">
                  No fascia submitted yet
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TabShell>
  );
}

function FasciaPreviewCard({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MdCheckCircle size={15} />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#02062c]">Fascia Details</h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <MdLock size={11} /> Saved
        </span>
      </div>

      {/* Fascia preview block — looks like the actual signage */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl px-5 py-8 text-center shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200 mb-2">
            Stall Fascia Preview
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-wide text-white wrap-break-word leading-tight">
            {data.facia_company_name}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <Row Icon={MdBusiness} label="Company" value={data.exhibitor_company_name} />
          <Row Icon={MdStorefront} label="Stall" value={data.stall_no} />
          <Row Icon={MdLocationCity} label="City" value={data.city} />
        </div>
      </div>
    </div>
  );
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">
          {label}
        </p>
        <p className="text-[13px] text-zinc-800 font-medium wrap-break-word">
          {value || <span className="text-zinc-300">—</span>}
        </p>
      </div>
    </div>
  );
}

function Card({ title, Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon size={15} />
          </div>
        )}
        <h3 className="text-[13.5px] font-bold text-[#02062c]">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Field({ label, Icon, value, disabled }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
        {Icon && <Icon size={13} />}
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        disabled={disabled}
        readOnly={disabled}
        className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600 cursor-not-allowed focus:outline-none"
      />
    </div>
  );
}

function Skel() {
  return (
    <div className="space-y-3">
      <div className="h-24 bg-zinc-100 rounded-xl animate-pulse" />
      <div className="h-3 w-3/4 bg-zinc-100 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-zinc-100 rounded animate-pulse" />
    </div>
  );
}
