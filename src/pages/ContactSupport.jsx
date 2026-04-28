import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdSupportAgent, MdDeleteOutline,
  MdPerson, MdEmail, MdPhone, MdAccessTime,
} from 'react-icons/md';

// API returns double-escaped sequences like \\r\\n — convert to real newlines
function cleanMessage(raw) {
  return String(raw || '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

export default function ContactSupport() {
  const [tickets,    setTickets]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res  = await fetch('https://inoptics.in/api/get_contact_support.php');
      const data = await res.json();
      setTickets(data.status === 'success' ? (data.data || []) : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      setDeletingId(id);
      const res  = await fetch('https://inoptics.in/api/delete_contact_support.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Ticket deleted');
        setTickets(prev => prev.filter(t => t.id !== id));
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">

      {/* Stats bar */}
      

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Support Messages</h3>
          {!loading && (
            <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
              {tickets.length} tickets
            </span>
          )}
        </div>

        {/* States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdSupportAgent size={44} />
            <p className="text-sm text-zinc-400">Loading messages...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-zinc-300">
            <MdSupportAgent size={44} />
            <p className="text-sm text-zinc-400">No support messages</p>
          </div>
        ) : (

          /* Ticket grid */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col"
              >

                {/* Card head */}
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                      Ticket {index + 1}
                    </p>
                    <p className="text-[14px] font-bold text-zinc-900 truncate leading-tight">
                      {ticket.company_name || 'No Company'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    disabled={deletingId === ticket.id}
                    className="w-20 h-8 rounded bg-white border border-zinc-200 text-zinc-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                  >
                    <MdDeleteOutline size={16} /> Delete
                  </button>
                </div>

                {/* Card info */}
                <div className="px-4 py-3 space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <MdPerson size={14} className="text-green-700 shrink-0" />
                    <span className="text-[13px] text-zinc-900 font-medium truncate">{ticket.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdEmail size={14} className="text-green-700 shrink-0" />
                    <span className="text-[13px] text-zinc-900 truncate">{ticket.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdPhone size={14} className="text-green-700 shrink-0" />
                    <span className="text-[13px] text-zinc-900">{ticket.mobile}</span>
                  </div>

                  {/* Message */}
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Message
                    </p>
                    <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 max-h-28 overflow-y-auto">
                      <p className="text-[13px] text-red-700 leading-relaxed whitespace-pre-line">
                        {cleanMessage(ticket.message) || <span className="italic text-zinc-300">No message</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center gap-1.5">
                  <MdAccessTime size={16} className="text-zinc-300 shrink-0" />
                  <span className="text-[14px] text-zinc-400">{ticket.submitted_at}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
