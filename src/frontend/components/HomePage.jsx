import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaWarehouse, FaTags, FaEye } from "react-icons/fa";
import { MdArrowBack, MdChevronLeft, MdChevronRight } from "react-icons/md";

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
  "Unique Networking Opportunities: Connect with top-tier professionals from across the optical industry.",
  "Forge Valuable Partnerships: Build meaningful relationships with key industry players to shape the future of the optical market.",
  "Collaborative Solutions: Work together on innovations and solutions that will define the next chapter of optics.",
  "Cutting-Edge Discoveries: Explore the latest eyewear designs and breakthroughs in optical technology.",
  "Celebrating Artistry & Science: Immerse yourself in the fusion of design, technology, and the science behind eyewear.",
  "Business & Inspiration Combined: In-Optics provides an event that blends both business opportunities and creative inspiration.",
  "Legacy of 40+ Years: With over four decades of leadership, In-Optics has been a pivotal force in shaping India's optical market.",
  "Heart of the Optical Community: In-Optics is where visionaries from around the world unite to push boundaries and celebrate the transformative power of eyewear.",
];

const PRODUCTS = [
  { n: 1,  title: "Artificial Eyes",                       color: "#ff4c4c" },
  { n: 2,  title: "Contact & Cosmetic lenses",             color: "#4c9aff" },
  { n: 3,  title: "Contact lens solutions & Accessories",  color: "#4cff4c" },
  { n: 4,  title: "Eye Testing Equipments & Instruments",  color: "#ffb84c" },
  { n: 5,  title: "Machines for Manufacturing Lenses",     color: "#b44cff" },
  { n: 6,  title: "Reading Spectacles",                    color: "#4cfff8" },
  { n: 7,  title: "Retail Management Software",            color: "#f54cff" },
  { n: 8,  title: "Raw Material for Manufacturing",        color: "#c4ff4c" },
  { n: 9,  title: "Showroom Setup & Display Products",     color: "#4cffa1" },
  { n: 10, title: "Spare Parts & Tools",                   color: "#ff4ca1" },
  { n: 11, title: "Sunglasses, Spectacle Frames & Cases",  color: "#7a4cff" },
  { n: 12, title: "Trade Journal",                         color: "#ffaa4c" },
];

