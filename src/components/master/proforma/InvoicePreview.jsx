import React, { useRef, useState } from 'react';
import { MdDownload, MdPrint } from 'react-icons/md';
import RSDLogo from '../../../assets/RSD_invoice_logo.png';

const BANKS = [
  { name: 'Kotak Mahindra Bank', ac: '01992000000491', ifsc: 'KKBK0004620', addr: 'Defence Colony, New Delhi' },
  { name: 'HDFC BANK',           ac: '99999811045088', ifsc: 'HDFC0000578',  addr: 'Delhi' },
  { name: 'IndusInd Bank',       ac: '259811045088',   ifsc: 'INDB0000169',  addr: 'Karol Bagh, New Delhi' },
  { name: 'Axis Bank',           ac: '0032144225',     ifsc: 'UTIB0005109',  addr: 'Delhi' },
];

const parseOpts = (v) =>
  Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ─── inline styles shared ─── */
const S = {
  cell:    { border: '1px solid #333', padding: '3px 5px', fontSize: 10, fontFamily: 'Arial, sans-serif' },
  hdrCell: { border: '1px solid #333', padding: '3px 5px', fontSize: 10, fontWeight: 700, background: '#f0f0f0', textAlign: 'center', fontFamily: 'Arial, sans-serif' },
  right:   { textAlign: 'right' },
  center:  { textAlign: 'center' },
  bold:    { fontWeight: 700 },
};

function InvoiceTable({ selectedService, services }) {
  const isAll = selectedService === '__all__';

  /* Determine which services to render as rows */
  const rows = isAll
    ? services
    : selectedService
      ? services.filter(s => s.name === selectedService)
      : [];

  /* For a single service, show its selectedOptions as header columns */
  const singleSvc    = !isAll && rows[0];
  const headerCols   = singleSvc ? parseOpts(singleSvc.selectedOptions) : [];
  const totalColSpan = 1 + headerCols.length + 2; /* Particulars + opts + Price + Total */

  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={3} style={{ ...S.cell, ...S.center, color: '#aaa', padding: 10 }}>
          Select a service to preview
        </td>
      </tr>
    );
  }

  return (
    <>
      {rows.map((svc, idx) => {
        const opts = isAll ? parseOpts(svc.selectedOptions) : headerCols;
        return (
          <tr key={idx}>
            {/* Particulars */}
            <td style={{ ...S.cell, textAlign: 'left', verticalAlign: 'top', minWidth: 120 }}>
              <div style={{ fontWeight: 700, fontSize: 10 }}>{svc.name}</div>
              {svc.description && (
                <div style={{ fontStyle: 'italic', fontSize: 9.5, color: '#222', marginTop: 1 }}>{svc.description}</div>
              )}
            </td>
            {/* Dynamic option columns */}
            {opts.map((opt, i) => (
              <td key={i} style={{ ...S.cell, ...S.center }}>-</td>
            ))}
            {/* Price */}
            <td style={{ ...S.cell, ...S.center }}></td>
            {/* Total */}
            <td style={{ ...S.cell, ...S.center }}></td>
          </tr>
        );
      })}

      {/* Summary rows — always span to align with last 1 col */}
      {[
        ['Discount (10%)', false],
        ['Total', false],
        ['SGST @9%', false],
        ['CGST @9%', false],
        ['Grand Total', true],
      ].map(([label, isBold]) => (
        <tr key={label}>
          <td colSpan={1 + (isAll ? 0 : headerCols.length) + 1}
            style={{ ...S.cell, textAlign: 'right', ...(isBold ? S.bold : {}), color: isBold ? '#000' : '#333' }}>
            {label}
          </td>
          <td style={{ ...S.cell, ...S.center, ...(isBold ? S.bold : {}) }}>INR</td>
        </tr>
      ))}

      {/* HSN Code */}
      <tr>
        <td colSpan={Math.ceil((1 + (isAll ? 0 : headerCols.length) + 2) / 2)}
          style={{ ...S.cell, textAlign: 'left', fontWeight: 700 }}>
          HSN CODE: 998596
        </td>
        <td colSpan={Math.ceil((1 + (isAll ? 0 : headerCols.length) + 2) / 2)}
          style={{ ...S.cell, textAlign: 'right', fontStyle: 'italic' }}>
          INR RUPEES IN WORDS
        </td>
      </tr>
    </>
  );
}

