import React, { useRef, useState } from "react";
import { MdClose, MdDownload, MdPrint, MdEmail } from "react-icons/md";
import toast from "react-hot-toast";
import RSDLogo from "../../assets/RSD_invoice_logo.png";

const BANKS = [
  { name: "Kotak Mahindra Bank", ac: "01992000000491", ifsc: "KKBK0004620", addr: "Defence Colony, New Delhi" },
  { name: "HDFC BANK",           ac: "99999811045088", ifsc: "HDFC0000578",  addr: "Delhi" },
  { name: "IndusInd Bank",       ac: "259811045088",   ifsc: "INDB0000169",  addr: "Karol Bagh, New Delhi" },
  { name: "Axis Bank",           ac: "0032144225",     ifsc: "UTIB0005109",  addr: "Delhi" },
];

const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

const fmt = (n) => Number(n || 0).toFixed(2);

const S = {
  cell:    { border: "1px solid #333", padding: "4px 6px", fontSize: 10.5, fontFamily: "Arial, sans-serif" },
  hdrCell: { border: "1px solid #333", padding: "4px 6px", fontSize: 10.5, fontWeight: 700, background: "#f0f0f0", textAlign: "center", fontFamily: "Arial, sans-serif" },
  right:   { textAlign: "right" },
  center:  { textAlign: "center" },
  bold:    { fontWeight: 700 },
};

