import React, { useEffect, useMemo } from "react";
import TabShell from "../TabShell";
import {
  MdDashboard,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdEvent,
  MdChatBubbleOutline,
  MdRefresh,
  MdTrendingUp,
  MdAssignmentTurnedIn,
  MdPending,
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

  const { done, total, percent, pending } = useMemo(() => {
    const t = activities.length || 0;
    const d = activities.filter((a) => a.done).length;
    return {
      done: d,
      total: t,
      pending: t - d,
      percent: t ? Math.round((d / t) * 100) : 0,
    };
  }, [activities]);

  return (
    <TabShell
      title={`Welcome${exhibitor?.company_name ? `, ${exhibitor.company_name}` : ""}`}
      Icon={MdDashboard}
      subtitle="Your exhibitor command center"
    >
      {/* Hero strip with circular progress + stats */}
      <div className="bg-linear-to-br from-[#0b1437] via-[#1d2a6b] to-[#3730a3] rounded-2xl shadow-lg p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          {/* Circular progress */}
          <div className="flex items-center gap-4 shrink-0">
            <CircularProgress percent={percent} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                Your Progress
              </p>
              <p className="mt-0.5 text-[22px] sm:text-[26px] font-bold leading-tight">
                {done}<span className="text-blue-200 text-[18px]">/{total}</span>
              </p>
              <p className="text-[12px] text-blue-200">tasks completed</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <MiniStat
              Icon={MdAssignmentTurnedIn}
              label="Done"
              value={done}
              tone="emerald"
            />
            <MiniStat
              Icon={MdPending}
              label="Pending"
              value={pending}
              tone="amber"
            />
            <MiniStat
              Icon={MdTrendingUp}
              label="Score"
              value={`${percent}%`}
              tone="sky"
              className="col-span-2 sm:col-span-1"
            />
          </div>

          <button
            onClick={() => fetchAll()}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg backdrop-blur-sm transition-colors"
            title="Refresh"
          >
            <MdRefresh size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Checklist — compact */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Checklist"
            Icon={MdCheckCircle}
            badge={`${done}/${total}`}
          >
            {loading ? (
              <ChecklistSkel />
            ) : activities.length === 0 ? (
              <Empty text="No checklist items yet." />
            ) : (
              <ul className="space-y-1.5">
                {activities.map((a) => (
                  <li
                    key={a.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                      a.done
                        ? "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
                        : "bg-white border-zinc-100 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        a.done ? "text-emerald-500" : "text-zinc-300"
                      }`}
                    >
                      {a.done ? (
                        <MdCheckCircle size={18} />
                      ) : (
                        <MdRadioButtonUnchecked size={18} />
                      )}
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
                    <span
                      className={`shrink-0 w-2 h-2 rounded-full ${
                        a.done ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Event Schedule" Icon={MdEvent}>
            {loading ? (
              <Skel rows={3} />
            ) : eventSchedule?.[0]?.description ? (
              <div
                className="prose prose-sm max-w-none text-[13px] text-zinc-700 leading-relaxed [&_a]:text-blue-600 [&_a:hover]:underline [&_h1]:text-[15px] [&_h2]:text-[14px] [&_h3]:text-[13.5px]"
                dangerouslySetInnerHTML={{
                  __html: eventSchedule[0].description,
                }}
              />
            ) : (
              <Empty text="No event schedule yet." />
            )}
          </Card>
        </div>

        {/* Remarks */}
        <div>
          <Card
            title="Remarks"
            Icon={MdChatBubbleOutline}
            badge={remarks.length || null}
          >
            {loading ? (
              <Skel rows={3} />
            ) : remarkError ? (
              <p className="text-[13px] text-red-500 py-3">{remarkError}</p>
            ) : remarks.length === 0 ? (
              <Empty text="No remarks available." />
            ) : (
              <ul className="space-y-2.5">
                {remarks.map((r) => (
                  <li
                    key={r.id}
                    className="relative bg-amber-50 border-l-4 border-amber-400 rounded-r-lg pl-3 pr-3 py-2.5"
                  >
                    <p className="text-[12.5px] text-zinc-800 wrap-break-word leading-relaxed">
                      {r.remark}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </TabShell>
  );
}

function CircularProgress({ percent }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={r}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[14px] font-bold">{percent}%</span>
      </div>
    </div>
  );
}

function MiniStat({ Icon, label, value, tone, className = "" }) {
  const tones = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    sky: "text-sky-300",
  };
  return (
    <div
      className={`bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2.5 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={13} className={tones[tone] || "text-white"} />
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-blue-100">
          {label}
        </p>
      </div>
      <p className="mt-0.5 text-[18px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function Card({ title, Icon, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon size={15} />
            </div>
          )}
          <h3 className="text-[13.5px] font-bold text-[#02062c]">{title}</h3>
        </div>
        {badge != null && (
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3.5 sm:p-4">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-[12.5px] text-zinc-400 py-6 text-center">{text}</p>;
}

function ChecklistSkel() {
  return (
    <ul className="space-y-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50"
        >
          <div className="w-4 h-4 rounded-full bg-zinc-200 animate-pulse" />
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
