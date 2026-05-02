import React, { useState, useEffect } from "react";
// import Footer from "./Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import exhibitorImage from "../../../assets/exhibitor_login_illustration.png";
import Footer from "../../components/Footer";
import FloatingCard from "../../components/FloatingCard";


/*
  Add to index.html:
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
*/

/* ── Floating input field ── */
const FloatingInput = ({ label, name, type = "text", value, onChange, required, placeholder, children }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value?.length > 0;

  return (
    <div className="relative group">
      <label
        className="absolute left-4 transition-all duration-200 pointer-events-none z-10 font-medium"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          top: focused || hasValue ? "-9px" : "50%",
          transform: focused || hasValue ? "translateY(0) scale(0.82)" : "translateY(-50%) scale(1)",
          transformOrigin: "left center",
          color: focused ? "#f59e0b" : "#9ca3af",
          fontSize: 14,
          background: focused || hasValue ? "#fff" : "transparent",
          padding: focused || hasValue ? "0 4px" : "0",
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder={focused ? placeholder : ""}
          className="w-full px-4 py-4 rounded-2xl border-2 outline-none transition-all duration-200 text-gray-800 bg-white pr-12"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            borderColor: focused ? "#f59e0b" : "#e5e7eb",
            boxShadow: focused ? "0 0 0 4px rgba(245,158,11,0.10)" : "none",
          }}
        />
        {children && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{children}</div>
        )}
      </div>
    </div>
  );
};

/* ── Main component ── */
const ExhibitorLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [showPassword, setShowPw] = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [details, setDetails]     = useState([]);
  const [detailsLoading, setDL]   = useState(true);

  /* Redirect if already logged in */
  useEffect(() => {
    if (localStorage.getItem("isExhibitorLoggedIn")) {
      navigate("/exhibitor-dashboard", { replace: true });
    }
  }, [navigate]);

  /* Fetch left-panel content */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitor_login.php");
        const d = await r.json();
        setDetails(Array.isArray(d) ? d : []);
      } catch { /* silent */ }
      finally { setDL(false); }
    })();
  }, []);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://inoptics.in/api/exhibitor_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem("isExhibitorLoggedIn", "true");
        localStorage.setItem("exhibitorInfo", JSON.stringify(result.data));
        navigate("/exhibitor-dashboard", { replace: true });
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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* <ExhibitorNavbar /> */}

      <main className="flex-1 flex items-stretch">

        {/* ═══════════ LEFT PANEL ═══════════ */}
        <div
          className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 40%, #0f2027 100%)",
          }}
        >
          {/* Dot grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Amber glow orbs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%)" }} />

          {/* Top accent bar */}
          <div className="h-1 w-full"
            style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f97316)" }} />

          <div className="relative z-10 flex flex-col h-full px-12 py-14">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 16px rgba(245,158,11,0.5)" }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2.5" fill="#fff"/>
                  <line x1="7" y1="1.5" x2="7" y2="3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="7" y1="10.5" x2="7" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="1.5" y1="7" x2="3.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="10.5" y1="7" x2="12.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold tracking-widest text-sm" style={{ letterSpacing: "0.22em" }}>INOPTICS</div>
                <div className="text-white/40 text-xs tracking-wider">2026 · EXHIBITOR PORTAL</div>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-16 mb-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-px" style={{ background: "#f59e0b" }} />
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.22em]">
                  Welcome Back
                </span>
              </div>
              <h1 className="text-white leading-tight mb-5"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,3.5vw,3rem)", fontWeight: 700 }}>
                Exhibitor <br /><em style={{ color: "#fbbf24" }}>Login Portal</em>
              </h1>
              <p className="text-white/50 text-base leading-relaxed max-w-sm"
                style={{ fontWeight: 300 }}>
                Access your exhibitor dashboard to manage stalls, registrations, and event details.
              </p>
            </div>

            {/* API description content */}
            <div className="mb-10">
              {detailsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[80, 90, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : details.length > 0 ? (
                <div className="space-y-3">
                  {details.map((item, i) => (
                    <div key={item.id || i}
                      className="text-white/55 text-sm leading-relaxed
                        [&_p]:mb-1 [&_strong]:text-amber-300 [&_strong]:font-semibold
                        [&_a]:text-amber-400 [&_a]:underline [&_ul]:space-y-1
                        [&_ul_li]:flex [&_ul_li]:gap-2 [&_ul_li]:before:content-['▸']
                        [&_ul_li]:before:text-amber-400/80 [&_ul_li]:before:text-xs"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Exhibitor image */}
            <div className="mt-auto">
              <img
                src={exhibitorImage}
                alt="Exhibitor"
                className="w-full max-w-xs rounded-2xl object-cover opacity-80"
                style={{ maxHeight: 180 }}
              />
            </div>
          </div>
        </div>

        {/* ═══════════ RIGHT PANEL — FORM ═══════════ */}
        <div className="flex-1 flex items-center justify-center bg-[#f8f8f7] px-5 sm:px-10 py-14">
          <div className="w-full max-w-[420px]">

            {/* Mobile brand header */}
            <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2.5" fill="#fff"/>
                  <line x1="7" y1="1.5" x2="7" y2="3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="7" y1="10.5" x2="7" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="1.5" y1="7" x2="3.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="10.5" y1="7" x2="12.5" y2="7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-bold tracking-widest text-sm text-gray-900" style={{ letterSpacing: "0.2em" }}>INOPTICS 2026</div>
                <div className="text-gray-400 text-xs">Exhibitor Portal</div>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-black/8 border border-gray-100 overflow-hidden"
              style={{ animation: "formReveal 0.55s cubic-bezier(0.34,1.4,0.64,1) both" }}>

              {/* Top color strip */}
              <div className="h-1"
                style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24,#f97316)" }} />

              <div className="p-8 sm:p-10">
                {/* Heading */}
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500 mb-2">
                    Exhibitor Access
                  </p>
                  <h2 className="text-gray-900 mb-1"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.2 }}>
                    Log <em>in</em>
                  </h2>
                  <p className="text-gray-400 text-sm">Sign in to your exhibitor account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <FloatingInput
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />

                  {/* Password */}
                  <FloatingInput
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                  >
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="text-gray-400 hover:text-amber-500 transition-colors duration-200"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </FloatingInput>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                      style={{ animation: "shake 0.35s ease" }}>
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                      </svg>
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: loading ? "#fcd34d" : "linear-gradient(135deg,#f59e0b,#f97316)",
                      color: "#000",
                      boxShadow: loading ? "none" : "0 8px 24px rgba(245,158,11,0.40)",
                      letterSpacing: "0.04em",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 12px 32px rgba(245,158,11,0.55)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,158,11,0.40)"; }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Signing in…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>
                      </span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-300 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Register link */}
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-3">New to InOptics 2026?</p>
                  <Link
                    to="/become-exhibitor"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-amber-300 text-gray-700 hover:text-amber-600 text-sm font-semibold transition-all duration-200 hover:bg-amber-50 w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                    Register as Exhibitor
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400 mt-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              By logging in, you agree to the{" "}
              <span className="text-amber-500 cursor-pointer hover:underline">Terms & Conditions</span>{" "}
              of InOptics 2026.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes formReveal {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-6px); }
          40%     { transform:translateX(6px); }
          60%     { transform:translateX(-4px); }
          80%     { transform:translateX(4px); }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default ExhibitorLogin;