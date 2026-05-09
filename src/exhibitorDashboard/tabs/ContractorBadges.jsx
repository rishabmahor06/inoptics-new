import React, { useEffect } from "react";
import TabShell from "../TabShell";
import {
  MdEngineering,
  MdBusiness,
  MdHandshake,
  MdConfirmationNumber,
  MdLock,
  MdLockOpen,
  MdHourglassTop,
  MdCheckCircle,
} from "react-icons/md";
import { useContractorBadgeStore } from "../store/useContractorBadgeStore";
import { getExhibitor } from "../api/base";

export default function ContractorBadges() {
  const {
    contractorCompany,
    contractorName,
    quantity,
    isSubmitted,
    lockStatus,
    loading,
    saving,
    fetchAll,
    setQuantity,
    submit,
    requestUnlock,
  } = useContractorBadgeStore();
  const exhibitor = getExhibitor();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isLocked = lockStatus === 1;
  const isUnlockReq = lockStatus === 2;
  const inputDisabled = isLocked || isUnlockReq || saving;

  return (
    <TabShell
      title="Contractor Badges"
      Icon={MdEngineering}
      subtitle="Request badges for your appointed contractor"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card title="Badge Request" Icon={MdConfirmationNumber} status={lockStatus}>
            {loading ? (
              <Skel />
            ) : !contractorCompany ? (
              <NoContractor />
            ) : (
              <div className="space-y-4">
                <Field
                  label="Exhibitor Company"
                  Icon={MdBusiness}
                  value={exhibitor?.company_name || ""}
                  disabled
                />
                <Field
                  label="Contractor Company"
                  Icon={MdHandshake}
                  value={contractorCompany}
                  disabled
                  helper={
                    contractorName ? `Contact: ${contractorName}` : undefined
                  }
                />
                <div>
                  <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
                    <MdConfirmationNumber size={13} />
                    Badge Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={inputDisabled}
                    placeholder="Enter number of badges"
                    className={`w-full px-3 py-2.5 text-[14px] font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      inputDisabled
                        ? "bg-zinc-50 text-zinc-600 border-zinc-200 cursor-not-allowed"
                        : "bg-white border-zinc-200"
                    }`}
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100 flex justify-end">
                  {lockStatus === 0 && (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={saving || !quantity}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
                    >
                      <MdLock size={14} />
                      {saving
                        ? "Processing..."
                        : isSubmitted
                          ? "Update & Lock"
                          : "Submit & Lock"}
                    </button>
                  )}
                  {lockStatus === 1 && (
                    <button
                      type="button"
                      onClick={requestUnlock}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg disabled:opacity-60"
                    >
                      <MdLockOpen size={14} />
                      Request Unlock
                    </button>
                  )}
                  {lockStatus === 2 && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded-lg cursor-not-allowed"
                    >
                      <MdHourglassTop size={14} />
                      Waiting for admin approval
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Status side panel */}
        <div className="lg:col-span-2 space-y-4">
          <StatusCard lockStatus={lockStatus} isSubmitted={isSubmitted} quantity={quantity} />
          <InfoCard />
        </div>
      </div>
    </TabShell>
  );
}

function StatusCard({ lockStatus, isSubmitted, quantity }) {
  const states = {
    0: {
      Icon: MdLockOpen,
      title: isSubmitted ? "Unlocked" : "Not Submitted",
      tone: "amber",
      desc: isSubmitted
        ? "Make changes, then submit to lock again."
        : "Enter quantity and submit to request badges.",
    },
    1: {
      Icon: MdCheckCircle,
      title: "Submitted & Locked",
      tone: "emerald",
      desc: "Your request has been recorded. Click 'Request Unlock' to edit.",
    },
    2: {
      Icon: MdHourglassTop,
      title: "Unlock Requested",
      tone: "blue",
      desc: "Admin has been notified. You'll be able to edit once approved.",
    },
  };
  const s = states[lockStatus] || states[0];
  const grads = {
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className={`px-4 sm:px-5 py-4 bg-linear-to-br ${grads[s.tone]} text-white relative`}>
        <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/85">
          Status
        </p>
        <div className="flex items-center gap-2 mt-1">
          <s.Icon size={20} />
          <p className="text-[16px] font-bold">{s.title}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        <p className="text-[12.5px] text-zinc-600 leading-relaxed">{s.desc}</p>
        {quantity && (
          <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
              Badge Qty
            </span>
            <span className="text-[18px] font-bold text-[#02062c]">
              {quantity}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
      <p className="text-[11.5px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
        How it works
      </p>
      <ul className="text-[12px] text-zinc-600 space-y-1.5 list-disc pl-4">
        <li>Submit the number of contractor badges you need.</li>
        <li>Once submitted, your request is locked.</li>
        <li>To change quantity, request unlock — admin will be notified.</li>
      </ul>
    </div>
  );
}

function NoContractor() {
  return (
    <div className="py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-500">
        <MdHandshake size={26} />
      </div>
      <p className="text-[14px] font-bold text-[#02062c]">
        No contractor selected
      </p>
      <p className="text-[12.5px] text-zinc-500 mt-1 max-w-sm mx-auto">
        Please complete contractor selection in the Mandatory Forms section
        before requesting badges.
      </p>
    </div>
  );
}

function Card({ title, Icon, status, children }) {
  const badge =
    status === 1
      ? { label: "LOCKED", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      : status === 2
        ? { label: "UNLOCK REQUESTED", cls: "text-blue-700 bg-blue-50 border-blue-200" }
        : null;
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon size={15} />
            </div>
          )}
          <h3 className="text-[13.5px] font-bold text-[#02062c]">{title}</h3>
        </div>
        {badge && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Field({ label, Icon, value, disabled, helper }) {
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
      {helper && (
        <p className="text-[11px] text-zinc-400 mt-1">{helper}</p>
      )}
    </div>
  );
}

function Skel() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2.5 w-24 bg-zinc-100 rounded animate-pulse" />
          <div className="h-9 bg-zinc-100 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
}
