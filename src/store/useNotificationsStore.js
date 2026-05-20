import { create } from "zustand";

const API = "/api";
const LS_KEY = "admin_notif_seen_keys"; // stores a set of "source:id" strings

const readSeen = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
};

const writeSeen = (set) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
};

const safeJson = async (url) => {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const text = await r.text();
    if (!text || text.trim().startsWith("<")) return null;
    return JSON.parse(text);
  } catch { return null; }
};

const fmt = (s) => s || "";

export const useNotificationsStore = create((set, get) => ({
  items: [],            // unified list
  seen: readSeen(),
  loading: false,
  pollHandle: null,

  fetchNow: async () => {
    set({ loading: true });

    const [support, newEx, power, contractorBadges] = await Promise.all([
      safeJson(`${API}/get_contact_support.php`),
      safeJson(`${API}/get_new_exhibitors.php`),
      safeJson(`${API}/get_all_power_requirement.php`),
      safeJson(`${API}/get_all_contractor_badges.php`),
    ]);

    const items = [];

    // Contact Support
    const supportData = Array.isArray(support?.data) ? support.data
                     : Array.isArray(support)        ? support : [];
    supportData.forEach((r) => {
      items.push({
        key:      `support:${r.id}`,
        source:   "contact-support",
        sourceLabel: "Contact Support",
        sourceTab:   "contact-support",
        title:    r.name || r.company_name || "New support request",
        company:  r.company_name || "",
        subtitle: r.message || r.email || "",
        time:     r.submitted_at || r.created_at || "",
        sortKey:  new Date(r.submitted_at || 0).getTime() || parseInt(r.id, 10),
      });
    });

    // New Exhibitor Request
    const newExData = Array.isArray(newEx?.data) ? newEx.data
                    : Array.isArray(newEx)       ? newEx : [];
    newExData.forEach((r) => {
      items.push({
        key:      `newexhibitor:${r.id}`,
        source:   "new-exhibitor",
        sourceLabel: "New Exhibitor Request",
        sourceTab:   "new-exhibitor-request",
        title:    r.person_name || r.company_name || "New exhibitor signup",
        company:  r.company_name || "",
        subtitle: `${r.email || ""} · ${r.mobile || ""}`.replace(/^ · | · $/, ""),
        time:     r.submitted_at || r.created_at || "",
        sortKey:  new Date(r.submitted_at || 0).getTime() || parseInt(r.id, 10),
      });
    });

    // Power unlock requests
    const powerData = Array.isArray(power?.data) ? power.data : [];
    const seenCompaniesPower = new Set();
    powerData.forEach((r) => {
      const unlock = String(r.unlock_requested ?? "0") === "1";
      if (!unlock) return;
      const k = `${r.company_name}`;
      if (seenCompaniesPower.has(k)) return; // dedupe by company
      seenCompaniesPower.add(k);
      items.push({
        key:      `power-unlock:${r.id}`,
        source:   "power-unlock",
        sourceLabel: "Power Requirement",
        sourceTab:   "power-requirements",
        title:    `Power unlock requested`,
        company:  r.company_name || "",
        subtitle: `${r.company_name || ""} · ${r.day || ""}`,
        time:     r.created_at || r.updated_at || "",
        sortKey:  new Date(r.created_at || 0).getTime() || parseInt(r.id, 10),
      });
    });

    // Contractor badges — pending entries
    const cbData = Array.isArray(contractorBadges?.data) ? contractorBadges.data
                 : Array.isArray(contractorBadges)        ? contractorBadges : [];
    cbData.forEach((r) => {
      const pending = String(r.status || "").toLowerCase() === "pending"
                   || String(r.approved_status || "").toLowerCase() === "pending";
      if (!pending) return;
      items.push({
        key:      `contractor-badge:${r.id}`,
        source:   "contractor-badge",
        sourceLabel: "Contractor Badge",
        sourceTab:   "contractor-badges",
        title:    `Contractor badge request`,
        company:  r.exhibitor_company_name || r.company_name || "",
        subtitle: `${r.name || ""} · ${r.company || ""}`.replace(/^ · | · $/, ""),
        time:     r.created_at || "",
        sortKey:  new Date(r.created_at || 0).getTime() || parseInt(r.id, 10),
      });
    });

    items.sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0));
    set({ items, loading: false });
  },

  markAllRead: () => {
    const { items, seen } = get();
    const next = new Set(seen);
    items.forEach((n) => next.add(n.key));
    writeSeen(next);
    set({ seen: next });
  },

  markOneRead: (key) => {
    const { seen } = get();
    if (seen.has(key)) return;
    const next = new Set(seen);
    next.add(key);
    writeSeen(next);
    set({ seen: next });
  },

  unreadCount: () => {
    const { items, seen } = get();
    return items.filter((n) => !seen.has(n.key)).length;
  },

  startPolling: () => {
    const { pollHandle, fetchNow } = get();
    if (pollHandle) return;
    fetchNow();
    const h = setInterval(fetchNow, 60_000);
    set({ pollHandle: h });
  },

  stopPolling: () => {
    const { pollHandle } = get();
    if (pollHandle) clearInterval(pollHandle);
    set({ pollHandle: null });
  },
}));
