import React from 'react';
import { MdTableChart } from 'react-icons/md';

export default function StallsManagement() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdTableChart size={48} className="text-zinc-200" />
      <p className="text-sm">Stall management records will appear here.</p>
    </div>
  );
}
