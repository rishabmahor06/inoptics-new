import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import exhibitorImage from "../../../assets/llll.png"; // ✅ Import image

/*
  App.jsx mein dono routes same component pe:
  <Route path="/exhibitor-login" element={<UnifiedLogin />} />
  <Route path="/admin-login"     element={<UnifiedLogin />} />

  Add to index.html:
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
*/

/* ── Tab config ── */
const TABS = {
  exhibitor: {
    key:       "exhibitor",
    label:     "Exhibitor",
    route:     "/exhibitor-login",
    api:       "https://inoptics.in/api/exhibitor_login.php",
    flagKey:   "isExhibitorLoggedIn",
    infoKey:   "exhibitorInfo",
    dashboard: "/exhibitor-dashboard",
    title:     "Welcome back,",
    italic:    "Exhibitor",
    subtitle:  "Sign in to manage stalls, payments, badges & more.",
    eyebrow:   "Exhibitor Portal",
    showReg:   true,
    accent:    "#2563EB",
    accentDark:"#1D4ED8",
    accentBg:  "rgba(37,99,235,0.09)",
    accentRing:"rgba(37,99,235,0.22)",
    storeInfo: (result, email) => JSON.stringify(result.data || { email }),
  },
  admin: {
    key:       "admin",
    label:     "Admin",
    route:     "/admin-login",
    api:       "https://inoptics.in/api/login.php",
    flagKey:   "isAdminLoggedIn",
    infoKey:   "adminEmail",
    dashboard: "/dashboard",
    title:     "Admin",
    italic:    "Sign In",
    subtitle:  "Full control over InOptics CRM & event operations.",
    eyebrow:   "Admin Console",
    showReg:   false,
    accent:    "#D97706",
    accentDark:"#B45309",
    accentBg:  "rgba(217,119,6,0.09)",
    accentRing:"rgba(217,119,6,0.22)",
    storeInfo: (_, email) => email,
  },
};

