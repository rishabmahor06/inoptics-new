import React from 'react';
import { MdBadge } from 'react-icons/md';

export default function ExhibitorBadgesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdBadge size={48} className="text-zinc-200" />
      <p className="text-sm">Badge details will appear here.</p>
    </div>
  );
}
