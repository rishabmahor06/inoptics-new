import React from 'react';
import { MdDescription } from 'react-icons/md';

export default function MandatoryForms() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdDescription size={48} className="text-zinc-200" />
      <p className="text-sm">Mandatory form submissions will appear here.</p>
    </div>
  );
}
