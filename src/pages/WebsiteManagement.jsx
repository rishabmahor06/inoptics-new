import React from 'react';
import { MdLanguage } from 'react-icons/md';

export default function WebsiteManagement() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdLanguage size={48} className="text-zinc-200" />
      <p className="text-sm">Website management tools will appear here.</p>
    </div>
  );
}
