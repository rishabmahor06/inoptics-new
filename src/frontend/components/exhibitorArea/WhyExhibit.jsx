import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowOutward, MdDownload, MdHowToReg, MdCheckCircle,
  MdTrendingUp, MdPublic, MdVisibility, MdGroups,
  MdRocketLaunch, MdWorkspacePremium, MdImage,
} from "react-icons/md";
import Footer from "../Footer";
import Breadcrumbs from "../Breadcrumbs";

const BENEFITS = [
  {
    Icon: MdTrendingUp,
    tint: "from-blue-500 to-cyan-500",
    title: "Industry Exposure",
    points: [
      "Gain visibility in one of the most targeted optical trade environments.",
      "Reach over 22,000+ verified trade visitors – domestic and international.",
      "Showcase directly to key decision-makers including buyers, suppliers, and investors.",
      "Increase brand recognition within your niche through dedicated exhibiting space.",
    ],
  },
  {
    Icon: MdPublic,
    tint: "from-emerald-500 to-teal-500",
    title: "Wider Market Reach",
    points: [
      "Connect with clients from multiple regions and countries in one place.",
      "Explore opportunities in untapped regional and global markets.",
      "Engage with new segments — retail chains, startups, and B2B distributors.",
      "Position your brand as a national and international player.",
    ],
  },
  {
    Icon: MdVisibility,
    tint: "from-purple-500 to-pink-500",
    title: "Brand & Product Visibility",
    points: [
      "Promote your latest offerings through live demos and product showcases.",
      "Utilize high-traffic footer ad slots for round-the-clock brand visibility.",
      "Let your brand stand out in a dedicated, professional setting.",
      "Highlight your USPs directly to industry buyers and media.",
    ],
  },
  {
    Icon: MdGroups,
    tint: "from-amber-500 to-orange-500",
    title: "Networking & Business Growth",
    points: [
      "Meet new clients and build strategic partnerships.",
      "Reconnect with existing distributors and industry peers.",
      "Generate high-quality business leads across three packed days.",
      "Discover potential investment and expansion opportunities.",
    ],
  },
  {
    Icon: MdRocketLaunch,
    tint: "from-rose-500 to-red-500",
    title: "Launchpad for New Products",
    points: [
      "Launch new products in front of a live, responsive audience.",
      "Get instant feedback and interest from retail buyers and business owners.",
      "Test-market innovations and trends.",
      "Create pre-launch buzz and media attention around your brand.",
    ],
  },
  {
    Icon: MdWorkspacePremium,
    tint: "from-indigo-500 to-blue-500",
    title: "Professional Brand Positioning",
    points: [
      "Establish your company as a trusted name in the optics industry.",
      "Build your brand reputation in a reputable and well-attended exhibition.",
      "Earn trust through direct face-to-face engagement with real buyers.",
      "Strengthen credibility alongside top industry brands.",
    ],
  },
];

