import React from 'react';
import { MdElectricBolt } from 'react-icons/md';

export default function PowerRequirement() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdElectricBolt size={48} className="text-zinc-200" />
      <p className="text-sm">Power requirement details will appear here.</p>
    </div>
  );
}
