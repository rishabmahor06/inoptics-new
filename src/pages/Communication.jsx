import React, { useEffect, useRef, useState } from "react";
import {
  MdEmail,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSend,
  MdElectricBolt,
  MdChair,
  MdSearch,
  MdClose,
} from "react-icons/md";
import toast from "react-hot-toast";
import CustomEditor from "../components/CustomEditor/CustomEditor";
import { useNavStore } from "../store/useNavStore";

const API = "https://inoptics.in/api";

const APPLIED_PLACE_OPTIONS = [
  "Exhibitor Password",
  "Payment Receive",
  "Stall Details",
  "Stall Performa",
  "Power Requirement",
  "Exhibition Badges",
  "Appointed Contractors",
  "Extra Furniture Requirement",
  "Exhibitor Unlock Request",
  "Succesfully Unlocked Request",
  "Exhibitor Power Unlock Request",
  "Succesfully Power Unlocked Request",
  "Exhibitor Power Requirement",
  "Exhibitor Badges Unlock Request",
  "Successfully Badges Unlocked Request",
  "Exhibitor Badges Requirement",
  "Exhibitor Contractor Unlock Request",
  "Electrical Vendor Power Requirement",
  "Stall Balance Payment",
  "Remark Mail",
  "Contractor Badges Unlock Request",
  "Contractor Badges Submit",
  "UnderTaking and Declaration Accept",
  "Contractor Selection",
  "Fascia Email",
  "Booth Design Approve",
];

const SUB_TABS = [
  { id: "emails", label: "Emails Master", icon: <MdEmail size={15} /> },
  { id: "bulk", label: "Send Bulk Emails", icon: <MdSend size={15} /> },
  { id: "power", label: "Power Vendor", icon: <MdElectricBolt size={15} /> },
  { id: "furniture", label: "Furniture Vendor", icon: <MdChair size={15} /> },
];

const EMPTY_FORM = {
  email_name: "",
  content: "",
  applied_place: [],
  set_from_email: "",
  attach_pdf: "No",
  admin_copy_email: "",
};

const TH =
  "px-3 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap bg-zinc-50";
const TD = "px-3 py-3 text-[13px] text-zinc-700 border-b border-zinc-50";

function FRow({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-semibold text-zinc-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
    />
  );
}

