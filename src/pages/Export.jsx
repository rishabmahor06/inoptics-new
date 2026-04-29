import React, { useEffect, useMemo, useState } from "react";
import {
  MdFileDownload, MdPrint, MdNavigateBefore, MdNavigateNext, MdLabel,
} from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

const API = "https://inoptics.in/api";

const FIELDS = {
  basic: [
    "Company Name", "Name", "Address", "City", "State", "Pincode",
    "Mobile No", "Telephone", "Email", "Secondary Email", "GST", "Password",
  ],
  stall: [
    "Company Name", "Stall Number", "Stall Category", "Stall Price", "Stall Area",
    "Total", "Discount(%)", "Discount Amount", "Total After Discount",
    "SGST(9%)", "CGST(9%)", "IGST(18%)", "Grand Total",
  ],
  all: [
    "Company Name", "Name", "Address", "City", "State", "Pincode",
    "Mobile No", "Telephone", "Email", "Secondary Email", "GST",
    "Stall Number", "Stall Category", "Stall Price", "Stall Area",
    "Total", "Discount(%)", "Discount Amount", "Total After Discount",
    "SGST(9%)", "CGST(9%)", "IGST(18%)", "Grand Total",
  ],
  stallPayment: [
    "Company Name", "State", "City", "Stall Number", "Bare/Shell",
    "Stall Category", "Stall Price", "Stall Area", "Total", "TDS",
    "Discount(%)", "Discount Amount", "Total After Discount",
    "SGST(9%)", "CGST(9%)", "IGST(18%)", "Grand Total",
    "Received Payment", "Pending Payment",
  ],
  powerPayment: [
    "Company Name", "State", "City", "Stall Number", "Stall Category", "Stall Area",
    "Exhibition Days", "Setup Days", "Price per KW", "Total Power", "Total Price",
    "SGST(9%)", "CGST(9%)", "IGST(18%)", "Grand Total",
    "Received Payment", "Pending Payment", "TDS",
  ],
};

const EXPORT_MAP = {
  basic:        { url: `${API}/fetch_excel_basic_details.php`,  file: "Exhibitors_Basic_Details.xlsx", sheet: "Exhibitors" },
  stall:        { url: `${API}/fetch_excel_stall_details.php`,  file: "Exhibitors_Stall_Details.xlsx", sheet: "Stalls" },
  all:          { url: `${API}/fetch_excel_all_details.php`,    file: "Exhibitors_All_Details.xlsx",   sheet: "AllDetails" },
  stallPayment: { url: `${API}/fetch_excel_stall_payment.php`,  file: "Exhibitors_Stall_Payment.xlsx", sheet: "StallPayment" },
  powerPayment: { url: `${API}/fetch_excel_power_payment.php`,  file: "Exhibitors_Power_Payment.xlsx", sheet: "PowerPayment" },
};

const EXPORT_TYPES = [
  { key: "basic",        label: "Export Basic Details" },
  { key: "stall",        label: "Export Stall Details" },
  { key: "all",          label: "Export All Details" },
  { key: "stallPayment", label: "Export Stall Payment" },
  { key: "powerPayment", label: "Export Power Payment" },
];

/* normalize a record to label-display fields */
const normalizeLabel = (row = {}) => ({
  name:         row.Name || row.name || row["Contact Person"] || "",
  company_name: row["Company Name"] || row.company_name || "",
  address:      row.Address || row.address || "",
  city:         row.City || row.city || "",
  state:        row.State || row.state || "",
  pincode:      row.Pincode || row.pincode || row.pin || "",
  mobile_no:    row["Mobile No"] || row.mobile || row.mobile_no || "",
});

