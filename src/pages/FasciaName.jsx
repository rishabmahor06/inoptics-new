import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  MdSearch, MdFileDownload, MdPrint, MdClose,
  MdExpandMore, MdEdit, MdDelete,
} from "react-icons/md";

const FasciaName = () => {
  const [companies, setCompanies]         = useState([]);
  const [rows, setRows]                   = useState([]);
  const [openCompany, setOpenCompany]     = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData]           = useState(null);
  const [exhibitorData, setExhibitorData] = useState([]);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchAllFascia();
    fetchExhibitorData();
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const res  = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();
      setExhibitorData(data);
    } catch (error) {
      console.error("Failed to fetch exhibitors:", error);
    }
  };

  const exhibitorGrouped = Object.values(
    exhibitorData.reduce((acc, item) => {
      if (!acc[item.company_name]) {
        acc[item.company_name] = {
          company_name: item.company_name,
          category: [],
          stall_no: [],
        };
      }
      if (item.category) acc[item.company_name].category.push(item.category);
      if (item.stall_no) acc[item.company_name].stall_no.push(item.stall_no);
      return acc;
    }, {}),
  );

  const getStallWithBS = (company) => {
    if (!company) return "";
    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, " ").trim();
    const exhibitor = exhibitorGrouped.find(
      (e) => normalize(e.company_name) === normalize(company),
    );
    if (!exhibitor) return "";
    const values = [
      ...new Set(
        exhibitor.category.map((cat) => {
          const c = (cat || "").toLowerCase();
          if (c.includes("bare")) return "Bare";
          if (c.includes("shell")) return "Shell";
          return "";
        }),
      ),
    ].filter(Boolean);
    return values.join(", ");
  };

  const fetchAllFascia = async () => {
    try {
      const res  = await fetch("https://inoptics.in/api/get_all_fascia.php");
      const data = await res.json();
      if (data.success) {
        setRows(data.records);
        const uniqueCompanies = [
          ...new Set(data.records.map((i) => i.exhibitor_company_name)),
        ].sort((a, b) => a.localeCompare(b));
        setCompanies(uniqueCompanies);
      }
    } catch {
      toast.error("Failed to load fascia data");
    }
  };

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {
    if (!rows.length) { toast.error("No data to export"); return; }
    const exportData = rows.map((row, index) => ({
      ID: index + 1,
      "Stall No": row.stall_no,
      "Bare/Shell": getStallWithBS(row.exhibitor_company_name),
      "Company Name": row.exhibitor_company_name,
      "Fascia Name": row.facia_company_name,
      City: row.city,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fascia Data");
    XLSX.writeFile(workbook, "Fascia_Companies.xlsx");
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fascia?")) return;
    try {
      const res = await fetch("https://inoptics.in/api/delete_fascia.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deleted successfully");
        fetchAllFascia();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= EDIT ================= */

  const handleEditClick = (row) => { setEditData({ ...row }); setShowEditPopup(true); };

  const handleUpdate = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/update_fascia.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Updated successfully");
        setShowEditPopup(false);
        fetchAllFascia();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= GROUP DATA ================= */

  const groupedData = rows.reduce((acc, row) => {
    if (!acc[row.exhibitor_company_name]) acc[row.exhibitor_company_name] = [];
    acc[row.exhibitor_company_name].push(row);
    return acc;
  }, {});

  /* ================= PRINT ================= */

  const handlePrintAll = () => {
    let html = `
<html><head><title>Fascia Report</title>
<style>
body{font-family:Arial;padding:20px;}
h2{text-align:center;margin-bottom:40px;}
h3{margin-top:40px;}
table{width:100%;border-collapse:collapse;margin-top:10px;}
th,td{border:1px solid #000;padding:8px;text-align:center;}
th{background:#f2f2f2;}
</style></head><body><h2>Fascia Report</h2>`;
    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];
      html += `<h3>${company}</h3>
<table><thead><tr><th>ID</th><th>Fascia Name</th><th>Stall No</th><th>Bare/Shell</th><th>City</th></tr></thead><tbody>`;
      companyRows.forEach((row, i) => {
        html += `<tr><td>${i + 1}</td><td>${row.facia_company_name}</td><td>${row.stall_no}</td><td>${getStallWithBS(row.exhibitor_company_name)}</td><td>${row.city}</td></tr>`;
      });
      html += `</tbody></table>`;
    });
    html += `</body></html>`;
    const printWindow = window.open("", "", "width=1200,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintCompany = (company) => {
    const companyRows = groupedData[company] || [];
    let html = `
<html><head><title>Fascia Report</title>
<style>
body{font-family:Arial;padding:20px;}
h2{text-align:center;}
table{width:100%;border-collapse:collapse;margin-top:20px;}
th,td{border:1px solid #000;padding:8px;text-align:center;}
th{background:#f2f2f2;}
</style></head><body>
<h2>Fascia Report</h2><h3>${company}</h3>
<table><thead><tr><th>ID</th><th>Fascia Name</th><th>Stall No</th><th>Bare/Shell</th><th>City</th></tr></thead><tbody>`;
    companyRows.forEach((row, i) => {
      html += `<tr><td>${i + 1}</td><td>${row.facia_company_name}</td><td>${row.stall_no}</td><td>${getStallWithBS(row.exhibitor_company_name)}</td><td>${row.city}</td></tr>`;
    });
    html += `</tbody></table></body></html>`;
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  /* ================= FILTER ================= */

  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    if (company.toLowerCase().includes(term)) return true;
    return groupedData[company]?.some((row) =>
      row.facia_company_name?.toLowerCase().includes(term),
    );
  });

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* TOOLBAR */}
      <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToExcel}
            className="px-3 py-2 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdFileDownload size={16} /> Export Excel
          </button>
          <button
            onClick={handlePrintAll}
            className="px-3 py-2 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MdPrint size={16} /> Print All
          </button>
        </div>
        <div className="relative w-full sm:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search company or fascia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ACCORDION LIST */}
      <div className="space-y-2">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 py-16 text-center text-zinc-400 text-sm">
            No companies found
          </div>
        ) : (
          filteredCompanies.map((company) => {
            const isOpen      = openCompany === company;
            const companyRows = groupedData[company] || [];
            return (
              <div
                key={company}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div
                  onClick={() => setOpenCompany(isOpen ? null : company)}
                  className="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <span className="font-semibold text-zinc-800 text-[14px] truncate">
                      {company}
                    </span>
                    <span className="text-[11px] text-zinc-400 shrink-0 hidden sm:inline">
                      {companyRows.length} fascia
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrintCompany(company); }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <MdPrint size={13} /> Print
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
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-50">
                          <tr>
                            {["#", "Fascia Name", "Stall No", "Bare/Shell", "City", "Actions"].map((h) => (
                              <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {companyRows.map((row, i) => (
                            <tr key={row.id} className="hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0">
                              <td className="px-3 sm:px-4 py-3 text-[12px] text-zinc-400 font-mono">{i + 1}</td>
                              <td className="px-3 sm:px-4 py-3 text-[13px] font-semibold text-zinc-800">{row.facia_company_name}</td>
                              <td className="px-3 sm:px-4 py-3 text-[13px] text-zinc-700">{row.stall_no}</td>
                              <td className="px-3 sm:px-4 py-3 text-[13px] text-zinc-700">{getStallWithBS(row.exhibitor_company_name)}</td>
                              <td className="px-3 sm:px-4 py-3 text-[13px] text-zinc-700">{row.city}</td>
                              <td className="px-3 sm:px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleEditClick(row)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1 transition-colors"
                                  >
                                    <MdEdit size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(row.id)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1 transition-colors"
                                  >
                                    <MdDelete size={12} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-zinc-100">
                      {companyRows.map((row, i) => (
                        <div key={row.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-400 font-mono">#{i + 1}</p>
                              <p className="font-semibold text-[13px] text-zinc-800 wrap-break-word">
                                {row.facia_company_name}
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEditClick(row)}
                                className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center gap-1"
                              >
                                <MdEdit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="px-2 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1"
                              >
                                <MdDelete size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                            <div>
                              <span className="text-zinc-400">Stall: </span>
                              <span className="font-semibold text-zinc-700">{row.stall_no || "—"}</span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Type: </span>
                              <span className="font-semibold text-zinc-700">
                                {getStallWithBS(row.exhibitor_company_name) || "—"}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-zinc-400">City: </span>
                              <span className="text-zinc-700">{row.city || "—"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h3 className="text-[14px] font-bold text-zinc-800">Edit Fascia Name</h3>
              <button
                onClick={() => setShowEditPopup(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto">
              <Field
                label="Company Name"
                value={editData?.exhibitor_company_name || ""}
                disabled
              />
              <Field
                label="Stall No"
                value={editData?.stall_no || ""}
                disabled
              />
              <Field
                label="Fascia Name"
                value={editData?.facia_company_name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, facia_company_name: e.target.value })
                }
              />
              <Field
                label="City"
                value={editData?.city || ""}
                disabled
              />
            </div>
            <div className="px-5 py-3 border-t border-zinc-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowEditPopup(false)}
                className="px-4 py-2 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Field({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default FasciaName;
