import React from 'react';
import { MdTune } from 'react-icons/md';

export default function Masters() {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdTune size={48} className="text-zinc-200" />
      <p className="text-sm">Master configuration will appear here.</p>
    </div>
  );
}
