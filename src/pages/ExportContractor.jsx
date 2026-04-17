import React from 'react';
import { MdFileDownload } from 'react-icons/md';

export default function ExportContractor() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdFileDownload size={48} className="text-zinc-200" />
      <p className="text-sm">Export contractor data here.</p>
    </div>
  );
}
