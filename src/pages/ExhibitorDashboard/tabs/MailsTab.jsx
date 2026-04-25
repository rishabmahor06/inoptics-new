import React, { useState } from 'react';
import { MdMail } from 'react-icons/md';
import { SectionShell } from '../shared';

const MAILS = [
  { id: 1, subject: 'Welcome to Exhibitor Dashboard',   sent_at: '2025-08-08T09:00:00Z', content: '<p>Hello Exhibitor, welcome to the dashboard! Please complete your profile setup and review all important instructions.</p>' },
  { id: 2, subject: 'Your Password Reset',              sent_at: '2025-08-07T14:30:00Z', content: '<p>You requested a password reset. Click the link in your email to reset your password securely.</p>' },
  { id: 3, subject: 'Exhibition Guidelines Updated',    sent_at: '2025-08-06T18:45:00Z', content: '<p>Please review the updated exhibition guidelines on your dashboard. Key changes include booth setup timelines and contractor access rules.</p>' },
];

export default function MailsTab() {
  const [selected, setSelected] = useState(MAILS[0]);

  return (
    <SectionShell icon={MdMail} iconBg="#dbeafe" iconColor="#3b82f6"
      title="Mails" subtitle="Sent mail history">
      <div className="flex rounded-xl border border-zinc-200 overflow-hidden" style={{ minHeight: 380 }}>
        <div className="w-64 shrink-0 border-r border-zinc-100 overflow-y-auto bg-zinc-50">
          {MAILS.map(m => (
            <button key={m.id} onClick={() => setSelected(m)}
              className={`w-full text-left px-4 py-3.5 border-b border-zinc-100 transition-colors hover:bg-white
                ${selected?.id === m.id ? 'bg-white border-l-2 border-l-blue-500' : ''}`}>
              <p className="text-[12px] font-semibold text-zinc-800 truncate">{m.subject}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(m.sent_at).toLocaleString('en-IN')}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 p-5 overflow-y-auto bg-white">
          {selected ? (
            <>
              <p className="text-[15px] font-bold text-zinc-800 mb-1">{selected.subject}</p>
              <p className="text-[11px] text-zinc-400 mb-4">{new Date(selected.sent_at).toLocaleString('en-IN')}</p>
              <div className="text-[13px] text-zinc-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selected.content }} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-[12px] text-zinc-300">Select a mail to view</p>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
