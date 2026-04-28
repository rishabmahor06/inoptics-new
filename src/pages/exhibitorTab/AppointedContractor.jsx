import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MdBusiness,
  MdCheckCircle,
  MdClose,
  MdDescription,
  MdEmail,
  MdEngineering,
  MdInfoOutline,
  MdLocationOn,
  MdOpenInNew,
  MdPerson,
  MdPhone,
  MdSearch,
  MdUploadFile,
  MdWarningAmber,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useExhibitorContractorStore } from "../../store/exhibitor/useExhibitorContractorStore";

const API = "https://inoptics.in/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const REGISTRATION_FORM_MATCH = "contractor undertaking-declaration & registration";

const INSTRUCTIONS = [
  "All contractors must be registered before the deadline.",
  "ID badges must be collected before exhibition day.",
  "Ensure proper documentation is uploaded in the portal.",
  "Contractor undertaking form is mandatory.",
  "Follow the venue safety and conduct guidelines strictly.",
];

const BOOTH_NOTES = [
  "Upload a clear booth layout or structural design file for approval.",
  "Recommended size: 1200px by 800px.",
  "Accepted formats: JPG, PNG, PDF.",
  "Maximum file size: 5MB.",
];

const MAIL_PREVIEW = {
  to: "INOPTICS@GMAIL.COM",
  subject: "Contractor Registration Form Submission",
  body: "Dear Team, Please find attached the contractor registration form for approval.",
};

const formatFileSize = (size) => {
  if (!size) return "0 KB";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(1)} KB`;
};

const buildBoothFileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API}/${String(path).replace(/^\/+/, "")}`;
};

const buildCoreFormUrl = (filename) =>
  filename ? `${API}/uploads/${encodeURIComponent(filename)}` : "";

