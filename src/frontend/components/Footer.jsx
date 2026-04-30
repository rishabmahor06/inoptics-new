import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import {
  MdClose, MdLocationOn, MdPhone, MdEmail, MdSend, MdArrowOutward,
  MdChevronRight, MdShield,
} from "react-icons/md";

const API = "https://inoptics.in/api";

export default function Footer() {
  const [sponsorImages,  setSponsorImages]  = useState([]);
  const [footer1,        setFooter1]        = useState([]);
  const [footer2,        setFooter2]        = useState([]);
  const [footer3,        setFooter3]        = useState([]);
  const [footer4,        setFooter4]        = useState([]);
  const [activeModal,    setActiveModal]    = useState(null);
  const [privacyDetails, setPrivacyDetails] = useState([]);
  const [termsDetails,   setTermsDetails]   = useState([]);

  useEffect(() => {
    const safe = (url, setter) => async () => {
      try {
        const r = await fetch(url);
        const d = await r.json();
        setter(Array.isArray(d) ? d : (d ? [d] : []));
      } catch (e) { console.error(`Fetch ${url} failed`, e); }
    };
    safe(`${API}/get_sponsor_images_list.php`, setSponsorImages)();
    safe(`${API}/get_footer_details1.php`,     setFooter1)();
    safe(`${API}/get_footer_details2.php`,     setFooter2)();
    safe(`${API}/get_footer_details3.php`,     setFooter3)();
    safe(`${API}/get_footer_details4.php`,     setFooter4)();
  }, []);

  const getSponsor = (type) => {
    const s = sponsorImages.find((img) => img.sponsor_type?.toLowerCase() === type.toLowerCase());
    return s ? `${API}/${s.image_path}` : null;
  };

  const addressDetail = footer3.find((i) => i.description?.toLowerCase().includes("address"));
  const contactDetail = footer3.find((i) => i.description?.toLowerCase().includes("call"));
  const emailDetail   = footer3.find((i) => i.description?.toLowerCase().includes("email"));

  const openModal = async (type) => {
    setActiveModal(type);
    if (type === "privacy" && privacyDetails.length === 0) {
      try {
        const r = await fetch(`${API}/get_privacy_details.php`);
        setPrivacyDetails(await r.json() || []);
      } catch (e) { console.error("Privacy fetch failed", e); }
    }
    if (type === "terms" && termsDetails.length === 0) {
      try {
        const r = await fetch(`${API}/get_terms_details.php`);
        setTermsDetails(await r.json() || []);
      } catch (e) { console.error("Terms fetch failed", e); }
    }
  };

  const goldSponsors = [
    { type: "Footer-Gold",     alt: "Gold Sponsor" },
    { type: "Footer-Silver",   alt: "Silver Sponsor" },
    { type: "Footer-Media",    alt: "Media Partner" },
    { type: "Footer-Foreign",  alt: "Foreign Partner" },
    { type: "Footer-hoya",     alt: "Hoya" },
    { type: "Footer-fastrack", alt: "Fastrack" },
  ].filter((s) => getSponsor(s.type));

  const SOCIAL_ICONS = [
    { Icon: FaFacebookF,  bg: "bg-[#1877F2]",                  label: "Facebook" },
    { Icon: FaInstagram,  bg: "bg-linear-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]", label: "Instagram" },
    { Icon: FaLinkedinIn, bg: "bg-[#0A66C2]",                  label: "LinkedIn" },
    { Icon: FaYoutube,    bg: "bg-[#FF0000]",                  label: "YouTube" },
  ];

  return (
    <>
      <div className="px-3 sm:px-5 py-5 bg-[#03050d]">
        <footer className="relative rounded-3xl overflow-hidden bg-[#070a18] border border-blue-500/20 shadow-[0_0_60px_-20px_rgba(59,130,246,0.4)]">
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-300 h-300 rounded-full bg-blue-600/4 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />

          <div className="relative z-10">

            {/* ============ TOP: 4 columns ============ */}
            <div className="px-6 sm:px-10 lg:px-14 pt-12 sm:pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">

              {/* About / Logo */}
              <div className="lg:col-span-3 space-y-5">
                {footer1[0] ? (
                  <Link to="/" className="inline-block">
                    <img
                      src={footer1[0].image}
                      alt="InOptics"
                      className="max-w-45 h-auto"
                    />
                  </Link>
                ) : (
                  <Link to="/" className="inline-block">
                    <span className="text-xl font-light text-blue-400">
                      Think Optics: Think
                    </span>
                    <div className="text-3xl font-bold text-blue-300 tracking-tight leading-none">
                      INOPTICS
                    </div>
                    <div className="text-[10px] tracking-widest text-zinc-400 mt-1">
                      WHERE VISION MEETS INNOVATION
                    </div>
                  </Link>
                )}

                <div
                  className="text-[14px] leading-relaxed text-zinc-400 [&_a]:text-blue-400 [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: footer1[0]?.description ||
                      "A grand showcase of visionary innovation, technology &amp; excellence in the world of optics",
                  }}
                />

                <div className="flex items-center gap-2.5 pt-1">
                  {SOCIAL_ICONS.map(({ Icon, bg, label }, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label={label}
                      className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center text-white shadow-lg shadow-black/30 hover:scale-110 hover:shadow-xl transition-all`}
                    >
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Explore */}
              <div className="lg:col-span-2 space-y-4">
                <SectionHeading>Explore</SectionHeading>
                <ul className="space-y-3">
                  {[
                    { to: "/about",            label: "About Us" },
                    { to: "/why-exhibit",      label: "Why Exhibit" },
                    { to: "/become-exhibitor", label: "Become Exhibitor" },
                    { to: "/benefactors",      label: "Our Partners" },
                    { to: "/contact",          label: "Contact" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="group flex items-center gap-1.5 text-[14px] text-zinc-300 hover:text-blue-400 transition-colors"
                      >
                        <MdChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Get in Touch */}
              <div className="lg:col-span-3 space-y-4">
                <SectionHeading>Get in Touch</SectionHeading>
                <ul className="space-y-4">
                  <ContactItem icon={<MdLocationOn size={16} />}>
                    <span
                      className="text-[13px] text-zinc-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: addressDetail?.description || "Our Address" }}
                    />
                  </ContactItem>
                  <ContactItem icon={<MdPhone size={16} />}>
                    <a
                      href={`tel:${(contactDetail?.description || "").replace(/<[^>]*>/g, "").replace(/[^0-9+]/g, "")}`}
                      className="text-[13px] text-zinc-300 hover:text-blue-400 transition-colors"
                      dangerouslySetInnerHTML={{ __html: contactDetail?.description || "Call us" }}
                    />
                  </ContactItem>
                  <ContactItem icon={<MdEmail size={16} />}>
                    <a
                      href={`mailto:${(emailDetail?.description || "").replace(/<[^>]*>/g, "").replace(/.*?:/, "").trim()}`}
                      className="text-[13px] text-zinc-300 hover:text-blue-400 transition-colors break-all"
                      dangerouslySetInnerHTML={{ __html: emailDetail?.description || "Email" }}
                    />
                  </ContactItem>
                </ul>
              </div>

              {/* Newsletter + Org */}
              <div className="lg:col-span-4 space-y-4">
                <SectionHeading>Don't Miss Out!</SectionHeading>
                <p
                  className="text-[13px] text-zinc-400 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: footer2[0]?.description ||
                      "Big announcements, cutting-edge updates, and exclusive offers — straight to your inbox. Enter your email above and stay one step ahead.",
                  }}
                />
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full pl-5 pr-14 h-12 text-[13px] rounded-full bg-white/4 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-400 focus:bg-white/6 transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all"
                  >
                    <MdSend size={14} />
                  </button>
                </form>

                {footer4.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {footer4.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 m-0">
                          {item.title}
                        </p>
                        <div className="h-12 flex items-center">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-h-12 max-w-full w-auto object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ============ DIVIDER ============ */}
            <div className="px-6 sm:px-10 lg:px-14">
              <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ============ SPONSORS ============ */}
            <div className="px-6 sm:px-10 lg:px-14 pt-10 pb-8">
              <div className="text-center mb-7">
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-400">
                  — Our Partners —
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
                {/* Platinum */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-300/80 m-0">
                    Platinum Sponsor
                  </p>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-32 sm:min-h-37 hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
                    {getSponsor("Footer-Platinum") ? (
                      <img
                        src={getSponsor("Footer-Platinum")}
                        alt="Platinum Sponsor"
                        className="max-w-[80%] max-h-25 object-contain"
                      />
                    ) : (
                      <span className="text-zinc-400 text-[12px]">—</span>
                    )}
                  </div>
                </div>

                {/* Gold + View All */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/80 m-0">
                    <span className="text-amber-300">Gold Sponsors</span>
                    <span className="text-zinc-500"> &amp; Partners</span>
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                    {goldSponsors.map((s, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl flex items-center justify-center min-h-22 sm:min-h-25 p-2 sm:p-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
                      >
                        <img
                          src={getSponsor(s.type)}
                          alt={s.alt}
                          className="max-w-[85%] max-h-16 object-contain"
                        />
                      </div>
                    ))}
                    <Link
                      to="/benefactors"
                      className="group bg-white/3 hover:bg-white/8 border border-white/10 hover:border-blue-400/50 rounded-xl flex flex-col items-center justify-center min-h-22 sm:min-h-25 p-3 text-center transition-all"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        View All
                      </span>
                      <MdArrowOutward
                        size={18}
                        className="text-blue-400 mt-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ DIVIDER ============ */}
            <div className="px-6 sm:px-10 lg:px-14">
              <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ============ COPYRIGHT ============ */}
            <div className="px-6 sm:px-10 lg:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-zinc-500">
              <p className="m-0 flex items-center gap-2 text-center sm:text-left">
                <span className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                  <MdShield size={13} />
                </span>
                © {new Date().getFullYear()} <span className="text-zinc-300">Inoptic</span>. All rights reserved.
                <span className="hidden sm:inline text-zinc-600">|</span>
                <span className="hidden sm:inline">Developed by RSD Expositions.</span>
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => openModal("privacy")} className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </button>
                <span className="text-zinc-700">|</span>
                <button onClick={() => openModal("terms")} className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms &amp; Conditions
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ============ MODAL ============ */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-250 max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[modalUp_0.3s_ease]"
          >
            <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white z-10">
              <h2 className="m-0 text-zinc-900 text-[18px] sm:text-[20px] font-bold tracking-tight">
                {activeModal === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-red-500 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 text-zinc-700 leading-relaxed text-[14px] sm:text-[15px] [&>p]:mb-4 [&_a]:text-blue-600 [&_a]:underline">
              {activeModal === "privacy" &&
                (privacyDetails.length > 0
                  ? privacyDetails.map((item, i) => <p key={i} dangerouslySetInnerHTML={{ __html: item.description }} />)
                  : <p className="text-zinc-400">Loading Privacy Policy...</p>
                )}
              {activeModal === "terms" &&
                (termsDetails.length > 0
                  ? termsDetails.map((item, i) => <p key={i} dangerouslySetInnerHTML={{ __html: item.description }} />)
                  : <p className="text-zinc-400">Loading Terms &amp; Conditions...</p>
                )}
            </div>
          </div>

          <style>{`
            @keyframes fadeIn  { 0% { opacity: 0; } 100% { opacity: 1; } }
            @keyframes modalUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}
    </>
  );
}

/* ================== sub-components ================== */

function SectionHeading({ children }) {
  return (
    <div>
      <h4 className="text-white text-[14px] font-bold uppercase tracking-[0.2em] m-0">
        {children}
      </h4>
      <div className="mt-2 w-12 h-0.75 rounded-full bg-linear-to-r from-purple-500 to-blue-500" />
    </div>
  );
}

function ContactItem({ icon, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
        {icon}
      </span>
      <div className="pt-1.5 min-w-0">{children}</div>
    </li>
  );
}
