import React from 'react';
import { MdHistory } from 'react-icons/md';

export default function ExhibitorHistory() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdHistory size={48} className="text-zinc-200" />
      <p className="text-sm">Exhibitor history logs will appear here.</p>
    </div>
  );
}
