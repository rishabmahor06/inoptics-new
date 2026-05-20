import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdClose, MdSave, MdCheckCircle } from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useExhibitorBasicStore } from "../../store/exhibitor/useExhibitorBasicStore";
import { useExhibitorListStore } from "../../store/exhibitor/useExhibitorListStore";

import BasicDetails        from "./BasicDetails";
import Stalls              from "./Stalls";
import PowerRequirement    from "./PowerRequirement";
import ExhibitorBadgesTab  from "./ExhibitorBadgesTab";
import AppointedContractor from "./AppointedContractor";
import ExtraFurnitureReq   from "./ExtraFurnitureReq";
import PaymentDetails      from "./PaymentDetails";
import Brands              from "./Brands";
import Undertaking         from "./Undertaking";

const TABS = [
  { id: "basic",       label: "Basic Details",               component: BasicDetails },
  { id: "stalls",      label: "Stalls",                      component: Stalls },
  { id: "power",       label: "Power Requirement",           component: PowerRequirement },
  { id: "badges",      label: "Exhibitor Badges",            component: ExhibitorBadgesTab },
  { id: "contractor",  label: "Appointed Contractor",        component: AppointedContractor },
  { id: "furniture",   label: "Extra Furniture Requirement", component: ExtraFurnitureReq },
  { id: "payment",     label: "Payment Details",             component: PaymentDetails },
  { id: "brands",      label: "Brands",                      component: Brands },
  { id: "undertaking", label: "Undertaking",                 component: Undertaking },
];

export default function AddExhibitorModal({ open, onClose }) {
  const setEditingExhibitor = useNavStore((s) => s.setEditingExhibitor);
  const editingExhibitor    = useNavStore((s) => s.editingExhibitor);

  const { formData, saving, loadFrom, handleSubmit } = useExhibitorBasicStore();
  const fetchExhibitors = useExhibitorListStore((s) => s.fetchExhibitors);

  const [activeTab, setActiveTab] = useState("basic");
  const [createdCompany, setCreatedCompany] = useState(null); // becomes truthy after step 1

  /* reset on open — seed a blank exhibitor so all tabs render */
  useEffect(() => {
    if (open) {
      loadFrom(null);
      // synthetic placeholder so tabs that guard `if (!ex) return null` still render
      setEditingExhibitor({
        id: null,
        company_name: "",
        email: "",
        state: "",
        city: "",
        pincode: "",
        __isNew: true,
      });
      setCreatedCompany(null);
      setActiveTab("basic");
    }
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setEditingExhibitor(null);
    setCreatedCompany(null);
    setActiveTab("basic");
    onClose?.();
  };

  /* Save the basic record, then promote to "edit" mode so the other tabs can work */
  const handleCreate = async () => {
    const ok = await handleSubmit();
    if (!ok) return;
    const { formData: latest } = useExhibitorBasicStore.getState();
    const ex = {
      ...latest,
      id: latest.id || null,
      company_name: latest.company_name,
      email: latest.email,
      state: latest.state,
      city: latest.city,
      pincode: latest.pin,
    };
    setEditingExhibitor(ex);
    setCreatedCompany(latest.company_name);
    await fetchExhibitors();
    toast.success("Now you can fill the remaining sections");
  };

  const ActiveComponent =
    TABS.find((t) => t.id === activeTab)?.component || BasicDetails;

  const isLocked = () => false;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center">
              <MdSave size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900">Add New Exhibitor</h3>
              <p className="text-[12px] text-zinc-500">
                {createdCompany
                  ? <>Created: <strong>{createdCompany}</strong> · fill remaining sections</>
                  : "Step 1: Fill Basic Details, then unlock other sections"}
              </p>
            </div>
            {createdCompany && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                <MdCheckCircle size={12} /> Basic Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "basic" && !createdCompany && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !formData.company_name}
                className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-50"
              >
                <MdSave size={15} /> {saving ? "Creating..." : "Create & Continue"}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-b border-zinc-200 shrink-0 overflow-x-auto">
          <div className="flex px-3">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "text-blue-700 border-blue-600"
                      : "text-zinc-600 border-transparent hover:text-zinc-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50 p-4 sm:p-5">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