export default function ProformaInvoiceModal({ open, onClose, section, ex, data }) {
  const templateRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const sectionTitle =
    section === "stall" ? "Stall Payment" :
    section === "power" ? "Power Requirement" :
    section === "badge" ? "Exhibitor Badges" : "";

  const isDelhi = String(ex?.state || "").trim().toLowerCase() === "delhi";

  const rows = data?.rows || [];
  const subTotal = data?.subTotal || 0;
  const discount = data?.discount || 0;
  const taxable  = subTotal - discount;
  const cgst = data?.cgst || 0;
  const sgst = data?.sgst || 0;
  const igst = data?.igst || 0;
  const grand = data?.grand || (taxable + cgst + sgst + igst);

  const piNo = `INOPD-2026 | ${(ex?.company_name || "EX").substring(0, 6).toUpperCase()} | ${section?.toUpperCase()} | 2025-26`;

  const handleDownload = async () => {
    const el = templateRef.current;
    if (!el) return;
    setBusy(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, scrollY: 0, backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 10;
      const imgH = (canvas.height / canvas.width) * imgW;
      if (imgH <= pageH - 10) {
        pdf.addImage(imgData, "PNG", 5, 5, imgW, imgH);
      } else {
        const pages = Math.ceil(imgH / (pageH - 10));
        for (let p = 0; p < pages; p++) {
          if (p > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 5, 5 - p * (pageH - 10), imgW, imgH);
        }
      }
      pdf.save(`Proforma_${ex?.company_name || "Exhibitor"}_${section}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    const el = templateRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Proforma Invoice</title>
      <style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;font-size:11px}</style>
    </head><body>${el.outerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  const handleSendEmail = async () => {
    if (!ex?.email) { toast.error("Exhibitor email missing"); return; }
    setSending(true);
    try {
      // Ensure the template has an id for the service to find
      if (templateRef.current) templateRef.current.id = "invoice-template";
      const { sendProformaInvoicePdfMail } = await import("../../services/mailService");
      await sendProformaInvoicePdfMail({
        elementId:    "invoice-template",
        section:      section === "power" ? "power" : "stall",
        company_name: ex.company_name,
        to_email:     ex.email,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900">Proforma Invoice</h3>
            <p className="text-[12px] text-zinc-500">{ex?.company_name} · {sectionTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSendEmail} disabled={sending || busy}
              className="px-3 h-9 text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center gap-1.5 disabled:opacity-60">
              <MdEmail size={14} /> {sending ? "Sending..." : "Send Email"}
            </button>
            <button onClick={handlePrint} disabled={busy}
              className="px-3 h-9 text-[12px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded flex items-center gap-1.5">
              <MdPrint size={14} /> Print
            </button>
            <button onClick={handleDownload} disabled={busy}
              className="px-3 h-9 text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 disabled:opacity-60">
              <MdDownload size={14} /> {busy ? "Generating..." : "Download PDF"}
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center">
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Body — invoice template */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-zinc-50">
          <div ref={templateRef}
            style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, color: "#000", lineHeight: "1.35",
                     background: "#fff", border: "1.5px solid #000", padding: "12px 14px", width: "100%", maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1 }}>
              PROFORMA INVOICE
            </h2>
            <hr style={{ border: "none", borderTop: "1.2px solid #000", margin: "0 0 8px" }} />

            {/* FROM / TO */}
            <div style={{ display: "flex", position: "relative", marginBottom: 8, minHeight: 90 }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1.2, background: "#000" }} />
              <div style={{ width: "50%", textAlign: "center", paddingRight: 8 }}>
                <img src={RSDLogo} alt="RSD" style={{ height: 44, objectFit: "contain", marginBottom: 4 }} />
                <div style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.5 }}>
                  <div>RSD EXPOSITIONS</div>
                  <div>A-99 Defence Colony, New Delhi - 110024</div>
                  <div>Phone: +91-11-41815099</div>
                  <div>Email: support@inoptics.in</div>
                </div>
              </div>
              <div style={{ width: "50%", paddingLeft: 12, display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.7 }}>
                  <div><strong>Company:</strong> {ex?.company_name || "-"}</div>
                  <div><strong>Address:</strong> {ex?.address || "-"}</div>
                  <div><strong>Email:</strong> {ex?.email || "-"}</div>
                  <div><strong>State, City:</strong> {ex?.state || "-"}, {ex?.city || "-"}</div>
                  <div><strong>Pincode:</strong> {ex?.pincode || "-"}</div>
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1.2px solid #000", margin: "0 0 6px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <div><strong>Proforma Invoice No:</strong> {piNo}</div>
              <div><strong>Issue Date:</strong> {today}</div>
            </div>

            <hr style={{ border: "none", borderTop: "1.2px solid #000", margin: "0 0 6px" }} />

            {/* Particulars table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <thead>
                <tr>
                  <th style={{ ...S.hdrCell, textAlign: "left", minWidth: 200 }}>Particulars</th>
                  <th style={{ ...S.hdrCell, minWidth: 70 }}>Qty</th>
                  <th style={{ ...S.hdrCell, minWidth: 80 }}>Rate</th>
                  <th style={{ ...S.hdrCell, minWidth: 80 }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={4} style={{ ...S.cell, ...S.center, color: "#aaa" }}>No data</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...S.cell, textAlign: "left" }}>
                      <div style={{ fontWeight: 700 }}>{r.label}</div>
                      {r.sub && <div style={{ fontSize: 9.5, color: "#444", fontStyle: "italic" }}>{r.sub}</div>}
                    </td>
                    <td style={{ ...S.cell, ...S.center }}>{r.qty ?? "-"}</td>
                    <td style={{ ...S.cell, ...S.right }}>{r.rate != null ? fmt(r.rate) : "-"}</td>
                    <td style={{ ...S.cell, ...S.right }}>{fmt(r.amount)}</td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={3} style={{ ...S.cell, ...S.right, fontWeight: 700 }}>Sub Total</td>
                  <td style={{ ...S.cell, ...S.right, fontWeight: 700 }}>{fmt(subTotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td colSpan={3} style={{ ...S.cell, ...S.right }}>Discount</td>
                    <td style={{ ...S.cell, ...S.right }}>-{fmt(discount)}</td>
                  </tr>
                )}
                {isDelhi ? (
                  <>
                    <tr>
                      <td colSpan={3} style={{ ...S.cell, ...S.right }}>SGST @ 9%</td>
                      <td style={{ ...S.cell, ...S.right }}>{fmt(sgst)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ ...S.cell, ...S.right }}>CGST @ 9%</td>
                      <td style={{ ...S.cell, ...S.right }}>{fmt(cgst)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={3} style={{ ...S.cell, ...S.right }}>IGST @ 18%</td>
                    <td style={{ ...S.cell, ...S.right }}>{fmt(igst)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} style={{ ...S.cell, ...S.right, fontWeight: 700, background: "#f0f0f0" }}>Grand Total (₹)</td>
                  <td style={{ ...S.cell, ...S.right, fontWeight: 700, background: "#f0f0f0" }}>{fmt(grand)}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ ...S.cell, textAlign: "left", fontWeight: 700 }}>HSN CODE: 998596</td>
                  <td colSpan={2} style={{ ...S.cell, textAlign: "right", fontStyle: "italic" }}>INR</td>
                </tr>
              </tbody>
            </table>

            <hr style={{ border: "none", borderTop: "1.2px solid #000", margin: "8px 0" }} />

            {/* Bank */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>BANK DETAILS</div>
              <div style={{ display: "flex", gap: 6 }}>
                {BANKS.map(b => (
                  <div key={b.name} style={{ flex: 1, border: "1.2px solid #000", padding: "6px 8px", fontSize: 9, lineHeight: 1.5 }}>
                    <div><strong>A/C Name:</strong> RSD EXPOSITIONS</div>
                    <div><strong>Bank:</strong> {b.name}</div>
                    <div><strong>A/c No.:</strong> {b.ac}</div>
                    <div><strong>Address:</strong> {b.addr}</div>
                    <div><strong>IFSC:</strong> {b.ifsc}</div>
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1.2px solid #000", margin: "8px 0" }} />

            <div style={{ textAlign: "center", fontSize: 10, lineHeight: 1.7, fontWeight: 600 }}>
              <div>ALL CHEQUES SHOULD BE SENT TO THE FOLLOWING ADDRESS</div>
              <div>RSD EXPOSITIONS</div>
              <div>A-99 Defence Colony, New Delhi - 110024</div>
              <div style={{ fontWeight: 500, fontStyle: "italic" }}>
                THIS IS NOT AN INVOICE, THE FINAL TAX INVOICE WILL BE ISSUED LATER
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
