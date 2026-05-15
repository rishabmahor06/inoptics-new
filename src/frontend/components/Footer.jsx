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
    const target = type.toLowerCase();
    const s = sponsorImages.find((img) =>
      String(img.sponsor_type || "")
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .includes(target)
    );
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

  const hasToken = (img, target) =>
    String(img.sponsor_type || "")
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .includes(target.toLowerCase());

  const tokensOf = (img) =>
    String(img.sponsor_type || "")
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const PLATINUM_TOKENS = ["footer-platinum", "platinum", "title", "diamond"];

  const platinumImg =
    PLATINUM_TOKENS.map((t) => getSponsor(t)).find(Boolean) || null;

  const goldSponsors = sponsorImages.filter((img) =>
    tokensOf(img).some((t) => t.includes("gold") || t === "co-title")
  );
  const silverSponsors = sponsorImages.filter((img) =>
    tokensOf(img).some((t) => t.includes("silver") || t === "bronze")
  );

  const SOCIAL_ICONS = [
    { Icon: FaFacebookF,  label: "Facebook", href: "https://www.facebook.com/inopticsonoptics", target: "_blank" },
    { Icon: FaInstagram,  label: "Instagram", href: "https://www.instagram.com/inoptic99/", target: "_blank" },
    { Icon: FaLinkedinIn, label: "LinkedIn", href: "https://www.linkedin.com/company/inoptics", target: "_blank" },
    { Icon: FaYoutube,    label: "YouTube", href: "https://www.youtube.com/channel/UCZzX2F7ztBatHyOkZo2cmQw", target: "_blank" },
    { Icon: FaEnvelope,   label: "Email", href: "mailto:info@inoptics.in", target: "_blank" },
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
        {(platinumImg || goldSponsors.length > 0 || silverSponsors.length > 0) && (
          <div className="rounded-2xl overflow-hidden mb-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 p-3 sm:p-4">

              {/* ─── LEFT: Platinum ─── */}
              {platinumImg && (
                <div className="md:col-span-3 flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-violet-400 mb-1.5 px-1">
                    Platinum
                  </span>
                  <div className="bg-white rounded-xl flex items-center justify-center flex-1 min-h-28 md:min-h-full p-3">
                    <img
                      src={platinumImg}
                      alt="Platinum Sponsor"
                      className="max-h-24 sm:max-h-28 md:max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* ─── MIDDLE: Gold ─── */}
              {goldSponsors.length > 0 && (
                <div className={`${platinumImg ? "md:col-span-5" : "md:col-span-6"} flex flex-col`}>
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-amber-400 mb-1.5 px-1">
                    Gold Sponsors
                    <span className="ml-1.5 text-zinc-500 font-normal tracking-normal">· {goldSponsors.length}</span>
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 content-start">
                    {goldSponsors.map((s, i) => (
                      <div
                        key={s.id || i}
                        title={s.name}
                        className="bg-white rounded-lg flex items-center justify-center h-16 sm:h-18 px-1.5 py-2 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                      >
                        <img
                          src={`${API}/${s.image_path}`}
                          alt={s.name || "Gold Sponsor"}
                          className="max-h-10 sm:max-h-12 max-w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── RIGHT: Silver ─── */}
              {silverSponsors.length > 0 && (
                <div className={`${platinumImg ? "md:col-span-4" : "md:col-span-6"} flex flex-col`}>
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-300 mb-1.5 px-1">
                    Silver Sponsors
                    <span className="ml-1.5 text-zinc-500 font-normal tracking-normal">· {silverSponsors.length}</span>
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 flex-1 content-start">
                    {silverSponsors.map((s, i) => (
                      <div
                        key={s.id || i}
                        title={s.name}
                        className="bg-white rounded-lg flex items-center justify-center h-16 sm:h-18 px-1.5 py-2 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                      >
                        <img
                          src={`${API}/${s.image_path}`}
                          alt={s.name || "Silver Sponsor"}
                          className="max-h-10 sm:max-h-12 max-w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                      href={SOCIAL_ICONS[i].href}
                      target={SOCIAL_ICONS[i].target}
                      rel="noopener noreferrer"
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
                          "ADDRESS : RSD EXPOSITIONS, A99 DEFENCE COLONY, NEW DELHI - 110024 (INDIA)",
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

              </div>
            </div>

            {/* ============ ORG + MEMBER LOGOS (centered, bottom) ============ */}
            <div className="px-6 sm:px-10 lg:px-14 pt-6 pb-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                {(footer4.length > 0
                  ? footer4.slice(0, 2)
                  : [
                      { title: "Event Organised By", image: null, _fallback: "rsd expositions" },
                      { title: "Member Of", image: null, _fallback: "iEIA" },
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center space-y-2"
                  >
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 m-0 font-semibold">
                      {item.title}
                    </p>
                    <div className="h-24 sm:h-28 flex items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="max-h-24 sm:max-h-28 max-w-72 w-auto object-contain"
                        />
                      ) : (
                        <div className="text-[12px] text-zinc-400 italic">
                          {item._fallback}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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