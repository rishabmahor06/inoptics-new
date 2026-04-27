import React, { useMemo, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function Export() {
  const [mode, setMode] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const exportTypes = [
    { key: "basic", label: "Export Basic Details" },
    { key: "stall", label: "Export Stall Details" },
    { key: "all", label: "Export All Details" },
    { key: "stallPayment", label: "Export Stall Payment" },
    { key: "powerPayment", label: "Export Power Payment" },
  ];

  const fields = useMemo(() => {
    switch (mode) {
      case "basic":
        return [
          "Company Name",
          "Name",
          "Address",
          "City",
          "State",
          "Pincode",
          "Mobile No",
          "Telephone",
          "Email",
          "Secondary Email",
          "GST",
          "Password",
        ];

      case "stall":
        return [
          "Company Name",
          "Stall Number",
          "Stall Category",
          "Stall Price",
          "Stall Area",
          "Total",
          "Discount(%)",
          "Discount Amount",
          "Total After Discount",
          "SGST(9%)",
          "CGST(9%)",
          "IGST(18%)",
          "Grand Total",
        ];

      case "all":
        return [
          "Company Name",
          "Name",
          "Address",
          "City",
          "State",
          "Pincode",
          "Mobile No",
          "Telephone",
          "Email",
          "Secondary Email",
          "GST",
          "Stall Number",
          "Stall Category",
          "Stall Price",
          "Stall Area",
          "Total",
          "Discount(%)",
          "Discount Amount",
          "Total After Discount",
          "SGST(9%)",
          "CGST(9%)",
          "IGST(18%)",
          "Grand Total",
        ];

      case "stallPayment":
        return [
          "Company Name",
          "State",
          "City",
          "Stall Number",
          "Bare/Shell",
          "Stall Category",
          "Stall Price",
          "Stall Area",
          "Total",
          "TDS",
          "Discount(%)",
          "Discount Amount",
          "Total After Discount",
          "SGST(9%)",
          "CGST(9%)",
          "IGST(18%)",
          "Grand Total",
          "Received Payment",
          "Pending Payment",
        ];

      case "powerPayment":
        return [
          "Company Name",
          "State",
          "City",
          "Stall Number",
          "Stall Category",
          "Stall Area",
          "Exhibition Days",
          "Setup Days",
          "Price per KW",
          "Total Power",
          "Total Price",
          "SGST(9%)",
          "CGST(9%)",
          "IGST(18%)",
          "Grand Total",
          "Received Payment",
          "Pending Payment",
          "TDS",
        ];

      default:
        return [];
    }
  }, [mode]);

  const handleSelect = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((item) => item !== field)
        : [...prev, field]
    );
  };

  const selectAll = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(fields);
    }
  };

  const exportMap = {
    basic: {
      url: "https://inoptics.in/api/fetch_excel_basic_details.php",
      file: "Exhibitors_Basic_Details.xlsx",
      sheet: "Exhibitors",
    },
    stall: {
      url: "https://inoptics.in/api/fetch_excel_stall_details.php",
      file: "Exhibitors_Stall_Details.xlsx",
      sheet: "Stalls",
    },
    all: {
      url: "https://inoptics.in/api/fetch_excel_all_details.php",
      file: "Exhibitors_All_Details.xlsx",
      sheet: "AllDetails",
    },
    stallPayment: {
      url: "https://inoptics.in/api/fetch_excel_stall_payment.php",
      file: "Exhibitors_Stall_Payment.xlsx",
      sheet: "StallPayment",
    },
    powerPayment: {
      url: "https://inoptics.in/api/fetch_excel_power_payment.php",
      file: "Exhibitors_Power_Payment.xlsx",
      sheet: "PowerPayment",
    },
  };

  const handleExport = async () => {
  if (!mode) return toast.error("Select export type");
  if (!selectedFields.length) return toast.error("Select at least one field");

  try {
    setLoading(true);

    const config = exportMap[mode];

    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: selectedFields,
      }),
    });

    const rawText = await res.text();

    if (!rawText) {
      throw new Error("Empty response from server");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error("Invalid JSON:", rawText);
      throw new Error("Server returned invalid JSON");
    }

    let rows = [];

    // Case 1: {success:true,data:[...]}
    if (parsed.success && Array.isArray(parsed.data)) {
      rows = parsed.data;
    }
    // Case 2: direct array
    else if (Array.isArray(parsed)) {
      rows = parsed;
    }
    // Case 3: {error:"msg"}
    else if (parsed.error) {
      throw new Error(parsed.error);
    } else {
      throw new Error("Unexpected API response");
    }

    if (!rows.length) {
      throw new Error("No data found");
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, config.sheet);

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([wbout], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      config.file
    );
    toast.success("Export ready");
  } catch (error) {
    console.error("EXPORT ERROR:", error);
    toast.error(error.message || "Export failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center">
          <MdFileDownload className="text-zinc-700" size={24} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Export Reports</h2>
          <p className="text-sm text-zinc-500">
            Download exhibitor data in Excel format
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-3">
          {exportTypes.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setMode(item.key);
                setSelectedFields([]);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                mode === item.key
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div>
          {mode ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900">
                  Select Fields
                </h3>

                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 font-medium"
                >
                  {selectedFields.length === fields.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {fields.map((field) => (
                  <label
                    key={field}
                    className="flex items-center gap-2 text-sm border border-zinc-200 rounded-lg px-3 py-2 hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleSelect(field)}
                    />
                    <span>{field}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleExport}
                disabled={loading}
                className="mt-5 w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition disabled:opacity-60"
              >
                {loading ? "Exporting..." : "Export Excel"}
              </button>
            </>
          ) : (
            <div className="h-full min-h-[320px] rounded-2xl border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <MdFileDownload size={46} />
              <p className="text-sm">Choose export type to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}