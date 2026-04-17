import React from 'react';
import { MdEngineering } from 'react-icons/md';

export default function Contractor() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdEngineering size={48} className="text-zinc-200" />
      <p className="text-sm">Contractor records will appear here.</p>
    </div>
  );
}
