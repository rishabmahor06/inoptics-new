import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdBusiness, MdPerson, MdHome, MdLocationCity, MdLocalPostOffice,
  MdSmartphone, MdPhone, MdEmail, MdReceiptLong, MdCheckCircle,
  MdShoppingBag, MdLabel, MdSpaceBar, MdHowToReg,
} from "react-icons/md";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";

const PRODUCT_OPTIONS = [
  "Artificial Eyes",
  "Contact & Cosmetic lenses",
  "Contact lens solutions & Accessories",
  "Eye Testing Equipments",
  "Instruments",
  "Machines for Manufacturing Lenses",
  "Reading Spectacles",
  "Retail Management Software",
  "Raw Material for Manufacturing",
  "Showroom Setup & Display Products",
  "Spare Parts & Tools",
  "Spectacle Frames & Cases",
  "Sunglasses",
  "Trade Journal",
];

const BOOTH_SIZES = ["9 sq m", "12 sq m", "15 sq m", "20 sq m"];

const CSC_API = "https://api.countrystatecity.in/v1";
const CSC_KEY = "MUFmM25DMFNOcGlWMVMydXdxOWxEd3ZsRVFQdGpnY1F3ZzNQcDZYeQ==";
const SITE_KEY = "6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu";

export default function BecomeExhibitor() {
  /* ============ state ============ */
  const [poweringFutureData, setPoweringFutureData] = useState([]);
  const [whyExhibitData,     setWhyExhibitData]     = useState([]);
  const [countries, setCountries] = useState([]);
  const [states,    setStates]    = useState([]);
  const [cities,    setCities]    = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [manualProduct,    setManualProduct]    = useState("");
  const [selectedCountry,  setSelectedCountry]  = useState("");
  const [selectedState,    setSelectedState]    = useState("");
  const [selectedCity,     setSelectedCity]     = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage,   setErrorMessage]   = useState("");
  const [submitting,     setSubmitting]     = useState(false);

  /* ============ fetch hero/info content ============ */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_powering_future_become_an_exhibitor.php");
        setPoweringFutureData(await r.json() || []);
      } catch (e) { console.error("Powering Future fetch failed", e); }
    })();
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_why_exhibit_become_an_exhibitor.php");
        setWhyExhibitData(await r.json() || []);
      } catch (e) { console.error("Why Exhibit fetch failed", e); }
    })();
  }, []);

  /* ============ load reCAPTCHA enterprise ============ */
  useEffect(() => {
    if (document.querySelector("script[data-recaptcha]")) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
    script.async = true;
    script.dataset.recaptcha = "1";
    document.body.appendChild(script);
  }, []);

  /* ============ countries ============ */
  useEffect(() => {
    axios.get(`${CSC_API}/countries`, { headers: { "X-CSCAPI-KEY": CSC_KEY } })
      .then((r) => setCountries(r.data || []))
      .catch((err) => console.error("Countries fetch error:", err));
  }, []);

  /* ============ states cascade ============ */
  useEffect(() => {
    if (!selectedCountry) { setStates([]); return; }
    axios.get(`${CSC_API}/countries/${selectedCountry}/states`, { headers: { "X-CSCAPI-KEY": CSC_KEY } })
      .then((r) => setStates(r.data || []))
      .catch((err) => console.error("States fetch error:", err));
  }, [selectedCountry]);

  /* ============ cities cascade ============ */
  useEffect(() => {
    if (!selectedCountry || !selectedState) { setCities([]); return; }
    axios.get(`${CSC_API}/countries/${selectedCountry}/states/${selectedState}/cities`, { headers: { "X-CSCAPI-KEY": CSC_KEY } })
      .then((r) => setCities(r.data || []))
      .catch((err) => console.error("Cities fetch error:", err));
  }, [selectedCountry, selectedState]);

  /* ============ helpers ============ */
  const handleProductChange = (e) => {
    const { value, checked } = e.target;
    setSelectedProducts((prev) => checked ? [...prev, value] : prev.filter((p) => p !== value));
  };

  const showManualInput = selectedProducts.length === 1 && selectedProducts.includes("Other");

  /* auto-hide messages */
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(""), 5000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  /* ============ submit ============ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const form = e.target;

    const mandatory = ["companyName", "personName", "address", "pincode", "mobile", "email", "gst", "boothSpace"];
    for (const field of mandatory) {
      if (!form[field]?.value.trim()) {
        setErrorMessage("Please fill all mandatory fields.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let token = "";
      try {
        token = await window.grecaptcha.execute(SITE_KEY, { action: "submit" });
      } catch (rcErr) { console.warn("reCAPTCHA execute failed", rcErr); }

      const formData = new FormData(form);
      formData.append("recaptcha_token", token);
      formData.append("selectedProducts", JSON.stringify(selectedProducts));
      formData.append("manualProduct",   manualProduct);
      formData.append("selectedCountry", selectedCountry);
      formData.append("selectedState",   selectedState);
      formData.append("selectedCity",    selectedCity);

      await axios.post("https://inoptics.in/api/submit_become_an_exhibitor.php", formData);

      setSuccessMessage("✅ Submission Successful\nThank you for your application. Our team will review it and contact you shortly to proceed further.");

      form.reset();
      setSelectedProducts([]);
      setManualProduct("");
      setSelectedCountry("");
      setSelectedState("");
      setSelectedCity("");
      setStates([]);
      setCities([]);
    } catch (err) {
      console.error("BecomeExhibitor submit error:", err);
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setErrorMessage(apiMsg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-[Quicksand,sans-serif]">
      <Breadcrumbs />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 lg:py-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
              Registration
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif]">
            Become an{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Exhibitor
            </span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[16px] text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Join the leading platform for the optical industry. Reserve your stall and showcase your brand to industry leaders, distributors, and buyers from across the world.
          </p>
        </div>
      </section>

      {/* ============ INFO SECTION (overlapping hero) ============ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 -mt-12 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Powering Future */}
          <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-xl p-6 sm:p-8 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg mb-4">
              <MdHowToReg size={22} />
            </div>
            <h2
              className="relative text-xl sm:text-2xl font-bold text-[#02062c] mb-3 leading-snug
                [&_strong]:font-bold [&_em]:italic"
              dangerouslySetInnerHTML={{
                __html: poweringFutureData[0]?.title || "POWERING THE FUTURE OF INOPTICS",
              }}
            />
            <div
              className="relative text-[14px] text-zinc-600 leading-relaxed
                [&_p]:mb-2 [&_p:last-child]:mb-0
                [&_strong]:font-bold [&_strong]:text-[#02062c]
                [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: poweringFutureData[0]?.description || "Loading description...",
              }}
            />
          </div>

          {/* Why Exhibit */}
          <div className="group relative bg-white rounded-2xl border border-zinc-100 shadow-xl p-6 sm:p-8 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg mb-4">
              <MdCheckCircle size={22} />
            </div>
            <h2
              className="relative text-xl sm:text-2xl font-bold text-[#02062c] mb-3 leading-snug
                [&_strong]:font-bold [&_em]:italic"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData[0]?.title || "Why Exhibit at In-Optics",
              }}
            />
            <div
              className="relative text-[14px] text-zinc-600 leading-relaxed
                [&_p]:mb-2 [&_p:last-child]:mb-0
                [&_strong]:font-bold [&_strong]:text-[#02062c]
                [&_a]:text-blue-600 [&_a]:no-underline [&_a]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData[0]?.description || "Loading content...",
              }}
            />
          </div>
        </div>
      </section>

      {/* ============ REGISTRATION FORM ============ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-16 sm:mt-20 mb-16 sm:mb-24 flex-1">
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-2xl overflow-hidden">

          {/* Form header */}
          <div className="bg-gradient-to-r from-[#02062c] to-[#1e3a8a] px-6 sm:px-10 py-6 sm:py-8 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <MdHowToReg size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300">
                  Step 1 of 1
                </p>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight font-[Playfair_Display,serif] mt-0.5">
                  Registration Form
                </h2>
              </div>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">

            {/* ========== SECTION 1: Company Info ========== */}
            <SectionHeader number="01" title="Company &amp; Contact Info" tint="from-blue-500 to-cyan-500" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Company Name *" icon={<MdBusiness size={16} />}>
                <input name="companyName" type="text" placeholder="Your company name" className={INPUT_CLASS} />
              </Field>
              <Field label="Person Name *" icon={<MdPerson size={16} />}>
                <input name="personName" type="text" placeholder="Contact person" className={INPUT_CLASS} />
              </Field>
            </div>

            <Field label="Address *" icon={<MdHome size={16} />}>
              <input name="address" type="text" placeholder="Street address" className={INPUT_CLASS} />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <Field label="Country" icon={<MdLocationCity size={16} />}>
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(""); setSelectedCity(""); }}
                  className={INPUT_CLASS}
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.iso2} value={c.iso2}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="State" icon={<MdLocationCity size={16} />}>
                <select
                  value={selectedState}
                  onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); }}
                  className={INPUT_CLASS}
                  disabled={!selectedCountry}
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.iso2} value={s.iso2}>{s.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="City" icon={<MdLocationCity size={16} />}>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={INPUT_CLASS}
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Pin Code *" icon={<MdLocalPostOffice size={16} />}>
                <input name="pincode" type="text" placeholder="6-digit PIN" className={INPUT_CLASS} />
              </Field>
              <Field label="GST Number *" icon={<MdReceiptLong size={16} />}>
                <input name="gst" type="text" placeholder="GST number" className={INPUT_CLASS} />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <Field label="Mobile *" icon={<MdSmartphone size={16} />}>
                <input name="mobile" type="text" placeholder="Mobile number" className={INPUT_CLASS} />
              </Field>
              <Field label="Landline" icon={<MdPhone size={16} />}>
                <input name="landline" type="text" placeholder="Optional" className={INPUT_CLASS} />
              </Field>
              <Field label="Email *" icon={<MdEmail size={16} />}>
                <input name="email" type="email" placeholder="email@company.com" className={INPUT_CLASS} />
              </Field>
            </div>

            {/* ========== SECTION 2: Booth & Products ========== */}
            <SectionHeader number="02" title="Booth Requirements &amp; Products" tint="from-amber-500 to-orange-500" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Booth Space Required" icon={<MdSpaceBar size={16} />}>
                <input name="boothSpace" type="text" placeholder="Your stall size in sq mtrs" className={INPUT_CLASS} required />
              </Field>

              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Choose Space *</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "bare",  label: "Bare Space" },
                    { value: "stall", label: "Stall Space" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 px-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-all"
                    >
                      <input type="radio" name="spaceType" value={opt.value} className="w-4 h-4 accent-blue-600" />
                      <span className="text-[13px] font-semibold text-[#02062c]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Product checkboxes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MdShoppingBag size={18} className="text-blue-500" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">Products</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[...PRODUCT_OPTIONS, "Other"].map((product) => (
                  <label
                    key={product}
                    className="flex items-center gap-2.5 px-3.5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-all"
                  >
                    <input
                      type="checkbox"
                      value={product}
                      checked={selectedProducts.includes(product)}
                      onChange={handleProductChange}
                      className="w-4 h-4 rounded accent-blue-600 shrink-0"
                    />
                    <span className="text-[13px] text-[#02062c] font-medium leading-snug">{product}</span>
                  </label>
                ))}
              </div>
            </div>

            {showManualInput && (
              <Field label="Specify Product Manually" icon={<MdShoppingBag size={16} />}>
                <input
                  type="text"
                  value={manualProduct}
                  onChange={(e) => setManualProduct(e.target.value)}
                  placeholder="Type your product name"
                  className={INPUT_CLASS}
                />
              </Field>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Brands" icon={<MdLabel size={16} />}>
                <input name="brands" type="text" placeholder="Brand names you'll showcase" className={INPUT_CLASS} />
              </Field>
              <Field label="Home Brands" icon={<MdLabel size={16} />}>
                <input name="homeBrands" type="text" placeholder="Your in-house brands" className={INPUT_CLASS} />
              </Field>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-2.5 text-[12px] sm:text-[13px] text-zinc-600 cursor-pointer select-none">
              <input
                type="checkbox"
                name="consentUpdates"
                required
                className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-blue-600 cursor-pointer"
              />
              <span>
                I agree to receive all updates related to <b className="text-[#02062c]">In-Optics</b> on my provided email address from{" "}
                <span className="text-blue-600 font-semibold">support@inoptic.com</span>,{" "}
                <span className="text-blue-600 font-semibold">infoinoptics@gmail.com</span>.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-[14px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <span className="relative flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MdHowToReg size={18} />
                    Register Now
                  </>
                )}
              </span>
            </button>

            {/* Status messages */}
            {successMessage && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] animate-[fadeUp_0.3s_ease]">
                <MdCheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium whitespace-pre-line">{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[13px] animate-[fadeUp_0.3s_ease]">
                <MdCheckCircle size={20} className="text-red-500 rotate-45 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============ sub-components ============ */
const INPUT_CLASS =
  "w-full h-12 pl-10 pr-3 text-[14px] border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-zinc-100 disabled:text-zinc-400 transition-all";

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

function SectionHeader({ number, title, tint }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
      <span className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${tint} text-white text-[12px] font-black tracking-wider shadow-md`}>
        {number}
      </span>
      <h3
        className="text-[16px] sm:text-[18px] font-bold text-[#02062c] tracking-tight"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
