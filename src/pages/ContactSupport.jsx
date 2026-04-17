import React from 'react';
import { MdSupportAgent } from 'react-icons/md';

export default function ContactSupport() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdSupportAgent size={48} className="text-zinc-200" />
      <p className="text-sm">Support tickets will appear here.</p>
    </div>
  );
}
