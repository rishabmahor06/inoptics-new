import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import {
  MdSearch, MdFileDownload, MdPrint, MdAdd, MdClose,
  MdExpandMore, MdEdit, MdDelete, MdEmail, MdLock, MdLockOpen,
  MdCheckCircle,
} from "react-icons/md";

const API = "https://inoptics.in/api";

const ExhibitorPower = ({ exhibitorData = [] }) => {
  const [rows, setRows]                   = useState([]);
  const [companies, setCompanies]         = useState([]);
  const [openCompany, setOpenCompany]     = useState(null);
  const [loading, setLoading]             = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow]       = useState(null);

  const [powerPaymentSummary, setPowerPaymentSummary] = useState({});

  const [showExhibitorList, setShowExhibitorList]   = useState(false);
  const [showAddPowerModal, setShowAddPowerModal]   = useState(false);

  const [unlockStatus, setUnlockStatus]   = useState({});
  const [exhibitorSearch, setExhibitorSearch] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData]     = useState(null);
  const [paymentType, setPaymentType]     = useState("");
  const [paymentRemark, setPaymentRemark] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState({});
  const [paymentsMap, setPaymentsMap]     = useState({});

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchAllPower();
    fetchPayments();
  }, []);

  useEffect(() => {
    const summary = {};
    rows.forEach((row) => {
      const company = row.company_name?.trim();
      const amount  = Number(row.total_amount || 0);
      const state   = (row.state || "").toLowerCase();
      let cgst = 0, sgst = 0, igst = 0;
      if (state === "delhi") { cgst = amount * 0.09; sgst = amount * 0.09; }
      else if (state)        { igst = amount * 0.18; }
      const total = amount + cgst + sgst + igst;
      if (!summary[company]) {
        summary[company] = { amount: 0, cgst: 0, sgst: 0, igst: 0, total: 0, cleared: 0, pending: 0 };
      }
      summary[company].amount += amount;
      summary[company].cgst   += cgst;
      summary[company].sgst   += sgst;
      summary[company].igst   += igst;
      summary[company].total  += total;
    });
    setPowerPaymentSummary(summary);
  }, [rows]);

  const fetchAllPower = async () => {
    setLoading(true);
    try {
      const res    = await fetch(`${API}/get_all_power_requirement.php`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);
        const uniqueCompanies = [
          ...new Set(result.data.filter((i) => i.company_name).map((i) => i.company_name?.trim())),
        ];
        setCompanies(uniqueCompanies.sort((a, b) => a.localeCompare(b)));

        const requestMap = {};
        result.data.forEach((row) => {
          const company = row.company_name?.trim();
          if (!company) return;
          if (!requestMap[company]) requestMap[company] = { unlockRequested: false };
          if (row.unlock_requested == 1) requestMap[company].unlockRequested = true;
        });
        setUnlockStatus(requestMap);
      } else {
        toast.error("No data found");
      }
    } catch {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const fetchPayments = async () => {
    try {
      const res  = await fetch(`${API}/fetch_receive_power_payments.php`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const map = {};
        data.data.forEach((item) => {
          const company = item.company_name?.trim().toLowerCase();
          if (!map[company] || item.id > map[company].id) {
            map[company] = {
              id: item.id,
              totalPaid: Number(item.received_payment || 0),
              lastPaymentType: item.payment_type || "",
              remark: item.payment_remark || "",
            };
          }
        });
        setPaymentsMap(map);
      }
    } catch (err) {
      console.error("Payment fetch error:", err);
    }
  };

  /* ================= GROUPED ================= */

  const groupedData = rows.reduce((acc, row) => {
    const name = row.company_name?.trim();
    if (!name) return acc;
    if (!acc[name]) acc[name] = [];
    acc[name].push(row);
    return acc;
  }, {});

  /* ================= ACTIONS ================= */

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this entry?")) return;
    const res = await fetch(`${API}/delete_power_by_id.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: row.company_name, id: row.id }),
    });
    const result = await res.json();
    if (result.success) { toast.success("Deleted successfully"); fetchAllPower(); }
    else                { toast.error(result.error); }
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        company_name: editingRow.company_name,
        entries: [{
          day: editingRow.day,
          price_per_kw: editingRow.price_per_kw,
          power_required: editingRow.power_required,
          phase: editingRow.phase,
        }],
      };
      const res  = await fetch(`${API}/update_power_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { toast.success("Updated successfully"); setShowEditModal(false); fetchAllPower(); }
      else              { toast.error(data.error || "Update failed"); }
    } catch { toast.error("Server error"); }
  };

  const handleSendPowerMail = async (row) => {
    const toastId = toast.loading("Sending power update mails...");
    try {
      await fetch(`${API}/send_power_revised_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: row.company_name,
          template_name: "POWER LOAD INCREASED",
          email: row.email,
        }),
      });
      await fetch(`${API}/send_power_vendor_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: "Revised Power Load Vendor",
          company_name: row.company_name,
        }),
      });
      toast.dismiss(toastId);
      toast.success("Power update mails sent successfully");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to send mail");
    }
  };

  const handleUnlockPowerRequirement = async (companyName) => {
    if (!companyName) { toast.error("Company name missing!"); return; }
    try {
      const res  = await fetch(`${API}/update_unlock_power_requirement.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { toast.error(data.message || "Failed to unlock panel"); return; }
      setUnlockStatus((prev) => ({
        ...prev,
        [companyName]: { ...(prev[companyName] || {}), unlockRequested: false },
      }));
      toast.success("Power Requirement unlocked successfully");
      try {
        await fetch(`${API}/send_power_unlocked_mail.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: companyName,
            template_name: "InOptics 2026 @ Successfully Unlocked Power Requirement",
          }),
        });
      } catch (mailErr) {
        console.error("Mail failed:", mailErr);
      }
      fetchAllPower();
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Unlock failed");
    }
  };

  const handleAddPower = async () => {
    try {
      if (!editingRow?.company_name) { toast.error("Company name missing"); return; }
      const entries = [];
      const price = 4000;
      if (editingRow.setup_power > 0) {
        entries.push({
          company_name: editingRow.company_name.trim(),
          day: "Setup Days",
          price_per_kw: price,
          power_required: Number(editingRow.setup_power),
          phase: editingRow.setup_phase === "Three" ? "Three Phase" : "Single Phase",
          total_amount: Number(editingRow.setup_power) * price,
          is_locked: 0,
        });
      }
      if (editingRow.exhibition_power > 0) {
        entries.push({
          company_name: editingRow.company_name.trim(),
          day: "Exhibition Days",
          price_per_kw: price,
          power_required: Number(editingRow.exhibition_power),
          phase: editingRow.exhibition_phase === "Three" ? "Three Phase" : "Single Phase",
          total_amount: Number(editingRow.exhibition_power) * price,
          is_locked: 0,
        });
      }
      if (entries.length === 0) { toast.error("Enter at least one power"); return; }
      const res  = await fetch(`${API}/add_Exhibitor_power_requirement_Extra_Component.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const text = await res.text();
      let data = {};
      if (text) data = JSON.parse(text);
      if (res.ok) {
        toast.success("Power added successfully");
        setShowAddPowerModal(false);
        setEditingRow(null);
        fetchAllPower();
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Add power error:", error);
      toast.error("Server error");
    }
  };

  const handleSubmitPayment = async () => {
    try {
      if (!paymentType) { toast.error("Select payment method"); return; }
      if (!paymentAmount || paymentAmount <= 0) { toast.error("Enter valid amount"); return; }
      const payload = {
        company_name: paymentData.company_name,
        stall_no: exhibitorData?.find(
          (ex) => ex.company_name?.toLowerCase() === paymentData.company_name.toLowerCase(),
        )?.stall_no || "",
        total: paymentData.total,
        grand_total: paymentData.grand_total,
        received_payment: Number(paymentAmount),
        payment_type: paymentType,
        payment_remark: paymentRemark || null,
      };
      const isUpdate = paymentStatus[paymentData.company_name];
      const url      = isUpdate ? `${API}/update_receive_power_payments.php` : `${API}/create_receive_power_payments.php`;
      const bodyData = isUpdate ? { entries: [{ ...payload, id: isUpdate }] } : { entries: [payload] };
      const res  = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      const success = data?.result?.[0]?.status === "success";
      if (success) {
        toast.success(isUpdate ? "Payment Updated" : "Payment Added");
        fetchPayments();
        setPaymentStatus((prev) => ({ ...prev, [paymentData.company_name]: data.result[0].id }));
        setShowPaymentModal(false);
      } else {
        toast.error(data?.result?.[0]?.error || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const openPaymentModal = (company) => {
    const companyKey = company.toLowerCase();
    const payment    = paymentsMap[companyKey];
    const summary    = powerPaymentSummary[company];
    setPaymentData({
      company_name: company,
      total: summary?.amount || 0,
      grand_total: summary?.total || 0,
    });
    if (payment) {
      setPaymentType(payment.lastPaymentType || "");
      setPaymentAmount(payment.totalPaid || "");
      setPaymentRemark(payment.remark || "");
      setPaymentStatus((prev) => ({ ...prev, [company]: payment.id }));
    } else {
      setPaymentType("");
      setPaymentAmount("");
      setPaymentRemark("");
      setPaymentStatus((prev) => ({ ...prev, [company]: null }));
    }
    setShowPaymentModal(true);
  };

  /* ================= HELPERS ================= */

  const formatToIST = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  /* ================= PRINT ================= */

  const handlePrintAll = () => {
    if (rows.length === 0) { toast.error("No data available"); return; }
    let html = `<html><head><title>Power Requirement - All</title><style>
body{font-family:Arial;padding:20px;}h2{text-align:center;}
.company-block{position:relative;page-break-after:always;min-height:100vh;}
.company-block:last-child{page-break-after:auto;}
.duplicate{width:100%;}
.duplicate:first-child{position:absolute;top:0;}
.duplicate:last-child{position:absolute;top:52%;}
h3{margin-top:20px;}table{width:100%;border-collapse:collapse;margin-top:10px;}
th,td{border:1px solid #000;padding:6px;text-align:center;font-size:12px;}th{background:#f2f2f2;}
</style></head><body><h2>Power Requirement</h2>`;
    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];
      if (!companyRows.length) return;
      const exhibitor = exhibitorData?.find(
        (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
      );
      const stallNo = exhibitor?.stall_no || "N/A";
      const generateTable = () => {
        let table = `<h3>${company} (Stall No: ${stallNo})</h3>
<table><thead><tr><th>ID</th><th>Day</th><th>Price/KW</th><th>Power</th><th>Phase</th><th>Amount</th><th>SGST</th><th>CGST</th><th>IGST</th><th>Grand Total</th></tr></thead><tbody>`;
        let totalAmount = 0, totalSGST = 0, totalCGST = 0, totalIGST = 0, grandTotal = 0;
        companyRows.forEach((row, i) => {
          const amount = Number(row.total_amount || 0);
          const state  = (row.state || "").toLowerCase();
          let sgst = 0, cgst = 0, igst = 0;
          if (state === "delhi") { sgst = amount * 0.09; cgst = amount * 0.09; }
          else if (state)        { igst = amount * 0.18; }
          const total = amount + sgst + cgst + igst;
          totalAmount += amount; totalSGST += sgst; totalCGST += cgst; totalIGST += igst; grandTotal += total;
          table += `<tr><td>${i + 1}</td><td>${row.day}</td><td>${row.price_per_kw}</td><td>${row.power_required}</td><td>${row.phase}</td><td>${amount.toFixed(2)}</td><td>${sgst.toFixed(2)}</td><td>${cgst.toFixed(2)}</td><td>${igst.toFixed(2)}</td><td>${total.toFixed(2)}</td></tr>`;
        });
        table += `<tr style="font-weight:bold;background:#eaeaea;"><td colspan="5">TOTAL</td><td>${totalAmount.toFixed(2)}</td><td>${totalSGST.toFixed(2)}</td><td>${totalCGST.toFixed(2)}</td><td>${totalIGST.toFixed(2)}</td><td>${grandTotal.toFixed(2)}</td></tr></tbody></table>`;
        return table;
      };
      html += `<div class="company-block"><div class="duplicate">${generateTable()}</div><div class="duplicate">${generateTable()}</div></div>`;
    });
    html += `</body></html>`;
    const w = window.open("", "", "width=1000,height=700");
    w.document.write(html); w.document.close(); w.print();
  };

  const handlePrint = (company) => {
    const companyRows = groupedData[company] || [];
    const exhibitor   = exhibitorData?.find(
      (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
    );
    const stallNo     = exhibitor?.stall_no || "N/A";
    const generateTable = () => {
      let rowsHTML = "";
      let totalAmount = 0, totalSGST = 0, totalCGST = 0, totalIGST = 0, grandTotal = 0;
      companyRows.forEach((row, i) => {
        const amount = Number(row.total_amount || 0);
        const state  = (row.state || "").toLowerCase();
        let sgst = 0, cgst = 0, igst = 0;
        if (state === "delhi") { sgst = amount * 0.09; cgst = amount * 0.09; }
        else if (state)        { igst = amount * 0.18; }
        const total = amount + sgst + cgst + igst;
        totalAmount += amount; totalSGST += sgst; totalCGST += cgst; totalIGST += igst; grandTotal += total;
        rowsHTML += `<tr><td>${i + 1}</td><td>${row.day}</td><td>${row.price_per_kw}</td><td>${row.power_required}</td><td>${row.phase}</td><td>${amount.toFixed(2)}</td><td>${sgst.toFixed(2)}</td><td>${cgst.toFixed(2)}</td><td>${igst.toFixed(2)}</td><td>${total.toFixed(2)}</td></tr>`;
      });
      rowsHTML += `<tr style="font-weight:bold;background:#eaeaea;"><td colspan="5">TOTAL</td><td>${totalAmount.toFixed(2)}</td><td>${totalSGST.toFixed(2)}</td><td>${totalCGST.toFixed(2)}</td><td>${totalIGST.toFixed(2)}</td><td>${grandTotal.toFixed(2)}</td></tr>`;
      return `<div class="half-page"><h2>Power Requirement</h2><h3>${company} (Stall No: ${stallNo})</h3>
<table><thead><tr><th>ID</th><th>Day</th><th>Price/KW</th><th>Power</th><th>Phase</th><th>Amount</th><th>SGST</th><th>CGST</th><th>IGST</th><th>Grand Total</th></tr></thead><tbody>${rowsHTML}</tbody></table></div>`;
    };
    const html = `<html><head><title>Print</title><style>
body{font-family:Arial;margin:0;padding:0;}
.half-page{height:50vh;padding:20px;box-sizing:border-box;border-bottom:2px dashed #000;}
h2{text-align:center;margin:5px 0;}h3{margin:5px 0 10px;}
table{width:100%;border-collapse:collapse;font-size:12px;}
th,td{border:1px solid #000;padding:6px;text-align:center;}th{background:#f2f2f2;}
@media print{body{margin:0;}}</style></head><body>${generateTable()}${generateTable()}</body></html>`;
    const w = window.open("", "", "width=900,height=650");
    w.document.write(html); w.document.close(); w.print();
  };

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {
    const previousIds = JSON.parse(localStorage.getItem("lastExportIds") || "[]");
    const currentIds  = [];
    const wb = XLSX.utils.book_new();
    const sheetData = [];
    sheetData.push([
      "ID", "Stall No", "Company Name", "Address", "City", "State", "Pin",
      "Setup Days", "Exhibition Days", "Setup Load", "Exhibition Load",
      "Setup Phase", "Exhibition Phase", "Total", "IGST", "CGST", "SGST",
      "Grand Total", "Email", "GST", "Date/Time", "IS_NEW",
    ]);
    let companyId = 1;
    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];
      if (!companyRows.length) return;
      const exhibitor = exhibitorData?.find(
        (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
      );
      const stallNo    = exhibitor?.stall_no || "N/A";
      const address    = exhibitor?.address || "";
      const city       = exhibitor?.city || "";
      const state      = exhibitor?.state || "";
      const gst        = exhibitor?.gst || "";
      const email      = exhibitor?.email || "";
      const pin        = exhibitor?.pin || "";
      const created_at = formatToIST(companyRows[companyRows.length - 1]?.created_at);
      let setupDays = 0, exhibDays = 0, setupLoad = 0, exhibLoad = 0,
          total = 0, igst = 0, cgst = 0, sgst = 0;
      let setupPhase = "", exhibPhase = "";
      companyRows.forEach((row) => {
        currentIds.push(row.id);
        const amount = Number(row.total_amount || 0);
        const st     = (row.state || "").toLowerCase();
        if (row.day?.toLowerCase().includes("setup")) {
          setupDays += amount;
          setupLoad += Number(row.power_required || 0);
          setupPhase = row.phase;
        } else {
          exhibDays += amount;
          exhibLoad += Number(row.power_required || 0);
          exhibPhase = row.phase;
        }
        total += amount;
        if (st === "delhi") { sgst += amount * 0.09; cgst += amount * 0.09; }
        else if (st)        { igst += amount * 0.18; }
      });
      const newRows    = companyRows.filter((r) => !previousIds.includes(r.id));
      const isNew      = newRows.length > 0;
      const grandTotal = total + igst + cgst + sgst;
      sheetData.push([
        companyId, stallNo, company, address, city, state, pin,
        setupDays, exhibDays, setupLoad, exhibLoad, setupPhase, exhibPhase,
        total, igst, cgst, sgst, grandTotal, email, gst, created_at, isNew,
      ]);
      companyId++;
    });
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    sheetData.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;
      const isNew = row[row.length - 1];
      if (isNew) {
        for (let c = 0; c < row.length - 1; c++) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = { fill: { patternType: "solid", fgColor: { rgb: "C6EFCE" } } };
        }
      }
    });
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = {
          ...(ws[cellRef].s || {}),
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
          },
        };
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, "Power Report");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const hasNewData = currentIds.some((id) => !previousIds.includes(id));
    if (hasNewData) localStorage.setItem("lastExportIds", JSON.stringify(currentIds));
    saveAs(blob, "Power_Report.xlsx");
  };

  /* ================= RENDER ================= */

  const filtered = companies.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="px-3 py-2 text-[15px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdFileDownload size={16} /> Export Excel
          </button>
          <button
            onClick={handlePrintAll}
            className="px-3 py-2 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdPrint size={16} /> Print All
          </button>
          <button
            onClick={() => setShowExhibitorList(true)}
            className="px-3 py-2 text-[15px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdAdd size={16} /> Add Power
          </button>
        </div>
        <div className="relative w-full lg:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-[16px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-zinc-200 py-10 text-center text-zinc-500 text-base">
          Loading...
        </div>
      )}

      {/* ACCORDION LIST */}
      <div className="space-y-2">
        {!loading && filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 py-16 text-center text-zinc-400 text-base">
            No companies found
          </div>
        ) : (
          filtered.map((company) => {
            const isOpen      = openCompany === company;
            const companyRows = groupedData[company] || [];
            const exhibitor   = exhibitorData?.find(
              (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
            );
            const stallNo     = exhibitor?.stall_no || "N/A";
            const summary     = powerPaymentSummary[company];
            const isDelhi     = companyRows?.[0]?.state?.toLowerCase() === "delhi";
            const isPaid      = !!paymentsMap[company?.toLowerCase()];
            const isUnlockReq = !!unlockStatus?.[company]?.unlockRequested;

            return (
              <div key={company} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  onClick={() => setOpenCompany(isOpen ? null : company)}
                  className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                    <span className="font-semibold text-zinc-800 text-[16px] truncate max-w-full">{company}</span>
                    <span className="px-2 py-0.5 text-[16px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded shrink-0">
                      Stall {stallNo}
                    </span>
                    {isPaid && (
                      <span className="px-2 py-0.5 text-[16px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1 shrink-0">
                        <MdCheckCircle size={11} /> Paid
                      </span>
                    )}
                  </div>

                  {summary && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-zinc-500">
                      <span>Amt: <b className="text-zinc-800">₹{summary.amount.toFixed(2)}</b></span>
                      {isDelhi ? (
                        <>
                          <span>CGST: <b className="text-zinc-800">₹{summary.cgst.toFixed(2)}</b></span>
                          <span>SGST: <b className="text-zinc-800">₹{summary.sgst.toFixed(2)}</b></span>
                        </>
                      ) : (
                        <span>IGST: <b className="text-zinc-800">₹{summary.igst.toFixed(2)}</b></span>
                      )}
                      <span>Total: <b className="text-blue-700">₹{summary.total.toFixed(2)}</b></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrint(company); }}
                      className="px-2.5 py-1 text-[15px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition-colors"
                    >
                      <MdPrint size={13} /> Print
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUnlockReq) { toast.error("No unlock request found"); return; }
                        handleUnlockPowerRequirement(company);
                      }}
                      disabled={!isUnlockReq}
                      className={`px-2.5 py-1 text-[15px] font-semibold rounded flex items-center gap-1 transition-colors ${
                        isUnlockReq
                          ? "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                          : "text-zinc-500 bg-zinc-50 border border-zinc-200 cursor-not-allowed"
                      }`}
                    >
                      {isUnlockReq ? <MdLockOpen size={13} /> : <MdLock size={13} />}
                      {isUnlockReq ? "Unlock Req" : "Locked"}
                    </button>
                    <MdExpandMore
                      size={20}
                      className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Body */}
                {isOpen && (
                  <div className="border-t border-zinc-100">
                    {(() => {
                      const totals = { amount: 0, sgst: 0, cgst: 0, igst: 0, grand: 0 };
                      companyRows.forEach((row) => {
                        const amount = Number(row.total_amount || 0);
                        const st     = (row.state || "").trim().toLowerCase();
                        let sgst = 0, cgst = 0, igst = 0;
                        if (st === "delhi") { sgst = amount * 0.09; cgst = amount * 0.09; }
                        else if (st !== "") { igst = amount * 0.18; }
                        totals.amount += amount;
                        totals.sgst   += sgst;
                        totals.cgst   += cgst;
                        totals.igst   += igst;
                        totals.grand  += amount + sgst + cgst + igst;
                      });
                      const payment = paymentsMap[company?.toLowerCase()];

                      return (
                        <>
                          {/* Desktop table (xl breakpoint to fit 11 columns) */}
                          <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-zinc-50">
                                <tr>
                                  {["ID", "Day", "Price/KW", "Power", "Phase", "Amount", "SGST", "CGST", "IGST", "Grand Total", "Actions"].map((h) => (
                                    <th key={h} className="px-3 py-2.5 text-left text-[15px] font-semibold text-zinc-500 uppercase tracking-widest">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {companyRows.map((row, i) => {
                                  const amount = Number(row.total_amount || 0);
                                  const st     = (row.state || "").trim().toLowerCase();
                                  let sgst = 0, cgst = 0, igst = 0;
                                  if (st === "delhi") { sgst = amount * 0.09; cgst = amount * 0.09; }
                                  else if (st !== "") { igst = amount * 0.18; }
                                  const grand = amount + sgst + cgst + igst;
                                  return (
                                    <tr key={row.id} className="hover:bg-zinc-50 border-b border-zinc-50">
                                      <td className="px-3 py-3 text-[16px] text-zinc-400 font-mono">{i + 1}</td>
                                      <td className="px-3 py-3 text-[15px] font-semibold text-zinc-800">{row.day}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{row.price_per_kw}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{row.power_required}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{row.phase}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{amount.toFixed(2)}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{sgst.toFixed(2)}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{cgst.toFixed(2)}</td>
                                      <td className="px-3 py-3 text-[15px] text-zinc-700">{igst.toFixed(2)}</td>
                                      <td className="px-3 py-3 text-[15px] font-semibold text-blue-700">{grand.toFixed(2)}</td>
                                      <td className="px-3 py-3">
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={() => { setEditingRow(row); setShowEditModal(true); }}
                                            className="p-1.5 w-18 gap-1 text-center items-center justify-center flex text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                                            title="Edit"
                                          >
                                            <MdEdit size={13} /> Edit
                                          </button>
                                          <button
                                            onClick={() => handleDelete(row)}
                                            className="p-1.5  gap-1 text-center items-center justify-center flex text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                                            title="Delete"
                                          >
                                            <MdDelete size={13} />Delete
                                          </button>
                                          <button
                                            onClick={() => handleSendPowerMail(row)}
                                            className="p-1.5 gap-1 text-center items-center justify-center flex text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded"
                                            title="Send Mail"
                                          >
                                            <MdEmail size={13} /> Send Mail
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="bg-blue-50 font-bold">
                                  <td colSpan="5" className="px-3 py-3 text-[16px] text-zinc-700">
                                    {payment?.remark && (<><span className="font-semibold">Remark:</span> {payment.remark}</>)}
                                  </td>
                                  <td className="px-3 py-3 text-[15px] text-zinc-800">{totals.amount.toFixed(2)}</td>
                                  <td className="px-3 py-3 text-[15px] text-zinc-800">{totals.sgst.toFixed(2)}</td>
                                  <td className="px-3 py-3 text-[15px] text-zinc-800">{totals.cgst.toFixed(2)}</td>
                                  <td className="px-3 py-3 text-[15px] text-zinc-800">{totals.igst.toFixed(2)}</td>
                                  <td className="px-3 py-3 text-[15px] text-blue-700">{totals.grand.toFixed(2)}</td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                      {payment && (
                                        <span className="text-[16px] font-bold text-emerald-700">₹{payment.totalPaid}</span>
                                      )}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openPaymentModal(company); }}
                                        className="px-2.5 py-1 text-[15px] font-semibold text-white bg-[#18181B] hover:bg-[#303035] rounded"
                                      >
                                        {payment ? "Update" : "Add"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile/tablet card list */}
                          <div className="xl:hidden divide-y divide-zinc-100">
                            {companyRows.map((row, i) => {
                              const amount = Number(row.total_amount || 0);
                              const st     = (row.state || "").trim().toLowerCase();
                              let sgst = 0, cgst = 0, igst = 0;
                              if (st === "delhi") { sgst = amount * 0.09; cgst = amount * 0.09; }
                              else if (st !== "") { igst = amount * 0.18; }
                              const grand = amount + sgst + cgst + igst;
                              return (
                                <div key={row.id} className="p-4 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[16px] text-zinc-400 font-mono">#{i + 1}</p>
                                      <p className="font-semibold text-[15px] text-zinc-800">{row.day}</p>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                      <button
                                        onClick={() => { setEditingRow(row); setShowEditModal(true); }}
                                        className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md"
                                      >
                                        <MdEdit size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(row)}
                                        className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md"
                                      >
                                        <MdDelete size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleSendPowerMail(row)}
                                        className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md"
                                      >
                                        <MdEmail size={13} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[16px]">
                                    <div><span className="text-zinc-400">Price/KW: </span><b className="text-zinc-700">{row.price_per_kw}</b></div>
                                    <div><span className="text-zinc-400">Power: </span><b className="text-zinc-700">{row.power_required}</b></div>
                                    <div><span className="text-zinc-400">Phase: </span><b className="text-zinc-700">{row.phase}</b></div>
                                    <div><span className="text-zinc-400">Amount: </span><b className="text-zinc-700">{amount.toFixed(2)}</b></div>
                                    <div><span className="text-zinc-400">SGST: </span><b className="text-zinc-700">{sgst.toFixed(2)}</b></div>
                                    <div><span className="text-zinc-400">CGST: </span><b className="text-zinc-700">{cgst.toFixed(2)}</b></div>
                                    <div><span className="text-zinc-400">IGST: </span><b className="text-zinc-700">{igst.toFixed(2)}</b></div>
                                    <div className="col-span-2 sm:col-span-3 pt-1 border-t border-zinc-100 mt-1">
                                      <span className="text-zinc-400">Grand Total: </span>
                                      <b className="text-blue-700 text-[15px]">₹{grand.toFixed(2)}</b>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="p-4 bg-blue-50 space-y-2">
                              {payment?.remark && (
                                <p className="text-[16px] text-zinc-700"><b>Remark:</b> {payment.remark}</p>
                              )}
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[16px]">
                                <div><span className="text-zinc-500">Total Amount: </span><b>{totals.amount.toFixed(2)}</b></div>
                                <div><span className="text-zinc-500">SGST: </span><b>{totals.sgst.toFixed(2)}</b></div>
                                <div><span className="text-zinc-500">CGST: </span><b>{totals.cgst.toFixed(2)}</b></div>
                                <div><span className="text-zinc-500">IGST: </span><b>{totals.igst.toFixed(2)}</b></div>
                                <div className="col-span-2 pt-1 border-t border-blue-200">
                                  <span className="text-zinc-500">Grand Total: </span>
                                  <b className="text-blue-700 text-[16px]">₹{totals.grand.toFixed(2)}</b>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1">
                                {payment ? (
                                  <span className="text-[15px] font-bold text-emerald-700">Paid: ₹{payment.totalPaid}</span>
                                ) : <span />}
                                <button
                                  onClick={() => openPaymentModal(company)}
                                  className="px-3 py-1.5 text-[16px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                  {payment ? "Update Payment" : "Add Payment"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ============= EDIT MODAL ============= */}
      {showEditModal && editingRow && (
        <ModalShell
          title="Edit Power Requirement"
          onClose={() => setShowEditModal(false)}
          footer={
            <>
              <BtnGhost onClick={() => setShowEditModal(false)}>Cancel</BtnGhost>
              <BtnPrimary onClick={handleUpdate}>Update</BtnPrimary>
            </>
          }
        >
          <Field label="Day"><Input value={editingRow.day} readOnly /></Field>
          <Field label="Price Per KW"><Input type="number" value={editingRow.price_per_kw} readOnly /></Field>
          <Field label="Power Required">
            <Input
              type="number"
              value={editingRow.power_required}
              onChange={(e) => setEditingRow({ ...editingRow, power_required: e.target.value })}
            />
          </Field>
          <Field label="Phase">
            <div className="flex gap-3">
              <RadioOpt
                checked={editingRow.phase === "Single"}
                onChange={() => setEditingRow({ ...editingRow, phase: "Single" })}
                label="Single Phase"
              />
              <RadioOpt
                checked={editingRow.phase === "Three"}
                onChange={() => setEditingRow({ ...editingRow, phase: "Three" })}
                label="Three Phase"
              />
            </div>
          </Field>
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
              className="w-full h-10 pl-9 pr-3 text-[15px] border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto border border-zinc-100 rounded-lg divide-y divide-zinc-100">
            {exhibitorData
              .filter((ex) => ex.company_name?.toLowerCase().includes(exhibitorSearch.toLowerCase()))
              .map((ex, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-zinc-50">
                  <span className="text-[15px] text-zinc-800 truncate">{ex.company_name}</span>
                  <button
                    onClick={() => {
                      setShowExhibitorList(false);
                      setEditingRow({
                        company_name: ex.company_name,
                        day: "Setup Days",
                        price_per_kw: 4000,
                        power_required: "",
                        total_amount: 0,
                        phase: "Single",
                      });
                      setShowAddPowerModal(true);
                    }}
                    className="px-3 py-1 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))}
          </div>
        </ModalShell>
      )}

      {/* ============= ADD POWER MODAL ============= */}
      {showAddPowerModal && editingRow && (
        <ModalShell
          title="Add Power Requirement"
          wide
          onClose={() => setShowAddPowerModal(false)}
          footer={
            <>
              <BtnGhost onClick={() => setShowAddPowerModal(false)}>Cancel</BtnGhost>
              <BtnPrimary onClick={handleAddPower}>Add Power</BtnPrimary>
            </>
          }
        >
          <Field label="Company"><Input value={editingRow.company_name} readOnly /></Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="border border-zinc-200 rounded-xl p-4 space-y-2 bg-zinc-50">
              <h4 className="text-[15px] font-bold text-zinc-800">Setup Days</h4>
              <Field label="Price Per KW"><Input type="number" value={4000} readOnly /></Field>
              <Field label="Power Required (KW)">
                <Input
                  type="number"
                  value={editingRow.setup_power || ""}
                  onChange={(e) => {
                    const power = Number(e.target.value) || 0;
                    setEditingRow((p) => ({ ...p, setup_power: power, setup_price: 4000, setup_total: power * 4000 }));
                  }}
                />
              </Field>
              <Field label="Total"><Input type="number" value={editingRow.setup_total || 0} readOnly /></Field>
              <div className="flex gap-3">
                <RadioOpt
                  checked={editingRow.setup_phase === "Single"}
                  onChange={() => setEditingRow({ ...editingRow, setup_phase: "Single" })}
                  label="Single"
                />
                <RadioOpt
                  checked={editingRow.setup_phase === "Three"}
                  onChange={() => setEditingRow({ ...editingRow, setup_phase: "Three" })}
                  label="Three"
                />
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl p-4 space-y-2 bg-zinc-50">
              <h4 className="text-[15px] font-bold text-zinc-800">Exhibition Days</h4>
              <Field label="Price Per KW"><Input type="number" value={4000} readOnly /></Field>
              <Field label="Power Required (KW)">
                <Input
                  type="number"
                  value={editingRow.exhibition_power || ""}
                  onChange={(e) => {
                    const power = Number(e.target.value) || 0;
                    setEditingRow((p) => ({ ...p, exhibition_power: power, exhibition_price: 4000, exhibition_total: power * 4000 }));
                  }}
                />
              </Field>
              <Field label="Total"><Input type="number" value={editingRow.exhibition_total || 0} readOnly /></Field>
              <div className="flex gap-3">
                <RadioOpt
                  checked={editingRow.exhibition_phase === "Single"}
                  onChange={() => setEditingRow({ ...editingRow, exhibition_phase: "Single" })}
                  label="Single"
                />
                <RadioOpt
                  checked={editingRow.exhibition_phase === "Three"}
                  onChange={() => setEditingRow({ ...editingRow, exhibition_phase: "Three" })}
                  label="Three"
                />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ============= PAYMENT MODAL ============= */}
      {showPaymentModal && (
        <ModalShell
          title={`${paymentStatus[paymentData?.company_name] ? "Update" : "Add"} Payment — ${paymentData?.company_name}`}
          onClose={() => setShowPaymentModal(false)}
          footer={
            <>
              <BtnGhost onClick={() => setShowPaymentModal(false)}>Cancel</BtnGhost>
              <BtnPrimary onClick={handleSubmitPayment}>
                {paymentStatus[paymentData?.company_name] ? "Update" : "Submit"}
              </BtnPrimary>
            </>
          }
        >
          <Field label="Payment Method">
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 text-[15px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
            </select>
          </Field>
          <Field label="Amount">
            <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
          </Field>
          <Field label="Remark (Optional)">
            <textarea
              value={paymentRemark}
              onChange={(e) => setPaymentRemark(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-[15px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </Field>
        </ModalShell>
      )}
    </div>
  );
};

/* ================= REUSABLE BITS ================= */

function ModalShell({ title, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[92vh] flex flex-col overflow-hidden`}>
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h3 className="text-[16px] font-bold text-zinc-800 truncate pr-3">{title}</h3>
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
      <label className="block text-[15px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[15px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-zinc-50 read-only:text-zinc-500 ${className}`}
    />
  );
}

function RadioOpt({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-1.5 text-[15px] text-zinc-700 cursor-pointer">
      <input type="radio" checked={checked} onChange={onChange} className="accent-blue-600" />
      {label}
    </label>
  );
}

function BtnGhost({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[15px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function BtnPrimary({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

export default ExhibitorPower;
