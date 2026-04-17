import React from 'react';
import { MdBadge } from 'react-icons/md';

export default function ExhibitorBadges() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdBadge size={48} className="text-zinc-200" />
      <p className="text-sm">Badge records will appear here.</p>
    </div>
  );
}
