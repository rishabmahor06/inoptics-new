import React from 'react';
import { MdMessage } from 'react-icons/md';

export default function Communication() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdMessage size={48} className="text-zinc-200" />
      <p className="text-sm">Communication logs will appear here.</p>
    </div>
  );
}
