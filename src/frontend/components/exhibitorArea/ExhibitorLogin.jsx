import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  MdEmail, MdLock, MdLogin, MdArrowForward, MdHowToReg,
  MdInfoOutline, MdAdminPanelSettings, MdStorefront,
  MdVerifiedUser, MdSpeed, MdSecurity,
} from "react-icons/md";

/* ============ Tab config ============ */
const TABS = {
  exhibitor: {
    key:        "exhibitor",
    label:      "Exhibitor",
    Icon:       MdStorefront,
    route:      "/exhibitor-login",
    api:        "https://inoptics.in/api/exhibitor_login.php",
    flagKey:    "isExhibitorLoggedIn",
    infoKey:    "exhibitorInfo",
    dashboard:  "/exhibitor-dashboard",
    eyebrow:    "Exhibitor Portal",
    title:      "Welcome Back",
    subtitle:   "Sign in to manage your stalls, brands, payments and badges.",
    accent:     "blue",
    showRegister: true,
  },
  admin: {
    key:        "admin",
    label:      "Admin",
    Icon:       MdAdminPanelSettings,
    route:      "/admin-login",
    api:        "https://inoptics.in/api/login.php",
    flagKey:    "isAdminLoggedIn",
    infoKey:    "adminEmail",
    dashboard:  "/admindashboard",
    eyebrow:    "Admin Console",
    title:      "Admin Sign In",
    subtitle:   "Full control over the InOptics CRM and event operations.",
    accent:     "amber",
    showRegister: false,
  },
};

const ACCENT_MAP = {
  blue: {
    bg:        "bg-blue-600",
    bgHover:   "hover:bg-blue-700",
    text:      "text-blue-600",
    textHover: "hover:text-blue-700",
    ring:      "focus:ring-blue-500",
    fill:      "bg-blue-50",
    border:    "border-blue-200",
    pill:      "bg-blue-50 text-blue-700 border-blue-200",
    shadow:    "shadow-blue-500/30",
  },
  amber: {
    bg:        "bg-amber-500",
    bgHover:   "hover:bg-amber-600",
    text:      "text-amber-600",
    textHover: "hover:text-amber-700",
    ring:      "focus:ring-amber-500",
    fill:      "bg-amber-50",
    border:    "border-amber-200",
    pill:      "bg-amber-50 text-amber-700 border-amber-200",
    shadow:    "shadow-amber-500/30",
  },
};

const HIGHLIGHTS = [
  { Icon: MdSpeed,        title: "Fast Access",       desc: "Lightning-quick login to your dashboard" },
  { Icon: MdSecurity,     title: "Secure",            desc: "Industry-standard encryption" },
  { Icon: MdVerifiedUser, title: "Verified Account",  desc: "Verified exhibitor & admin profiles" },
];

