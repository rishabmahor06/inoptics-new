import React, { useEffect, useMemo, useState } from "react";
import TabShell from "../TabShell";
import {
  MdMail,
  MdMailOutline,
  MdMarkEmailRead,
  MdArrowBack,
  MdRefresh,
  MdSearch,
  MdAccessTime,
} from "react-icons/md";
import { useMailboxStore } from "../store/useMailboxStore";

const stripHtml = (html = "") =>
  String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (s) => {
  if (!s) return "";

  const d = new Date(s);
  if (isNaN(d.getTime())) return s;

  const today = new Date();

  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  // Today → show only time
  if (sameDay) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Other days → show date + time
  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export default function MailsInbox() {
  const { mails, loading, selectedMail, fetchMails, selectMail, clearSelected } =
    useMailboxStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMails();
  }, [fetchMails]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mails;
    return mails.filter((m) => {
      const subj = (m.subject || "").toLowerCase();
      const body = stripHtml(m.content || "").toLowerCase();
      return subj.includes(q) || body.includes(q);
    });
  }, [mails, search]);

  const unreadCount = mails.filter(
    (m) => Number(m.is_read) === 0 || m.is_read === "0"
  ).length;

  return (
    <TabShell
      title="Mails Inbox"
      Icon={MdMail}
      subtitle={
        unreadCount > 0
          ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
          : "Communications from organizers"
      }
    >
      <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
          <div className="relative flex-1">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mails..."
              className="w-full h-10 pl-9 pr-3 text-[13px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => fetchMails()}
            className="h-10 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded transition-colors"
            title="Refresh"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Two-pane container */}
        <div className="flex flex-col md:flex-row min-h-[85vh]">
          {/* List panel */}
          <div
            className={`md:w-90 md:shrink-0 md:border-r border-zinc-100 ${
              selectedMail ? "hidden md:block" : "block"
            }`}
          >
            {loading ? (
              <ListSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyList />
            ) : (
              <ul className="divide-y divide-zinc-100 max-h-[84vh] overflow-y-auto">
                {filtered.map((mail) => {
                  const unread =
                    Number(mail.is_read) === 0 || mail.is_read === "0";
                  const isActive = selectedMail?.id === mail.id;
                  return (
                    <li key={mail.id}>
                      <button
                        onClick={() => selectMail(mail)}
                        className={`w-full text-left px-4 py-3 transition-colors flex gap-3 ${
                          isActive
                            ? "bg-blue-50/70"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div
                          className={`shrink-0 w-9 h-9 rounded flex items-center justify-center ${
                            unread
                              ? "bg-blue-100 text-blue-600"
                              : "bg-zinc-100 text-zinc-400"
                          }`}
                        >
                          {unread ? (
                            <MdMail size={18} />
                          ) : (
                            <MdMarkEmailRead size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`truncate text-[13.5px] ${
                                unread
                                  ? "font-bold text-[#02062c]"
                                  : "font-medium text-zinc-700"
                              }`}
                            >
                              {mail.subject || "(no subject)"}
                            </p>
                            {unread && (
                              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] text-zinc-500 mt-0.5 flex items-center gap-1">
                            <MdAccessTime size={12} />
                            {formatDate(mail.sent_at || mail.created_at)}
                          </p>
                          <p className="text-[12px] text-zinc-500 mt-1 line-clamp-2">
                            {stripHtml(mail.content).slice(0, 120)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* View panel */}
          <div
            className={`flex-1 min-w-0 ${
              selectedMail ? "block" : "hidden md:block"
            }`}
          >
            {selectedMail ? (
              <MailView mail={selectedMail} onBack={clearSelected} />
            ) : (
              <NoSelection />
            )}
          </div>
        </div>
      </div>
    </TabShell>
  );
}

function MailView({ mail, onBack }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 flex items-start gap-3">
        <button
          onClick={onBack}
          className="md:hidden shrink-0 w-9 h-9 rounded bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700"
          title="Back"
        >
          <MdArrowBack size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] sm:text-[18px] font-bold text-[#02062c] leading-snug wrap-break-word">
            {mail.subject || "(no subject)"}
          </h2>
          <p className="mt-1 text-[12px] text-zinc-500 flex items-center gap-1">
            <MdAccessTime size={13} />
            {formatDate(mail.sent_at || mail.created_at)}
          </p>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-5 overflow-y-auto max-h-[65vh]">
        <div
          className="prose prose-sm max-w-none text-[13.5px] text-zinc-700 leading-relaxed [&_a]:text-blue-600 [&_a:hover]:underline [&_img]:max-w-full [&_img]:rounded"
          dangerouslySetInnerHTML={{ __html: mail.content || "" }}
        />
      </div>
    </div>
  );
}

function NoSelection() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded bg-zinc-50 flex items-center justify-center mb-3 text-zinc-300">
        <MdMailOutline size={32} />
      </div>
      <p className="text-[14px] font-semibold text-zinc-600">Select a mail</p>
      <p className="text-[12.5px] text-zinc-400 mt-1 max-w-xs">
        Pick a message from the list to read its contents here.
      </p>
    </div>
  );
}

function EmptyList() {
  return (
    <div className="py-14 px-6 text-center">
      <div className="w-12 h-12 rounded bg-zinc-50 flex items-center justify-center mx-auto mb-3 text-zinc-300">
        <MdMailOutline size={24} />
      </div>
      <p className="text-[13px] font-semibold text-zinc-600">No mails yet</p>
      <p className="text-[12px] text-zinc-400 mt-1">
        Updates from organizers will appear here.
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-zinc-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="px-4 py-3 flex gap-3">
          <div className="w-9 h-9 rounded bg-zinc-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-zinc-100 rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-zinc-100 rounded animate-pulse w-1/3" />
            <div className="h-2.5 bg-zinc-100 rounded animate-pulse w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