/* ── Floating label input ── */
const FloatInput = ({ label, name, type = "text", value, onChange, required, autoComplete, accentColor, accentRing, children }) => {
  const [focused, setFocused] = useState(false);
  const filled = value?.length > 0;
  const float  = focused || filled;

  return (
    <div className="relative">
      <label
        className="absolute left-4 pointer-events-none z-10 font-medium transition-all duration-200"
        style={{
          fontFamily: "'Inter', sans-serif",
          top:        float ? -9       : "50%",
          transform:  float ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
          transformOrigin: "left center",
          color:      focused ? accentColor : "#9CA3AF",
          background: float ? "#fff" : "transparent",
          padding:    float ? "0 4px" : "0",
          fontSize:   14,
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
          placeholder={focused ? (name === "email" ? "you@example.com" : "••••••••") : ""}
          className="w-full h-[52px] px-4 text-[14.5px] font-normal text-gray-900 bg-white rounded-2xl outline-none transition-all duration-200"
          style={{
            fontFamily: "'Inter', sans-serif",
            paddingRight: children ? 48 : 16,
            border: `2px solid ${focused ? accentColor : "#E5E7EB"}`,
            boxShadow: focused ? `0 0 0 4px ${accentRing}` : "none",
          }}
        />
        {children && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{children}</div>
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
  const [activeTab,  setActiveTab]  = useState(initTab);
  const [formData,   setFormData]   = useState({ email: "", password: "" });
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [details,    setDetails]    = useState([]);
  const [detailLoad, setDetailLoad] = useState(true);
  const [slideDir,   setSlideDir]   = useState("right"); // for animation

  const tab = TABS[activeTab];
  const isExhibitor = activeTab === "exhibitor";

  /* sync tab when URL changes */
  useEffect(() => {
    const next = location.pathname === "/admin-login" ? "admin" : "exhibitor";
    if (next !== activeTab) setActiveTab(next);
  }, [location.pathname]);

  /* redirect if already logged in */
  useEffect(() => {
    if (localStorage.getItem(tab.flagKey)) {
      navigate(tab.dashboard, { replace: true });
    }
  }, [tab]);

  /* fetch left-panel API content once */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitor_login.php");
        const d = await r.json();
        setDetails(Array.isArray(d) ? d : []);
      } catch { /* silent */ }
      finally { setDetailLoad(false); }
    })();
  }, []);

  const switchTab = (key) => {
    if (key === activeTab) return;
    setSlideDir(key === "exhibitor" ? "left" : "right");
    setError("");
    setFormData({ email: "", password: "" });
    setShowPw(false);
    setActiveTab(key);
    navigate(TABS[key].route, { replace: false });
  };

  const handleChange = (e) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res    = await fetch(tab.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem(tab.flagKey, "true");
        localStorage.setItem(tab.infoKey, tab.storeInfo(result, formData.email));
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
        @keyframes slideFromRight {
          from { opacity:0; transform:translateX(28px) scale(0.98); }
          to   { opacity:1; transform:translateX(0)    scale(1);    }
        }
        @keyframes slideFromLeft {
          from { opacity:0; transform:translateX(-28px) scale(0.98); }
          to   { opacity:1; transform:translateX(0)     scale(1);    }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-6px); }
          60%     { transform:translateX(6px); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .form-slide-right { animation: slideFromRight 0.38s cubic-bezier(0.34,1.4,0.64,1) both; }
        .form-slide-left  { animation: slideFromLeft  0.38s cubic-bezier(0.34,1.4,0.64,1) both; }
        .tab-track { transition: transform 0.32s cubic-bezier(0.34,1.4,0.64,1); }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ══════════ FULL-SCREEN HERO ══════════ */}
        <div className="relative flex-1 flex items-center justify-center px-4 py-10 md:py-14 min-h-screen overflow-hidden">

          {/* Background image */}
          <img
            src={exhibitorImage}
            alt="InOptics 2026"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-gray-900/75 to-slate-900/85" />
          {/* Colored accent overlay based on active tab */}
          <div className="absolute inset-0 transition-all duration-700"
            style={{ background: `radial-gradient(ellipse at 60% 30%, ${tab.accent}18 0%, transparent 65%)` }} />

          {/* Floating dots grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          <div className="relative z-10 w-full max-w-[1000px]" style={{ animation: "fadeUp 0.55s ease both" }}>

            {/* ── Brand pill ── */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2 shadow-lg">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="2.4" fill="#fff"/>
                    <line x1="7" y1="1.5" x2="7" y2="3.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="7" y1="10.6" x2="7" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="1.5" y1="7" x2="3.4" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="10.6" y1="7" x2="12.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold tracking-[0.22em] text-white/90">INOPTICS 2026</span>
                <span className="text-white/35 text-[10px]">· Portal</span>
              </div>
            </div>

            {/* ══ CARD ══ */}
            <div className="flex flex-col lg:flex-row rounded-[28px] overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)" }}>

              {/* ─── LEFT PANEL ─── */}
              <div
                className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: "rgba(8,12,30,0.92)", backdropFilter: "blur(20px)" }}
              >
                {/* Accent glow */}
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none transition-all duration-700"
                  style={{ background: `radial-gradient(circle, ${tab.accent}30, transparent 65%)` }} />
                {/* Top shimmer line */}
                <div className="absolute top-0 inset-x-0 h-px transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${tab.accent}bb, transparent)` }} />

                {/* Top */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-9">
                    <span className="block w-6 h-px" style={{ background: tab.accent }} />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300"
                      style={{ color: tab.accent }}>
                      {tab.eyebrow}
                    </span>
                  </div>

                  <h2 className="text-white leading-[1.1] mb-5 transition-all duration-300"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,2.8vw,2.4rem)", fontWeight: 700 }}>
                    {tab.title}{" "}
                    <em style={{ fontStyle: "italic", fontWeight: 400, color: "#FCD34D" }}>
                      {tab.italic}
                    </em>
                  </h2>

                  <p className="text-white/45 text-[14px] leading-relaxed font-light max-w-[260px]">
                    {tab.subtitle}
                  </p>
                </div>

                {/* API content */}
                <div className="relative z-10 my-8">
                  {detailLoad ? (
                    <div className="space-y-2 animate-pulse">
                      {[75, 90, 65].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : details.map((item, i) => (
                    <div key={item.id || i}
                      className="text-white/50 text-[13px] leading-relaxed font-light [&_p]:mb-1.5 [&_strong]:text-white/80 [&_strong]:font-semibold [&_a]:text-amber-300"
                      dangerouslySetInnerHTML={{ __html: item.description }} />
                  ))}
                </div>

                {/* Feature list */}
                <div className="relative z-10 space-y-3.5">
                  {[
                    ["Secure Access",       "Industry-standard encryption"],
                    ["Real-time Dashboard", "Live stall & visitor data"],
                    ["Verified Portal",     "Authenticated accounts only"],
                  ].map(([title, sub], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-500"
                        style={{ background: `${tab.accent}18`, borderColor: `${tab.accent}40` }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16"
                          stroke={tab.accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l3 3.5L13 4"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/80 text-[12px] font-semibold leading-tight">{title}</p>
                        <p className="text-white/35 text-[11px] leading-tight">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── RIGHT PANEL — FORM ─── */}
              <div className="flex-1 flex flex-col"
                style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>

                {/* ── TAB STRIP ── */}
                <div className="px-8 sm:px-10 pt-8">
                  <div className="relative flex rounded-2xl p-1.5 bg-gray-100">
                    {/* Sliding pill */}
                    <div
                      className="tab-track absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[14px] shadow-md"
                      style={{
                        left: 6,
                        transform: isExhibitor ? "translateX(0)" : "translateX(calc(100% + 0px))",
                      }} />
                    {Object.values(TABS).map((t) => {
                      const active = t.key === activeTab;
                      return (
                        <button key={t.key} type="button"
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
                          {/* Tab icon */}
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                            stroke={active ? t.accent : "#9CA3AF"} strokeWidth={1.8}
                            strokeLinecap="round" strokeLinejoin="round">
                            {t.key === "exhibitor" ? (
                              <>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                              </>
                            ) : (
                              <>
                                <circle cx="12" cy="8" r="4"/>
                                <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L12 14l-4 1 1-4 7.5-7.5z"/>
                              </>
                            )}
                          </svg>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── FORM ── */}
                <div
                  key={activeTab}
                  className={`flex-1 px-8 sm:px-10 pb-9 pt-7 ${slideDir === "right" ? "form-slide-right" : "form-slide-left"}`}
                >
                  {/* Heading */}
                  <div className="mb-7">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 mb-4 transition-colors duration-300"
                      style={{ color: tab.accent, background: tab.accentBg, borderColor: `${tab.accent}44` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tab.accent }} />
                      {tab.eyebrow}
                    </span>
                    <h2 className="text-gray-900 leading-[1.12] mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.7rem,3vw,2.1rem)", fontWeight: 700 }}>
                      {tab.title}{" "}
                      <em style={{ fontStyle: "italic", fontWeight: 400, color: tab.accent }}>{tab.italic}</em>
                    </h2>
                    <p className="text-gray-400 text-[13.5px] font-light leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {tab.subtitle}
                    </p>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        onClick={() => setShowPw(v => !v)}
                        className="flex items-center justify-center w-6 h-6 text-gray-400 transition-colors duration-200"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = tab.accent}
                        onMouseLeave={e => e.currentTarget.style.color = "#9CA3AF"}
                      >
                        {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </FloatInput>

                    {/* Forgot */}
                    <div className="flex justify-end -mt-2">
                      <button type="button"
                        className="text-[12px] font-semibold transition-colors duration-200"
                        style={{ color: tab.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                        onClick={() => alert("Password reset coming soon.")}>
                        Forgot password?
                      </button>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
                        style={{ animation: "shake 0.35s ease" }}>
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                        </svg>
                        <p className="text-red-600 text-[13px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[52px] rounded-2xl text-white text-[13.5px] font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background: loading
                          ? tab.accent
                          : `linear-gradient(135deg, ${tab.accent} 0%, ${tab.accentDark} 100%)`,
                        boxShadow: loading ? "none" : `0 8px 28px ${tab.accent}44`,
                      }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = `0 12px 36px ${tab.accent}66`; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${tab.accent}44`; }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                            style={{ animation: "spin 0.7s linear infinite" }} />
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign In
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Footer line */}
                  <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    {tab.showReg ? (
                      <p className="text-[13px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        New to InOptics 2026?{" "}
                        <Link to="/become-exhibitor"
                          className="font-bold no-underline transition-opacity hover:opacity-80"
                          style={{ color: tab.accent }}>
                          Register as Exhibitor →
                        </Link>
                      </p>
                    ) : (
                      <p className="text-[13px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Need exhibitor access?{" "}
                        <button type="button" onClick={() => switchTab("exhibitor")}
                          className="font-bold transition-opacity hover:opacity-80"
                          style={{ color: tab.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                          Switch to Exhibitor login
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <p className="text-center mt-5 text-[11.5px] text-white/35" style={{ fontFamily: "'Inter', sans-serif" }}>
              By signing in you agree to our{" "}
              <span className="font-semibold text-white/55 cursor-pointer hover:text-white/80 transition-colors">Terms</span>
              {" & "}
              <span className="font-semibold text-white/55 cursor-pointer hover:text-white/80 transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* <Footer /> */}
      </div>
    </>
  );
}