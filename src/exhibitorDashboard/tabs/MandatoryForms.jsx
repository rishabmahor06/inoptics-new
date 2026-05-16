import React, { useEffect, useRef, useState } from "react";
import {
  MdAssignment, MdDownload, MdUpload, MdSend, MdLockOpen, MdLock,
  MdCheckCircle, MdCheck, MdChevronLeft, MdChevronRight, MdClose, MdHourglassTop,
  MdList, MdPictureAsPdf, MdCloudUpload, MdInfoOutline, MdMail,
  MdEngineering, MdBusiness, MdHandshake, MdConfirmationNumber,
} from "react-icons/md";
import { useContractorBadgeStore } from "../store/useContractorBadgeStore";
import toast from "react-hot-toast";
import { useMandatoryFormsStore } from "../store/useMandatoryFormsStore";
import { sendFormToContractor } from "../api/mandatoryFormsApi";
import { getExhibitor } from "../api/base";

const STEPS = [
  {
    n: 1,
    title: "Appointed Contractor Form",
    sub: "To be filled by Exhibitor",
    instructions: [
      "Download the mandatory Exhibitor Form, duly sign and stamp it, and upload to proceed.",
      "By uploading, you formally confirm your intent to appoint the selected contractor.",
      "Any later change requires submitting an Unlock Request.",
    ],
    downloadKey: "appointed contractor",
    downloadName: "APPOINTED_CONTRACTOR_BADGES.pdf",
    showSendToContractor: false,
  },
  {
    n: 2,
    title: "Contractor Undertaking Form",
    sub: "To be filled by Contractor",
    instructions: [
      "Send the form directly to the contractor or download and share manually.",
      "Contractor must fill, sign, and stamp the form and return it to you.",
      "Upload the signed and stamped form to complete this step.",
    ],
    downloadKey: "contractor undertaking",
    downloadName: "CONTRACTOR_UNDERTAKING.pdf",
    showSendToContractor: true,
  },
  {
    n: 3,
    title: "Contractor Badges",
    sub: "Request badges for your appointed contractor",
    custom: "contractor-badges",
  },
  {
    n: 4,
    title: "Booth Dimensions & Construction Guidelines",
    sub: "Raw Space Design",
    instructions: [
      "Construct booth strictly within the allotted area. No extensions permitted.",
      "Max booth height: 3.0m (12 ft). Mezzanine floors are not permitted.",
      "All structures must be pre-fabricated. Carpentry inside the hall is not allowed.",
      "All materials must be fire-retardant. Electrical work by licensed electricians only.",
    ],
    downloadKey: null,
    showSendToContractor: false,
  },
];

const STEP_LABELS = ["Appointed", "Undertaking", "Badges", "Booth Design"];

