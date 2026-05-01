import React, { useEffect, useMemo, useState } from "react";
import {
  MdSearch, MdSort, MdArrowUpward, MdArrowDownward,
  MdLanguage, MdLocationOn, MdPerson, MdStorefront,
  MdChevronLeft, MdChevronRight,
} from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const ALPHABET = ["All", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function ExhibitorList() {
  const [entriesPerPage,   setEntriesPerPage]   = useState(10);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedAlphabet, setSelectedAlphabet] = useState("All");
  const [mergedData,       setMergedData]       = useState([]);
  const [visibleLabels,    setVisibleLabels]    = useState([]);
  const [isCardActive,     setIsCardActive]     = useState(false);
  const [sortField,        setSortField]        = useState("");
  const [sortOrder,        setSortOrder]        = useState("asc");
  const [loading,          setLoading]          = useState(true);

  /* card settings */
  useEffect(() => {
    fetch("https://inoptics.in/api/get_exhibitor_card_settings.php")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.status?.toLowerCase() === "active") {
          setIsCardActive(true);
          setVisibleLabels(d.labels || []);
        }
      })
      .catch((e) => console.error("Failed to fetch card settings", e));
  }, []);

  /* exhibitor data merge */
  useEffect(() => {
    (async () => {
      try {
        const [stallsRes, brandsRes, exhibitorsRes] = await Promise.all([
          fetch("https://inoptics.in/api/get_all_stalls.php"),
          fetch("https://inoptics.in/api/get_all_exhibitor_brands.php"),
          fetch("https://inoptics.in/api/get_exhibitors.php"),
        ]);
        const stalls     = await stallsRes.json();
        const brandsJson = await brandsRes.json();
        const exhibitors = await exhibitorsRes.json();

        const brandMap = {};
        (Array.isArray(brandsJson.data) ? brandsJson.data : []).forEach((b) => {
          brandMap[b.Company_name] = b;
        });

        const exhibitorMap = {};
        (Array.isArray(exhibitors) ? exhibitors : []).forEach((e) => {
          exhibitorMap[e.company_name] = e;
        });

        const merged = (Array.isArray(stalls) ? stalls : []).map((s) => {
          const companyName = s.company_name || "N/A";
          const brandInfo   = brandMap[companyName] || {};
          const exhibInfo   = exhibitorMap[companyName] || {};
          return {
            stallNo:             s.stall_number    || "N/A",
            stallCategory:       s.stall_category  || "N/A",
            companyName,
            homeBrands:          brandInfo.Home_brands           || "",
            distributingBrands:  brandInfo.Distributors          || "",
            internationalBrands: brandInfo.International_brands  || "",
            website:             brandInfo.Website               || "",
            name:                exhibInfo.name  || "",
            city:                exhibInfo.city  || "",
            state:               exhibInfo.state || "",
            pincode:             exhibInfo.pin   || "",
          };
        });

        merged.sort((a, b) => {
          const numA = parseInt(a.stallNo);
          const numB = parseInt(b.stallNo);
          return isNaN(numA) || isNaN(numB)
            ? a.stallNo.localeCompare(b.stallNo)
            : numA - numB;
        });

        setMergedData(merged);
      } catch (err) {
        console.error("Failed to fetch exhibitor data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...mergedData];
    if (selectedAlphabet !== "All") {
      list = list.filter((ex) =>
        selectedAlphabet === "#"
          ? /^[^A-Za-z]/.test(ex.companyName)
          : ex.companyName.toUpperCase().startsWith(selectedAlphabet),
      );
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter((ex) => ex.companyName.toLowerCase().includes(q));
    }
    if (sortField) {
      list.sort((a, b) => {
        const va = a[sortField]?.toString().toLowerCase() || "";
        const vb = b[sortField]?.toString().toLowerCase() || "";
        if (va < vb) return sortOrder === "asc" ? -1 : 1;
        if (va > vb) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [mergedData, selectedAlphabet, searchQuery, sortField, sortOrder]);

  const isAlphabetFilterActive = selectedAlphabet !== "All";
  const totalPages   = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const currentEntries = isAlphabetFilterActive
    ? filtered
    : filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const has = (label) => visibleLabels.includes(label);

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">Visitor Guide</span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
            Exhibitor List
          </h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-zinc-500">
            {loading ? "Loading exhibitors..." : `${mergedData.length} exhibitors`}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5 mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            <div className="lg:col-span-6 relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search exhibitors..."
                className="w-full h-11 pl-10 pr-4 text-[14px] bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="lg:col-span-4 flex gap-2">
              <div className="relative flex-1">
                <MdSort size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-[14px] bg-zinc-50 border border-zinc-200 rounded-lg appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sort by…</option>
                  <option value="companyName">Company Name</option>
                  <option value="name">Contact Name</option>
                  <option value="state">State</option>
                  <option value="city">City</option>
                  <option value="stallNo">Stall No</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
                className="px-3 h-11 text-[12px] font-bold uppercase tracking-wider bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {sortOrder === "asc" ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
                {sortOrder.toUpperCase()}
              </button>
            </div>

            <div className="lg:col-span-2">
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full h-11 px-3 text-[14px] bg-zinc-50 border border-zinc-200 rounded-lg appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-zinc-100">
            {ALPHABET.map((char) => (
              <button
                key={char}
                onClick={() => { setSelectedAlphabet(char); setCurrentPage(1); }}
                className={`min-w-9 h-9 px-2.5 text-[12px] font-bold rounded-lg transition-all
                  ${selectedAlphabet === char
                    ? "bg-[#02062c] text-white"
                    : "bg-zinc-50 text-zinc-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {!isCardActive ? (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center text-zinc-400">
            <MdStorefront size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">Exhibitor cards coming soon...</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-5 h-72 animate-pulse">
                <div className="h-4 w-16 bg-zinc-200 rounded mb-3" />
                <div className="h-6 w-3/4 bg-zinc-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-zinc-100 rounded" />
                  <div className="h-3 w-5/6 bg-zinc-100 rounded" />
                  <div className="h-3 w-2/3 bg-zinc-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 text-center text-zinc-400">
            <MdSearch size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">No exhibitors match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {currentEntries.map((ex, i) => (
              <ExhibitorCard key={i} ex={ex} has={has} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isAlphabetFilterActive && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg bg-white border border-zinc-200 hover:bg-blue-50 hover:border-blue-300 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <MdChevronLeft size={20} />
            </button>
            {paginationRange(currentPage, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2 text-zinc-400">…</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-10 h-10 px-3 text-[13px] font-semibold rounded-lg transition-all
                    ${currentPage === p
                      ? "bg-[#02062c] text-white"
                      : "bg-white text-zinc-700 border border-zinc-200 hover:bg-blue-50 hover:border-blue-300"}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg bg-white border border-zinc-200 hover:bg-blue-50 hover:border-blue-300 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

/* ============ card ============ */
function ExhibitorCard({ ex, has }) {
  return (
    <div className="group bg-white rounded-2xl border border-zinc-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all overflow-hidden">
      <div className="bg-gradient-to-r from-[#02062c] to-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {has("STALL NO") && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 rounded px-2 py-1">
              <MdStorefront size={13} className="text-amber-300" /> Stall {ex.stallNo}
            </span>
          )}
          {has("STALL CATEGORY") && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
              {ex.stallCategory}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {has("COMPANY NAME") && (
          <h3 className="text-[16px] sm:text-[17px] font-bold text-[#02062c] uppercase tracking-tight leading-snug mb-3 group-hover:text-blue-600 transition-colors">
            {ex.companyName}
          </h3>
        )}

        <div className="space-y-1.5 text-[13px] text-zinc-600">
          {has("NAME") && ex.name && (
            <Row icon={<MdPerson size={14} />} label="Name" value={ex.name} />
          )}
          {(has("CITY") || has("STATE") || has("PINCODE")) && (ex.city || ex.state || ex.pincode) && (
            <Row
              icon={<MdLocationOn size={14} />}
              label="Location"
              value={[has("CITY") && ex.city, has("STATE") && ex.state, has("PINCODE") && ex.pincode].filter(Boolean).join(", ")}
            />
          )}
        </div>

        {(has("HOME BRANDS") || has("DISTRIBUTORS OF BRANDS") || has("INTERNATIONAL BRANDS")) && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Brands on Display
            </p>
            <div className="space-y-2">
              {has("HOME BRANDS") && ex.homeBrands && (
                <BrandRow color="bg-blue-50 text-blue-700 border-blue-200" label="Home" brands={ex.homeBrands} />
              )}
              {has("DISTRIBUTORS OF BRANDS") && ex.distributingBrands && (
                <BrandRow color="bg-emerald-50 text-emerald-700 border-emerald-200" label="Distributors" brands={ex.distributingBrands} />
              )}
              {has("INTERNATIONAL BRANDS") && ex.internationalBrands && (
                <BrandRow color="bg-purple-50 text-purple-700 border-purple-200" label="International" brands={ex.internationalBrands} />
              )}
            </div>
          </div>
        )}

        {has("WEBSITE") && ex.website && (
          <a
            href={ex.website.startsWith("http") ? ex.website : `https://${ex.website}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-800 break-all"
          >
            <MdLanguage size={14} />
            {ex.website}
          </a>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 w-5 h-5 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
        {icon}
      </span>
      <div>
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">{label}: </span>
        <span className="text-[13px] text-zinc-700">{value}</span>
      </div>
    </div>
  );
}

function BrandRow({ color, label, brands }) {
  const list = brands.split(",").map((b) => b.trim()).filter(Boolean);
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {list.map((b, i) => (
          <span key={i} className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${color}`}>
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

function paginationRange(current, total) {
  const delta = 2;
  const range = [];
  const out   = [];
  let l;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
  }
  range.forEach((i) => {
    if (l) {
      if (i - l === 2) out.push(l + 1);
      else if (i - l !== 1) out.push("...");
    }
    out.push(i);
    l = i;
  });
  return out;
}
