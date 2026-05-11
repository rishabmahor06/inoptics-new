import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import exhibitorImage from "../../../assets/llll.png";
import Navbar from "../Navbar";
import Footer from "../Footer";

/* ── Tab config ── */
const TABS = {
  exhibitor: {
    key: "exhibitor",
    label: "Exhibitor",
    route: "/exhibitor-login",
    api: "https://inoptics.in/api/exhibitor_login.php",
    flagKey: "isExhibitorLoggedIn",
    infoKey: "exhibitorInfo",
    dashboard: "/exhibitor-dashboard",
    eyebrow: "Exhibitor Portal",
    showReg: true,
    accent: "#2563EB",
    accentDark: "#1D4ED8",
    accentBg: "rgba(37,99,235,0.09)",
    accentRing: "rgba(37,99,235,0.22)",
    storeInfo: (result, email) => JSON.stringify(result.data || { email }),
  },
  admin: {
    key: "admin",
    label: "Admin",
    route: "/admin-login",
    api: "https://inoptics.in/api/login.php",
    flagKey: "isAdminLoggedIn",
    infoKey: "adminEmail",
    dashboard: "/dashboard",
    eyebrow: "Admin Console",
    showReg: false,
    accent: "#D97706",
    accentDark: "#B45309",
    accentBg: "rgba(217,119,6,0.09)",
    accentRing: "rgba(217,119,6,0.22)",
    storeInfo: (_, email) => email,
  },
};

