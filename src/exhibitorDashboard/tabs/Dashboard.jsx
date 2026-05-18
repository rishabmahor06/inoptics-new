import React, { useEffect, useMemo } from "react";
import TabShell from "../TabShell";
import {
  MdDashboard, MdCheckCircle, MdEvent,
  MdChatBubbleOutline, MdRefresh, MdAssignmentTurnedIn, MdPending,
  MdTrendingUp, MdRocketLaunch, MdInfoOutline, MdCalendarMonth,
} from "react-icons/md";
import { useDashboardStore } from "../store/useDashboardStore";
import { getExhibitor } from "../api/base";

export default function Dashboard() {
  const { eventSchedule, remarks, activities, loading, remarkError, fetchAll } =
    useDashboardStore();
  const exhibitor = getExhibitor();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const { done, total, percent, pending, nextTask } = useMemo(() => {
    const t = activities.length || 0;
    const d = activities.filter((a) => a.done).length;
    const next = activities.find((a) => !a.done);
    return {
      done: d,
      total: t,
      pending: t - d,
      percent: t ? Math.round((d / t) * 100) : 0,
      nextTask: next?.name || null,
    };
  }, [activities]);

  return (
    <TabShell
      title={`Welcome${exhibitor?.company_name ? `, ${exhibitor.company_name}` : ""}`}
      Icon={MdDashboard}
      subtitle="Your exhibitor command center"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ════════════ LEFT — Checklist + Remarks ════════════ */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <Card
            title="Checklist"
            Icon={MdCheckCircle}
            iconTone="emerald"
            badge={total ? `${done}/${total}` : null}
          >
            {loading ? (
              <ChecklistSkel />
            ) : activities.length === 0 ? (
              <Empty text="No checklist items yet." />
            ) : (
              <ul className="space-y-1.5">
                {activities.map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded border transition-colors ${
                      a.done
                        ? "bg-emerald-50/60 border-emerald-100"
                        : "bg-white border-zinc-100 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold ${
                        a.done
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {a.done ? <MdCheckCircle size={14} /> : i + 1}
                    </span>
                    <p
                      className={`flex-1 min-w-0 text-[12.5px] truncate ${
                        a.done
                          ? "text-zinc-500 line-through"
                          : "text-zinc-800 font-medium"
                      }`}
                    >
                      {a.name}
                    </p>
                    {!a.done && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                    {a.done && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white  px-1.5 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Remarks"
            Icon={MdChatBubbleOutline}
            iconTone="amber"
            badge={remarks.length || null}
          >
            {loading ? (
              <Skel rows={3} />
            ) : remarkError ? (
              <p className="text-[13px] text-red-500 py-3">{remarkError}</p>
            ) : remarks.length === 0 ? (
              <Empty text="No remarks available." />
            ) : (
              <ul className="space-y-2">
                {remarks.map((r) => (
                  <li
                    key={r.id}
                    className="bg-amber-50/70 border-l-4 border-amber-400 rounded-r px-3 py-2.5"
                  >
                    <p className="text-[12.5px] text-zinc-800 leading-relaxed wrap-break-word">
                      {r.remark}
                    </p>
                    {(r.created_at || r.date) && (
                      <p className="mt-1 text-[10.5px] text-amber-700/70">
                        {r.created_at || r.date}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ════════════ RIGHT — Hero + Event Schedule ════════════ */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Hero */}
          

          {/* Event Schedule */}
          <Card title="Event Schedule" Icon={MdEvent} iconTone="blue">
            {loading ? (
              <Skel rows={4} />
            ) : eventSchedule?.[0]?.description ? (
              <div
                className="text-[13px] text-zinc-700 leading-relaxed
                  [&_p]:mb-2 [&_p:last-child]:mb-0
                  [&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h1]:mt-2 [&_h1]:mb-1
                  [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mt-2 [&_h2]:mb-1
                  [&_h3]:text-[13.5px] [&_h3]:font-bold [&_h3]:text-zinc-900 [&_h3]:mt-2 [&_h3]:mb-1
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                  [&_strong]:font-bold [&_strong]:text-zinc-900
                  [&_a]:text-blue-600 [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: eventSchedule[0].description }}
              />
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto rounded bg-zinc-100 flex items-center justify-center mb-3 text-zinc-400">
                  <MdCalendarMonth size={22} />
                </div>
                <p className="text-[13px] text-zinc-500">No event schedule yet.</p>
                <p className="text-[11.5px] text-zinc-400 mt-1">
                  Check back soon for event timings and program details.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TabShell>
  );
}

/* ──────────────── Sub-components ──────────────── */

function CircularProgress({ percent }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="none" />
        <circle
          cx="40" cy="40" r={r}
          stroke="white" strokeWidth="7" strokeLinecap="round" fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-bold">{percent}%</span>
      </div>
    </div>
  );
}

function MiniStat({ Icon, label, value, tone }) {
  const tones = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    sky: "text-sky-300",
  };
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className={tones[tone] || "text-white"} />
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-blue-100">{label}</p>
      </div>
      <p className="mt-0.5 text-[18px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function Card({ title, Icon, iconTone = "blue", badge, children }) {
  const tones = {
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-7 h-7 rounded flex items-center justify-center ${tones[iconTone] || tones.blue}`}>
              <Icon size={15} />
            </div>
          )}
          <h3 className="text-[13.5px] font-bold text-[#02062c]">{title}</h3>
        </div>
        {badge != null && (
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3.5 sm:p-4">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
        <MdInfoOutline size={20} />
      </div>
      <p className="text-[12.5px] text-zinc-400">{text}</p>
    </div>
  );
}

function ChecklistSkel() {
  return (
    <ul className="space-y-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-zinc-50">
          <div className="w-6 h-6 rounded bg-zinc-200 animate-pulse" />
          <div className="flex-1 h-2.5 bg-zinc-200 rounded animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function Skel({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-zinc-100 rounded animate-pulse" />
      ))}
    </div>
  );
}
