import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchContractors,
  fetchSelectedContractor,
  selectContractor,
  unselectContractor,
  requestContractorChange,
  sendContractorChangeMail,
  sendRegistrationMail,
  fetchCoreForms,
  uploadExhibitorForm,
  lockContractorStep,
  requestStepUnlock,
  fetchUnlockStatus,
  checkUploadedForm,
} from "../api/mandatoryFormsApi";
import { getExhibitor } from "../api/base";

/* steps:
   1 — Appointed Contractor Form (filled by exhibitor)  → type "form"
   2 — Contractor Undertaking Form (filled by contractor) → type "undertaking"
   3 — Booth Design / Construction Guidelines           → type "booth"
   4 — Thank-you screen (no upload)
*/
const TOTAL_STEPS = 4;

export const useMandatoryFormsStore = create((set, get) => ({
  // contractors
  contractors: [],
  selectedContractor: null,
  selectedContractorId: null,
  isContractorLocked: false,

  // UI
  workflowActive: false,
  viewStep: 1,
  currentStep: 1,
  showConfirmPopup: false,
  pendingContractor: null,
  showListOverlay: false,
  contractorEmail: "",

  // forms / status
  coreForms: [],
  uploadedFiles: { step1: null, step2: null, step3: null },
  stepSubmitted: {},
  unlockStatus: {},

  // upload modal
  uploadModal: null, // { step, file, previewUrl }

  loading: false,
  saving: false,

  /* =============== Bootstrap =============== */
  init: async () => {
    const ex = getExhibitor();
    if (!ex?.company_name) return;
    set({ loading: true });
    try {
      const [contractors, selected, coreForms, unlockStatus] = await Promise.all([
        fetchContractors(),
        fetchSelectedContractor(ex.company_name),
        fetchCoreForms(),
        fetchUnlockStatus(ex.company_name),
      ]);

      set({ contractors, coreForms, unlockStatus });

      // resolve selected contractor
      if (selected?.contractor_company_name) {
        const match = contractors.find(
          (c) => c.company_name === selected.contractor_company_name
        );
        if (match) {
          set({
            selectedContractor: match,
            selectedContractorId: match.id,
            isContractorLocked: Number(selected.is_locked) === 1,
            workflowActive: true,
          });
        }
      }

      // mark stepSubmitted from unlock status
      const stepSubmitted = {};
      Object.keys(unlockStatus || {}).forEach((k) => {
        stepSubmitted[parseInt(k)] = unlockStatus[k]?.status !== "approved";
      });
      set({ stepSubmitted });

      // check which uploads already exist
      const [s1, s2, s3] = await Promise.all([
        checkUploadedForm(ex.company_name, "form"),
        checkUploadedForm(ex.company_name, "undertaking"),
        checkUploadedForm(ex.company_name, "booth"),
      ]);
      set({
        uploadedFiles: {
          step1: s1 ? "exists" : null,
          step2: s2 ? "exists" : null,
          step3: s3 ? "exists" : null,
        },
      });
    } catch (err) {
      console.error("Mandatory forms init failed", err);
    } finally {
      set({ loading: false });
    }
  },

  /* =============== Contractor selection =============== */
  setContractorEmail: (val) => set({ contractorEmail: val }),
  openConfirmPopup: (contractor) =>
    set({ pendingContractor: contractor, showConfirmPopup: true }),
  cancelSelect: () =>
    set({ pendingContractor: null, showConfirmPopup: false }),

  confirmSelect: async () => {
    const { pendingContractor } = get();
    if (!pendingContractor) return;
    const ex = getExhibitor();
    const contactNumbers = [
      pendingContractor.phone_numbers || "",
      pendingContractor.mobile_numbers || "",
    ]
      .filter(Boolean)
      .join(" / ");
    try {
      await selectContractor({
        exhibitor_company_name: ex.company_name,
        contractor_name: pendingContractor.name,
        contractor_company_name: pendingContractor.company_name,
        address: pendingContractor.address,
        city: pendingContractor.city,
        pincode: pendingContractor.pincode,
        country: pendingContractor.country,
        contact_numbers: contactNumbers,
        email: pendingContractor.email,
      });
      set({
        selectedContractor: pendingContractor,
        selectedContractorId: pendingContractor.id,
        workflowActive: true,
        showConfirmPopup: false,
        pendingContractor: null,
        viewStep: 1,
        currentStep: 1,
      });
      toast.success("Contractor selected");
    } catch {
      toast.error("Failed to select contractor");
    }
  },

  unselect: async () => {
    const ex = getExhibitor();
    try {
      await unselectContractor(ex.company_name);
      set({
        selectedContractor: null,
        selectedContractorId: null,
        workflowActive: false,
        viewStep: 1,
      });
      toast.success("Contractor unselected");
    } catch {
      toast.error("Failed to unselect");
    }
  },

  sendUnregisteredMail: async () => {
    const { contractorEmail, coreForms } = get();
    const ex = getExhibitor();
    if (!contractorEmail.trim()) {
      toast.error("Please enter contractor email");
      return;
    }
    const regForm = coreForms.find((f) =>
      (f.category || "").toLowerCase().includes("contractor registration form")
    );
    const pdf_url = regForm?.filename
      ? `https://inoptics.in/api/uploads/${encodeURIComponent(regForm.filename)}`
      : "";
    try {
      const res = await sendRegistrationMail({
        email: contractorEmail.trim(),
        pdf_url,
        company_name: ex.company_name,
      });
      toast.success(res?.message || "Registration mail sent");
      set({ contractorEmail: "" });
    } catch {
      toast.error("Failed to send mail");
    }
  },

  requestUnlock: async () => {
    const { selectedContractor } = get();
    const ex = getExhibitor();
    if (!selectedContractor) return;
    try {
      await sendContractorChangeMail({
        exhibitor_company_name: ex.company_name,
        current_contractor: selectedContractor.company_name,
        exhibitorName: ex.name,
        stallNo: ex.stall_no,
        exhibitorEmail: ex.email,
        contractorName: selectedContractor.name,
        request_type: "unlock_contractor_change",
      });
      await requestContractorChange({
        exhibitor_company: ex.company_name,
        contractor_name: selectedContractor.company_name,
      });
      toast.success("Unlock request sent");
    } catch {
      toast.error("Failed to send unlock request");
    }
  },

  /* =============== Workflow navigation =============== */
  setViewStep: (n) => set({ viewStep: Math.min(Math.max(n, 1), TOTAL_STEPS) }),
  goBack: () =>
    set((s) => ({ viewStep: Math.max(s.viewStep - 1, 1) })),
  goForward: () =>
    set((s) => ({ viewStep: Math.min(s.viewStep + 1, TOTAL_STEPS) })),
  setShowListOverlay: (v) => set({ showListOverlay: v }),

  /* =============== Upload modal =============== */
  openUpload: (step, file) =>
    set({
      uploadModal: {
        step,
        file,
        previewUrl: URL.createObjectURL(file),
      },
    }),
  closeUpload: () => {
    const { uploadModal } = get();
    if (uploadModal?.previewUrl) URL.revokeObjectURL(uploadModal.previewUrl);
    set({ uploadModal: null });
  },

  submitUpload: async () => {
    const { uploadModal } = get();
    if (!uploadModal) return;
    const ex = getExhibitor();
    const { step, file } = uploadModal;
    const typeMap = { 1: "appointed", 2: "undertaking", 3: "booth_design" };
    const stepKey = `step${step}`;

    set({ saving: true });
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("exhibitor_company_name", ex.company_name);
      fd.append("form_type", typeMap[step] || "form");
      const res = await uploadExhibitorForm(fd);
      if (!res?.success) throw new Error(res?.message || "Upload failed");

      // lock the step
      await lockContractorStep(ex.company_name, step);

      set((s) => ({
        uploadedFiles: { ...s.uploadedFiles, [stepKey]: res.file_path },
        stepSubmitted: { ...s.stepSubmitted, [step]: true },
        currentStep: Math.max(s.currentStep, step + 1),
        viewStep: Math.min(step + 1, TOTAL_STEPS),
      }));

      toast.success("Uploaded & locked");
      get().closeUpload();

      // refresh unlock status
      const unlockStatus = await fetchUnlockStatus(ex.company_name);
      set({ unlockStatus });
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      set({ saving: false });
    }
  },

  requestStepUnlock: async (step) => {
    const ex = getExhibitor();
    try {
      const res = await requestStepUnlock(ex.company_name, step);
      if (res?.success) {
        toast.success("Unlock request sent");
        const unlockStatus = await fetchUnlockStatus(ex.company_name);
        set({ unlockStatus });
      } else {
        toast.error(res?.message || "Request failed");
      }
    } catch {
      toast.error("Server error");
    }
  },

  TOTAL_STEPS,
}));
