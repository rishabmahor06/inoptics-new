import React from 'react';
import { MdLabel } from 'react-icons/md';

export default function FasciaName() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdLabel size={48} className="text-zinc-200" />
      <p className="text-sm">Fascia name records will appear here.</p>
    </div>
  );
}
