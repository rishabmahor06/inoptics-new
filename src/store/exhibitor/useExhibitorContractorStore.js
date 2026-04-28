import { create } from "zustand";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";
const REGISTRATION_FORM_KEY = "contractor undertaking-declaration & registration";

const EMPTY_STATE = {
  contractors: [],
  coreForms: [],
  selectedContractorId: null,
  selectedContractorCompanyName: "",
  selectedContractorMeta: null,
  isSelectionLocked: null,
  boothDesignStatus: "pending",
  boothRejectReason: "",
  boothDesignPath: "",
  boothDesignFile: null,
  contractorEmail: "",
  showRegistrationModal: false,
  showInstructionsModal: false,
  initializing: false,
  contractorsLoading: false,
  selecting: false,
  unselecting: false,
  sendingMail: false,
  uploadingBooth: false,
};

const normalizeRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

const findRegistrationForm = (coreForms) =>
  coreForms.find((form) =>
    String(form.category || "")
      .toLowerCase()
      .includes(REGISTRATION_FORM_KEY),
  );

const syncSelectedId = (contractors, selectedCompanyName) => {
  if (!selectedCompanyName) return null;
  const selected = contractors.find(
    (item) =>
      String(item.company_name || "").trim().toLowerCase() ===
      String(selectedCompanyName || "").trim().toLowerCase(),
  );
  return selected?.id ?? null;
};

