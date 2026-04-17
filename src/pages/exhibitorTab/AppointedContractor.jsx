import React from 'react';
import { MdEngineering } from 'react-icons/md';

export default function AppointedContractor() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdEngineering size={48} className="text-zinc-200" />
      <p className="text-sm">Appointed contractor details will appear here.</p>
    </div>
  );
}