export default function HomePage({ showBreadcrumbs }) {
  const navigate = useNavigate();
  const { ref, inView }  = useInView({ triggerOnce: true, threshold: 0.1 });

  const [activeSection, setActiveSection]       = useState("home");
  const [currentPage,  setCurrentPage]          = useState(1);
  const [currentIndex, setCurrentIndex]         = useState(0);
  const [testimonials, setTestimonials]         = useState([]);
  const [ourStory,     setOurStory]             = useState([]);
  const [founder,      setFounder]              = useState([]);
  const [isAuto,       setIsAuto]               = useState(true);
  const intervalRef = useRef(null);

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

  /* ============ testimonials ============ */
  const itemsPage              = 4;
  const filteredTestimonials   = testimonials.filter((t) => t.name?.toUpperCase() !== "AKASH GOYLE");
  const bigPerson              = testimonials.find((t) => t.name?.toUpperCase() === "AKASH GOYLE");
  const smallTestimonials      = filteredTestimonials.slice(currentIndex, currentIndex + itemsPage);
  const totalPagesTestimonials = Math.ceil(filteredTestimonials.length / itemsPage);
  const currentPageTestim      = Math.floor(currentIndex / itemsPage);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + itemsPage >= filteredTestimonials.length ? 0 : prev + itemsPage));
    setIsAuto(false);
  };
  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (prev - itemsPage < 0) {
        const remainder = filteredTestimonials.length % itemsPage;
        return remainder === 0 ? filteredTestimonials.length - itemsPage : filteredTestimonials.length - remainder;
      }
      return prev - itemsPage;
    });
    setIsAuto(false);
  };

  useEffect(() => {
    if (filteredTestimonials.length === 0 || !isAuto) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + itemsPage >= filteredTestimonials.length ? 0 : prev + itemsPage));
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [filteredTestimonials.length, isAuto]);

  /* ============ news pagination ============ */
  const itemsPerPage = 4;
  const totalPages   = Math.ceil(NEWS_ITEMS.length / itemsPerPage);
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const selectedNews = NEWS_ITEMS.slice(startIndex, startIndex + itemsPerPage);

  /* ============ render ============ */

  if (activeSection === "about")    return <SectionWrap onBack={() => setActiveSection("home")}><AboutUs /></SectionWrap>;
  if (activeSection === "privacy")  return <PrivacyPolicy goBack={() => setActiveSection("home")} />;
  if (activeSection === "terms")    return <Terms         goBack={() => setActiveSection("home")} />;
  if (activeSection === "metro")    return <SectionWrap onBack={() => setActiveSection("home")}><MetroMap /></SectionWrap>;
  if (activeSection === "exhibition") return <SectionWrap onBack={() => setActiveSection("home")}><ExhibitionMap /></SectionWrap>;
  if (activeSection === "weather")  return <SectionWrap onBack={() => setActiveSection("home")}><WeatherInfo /></SectionWrap>;
  if (activeSection === "tourist")  return <SectionWrap onBack={() => setActiveSection("home")}><TouristSpots /></SectionWrap>;

  return (
    <div className="font-[Quicksand,sans-serif] bg-white">
      {showBreadcrumbs}

      {/* ============ HERO VIDEO ============ */}
     <div className="relative w-full h-screen overflow-hidden bg-black">

  {/* VIDEO */}
  <iframe
    className="
      absolute top-1/2 left-1/2
      w-screen h-screen
      min-w-[177.77vh] 
      min-h-[56.25vw]
      -translate-x-1/2 -translate-y-1/2
      pointer-events-none
    "
    src="https://www.youtube.com/embed/L9OHFU62kX8?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playlist=L9OHFU62kX8"
    frameBorder="0"
    allow="autoplay; encrypted-media"
    title="Background Video"
  />

  {/* OPTIONAL OVERLAY */}
  {/* <div className="absolute inset-0 bg-black/30" /> */}

</div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 mt-12 sm:mt-20 lg:mt-28 space-y-20 sm:space-y-28">

        {/* OUR STORY */}
        <section>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-thin tracking-tighter leading-tight text-[#02062c]"
            dangerouslySetInnerHTML={{ __html: ourStory[0]?.title || "Our Story" }}
          />
          <hr className="my-5 border-zinc-200" />
          <div
            className="text-[14px] sm:text-[15px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: ourStory[0]?.description || "Loading our story description..." }}
          />
        </section>

        {/* COUNTERS */}
        <section ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Counter icon={<FaUsers />}     value={inView ? <CountUp end={349}   duration={7} />                        : 0} label="Exhibitors" />
          <Counter icon={<FaWarehouse />} value={inView ? <CountUp end={24000} duration={9} separator="," />          : 0} label="Exhibition Area (sqm)" />
          <Counter icon={<FaTags />}      value={inView ? <><CountUp end={1500}  duration={7} separator="," />+</>     : 0} label="Brands" />
          <Counter icon={<FaEye />}       value={inView ? <><CountUp end={20000} duration={9} separator="," />+</>     : 0} label="Visitors" />
        </section>

        {/* FOUNDER */}
        <section>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]"
            dangerouslySetInnerHTML={{ __html: founder[0]?.heading || "The Heart Behind the Mission" }}
          />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-10">
            <div className="lg:col-span-2 flex justify-center lg:justify-start">
              <img
                src={founder[0]?.image_url || FounderGold}
                alt="Founder"
                className="max-w-[280px] sm:max-w-[340px] lg:max-w-full h-auto"
              />
            </div>
            <div
              className="lg:col-span-3 text-[14px] sm:text-[15px] leading-relaxed text-zinc-800 [&_a]:text-blue-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: founder[0]?.description || "Founder description will appear here." }}
            />
          </div>
        </section>

        {/* HEADLINES */}
        <section>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif] mb-6">
            Headlines that matter
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {selectedNews.map((item, i) => (
              <li key={i} className="bg-white rounded-lg flex flex-col gap-3">
                <h4 className="text-[15px] sm:text-[16px] font-semibold uppercase tracking-tight leading-snug pr-2">
                  {item.title}
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-[150px] h-[180px] sm:h-[150px] shrink-0 overflow-hidden rounded">
                    <img src={item.img} alt={item.alt} className="w-full h-full object-cover" />
                  </div>
                  <p className="flex-1 text-[13px] sm:text-[14px] text-zinc-700 leading-snug font-medium">
                    {item.summary}
                  </p>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:ml-[170px] text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  TAKE ME THERE <span className="text-base">➤</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-2 mt-8">
            <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&lt;</PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PageBtn key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>{i + 1}</PageBtn>
            ))}
            <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&gt;</PageBtn>
          </div>
        </section>

        {/* VALUE OF VISIT */}
        <section>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-8">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
              The Value of
            </p>
            <p className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
              Your Visit
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {VISIT_POINTS.map((p, i) => (
              <div key={i} className="text-[14px] sm:text-[15px] leading-snug tracking-tight text-[#06184c] font-medium pr-3">
                <span className="text-blue-600 font-bold">➤</span>&nbsp;&nbsp;{p}
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-8">
            <h2 className="font-[Playfair_Display,serif] font-light tracking-tight text-[#02062c]">
              <span className="block text-3xl sm:text-4xl lg:text-5xl">What People</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl mt-1">Are</span>
              <span className="block text-4xl sm:text-5xl lg:text-7xl mt-1">Saying</span>
            </h2>

            {bigPerson && (
              <div className="bg-[#e8effd] flex flex-col sm:flex-row overflow-hidden">
                <div className="sm:w-[35%] h-[180px] sm:h-[250px]">
                  <img
                    src={`https://inoptics.in/api/${bigPerson.image_path}`}
                    alt={bigPerson.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:w-[65%] p-4 sm:p-5 flex flex-col justify-center">
                  <p className="text-[13px] leading-snug text-zinc-800 mb-3">{stripHTML(bigPerson.comment)}</p>
                  <span className="text-[15px] font-semibold uppercase tracking-tight text-zinc-900">{bigPerson.name}</span>
                  <span className="text-[13px] font-semibold uppercase tracking-tight text-zinc-700">{bigPerson.designation}</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            {/* arrows — desktop only */}
            <button
              onClick={goToPrevious}
              className="hidden md:flex absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-3xl text-zinc-700 hover:text-[#e18e08] z-10"
              aria-label="Previous"
            >
              <MdChevronLeft size={36} />
            </button>
            <button
              onClick={goToNext}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center text-3xl text-zinc-700 hover:text-[#e18e08] z-10"
              aria-label="Next"
            >
              <MdChevronRight size={36} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {smallTestimonials.map((t, i) => (
                <div key={i} className="bg-[#e8effd] p-4 flex flex-col min-h-[320px]">
                  <div className="flex justify-center">
                    <img
                      src={`https://inoptics.in/api/${t.image_path}`}
                      alt={t.name}
                      className="w-3/4 h-[140px] object-cover"
                    />
                  </div>
                  <p className="mt-3 text-[13px] leading-snug font-medium text-zinc-800 flex-1">
                    {stripHTML(t.comment)}
                  </p>
                  <span className="mt-2 text-[15px] font-semibold uppercase tracking-tight text-zinc-900">{t.name}</span>
                  <span className="text-[13px] font-semibold uppercase tracking-tight text-zinc-700">{t.designation}</span>
                </div>
              ))}
            </div>

            {/* dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPagesTestimonials }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIndex(i * itemsPage); setIsAuto(false); }}
                  aria-label={`Go to page ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentPageTestim ? "bg-zinc-800" : "bg-[#dee0f4] hover:bg-zinc-400"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT HUB */}
        <section className="pb-16 sm:pb-24">
          <div className="mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-[#02062c] h-12 px-6 flex items-center">
                <h2 className="text-3xl sm:text-4xl text-white font-thin font-[Playfair_Display,serif] tracking-tight">Your</h2>
              </div>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl text-[#02062c] font-[cursive,'Great_Vibes'] leading-none">One-Stop</h2>
            </div>
            <h3 className="mt-2 text-2xl sm:text-3xl text-[#02062c] font-light font-[Playfair_Display,serif] tracking-tight">
              Optical Products Hub:
            </h3>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
            {PRODUCTS.map((p) => (
              <li key={p.n} className="relative pl-20 min-h-[70px] flex items-center">
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-[55px] sm:text-[65px] leading-none w-[75px] text-center font-[Maven_Pro,sans-serif]"
                  style={{ color: p.color }}
                >
                  {p.n}
                </span>
                <h4 className="text-[13px] sm:text-[14px] font-normal uppercase tracking-tight text-zinc-800 font-[Montserrat,sans-serif]">
                  {p.title}
                </h4>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}

/* ================== sub-components ================== */

function Counter({ icon, value, label }) {
  return (
    <div className="bg-[#050505] p-4 sm:p-5 text-center transition-all hover:shadow-[0_12px_25px_rgba(252,251,251,0.12)] group">
      <div className="text-3xl sm:text-4xl text-white mb-2 flex justify-center group-hover:text-[#53b7ff] transition-colors">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-4xl lg:text-5xl text-zinc-100 font-medium tracking-tighter font-[Montserrat,sans-serif] group-hover:text-[#53b7ff] transition-colors leading-tight">
        {value}
      </h2>
      <p className="text-[13px] sm:text-[15px] text-white mt-2 font-medium tracking-wide group-hover:text-[#53b7ff] transition-colors">
        {label}
      </p>
    </div>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1 text-[14px] transition-colors
        ${disabled ? "text-zinc-300 cursor-not-allowed" : ""}
        ${active   ? "text-[#0056b3] font-bold" : "text-blue-600 hover:text-blue-800"}`}
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