export default function WhyExhibit() {
  const navigate = useNavigate();
  const [whyExhibitData,      setWhyExhibitData]      = useState([]);
  const [whyExhibitImageData, setWhyExhibitImageData] = useState([]);
  const [whyExhibitPdfData,   setWhyExhibitPdfData]   = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered,      setHovered]      = useState(false);

  /* ============ data fetch ============ */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_why_exhibit.php");
        setWhyExhibitData(await r.json() || []);
      } catch (e) { console.error("Why Exhibit fetch failed", e); }
    })();
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_why_exhibit_image.php");
        setWhyExhibitImageData(await r.json() || []);
      } catch (e) { console.error("Why Exhibit images fetch failed", e); }
    })();
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_whyexhibit_pdf.php");
        setWhyExhibitPdfData(await r.json() || []);
      } catch (e) { console.error("PDFs fetch failed", e); }
    })();
  }, []);

  /* ============ image slideshow auto ============ */
  useEffect(() => {
    if (whyExhibitImageData.length === 0 || hovered) return;
    const t = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % whyExhibitImageData.length);
    }, 5000);
    return () => clearInterval(t);
  }, [whyExhibitImageData, hovered]);

  const goToBecome = () => navigate("/become-exhibitor");

  const handleDownloadPdf = () => {
    const brochure = whyExhibitPdfData.find((i) => i.title === "In-Optics Brochure");
    if (brochure?.pdf_url) {
      window.open(brochure.pdf_url, "_blank", "noopener,noreferrer");
    } else {
      alert("Brochure not available at the moment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col font-[Quicksand,sans-serif]">
      <Breadcrumbs />

      {/* ============ HERO with side image ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* LEFT: text */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-300">
                Why Exhibit
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif] leading-tight
                [&_em]:bg-gradient-to-r [&_em]:from-amber-300 [&_em]:to-pink-300 [&_em]:bg-clip-text [&_em]:text-transparent [&_em]:not-italic [&_em]:font-light"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData[0]?.title || "Why <em>Exhibit</em> at InOptics?",
              }}
            />
            <div
              className="mt-5 text-[14px] sm:text-[16px] text-blue-200 leading-relaxed max-w-xl
                [&_p]:mb-2 [&_a]:text-amber-300 [&_a]:no-underline [&_a]:font-semibold hover:[&_a]:text-white
                [&_strong]:font-bold [&_strong]:text-white"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData[0]?.text || "Connect with industry leaders, showcase your brand, and unlock powerful business opportunities at India's #1 optics exhibition.",
              }}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={goToBecome}
                className="group inline-flex items-center gap-2 px-6 h-12 bg-amber-400 hover:bg-amber-300 text-[#02062c] text-[13px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all"
              >
                <MdHowToReg size={16} />
                Become an Exhibitor
                <MdArrowOutward size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-6 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[13px] font-bold uppercase tracking-wider rounded-xl border border-white/20 transition-all"
              >
                <MdDownload size={16} /> Download Brochure
              </button>
            </div>
          </div>

          {/* RIGHT: slideshow */}
          <div
            className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[5/4] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {whyExhibitImageData.length > 0 ? (
              <>
                {whyExhibitImageData.map((img, i) => (
                  <img
                    key={i}
                    src={img.image_url}
                    alt={`Why Exhibit ${i}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                      i === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {whyExhibitImageData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                {/* progress bar */}
                {!hovered && (
                  <div
                    key={currentIndex}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-300 to-pink-300 origin-left"
                    style={{ animation: "slideProgress 5s linear forwards" }}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <MdImage size={48} className="opacity-30" />
                <p className="text-[13px]">Loading images...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ ACTION BAND ============ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-12 sm:mt-16">
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl p-6 sm:p-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">
              The Opportunity
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
              Why Become an{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Exhibitor?
              </span>
            </h2>
            <p className="mt-4 text-[14px] sm:text-[15px] text-zinc-600 leading-relaxed">
              Gain unmatched visibility across your target audience by connecting directly with influential industry leaders and decision-makers. Showcase your brand, products, and services on a global stage while unlocking powerful business opportunities and long-term partnerships.
            </p>
          </div>

          {/* Two action rows */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActionRow
              accent="from-blue-500 to-cyan-500"
              text="Connect with industry leaders and showcase your brand"
              btnText="Become an Exhibitor"
              btnIcon={<MdHowToReg size={14} />}
              onClick={goToBecome}
            />
            <ActionRow
              accent="from-amber-500 to-orange-500"
              text="Looking for complete event insights?"
              btnText="Download Brochure"
              btnIcon={<MdDownload size={14} />}
              onClick={handleDownloadPdf}
              variant="amber"
            />
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 mt-16 sm:mt-24 mb-20 sm:mb-28 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">
            Top 6 Reasons
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Exhibiting
            </span>
          </h2>
          <div className="mt-2 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {BENEFITS.map((b, i) => (
            <BenefitCard key={i} benefit={b} index={i} />
          ))}
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes slideProgress {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ============ sub-components ============ */

function ActionRow({ accent, text, btnText, btnIcon, onClick, variant }) {
  return (
    <div className="group relative bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-blue-300 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-lg overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300`} />
      <p className="text-[14px] sm:text-[15px] font-semibold text-[#02062c] flex items-start gap-2">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br ${accent} text-white shrink-0 mt-0.5`}>
          <MdCheckCircle size={14} />
        </span>
        <span>{text}</span>
      </p>
      <button
        onClick={onClick}
        className={`group/btn shrink-0 inline-flex items-center justify-center gap-1.5 px-4 h-11 text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all
          ${variant === "amber"
            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30 hover:shadow-lg"
            : "bg-[#02062c] hover:bg-[#0a1450] text-white shadow-md hover:shadow-lg"}`}
      >
        {btnIcon}
        {btnText}
        <MdArrowOutward size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}

function BenefitCard({ benefit, index }) {
  const { Icon, tint, title, points } = benefit;
  return (
    <div
      className="group relative bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden p-6"
      style={{ animation: "fadeUp 0.5s ease both", animationDelay: `${index * 80}ms` }}
    >
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} />

      <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg mb-4`}>
        <Icon size={22} />
      </div>

      <div className="relative flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
          0{index + 1}
        </span>
        <span className="h-px flex-1 bg-zinc-100" />
      </div>

      <h3 className="relative text-[17px] font-bold text-[#02062c] mb-3 tracking-tight">
        {title}
      </h3>

      <ul className="relative space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-600 leading-snug">
            <MdCheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
