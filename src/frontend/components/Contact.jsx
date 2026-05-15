import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  MdEmail, MdPhone, MdLocationOn, MdSend, MdCheckCircle, MdError,
  MdPerson, MdBusiness, MdSmartphone, MdMessage, MdSchedule,
} from "react-icons/md";
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaXTwitter,
} from "react-icons/fa6";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const SITE_KEY = "6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu";

export default function Contact() {
  const contactEmailRef = useRef();

  const [formData, setFormData] = useState({
    message: "", name: "", company: "", email: "", mobile: "", consent: false,
  });
  const [loading,        setLoading]        = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage,   setErrorMessage]   = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);
  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* same validation as legacy panel */
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim() ||
      !formData.company.trim() ||
      !formData.message.trim() ||
      !formData.consent
    ) {
      setErrorMessage("❌ Please fill in all fields and accept the consent.");
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);

      /* Step 1: get reCAPTCHA token — wait if grecaptcha not yet ready */
      let token = "";
      if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
        try {
          token = await new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(SITE_KEY, { action: "submit" })
                .then(resolve)
                .catch(reject);
            });
          });
          console.log("[contact] reCAPTCHA token:", token ? token.slice(0, 20) + "…" : "(empty)");
        } catch (rcErr) {
          console.warn("[contact] reCAPTCHA execute failed:", rcErr);
        }
      } else {
        console.warn("[contact] window.grecaptcha not loaded");
      }

      /* Step 2: prepare and send form */
      const toEmail =
        contactEmailRef.current?.textContent?.trim() || "support@inoptics.in";

      const submitData = new FormData();
      submitData.append("from_email",      formData.email);
      submitData.append("from_name",       formData.name);
      submitData.append("message",         formData.message);
      submitData.append("mobile",          formData.mobile);
      submitData.append("company",         formData.company);
      submitData.append("recaptcha_token", token);
      submitData.append("to_email",        toEmail);

      /* dev → same-origin via Vite proxy; prod → absolute URL */
      const API_BASE = import.meta.env.DEV
        ? "/api"
        : "https://inoptics.in/api";

      const res = await axios.post(
        `${API_BASE}/submit_contact_form.php`,
        submitData,
      );
      console.log("[contact] response:", res?.status, res?.data);

      /* PHP may return { success, message } / { status:'success' } / plain text */
      const data = res?.data;
      const ok =
        res?.status >= 200 && res?.status < 300 &&
        data?.success !== false &&
        data?.status !== "error" &&
        !data?.error;

      if (ok) {
        setSuccessMessage(
          (typeof data?.message === "string" && data.message) ||
          "✅ Submission Successful\nThank you for your application. Our team will review it and contact you shortly to proceed further.\nWe will get back to you within 24 hours.",
        );
        setErrorMessage("");
        setFormData({
          message: "", name: "", company: "", email: "", mobile: "", consent: false,
        });
      } else {
        const apiMsg = data?.message || data?.error || (typeof data === "string" ? data : "");
        setErrorMessage(`❌ ${apiMsg || "Submission rejected by server"}`);
        setSuccessMessage("");
      }
    } catch (err) {
      console.error("[contact] submit error:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message;
      setErrorMessage(`❌ ${apiMsg || "Submission failed. Please try again later."}`);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl" aria-hidden />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-300">— Contact Us —</span>
          <h1 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif]">
            Get in touch, let us know{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              how we can help
            </span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[16px] text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Whether you're an exhibitor, visitor, or partner — drop us a message and our team will reach out shortly.
          </p>
        </div>
      </section>

      {/* INFO CARDS */}
      

      {/* MAIN: MAP + FORM */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-12 sm:mt-16 mb-16 sm:mb-24 flex-1">
        <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative bg-zinc-100 min-h-[280px] sm:min-h-[400px] lg:min-h-full">
            <iframe
              title="InOptics Location"
              className="absolute inset-0 w-full h-full"
              src="https://www.google.com/maps?q=99,+Block+A,+Defence+Colony,+New+Delhi,+Delhi+110024&output=embed"
              loading="lazy"
            />
            <div className="hidden lg:flex absolute bottom-6 left-6 right-6 bg-white rounded-xl shadow-xl p-4 items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0">
                <MdLocationOn size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Office</p>
                <p className="text-[13px] font-bold text-zinc-900 truncate">A-99, Defence Colony</p>
                <p className="text-[12px] text-zinc-500">New Delhi, 110024</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 sm:p-10 space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#02062c] tracking-tight">Send us a message</h2>
              <p className="text-[13px] text-zinc-500 mt-1">
                Fill the form below — we typically reply within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={<MdPerson size={16} />}      name="name"    value={formData.name}    onChange={handleChange} placeholder="Your Name" />
              <Field icon={<MdEmail size={16} />}       name="email"   type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={<MdBusiness size={16} />}    name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" />
              <Field icon={<MdSmartphone size={16} />}  name="mobile"  value={formData.mobile}  onChange={handleChange} placeholder="Mobile Number" />
            </div>

            <div className="relative">
              <MdMessage size={16} className="absolute left-3 top-3.5 text-zinc-400" />
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                className="w-full pl-10 pr-4 py-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-[12px] text-zinc-600 cursor-pointer select-none">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                I agree to receive communication from <b className="text-[#02062c]">InOptics</b> regarding my enquiry.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[14px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <MdSend size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {successMessage && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] animate-[fadeInUp_0.3s_ease]">
                <MdCheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium whitespace-pre-line">{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[13px] animate-[fadeInUp_0.3s_ease]">
                <MdError size={20} className="text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium whitespace-pre-line">{errorMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* Bottom: Hours + Social */}
        
      </section>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============ sub-components ============ */

function InfoCard({ icon, label, tint, children }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-lg p-5 sm:p-6 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} aria-hidden />
      <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg mb-3`}>
        {icon}
      </div>
      <p className="relative text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="relative text-[15px] font-bold text-[#02062c] mt-1 break-all">{children}</p>
    </div>
  );
}

function Field({ icon, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 pl-10 pr-4 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function Row({ day, time, closed }) {
  return (
    <div className="flex items-center justify-between text-zinc-600">
      <span>{day}</span>
      <span className={closed ? "text-red-500 font-semibold" : "text-[#02062c] font-semibold"}>{time}</span>
    </div>
  );
}

function SocialBtn({ href, Icon, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center shadow-md hover:scale-110 hover:shadow-xl transition-all`}
    >
      <Icon size={16} />
    </a>
  );
}