/* ── Floating label input ── */
const FloatInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  accentColor,
  accentRing,
  children,
}) => {
  const [focused, setFocused] = useState(false);
  const filled = value?.length > 0;
  const float = focused || filled;

  return (
    <div className="relative">
      <label
        className="absolute left-4 pointer-events-none z-10 font-medium transition-all duration-200"
        style={{
          fontFamily: "'Inter', sans-serif",
          top: float ? -9 : "50%",
          transform: float
            ? "translateY(0) scale(0.78)"
            : "translateY(-50%) scale(1)",
          transformOrigin: "left center",
          color: focused ? accentColor : "#9CA3AF",
          background: float ? "#fff" : "transparent",
          padding: float ? "0 4px" : "0",
          fontSize: 14,
        }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused ? (name === "email" ? "you@example.com" : "••••••••") : ""
          }
          className="w-full h-[52px] px-4 text-[14.5px] font-normal text-gray-900 bg-white rounded-xl outline-none transition-all duration-200"
          style={{
            fontFamily: "'Inter', sans-serif",
            paddingRight: children ? 48 : 16,
            border: `2px solid ${focused ? accentColor : "#E5E7EB"}`,
            boxShadow: focused ? `0 0 0 4px ${accentRing}` : "none",
          }}
        />
        {children && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function ExhibitorLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const initTab = location.pathname === "/admin-login" ? "admin" : "exhibitor";
  const [activeTab, setActiveTab] = useState(initTab);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState([]);
  const [detailLoad, setDetailLoad] = useState(true);

  const tab = TABS[activeTab];
  const isExhibitor = activeTab === "exhibitor";

  useEffect(() => {
    const next = location.pathname === "/admin-login" ? "admin" : "exhibitor";
    if (next !== activeTab) setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (localStorage.getItem(tab.flagKey)) {
      navigate(tab.dashboard, { replace: true });
    }
  }, [tab, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitor_login.php");
        const d = await r.json();
        setDetails(Array.isArray(d) ? d : []);
      } catch {
        /* silent */
      } finally {
        setDetailLoad(false);
      }
    })();
  }, []);

  const switchTab = (key) => {
    if (key === activeTab) return;
    setError("");
    setFormData({ email: "", password: "" });
    setShowPw(false);
    setActiveTab(key);
    navigate(TABS[key].route, { replace: false });
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(tab.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem(tab.flagKey, "true");
        localStorage.setItem(
          tab.infoKey,
          tab.storeInfo(result, formData.email)
        );
        navigate(tab.dashboard, { replace: true });
      } else {
        setError(result.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-6px); }
          60%     { transform:translateX(6px); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .panel-fade { animation: fadeUp 0.5s ease both; }
        .tab-track { transition: transform 0.32s cubic-bezier(0.34,1.4,0.64,1); }
      `}</style>

      <div
        className="min-h-screen flex flex-col bg-white"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ═══════════ TOP NAVBAR ═══════════ */}
        <Navbar />

        {/* ═══════════ MAIN — LOGIN LAYOUT ═══════════ */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-170">
        {/* ═══════════ LEFT — IMAGE PANEL ═══════════ */}
        <div className="hidden lg:flex relative w-4/6 overflow-hidden self-stretch">
          {/* Background image */}
          <img
            src={exhibitorImage}
            alt="InOptics 2026"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Brightening + tint overlays */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/35 via-indigo-700/35 to-slate-900/55" />
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at 30% 30%, ${tab.accent}33 0%, transparent 60%)`,
            }}
          />
          {/* Dots grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full text-white panel-fade">
            {/* Top: brand pill */}
            <div>
              <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-full px-4 py-1.5 shadow-lg">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#f97316)",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <circle cx="" cy="7" r="2.4" fill="#fff" />
                    <line x1="7" y1="1.5" x2="7" y2="3.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="7" y1="10.6" x2="7" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="1.5" y1="7" x2="3.4" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="10.6" y1="7" x2="12.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold tracking-[0.22em] text-white">
                  INOPTICS 2026
                </span>
                <span className="text-white/55 text-[10px]">· Portal</span>
              </div>
            </div>

            {/* Middle: heading + API content */}
            <div className="max-w-md">
              <div className="flex items-center gap-2.5 mb-5">
                <span
                  className="block w-7 h-px"
                  style={{ background: tab.accent }}
                />
                <span
                  className="text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300"
                  style={{ color: tab.accent }}
                >
                  {tab.eyebrow}
                </span>
              </div>

              <h1
                className="text-white leading-[1.05] mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem, 3.6vw, 3rem)",
                  fontWeight: 700,
                }}
              >
                Smarter{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#FCD34D",
                  }}
                >
                  Exhibitions.
                </em>
                <br />
                Seamless{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#FCD34D",
                  }}
                >
                  Operations.
                </em>
              </h1>

              {/* API content / fallback */}
              <div className="mb-6">
                {detailLoad ? (
                  <div className="space-y-2 animate-pulse">
                    {[80, 95, 70].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 rounded-full bg-white/15"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                ) : details.length > 0 ? (
                  details.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="text-white/85 text-[13.5px] leading-relaxed font-light [&_p]:mb-1.5 [&_strong]:text-white [&_strong]:font-semibold [&_a]:text-amber-300"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ))
                ) : (
                  <p className="text-white/85 text-[14px] leading-relaxed font-light">
                    Manage stalls, payments, badges and event operations from a
                    single command center built for InOptics 2026.
                  </p>
                )}
              </div>

              {/* Feature list */}
              <div className="space-y-2.5">
                {[
                  ["Secure Access", "Industry-standard encryption"],
                  ["Real-time Dashboard", "Live stall & visitor data"],
                  ["Verified Portal", "Authenticated accounts only"],
                ].map(([title, sub], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors duration-500"
                      style={{
                        background: `${tab.accent}33`,
                        borderColor: `${tab.accent}66`,
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 16 16"
                        stroke="#fff"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8l3 3.5L13 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-[12.5px] font-semibold leading-tight">
                        {title}
                      </p>
                      <p className="text-white/65 text-[11px] leading-tight">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: small tagline */}
            <p className="text-[11.5px] text-white/65 font-medium">
              © InOptics 2026 — Powered by RSD Expositions
            </p>
          </div>
        </div>

        {/* ═══════════ RIGHT — LOGIN FORM ═══════════ */}
        <div className="relative flex-1 flex items-center justify-center min-h-screen bg-white px-4 sm:px-8 py-10">
          {/* Mobile background image */}
          <div className="lg:hidden absolute inset-0">
            <img
              src={exhibitorImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 via-indigo-700/45 to-slate-900/70" />
          </div>

          <div className="relative z-10 w-full max-w-110 panel-fade">
            <div
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
              style={{ boxShadow: "0 30px 80px rgba(10, 20, 60, 0.18)" }}
            >
              {/* Tab strip */}
              <div className="px-7 sm:px-8 pt-7">
                <div className="relative flex rounded-2xl p-1.5 bg-gray-100">
                  <div
                    className="tab-track absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[14px] shadow-md"
                    style={{
                      left: 6,
                      transform: isExhibitor
                        ? "translateX(0)"
                        : "translateX(calc(100% + 0px))",
                    }}
                  />
                  {Object.values(TABS).map((t) => {
                    const active = t.key === activeTab;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => switchTab(t.key)}
                        className="relative z-10 flex-1 flex items-center justify-center gap-2 h-11 rounded-[14px] text-[13px] font-bold tracking-wide transition-colors duration-200"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          color: active ? "#111827" : "#9CA3AF",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={active ? t.accent : "#9CA3AF"}
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {t.key === "exhibitor" ? (
                            <>
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </>
                          ) : (
                            <>
                              <circle cx="12" cy="8" r="4" />
                              <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L12 14l-4 1 1-4 7.5-7.5z" />
                            </>
                          )}
                        </svg>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form body */}
              <div
                key={activeTab}
                className="px-7 sm:px-8 pb-8 pt-6 panel-fade"
              >
                <div className="mb-6">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 mb-3"
                    style={{
                      color: tab.accent,
                      background: tab.accentBg,
                      borderColor: `${tab.accent}44`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tab.accent }}
                    />
                    {tab.eyebrow}
                  </span>
                  <h2
                    className="text-gray-900 leading-tight mb-1.5"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(1.7rem, 3vw, 2rem)",
                      fontWeight: 700,
                    }}
                  >
                    Welcome Back! {isExhibitor ? "Exhibitor" : "Admin"}
                  </h2>
                 
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FloatInput
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    accentColor={tab.accent}
                    accentRing={tab.accentRing}
                  />

                  <FloatInput
                    label="Password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    accentColor={tab.accent}
                    accentRing={tab.accentRing}
                  >
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="flex items-center justify-center w-6 h-6 text-gray-400"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = tab.accent)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#9CA3AF")
                      }
                    >
                      {showPw ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </FloatInput>

                  <div className="flex items-center justify-between -mt-1">
                    <label className="flex items-center gap-2 text-[12px] text-gray-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded accent-current"
                        style={{ accentColor: tab.accent }}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="text-[12px] font-semibold"
                      style={{
                        color: tab.accent,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => alert("Password reset coming soon.")}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <div
                      className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                      style={{ animation: "shake 0.35s ease" }}
                    >
                      <svg
                        className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      <p className="text-red-600 text-[13px] font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] rounded-xl text-white text-[13.5px] font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: loading
                        ? "#111827"
                        : `linear-gradient(135deg, #111827 0%, #0b1226 100%)`,
                      boxShadow: loading
                        ? "none"
                        : `0 10px 28px rgba(0,0,0,0.25)`,
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          style={{ animation: "spin 0.7s linear infinite" }}
                        />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Login
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer line */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  {tab.showReg ? (
                    <p className="text-[13px] text-gray-400">
                      New to InOptics 2026?{" "}
                      <Link
                        to="/become-exhibitor"
                        className="font-bold no-underline transition-opacity hover:opacity-80"
                        style={{ color: tab.accent }}
                      >
                        Register as Exhibitor →
                      </Link>
                    </p>
                  ) : (
                    <p className="text-[13px] text-gray-400">
                      Need exhibitor access?{" "}
                      <button
                        type="button"
                        onClick={() => switchTab("exhibitor")}
                        className="font-bold transition-opacity hover:opacity-80"
                        style={{
                          color: tab.accent,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Switch to Exhibitor login
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center mt-5 text-[11.5px] text-gray-400 lg:text-gray-400">
              <span className="lg:text-gray-400 text-white/70">
                By signing in you agree to our{" "}
              </span>
              <span className="font-semibold text-gray-600 lg:text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                Terms
              </span>
              <span className="lg:text-gray-400 text-white/70">{" & "}</span>
              <span className="font-semibold text-gray-600 lg:text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <Footer />
      </div>
    </>
  );
}
