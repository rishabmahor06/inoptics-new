import React from 'react';
import { MdChair } from 'react-icons/md';

export default function ExtraFurnitureReq() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdChair size={48} className="text-zinc-200" />
      <p className="text-sm">Extra furniture requirement details will appear here.</p>
    </div>
  );
}
