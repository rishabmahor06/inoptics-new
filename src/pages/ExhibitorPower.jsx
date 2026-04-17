import React from 'react';
import { MdElectricBolt } from 'react-icons/md';

export default function ExhibitorPower() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdElectricBolt size={48} className="text-zinc-200" />
      <p className="text-sm">Power connection records will appear here.</p>
    </div>
  );
}
