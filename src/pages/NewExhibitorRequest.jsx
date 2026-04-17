import React from 'react';
import { MdPersonAdd } from 'react-icons/md';

export default function NewExhibitorRequest() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdPersonAdd size={48} className="text-zinc-200" />
      <p className="text-sm">New exhibitor requests will appear here.</p>
    </div>
  );
}
