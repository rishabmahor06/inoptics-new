import React from 'react';
import { MdLock } from 'react-icons/md';

export default function UnlockContractor() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdLock size={48} className="text-zinc-200" />
      <p className="text-sm">Contractor unlock requests will appear here.</p>
    </div>
  );
}
