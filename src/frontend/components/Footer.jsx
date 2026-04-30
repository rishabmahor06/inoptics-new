import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaEnvelope } from "react-icons/fa";
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
    { Icon: FaFacebookF,  label: "Facebook" },
    { Icon: FaInstagram,  label: "Instagram" },
    { Icon: FaLinkedinIn, label: "LinkedIn" },
    { Icon: FaYoutube,    label: "YouTube" },
    { Icon: FaEnvelope,   label: "Email" },
  ];

  const EXPLORE_LINKS = [
    { to: "/about",            label: "About Us" },
    { to: "/why-exhibit",      label: "Why Exhibit" },
    { to: "/become-exhibitor", label: "Become Exhibitor" },
    { to: "/benefactors",      label: "Our Partners" },
    { to: "/contact",          label: "Contact" },
  ];

  return (
    <>
      <div className="bg-[#03050d] px-3 sm:px-5 pt-5 pb-0">

        {/* ============ SPONSORS CARD (top, outside main footer) ============ */}
        <div className="rounded-2xl   overflow-hidden mb-5">
          {/* Labels Row */}
          <div className="flex px-4 sm:px-6 pt-4 pb-2">
            <div className="flex-none w-full sm:w-[38%] lg:w-[30%]">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-violet-400">
                Platinum Sponsors
              </span>
            </div>
            <div className="hidden sm:block flex-1">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-400">
                Gold Sponsors
              </span>
            </div>
          </div>

          {/* Cards Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4">
            {/* Platinum Card */}
            <div className="sm:w-[38%] lg:w-[30%] shrink-0">
              <div className="bg-white rounded-xl flex items-center justify-center h-28 sm:h-32 px-6">
                {getSponsor("Footer-Platinum") ? (
                  <img
                    src={getSponsor("Footer-Platinum")}
                    alt="Platinum Sponsor"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-zinc-400 text-[13px] font-medium">Platinum Sponsor</span>
                )}
              </div>
            </div>

            {/* Gold Sponsors Grid */}
            <div className="flex-1">
              {/* Mobile label */}
              <div className="sm:hidden mb-2">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-400">
                  Gold Sponsors
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {goldSponsors.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl flex items-center justify-center h-28 sm:h-32 px-2 py-3 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    <img
                      src={getSponsor(s.type)}
                      alt={s.alt}
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                ))}
                {/* Explore More */}
                <Link
                  to="/benefactors"
                  className="group bg-[#1a1c2e] hover:bg-[#22253a] rounded-xl flex flex-col items-center justify-center h-28 sm:h-32 px-2 text-center transition-all border border-white/10"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white leading-tight">
                    Explore More Sponsors
                  </span>
                  <MdArrowOutward
                    size={18}
                    className="text-white/60 mt-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ============ MAIN FOOTER CARD ============ */}
        <div className="rounded-3xl bg-[#070a18] border border-white/10 overflow-hidden relative">

          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.07),transparent_60%)]" />

          <div className="relative z-10">

            {/* ============ 4 COLUMNS ============ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-white/10 px-0">

              {/* ── Col 1: Logo + About + Social ── */}
              <div className="px-7 sm:px-8 py-10 space-y-5">
                {/* Logo */}
                {footer1[0]?.image ? (
                  <Link to="/" className="inline-block">
                    <img src={footer1[0].image} alt="InOptics" className="max-w-44 h-auto" />
                  </Link>
                ) : (
                  <Link to="/" className="inline-block space-y-0.5">
                    <div className="text-[13px] font-light text-blue-300 tracking-wide">
                      Think Optics: Think
                    </div>
                    <div className="text-[42px] font-bold leading-none tracking-tight">
                      <span className="text-white">in</span>
                      <span className="text-[#00b4d8]">optics</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] tracking-widest text-zinc-400 font-light mt-0.5">
                      <span>Where Vision</span>
                      <span className="text-[#00b4d8] font-bold">|</span>
                      <span className="text-[#00b4d8]">Meets Innovation</span>
                    </div>
                  </Link>
                )}

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed text-zinc-400"
                  dangerouslySetInnerHTML={{
                    __html: footer1[0]?.description ||
                      "A grand showcase of visionary innovation, technology &amp; excellence in the world of optics",
                  }}
                />

                {/* Social Icons */}
                <div className="flex items-center gap-2 pt-1">
                  {SOCIAL_ICONS.map(({ Icon, label }, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label={label}
                      className="w-10 h-10 rounded-full bg-[#111827] border border-white/50 flex items-center justify-center text-white hover:text-white hover:border-white/40 hover:bg-white/10 transition-all"
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>

              {/* ── Col 2: Explore ── */}
              <div className="px-7 sm:px-10 py-10 space-y-5">
                <SectionHeading>Explore</SectionHeading>
                <ul className="space-y-3.5">
                  {EXPLORE_LINKS.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="group flex items-center gap-2 text-[14px] text-zinc-100 hover:text-white transition-colors"
                      >
                        <MdChevronRight
                          size={18}
                          className="text-zinc-100 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                        />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Col 3: Get in Touch ── */}
              <div className="px-7 sm:px-8 py-10 space-y-5">
                <SectionHeading>Get in Touch</SectionHeading>
                <ul className="space-y-5">
                  <ContactItem icon={<MdLocationOn size={16} />}>
                    <span
                      className="text-[13px] text-zinc-100 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: addressDetail?.description ||
                          "OUR ADDRESS : RSD EXPOSITIONS, A99 DEFENCE COLONY, NEW DELHI - 110024 (INDIA)",
                      }}
                    />
                  </ContactItem>
                  <ContactItem icon={<MdPhone size={16} />}>
                    <a
                      href={`tel:${(contactDetail?.description || "").replace(/<[^>]*>/g, "").replace(/[^0-9+]/g, "")}`}
                      className="text-[13px] text-zinc-100 hover:text-white transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: contactDetail?.description || "CALL US AT: +91-11-41815099",
                      }}
                    />
                  </ContactItem>
                  <ContactItem icon={<MdEmail size={16} />}>
                    <a
                      href={`mailto:${(emailDetail?.description || "").replace(/<[^>]*>/g, "").replace(/.*?:/, "").trim()}`}
                      className="text-[13px] text-zinc-100 hover:text-white transition-colors break-all"
                      dangerouslySetInnerHTML={{
                        __html: emailDetail?.description ||
                          "EMAIL: SUPPORT@INOPTICS.IN,<br/>INFOINOPTICS@GMAIL.COM",
                      }}
                    />
                  </ContactItem>
                </ul>
              </div>

              {/* ── Col 4: Newsletter + Org ── */}
              <div className="px-7 sm:px-8 py-10 space-y-5">
                <SectionHeading>Don't Miss Out!</SectionHeading>
                <p
                  className="text-[13px] text-zinc-200 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: footer2[0]?.description ||
                      "Big announcements, cutting-edge updates, and exclusive offers — straight to your inbox. Enter your email above and stay one step ahead.",
                  }}
                />
                {/* Email Input */}
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full pl-4 pr-14 h-12 text-[16px] rounded bg-[#111827] border border-white/15 text-white placeholder:text-zinc-200 focus:outline-none focus:border-blue-500/60 transition-all"
                  />
                  <button
                    type="button"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition-all"
                  >
                    <MdSend size={15} />
                  </button>
                </div>

                {/* Org + Member logos */}
                {footer4.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {footer4.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 m-0 font-semibold">
                          {item.title}
                        </p>
                        <div className="h-14 flex items-center">
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

                {/* Fallback if no footer4 data */}
                {footer4.length === 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 m-0 font-semibold">
                        Event Organised By
                      </p>
                      <div className="h-14 flex items-center">
                        <div className="text-[11px] text-zinc-400 italic">rsd expositions</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 m-0 font-semibold">
                        Member Of
                      </p>
                      <div className="h-14 flex items-center">
                        <div className="text-[11px] text-zinc-400 italic">iEIA</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============ DIVIDER ============ */}
            <div className="px-6 sm:px-10 lg:px-14">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ============ BOTTOM BAR ============ */}
            <div className="px-6 sm:px-10 lg:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-zinc-100">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                <span className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                  <MdShield size={13} />
                </span>
                <span>
                  © {new Date().getFullYear()}{" "}
                  <span className="text-zinc-10">Inoptic</span>
                  . All rights reserved.
                </span>
                <span className="hidden sm:inline text-zinc-100">|</span>
                <span className="hidden sm:inline">Developed by RSD Expositions.</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => openModal("privacy")}
                  className="text-zinc-100 hover:text-blue-300 transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-zinc-100">|</span>
                <button
                  onClick={() => openModal("terms")}
                  className="text-zinc-100 hover:text-blue-300 transition-colors"
                >
                  Terms &amp; Conditions
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-5" />
      </div>

      {/* ============ MODAL ============ */}
      {activeModal && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ animation: "modalUp 0.3s ease" }}
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
                  ? privacyDetails.map((item, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: item.description }} />
                    ))
                  : <p className="text-zinc-400">Loading Privacy Policy...</p>
                )}
              {activeModal === "terms" &&
                (termsDetails.length > 0
                  ? termsDetails.map((item, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: item.description }} />
                    ))
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

/* ================== Sub-components ================== */

function SectionHeading({ children }) {
  return (
    <div>
      <h4 className="text-white text-[15px] font-bold uppercase tracking-[0.15em] m-0">
        {children}
      </h4>
      <div className="mt-2.5 w-10 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
    </div>
  );
}

function ContactItem({ icon, children }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="w-10 h-10 rounded-full bg-[#111827] border border-white/50 flex items-center justify-center text-zinc-100 shrink-0 mt-0.5">
        {icon}
      </span>
      <div className="pt-2 min-w-0">{children}</div>
    </li>
  );
}