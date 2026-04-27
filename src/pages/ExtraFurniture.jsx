import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import {
  MdSearch, MdFileDownload, MdAdd, MdRemove, MdClose,
  MdExpandMore, MdDelete, MdEmail, MdLockOpen, MdRefresh,
  MdChair, MdCheckCircle,
} from "react-icons/md";

const API = "https://inoptics.in/api";

const ExtraFurniture = ({ exhibitorData = [] }) => {
  const [companies, setCompanies]                 = useState([]);
  const [furniture, setFurniture]                 = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);

  const [openIndex, setOpenIndex]                 = useState(null);
  const [search, setSearch]                       = useState("");
  const [showFurnitureList, setShowFurnitureList] = useState(false);

  const [loadingCompanies, setLoadingCompanies]   = useState(true);
  const [loadingFurniture, setLoadingFurniture]   = useState(true);

  const [currentCompany, setCurrentCompany]       = useState("");
  const [state, setState]                         = useState("");

  const [emailMasterData, setEmailMasterData]     = useState([]);
  const [furnitureVendorDetails, setFurnitureVendorDetails] = useState([]);
  const [formData, setFormData]                   = useState({});

  const [isSendingMail, setIsSendingMail]         = useState(false);

  const [furnitureCache, setFurnitureCache]       = useState({});
  const [exhibitorMap, setExhibitorMap]           = useState({});
  const [showExhibitorList, setShowExhibitorList] = useState(false);
  const [exhibitorSearch, setExhibitorSearch]     = useState("");

  const [unlockStatus, setUnlockStatus]           = useState({});

  /* ================= FETCH ================= */

  const fetchEmailMessages = async () => {
    try {
      const res  = await fetch(`${API}/get_email_messages.php`);
      const json = await res.json();
      setEmailMasterData(json.data || []);
    } catch (err) { console.error("Failed to fetch email messages", err); }
  };

  const fetchLockedCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res  = await fetch(`${API}/get_all_selected_furniture_by_exhibitor.php`);
      const data = await res.json();
      const allEntries = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];

      if (allEntries.length === 0) {
        setCompanies([]); setUnlockStatus({}); setLoadingCompanies(false); return;
      }

      const normalize = (str) => str?.replace(/\s+/g, " ").trim().toLowerCase();
      const statusMap = {};
      allEntries.forEach((item) => {
        const key = normalize(item.company_name);
        if (!key) return;
        const lock = item.lockState || {};
        statusMap[key] = {
          is_locked: Number(lock.is_locked || 0),
          unlock_requested: Number(lock.unlock_requested || 0),
        };
      });
      setUnlockStatus(statusMap);

      const uniqueCompanyNames = [...new Set(allEntries.map((i) => i.company_name).filter(Boolean))];
      const entryMap = {};
      allEntries.forEach((e) => {
        const key = normalize(e.company_name);
        if (!entryMap[key]) entryMap[key] = e;
      });

      const results = await Promise.all(
        uniqueCompanyNames.map(async (companyName) => {
          try {
            const r = await fetch(`${API}/get_selected_furniture.php?company_name=${encodeURIComponent(companyName)}`);
            const d = await r.json();
            const furnitureList = Array.isArray(d.furniture) ? d.furniture : [];
            if (furnitureList.length === 0) return null;
            const parsedFurniture = furnitureList.map((item) => ({
              id: item.id,
              name: item.furniture_name || item.name,
              image: item.image_url || item.image,
              price: Number(item.price),
              quantity: Number(item.quantity),
            }));
            const key = normalize(companyName);
            const fromList = entryMap[key] || {};
            const exhibitor = d.exhibitor || d.company || d.exhibitor_details || {};
            const firstItem = furnitureList[0] || {};
            return {
              company: {
                company_name: companyName,
                name:   exhibitor.name || exhibitor.contact_person || fromList.name || firstItem.contact_person || "",
                email:  exhibitor.email || fromList.email || firstItem.email || "",
                mobile: exhibitor.mobile || exhibitor.phone || fromList.mobile || firstItem.mobile || "",
                stall_no: exhibitor.stall_no || fromList.stall_no || firstItem.stall_no || "",
                state:  exhibitor.state || fromList.state || firstItem.state || "",
              },
              furniture: parsedFurniture,
            };
          } catch (err) { console.error(`Failed for ${companyName}:`, err); return null; }
        }),
      );

      const cache = {};
      const companiesList = [];
      results.filter(Boolean).forEach(({ company, furniture }) => {
        cache[company.company_name] = furniture;
        companiesList.push(company);
      });
      setFurnitureCache(cache);
      setCompanies(companiesList);
    } catch (err) { console.error("fetchLockedCompanies error:", err); }
    setLoadingCompanies(false);
  };

  const fetchExhibitors = async () => {
    try {
      const res  = await fetch(`${API}/get_exhibitors.php`);
      const data = await res.json();
      const map  = {};
      const list = Array.isArray(data) ? data : [];
      list.forEach((item) => {
        if (!item.company_name) return;
        const key = item.company_name.replace(/\s+/g, " ").trim().toLowerCase();
        if (!map[key]) {
          map[key] = {
            name: item.name || item.contact_person || "",
            email: item.email || "",
            mobile: item.mobile || item.phone || "",
            stall_no: item.stall_no || item.stall_number || "",
            state: item.state || "",
          };
        }
      });
      setExhibitorMap(map);
    } catch (err) { console.error("fetchExhibitors error:", err); }
  };

  const fetchFurniture = async () => {
    setLoadingFurniture(true);
    try {
      const res  = await fetch(`${API}/get_furniture_requirement.php`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || data.furniture || [];
      setFurniture(list.map((item) => ({
        id: item.id,
        name: item.furniture_name || item.name,
        image: item.image,
        price: Number(item.price) || 0,
      })));
    } catch (err) { console.error(err); }
    setLoadingFurniture(false);
  };

  const fetchFurnitureVendor = async () => {
    try {
      const res  = await fetch(`${API}/get_furniture_vendor_details.php`);
      const data = await res.json();
      if (data.status === "success") setFurnitureVendorDetails(data.vendors || []);
    } catch (err) { console.error(err); }
  };

  const fetchSelectedFurniture = async (company) => {
    if (furnitureCache[company]) { setSelectedFurniture(furnitureCache[company]); return; }
    try {
      const res  = await fetch(`${API}/get_selected_furniture.php?company_name=${encodeURIComponent(company)}`);
      const data = await res.json();
      const list = Array.isArray(data.furniture) ? data.furniture : [];
      const parsed = list.map((item) => ({
        id: item.id,
        name: item.furniture_name || item.name,
        image: item.image_url || item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));
      setFurnitureCache((prev) => ({ ...prev, [company]: parsed }));
      setSelectedFurniture(parsed);
    } catch (err) { console.error(err); }
  };

  /* ================= ACTIONS ================= */

  const addFurniture = (item) => {
    if (selectedFurniture.find((f) => f.name === item.name)) return;
    setSelectedFurniture([...selectedFurniture, { ...item, quantity: 1 }]);
  };

  const changeQty = (index, type) => {
    const updated = [...selectedFurniture];
    if (type === "inc") updated[index].quantity += 1;
    else                updated[index].quantity = Math.max(1, updated[index].quantity - 1);
    setSelectedFurniture(updated);
  };

  const deleteFurniture = (index) => {
    setSelectedFurniture(selectedFurniture.filter((_, i) => i !== index));
  };

  const updateSelectedFurniture = async () => {
    try {
      const payload = {
        company_name: currentCompany,
        furniture: selectedFurniture.map((item) => ({
          image: item.image,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.price) * Number(item.quantity),
        })),
      };
      const hasExisting = furnitureCache[currentCompany]?.length > 0;
      const apiUrl = hasExisting
        ? `${API}/Update_selected_furniture.php`
        : `${API}/add_selected_furniture.php`;
      const res  = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success") {
        setFurnitureCache((prev) => ({ ...prev, [currentCompany]: [...selectedFurniture] }));
        toast.success("Furniture saved successfully");
        setShowFurnitureList(false);
        await fetchLockedCompanies();
        const idx = companies.findIndex((c) => c.company_name === currentCompany);
        if (idx !== -1) setOpenIndex(idx);
      } else {
        toast.error(data.message || "Failed to save furniture");
      }
    } catch (err) { console.error(err); toast.error("Server error"); }
  };

  const handleSendFurnitureMail = async (emailTemplateName) => {
    const sendMail = async () => {
      const vendorTemplate    = emailMasterData.find((t) => t.email_name === emailTemplateName);
      const exhibitorTemplate = emailMasterData.find(
        (t) => t.email_name === "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
      );
      if (!vendorTemplate || !exhibitorTemplate) throw new Error("Email template not found");

      const { company_name, name, mobile, email, stall_no } = formData;
      if (!company_name || !email)         throw new Error("Missing exhibitor data");
      const vendor = furnitureVendorDetails?.[0] || {};
      const vendorEmail = vendor.email || vendor.vendor_email || vendor.vendorEmail || vendor.contact_email;
      if (!vendorEmail)                    throw new Error("Vendor email missing");
      if (!selectedFurniture?.length)      throw new Error("No furniture selected");

      let totalAmount = 0, totalSGST = 0, totalCGST = 0, grandTotal = 0;
      const rows = selectedFurniture.map((item) => {
        const qty = Number(item.quantity), rate = Number(item.price);
        const amount = qty * rate, sgst = amount * 0.09, cgst = amount * 0.09;
        const total = amount + sgst + cgst;
        totalAmount += amount; totalSGST += sgst; totalCGST += cgst; grandTotal += total;
        return `<tr><td>${item.name}</td><td align="center">${qty}</td><td align="right">${rate.toFixed(2)}</td><td align="right">${amount.toFixed(2)}</td><td align="right">${sgst.toFixed(2)}</td><td align="right">${cgst.toFixed(2)}</td><td align="right">${total.toFixed(2)}</td></tr>`;
      }).join("");

      const furnitureTable = `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%"><tbody>${rows}</tbody></table>`;
      const replaceTemplate = (template) => {
        let html = template;
        const replaceData = {
          "[Company_Name]": company_name,
          "[Contact_Person_Name]": name,
          "[Mobile_Number]": mobile,
          "[Email_Address]": email,
          "[Stall_No]": stall_no,
          "[Furniture_Table]": furnitureTable,
        };
        Object.keys(replaceData).forEach((k) => { html = html.replaceAll(k, replaceData[k]); });
        return html.replace(/&n/g, "<br>");
      };
      const vendorHTML    = replaceTemplate(vendorTemplate.content);
      const exhibitorHTML = replaceTemplate(exhibitorTemplate.content);

      await fetch(`${API}/send_furniture_vendor_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_name: emailTemplateName, to: vendorEmail, html: vendorHTML }),
      });
      await fetch(`${API}/send_furniture_vendor_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
          to: email,
          html: exhibitorHTML,
        }),
      });
    };
    toast.promise(sendMail(), {
      loading: "Sending email...",
      success: "Mail sent successfully",
      error: (err) => err.message || "Failed to send email",
    });
  };

  const handleAdminUnlock = async (companyName) => {
    if (!companyName) return;
    if (!window.confirm(`Unlock furniture for ${companyName}?`)) return;
    if (isSendingMail) return;
    setIsSendingMail(true);
    try {
      const response = await fetch(`${API}/admin_unlock_furniture.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const result = await response.json();
      if (result.status !== "success" && result.status !== "unlocked") {
        toast.error(result.message || "Unlock failed");
        setIsSendingMail(false); return;
      }
      const key = companyName.replace(/\s+/g, " ").trim().toLowerCase();
      setUnlockStatus((prev) => ({ ...prev, [key]: { is_locked: 0, unlock_requested: 0 } }));

      const emailTemplate = emailMasterData.find(
        (t) => t.email_name === "InOptics 2026 @ Extra Furniture Section Unlocked",
      );
      if (!emailTemplate) { toast.error("Email template not found"); setIsSendingMail(false); return; }

      const { company_name, email } = formData;
      if (!company_name || !email) { toast.error("Missing company/email"); setIsSendingMail(false); return; }

      let parsedContent = emailTemplate.content
        .replace(/\[Company Name\]/gi, company_name)
        .replace(/\[Email\]/gi, email)
        .replace(/&n/g, "<br>");
      parsedContent = `<html><body style="font-family:Arial; font-size:14px;">${parsedContent}</body></html>`;

      const mailRes  = await fetch(`${API}/send_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: "InOptics 2026 @ Extra Furniture Section Unlocked",
          to: email, html: parsedContent, company_name,
        }),
      });
      const mailData = await mailRes.json();
      if (mailRes.ok) toast.success("Furniture unlocked + mail sent");
      else            toast.error(mailData.message || "Mail failed");
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Something went wrong");
    }
    setIsSendingMail(false);
  };

  const toggleAccordion = (index, company) => {
    if (openIndex === index) { setOpenIndex(null); return; }
    setOpenIndex(index);
    setCurrentCompany(company.company_name);
    const key = company.company_name?.replace(/\s+/g, " ").trim().toLowerCase();
    const exhibitor = exhibitorMap[key] || {};
    setState(exhibitor.state || company.state || "");
    setFormData({
      company_name: company.company_name,
      name:     exhibitor.name || company.name || "",
      email:    exhibitor.email || company.email || "",
      mobile:   exhibitor.mobile || company.mobile || "",
      stall_no: exhibitor.stall_no || company.stall_no || "",
    });
    fetchSelectedFurniture(company.company_name);
  };

  useEffect(() => {
    Promise.all([
      fetchLockedCompanies(),
      fetchFurniture(),
      fetchEmailMessages(),
      fetchFurnitureVendor(),
      fetchExhibitors(),
    ]).catch((err) => console.error(err));
  }, []);

  /* ================= EXPORT ================= */

  const exportFurnitureExcel = () => {
    if (!companies.length) { toast.error("No data to export"); return; }
    const exportData = [];
    companies.forEach((company) => {
      const companyName = company.company_name;
      const list = furnitureCache[companyName] || [];
      const key  = companyName?.replace(/\s+/g, " ").trim().toLowerCase();
      const ex   = exhibitorMap[key] || {};
      const stateValue = (ex.state || "").toLowerCase();
      list.forEach((item) => {
        const qty = Number(item.quantity), price = Number(item.price);
        const amount = qty * price;
        let cgst = 0, sgst = 0, igst = 0;
        if (stateValue === "delhi") { cgst = amount * 0.09; sgst = amount * 0.09; }
        else                        { igst = amount * 0.18; }
        const total = amount + cgst + sgst + igst;
        exportData.push({
          "Company Name": companyName,
          "Stall No": ex?.stall_no || company?.stall_no || "N/A",
          "Furniture Name": item.name,
          Price: price, Quantity: qty, Amount: amount,
          "CGST (9%)": cgst, "SGST (9%)": sgst, "IGST (18%)": igst, Total: total,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extra Furniture");
    XLSX.writeFile(wb, "Extra_Furniture_Report.xlsx");
    toast.success("Excel exported");
  };

  const filteredCompanies = companies.filter((c) =>
    (c.company_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportFurnitureExcel}
            className="px-3 py-2 text-[14px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 transition-colors"
          >
            <MdFileDownload size={16} /> Export Excel
          </button>
          <button
            onClick={() => setShowExhibitorList(true)}
            className="px-3 py-2 text-[14px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center gap-1.5 transition-colors"
          >
            <MdAdd size={16} /> Add Furniture
          </button>
          <span className="px-2.5 py-1 text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
            {companies.length} companies
          </span>
        </div>
        <div className="relative w-full lg:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loadingCompanies ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-12 flex flex-col items-center gap-3 text-zinc-500">
          <MdRefresh size={28} className="animate-spin text-blue-500" />
          <p className="text-base">Loading...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 py-16 flex flex-col items-center gap-3 text-zinc-400">
          <MdChair size={42} className="text-zinc-200" />
          <p className="text-base">No companies found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCompanies.map((company, index) => {
            const isOpen   = openIndex === index;
            const key      = company.company_name?.replace(/\s+/g, " ").trim().toLowerCase();
            const stallNo  = exhibitorMap[key]?.stall_no || "N/A";
            const isUnlReq = unlockStatus[key]?.unlock_requested === 1;

            return (
              <div key={company.company_name} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  onClick={() => toggleAccordion(index, company)}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span className="font-semibold text-zinc-800 text-[15px] truncate">
                      {company.company_name}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded shrink-0">
                      Stall {stallNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdminUnlock(company.company_name); }}
                      className={`px-2.5 py-1 text-[12px] font-semibold rounded flex items-center gap-1 transition-colors ${
                        isUnlReq
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                          : "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                      }`}
                    >
                      <MdLockOpen size={13} />
                      {isUnlReq ? "Unlock Requested" : "Unlock"}
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
                    {/* Action bar */}
                    <div className="px-4 sm:px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowFurnitureList(true)}
                        className="px-3 py-1.5 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 transition-colors"
                      >
                        <MdAdd size={14} /> Add Furniture
                      </button>
                      <button
                        onClick={updateSelectedFurniture}
                        className="px-3 py-1.5 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 transition-colors"
                      >
                        <MdCheckCircle size={14} /> Update
                      </button>
                      <button
                        onClick={() => handleSendFurnitureMail("InOptics 2026 @ Extra Furniture Request Confirmation")}
                        disabled={isSendingMail}
                        className="px-3 py-1.5 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        <MdEmail size={14} /> {isSendingMail ? "Sending..." : "Send Mail"}
                      </button>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden xl:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {["#", "Name", "Stall", "Price", "Qty", "Amount", "CGST", "SGST", "IGST", "Total", "Action"].map((h) => (
                              <th key={h} className="px-3 py-2.5 text-left text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFurniture.length === 0 ? (
                            <tr>
                              <td colSpan="11" className="px-3 py-8 text-center text-[14px] text-zinc-400">
                                No furniture added. Click "Add Furniture" to start.
                              </td>
                            </tr>
                          ) : (
                            selectedFurniture.map((item, i) => {
                              const qty   = Number(item.quantity);
                              const price = Number(item.price);
                              const amount  = price * qty;
                              const isDelhi = state?.toLowerCase() === "delhi";
                              const cgst = isDelhi ? amount * 0.09 : 0;
                              const sgst = isDelhi ? amount * 0.09 : 0;
                              const igst = !isDelhi ? amount * 0.18 : 0;
                              const total = amount + cgst + sgst + igst;
                              return (
                                <tr key={i} className="hover:bg-zinc-50 border-b border-zinc-50">
                                  <td className="px-3 py-3 text-[12px] text-zinc-400 font-mono">{i + 1}</td>
                                  <td className="px-3 py-3 text-[14px] font-semibold text-zinc-800">{item.name}</td>
                                  <td className="px-3 py-3 text-[13px] text-zinc-600">{formData.stall_no || "—"}</td>
                                  <td className="px-3 py-3 text-[14px] text-zinc-700">₹{price.toFixed(2)}</td>
                                  <td className="px-3 py-3">
                                    <div className="inline-flex items-center gap-1 bg-zinc-100 rounded">
                                      <button
                                        onClick={() => changeQty(i, "dec")}
                                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded"
                                      >
                                        <MdRemove size={14} />
                                      </button>
                                      <span className="text-[13px] font-bold text-zinc-800 min-w-5 text-center">{qty}</span>
                                      <button
                                        onClick={() => changeQty(i, "inc")}
                                        className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded"
                                      >
                                        <MdAdd size={14} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-[14px] text-zinc-700">₹{amount.toFixed(2)}</td>
                                  <td className="px-3 py-3 text-[14px] text-zinc-700">{cgst ? `₹${cgst.toFixed(2)}` : "-"}</td>
                                  <td className="px-3 py-3 text-[14px] text-zinc-700">{sgst ? `₹${sgst.toFixed(2)}` : "-"}</td>
                                  <td className="px-3 py-3 text-[14px] text-zinc-700">{igst ? `₹${igst.toFixed(2)}` : "-"}</td>
                                  <td className="px-3 py-3 text-[14px] font-semibold text-blue-700">₹{total.toFixed(2)}</td>
                                  <td className="px-3 py-3">
                                    <button
                                      onClick={() => deleteFurniture(i)}
                                      className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                                    >
                                      <MdDelete size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/tablet cards */}
                    <div className="xl:hidden divide-y divide-zinc-100">
                      {selectedFurniture.length === 0 ? (
                        <p className="p-8 text-center text-[14px] text-zinc-400">
                          No furniture added.
                        </p>
                      ) : (
                        selectedFurniture.map((item, i) => {
                          const qty   = Number(item.quantity);
                          const price = Number(item.price);
                          const amount  = price * qty;
                          const isDelhi = state?.toLowerCase() === "delhi";
                          const cgst = isDelhi ? amount * 0.09 : 0;
                          const sgst = isDelhi ? amount * 0.09 : 0;
                          const igst = !isDelhi ? amount * 0.18 : 0;
                          const total = amount + cgst + sgst + igst;
                          return (
                            <div key={i} className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                                  <p className="font-semibold text-[14px] text-zinc-800">{item.name}</p>
                                  <p className="text-[12px] text-zinc-500">₹{price.toFixed(2)} per unit</p>
                                </div>
                                <button
                                  onClick={() => deleteFurniture(i)}
                                  className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded shrink-0"
                                >
                                  <MdDelete size={14} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-1 bg-zinc-100 rounded">
                                  <button
                                    onClick={() => changeQty(i, "dec")}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded"
                                  >
                                    <MdRemove size={14} />
                                  </button>
                                  <span className="text-[14px] font-bold text-zinc-800 min-w-6 text-center">{qty}</span>
                                  <button
                                    onClick={() => changeQty(i, "inc")}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded"
                                  >
                                    <MdAdd size={14} />
                                  </button>
                                </div>
                                <span className="text-[15px] font-bold text-blue-700">₹{total.toFixed(2)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                                <div><span className="text-zinc-400">Amount: </span><b className="text-zinc-700">₹{amount.toFixed(2)}</b></div>
                                <div><span className="text-zinc-400">CGST: </span><b className="text-zinc-700">{cgst ? `₹${cgst.toFixed(2)}` : "-"}</b></div>
                                <div><span className="text-zinc-400">SGST: </span><b className="text-zinc-700">{sgst ? `₹${sgst.toFixed(2)}` : "-"}</b></div>
                                <div><span className="text-zinc-400">IGST: </span><b className="text-zinc-700">{igst ? `₹${igst.toFixed(2)}` : "-"}</b></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============= FURNITURE CATALOG MODAL ============= */}
      {showFurnitureList && (
        <ModalShell
          title="Furniture Catalog"
          subtitle={`${furniture.length} items available`}
          onClose={() => setShowFurnitureList(false)}
          wide
          footer={
            <>
              <BtnGhost onClick={() => setShowFurnitureList(false)}>Close</BtnGhost>
              <BtnPrimary onClick={updateSelectedFurniture}>Save Furniture</BtnPrimary>
            </>
          }
        >
          {loadingFurniture ? (
            <div className="py-12 flex flex-col items-center gap-3 text-zinc-500">
              <MdRefresh size={28} className="animate-spin text-blue-500" />
              <p className="text-base">Loading furniture...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {furniture.map((item) => {
                const alreadyAdded = selectedFurniture.some((f) => f.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded overflow-hidden flex flex-col transition-all ${
                      alreadyAdded ? "border-emerald-300 ring-1 ring-emerald-200" : "border-zinc-200 hover:shadow-md"
                    }`}
                  >
                    <div className="relative aspect-square bg-zinc-50 flex items-center justify-center">
                      <img
                        src={`${API}/uploads/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 hidden items-center justify-center text-3xl text-zinc-300"
                      >
                        <MdChair size={36} />
                      </div>
                      {alreadyAdded && (
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded flex items-center gap-1">
                          <MdCheckCircle size={11} /> Added
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col">
                      <p className="text-[13px] font-semibold text-zinc-800 truncate">{item.name}</p>
                      <p className="text-[14px] font-bold text-blue-700 mt-0.5">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                      <button
                        onClick={() => !alreadyAdded && addFurniture(item)}
                        disabled={alreadyAdded}
                        className={`mt-2 w-full px-2 py-1.5 text-[12px] font-semibold rounded transition-colors ${
                          alreadyAdded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {alreadyAdded ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ModalShell>
      )}

      {/* ============= EXHIBITOR LIST MODAL ============= */}
      {showExhibitorList && (
        <ModalShell
          title="Select Exhibitor"
          wide
          onClose={() => setShowExhibitorList(false)}
          footer={<BtnGhost onClick={() => setShowExhibitorList(false)}>Close</BtnGhost>}
        >
          <div className="relative mb-3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search exhibitor..."
              value={exhibitorSearch}
              onChange={(e) => setExhibitorSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto border border-zinc-100 rounded divide-y divide-zinc-100">
            {exhibitorData
              .filter((ex) => ex.company_name?.toLowerCase().includes(exhibitorSearch.toLowerCase()))
              .map((ex, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-zinc-50">
                  <span className="text-[14px] text-zinc-800 truncate">{ex.company_name}</span>
                  <button
                    onClick={() => {
                      setShowExhibitorList(false);
                      setCurrentCompany(ex.company_name);
                      setFormData({
                        company_name: ex.company_name,
                        name: ex.name || "",
                        email: ex.email || "",
                        mobile: ex.mobile || "",
                        stall_no: ex.stall_no || "",
                      });
                      setState(ex.state || "");
                      setSelectedFurniture([]);
                      setShowFurnitureList(true);
                    }}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))}
          </div>
        </ModalShell>
      )}
    </div>
  );
};

/* ================= REUSABLE BITS ================= */

function ModalShell({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-5xl" : "max-w-md"} max-h-[92vh] flex flex-col overflow-hidden`}>
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="text-[15px] font-bold text-zinc-800 truncate">{title}</h3>
            {subtitle && <p className="text-[12px] text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-zinc-100 flex justify-end gap-2 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

function BtnGhost({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[14px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors"
    >
      {children}
    </button>
  );
}

function BtnPrimary({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[14px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
    >
      {children}
    </button>
  );
}

export default ExtraFurniture;
