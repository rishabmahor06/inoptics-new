import { create } from "zustand";
import toast from "react-hot-toast";
import { useExhibitorListStore } from "./useExhibitorListStore";

const API = "https://inoptics.in/api";

const REQUIRED_FIELDS = ["company_name", "name", "address", "city", "state", "pin", "mobile", "email"];

const EMPTY_FORM = {
  id: null,
  company_name: "",
  name: "",
  address: "",
  city: "",
  state: "",
  pin: "",
  mobile: "",
  telephone: "",
  email: "",
  secondary_emails: "",
  gst: "",
  password: "",
};

export const useExhibitorBasicStore = create((set, get) => ({
  formData:      { ...EMPTY_FORM },
  errors:        {},
  saving:        false,
  isSendingMail: false,

  // Update Company Name (everywhere)
  oldCompany:        "",
  newCompany:        "",
  updatingCompany:   false,

  /* ============== form ============== */

  loadFrom: (ex) => {
    if (!ex) { set({ formData: { ...EMPTY_FORM }, errors: {} }); return; }
    set({
      formData: {
        id:               ex.id ?? null,
        company_name:     ex.company_name     || "",
        name:             ex.name             || ex.contact_person || "",
        address:          ex.address          || "",
        city:             ex.city             || "",
        state:            ex.state            || "",
        pin:              ex.pin              || ex.pincode || "",
        mobile:           ex.mobile           || "",
        telephone:        ex.telephone        || ex.phone   || "",
        email:            ex.email            || "",
        secondary_emails: ex.secondary_emails || "",
        gst:              ex.gst              || ex.gst_number || "",
        password:         ex.password         || "",
      },
      errors: {},
      oldCompany: ex.company_name || "",
      newCompany: "",
    });
  },

  setField: (name, value) =>
    set((s) => ({
      formData: { ...s.formData, [name]: value },
      errors:   { ...s.errors, [name]: false },
    })),

  validate: () => {
    const { formData } = get();
    const errs = {};
    REQUIRED_FIELDS.forEach((k) => {
      if (!String(formData[k] || "").trim()) errs[k] = true;
    });
    set({ errors: errs });
    return Object.keys(errs).length === 0;
  },

  /* ============== submit/update ============== */

  handleSubmit: async () => {
    if (!get().validate()) {
      toast.error("Please fill all required fields");
      return false;
    }
    set({ saving: true });
    try {
      const { formData } = get();
      const isEdit = !!formData.id;
      const url    = isEdit
        ? `${API}/update_exhibitor.php`
        : `${API}/add_exhibitor.php`;
      const res  = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success || data.status === "success") {
        toast.success(isEdit ? "Exhibitor updated" : "Exhibitor added");
        if (data.password) set((s) => ({ formData: { ...s.formData, password: data.password } }));
        useExhibitorListStore.getState().fetchExhibitors();
        return true;
      }
      toast.error(data.message || "Save failed");
      return false;
    } catch {
      toast.error("Server error");
      return false;
    } finally {
      set({ saving: false });
    }
  },

  /* ============== send mail ============== */

  handleSendMail: async (templateName = "Exhibitor Login & Password") => {
    const { formData } = get();
    if (!formData.email)        { toast.error("Email missing");         return; }
    if (!formData.company_name) { toast.error("Company name missing");  return; }
    set({ isSendingMail: true });
    try {
      const res  = await fetch(`${API}/send_exhibitor_login_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: templateName,
          company_name:  formData.company_name,
          email:         formData.email,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === "success") toast.success("Mail sent successfully");
      else                                           toast.error(data.message || "Mail failed");
    } catch {
      toast.error("Mail failed");
    } finally {
      set({ isSendingMail: false });
    }
  },

  /* ============== update company name everywhere ============== */

  setOldCompany: (v) => set({ oldCompany: v }),
  setNewCompany: (v) => set({ newCompany: v }),

  handleUpdateCompanyName: async () => {
    const { oldCompany, newCompany } = get();
    if (!oldCompany || !newCompany) { toast.error("Both fields are required"); return; }
    if (oldCompany.trim() === newCompany.trim()) {
      toast.error("Names are identical");
      return;
    }
    set({ updatingCompany: true });
    try {
      const res  = await fetch(`${API}/update_company_name_everywhere.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_company_name: oldCompany,
          new_company_name: newCompany,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Company name updated successfully");
        // reflect new name in current form + refresh list
        set((s) => ({
          formData:   { ...s.formData, company_name: newCompany },
          oldCompany: newCompany,
          newCompany: "",
        }));
        useExhibitorListStore.getState().fetchExhibitors();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      set({ updatingCompany: false });
    }
  },
}));