export const useExhibitorContractorStore = create((set, get) => ({
  ...EMPTY_STATE,

  reset: () =>
    set({
      ...EMPTY_STATE,
    }),

  setContractorEmail: (value) => set({ contractorEmail: value }),
  setShowRegistrationModal: (value) => set({ showRegistrationModal: value }),
  setShowInstructionsModal: (value) => set({ showInstructionsModal: value }),
  setBoothDesignFile: (file) => set({ boothDesignFile: file || null }),

  initForCompany: async (exhibitor) => {
    if (!exhibitor?.company_name) {
      get().reset();
      return;
    }

    set({
      ...EMPTY_STATE,
      initializing: true,
    });

    try {
      await Promise.all([get().fetchContractors(), get().fetchCoreForms()]);
      await Promise.all([
        get().fetchSelectedContractor(exhibitor.company_name),
        get().fetchBoothData(exhibitor.company_name),
      ]);
    } finally {
      set({ initializing: false });
    }
  },

  fetchContractors: async () => {
    set({ contractorsLoading: true });
    try {
      const res = await fetch(`${API}/get_exhibitor_contractors_requirements.php`);
      const data = await res.json();
      const contractors = normalizeRows(data).sort((a, b) =>
        String(a.company_name || "").localeCompare(String(b.company_name || "")),
      );
      set((state) => ({
        contractors,
        selectedContractorId: syncSelectedId(contractors, state.selectedContractorCompanyName),
      }));
    } catch (error) {
      console.error("Error fetching contractor data:", error);
      toast.error("Failed to fetch contractors");
    } finally {
      set({ contractorsLoading: false });
    }
  },

  fetchCoreForms: async () => {
    try {
      const res = await fetch(`${API}/get_core_forms.php`);
      const data = await res.json();
      set({ coreForms: normalizeRows(data) });
    } catch (error) {
      console.error("Error fetching core forms:", error);
      toast.error("Failed to fetch contractor form");
    }
  },

  fetchSelectedContractor: async (companyName) => {
    if (!companyName) return;

    try {
      const response = await fetch(
        `${API}/get_selected_exhibitors_contractors.php?exhibitor_company_name=${encodeURIComponent(companyName)}`,
      );
      const data = await response.json();

      if (data && data.contractor_company_name) {
        const normalizedSelected = {
          ...data,
          id: data.id ?? null,
          name: data.contractor_name || data.name || "",
          company_name: data.contractor_company_name || data.company_name || "",
          contact_numbers: data.contact_numbers || "",
          email: data.email || "",
          city: data.city || "",
        };
        set((state) => ({
          selectedContractorCompanyName: data.contractor_company_name || "",
          selectedContractorMeta: normalizedSelected,
          isSelectionLocked:
            data.is_locked === undefined || data.is_locked === null ? null : Number(data.is_locked),
          selectedContractorId: syncSelectedId(
            state.contractors,
            data.contractor_company_name || "",
          ),
          contractorEmail: data.email || state.contractorEmail,
        }));
      } else {
        set({
          selectedContractorId: null,
          selectedContractorCompanyName: "",
          selectedContractorMeta: null,
          isSelectionLocked: null,
          contractorEmail: "",
        });
      }
    } catch (error) {
      console.error("Error fetching selected contractor:", error);
      toast.error("Failed to fetch selected contractor");
    }
  },

  fetchBoothData: async (companyName) => {
    if (!companyName) return;

    try {
      const [statusRes, formsRes] = await Promise.all([
        fetch(`${API}/get_booth_design_status.php?company=${encodeURIComponent(companyName)}`),
        fetch(`${API}/get_all_uploaded_exhibitor_forms.php`),
      ]);

      let statusData = {};
      let formsData = {};

      try {
        statusData = await statusRes.json();
      } catch {
        statusData = {};
      }

      try {
        formsData = await formsRes.json();
      } catch {
        formsData = {};
      }

      const rawStatus = String(statusData?.status || "").toLowerCase().trim();
      const boothDesignStatus = ["pending", "approved", "rejected"].includes(rawStatus)
        ? rawStatus
        : "pending";

      const matchingRow = normalizeRows(formsData).find((row) => {
        const sameCompany =
          String(row.exhibitor_company_name || "").trim().toLowerCase() ===
          String(companyName || "").trim().toLowerCase();
        return sameCompany && String(row.booth_design || "").trim();
      });

      set({
        boothDesignStatus,
        boothRejectReason: boothDesignStatus === "rejected" ? statusData?.reject_reason || "" : "",
        boothDesignPath: matchingRow?.booth_design || "",
      });
    } catch (error) {
      console.error("Error fetching booth design data:", error);
      toast.error("Failed to fetch booth design data");
    }
  },

  selectContractor: async (contractorId, exhibitor) => {
    const contractor = get().contractors.find((item) => String(item.id) === String(contractorId));
    const exhibitorCompany = exhibitor?.company_name;

    if (!contractor || !exhibitorCompany) {
      toast.error("Contractor or exhibitor details missing");
      return false;
    }

    const contactNumbers = [contractor.phone_numbers || "", contractor.mobile_numbers || ""]
      .filter(Boolean)
      .join(" / ");

    set({ selecting: true });

    try {
      const response = await fetch(`${API}/selected_exhibitors_contractors.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exhibitor_company_name: exhibitorCompany,
          contractor_name: contractor.name,
          contractor_company_name: contractor.company_name,
          address: contractor.address,
          city: contractor.city,
          pincode: contractor.pincode,
          country: contractor.country,
          contact_numbers: contactNumbers,
          email: contractor.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to select contractor");
      }

      set({
        selectedContractorId: contractor.id,
        selectedContractorCompanyName: contractor.company_name || "",
        selectedContractorMeta: contractor,
        contractorEmail: contractor.email || "",
        showInstructionsModal: true,
      });
      toast.success("Contractor selected successfully");
      return true;
    } catch (error) {
      console.error("Error selecting contractor:", error);
      toast.error(error.message || "Failed to select contractor");
      return false;
    } finally {
      set({ selecting: false });
    }
  },

  unselectContractor: async (exhibitorCompany) => {
    if (!exhibitorCompany) {
      toast.error("Company name missing");
      return false;
    }

    if (!window.confirm("Are you sure you want to unselect the appointed contractor?")) {
      return false;
    }

    set({ unselecting: true });

    try {
      const response = await fetch(`${API}/unselect_exhibitors_contractors.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitor_company_name: exhibitorCompany }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unselect contractor");
      }

      localStorage.removeItem("undertakingDetails");

      set({
        selectedContractorId: null,
        selectedContractorCompanyName: "",
        selectedContractorMeta: null,
        contractorEmail: "",
        showInstructionsModal: false,
      });

      toast.success("Contractor unselected successfully");
      return true;
    } catch (error) {
      console.error("Error unselecting contractor:", error);
      toast.error(error.message || "Failed to unselect contractor");
      return false;
    } finally {
      set({ unselecting: false });
    }
  },

  sendRegistrationMail: async (email) => {
    const trimmedEmail = String(email || "").trim();
    if (!trimmedEmail) {
      toast.error("Please enter contractor email address");
      return false;
    }

    const registrationForm = findRegistrationForm(get().coreForms);
    const fileName = registrationForm?.filename || "";

    set({ sendingMail: true });
    try {
      const res = await fetch(`${API}/send-contractor-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          file: fileName,
        }),
      });

      const data = await res.json();

      if (data?.success || data?.status === "success") {
        toast.success("Mail sent successfully");
        return true;
      }

      throw new Error(data?.message || data?.error || "Failed to send mail");
    } catch (error) {
      console.error("Error sending contractor mail:", error);
      toast.error(error.message || "Failed to send mail");
      return false;
    } finally {
      set({ sendingMail: false });
    }
  },

  uploadBoothDesign: async (exhibitor) => {
    const { boothDesignFile, selectedContractorId } = get();

    if (!selectedContractorId) {
      toast.error("Select a contractor before uploading booth design");
      return false;
    }

    if (!exhibitor?.company_name) {
      toast.error("Exhibitor company missing");
      return false;
    }

    if (!boothDesignFile) {
      toast.error("Choose a booth design file first");
      return false;
    }

    set({ uploadingBooth: true });

    try {
      const uploadData = new FormData();
      uploadData.append("file", boothDesignFile);
      uploadData.append("company_name", exhibitor.company_name);

      const res = await fetch(`${API}/upload_booth_design_file.php`, {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();

      if (!data?.success) {
        throw new Error(data?.message || "Upload failed");
      }

      set({ boothDesignFile: null });
      await get().fetchBoothData(exhibitor.company_name);
      toast.success("Booth design uploaded successfully");
      return true;
    } catch (error) {
      console.error("Error uploading booth design:", error);
      toast.error(error.message || "Failed to upload booth design");
      return false;
    } finally {
      set({ uploadingBooth: false });
    }
  },
}));