export default function AppointedContractor() {
  const { editingExhibitor: ex } = useNavStore();
  const [search, setSearch] = useState("");

  const {
    contractors,
    coreForms,
    selectedContractorId,
    selectedContractorMeta,
    isSelectionLocked,
    boothDesignStatus,
    boothRejectReason,
    boothDesignPath,
    boothDesignFile,
    contractorEmail,
    showRegistrationModal,
    showInstructionsModal,
    initializing,
    contractorsLoading,
    selecting,
    unselecting,
    sendingMail,
    uploadingBooth,
    initForCompany,
    setContractorEmail,
    setShowRegistrationModal,
    setShowInstructionsModal,
    setBoothDesignFile,
    selectContractor,
    unselectContractor,
    sendRegistrationMail,
    uploadBoothDesign,
  } = useExhibitorContractorStore();

  useEffect(() => {
    if (ex) initForCompany(ex);
  }, [ex, initForCompany]);

  const registrationForm = useMemo(
    () =>
      coreForms.find((form) =>
        String(form.category || "").toLowerCase().includes(REGISTRATION_FORM_MATCH),
      ),
    [coreForms],
  );

  const selectedContractor = useMemo(
    () =>
      contractors.find((item) => String(item.id) === String(selectedContractorId)) ||
      selectedContractorMeta ||
      null,
    [contractors, selectedContractorId, selectedContractorMeta],
  );

  const filteredContractors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contractors;
    return contractors.filter((contractor) =>
      [
        contractor.name,
        contractor.company_name,
        contractor.city,
        contractor.email,
        contractor.phone_numbers,
        contractor.mobile_numbers,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [contractors, search]);

  if (!ex) return null;

  const registrationFormUrl = buildCoreFormUrl(registrationForm?.filename);
  const boothFileUrl = buildBoothFileUrl(boothDesignPath);
  const boothStatusLabel = !boothDesignPath && boothDesignStatus === "pending"
    ? "Not Uploaded"
    : boothDesignStatus === "approved"
      ? "Approved"
      : boothDesignStatus === "rejected"
        ? "Rejected"
        : "Pending";

  const boothStatusTone = !boothDesignPath && boothDesignStatus === "pending"
    ? "zinc"
    : boothDesignStatus === "approved"
      ? "emerald"
      : boothDesignStatus === "rejected"
        ? "rose"
        : "amber";

  const selectionStatusLabel =
    isSelectionLocked === 1 ? "Locked" : selectedContractor ? "Selected" : "Not Selected";

  const handleBoothFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be 5MB or less");
      event.target.value = "";
      return;
    }

    setBoothDesignFile(file);
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.75fr)_22rem]">
      <div className="space-y-4">
        

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <MdInfoOutline size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-zinc-900">Contractor Instructions</h4>
                  <p className="text-[12px] text-zinc-500">Choose a contractor and complete the booth design step</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-zinc-600">
                {INSTRUCTIONS.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-zinc-700 ring-1 ring-zinc-200">
                      {index + 1}
                    </span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 lg:max-w-xs">
              <p className="text-[14px] font-semibold text-zinc-900">Your contractor not listed?</p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500">
                Open the registration form modal and send the contractor form directly from here.
              </p>
              <button
                type="button"
                onClick={() => setShowRegistrationModal(true)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-zinc-900 px-4 text-[13px] font-semibold text-white transition hover:bg-zinc-800"
              >
                <MdEmail size={16} />
                Open Registration Form
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Available Contractors</h4>
              <p className="text-[12px] text-zinc-500">Only one contractor can be selected for an exhibitor</p>
            </div>

            <div className="relative w-full sm:w-72">
              <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search contractor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {initializing || contractorsLoading ? (
            <div className="px-4 py-12 text-center text-[14px] text-zinc-500">Loading contractors...</div>
          ) : filteredContractors.length === 0 ? (
            <div className="px-4 py-12 text-center text-[14px] text-zinc-500">No contractors found</div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[54rem]">
                  <thead className="bg-zinc-50">
                    <tr>
                      {["#", "Name", "Company", "City", "Contact", "Email", "Action"].map((heading) => (
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
                    {filteredContractors.map((contractor, index) => {
                      const isSelected = String(selectedContractorId) === String(contractor.id);
                      const hasSelection = !!selectedContractorId;
                      return (
                        <tr key={contractor.id} className="border-t border-zinc-100 align-top hover:bg-zinc-50/80">
                          <td className="px-4 py-3 text-[13px] text-zinc-400">{index + 1}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-zinc-900">{contractor.name || "—"}</td>
                          <td className="px-4 py-3 text-[13px] text-zinc-700">{contractor.company_name || "—"}</td>
                          <td className="px-4 py-3 text-[13px] text-zinc-600">{contractor.city || "—"}</td>
                          <td className="px-4 py-3 text-[13px] text-zinc-600">
                            {[contractor.mobile_numbers, contractor.phone_numbers].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-zinc-600">{contractor.email || "—"}</td>
                          <td className="px-4 py-3">
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={() => unselectContractor(ex.company_name)}
                                disabled={unselecting}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-[12px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                              >
                                {unselecting ? "Removing..." : "Unselect"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => selectContractor(contractor.id, ex)}
                                disabled={selecting || hasSelection}
                                className="inline-flex h-9 items-center justify-center rounded bg-emerald-600 px-3 text-[12px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                              >
                                {selecting ? "Selecting..." : "Select"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-zinc-100 md:hidden">
                {filteredContractors.map((contractor, index) => {
                  const isSelected = String(selectedContractorId) === String(contractor.id);
                  const hasSelection = !!selectedContractorId;
                  return (
                    <div key={contractor.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            Contractor {index + 1}
                          </p>
                          <p className="mt-1 text-[15px] font-semibold text-zinc-900">{contractor.name || "—"}</p>
                          <p className="text-[12px] text-zinc-500">{contractor.company_name || "—"}</p>
                        </div>
                        <StatusPill label={isSelected ? "Selected" : "Available"} tone={isSelected ? "emerald" : "blue"} />
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-[12px] text-zinc-600">
                        <InfoLine icon={<MdLocationOn size={15} />} label={contractor.city || "—"} />
                        <InfoLine
                          icon={<MdPhone size={15} />}
                          label={[contractor.mobile_numbers, contractor.phone_numbers].filter(Boolean).join(", ") || "—"}
                        />
                        <InfoLine icon={<MdEmail size={15} />} label={contractor.email || "—"} />
                      </div>

                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => unselectContractor(ex.company_name)}
                          disabled={unselecting}
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-[13px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {unselecting ? "Removing..." : "Unselect Contractor"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectContractor(contractor.id, ex)}
                          disabled={selecting || hasSelection}
                          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                        >
                          {selecting ? "Selecting..." : "Select Contractor"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Selected Contractor</h4>
              <p className="text-[12px] text-zinc-500">Current appointed contractor for this exhibitor</p>
            </div>
            <StatusPill label={selectionStatusLabel} tone={selectedContractor ? "emerald" : "zinc"} />
          </div>

          {selectedContractor ? (
            <div className="mt-4 space-y-3 rounded-lg bg-zinc-50 p-4">
              <InfoLine icon={<MdPerson size={15} />} label={selectedContractor.name || "—"} strong />
              <InfoLine icon={<MdBusiness size={15} />} label={selectedContractor.company_name || "—"} />
              <InfoLine icon={<MdLocationOn size={15} />} label={selectedContractor.city || "—"} />
              <InfoLine
                icon={<MdPhone size={15} />}
                label={
                  selectedContractor.contact_numbers ||
                  [selectedContractor.mobile_numbers, selectedContractor.phone_numbers].filter(Boolean).join(", ") ||
                  "—"
                }
              />
              <InfoLine icon={<MdEmail size={15} />} label={selectedContractor.email || "—"} />

              <div className="grid grid-cols-1 gap-2 pt-1">
                <SidebarButton
                  onClick={() => setShowInstructionsModal(true)}
                  className="bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  View Instructions
                </SidebarButton>
                <SidebarButton
                  onClick={() => sendRegistrationMail(selectedContractor.email)}
                  disabled={sendingMail || !selectedContractor.email}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {sendingMail ? "Sending..." : "Send Form to Contractor"}
                </SidebarButton>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-[13px] text-zinc-500">
              Select one contractor from the list to continue with booth design upload.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Booth Design</h4>
              <p className="text-[12px] text-zinc-500">Upload design file for review and approval</p>
            </div>
            <StatusPill label={boothStatusLabel} tone={boothStatusTone} />
          </div>

          <div className="mt-4 space-y-2 text-[12px] leading-5 text-zinc-600">
            {BOOTH_NOTES.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          {boothRejectReason && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700">
              <div className="flex items-start gap-2">
                <MdWarningAmber size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Rejection Reason</p>
                  <p className="mt-1">{boothRejectReason}</p>
                </div>
              </div>
            </div>
          )}

          {boothFileUrl && (
            <a
              href={boothFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-[12px] font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
            >
              <MdOpenInNew size={15} />
              View Current Booth File
            </a>
          )}

          <div className="mt-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center transition hover:border-blue-300 hover:bg-blue-50">
              <MdUploadFile size={20} className="text-zinc-400" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800">
                  {boothDesignFile ? boothDesignFile.name : "Choose Booth Design File"}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {boothDesignFile ? formatFileSize(boothDesignFile.size) : "JPG, PNG or PDF up to 5MB"}
                </p>
              </div>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleBoothFileChange}
                disabled={!selectedContractor}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <SidebarButton
              onClick={() => uploadBoothDesign(ex)}
              disabled={uploadingBooth || !selectedContractor || !boothDesignFile}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {uploadingBooth ? "Uploading..." : "Upload Booth Design"}
            </SidebarButton>
            {boothDesignFile && (
              <SidebarButton
                onClick={() => setBoothDesignFile(null)}
                className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Remove Selected File
              </SidebarButton>
            )}
          </div>
        </section>
      </aside>

      {showRegistrationModal && (
        <ModalShell onClose={() => setShowRegistrationModal(false)} title="Contractor Registration Form">
          <p className="text-[13px] leading-6 text-zinc-600">
            For smooth and quick functionality, please forward this registration form to your contractor and ask them
            to fill it and then send the completed form to <span className="font-semibold text-zinc-900">INOPTICS@GMAIL.COM</span>.
          </p>

          <div className="mt-4 space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Contractor Email
            </label>
            <input
              type="email"
              placeholder="Enter contractor email"
              value={contractorEmail}
              onChange={(event) => setContractorEmail(event.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[14px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <MailPreviewCard />

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {registrationFormUrl && (
              <a
                href={registrationFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                <MdDescription size={16} />
                View Form
              </a>
            )}
            <button
              type="button"
              onClick={() => sendRegistrationMail(contractorEmail)}
              disabled={sendingMail}
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-zinc-900 px-4 text-[13px] font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              <MdEmail size={16} />
              {sendingMail ? "Sending..." : "Send Mail"}
            </button>
          </div>
        </ModalShell>
      )}

      {showInstructionsModal && (
        <ModalShell onClose={() => setShowInstructionsModal(false)} title="Mandatory Required Information" size="lg">
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-[14px] font-semibold text-zinc-900">Please follow carefully</p>
              <div className="mt-3 space-y-2 text-[13px] leading-6 text-zinc-600">
                <p>1. Send the undertaking and registration form to the selected contractor.</p>
                <p>
                  2. Ask the contractor to complete the form and send the filled copy to{" "}
                  <span className="font-semibold text-zinc-900">INOPTICS@GMAIL.COM</span>.
                </p>
                <p>3. Upload booth design for approval from the booth design card on this page.</p>
                <p>4. After receiving the form, the contractor should submit it exactly as shown in the mail preview.</p>
              </div>
            </div>

            {selectedContractor && (
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[14px] font-semibold text-zinc-900">Selected Contractor Details</p>
                <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] text-zinc-600">
                  <InfoLine icon={<MdPerson size={15} />} label={selectedContractor.name || "—"} strong />
                  <InfoLine icon={<MdBusiness size={15} />} label={selectedContractor.company_name || "—"} />
                  <InfoLine icon={<MdEmail size={15} />} label={selectedContractor.email || "—"} />
                </div>
              </div>
            )}

            <MailPreviewCard />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {registrationFormUrl && (
                <a
                  href={registrationFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
                >
                  <MdOpenInNew size={16} />
                  View Form
                </a>
              )}
              <button
                type="button"
                onClick={() => sendRegistrationMail(selectedContractor?.email || contractorEmail)}
                disabled={sendingMail}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <MdEmail size={16} />
                {sendingMail ? "Sending..." : "Send Mail"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function ModalShell({ children, onClose, title, size = "md" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-2xl bg-white shadow-xl ${
          size === "lg" ? "max-w-3xl" : "max-w-xl"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <h3 className="text-[16px] font-bold text-zinc-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function MailPreviewCard() {
  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-[14px] font-semibold text-zinc-900">Mail Preview</p>
      <div className="mt-3 space-y-2 text-[13px] text-zinc-600">
        <p>
          <span className="font-semibold text-zinc-900">To:</span> {MAIL_PREVIEW.to}
        </p>
        <p>
          <span className="font-semibold text-zinc-900">Subject:</span> {MAIL_PREVIEW.subject}
        </p>
        <p>
          <span className="font-semibold text-zinc-900">Body:</span> {MAIL_PREVIEW.body}
        </p>
      </div>
    </div>
  );
}

function SidebarButton({ onClick, disabled, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function InfoLine({ icon, label, strong = false }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-zinc-400">{icon}</span>
      <span className={strong ? "font-semibold text-zinc-900" : "text-zinc-600"}>{label}</span>
    </div>
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

function StatusPill({ label, tone }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    zinc: "bg-zinc-100 text-zinc-600",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${toneMap[tone] || toneMap.zinc}`}>
      {tone === "emerald" && <MdCheckCircle size={13} />}
      {label}
    </span>
  );
}
