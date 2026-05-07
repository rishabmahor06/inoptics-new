import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaWarehouse, FaTags, FaEye } from "react-icons/fa";
import {
  MdArrowBack, MdChevronLeft, MdChevronRight, MdArrowOutward,
  MdFormatQuote, MdGroups,
} from "react-icons/md";

import AmarbirImg     from "../../assets/Amarbir-1.png";
import Interview      from "../../assets/Interview-1.png";
import Narsiman       from "../../assets/NarsimanOG.png";
import Transition     from "../../assets/Transitions-OG2.png";
import FounderGold    from "../../assets/FounderGold.png";

import Footer        from "./Footer";
import AboutUs       from "./AboutUs";
import PrivacyPolicy from "./PrivacyPolicy";
import Terms         from "./Terms";
import MetroMap      from "./MetroMap";
import ExhibitionMap from "./ExhibitionMap";
import WeatherInfo   from "./WeatherInfo";
import TouristSpots  from "./TouristSpots";
import { useHomeVideoStore } from "../../store/website/useHomeVideoStore";

/* ============ Hero video helpers ============ */
const FALLBACK_HERO =
  "https://www.youtube.com/embed/L9OHFU62kX8?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playlist=L9OHFU62kX8";

const isFile = (s = "") => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(s);

function HeroVideo({ src }) {
  const fullSrc = !src
    ? FALLBACK_HERO
    : src.startsWith("http")
    ? src
    : `https://inoptics.in/api/${src}`;

  return (
    <div className="relative w-full h-[60vh] sm:h-[80vh] lg:h-screen overflow-hidden bg-black">
      {isFile(fullSrc) ? (
        <video
          src={fullSrc}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <iframe
          src={fullSrc}
          className="absolute top-1/2 left-1/2 w-screen h-screen min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          title="Hero video"
        />
      )}
      {/* gradient overlay for legibility on small screens */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}

const stripHTML = (html) => {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || d.innerText || "";
};

const NEWS_ITEMS = [
  { img: Narsiman,   alt: "News 3", title: "TRANSITIONS® Gen S™ set to redefine the eyewear industry",                     summary: "In the ever-evolving world of eyewear, Transitions® GEN S™ is poised to revolutionise the industry with its cutting-edge technology and stylish design…",                                  link: "https://www.tionet.in/transitions-gen-s-set-to-redefine-the-eyewear-industry/" },
  { img: AmarbirImg, alt: "News 1", title: "An icon of luxury eyewear in India Amarbir Singh",                                summary: "Kering Eyewear is part of the Kering Group, a global luxury group that develops products for renowned names in fashion, leather goods and jewellery, including luxury eyewear brands",            link: "https://www.tionet.in/amarbir-singh/" },
  { img: Interview,  alt: "News 2", title: "MIDO, unparalleled global platform shaping the future of the global eyewear market", summary: "As the newly appointed President of MIDO and ANFAO, Ms Lorraine Berton brings a wealth of experience and dedication to the optical industry. With a long-standing commitment",                  link: "https://www.tionet.in/lorraine-berton/" },
  { img: Transition, alt: "News 4", title: "TRANSITIONS® Gen S™ the new Lens Standard",                                       summary: "Transitions® lenses, one of the most recognised consumer brands in optics worldwide, have introduced a ground-breaking…",                                                                          link: "https://www.tionet.in/transitions-gen-s-the-new-lens-standard/" },
];

const VISIT_POINTS = [
  { t: "Unique Networking",          d: "Connect with top-tier professionals from across the optical industry." },
  { t: "Forge Partnerships",         d: "Build meaningful relationships with key industry players to shape the future of the optical market." },
  { t: "Collaborative Solutions",    d: "Work together on innovations and solutions that will define the next chapter of optics." },
  { t: "Cutting-Edge Discoveries",   d: "Explore the latest eyewear designs and breakthroughs in optical technology." },
  { t: "Artistry & Science",         d: "Immerse yourself in the fusion of design, technology, and the science behind eyewear." },
  { t: "Business & Inspiration",     d: "In-Optics provides an event that blends both business opportunities and creative inspiration." },
  { t: "40+ Years Legacy",           d: "With over four decades of leadership, In-Optics has been a pivotal force in India's optical market." },
  { t: "Heart of the Community",     d: "Where visionaries from around the world unite to push boundaries and celebrate eyewear." },
];

const PRODUCTS = [
  { n: 1,  title: "Artificial Eyes",                       color: "#ff4c4c" },
  { n: 2,  title: "Contact & Cosmetic lenses",             color: "#4c9aff" },
  { n: 3,  title: "Contact lens solutions & Accessories",  color: "#10b981" },
  { n: 4,  title: "Eye Testing Equipments & Instruments",  color: "#ffb84c" },
  { n: 5,  title: "Machines for Manufacturing Lenses",     color: "#b44cff" },
  { n: 6,  title: "Reading Spectacles",                    color: "#06b6d4" },
  { n: 7,  title: "Retail Management Software",            color: "#f54cff" },
  { n: 8,  title: "Raw Material for Manufacturing",        color: "#84cc16" },
  { n: 9,  title: "Showroom Setup & Display Products",     color: "#4cffa1" },
  { n: 10, title: "Spare Parts & Tools",                   color: "#ff4ca1" },
  { n: 11, title: "Sunglasses, Spectacle Frames & Cases",  color: "#7a4cff" },
  { n: 12, title: "Trade Journal",                         color: "#ffaa4c" },
];

export default function HomePage({ showBreadcrumbs }) {
  const navigate = useNavigate();

  /* dynamic hero video */
  const heroVideos      = useHomeVideoStore((s) => s.videos);
  const fetchHeroVideos = useHomeVideoStore((s) => s.fetchVideos);
  useEffect(() => { fetchHeroVideos(); }, [fetchHeroVideos]);
  const latestHero = heroVideos[heroVideos.length - 1];
  const heroSrc    = latestHero?.video_url || latestHero?.video_path || latestHero?.video || latestHero?.url || "";

  const { ref: counterRef, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const [activeSection, setActiveSection]       = useState("home");
  const [newsPage,      setNewsPage]            = useState(0); // 0-based for carousel
  const [newsAuto,      setNewsAuto]            = useState(true);
  const [newsHover,     setNewsHover]           = useState(false);
  const newsIntervalRef                          = useRef(null);
  const [testimonials,  setTestimonials]        = useState([]);
  const [ourStory,      setOurStory]            = useState([]);
  const [founder,       setFounder]             = useState([]);

  /* testimonial carousel */
  const [tCurrent, setTCurrent] = useState(0);
  const [tAuto,    setTAuto]    = useState(true);
  const [tHover,   setTHover]   = useState(false);
  const tIntervalRef            = useRef(null);

  /* ============ data fetch ============ */
  useEffect(() => {
    (async () => {
      try { setOurStory(await (await fetch("https://inoptics.in/api/get_our_story.php")).json() || []); }
      catch (e) { console.error("Our Story", e); }
    })();
    (async () => {
      try { setFounder(await (await fetch("https://inoptics.in/api/get_founder_section.php")).json() || []); }
      catch (e) { console.error("Founder", e); }
    })();
    (async () => {
      try { setTestimonials(await (await fetch("https://inoptics.in/api/get_people_comments.php")).json() || []); }
      catch (e) { console.error("Testimonials", e); }
    })();
  }, []);

  /* ============ testimonial pagination ============ */
  const tPerPage         = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const filteredTestim   = testimonials.filter((t) => t.name?.toUpperCase() !== "AKASH GOYLE");
  const bigPerson        = testimonials.find((t) => t.name?.toUpperCase() === "AKASH GOYLE");
  const tTotalPages      = Math.max(1, Math.ceil(filteredTestim.length / tPerPage));
  const tShown           = filteredTestim.slice(tCurrent * tPerPage, tCurrent * tPerPage + tPerPage);

  const tNext = () => { setTCurrent((p) => (p + 1) % tTotalPages); setTAuto(false); };
  const tPrev = () => { setTCurrent((p) => (p - 1 + tTotalPages) % tTotalPages); setTAuto(false); };

  useEffect(() => {
    if (filteredTestim.length === 0 || !tAuto || tHover) return;
    tIntervalRef.current = setInterval(() => setTCurrent((p) => (p + 1) % tTotalPages), 5000);
    return () => clearInterval(tIntervalRef.current);
  }, [filteredTestim.length, tAuto, tHover, tTotalPages]);

  /* ============ news carousel (1-up on mobile, 2-up on desktop) ============ */
  const newsPerPage    = 2;
  const newsTotalPages = Math.max(1, Math.ceil(NEWS_ITEMS.length / newsPerPage));
  const newsShown      = NEWS_ITEMS.slice(newsPage * newsPerPage, newsPage * newsPerPage + newsPerPage);

  useEffect(() => {
    if (!newsAuto || newsHover || newsTotalPages <= 1) return;
    newsIntervalRef.current = setInterval(
      () => setNewsPage((p) => (p + 1) % newsTotalPages),
      4500,
    );
    return () => clearInterval(newsIntervalRef.current);
  }, [newsAuto, newsHover, newsTotalPages]);

  /* ============ section routing ============ */
  if (activeSection === "about")      return <SectionWrap onBack={() => setActiveSection("home")}><AboutUs /></SectionWrap>;
  if (activeSection === "privacy")    return <PrivacyPolicy goBack={() => setActiveSection("home")} />;
  if (activeSection === "terms")      return <Terms         goBack={() => setActiveSection("home")} />;
  if (activeSection === "metro")      return <SectionWrap onBack={() => setActiveSection("home")}><MetroMap /></SectionWrap>;
  if (activeSection === "exhibition") return <SectionWrap onBack={() => setActiveSection("home")}><ExhibitionMap /></SectionWrap>;
  if (activeSection === "weather")    return <SectionWrap onBack={() => setActiveSection("home")}><WeatherInfo /></SectionWrap>;
  if (activeSection === "tourist")    return <SectionWrap onBack={() => setActiveSection("home")}><TouristSpots /></SectionWrap>;

  return (
    <div className="font-[Quicksand,sans-serif] bg-[#fafafb] text-zinc-900">
      {showBreadcrumbs}

      {/* ============ HERO ============ */}
      <HeroVideo src={heroSrc} />

      {/* ============ OUR STORY ============ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 lg:pt-32">
        <div className="max-w-3xl">
          <SectionEyebrow>Our Story</SectionEyebrow>
          <h1
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.1] text-[#02062c] font-[Playfair_Display,serif]"
            dangerouslySetInnerHTML={{ __html: ourStory[0]?.title || "Our Story" }}
          />
          <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          <div
            className="mt-6 text-[15px] sm:text-[16px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: ourStory[0]?.description || "Loading our story description..." }}
          />
        </div>
      </section>

      {/* ============ COUNTERS ============ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-16 sm:mt-24">
        <div ref={counterRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Counter icon={<FaUsers     />} value={inView ? <CountUp end={349}   duration={3} />                       : 0} label="Exhibitors"           tint="from-blue-500 to-cyan-500"   />
          <Counter icon={<FaWarehouse />} value={inView ? <CountUp end={24000} duration={3} separator="," />         : 0} label="Exhibition Area (sqm)" tint="from-emerald-500 to-teal-500" />
          <Counter icon={<FaTags      />} value={inView ? <><CountUp end={1500}  duration={3} separator="," />+</>    : 0} label="Brands"               tint="from-purple-500 to-pink-500"  />
          <Counter icon={<FaEye       />} value={inView ? <><CountUp end={20000} duration={3} separator="," />+</>    : 0} label="Visitors"             tint="from-amber-500 to-orange-500" />
        </div>
      </section>

      {/* ============ FOUNDER ============ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28">
        <SectionEyebrow>Leadership</SectionEyebrow>
        <h2
          className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]"
          dangerouslySetInnerHTML={{ __html: founder[0]?.heading || "The Heart Behind the Mission" }}
        />
        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative">
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-blue-200/40 to-purple-200/40 rounded-3xl blur-2xl" aria-hidden />
              <img
                src={founder[0]?.image_url || FounderGold}
                alt="Founder"
                className="relative max-w-[280px] sm:max-w-[340px] lg:max-w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
          <div
            className="lg:col-span-7 text-[15px] sm:text-[16px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: founder[0]?.description || "Founder description will appear here." }}
          />
        </div>
      </section>

      {/* ============ HEADLINES ============ */}
      <section
        className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28"
        onMouseEnter={() => setNewsHover(true)}
        onMouseLeave={() => setNewsHover(false)}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <SectionEyebrow>Latest News</SectionEyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
              Headlines that matter
            </h2>
            <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <CarouselBtn
              onClick={() => { setNewsPage((p) => (p - 1 + newsTotalPages) % newsTotalPages); setNewsAuto(false); }}
              aria="Previous"
            >
              <MdChevronLeft size={20} />
            </CarouselBtn>
            <CarouselBtn
              onClick={() => { setNewsPage((p) => (p + 1) % newsTotalPages); setNewsAuto(false); }}
              aria="Next"
            >
              <MdChevronRight size={20} />
            </CarouselBtn>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {newsShown.map((item, i) => (
            <li key={i} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-zinc-100">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full h-[380px] sm:w-[180px] aspect-video sm:aspect-auto sm:h-[180px] shrink-0 overflow-hidden bg-zinc-100">
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                  <h4 className="text-[14px] sm:text-[15px] font-bold text-[#02062c] uppercase tracking-tight leading-snug">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[13px] text-zinc-600 leading-snug line-clamp-3 flex-1">
                    {item.summary}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800"
                  >
                    Take me there <MdArrowOutward size={14} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: newsTotalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setNewsPage(i); setNewsAuto(false); }}
              aria-label={`Go to page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === newsPage ? "w-8 bg-blue-600" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"}`}
            />
          ))}
        </div>
      </section>

      {/* ============ VALUE OF VISIT ============ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28">
        <div className="text-center max-w-2xl mx-auto">
          <SectionEyebrow center>Why Visit</SectionEyebrow>
          <h2 className="mt-3 font-[Playfair_Display,serif] font-light tracking-tight text-[#02062c]">
            <span className="block text-2xl sm:text-3xl">The Value of</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl mt-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Visit
            </span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {VISIT_POINTS.map((p, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl border border-zinc-100 p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                aria-hidden
              />
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-blue-500 mb-2">
                0{i + 1}
              </div>
              <h3 className="text-[15px] font-bold text-[#02062c] leading-snug">
                {p.t}
              </h3>
              <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed">
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section
        className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28"
        onMouseEnter={() => setTHover(true)}
        onMouseLeave={() => setTHover(false)}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionEyebrow center>Testimonials</SectionEyebrow>
          <h2 className="mt-3 font-[Playfair_Display,serif] font-light tracking-tight text-[#02062c] text-3xl sm:text-4xl lg:text-5xl">
            What People Are Saying
          </h2>
          <div className="mt-2 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        {/* Featured big card */}
        {bigPerson && (
          <div className="mb-10 bg-gradient-to-br from-[#02062c] to-[#0f1a4a] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative aspect-[4/4] md:aspect-auto md:h-full bg-zinc-900">
                <img
                  src={`https://inoptics.in/api/${bigPerson.image_path}`}
                  alt={bigPerson.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-10 flex flex-col justify-center text-white">
                <MdFormatQuote size={48} className="text-blue-300/50 -ml-2" />
                <p className="text-[15px] sm:text-[16px] leading-relaxed text-zinc-200 mb-5">
                  {stripHTML(bigPerson.comment)}
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[16px] font-bold uppercase tracking-tight">{bigPerson.name}</p>
                  <p className="text-[12px] text-blue-300 uppercase tracking-wider mt-1">{bigPerson.designation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tShown.map((t, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/4] overflow-hidden bg-zinc-100">
                  <img
                    src={`https://inoptics.in/api/${t.image_path}`}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <MdFormatQuote size={28} className="text-blue-400/40 -ml-1 mb-1" />
                  <p className="text-[13px] leading-relaxed text-zinc-700 flex-1 line-clamp-5">
                    {stripHTML(t.comment)}
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <p className="text-[14px] font-bold uppercase tracking-tight text-[#02062c]">{t.name}</p>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5">{t.designation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <CarouselBtn onClick={tPrev} aria="Previous">
              <MdChevronLeft size={20} />
            </CarouselBtn>
            <div className="flex items-center gap-2">
              {Array.from({ length: tTotalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setTCurrent(i); setTAuto(false); }}
                  aria-label={`Go to page ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === tCurrent ? "w-8 bg-blue-600" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"}`}
                />
              ))}
            </div>
            <CarouselBtn onClick={tNext} aria="Next">
              <MdChevronRight size={20} />
            </CarouselBtn>
          </div>
        </div>
      </section>

      {/* ============ PRODUCT HUB ============ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-20 sm:mt-28 pb-20 sm:pb-32">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SectionEyebrow center>What You'll Find</SectionEyebrow>
          <h2 className="mt-3 font-[Playfair_Display,serif] font-light tracking-tight text-[#02062c]">
            <span className="block text-2xl sm:text-3xl">Your One-Stop</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl mt-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Optical Products Hub
            </span>
          </h2>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {PRODUCTS.map((p) => (
            <li
              key={p.n}
              className="group relative bg-white rounded-2xl border border-zinc-100 p-4 sm:p-5 flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all overflow-hidden"
            >
              <span
                className="absolute -top-2 -right-2 font-black text-[80px] sm:text-[100px] leading-none opacity-10 group-hover:opacity-20 transition-opacity font-[Maven_Pro,sans-serif] select-none"
                style={{ color: p.color }}
                aria-hidden
              >
                {p.n}
              </span>
              <span
                className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white text-[14px] sm:text-[16px] shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.n}
              </span>
              <h4 className="relative z-10 text-[12px] sm:text-[13px] font-bold uppercase tracking-tight text-[#02062c] leading-snug">
                {p.title}
              </h4>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </div>
  );
}

/* ================== sub-components ================== */

function SectionEyebrow({ children, center }) {
  return (
    <div className={`flex items-center gap-2 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-8 bg-blue-500" />
      <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">
        {children}
      </span>
      <span className="h-px w-8 bg-blue-500" />
    </div>
  );
}

function Counter({ icon, value, label, tint }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-zinc-100 p-4 sm:p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} aria-hidden />
      <div className={`relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${tint} text-white text-xl sm:text-2xl mb-3 shadow-lg`}>
        {icon}
      </div>
      <h2 className="relative text-2xl sm:text-3xl lg:text-4xl text-[#02062c] font-bold tracking-tight font-[Montserrat,sans-serif] leading-tight">
        {value}
      </h2>
      <p className="relative text-[12px] sm:text-[13px] text-zinc-500 mt-2 font-semibold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function CarouselBtn({ children, onClick, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-zinc-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-zinc-700 flex items-center justify-center shadow-sm hover:shadow-lg transition-all"
    >
      {children}
    </button>
  );
}

function SectionWrap({ children, onBack }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full transition"
        >
          <MdArrowBack size={14} /> Back
        </button>
      </div>
      {children}
    </div>
  );
}
