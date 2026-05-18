import { create } from "zustand";
import {
  fetchStallPayments,
  fetchPowerPayments,
  fetchBadgePayments,
} from "../api/paymentApi";
import { fetchStalls, fetchExhibitors } from "../api/profileApi";
import { fetchExhibitorPower } from "../api/powerApi";
import { getExhibitor } from "../api/base";

const sumPaid = (payments = []) =>
  payments.reduce((acc, p) => {
    const amt = parseFloat(p.amount_paid || p.amount || 0) || 0;
    const tds = parseFloat(p.tds || 0) || 0;
    return acc + amt + tds;
  }, 0);

export const BANK_DETAILS = [
  {
    bank: "Kotak Mahindra Bank",
    acc: "01992000000491",
    addr: "Defence Colony, New Delhi",
    ifsc: "KKBK0004620",
  },
  {
    bank: "HDFC BANK",
    acc: "99999811045088",
    addr: "Delhi",
    ifsc: "HDFC0000578",
  },
  {
    bank: "IndusInd Bank",
    acc: "259811045088",
    addr: "Karol Bagh, New Delhi",
    ifsc: "INDB0000169",
  },
  {
    bank: "Axis Bank",
    acc: "0032144225",
    addr: "Delhi",
    ifsc: "UTIB0005109",
  },
];

const buildStallSummary = (stalls = [], state = "") => {
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const acc = stalls.reduce(
    (s, stall) => {
      s.total += parseFloat(stall.total || 0);
      s.discounted_amount += parseFloat(stall.discounted_amount || 0);
      if (!s.currency && stall.currency) s.currency = stall.currency;
      s.stalls.push({
        stall_number: stall.stall_number,
        stall_category: stall.stall_category,
        stall_area: stall.stall_area,
        stall_price: stall.stall_price,
        currency: stall.currency,
      });
      return s;
    },
    {
      total: 0,
      discounted_amount: 0,
      sgst: 0,
      cgst: 0,
      igst: 0,
      grand_total: 0,
      currency: "",
      stalls: [],
    }
  );

  // recompute GST based on exhibitor state — ignore whatever the DB row stored
  const taxable = acc.total - acc.discounted_amount;
  if (isDelhi) {
    acc.sgst = taxable * 0.09;
    acc.cgst = taxable * 0.09;
    acc.igst = 0;
  } else {
    acc.sgst = 0;
    acc.cgst = 0;
    acc.igst = taxable * 0.18;
  }
  acc.grand_total = taxable + acc.sgst + acc.cgst + acc.igst;
  return acc;
};

const calcPowerTotals = (entries = [], state = "") => {
  const total = entries.reduce(
    (sum, e) => sum + (parseFloat(e.total_amount || 0) || 0),
    0
  );
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const sgst = isDelhi ? total * 0.09 : 0;
  const cgst = isDelhi ? total * 0.09 : 0;
  const igst = !isDelhi ? total * 0.18 : 0;
  return {
    totalPrice: total,
    sgst,
    cgst,
    igst,
    grandTotal: total + sgst + cgst + igst,
    rows: entries.map((e) => ({
      day: e.day,
      phase: e.phase,
      pricePerKw: e.price_per_kw,
      powerRequired: e.power_required,
      totalAmount: e.total_amount,
    })),
  };
};

const calcBadgeBilling = (extraBadges, state) => {
  const count = Number(extraBadges || 0);
  const rate = 100;
  const total = count * rate;
  const isDelhi = (state || "").trim().toLowerCase() === "delhi";
  const cgst = isDelhi ? total * 0.09 : 0;
  const sgst = isDelhi ? total * 0.09 : 0;
  const igst = !isDelhi ? total * 0.18 : 0;
  const grandTotal = total + cgst + sgst + igst;
  return { count, rate, total, cgst, sgst, igst, grandTotal, isDelhi };
};

export const usePaymentStore = create((set) => ({
  stallSummary: null,
  stallCleared: 0,
  power: { totalPrice: 0, sgst: 0, cgst: 0, igst: 0, grandTotal: 0, rows: [] },
  powerCleared: 0,
  badgeBilling: null,
  badgeCleared: 0,
  exhibitor: null,
  loading: false,

  fetchAll: async () => {
    const localEx = getExhibitor();
    const company = localEx?.company_name || "";
    if (!company) return;
    set({ loading: true });

    const safe = (p) => p.catch(() => null);
    const [stalls, powerEntries, stallPays, powerPays, badgePays, badgeData, exhibitorList] =
      await Promise.all([
        safe(fetchStalls()),
        safe(fetchExhibitorPower(company)).then((r) => r?.entries || []),
        safe(fetchStallPayments(company)).then((r) => r || []),
        safe(fetchPowerPayments(company)).then((r) => r || []),
        safe(fetchBadgePayments(company)).then((r) => r || []),
        safe(
          fetch(
            `/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(company)}`
          ).then((r) => r.json())
        ),
        safe(fetchExhibitors()),
      ]);

    // prefer the full DB record for state (localStorage may be missing it)
    const fullEx = Array.isArray(exhibitorList) && exhibitorList[0] ? exhibitorList[0] : localEx;
    const state = fullEx?.state || "";

    const stallSummary = buildStallSummary(stalls || [], state);
    const power = calcPowerTotals(powerEntries || [], state);
    const badgeBilling = calcBadgeBilling(badgeData?.extra_badges, state);

    set({
      stallSummary,
      stallCleared: sumPaid(stallPays),
      power,
      powerCleared: sumPaid(powerPays),
      badgeBilling,
      badgeCleared: sumPaid(badgePays),
      exhibitor: fullEx,
      loading: false,
    });
  },
}));
