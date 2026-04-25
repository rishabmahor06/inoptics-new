import React, { useEffect, useState } from 'react';
import {
  MdPeople, MdPayment, MdPersonAdd, MdSupportAgent,
  MdTableChart, MdChair, MdElectricBolt, MdBusiness,
  MdGridView, MdLocationCity, MdCategory, MdRefresh,
  MdTrendingUp, MdVisibility, MdAssignment, MdNotifications,
  MdQuestionAnswer,
} from 'react-icons/md';

import visitorsImg   from '../assets/Admin_VisitorsCounts.jpg';
import exhibitorsImg from '../assets/Admin_Exhivitors.jpg';
import formsImg      from '../assets/Admin_forms.jpg';
import paymentsImg   from '../assets/Admin_payments.jpg';
import remindersImg  from '../assets/Admin_Remainder.jpg';
import inquiryImg    from '../assets/feedbacks.jpg';

const API = 'https://inoptics.in/api';
const get = (ep) => fetch(`${API}/${ep}`).then(r => r.json()).catch(() => []);

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

/* ── Banner card ── */
function BannerCard({ title, count, icon: Icon, bgImage, loading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm group cursor-pointer h-24 sm:h-28 lg:h-full">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.25) 100%)' }} />
      <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="p-1.5 sm:p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon size={14} className="text-white sm:hidden" />
            <Icon size={18} className="text-white hidden sm:block" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/80 bg-white/15 px-1.5 py-0.5 rounded-full border border-white/20">
            Live
          </span>
        </div>
        <div>
          {loading
            ? <div className="h-6 sm:h-9 w-12 bg-white/20 rounded animate-pulse mb-0.5" />
            : <p className="text-[26px] sm:text-[34px] lg:text-[38px] font-black text-white leading-none drop-shadow">{count ?? '—'}</p>
          }
          <p className="text-[10px] sm:text-[11px] lg:text-[12px] font-semibold text-white/85 mt-0.5 leading-tight">{title}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm px-3 py-3 flex items-center gap-2.5 hover:shadow-md transition-shadow">
      <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
        <Icon size={17} style={{ color }} className="sm:hidden" />
        <Icon size={20} style={{ color }} className="hidden sm:block" />
      </div>
      <div className="min-w-0 flex-1">
        {loading
          ? <div className="h-5 w-10 bg-zinc-100 rounded animate-pulse mb-0.5" />
          : <p className="text-[18px] sm:text-[20px] font-bold text-zinc-900 leading-none">{value ?? '—'}</p>
        }
        <p className="text-[9px] sm:text-[10px] font-medium text-zinc-500 mt-0.5 leading-tight line-clamp-2 lg:line-clamp-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Status badge ── */
function Badge({ text, color }) {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-600 border-red-200',
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    zinc:  'bg-zinc-100 text-zinc-500 border-zinc-200',
  };
  return (
    <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded border whitespace-nowrap ${map[color] || map.zinc}`}>
      {text}
    </span>
  );
}

/* ── Table card ── */
function TableCard({ title, subtitle, icon: Icon, iconBg, iconColor, badge, headers, rows, loading, emptyMsg = 'No data' }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm flex flex-col overflow-hidden min-h-60 lg:min-h-0">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-zinc-50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <Icon size={13} style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-zinc-800 leading-none">{title}</p>
            {subtitle && <p className="text-[10px] text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && <div className="shrink-0 ml-2">{badge}</div>}
      </div>
      {/* Table header */}
      <div className="flex shrink-0 border-b border-zinc-100 bg-zinc-50">
        {headers.map(h => (
          <div key={h} className="flex-1 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">{h}</div>
        ))}
      </div>
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center px-3 py-2.5 border-b border-zinc-50 gap-3">
              {headers.map((_, j) => (
                <div key={j} className="flex-1 h-3 bg-zinc-100 rounded animate-pulse" />
              ))}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-[11px] text-zinc-300">{emptyMsg}</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="flex items-center border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors">
              {row.map((cell, j) => (
                <div key={j} className="flex-1 px-3 py-2.5 text-[11px] text-zinc-700 min-w-0">{cell}</div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]           = useState({});
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const [exhibitors, newExhibitors, support, stalls, availStalls,
           halls, categories, payments, furniture, power, business, contractors] =
      await Promise.all([
        get('get_exhibitors.php'),        get('get_new_exhibitors.php'),
        get('get_contact_support.php'),   get('get_stall_data.php'),
        get('get_available_stalls.php'),  get('get_hall_numbers.php'),
        get('get_stall_category.php'),    get('fetch_all_payments.php'),
        get('get_furniture_requirement.php'), get('get_power_requirement.php'),
        get('get_business_requirement.php'), get('get_contractor_booth.php'),
      ]);
    setData({ exhibitors, newExhibitors, support, stalls, availStalls,
              halls, categories, payments, furniture, power, business, contractors });
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadAll(); }, []);

  const arr = (k) => Array.isArray(data[k]) ? data[k] : [];
  const len = (k) => arr(k).length;

  const paidPayments    = arr('payments').filter(p => ['paid','Paid'].includes(p.status || p.payment_status));
  const pendingPayments = arr('payments').filter(p => ['pending','Pending'].includes(p.status || p.payment_status));
  const openTickets     = arr('support').filter(s => !s.status || ['open','pending'].includes(s.status?.toLowerCase()));

  const bannerCards = [
    { title: 'Visitors Counts',   count: 120,               icon: MdVisibility,     bgImage: visitorsImg   },
    { title: 'Exhibitors Counts', count: len('exhibitors'),  icon: MdPeople,         bgImage: exhibitorsImg },
    { title: 'Forms',             count: 42,                icon: MdAssignment,     bgImage: formsImg      },
    { title: 'Payment Details',   count: len('payments'),   icon: MdPayment,        bgImage: paymentsImg   },
    { title: 'Reminders',         count: 10,                icon: MdNotifications,  bgImage: remindersImg  },
    { title: 'Inquiries',         count: len('support'),    icon: MdQuestionAnswer, bgImage: inquiryImg    },
  ];

  const statCards = [
    { icon: MdTableChart,   label: 'Total Stalls',    value: len('stalls'),      color: '#3b82f6' },
    { icon: MdGridView,     label: 'Avail. Stalls',   value: len('availStalls'), color: '#06b6d4' },
    { icon: MdLocationCity, label: 'Halls',           value: len('halls'),       color: '#8b5cf6' },
    { icon: MdCategory,     label: 'Categories',      value: len('categories'),  color: '#f97316' },
    { icon: MdChair,        label: 'Furniture',       value: len('furniture'),   color: '#ec4899' },
    { icon: MdElectricBolt, label: 'Power Types',     value: len('power'),       color: '#eab308' },
    { icon: MdBusiness,     label: 'Business',        value: len('business'),    color: '#14b8a6' },
    { icon: MdTrendingUp,   label: 'Contractors',     value: len('contractors'), color: '#64748b' },
  ];

  const recentExhibitors = arr('exhibitors').slice(-8).reverse();
  const recentNewReqs    = arr('newExhibitors').slice(-8).reverse();
  const recentPayments   = arr('payments').slice(-8).reverse();
  const recentSupport    = arr('support').slice(-8).reverse();

  return (
    /*
      Mobile/tablet: normal scrollable page (space-y layout)
      Desktop (lg+): fixed viewport height, no page scroll (flex-col fills screen)
    */
    <div className="p-3 sm:p-4 space-y-3 lg:space-y-0 lg:gap-2.5 lg:p-3 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">

      {/* ── Row 1: Header ── */}
      <div className="flex items-center justify-between lg:shrink-0">
        <div>
          <p className="text-[13px] sm:text-[14px] font-bold text-zinc-700 leading-none">Admin Dashboard</p>
          <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">{today}</p>
        </div>
        <button onClick={() => loadAll(true)} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-60">
          <MdRefresh size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* ── Row 2: Banner cards ── */}
      {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 6 cols fixed height */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 lg:shrink-0" style={{ '--banner-h': '148px' }}>
        <div className="contents lg:hidden">
          {bannerCards.map(c => <BannerCard key={c.title} {...c} loading={loading} />)}
        </div>
        <div className="hidden lg:contents">
          {bannerCards.map(c => (
            <div key={c.title} style={{ height: 148 }}>
              <BannerCard {...c} loading={loading} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: Stat cards ── */}
      {/* Mobile: 2 cols | Tablet: 4 cols | Desktop: 8 cols */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 lg:shrink-0">
        {statCards.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* ── Row 4: Tables ── */}
      {/* Mobile: 1 col stacked | Desktop: 2×2 grid filling remaining space */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:flex-1 lg:min-h-0">

        <TableCard
          title="Recent Exhibitors"
          subtitle={`${len('exhibitors')} total registered`}
          icon={MdPeople} iconBg="#ede9fe" iconColor="#7c3aed"
          loading={loading} emptyMsg="No exhibitors found"
          headers={['Company', 'Type', 'Status']}
          rows={recentExhibitors.map(e => [
            <span className="font-medium text-zinc-800 truncate block" title={e.company_name}>{e.company_name || '—'}</span>,
            <span className="text-zinc-500 truncate">{e.stall_type || e.type || '—'}</span>,
            <Badge text={e.status || 'Active'} color={e.status === 'Inactive' ? 'zinc' : 'green'} />,
          ])}
        />

        <TableCard
          title="New Requests"
          subtitle={`${len('newExhibitors')} awaiting review`}
          icon={MdPersonAdd} iconBg="#fef3c7" iconColor="#d97706"
          badge={len('newExhibitors') > 0 ? <Badge text={`${len('newExhibitors')} Pending`} color="amber" /> : null}
          loading={loading} emptyMsg="No new requests"
          headers={['Name', 'Company', 'Date']}
          rows={recentNewReqs.map(r => [
            <span className="font-medium text-zinc-800 truncate">{r.name || r.full_name || '—'}</span>,
            <span className="text-zinc-500 truncate">{r.company_name || r.company || '—'}</span>,
            <span className="text-zinc-400 whitespace-nowrap text-[10px]">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}</span>,
          ])}
        />

        <TableCard
          title="Recent Payments"
          subtitle={`${paidPayments.length} paid · ${pendingPayments.length} pending`}
          icon={MdPayment} iconBg="#d1fae5" iconColor="#059669"
          badge={
            <div className="flex gap-1">
              <Badge text={`${paidPayments.length} Paid`} color="green" />
              <Badge text={`${pendingPayments.length} Pending`} color="amber" />
            </div>
          }
          loading={loading} emptyMsg="No payment records"
          headers={['Company', 'Amount', 'Status']}
          rows={recentPayments.map(p => [
            <span className="font-medium text-zinc-800 truncate">{p.company_name || p.exhibitor_name || '—'}</span>,
            <span className="font-semibold text-zinc-800 whitespace-nowrap text-[10px]">
              {p.amount ? `₹${parseFloat(p.amount).toLocaleString('en-IN')}` : '—'}
            </span>,
            <Badge text={p.status || p.payment_status || 'Unknown'}
              color={(p.status || p.payment_status || '').toLowerCase() === 'paid' ? 'green' : 'amber'} />,
          ])}
        />

        <TableCard
          title="Contact Support"
          subtitle={`${openTickets.length} open · ${len('support')} total`}
          icon={MdSupportAgent} iconBg="#fee2e2" iconColor="#dc2626"
          badge={openTickets.length > 0
            ? <Badge text={`${openTickets.length} Open`} color="red" />
            : <Badge text="All Resolved" color="green" />}
          loading={loading} emptyMsg="No support tickets"
          headers={['Name', 'Subject', 'Status']}
          rows={recentSupport.map(s => [
            <span className="font-medium text-zinc-800 truncate">{s.name || s.full_name || '—'}</span>,
            <span className="text-zinc-500 truncate">{s.subject || s.message?.slice(0, 25) || '—'}</span>,
            <Badge text={s.status || 'Open'}
              color={['resolved','Resolved'].includes(s.status) ? 'green' : 'amber'} />,
          ])}
        />
      </div>
    </div>
  );
}
