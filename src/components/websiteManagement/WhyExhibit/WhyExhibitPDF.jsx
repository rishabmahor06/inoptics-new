import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useWhyExhibitStore } from '../../../store/website/useWhyExhibitStore';
import { AddBtn, WmModal, Field, WmInput, WmFileInput, SectionHeader, WmTable, TrRow, Td, TdId, TdActions, DelBtn } from '../shared/WmShared';
import { MdPictureAsPdf } from 'react-icons/md';

export default function WhyExhibitPDF() {
  const { pdfs, loadingPdfs, fetchPdfs, addPdf, deletePdf } = useWhyExhibitStore();
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="space-y-4">
      <SectionHeader title="Why Exhibit — PDFs" count={pdfs.length}>
        <AddBtn onClick={() => { setFile(null); setTitle(''); setModal(true); }} label="Upload PDF" />
      </SectionHeader>

      {!loadingPdfs && pdfs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {pdfs.map(row => (
            <div key={row.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-md hover:border-red-200 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <MdPictureAsPdf className="text-red-500" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 truncate">{row.title || `PDF #${row.id}`}</p>
                {row.pdf && (
                  <a href={row.pdf} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline">View PDF</a>
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
                <a href={row.pdf} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold">
                  <MdPictureAsPdf size={14} />View PDF
                </a>
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
    </div>
  );
}
