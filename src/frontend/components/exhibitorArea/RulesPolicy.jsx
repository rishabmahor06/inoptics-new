import React, { useEffect, useState } from "react";
import {
  MdGavel, MdShield, MdInfoOutline, MdRefresh, MdAssignment,
} from "react-icons/md";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";

export default function RulesPolicy() {
  const [rulesDetails, setRulesDetails] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);

  const fetchRulesDetails = async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await fetch("https://inoptics.in/api/get_rules_details.php");
      if (!r.ok) throw new Error("Network error");
      const d = await r.json();
      setRulesDetails(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error("Failed to fetch Rules & Policy Details", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRulesDetails(); }, []);

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-[Quicksand,sans-serif]">
      <Breadcrumbs />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        {/* dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <MdGavel size={14} className="text-amber-300" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              Rules &amp; Policy
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif] leading-tight">
            Exhibitor{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Guidelines
            </span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[16px] text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Please review all rules and policies carefully before participating in InOptics 2026. Adherence ensures a smooth and successful experience for all exhibitors.
          </p>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <section className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-10 sm:-mt-12 mb-16 sm:mb-24 relative z-10 flex-1">

        {/* Top floating info card */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-5 sm:p-6 mb-8 flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
            <MdShield size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-[#02062c]">Important Notice</h3>
            <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed">
              By submitting your exhibitor application, you agree to comply with all rules,
              regulations, and policies outlined below. Non-compliance may result in stall cancellation
              without refund.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200" />
                  <div className="h-4 w-1/3 bg-zinc-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-zinc-100 rounded-full" />
                  <div className="h-3 w-5/6 bg-zinc-100 rounded-full" />
                  <div className="h-3 w-4/6 bg-zinc-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <MdInfoOutline size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-[#02062c] mb-1">Failed to Load</h3>
            <p className="text-[13px] text-zinc-500 mb-5 max-w-md mx-auto">
              Could not fetch rules and policies. Please check your connection and try again.
            </p>
            <button
              onClick={fetchRulesDetails}
              className="inline-flex items-center gap-2 px-5 h-11 bg-[#02062c] hover:bg-[#0a1450] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              <MdRefresh size={16} /> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rulesDetails.length === 0 && (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <MdAssignment size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-[#02062c] mb-1">No Rules Found</h3>
            <p className="text-[13px] text-zinc-500 max-w-md mx-auto">
              Rules &amp; policy details have not been published yet. Please check back later.
            </p>
          </div>
        )}

        {/* Rules list */}
        {!loading && !error && rulesDetails.length > 0 && (
          <div className="space-y-5">
            {rulesDetails.map((item, idx) => (
              <RuleCard key={item.id || idx} item={item} index={idx} />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!loading && !error && rulesDetails.length > 0 && (
          <div className="mt-10 bg-gradient-to-br from-zinc-900 to-[#02062c] rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <p className="relative text-[12px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-2">
              Need help?
            </p>
            <h3 className="relative text-xl sm:text-2xl font-light tracking-tight font-[Playfair_Display,serif]">
              Have questions about a specific rule?
            </h3>
            <p className="relative text-[13px] text-blue-200 mt-2 max-w-md mx-auto">
              Our exhibitor relations team is happy to clarify any concerns before you finalize your registration.
            </p>
            <a
              href="/contact"
              className="relative mt-5 inline-flex items-center gap-2 px-5 h-11 bg-amber-400 hover:bg-amber-300 text-[#02062c] text-[12px] font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Contact Support
            </a>
          </div>
        )}
      </section>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============ Rule card ============ */
function RuleCard({ item, index }) {
  const tints = [
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-purple-500 to-pink-500",
    "from-rose-500 to-red-500",
    "from-indigo-500 to-blue-500",
  ];
  const tint = tints[index % tints.length];

  return (
    <article
      className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
      style={{ animation: "fadeUp 0.45s ease both", animationDelay: `${index * 60}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tint}`} />

      <div className="p-6 sm:p-8">
        {/* number + title (if present) */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${tint} text-white shadow-md font-black text-[15px] tracking-wider`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.title ? (
            <h2
              className="text-[17px] sm:text-[19px] font-bold text-[#02062c] tracking-tight leading-snug
                [&_strong]:font-bold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: item.title }}
            />
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                Rule
              </span>
              <span className="text-[15px] font-bold text-[#02062c]">
                Section {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        <div
          className="
            text-[14px] sm:text-[15px] text-zinc-700 leading-relaxed pl-0 sm:pl-14
            [&_p]:mb-3 [&_p:last-child]:mb-0
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#02062c] [&_h1]:mb-3
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#02062c] [&_h2]:mb-3
            [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#02062c] [&_h3]:mb-2
            [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:mb-3
            [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
            [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-blue-500 [&_ul_li]:before:font-bold [&_ul_li]:before:shrink-0 [&_ul_li]:before:mt-0.5
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-3
            [&_strong]:font-bold [&_strong]:text-[#02062c]
            [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-blue-800
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_table]:mb-3
            [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-zinc-200
            [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-zinc-100
          "
          dangerouslySetInnerHTML={{
            __html: item.description || "<p>No description available.</p>",
          }}
        />
      </div>
    </article>
  );
}