export default function MandatoryForms() {
  const s = useMandatoryFormsStore();

  useEffect(() => {
    s.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (s.loading) {
    return (
      <div className="bg-white rounded border border-zinc-100 shadow-sm p-10 text-center">
        <p className="text-[14px] text-zinc-500">Loading…</p>
      </div>
    );
  }

  /* ============================================
     Phase A — No contractor selected yet
     ============================================ */
  if (!s.workflowActive) {
    return <SelectionPhase />;
  }

  /* ============================================
     Phase B — Workflow (steps 1..4)
     ============================================ */
  return <WorkflowPhase />;
}

/* ───────────────────────────────────────────────────────────────
   SELECTION PHASE — instructions, email input, contractor list
─────────────────────────────────────────────────────────────── */
function SelectionPhase() {
  const s = useMandatoryFormsStore();
  const [sending, setSending] = useState(false);

  const INSTRUCTIONS = [
    "All contractors must be registered before the deadline.",
    "ID badges must be collected before exhibition day.",
    "Ensure proper documentation is uploaded in the portal.",
    "Contractor undertaking form is mandatory.",
    "Follow the venue safety and conduct guidelines strictly.",
  ];

  const submitRegMail = async () => {
    setSending(true);
    try { await s.sendUnregisteredMail(); }
    finally { setSending(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-7rem)]">
      {/* ─── LEFT COLUMN: Instructions + inline Registration form ─── */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-4 lg:overflow-y-auto lg:pr-1">
        <div className="bg-white rounded border border-zinc-100 shadow-sm p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded border-2 border-amber-300 bg-amber-50 flex items-center justify-center shrink-0">
              <MdInfoOutline size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-zinc-900">
                Contractor Instructions
              </h2>
              <p className="text-[12px] text-amber-700 mt-0.5">
                Choose a contractor and complete the booth design step
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {INSTRUCTIONS.map((line, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded bg-zinc-50 border border-zinc-100"
              >
                <span className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-500 shrink-0">
                  {i + 1}
                </span>
                <span className="text-[12.5px] text-zinc-700">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-zinc-200 bg-white p-4">
          <h3 className="text-[14px] font-bold text-zinc-900">
            Your contractor not listed?
          </h3>
          <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
            Send the contractor registration form directly via email.
          </p>

          <label className="block text-[11.5px] font-semibold text-zinc-700 mt-3 mb-1">
            Contractor Email
          </label>
          <input
            type="email"
            value={s.contractorEmail}
            onChange={(e) => s.setContractorEmail(e.target.value)}
            placeholder="contractor@example.com"
            className="w-full px-3 h-10 text-[13px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={submitRegMail}
            disabled={sending || !s.contractorEmail.trim()}
            className="mt-3 w-full h-10 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded flex items-center justify-center gap-2 transition-colors"
          >
            <MdSend size={14} /> {sending ? "Sending…" : "Send Registration Form"}
          </button>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Contractor list ─── */}
      <div className="lg:col-span-8 xl:col-span-9 lg:h-full lg:min-h-0">
        <ContractorTable />
      </div>

      <ConfirmPopup />
    </div>
  );
}

function RegistrationModal({ onClose }) {
  const s = useMandatoryFormsStore();
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await s.sendUnregisteredMail();
      // close only if email was cleared (success)
      if (!s.contractorEmail) onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900">
              Contractor Registration Form
            </h3>
            <p className="text-[12px] text-zinc-500 mt-0.5">
              We'll email the registration form to your contractor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded hover:bg-zinc-100 flex items-center justify-center"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <label className="block text-[12px] font-semibold text-zinc-700">
            Contractor Email
          </label>
          <input
            type="email"
            value={s.contractorEmail}
            onChange={(e) => s.setContractorEmail(e.target.value)}
            placeholder="contractor@example.com"
            className="w-full px-3 h-11 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11.5px] text-zinc-500">
            Once they complete and return the form, you can select them from
            the Approved Contractor list below.
          </p>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={sending || !s.contractorEmail.trim()}
            className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdSend size={14} /> {sending ? "Sending…" : "Send Form"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractorTable() {
  const s = useMandatoryFormsStore();
  const [search, setSearch] = useState("");
  const list = (s.contractors || []).filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.company_name?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded border border-zinc-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[70vh] lg:max-h-none">
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <h3 className="text-[14px] font-bold text-zinc-800">Approved Contractor List</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company / name / city"
          className="px-3 h-9 text-[13px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-auto flex-1 min-h-0">
        <table className="w-full">
          <thead className="bg-zinc-50 sticky top-0 z-10">
            <tr>
              {["#", "Company", "Name", "City", "Phone", "Email", "Action"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="px-3 py-3 text-[13px] text-zinc-400">{i + 1}</td>
                <td className="px-3 py-3 text-[13px] font-semibold text-zinc-800">{c.company_name}</td>
                <td className="px-3 py-3 text-[13px] text-zinc-700">{c.name}</td>
                <td className="px-3 py-3 text-[13px] text-zinc-700">{c.city}</td>
                <td className="px-3 py-3 text-[13px] text-zinc-700">{c.mobile_numbers}{c.phone_numbers ? `, ${c.phone_numbers}` : ""}</td>
                <td className="px-3 py-3 text-[13px] text-zinc-700 truncate max-w-48">{c.email}</td>
                <td className="px-3 py-3">
                  {s.selectedContractorId === c.id ? (
                    <button
                      onClick={() => s.unselect()}
                      className="px-3 h-8 text-[12px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded"
                    >
                      Unselect
                    </button>
                  ) : (
                    <button
                      disabled={!!s.selectedContractorId}
                      onClick={() => s.openConfirmPopup(c)}
                      className="px-3 h-8 text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                    >
                      Select
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="7" className="py-10 text-center text-[13px] text-zinc-400">No contractors found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-zinc-100 overflow-y-auto flex-1 min-h-0">
        {list.map((c, i) => (
          <div key={c.id} className="p-4 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                <p className="font-semibold text-[14px] text-zinc-800 truncate">{c.company_name}</p>
                <p className="text-[12px] text-zinc-500">{c.name} · {c.city}</p>
              </div>
              {s.selectedContractorId === c.id ? (
                <button onClick={() => s.unselect()} className="px-2.5 h-8 text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded shrink-0">Unselect</button>
              ) : (
                <button disabled={!!s.selectedContractorId} onClick={() => s.openConfirmPopup(c)} className="px-2.5 h-8 text-[11px] font-semibold bg-blue-600 text-white rounded disabled:bg-zinc-200 disabled:text-zinc-400 shrink-0">Select</button>
              )}
            </div>
            <p className="text-[12px] text-zinc-500 truncate">{c.email}</p>
            <p className="text-[12px] text-zinc-500">{c.mobile_numbers}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmPopup() {
  const s = useMandatoryFormsStore();
  if (!s.showConfirmPopup) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md p-6">
        <h3 className="text-[16px] font-bold text-zinc-900 mb-3">Confirm Contractor Selection</h3>
        <p className="text-[13px] text-zinc-600 mb-3">
          Proceed with <strong>{s.pendingContractor?.company_name}</strong> as your booth contractor?
        </p>
        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-5">
          Once confirmed, the selection will be locked. Changes will require submitting a formal unlock request.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => s.cancelSelect()} className="px-4 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded">Cancel</button>
          <button onClick={() => s.confirmSelect()} className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   WORKFLOW PHASE — left (contractor + checklist), right (steps)
─────────────────────────────────────────────────────────────── */
function WorkflowPhase() {
  const s = useMandatoryFormsStore();
  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="bg-white rounded border border-zinc-100 shadow-sm p-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => s.requestUnlock()}
          className="px-3 h-9 text-[12px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded flex items-center gap-1.5"
        >
          <MdLockOpen size={14} /> Request Contractor Change
        </button>
        <button
          onClick={() => s.setShowListOverlay(true)}
          className="px-3 h-9 text-[12px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5"
        >
          <MdList size={14} /> Contractor List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-4">
          <SelectedContractorCard />
          <ChecklistCard />
        </div>
        <div className="lg:col-span-8">
          <div className="bg-white rounded border border-zinc-100 shadow-sm overflow-hidden">
            <StepChevronNav />
            <StepPanelBody />
          </div>
        </div>
      </div>

      {s.showListOverlay && <ListOverlay />}
      <UploadModal />
    </div>
  );
}

function SelectedContractorCard() {
  const s = useMandatoryFormsStore();
  const c = s.selectedContractor;
  if (!c) return null;
  const initials = (c.company_name || "")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="bg-white rounded border border-zinc-100 shadow-sm p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Selected Contractor</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[14px]">{initials || "—"}</div>
        <div className="min-w-0">
          <p className="font-bold text-zinc-900 text-[14px] truncate">{c.company_name}</p>
          <p className="text-[12px] text-zinc-500">Booth Design &amp; Construction</p>
        </div>
      </div>
      <dl className="space-y-2 text-[12.5px]">
        <Row label="Contact" value={c.name} />
        <Row label="City" value={c.city} />
        <Row label="Phone" value={`${c.mobile_numbers || ""}${c.phone_numbers ? `, ${c.phone_numbers}` : ""}`} />
        <Row label="Email" value={c.email} />
      </dl>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-zinc-400 shrink-0">{label}</dt>
      <dd className="font-semibold text-zinc-800 text-right truncate">{value || "—"}</dd>
    </div>
  );
}

function ChecklistCard() {
  const s = useMandatoryFormsStore();
  return (
    <div className="bg-white rounded border border-zinc-100 shadow-sm p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Form Checklist</p>
      <ul className="space-y-2">
        {STEPS.map((step) => {
          const done = !!s.stepSubmitted[step.n] || s.currentStep > step.n;
          const active = s.viewStep === step.n;
          return (
            <li key={step.n}
              className={`flex items-center gap-3 p-2.5 rounded border ${
                done ? "bg-emerald-50 border-emerald-200"
                     : active ? "bg-blue-50 border-blue-200"
                              : "bg-zinc-50 border-zinc-100"
              }`}>
              <div className={`w-7 h-7 rounded flex items-center justify-center text-[12px] font-bold shrink-0 ${
                done ? "bg-emerald-600 text-white"
                     : active ? "bg-blue-600 text-white"
                              : "bg-zinc-300 text-white"
              }`}>
                {done ? "✓" : step.n}
              </div>
              <p className={`text-[12.5px] font-semibold ${
                done ? "text-emerald-700"
                     : active ? "text-blue-700"
                              : "text-zinc-600"
              }`}>
                {step.title}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StepChevronNav() {
  const s = useMandatoryFormsStore();

  return (
    <div className="border-b border-zinc-100 bg-zinc-50/60 px-2 py-2 sm:px-3 sm:py-2.5">
      <div className="flex items-stretch gap-1 sm:gap-1.5 overflow-x-auto">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const isActive = s.viewStep === n;
          const isDone = !!s.stepSubmitted[n] || s.currentStep > n;
          const isLast = n === STEP_LABELS.length;

          const base =
            "relative flex-1 min-w-[100px] sm:min-w-[120px] h-9 sm:h-10 flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider transition-all cursor-pointer";

          const colors = isActive
            ? "bg-blue-600 text-white shadow-md"
            : isDone
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300";

          const clipPath = isLast
            ? "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)"
            : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)";
          const firstClip =
            "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)";

          return (
            <button
              key={n}
              type="button"
              onClick={() => s.setViewStep(n)}
              className={`${base} ${colors} rounded`}
              style={{
                clipPath: n === 1 ? firstClip : clipPath,
                WebkitClipPath: n === 1 ? firstClip : clipPath,
              }}
              title={`Step ${n}: ${label}`}
            >
              <span
                className={`w-4 h-4 rounded inline-flex items-center justify-center text-[10px] ${
                  isActive
                    ? "bg-white/25 text-white"
                    : isDone
                      ? "bg-blue-600 text-white"
                      : "bg-white text-zinc-500"
                }`}
              >
                {isDone ? <MdCheck size={12} /> : n}
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPanelBody() {
  const s = useMandatoryFormsStore();
  const step = STEPS.find((x) => x.n === s.viewStep);
  if (!step) return null;

  if (step.custom === "contractor-badges") {
    return <ContractorBadgesStep />;
  }

  const isSubmitted = !!s.stepSubmitted[step.n];
  const unlockStatusData = s.unlockStatus[step.n] || s.unlockStatus[String(step.n)];
  const status = unlockStatusData?.status;

  return (
    <div>
      {/* header */}
      <div className={`px-5 py-4 border-b border-zinc-100 flex items-start gap-3 ${
        isSubmitted ? "bg-zinc-50" : "bg-blue-50/40"
      }`}>
        <div className={`w-9 h-9 rounded flex items-center justify-center text-white font-bold text-[13px] shrink-0 ${
          isSubmitted ? "bg-emerald-600" : "bg-blue-600"
        }`}>
          {isSubmitted ? "✓" : step.n}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">{step.title}</h3>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            {isSubmitted ? "Submitted · Locked" : step.sub}
          </p>
        </div>
        {isSubmitted && (
          <div>
            {status === "pending" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                <MdHourglassTop size={12} /> Pending
              </span>
            )}
            {(status === "locked" || status === "rejected" || !status) && (
              <button
                onClick={() => s.requestStepUnlock(step.n)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded flex items-center gap-1"
              >
                <MdLockOpen size={12} /> {status === "rejected" ? "Request Again" : "Request Unlock"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* body */}
      <div className="px-5 py-5 space-y-4">
        {step.instructions.length > 0 && (
          <ul className="space-y-2 text-[13px] text-zinc-600 leading-relaxed">
            {step.instructions.map((line, i) => (
              <li key={i} className="flex gap-2"><span className="text-blue-500 shrink-0">›</span>{line}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {step.showSendToContractor && (
            <button
              onClick={async () => {
                const ex = getExhibitor();
                const c = s.selectedContractor;
                if (!c?.email) { toast.error("No contractor selected"); return; }
                try {
                  await sendFormToContractor({
                    contractor_email: c.email,
                    contractor_name: c.name,
                    exhibitor_company: ex.company_name,
                  });
                  toast.success("Form sent to contractor");
                } catch { toast.error("Failed to send form"); }
              }}
              disabled={isSubmitted}
              className="px-3 h-10 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSend size={14} /> Send to Contractor
            </button>
          )}

          {step.downloadKey && (
            <button
              onClick={() => downloadStepForm(s.coreForms, step.downloadKey, step.downloadName)}
              disabled={isSubmitted}
              className="px-3 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdDownload size={14} /> Download
            </button>
          )}

          <UploadButton step={step.n} disabled={isSubmitted} />

          {s.uploadedFiles[`step${step.n}`] && (
            <span className="px-3 h-10 inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
              <MdCheckCircle size={14} /> Uploaded
            </span>
          )}
        </div>

        {!isSubmitted && (
          <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Upload to lock this step and proceed to the next.
          </p>
        )}
      </div>
    </div>
  );
}

function UploadButton({ step, disabled }) {
  const s = useMandatoryFormsStore();
  const inputRef = useRef(null);
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="px-3 h-10 text-[13px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MdUpload size={14} /> Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          s.openUpload(step, file);
          e.target.value = "";
        }}
      />
    </>
  );
}

function downloadStepForm(coreForms, key, fallbackName) {
  const f = (coreForms || []).find((x) =>
    (x.category || "").toLowerCase().includes(key)
  );
  if (!f?.filename) {
    toast.error("Form not available");
    return;
  }
  const url = `https://inoptics.in/api/uploads/${encodeURIComponent(f.filename)}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName || f.filename;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ───────────────────────────────────────────────────────────────
   UPLOAD MODAL — preview + drag/drop replace + submit
─────────────────────────────────────────────────────────────── */
function UploadModal() {
  const s = useMandatoryFormsStore();
  const m = s.uploadModal;
  const [dragOver, setDragOver] = useState(false);

  if (!m) return null;

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) s.openUpload(m.step, file);
  };

  const isPdf = m.file?.type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-zinc-900">Preview &amp; Upload — Step {m.step}</h3>
          <button onClick={() => s.closeUpload()} className="w-9 h-9 rounded hover:bg-zinc-100 flex items-center justify-center">
            <MdClose size={20} />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex-1 overflow-auto p-4 bg-zinc-50 ${dragOver ? "bg-blue-50" : ""}`}
        >
          {isPdf ? (
            <iframe src={m.previewUrl} title="PDF preview" className="w-full h-[60vh] rounded bg-white border border-zinc-200" />
          ) : m.file?.type?.startsWith("image/") ? (
            <img src={m.previewUrl} alt="preview" className="max-w-full max-h-[60vh] mx-auto rounded bg-white border border-zinc-200" />
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-2 text-zinc-400">
              <MdPictureAsPdf size={48} />
              <p className="text-[13px]">{m.file?.name}</p>
            </div>
          )}

          <div className="mt-3 text-center text-[12px] text-zinc-500 flex items-center justify-center gap-2">
            <MdCloudUpload size={14} /> Drag &amp; drop a new file here to replace
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-3">
          <p className="text-[12px] text-zinc-500 truncate">
            <strong className="text-zinc-700">{m.file?.name}</strong>
            {m.file?.size ? ` · ${(m.file.size / 1024).toFixed(0)} KB` : ""}
          </p>
          <div className="flex gap-2">
            <button onClick={() => s.closeUpload()} className="px-4 h-10 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded">Cancel</button>
            <button
              onClick={() => s.submitUpload()}
              disabled={s.saving}
              className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-60"
            >
              {s.saving ? "Uploading…" : <><MdUpload size={14} /> Submit &amp; Lock</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   CONTRACTOR LIST OVERLAY — view-only when workflow is active
─────────────────────────────────────────────────────────────── */
function ListOverlay() {
  const s = useMandatoryFormsStore();
  return (
    <div onClick={() => s.setShowListOverlay(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-zinc-900">Approved Contractor List</h3>
          <button onClick={() => s.setShowListOverlay(false)} className="w-9 h-9 rounded hover:bg-zinc-100 flex items-center justify-center">
            <MdClose size={20} />
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 sticky top-0">
              <tr>
                {["#", "Company", "Name", "City", "Phone", "Email"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(s.contractors || []).map((c, i) => (
                <tr key={c.id} className="border-b border-zinc-50">
                  <td className="px-3 py-2.5 text-[13px] text-zinc-400">{i + 1}</td>
                  <td className="px-3 py-2.5 text-[13px] font-semibold text-zinc-800">{c.company_name}</td>
                  <td className="px-3 py-2.5 text-[13px] text-zinc-700">{c.name}</td>
                  <td className="px-3 py-2.5 text-[13px] text-zinc-700">{c.city}</td>
                  <td className="px-3 py-2.5 text-[13px] text-zinc-700">{c.mobile_numbers}</td>
                  <td className="px-3 py-2.5 text-[13px] text-zinc-700 truncate max-w-48">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────
   CONTRACTOR BADGES STEP — fully dynamic, styled like other steps
─────────────────────────────────────────────────────────────── */
function ContractorBadgesStep() {
  const s = useMandatoryFormsStore();
  const cb = useContractorBadgeStore();
  const ex = getExhibitor();

  useEffect(() => {
    cb.fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contractor = s.selectedContractor;
  const isLocked = cb.lockStatus === 1;
  const isUnlockReq = cb.lockStatus === 2;
  const inputDisabled = isLocked || isUnlockReq || cb.saving;

  return (
    <div>
      <div className={`px-5 py-4 border-b border-zinc-100 flex items-start gap-3 ${isLocked ? "bg-zinc-50" : "bg-blue-50/40"}`}>
        <div className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-[13px] shrink-0 bg-blue-600">
          {isLocked ? <MdCheck size={16} /> : 3}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Contractor Badges</h3>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            {isLocked ? "Submitted · Locked" : isUnlockReq ? "Unlock requested · Waiting for admin" : "Enter the number of badges required for your contractor"}
          </p>
        </div>
        {isLocked && (
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded inline-flex items-center gap-1">
            <MdLock size={12} /> Locked
          </span>
        )}
        {isUnlockReq && (
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded inline-flex items-center gap-1">
            <MdHourglassTop size={12} /> Pending
          </span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {cb.loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />)}
          </div>
        ) : !contractor ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <MdHandshake size={22} />
            </div>
            <p className="text-[13px] font-bold text-zinc-800">No contractor selected</p>
            <p className="text-[12px] text-zinc-500 mt-1 max-w-sm mx-auto">Go back to Step 1 and select a contractor first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnlyField label="Exhibitor Company" Icon={MdBusiness} value={ex?.company_name || ""} />
            <ReadOnlyField label="Contractor Company" Icon={MdHandshake} value={contractor.company_name || ""} helper={contractor.name ? `Contact: ${contractor.name}` : ""} />
            <div className="sm:col-span-2">
              <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
                <MdConfirmationNumber size={13} /> Badge Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={cb.quantity}
                onChange={(e) => cb.setQuantity(e.target.value)}
                disabled={inputDisabled}
                placeholder="Enter number of badges"
                className={`w-full px-3 h-11 text-[14px] font-semibold border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputDisabled ? "bg-zinc-50 text-zinc-600 border-zinc-200 cursor-not-allowed" : "bg-white border-zinc-200"}`}
              />
            </div>
          </div>
        )}

        {contractor && (
          <div className="flex flex-wrap gap-2 pt-1">
            {cb.lockStatus === 0 && (
              <button
                type="button"
                onClick={async () => {
                  await cb.submit();
                  useMandatoryFormsStore.setState((st) => ({
                    stepSubmitted: { ...st.stepSubmitted, 3: true },
                    currentStep: Math.max(st.currentStep, 4),
                  }));
                  s.setViewStep(4);
                }}
                disabled={cb.saving || !cb.quantity}
                className="px-3 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-60"
              >
                <MdLock size={14} /> {cb.saving ? "Processing…" : "Submit & Lock"}
              </button>
            )}
            {cb.lockStatus === 1 && (
              <button
                type="button"
                onClick={() => cb.requestUnlock()}
                disabled={cb.saving}
                className="px-3 h-10 text-[13px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded flex items-center gap-1.5 disabled:opacity-60"
              >
                <MdLockOpen size={14} /> Request Unlock
              </button>
            )}
            {cb.lockStatus === 2 && (
              <button type="button" disabled className="px-3 h-10 text-[13px] font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200 rounded flex items-center gap-1.5 cursor-not-allowed">
                <MdHourglassTop size={14} /> Waiting for admin approval
              </button>
            )}
          </div>
        )}

        {!isLocked && contractor && (
          <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Submit to lock this step and proceed to Booth Design.
          </p>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, Icon, value, helper }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-zinc-600 mb-1.5 flex items-center gap-1">
        {Icon && <Icon size={13} />}
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        disabled
        readOnly
        className="w-full px-3 h-11 text-[13px] border border-zinc-200 rounded bg-zinc-50 text-zinc-600 cursor-not-allowed focus:outline-none"
      />
      {helper && <p className="text-[11px] text-zinc-400 mt-1">{helper}</p>}
    </div>
  );
}