export default function InvoicePreview({ activeAddress, services, selectedService, proformaNo }) {
  const templateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const isAll     = selectedService === '__all__';
  const singleSvc = !isAll && selectedService
    ? services.find(s => s.name === selectedService)
    : null;
  const headerCols = singleSvc ? parseOpts(singleSvc.selectedOptions) : [];

  const handleDownload = async () => {
    const element = templateRef.current;
    if (!element) return;
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, scrollY: 0, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf    = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageW  = pdf.internal.pageSize.getWidth();
      const pageH  = pdf.internal.pageSize.getHeight();
      const imgW   = pageW - 10;
      const imgH   = (canvas.height / canvas.width) * imgW;
      let yPos = 5;
      if (imgH <= pageH - 10) {
        pdf.addImage(imgData, 'PNG', 5, yPos, imgW, imgH);
      } else {
        const pages = Math.ceil(imgH / (pageH - 10));
        for (let p = 0; p < pages; p++) {
          if (p > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 5, 5 - p * (pageH - 10), imgW, imgH);
        }
      }
      pdf.save('Proforma_Invoice.pdf');
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const handlePrint = () => {
    const el = templateRef.current;
    if (!el) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Proforma Invoice</title>
      <style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;font-size:11px}</style>
    </head><body>${el.outerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  const base = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 11,
    color: '#000',
    lineHeight: '1.35',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Invoice Preview</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm">
            <MdPrint size={14} /> Print
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60">
            <MdDownload size={14} /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ═══════════════ INVOICE TEMPLATE ═══════════════ */}
      <div ref={templateRef}
        style={{ ...base, background: '#fff', border: '1.5px solid #000', padding: '10px 12px', width: '100%', maxWidth: 794 }}>

        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, margin: '0 0 8px', letterSpacing: 1 }}>
          PROFORMA INVOICE
        </h2>
        <hr style={{ border: 'none', borderTop: '1.2px solid #000', margin: '0 0 8px' }} />

        {/* FROM / TO header */}
        <div style={{ display: 'flex', position: 'relative', marginBottom: 8, minHeight: 90 }}>
          {/* divider */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.2, background: '#000' }} />

          {/* FROM */}
          <div style={{ width: '50%', textAlign: 'center', paddingRight: 8 }}>
            <img src={RSDLogo} alt="RSD" style={{ height: 44, objectFit: 'contain', marginBottom: 4 }} />
            {activeAddress ? (
              <div style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.5 }}>
                <div>{activeAddress.address}</div>
                <div>{activeAddress.state} - {activeAddress.pincode}</div>
                <div>Phone: {activeAddress.phone}</div>
                <div>Email: {activeAddress.email}</div>
                <div>GST: {activeAddress.gst}</div>
              </div>
            ) : (
              <div style={{ color: 'red', fontSize: 10 }}>No active address selected</div>
            )}
          </div>

          {/* TO */}
          <div style={{ width: '50%', paddingLeft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.7 }}>
              <div><strong>Company</strong> &nbsp; [Exhibitor Name]</div>
              <div><strong>Address</strong> &nbsp; [Address]</div>
              <div><strong>Email</strong> &nbsp; [Email]</div>
              <div><strong>State, City</strong> &nbsp; [State, City]</div>
              <div><strong>Pincode</strong> &nbsp; [Pincode]</div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1.2px solid #000', margin: '0 0 6px' }} />

        {/* Invoice No + Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <div><strong>Proforma Invoice No:</strong> {proformaNo || 'INOPD-2026 | [CODE] | [SERIAL] | 2025-26'}</div>
          <div><strong>Issue Date:</strong> {today}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1.2px solid #000', margin: '0 0 6px' }} />

        {/* Service Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ ...S.hdrCell, textAlign: 'left', minWidth: 140 }}>Particulars</th>
              {/* For single service: show selected option columns */}
              {!isAll && headerCols.map(col => (
                <th key={col} style={{ ...S.hdrCell, minWidth: 70 }}>{col}</th>
              ))}
              <th style={{ ...S.hdrCell, minWidth: 60 }}>Price</th>
              <th style={{ ...S.hdrCell, minWidth: 60 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <InvoiceTable selectedService={selectedService} services={services} />
          </tbody>
        </table>

        <hr style={{ border: 'none', borderTop: '1.2px solid #000', margin: '8px 0' }} />

        {/* Bank Details */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>BANK DETAILS</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {BANKS.map(b => (
              <div key={b.name} style={{ flex: 1, border: '1.2px solid #000', padding: '6px 8px', fontSize: 9.5, lineHeight: 1.55 }}>
                <div><strong>A/C Name:</strong> RSD EXPOSITIONS</div>
                <div><strong>Bank Name:</strong> {b.name}</div>
                <div><strong>Bank A/c No.:</strong> {b.ac}</div>
                <div><strong>Address:</strong> {b.addr}</div>
                <div><strong>IFSC Code:</strong> {b.ifsc}</div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1.2px solid #000', margin: '8px 0' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 10, lineHeight: 1.7, fontWeight: 600 }}>
          <div>ALL CHEQUES SHOULD BE SENT TO THE FOLLOWING ADDRESS</div>
          <div>RSD EXPOSITIONS</div>
          <div>A-99 Defence Colony, New Delhi - 110024</div>
          <div style={{ fontWeight: 500, fontStyle: 'italic' }}>
            THIS IS NOT AN INVOICE, THE FINAL TAX INVOICE WILL BE ISSUED LATER
          </div>
        </div>
      </div>
    </div>
  );
}