export default function ExhibitorLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = location.pathname === "/admin-login" ? "admin" : "exhibitor";
  const [activeTab, setActiveTab] = useState(initialTab);
  const tab    = TABS[activeTab];
  const accent = ACCENT_MAP[tab.accent];

  const [formData,     setFormData]     = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  /* sync tab when URL changes (browser back/forward) */
  useEffect(() => {
    const next = location.pathname === "/admin-login" ? "admin" : "exhibitor";
    if (next !== activeTab) setActiveTab(next);
  }, [location.pathname, activeTab]);

  /* auto-redirect if already logged in for current tab */
  useEffect(() => {
    if (localStorage.getItem(tab.flagKey)) {
      navigate(tab.dashboard, { replace: true });
    }
  }, [tab, navigate]);

  const switchTab = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setError("");
    setFormData({ email: "", password: "" });
    setShowPassword(false);
    navigate(TABS[key].route, { replace: false });
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(tab.api, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem(tab.flagKey, "true");
        if (activeTab === "exhibitor") {
          localStorage.setItem(tab.infoKey, JSON.stringify(result.data || { email: formData.email }));
        } else {
          localStorage.setItem(tab.infoKey, formData.email);
        }
        navigate(tab.dashboard, { replace: true });
      } else {
        setError(result.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isExhibitor = activeTab === "exhibitor";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 bg-[#f4f5f9] font-[Quicksand,sans-serif] relative overflow-hidden">

      {/* Background mesh / decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-100/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo + brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#02062c] to-[#1e3a8a] text-white shadow-xl shadow-blue-500/30 mb-3">
            <MdVerifiedUser size={26} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            InOptics 2026
          </p>
          <h1 className="mt-1 text-2xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
            Login Portal
          </h1>
        </div>

        {/* ============ MAIN CARD ============ */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-300/40 border border-zinc-100 overflow-hidden">

          {/* Tab strip */}
          <div className="relative bg-zinc-50 p-1.5 m-3 rounded-2xl select-none">
            <span
              aria-hidden
              className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-md ring-1 ring-zinc-200/70 transition-transform duration-300 ease-out
                ${isExhibitor ? "translate-x-0" : "translate-x-full"}`}
            />
            <div className="relative grid grid-cols-2">
              {Object.values(TABS).map((t) => {
                const a = ACCENT_MAP[t.accent];
                const active = t.key === activeTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => switchTab(t.key)}
                    className={`relative flex items-center justify-center gap-2 h-11 text-[13px] font-bold uppercase tracking-wider rounded-xl transition-colors z-10
                      ${active ? "text-[#02062c]" : "text-zinc-500 hover:text-zinc-800"}`}
                  >
                    <t.Icon size={16} className={active ? a.text : ""} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliding form */}
          <div className="overflow-hidden">
            <div
              key={activeTab}
              className="px-7 sm:px-9 pb-9 pt-3"
              style={{
                animation: `${isExhibitor ? "slideIn" : "slideInReverse"} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
              }}
            >
              {/* Heading */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${accent.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${accent.bg}`} />
                  {tab.eyebrow}
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
                  {tab.title}
                </h2>
                <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">
                  {tab.subtitle}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email" icon={<MdEmail size={16} />}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full h-12 pl-10 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all`}
                  />
                </Field>

                <Field label="Password" icon={<MdLock size={16} />}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full h-12 pl-10 pr-11 text-[14px] border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-zinc-400 ${accent.textHover} transition-colors`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </Field>

                {/* Forgot password */}
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    className={`text-[12px] font-semibold ${accent.text} ${accent.textHover}`}
                    onClick={() => alert("Password reset is not yet implemented.")}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl animate-[shake_0.3s_ease]">
                    <MdInfoOutline size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-[13px] font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full h-12 rounded-xl text-[13px] font-bold uppercase tracking-wider ${accent.bg} ${accent.bgHover} text-white shadow-lg ${accent.shadow} disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <MdLogin size={16} />
                        Sign In
                        <MdArrowForward size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-5 border-t border-zinc-100">
                {tab.showRegister ? (
                  <p className="text-center text-[12px] text-zinc-500">
                    New to InOptics?{" "}
                    <Link
                      to="/become-exhibitor"
                      className={`font-bold ${accent.text} ${accent.textHover}`}
                    >
                      <MdHowToReg size={12} className="inline -mt-0.5" /> Register as Exhibitor
                    </Link>
                  </p>
                ) : (
                  <p className="text-center text-[12px] text-zinc-500">
                    Need an exhibitor account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("exhibitor")}
                      className={`font-bold ${accent.text} ${accent.textHover}`}
                    >
                      Switch to Exhibitor login
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights row */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {HIGHLIGHTS.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm border border-white/80 rounded-xl px-3 py-2.5 text-center hover:bg-white transition-colors"
            >
              <Icon size={18} className={`mx-auto mb-1 ${accent.text}`} />
              <p className="text-[11px] font-bold text-[#02062c] leading-tight">{title}</p>
              <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 hidden sm:block">{desc}</p>
            </div>
          ))}
        </div>

        {/* Terms */}
        <p className="text-center text-[11px] text-zinc-500 mt-5 leading-relaxed">
          By signing in, you agree to our{" "}
          <span className={`font-semibold ${accent.text} cursor-pointer`}>Terms</span>{" "}
          &amp;{" "}
          <span className={`font-semibold ${accent.text} cursor-pointer`}>Privacy Policy</span>.
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          0%   { opacity: 0; transform: translateX(-24px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInReverse {
          0%   { opacity: 0; transform: translateX(24px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-5px); }
          40%     { transform: translateX(5px); }
          60%     { transform: translateX(-3px); }
          80%     { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}

/* ============ Field wrapper ============ */
function Field({ label, icon, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
