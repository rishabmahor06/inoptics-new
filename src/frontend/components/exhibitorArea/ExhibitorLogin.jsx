import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  MdEmail, MdLock, MdLogin, MdArrowOutward, MdHowToReg,
  MdInfoOutline, MdShield, MdCheckCircle,
} from "react-icons/md";
import exhibitorImage from "../../../assets/llll.png";
import Footer from "../Footer";

export default function ExhibitorLogin() {
  const navigate = useNavigate();

  const [formData,       setFormData]       = useState({ email: "", password: "" });
  const [showPassword,   setShowPassword]   = useState(false);
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [details,        setDetails]        = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  /* Redirect if already logged in */
  useEffect(() => {
    if (localStorage.getItem("isExhibitorLoggedIn")) {
      navigate("/exhibitor-dashboard", { replace: true });
    }
  }, [navigate]);

  /* Fetch left-panel marketing copy */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_exhibitor_login.php");
        const d = await r.json();
        setDetails(Array.isArray(d) ? d : []);
      } catch (err) {
        console.error("Exhibitor login content fetch failed", err);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://inoptics.in/api/exhibitor_login.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem("isExhibitorLoggedIn", "true");
        localStorage.setItem("exhibitorInfo", JSON.stringify(result.data));
        navigate("/exhibitor-dashboard", { replace: true });
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

  return (
    <div className="min-h-screen flex flex-col font-[Quicksand,sans-serif] bg-[#fafafb]">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">

        {/* ============ LEFT PANEL — gradient hero ============ */}
        <aside className="hidden lg:flex lg:col-span-6 relative flex-col overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
          {/* Decorative blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Top accent bar */}
          <div className="relative h-1 bg-gradient-to-r from-amber-400 via-pink-400 to-orange-400" />

          <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-12 xl:py-16">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <MdShield size={20} />
              </div>
              <div>
                <p className="text-[14px] font-bold tracking-[0.25em] text-white">INOPTICS</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-amber-300/80">2026 · Exhibitor Portal</p>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-amber-400" />
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
                  Welcome Back
                </span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-light tracking-tight font-[Playfair_Display,serif] leading-[1.1]">
                Exhibitor{" "}
                <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent italic">
                  Login Portal
                </span>
              </h1>
              <p className="mt-5 text-[15px] text-blue-200/90 leading-relaxed max-w-md">
                Access your exhibitor dashboard to manage stalls, registrations,
                badges, payments, and event details — all in one place.
              </p>
            </div>

            {/* Dynamic content from API */}
            <div className="mt-10">
              {detailsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[80, 90, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : details.length > 0 ? (
                <div className="space-y-3">
                  {details.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="text-white/70 text-[14px] leading-relaxed
                        [&_p]:mb-1
                        [&_strong]:text-amber-300 [&_strong]:font-semibold
                        [&_a]:text-amber-300 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-white
                        [&_ul]:space-y-2 [&_ul]:mt-2
                        [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2
                        [&_ul_li]:before:content-['→'] [&_ul_li]:before:text-amber-400 [&_ul_li]:before:font-bold [&_ul_li]:before:shrink-0 [&_ul_li]:before:mt-0.5"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2.5 text-white/70 text-[14px]">
                  {[
                    "Manage stalls, brands, and exhibitor profile",
                    "Track payments, invoices, and registration status",
                    "Print badges and submit mandatory forms",
                    "Get instant updates from event organizers",
                  ].map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <MdCheckCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Hero image */}
            <div className="mt-10">
              <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md p-2">
                <img
                  src={exhibitorImage}
                  alt="Exhibitor"
                  className="w-full max-h-44 object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* ============ RIGHT PANEL — login form ============ */}
        <section className="lg:col-span-6 flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">

            {/* Mobile brand header */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                <MdShield size={20} />
              </div>
              <div>
                <p className="text-[13px] font-bold tracking-[0.22em] text-[#02062c]">INOPTICS 2026</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">Exhibitor Portal</p>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
              {/* Top accent strip */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500" />

              <div className="p-8 sm:p-10">

                {/* Heading */}
                <div className="mb-7">
                  <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">
                    Exhibitor Access
                  </span>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
                    Sign{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">
                      In
                    </span>
                  </h2>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    Sign in to your exhibitor account to continue.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <Field label="Email Address *" icon={<MdEmail size={16} />}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full h-12 pl-10 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </Field>

                  {/* Password */}
                  <Field label="Password *" icon={<MdLock size={16} />}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full h-12 pl-10 pr-11 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </Field>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl animate-[shake_0.3s_ease]">
                      <MdInfoOutline size={18} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-red-700 text-[13px] font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full h-12 sm:h-13 mt-2 rounded-xl text-[13px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all overflow-hidden"
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
                          <MdArrowOutward size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <span className="flex-1 h-px bg-zinc-200" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
                    New here?
                  </span>
                  <span className="flex-1 h-px bg-zinc-200" />
                </div>

                {/* Register CTA */}
                <Link
                  to="/become-exhibitor"
                  className="group w-full inline-flex items-center justify-center gap-2 px-4 h-12 text-[13px] font-bold uppercase tracking-wider border-2 border-zinc-200 hover:border-blue-300 text-zinc-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <MdHowToReg size={16} />
                  Register as Exhibitor
                  <MdArrowOutward size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Terms note */}
            <p className="text-center text-[11px] text-zinc-400 mt-6 leading-relaxed">
              By signing in, you agree to the{" "}
              <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-800">
                Terms &amp; Conditions
              </span>{" "}
              of InOptics 2026.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
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
