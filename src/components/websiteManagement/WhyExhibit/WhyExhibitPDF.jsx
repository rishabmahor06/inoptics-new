import React, { useEffect, useState } from 'react';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import { AddBtn, WmModal, Field, WmInput, WmFileInput, SectionHeader, WmTable, TrRow, Td, TdId, TdActions, DelBtn } from '../shared/WmShared';
import { MdPictureAsPdf, MdVisibility, MdOpenInNew, MdClose, MdDownload } from 'react-icons/md';

export default function WhyExhibitPDF() {
  const { pdfs, loadingPdfs, fetchPdfs, addPdf, deletePdf } = useWhyExhibitStore();
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => { fetchPdfs(); }, [fetchPdfs]);

  const handleSave = async () => {
    if (!file) { alert('Please select a PDF file'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      if (title) fd.append('title', title);
      await addPdf(fd);
      setModal(false); setFile(null); setTitle('');
    } finally { setSaving(false); }
  };

  const openPreview = (url, t) => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewTitle(t || 'Preview PDF');
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Why Exhibit — PDFs" count={pdfs.length}>
        <AddBtn onClick={() => { setFile(null); setTitle(''); setModal(true); }} label="Upload PDF" />
      </SectionHeader>

      {!loadingPdfs && pdfs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {pdfs.map(row => (
            <div key={row.id}
              className="flex items-center gap-3 bg-white rounded border border-zinc-200 p-4 hover:shadow-md hover:border-red-200 transition-all group">
              <button
                onClick={() => openPreview(row.pdf, row.title)}
                className="w-10 h-10 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                title="Preview"
              >
                <MdPictureAsPdf className="text-red-500" size={22} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 truncate">{row.title || `PDF #${row.id}`}</p>
                {row.pdf && (
                  <button
                    onClick={() => openPreview(row.pdf, row.title)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold mt-0.5"
                  >
                    <MdVisibility size={12} /> Preview
                  </button>
                )}
              </div>
              <DelBtn onClick={() => deletePdf(row.id)} />
            </div>
          ))}
        </div>
      )}

      <WmTable headers={['#', 'TITLE', 'PDF', 'ACTIONS']} loading={loadingPdfs} empty={pdfs.length === 0}>
        {pdfs.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{row.id}</TdId>
            <Td className="font-medium">{row.title || '—'}</Td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.pdf && (
                <button
                  onClick={() => openPreview(row.pdf, row.title)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold"
                >
                  <MdVisibility size={14} /> Preview PDF
                </button>
              )}
            </td>
            <TdActions>
              <DelBtn onClick={() => deletePdf(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title="Upload Why Exhibit PDF" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title (optional)">
              <WmInput value={title} onChange={e => setTitle(e.target.value)} placeholder="PDF title" />
            </Field>
            <Field label="PDF File" required>
              <WmFileInput accept=".pdf,application/pdf" onChange={e => setFile(e.target.files[0])} label="Choose PDF" />
              {file && <p className="text-xs text-emerald-600 mt-1">{file.name}</p>}
            </Field>
          </div>
        </WmModal>
      )}

      {/* PDF Preview Popup */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-9999 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative bg-white rounded shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50">
              <div className="flex items-center gap-2 min-w-0">
                <MdPictureAsPdf className="text-red-500 shrink-0" size={20} />
                <p className="text-sm font-semibold text-zinc-800 truncate">{previewTitle}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded transition-colors"
                  title="Open in new tab"
                >
                  <MdOpenInNew size={13} /> Open
                </a>
                <a
                  href={previewUrl}
                  download
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                  title="Download"
                >
                  <MdDownload size={13} /> Download
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Close"
                >
                  <MdClose size={18} />
                </button>
              </div>
            </div>
            {/* Iframe */}
            <iframe
              src={previewUrl}
              title={previewTitle}
              className="flex-1 w-full bg-zinc-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