/* ─── Full-screen Modal ─── */
function Modal({ title, onClose, children, wide = false }) {
  const overlayRef = useRef(null);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto py-8 px-4"
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full flex flex-col ${wide ? "max-w-5xl" : "max-w-2xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <MdClose size={16} />
          </button>
        </div>
        {/* Modal body */}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─── Emails Master Tab ─── */
function EmailsMaster() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/get_email_messages.php`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json.records || json.data || [];
      setData([...arr].sort((a, b) => (a.email_name || '').localeCompare(b.email_name || '')));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      email_name: item.email_name || "",
      content: item.content || "",
      applied_place: Array.isArray(item.applied_place)
        ? item.applied_place
        : (item.applied_place || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      set_from_email: item.set_from_email || "",
      attach_pdf: item.attach_pdf || "No",
      admin_copy_email: item.admin_copy_email || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.email_name.trim()) return toast.error("Enter email name");
    try {
      setSaving(true);
      const url = editingId
        ? `${API}/update_email_message.php`
        : `${API}/add_email_message.php`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      const json = await res.json();
      if (json.success || json.status === "success") {
        toast.success(editingId ? "Template updated" : "Template added");
        setShowModal(false);
        await fetchData();
      } else {
        toast.error(json.message || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this template?")) return;
    try {
      const res = await fetch(`${API}/delete_email_message.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success || json.status === "success") {
        toast.success("Template deleted");
        setData((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  }

  function togglePlace(place) {
    setForm((prev) => ({
      ...prev,
      applied_place: prev.applied_place.includes(place)
        ? prev.applied_place.filter((p) => p !== place)
        : [...prev.applied_place, place],
    }));
  }

  const filtered = data.filter(
    (r) =>
      (r.email_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(r.applied_place)
        ? r.applied_place.join(", ")
        : r.applied_place || ""
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <MdSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full h-9 pl-9 pr-3 text-sm border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
          />
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors shrink-0"
        >
          <MdAdd size={18} /> Add Email
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Loading templates…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            No templates found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Template Name</th>
                  <th className={TH}>Applied Place</th>
                  <th className={TH}>From Email</th>
                  <th className={TH}>PDF</th>
                  <th className={TH}>Admin Copy</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/60 transition-colors"
                  >
                    <td className={`${TD} text-zinc-400`}>{i + 1}</td>
                    <td className={`${TD} font-semibold text-zinc-900`}>
                      {item.email_name}
                    </td>
                    <td className={TD}>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(Array.isArray(item.applied_place)
                          ? item.applied_place
                          : (item.applied_place || "")
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                        ).map((p, j) => (
                          <span
                            key={j}
                            className="text-[11px] bg-zinc-100 text-zinc-600 rounded px-1.5 py-0.5 whitespace-nowrap"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={TD}>{item.set_from_email || "—"}</td>
                    <td className={TD}>
                      <span
                        className={`text-xs font-semibold ${item.attach_pdf === "Yes" ? "text-emerald-600" : "text-zinc-400"}`}
                      >
                        {item.attach_pdf || "No"}
                      </span>
                    </td>
                    <td className={TD}>{item.admin_copy_email || "—"}</td>
                    <td className={`${TD} text-center`}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center transition-all"
                        >
                          <MdEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center transition-all"
                        >
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editingId ? "Edit Email Template" : "Add Email Template"}
          onClose={() => setShowModal(false)}
          wide
        >
          <div className="p-5 grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Side - Small Width */}
            <div className="xl:col-span-4 space-y-4">
              <FRow label="Email Name">
                <TInput
                  value={form.email_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email_name: e.target.value }))
                  }
                  placeholder="Template name"
                />
              </FRow>

              <FRow label="Set From Email">
                <TInput
                  type="email"
                  value={form.set_from_email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, set_from_email: e.target.value }))
                  }
                  placeholder="sender@example.com"
                />
              </FRow>

              <FRow label="Admin Copy Email">
                <TInput
                  type="email"
                  value={form.admin_copy_email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, admin_copy_email: e.target.value }))
                  }
                  placeholder="admin@example.com"
                />
              </FRow>

              <FRow label="Attach PDF">
                <div className="flex gap-4">
                  {["Yes", "No"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="attach_pdf"
                        value={v}
                        checked={form.attach_pdf === v}
                        onChange={() =>
                          setForm((p) => ({ ...p, attach_pdf: v }))
                        }
                        className="accent-zinc-900"
                      />
                      <span className="text-zinc-700 font-medium">{v}</span>
                    </label>
                  ))}
                </div>
              </FRow>

              <FRow label="Applied Place">
                <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto p-2 border border-zinc-200 rounded-lg bg-zinc-50">
                  {APPLIED_PLACE_OPTIONS.map((place) => (
                    <label
                      key={place}
                      className="flex items-start gap-2 text-[12px] text-zinc-700 cursor-pointer hover:text-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={form.applied_place.includes(place)}
                        onChange={() => togglePlace(place)}
                        className="mt-0.5 accent-zinc-900 shrink-0"
                      />
                      <span>{place}</span>
                    </label>
                  ))}
                </div>
              </FRow>
            </div>

            {/* Right Side - Large Width */}
            <div className="xl:col-span-8 space-y-4">
              <FRow label="Email Content">
                <CustomEditor
                  value={form.content}
                  onChange={(val) => setForm((p) => ({ ...p, content: val }))}
                  placeholder="Write your email content here…"
                />
              </FRow>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Send Bulk Emails Tab ─── */
function SendBulkEmails() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 flex flex-col items-center justify-center py-20 gap-3 text-zinc-300">
      <MdSend size={44} />
      <p className="text-sm text-zinc-400">Bulk email composer coming soon</p>
    </div>
  );
}

/* ─── Vendor Table (reusable for Power + Furniture) ─── */
const VENDOR_EMPTY = {
  vendor_name: "",
  company_name: "",
  email: "",
  contact_number: "",
};

