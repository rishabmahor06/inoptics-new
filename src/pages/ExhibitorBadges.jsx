import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import toast from "react-hot-toast";
import {
  MdSearch,
  MdFileDownload,
  MdUpload,
  MdAdd,
  MdClose,
  MdExpandMore,
  MdEdit,
  MdDelete,
  MdPrint,
  MdToggleOn,
  MdToggleOff,
  MdVisibility,
  MdVerified,
  MdCurrencyRupee,
} from "react-icons/md";

const SITE = "https://inoptics.in";
const API = `${SITE}/api`;
const BADGE_RATE = 100;

export default function ExhibitorBadges() {
  const [companies, setCompanies] = useState([]);
  const [allExhibitors, setAllExhibitors] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const [printToggle, setPrintToggle] = useState({});
  const [freeQuotaMap, setFreeQuotaMap] = useState({});
  const [badgePaymentSummary, setBadgePaymentSummary] = useState({});

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBadgeId, setPreviewBadgeId] = useState(null);

  const [showExhibitorPopup, setShowExhibitorPopup] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [exhibitorSearch, setExhibitorSearch] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    exhibitor_company_name: "",
    stall_no: "",
    state: "",
    city: "",
    name: "",
    candidate_photo: null,
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch(`${API}/get_exhibitors.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllExhibitors(data);
      })
      .catch(() => toast.error("Failed to load exhibitors"));
  }, []);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = () => {
    fetch(`${API}/get_exhibitor_badges_grouped.php`)
      .then((r) => r.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load badges"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const state = {};
    companies.forEach((company) => {
      (company.badges || []).forEach((b) => {
        state[b.id] = b.print_status === "ready";
      });
    });
    setPrintToggle(state);
  }, [companies]);

  useEffect(() => {
    companies.forEach((c) => {
      fetch(
        `${API}/get_Exhibitor_badges.php?company_name=${encodeURIComponent(c.company_name)}`,
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setFreeQuotaMap((prev) => ({
              ...prev,
              [c.company_name]: Number(d.free_badges || 0),
            }));
          }
        })
        .catch(() => {});
    });
  }, [companies]);

  useEffect(() => {
    if (!companies.length) return;
    companies.forEach(async (company) => {
      try {
        const res = await fetch(
          `${API}/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(company.company_name)}`,
        );
        const data = await res.json();
        const records = Array.isArray(data.records) ? data.records : [];
        const cleared = records.reduce(
          (s, r) => s + Number(r.amount_paid || 0) + Number(r.tds || 0),
          0,
        );

        const freeQuota = Number(freeQuotaMap[company.company_name] || 0);
        const badges = [...(company.badges || [])].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        const paidBadges = badges.slice(freeQuota);

        let amount = 0,
          cgst = 0,
          sgst = 0,
          igst = 0;
        paidBadges.forEach((b) => {
          amount += BADGE_RATE;
          const st = (b.state || "").toLowerCase();
          if (st === "delhi") {
            cgst += BADGE_RATE * 0.09;
            sgst += BADGE_RATE * 0.09;
          } else {
            igst += BADGE_RATE * 0.18;
          }
        });
        const totalAmount = amount + cgst + sgst + igst;
        const pending = Math.max(0, totalAmount - cleared);

        setBadgePaymentSummary((prev) => ({
          ...prev,
          [company.company_name]: {
            paidBadgeCount: paidBadges.length,
            amount,
            cgst,
            sgst,
            igst,
            totalAmount,
            cleared,
            pending,
          },
        }));
      } catch (e) {
        console.error("Badge payment fetch failed", e);
      }
    });
  }, [companies, freeQuotaMap]);

  /* ================= COMPUTED ================= */

  const totalBadges = companies.reduce(
    (t, c) => t + (c.badges?.length || 0),
    0,
  );

  const filteredCompanies = companies.filter(
    (c) =>
      !search.trim() ||
      c.company_name?.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const filteredExhibitors = allExhibitors.filter((ex) =>
    ex.company_name?.toLowerCase().includes(exhibitorSearch.toLowerCase()),
  );

  const selectedCompanyData = companies.find(
    (c) => c.company_name === selectedCompany?.company_name,
  );
  const freeRemaining =
    (freeQuotaMap[selectedCompany?.company_name] || 0) -
    (selectedCompanyData?.badges?.length || 0);
  const newBadgeIsFree = freeRemaining > 0;

  /* ================= ACTIONS ================= */

  const toggleCompany = (name) =>
    setOpenCompany((p) => (p === name ? null : name));

  const deleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge?")) return;
    try {
      setDeletingId(badgeId);
      const res = await fetch(`${API}/delete_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: badgeId }),
      });
      const data = await res.json();
      if (!data.success) {
        setDeletingId(null);
        return toast.error("Delete failed");
      }
      setCompanies((prev) =>
        prev
          .map((c) => ({
            ...c,
            badges: c.badges.filter((b) => b.id !== badgeId),
          }))
          .filter((c) => c.badges.length > 0),
      );
      toast.success("Badge deleted");
      setDeletingId(null);
      fetchBadges();
    } catch {
      setDeletingId(null);
      toast.error("Server error");
    }
  };

  const openEditModal = (badge) => {
    setEditingBadge({
      ...badge,
      preview: badge.photo ? `${SITE}/${badge.photo}` : null,
      candidate_photo: null,
    });
    setShowEditModal(true);
  };

  const updateBadge = async () => {
    try {
      const fd = new FormData();
      fd.append("id", editingBadge.id);
      fd.append("name", editingBadge.name);
      fd.append("stall_no", editingBadge.stall_no);
      fd.append("state", editingBadge.state || "");
      fd.append("city", editingBadge.city || "");
      if (editingBadge.candidate_photo instanceof File) {
        fd.append("candidate_photo", editingBadge.candidate_photo);
      }
      const res = await fetch(`${API}/edit_exhibitor_badge.php`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Update failed");
        return;
      }

      setCompanies((prev) =>
        prev.map((c) => ({
          ...c,
          badges: c.badges.map((b) =>
            b.id === editingBadge.id
              ? {
                  ...b,
                  name: editingBadge.name,
                  stall_no: editingBadge.stall_no,
                  state: editingBadge.state,
                  city: editingBadge.city,
                  photo: data.candidate_photo
                    ? data.candidate_photo + "?t=" + data.ts
                    : b.photo,
                }
              : b,
          ),
        })),
      );
      toast.success("Badge updated");
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const togglePrintStatus = async (badge) => {
    const next = printToggle[badge.id] ? "disabled" : "ready";
    try {
      const res = await fetch(`${API}/update_badge_print_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badge.id, status: next }),
      });
      const data = await res.json();
      if (!data.success) return toast.error("Failed");
      setPrintToggle((p) => ({ ...p, [badge.id]: next === "ready" }));
      toast.success("Updated");
    } catch {
      toast.error("Server error");
    }
  };

  const handleCSVUpload = async (file) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV file allowed");
      return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("excel", file);
      const res = await fetch(`${API}/exhibitor_badge_by_excel.php`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      toast.success(`${data.total_badges_generated} badges created`);
      fetchBadges();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (!formData.exhibitor_company_name) {
      toast.error("Company missing");
      return;
    }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("company_name", formData.exhibitor_company_name);
      fd.append("stall_no", formData.stall_no);
      fd.append("state", formData.state || "");
      fd.append("city", formData.city || "");
      fd.append("exhibitor_id", formData.exhibitor_id || "");
      if (formData.candidate_photo)
        fd.append("candidate_photo", formData.candidate_photo);

      const res = await fetch(`${API}/submit-badge.php`, {
        method: "POST",
        body: fd,
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.message);

      toast.success("Badge created successfully");
      setShowBadgePopup(false);
      setPhotoPreview(null);
      setFormData((prev) => ({ ...prev, name: "", candidate_photo: null }));
      fetchBadges();
    } catch (err) {
      toast.error(err.message || "Error creating badge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB allowed");
      return;
    }
    setFormData((p) => ({ ...p, candidate_photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ================= EXPORT EXCEL ================= */

  const exportBadgesExcel = () => {
    if (!companies.length) {
      toast.error("No data to export");
      return;
    }
    const exportData = [];
    const merges = [];
    let rowIndex = 1;

    companies.forEach((company) => {
      const freeQuota = Number(freeQuotaMap[company.company_name] || 0);
      const sortedBadges = [...(company.badges || [])].sort(
        (a, b) => a.id - b.id,
      );
      let companyPaidTotal = 0,
        paidRowStart = null,
        paidRowEnd = null;

      sortedBadges.forEach((badge, index) => {
        const isFree = index < freeQuota;
        const amount = isFree ? 0 : BADGE_RATE;
        const state = (
          badge.state ||
          company.badges?.[0]?.state ||
          ""
        ).toLowerCase();
        let cgst = 0,
          sgst = 0,
          igst = 0;
        if (!isFree) {
          if (state === "delhi") {
            cgst = amount * 0.09;
            sgst = amount * 0.09;
          } else {
            igst = amount * 0.18;
          }
        }
        const total = amount + cgst + sgst + igst;
        if (!isFree) {
          companyPaidTotal += total;
          if (paidRowStart === null) paidRowStart = rowIndex;
          paidRowEnd = rowIndex;
        }
        exportData.push({
          "Company Name": company.company_name,
          "Badge Name": badge.name,
          "Stall No": badge.stall_no,
          State: badge.state || "",
          City: badge.city || "",
          "Badge Code": `${badge.badge_series || ""}-${badge.badge_series_num || ""}`,
          Type: isFree ? "FREE" : "",
          Paid: !isFree ? "PAID" : "",
          Amount: amount.toFixed(2),
          CGST: cgst ? cgst.toFixed(2) : "-",
          SGST: sgst ? sgst.toFixed(2) : "-",
          IGST: igst ? igst.toFixed(2) : "-",
          Total: total.toFixed(2),
          "Grand Total (Paid Only)": "",
          "Print Status": badge.print_status === "ready" ? "READY" : "DISABLED",
        });
        rowIndex++;
      });

      if (paidRowStart !== null && paidRowEnd !== null) {
        const colIndex = 12;
        exportData[paidRowStart - 1]["Grand Total (Paid Only)"] =
          companyPaidTotal.toFixed(2);
        merges.push({
          s: { r: paidRowStart, c: colIndex },
          e: { r: paidRowEnd, c: colIndex },
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!merges"] = merges;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Badge Report");
    XLSX.writeFile(wb, "Exhibitor_Badges_Report.xlsx");
    toast.success("Excel exported successfully");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm flex items-center justify-center py-16 text-zinc-500 text-base">
        Loading badges...
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportBadgesExcel}
            className="px-3 py-2 text-[14px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdFileDownload size={16} /> Export Excel
          </button>
          <label className="px-3 py-2 text-[14px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
            <MdUpload size={16} /> {uploading ? "Uploading..." : "Upload CSV"}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => handleCSVUpload(e.target.files[0])}
            />
          </label>
          <button
            onClick={() => setShowExhibitorPopup(true)}
            className="px-3 py-2 text-[14px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdAdd size={16} /> Add Badge
          </button>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
            Companies: {companies.length}
          </span>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            Badges: {totalBadges}
          </span>
        </div>
        <div className="relative w-full lg:w-72">
          <MdSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* LIST */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 text-center text-zinc-400 text-base">
          No badges found
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCompanies.map((company) => {
            const freeQuota = Number(freeQuotaMap[company.company_name] || 0);
            const sortedBadges = [...(company.badges || [])].sort(
              (a, b) => new Date(a.created_at) - new Date(b.created_at),
            );

            let totalFree = 0,
              totalPaid = 0;
            let totalAmount = 0,
              totalCGST = 0,
              totalSGST = 0,
              totalIGST = 0,
              grandTotalAll = 0;

            const computedBadges = sortedBadges.map((badge, index) => {
              const isFree = index < freeQuota;
              const amount = isFree ? 0 : BADGE_RATE;
              const state = (
                badge.state ||
                company.badges?.[0]?.state ||
                ""
              ).toLowerCase();
              let cgst = 0,
                sgst = 0,
                igst = 0;
              if (!isFree) {
                if (state === "delhi") {
                  cgst = amount * 0.09;
                  sgst = amount * 0.09;
                } else {
                  igst = amount * 0.18;
                }
              }
              const total = amount + cgst + sgst + igst;
              if (isFree) totalFree++;
              else totalPaid++;
              totalAmount += amount;
              totalCGST += cgst;
              totalSGST += sgst;
              totalIGST += igst;
              grandTotalAll += total;
              return { badge, isFree, amount, cgst, sgst, igst, total };
            });

            const cleared =
              badgePaymentSummary[company.company_name]?.cleared || 0;
            const pending = Math.max(0, grandTotalAll - cleared);
            const remaining = Math.max(0, freeQuota - sortedBadges.length);
            const isOpen = openCompany === company.company_name;
            const isDelhi =
              (company.badges?.[0]?.state || "").toLowerCase() === "delhi";

            return (
              <div
                key={company.company_name}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div
                  onClick={() => toggleCompany(company.company_name)}
                  className="flex flex-col xl:flex-row xl:items-center gap-3 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span className="font-semibold text-zinc-800 text-[15px] truncate max-w-full">
                      {company.company_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border rounded shrink-0 ${
                        remaining > 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      Free Left: {remaining}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-zinc-500">
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1 shrink-0">
                      Free: <b className="text-emerald-800">{totalFree}</b>
                    </span>
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center gap-1 shrink-0">
                      Paid: <b className="text-blue-800">{totalPaid}</b>
                    </span>
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200 rounded flex items-center gap-1 shrink-0">
                      Amount:{" "}
                      <b className="text-yellow-800">
                        ₹{totalAmount.toFixed(2)}
                      </b>
                    </span>
                    {isDelhi ? (
                      <>
                        <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1 shrink-0">
                          CGST:{" "}
                          <b className="text-emerald-800">
                            ₹{totalCGST.toFixed(2)}
                          </b>
                        </span>
                        <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1 shrink-0">
                          SGST:{" "}
                          <b className="text-emerald-800">
                            ₹{totalSGST.toFixed(2)}
                          </b>
                        </span>
                      </>
                    ) : (
                      <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-1 shrink-0">
                        IGST:{" "}
                        <b className="text-red-800">₹{totalIGST.toFixed(2)}</b>
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center gap-1 shrink-0">
                      Total:{" "}
                      <b className="text-blue-800">
                        ₹{grandTotalAll.toFixed(2)}
                      </b>
                    </span>
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1 shrink-0">
                      Cleared:{" "}
                      <b className="text-emerald-800">
                        ₹{Number(cleared).toFixed(2)}
                      </b>
                    </span>
                    <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-1 shrink-0">
                      Pending:{" "}
                      <b className="text-red-800">₹{pending.toFixed(2)}</b>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const exhibitor = allExhibitors.find(
                          (ex) => ex.company_name === company.company_name,
                        );
                        if (!exhibitor) {
                          toast.error("Exhibitor not found");
                          return;
                        }
                        setSelectedCompany(exhibitor);
                        setFormData({
                          exhibitor_company_name: exhibitor.company_name,
                          stall_no: exhibitor.stall_no || "",
                          state: exhibitor.state || "",
                          city: exhibitor.city || "",
                          exhibitor_id: exhibitor.id || "",
                          name: "",
                          candidate_photo: null,
                        });
                        setShowBadgePopup(true);
                      }}
                      className="px-2.5 py-1 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 transition-colors"
                    >
                      <MdAdd size={14} /> Add Badge
                    </button>
                    <MdExpandMore
                      size={22}
                      className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Body */}
                {isOpen && (
                  <div className="border-t border-zinc-100">
                    {/* Desktop table */}
                    <div className="hidden xl:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {[
                              "Name",
                              "Stall",
                              "Type",
                              "Amount",
                              "Free",
                              "Paid",
                              "CGST",
                              "SGST",
                              "IGST",
                              "Total",
                              "Actions",
                              "Preview",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2.5 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {computedBadges.map(
                            ({
                              badge,
                              isFree,
                              amount,
                              cgst,
                              sgst,
                              igst,
                              total,
                            }) => (
                              <tr
                                key={badge.id}
                                className="hover:bg-zinc-50 border-b border-zinc-50"
                              >
                                <td className="px-3 py-3 text-[14px] font-semibold text-zinc-800">
                                  {badge.name}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {badge.stall_no}
                                </td>
                                <td className="px-3 py-3">
                                  {isFree ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                      <MdVerified size={12} /> FREE
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                      <MdCurrencyRupee size={12} /> PAID
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  ₹{amount.toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {isFree ? 1 : 0}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {!isFree ? 1 : 0}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {cgst ? `₹${cgst.toFixed(2)}` : "-"}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {sgst ? `₹${sgst.toFixed(2)}` : "-"}
                                </td>
                                <td className="px-3 py-3 text-[14px] text-zinc-700">
                                  {igst ? `₹${igst.toFixed(2)}` : "-"}
                                </td>
                                <td className="px-3 py-3 text-[14px] font-semibold text-blue-700">
                                  ₹{total.toFixed(2)}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => togglePrintStatus(badge)}
                                      className="p-1.5 hover:bg-zinc-100 rounded-md flex items-center gap-0.5"
                                      title="Toggle print"
                                    >
                                      <MdPrint
                                        size={15}
                                        className="text-zinc-600"
                                      />
                                      {printToggle[badge.id] ? (
                                        <MdToggleOn
                                          size={26}
                                          className="text-emerald-600"
                                        />
                                      ) : (
                                        <MdToggleOff
                                          size={26}
                                          className="text-zinc-400"
                                        />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => openEditModal(badge)}
                                      className="p-1.5 w-18 gap-1 text-center items-center justify-center flex text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                                      title="Edit"
                                    >
                                      <MdEdit size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={() => deleteBadge(badge.id)}
                                      disabled={deletingId === badge.id}
                                      className="p-1.5 text-red-700 gap-1 text-center items-center justify-center flex bg-red-50 hover:bg-red-100 border border-red-200 rounded disabled:opacity-50"
                                      title="Delete"
                                    >
                                      {deletingId === badge.id ? (
                                        <span className="block w-3.5 h-3.5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <MdDelete size={14} />
                                      )}
                                      Delete
                                    </button>
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <button
                                    onClick={() => {
                                      setPreviewBadgeId(badge.id);
                                      setShowPreviewModal(true);
                                    }}
                                    className="p-1.5 text-zinc-700 gap-1 text-center items-center justify-center flex bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded"
                                    title="Preview"
                                  >
                                    <MdVisibility size={14} /> Preview
                                  </button>
                                </td>
                              </tr>
                            ),
                          )}
                          <tr className="bg-blue-50 font-bold">
                            <td
                              colSpan="3"
                              className="px-3 py-3 text-[13px] text-zinc-800"
                            >
                              Total
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              ₹{totalAmount.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              {totalFree}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              {totalPaid}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              ₹{totalCGST.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              ₹{totalSGST.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-zinc-800">
                              ₹{totalIGST.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-[14px] text-blue-700">
                              ₹{grandTotalAll.toFixed(2)}
                            </td>
                            <td colSpan="2" />
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="xl:hidden divide-y divide-zinc-100">
                      {computedBadges.map(
                        ({
                          badge,
                          isFree,
                          amount,
                          cgst,
                          sgst,
                          igst,
                          total,
                        }) => (
                          <div key={badge.id} className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-[14px] text-zinc-800 truncate">
                                  {badge.name}
                                </p>
                                <p className="text-[12px] text-zinc-400">
                                  Stall: {badge.stall_no}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isFree ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                    <MdVerified size={11} /> FREE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                    <MdCurrencyRupee size={11} /> PAID
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[12px]">
                              <div>
                                <span className="text-zinc-400">Amount: </span>
                                <b className="text-zinc-700">
                                  ₹{amount.toFixed(2)}
                                </b>
                              </div>
                              <div>
                                <span className="text-zinc-400">CGST: </span>
                                <b className="text-zinc-700">
                                  {cgst ? `₹${cgst.toFixed(2)}` : "-"}
                                </b>
                              </div>
                              <div>
                                <span className="text-zinc-400">SGST: </span>
                                <b className="text-zinc-700">
                                  {sgst ? `₹${sgst.toFixed(2)}` : "-"}
                                </b>
                              </div>
                              <div>
                                <span className="text-zinc-400">IGST: </span>
                                <b className="text-zinc-700">
                                  {igst ? `₹${igst.toFixed(2)}` : "-"}
                                </b>
                              </div>
                              <div className="col-span-2 sm:col-span-3 pt-1 border-t border-zinc-100 mt-1">
                                <span className="text-zinc-400">Total: </span>
                                <b className="text-blue-700 text-[13px]">
                                  ₹{total.toFixed(2)}
                                </b>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => togglePrintStatus(badge)}
                                className="p-1.5 hover:bg-zinc-100 rounded-md flex items-center"
                              >
                                <MdPrint size={14} className="text-zinc-600" />
                                {printToggle[badge.id] ? (
                                  <MdToggleOn
                                    size={22}
                                    className="text-emerald-600"
                                  />
                                ) : (
                                  <MdToggleOff
                                    size={22}
                                    className="text-zinc-400"
                                  />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewBadgeId(badge.id);
                                  setShowPreviewModal(true);
                                }}
                                className="p-1.5 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md"
                              >
                                <MdVisibility size={13} />
                              </button>
                              <button
                                onClick={() => openEditModal(badge)}
                                className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md"
                              >
                                <MdEdit size={13} />
                              </button>
                              <button
                                onClick={() => deleteBadge(badge.id)}
                                className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md"
                              >
                                {deletingId === badge.id ? (
                                  <span className="block w-3.5 h-3.5 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <MdDelete size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                      <div className="p-4 bg-blue-50 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                        <div>
                          <span className="text-zinc-500">Free: </span>
                          <b>{totalFree}</b>
                        </div>
                        <div>
                          <span className="text-zinc-500">Paid: </span>
                          <b>{totalPaid}</b>
                        </div>
                        <div>
                          <span className="text-zinc-500">Amount: </span>
                          <b>₹{totalAmount.toFixed(2)}</b>
                        </div>
                        <div>
                          <span className="text-zinc-500">CGST: </span>
                          <b>₹{totalCGST.toFixed(2)}</b>
                        </div>
                        <div>
                          <span className="text-zinc-500">SGST: </span>
                          <b>₹{totalSGST.toFixed(2)}</b>
                        </div>
                        <div>
                          <span className="text-zinc-500">IGST: </span>
                          <b>₹{totalIGST.toFixed(2)}</b>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-blue-200">
                          <span className="text-zinc-500">Grand Total: </span>
                          <b className="text-blue-700 text-[14px]">
                            ₹{grandTotalAll.toFixed(2)}
                          </b>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============= PREVIEW MODAL ============= */}
      {showPreviewModal && (
        <ModalShell
          title="Badge Preview"
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewBadgeId(null);
          }}
          wide
        >
          <div className="flex justify-center">
            <img
              src={`${API}/exhibitor_badges_preview.php?id=${previewBadgeId}&t=${Date.now()}`}
              alt="Badge"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </ModalShell>
      )}

      {/* ============= EDIT MODAL ============= */}
      {showEditModal && editingBadge && (
        <ModalShell
          title="Edit Badge"
          onClose={() => setShowEditModal(false)}
          footer={
            <>
              <BtnGhost onClick={() => setShowEditModal(false)}>
                Cancel
              </BtnGhost>
              <BtnPrimary onClick={updateBadge}>Update Badge</BtnPrimary>
            </>
          }
        >
          <Field label="Candidate Name">
            <Input
              value={editingBadge.name}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, name: e.target.value })
              }
            />
          </Field>
          <Field label="Stall No">
            <Input
              value={editingBadge.stall_no}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, stall_no: e.target.value })
              }
            />
          </Field>
          <Field label="State">
            <Input
              value={editingBadge.state}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, state: e.target.value })
              }
            />
          </Field>
          <Field label="City">
            <Input
              value={editingBadge.city}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, city: e.target.value })
              }
            />
          </Field>
          <Field label="Photo">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (editingBadge.preview?.startsWith("blob:"))
                  URL.revokeObjectURL(editingBadge.preview);
                setEditingBadge((p) => ({
                  ...p,
                  candidate_photo: file,
                  preview: URL.createObjectURL(file),
                }));
              }}
              className="block w-full text-[13px] text-zinc-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {editingBadge?.preview && (
              <img
                src={editingBadge.preview}
                alt="preview"
                className="mt-2 h-24 w-24 object-cover rounded-lg border border-zinc-200"
              />
            )}
          </Field>
        </ModalShell>
      )}

      {/* ============= ADD BADGE MODAL ============= */}
      {showBadgePopup && (
        <ModalShell
          title="Add Exhibitor Badge"
          onClose={() => {
            setShowBadgePopup(false);
            setPhotoPreview(null);
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              {newBadgeIsFree ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  <MdVerified size={13} /> FREE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  <MdCurrencyRupee size={13} /> PAID
                </span>
              )}
              <span className="text-[12px] text-zinc-500">
                Free Remaining:{" "}
                <b className="text-zinc-800">{Math.max(0, freeRemaining)}</b>
              </span>
            </div>
            <Field label="Company">
              <Input value={formData.exhibitor_company_name} disabled />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stall No">
                <Input value={formData.stall_no} disabled />
              </Field>
              <Field label="State">
                <Input value={formData.state} disabled />
              </Field>
            </div>
            <Field label="City">
              <Input value={formData.city} disabled />
            </Field>
            <Field label="Candidate Name">
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Name"
              />
            </Field>
            <Field label="Photo (max 2MB)">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-[13px] text-zinc-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="preview"
                  className="mt-2 h-24 w-24 object-cover rounded-lg border border-zinc-200"
                />
              )}
            </Field>
            <div className="flex justify-end pt-2 gap-4">
              <button
                onClick={() => {
                  setShowBadgePopup(false);
                  setPhotoPreview(null);
                }}
                type="button"
                className="ml-2 px-4 py-2 text-[14px] font-semibold bg-zinc-400 hover:bg-zinc-200 text-zinc-100 hover:text-zinc-700 rounded transition-colors"
              >
                Cancle
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Generating..." : "Generate Badge"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ============= EXHIBITOR LIST MODAL ============= */}
      {showExhibitorPopup && (
        <ModalShell
          title="Select Exhibitor"
          wide
          onClose={() => setShowExhibitorPopup(false)}
          footer={
            <BtnGhost onClick={() => setShowExhibitorPopup(false)}>
              Close
            </BtnGhost>
          }
        >
          <div className="relative mb-3">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search exhibitor..."
              value={exhibitorSearch}
              onChange={(e) => setExhibitorSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto border border-zinc-100 rounded-lg divide-y divide-zinc-100">
            {filteredExhibitors.length === 0 ? (
              <p className="p-6 text-center text-zinc-400 text-[14px]">
                No exhibitors found
              </p>
            ) : (
              filteredExhibitors.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-zinc-50"
                >
                  <span className="text-[14px] text-zinc-800 truncate">
                    {ex.company_name}
                  </span>
                  <button
                    onClick={() => {
                      const fullCompany = companies.find(
                        (c) => c.company_name === ex.company_name,
                      );
                      setSelectedCompany(fullCompany || ex);
                      setShowExhibitorPopup(false);
                      setFormData({
                        exhibitor_company_name: ex.company_name,
                        stall_no: ex.stall_no || "",
                        state: ex.state || "",
                        city: ex.city || "",
                        exhibitor_id: ex.id || "",
                        name: "",
                        candidate_photo: null,
                      });
                      setShowBadgePopup(true);
                    }}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}

/* ================= REUSABLE BITS ================= */

function ModalShell({ title, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[92vh] flex flex-col overflow-hidden`}
      >
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h3 className="text-[15px] font-bold text-zinc-800 truncate pr-3">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-zinc-100 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[14px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-50 disabled:text-zinc-500 read-only:bg-zinc-50 ${className}`}
    />
  );
}

function BtnGhost({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[14px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function BtnPrimary({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}
