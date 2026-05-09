import { create } from "zustand";
import {
  fetchEventSchedule,
  fetchRemarks,
  fetchUndertakingStatus,
  fetchContractorUndertakingStatus,
  fetchPowerRequirement,
  fetchExhibitorBadges,
  fetchSelectedContractors,
  fetchContractorBadges,
  fetchBrands,
} from "../api/dashboardApi";
import { getExhibitor } from "../api/base";

export const useDashboardStore = create((set) => ({
  eventSchedule: [],
  remarks: [],
  activities: [],
  loading: false,
  remarkError: "",

  fetchAll: async () => {
    const ex = getExhibitor();
    const company = ex?.company_name || "";
    set({ loading: true, remarkError: "" });

    const safe = (p) => p.catch(() => null);
    const [
      eventRes,
      remarksRes,
      undertakingRes,
      contractorUtRes,
      powerRes,
      badgesRes,
      contractorsRes,
      contractorBadgesRes,
      brandsRes,
    ] = await Promise.all([
      safe(fetchEventSchedule()),
      company ? safe(fetchRemarks(company)) : Promise.resolve([]),
      company ? safe(fetchUndertakingStatus(company)) : Promise.resolve(null),
      company ? safe(fetchContractorUndertakingStatus(company)) : Promise.resolve(null),
      company ? safe(fetchPowerRequirement(company)) : Promise.resolve([]),
      company ? safe(fetchExhibitorBadges(company)) : Promise.resolve(null),
      company ? safe(fetchSelectedContractors(company)) : Promise.resolve(null),
      company ? safe(fetchContractorBadges(company)) : Promise.resolve([]),
      company ? safe(fetchBrands(company)) : Promise.resolve(null),
    ]);

    const undertakingDone = !!(undertakingRes?.undertaking_accepted);
    const contractorUtDone = !!(contractorUtRes?.undertaking_accepted);
    const powerDone = Array.isArray(powerRes) && powerRes.length > 0;
    const extraBadges = Number(badgesRes?.extra_badges || 0);
    const badgesLocked = Number(badgesRes?.is_locked) === 1;
    const badgesDone = extraBadges > 0 || badgesLocked;
    const contractorSelected =
      !!(contractorsRes?.contractor_company_name) &&
      Number(contractorsRes?.is_locked) === 1;
    const contractorBadgeLocked =
      Array.isArray(contractorBadgesRes) &&
      contractorBadgesRes.some((r) => Number(r.is_locked) === 1);
    const brandLocked = Number(brandsRes?.data?.is_locked) === 1;

    const activities = [
      { id: "undertaking",          name: "Undertaking Agreed",                 done: undertakingDone },
      { id: "appointed-contractor", name: "Appointed Contractor & Badges",      done: contractorBadgeLocked },
      { id: "contractor-ut",        name: "Contractor Undertaking",             done: contractorUtDone },
      { id: "contractor-reg",       name: "Contractor Registration",            done: contractorSelected },
      { id: "power",                name: "Power Requirement",                  done: powerDone },
      { id: "extra-badge",          name: "Extra Exhibitor Badge",              done: badgesDone },
      { id: "brands",               name: "Brands",                             done: brandLocked },
    ];

    set({
      eventSchedule: eventRes || [],
      remarks: Array.isArray(remarksRes) ? remarksRes : [],
      remarkError: remarksRes === null ? "Failed to load remarks" : "",
      activities,
      loading: false,
    });
  },
}));