function VendorTable({
  fetchUrl,
  addUrl,
  updateUrl,
  deleteUrl,
  title,
  icon: Icon,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(VENDOR_EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [fetchUrl]);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(fetchUrl);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : json.records || json.data || [];
      setData([...arr].sort((a, b) => (a.vendor_name || '').localeCompare(b.vendor_name || '')));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(VENDOR_EMPTY);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      vendor_name: item.vendor_name || "",
      company_name: item.company_name || "",
      email: item.email || "",
      contact_number: item.contact_number || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.vendor_name.trim()) return toast.error("Enter vendor name");
    try {
      setSaving(true);
      const url = editingId ? updateUrl : addUrl;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      const json = await res.json();
      if (json.success || json.status === "success") {
        toast.success(editingId ? "Vendor updated" : "Vendor added");
        setShowModal(false);
        await load();
      } else {
        toast.error(json.message || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      const res = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success || json.status === "success") {
        toast.success("Vendor deleted");
        setData((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    }
  }

  const filtered = data.filter(
    (r) =>
      (r.vendor_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <MdSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title}…`}
            className="w-full h-9 pl-9 pr-3 text-sm border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition"
          />
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors shrink-0"
        >
          <MdAdd size={18} /> Add Vendor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            No vendors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Vendor Name</th>
                  <th className={TH}>Company</th>
                  <th className={TH}>Email</th>
                  <th className={TH}>Contact</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/60 transition-colors"
                  >
                    <td className={`${TD} text-zinc-400`}>{i + 1}</td>
                    <td className={`${TD} font-semibold text-zinc-900`}>
                      {item.vendor_name}
                    </td>
                    <td className={TD}>{item.company_name || "—"}</td>
                    <td className={TD}>{item.email || "—"}</td>
                    <td className={TD}>{item.contact_number || "—"}</td>
                    <td className={`${TD} text-center`}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center transition-all"
                        >
                          <MdEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center transition-all"
                        >
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editingId ? `Edit ${title}` : `Add ${title}`}
          onClose={() => setShowModal(false)}
        >
          <div className="p-6 space-y-4">
            <FRow label="Vendor Name">
              <TInput
                value={form.vendor_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, vendor_name: e.target.value }))
                }
                placeholder="Vendor name"
              />
            </FRow>
            <FRow label="Company Name">
              <TInput
                value={form.company_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, company_name: e.target.value }))
                }
                placeholder="Company name"
              />
            </FRow>
            <FRow label="Email">
              <TInput
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="vendor@example.com"
              />
            </FRow>
            <FRow label="Contact Number">
              <TInput
                value={form.contact_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact_number: e.target.value }))
                }
                placeholder="+91 98765 43210"
              />
            </FRow>
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PowerVendor() {
  return (
    <VendorTable
      fetchUrl={`${API}/get_power_vendors.php`}
      addUrl={`${API}/add_power_vendor.php`}
      updateUrl={`${API}/update_power_vendor.php`}
      deleteUrl={`${API}/delete_power_vendor.php`}
      title="Power Vendor"
      icon={MdElectricBolt}
    />
  );
}

function FurnitureVendor() {
  return (
    <VendorTable
      fetchUrl={`${API}/get_furniture_vendor.php`}
      addUrl={`${API}/add_furniture_vendor.php`}
      updateUrl={`${API}/update_furniture_vendor.php`}
      deleteUrl={`${API}/delete_furniture_vendor.php`}
      title="Furniture Vendor"
      icon={MdChair}
    />
  );
}

/* ─── Main Communication Page ─── */
export default function Communication() {
  const { communicationSubTab, setCommunicationSubTab } = useNavStore();
  const activeTab = communicationSubTab;

  const tabContent = {
    emails: <EmailsMaster />,
    bulk: <SendBulkEmails />,
    power: <PowerVendor />,
    furniture: <FurnitureVendor />,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      

      {/* Tab card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-zinc-100 [scrollbar-width:none]">
          {SUB_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCommunicationSubTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-[13px] whitespace-nowrap transition-colors cursor-pointer shrink-0
                  ${active ? "font-bold text-zinc-900" : "font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"}`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200 ${active ? "bg-zinc-900" : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5">{tabContent[activeTab]}</div>
      </div>
    </div>
  );
}