export default function Export() {
  const [mode, setMode]                     = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading]               = useState(false);

  /* Label data only fetched once; reused for label preview/print */
  const [labelData, setLabelData]               = useState([]);
  const [labelLoading, setLabelLoading]         = useState(false);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);

  const fields = useMemo(() => FIELDS[mode] || [], [mode]);

  const handleSelect = (field) =>
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((x) => x !== field) : [...prev, field],
    );

  const selectAll = () =>
    setSelectedFields(selectedFields.length === fields.length ? [] : [...fields]);

  /* fetch label data lazily when basic mode is opened */
  useEffect(() => {
    if (mode !== "basic" || labelData.length || labelLoading) return;
    setLabelLoading(true);
    fetch(EXPORT_MAP.basic.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: FIELDS.basic }),
    })
      .then((r) => r.json())
      .then((parsed) => {
        const rows = parsed?.success && Array.isArray(parsed.data)
          ? parsed.data
          : Array.isArray(parsed) ? parsed : [];
        setLabelData(rows.map(normalizeLabel));
        setCurrentLabelIndex(0);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load label data");
      })
      .finally(() => setLabelLoading(false));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ============== EXPORT ============== */

  const handleExport = async () => {
    if (!mode) return toast.error("Select export type");
    if (!selectedFields.length) return toast.error("Select at least one field");
    try {
      setLoading(true);
      const config = EXPORT_MAP[mode];
      const res    = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: selectedFields }),
      });
      const text = await res.text();
      if (!text) throw new Error("Empty response from server");
      let parsed;
      try { parsed = JSON.parse(text); }
      catch { throw new Error("Server returned invalid JSON"); }

      let rows = [];
      if (parsed.success && Array.isArray(parsed.data)) rows = parsed.data;
      else if (Array.isArray(parsed))                   rows = parsed;
      else if (parsed.error)                            throw new Error(parsed.error);
      else                                              throw new Error("Unexpected API response");
      if (!rows.length) throw new Error("No data found");

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, config.sheet);
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        config.file,
      );
      toast.success("Export ready");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  /* ============== LABEL PRINT ============== */

  const handleLabelPrint = () => {
    if (!labelData.length) { toast.error("No labels to print"); return; }
    const html = `<html><head><title>Labels</title>
<style>
  @page { size: A4; margin: 8mm; }
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
  .label-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .label-box {
    width: 9.8cm; height: 3.5cm; padding: 0.4cm 0.6cm; box-sizing: border-box;
    border: 1px dashed #999; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    page-break-inside: avoid; font-size: 12px; line-height: 1.25;
  }
  .lbl-id { font-weight: bold; }
  .lbl-attn { color: #444; font-weight: 600; }
  .lbl-company { font-weight: bold; font-size: 13px; }
  .lbl-row { display: flex; justify-content: space-between; gap: 6px; }
  @media print { .label-box { border: none; } }
</style></head><body>
<div class="label-grid">
${labelData.map((d, i) => `
  <div class="label-box">
    <div><span class="lbl-id">(${String(i + 1).padStart(3, "0")})</span> <span class="lbl-attn">ATTN: ${escapeHtml(d.name)}</span></div>
    <div class="lbl-company">M/S ${escapeHtml(d.company_name)}</div>
    <div>${escapeHtml(d.address)}</div>
    <div class="lbl-row"><span>${escapeHtml(d.city)}</span><span>${escapeHtml(d.pincode)}</span></div>
    <div>${escapeHtml(d.state)}</div>
    <div>MOBILE: ${escapeHtml(d.mobile_no)}</div>
  </div>
`).join("")}
</div>
</body></html>`;
    const w = window.open("", "", "width=900,height=700");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const handlePrev = () => setCurrentLabelIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentLabelIndex((i) => Math.min(labelData.length - 1, i + 1));

  /* ============== RENDER ============== */

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">
      {/* header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded bg-zinc-100 flex items-center justify-center">
          <MdFileDownload className="text-zinc-700" size={22} />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-zinc-900">Export Reports</h2>
          <p className="text-[13px] text-zinc-500">Download exhibitor data in Excel format</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* LEFT — type buttons + label preview */}
        <div className="lg:col-span-1 space-y-3">
          {EXPORT_TYPES.map((item) => (
            <button
              key={item.key}
              onClick={() => { setMode(item.key); setSelectedFields([]); }}
              className={`w-full text-left px-4 py-2.5 rounded border text-[13px] font-semibold transition-colors ${
                mode === item.key
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Label preview only when basic mode */}
          {mode === "basic" && (
            <div className="bg-zinc-50 border border-zinc-200 rounded p-3 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MdLabel size={16} className="text-zinc-500" />
                <h4 className="text-[13px] font-bold text-zinc-800">Label Preview</h4>
              </div>

              {labelLoading ? (
                <p className="text-[13px] text-zinc-400 py-6 text-center">Loading label data...</p>
              ) : labelData.length === 0 ? (
                <p className="text-[13px] text-zinc-400 py-6 text-center">No labels found</p>
              ) : (
                <>
                  <LabelBox data={labelData[currentLabelIndex]} index={currentLabelIndex} />

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={currentLabelIndex === 0}
                      className="px-3 h-9 text-[12px] font-semibold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MdNavigateBefore size={16} /> Prev
                    </button>
                    <span className="text-[12px] text-zinc-500">
                      {currentLabelIndex + 1} / {labelData.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentLabelIndex >= labelData.length - 1}
                      className="px-3 h-9 text-[12px] font-semibold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <MdNavigateNext size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleLabelPrint}
                    className="w-full mt-3 px-3 h-10 text-[13px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center justify-center gap-1.5"
                  >
                    <MdPrint size={16} /> Print All Labels
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — fields */}
        <div className="lg:col-span-2">
          {!mode ? (
            <div className="h-full min-h-80 rounded border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <MdFileDownload size={46} />
              <p className="text-[13px]">Choose export type to continue</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-bold text-zinc-900">Select Fields to Export</h3>
                <button
                  onClick={selectAll}
                  className="text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  {selectedFields.length === fields.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Show ALL checkboxes — no scroll, responsive grid expands columns to fit */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {fields.map((field) => {
                  const checked = selectedFields.includes(field);
                  return (
                    <label
                      key={field}
                      className={`flex items-center gap-2 text-[13px] border rounded px-2.5 py-2 cursor-pointer transition-colors ${
                        checked
                          ? "bg-blue-50 border-blue-300"
                          : "border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleSelect(field)}
                        className="accent-blue-600 shrink-0"
                      />
                      <span className="truncate">{field}</span>
                    </label>
                  );
                })}
              </div>

              {/* Preview of selected order */}
              {selectedFields.length > 0 && (
                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded p-3">
                  <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Preview (Order of Columns)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
                    {selectedFields.map((field, i) => (
                      <div key={field} className="text-[12px] text-zinc-700">
                        <span className="font-semibold text-zinc-400">{i + 1}.</span> {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={loading}
                className="mt-5 w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded text-[14px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                <MdFileDownload size={16} />
                {loading ? "Exporting..." : "Export Excel"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============== sub-components ============== */

function LabelBox({ data, index }) {
  return (
    <div className="bg-white border border-zinc-300 rounded p-3 text-[12px] leading-snug" style={{ minHeight: "9rem" }}>
      <div className="font-bold text-zinc-800">
        ({String(index + 1).padStart(3, "0")}){" "}
        <span className="font-semibold text-zinc-600">ATTN: {data.name || "—"}</span>
      </div>
      <div className="font-bold text-zinc-900 mt-0.5">M/S {data.company_name || "—"}</div>
      <div className="text-zinc-700 mt-0.5 wrap-break-word">{data.address || "—"}</div>
      <div className="flex justify-between text-zinc-700">
        <span>{data.city || "—"}</span>
        <span>{data.pincode || ""}</span>
      </div>
      <div className="text-zinc-700">{data.state || "—"}</div>
      <div className="text-zinc-700 mt-1">MOBILE: {data.mobile_no || "—"}</div>
    </div>
  );
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
