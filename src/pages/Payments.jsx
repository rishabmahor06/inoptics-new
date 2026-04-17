import React from 'react';
import { MdPayment } from 'react-icons/md';

export default function Payments() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdPayment size={48} className="text-zinc-200" />
      <p className="text-sm">Payment records will appear here.</p>
    </div>
  );
}
