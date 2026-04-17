import React from 'react';
import { FaHardHat } from 'react-icons/fa';

export default function ContractorBadges() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <FaHardHat size={44} className="text-zinc-200" />
      <p className="text-sm">Contractor badge records will appear here.</p>
    </div>
  );
}
