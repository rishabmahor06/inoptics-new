import React from 'react';
import { MdBrandingWatermark } from 'react-icons/md';

export default function Brands() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdBrandingWatermark size={48} className="text-zinc-200" />
      <p className="text-sm">Brand details will appear here.</p>
    </div>
  );
}
