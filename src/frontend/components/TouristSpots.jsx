import React, { useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdPlace, MdPause, MdPlayArrow } from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

import redfort        from "../../assets/RedFort.png";
import indiagate      from "../../assets/IndiaGate.jpg";
import rastrapati     from "../../assets/RashtrapatiBhaban.jpg";
import qutubminar     from "../../assets/QutubMinar.jpg";
import jantarmantar   from "../../assets/JantarMantar.jpg";
import akshardham     from "../../assets/Akshardham.jpg";
import chattarpur     from "../../assets/ChattarpurTemple.jpg";
import safdarjung     from "../../assets/TheTombOfSafdarjung.jpg";
import banglaSahib    from "../../assets/GurudwaraBanglaSahib.jpg";
import lotusTemple    from "../../assets/LotusTemple.png";
import gardenOfSenses from "../../assets/GardenOfFiveSenses.png";
import dilliHaat      from "../../assets/DilliHaat.jpg";

const SPOTS = [
  { image: redfort,        title: "Red Fort",                 description: "The Red Fort is an epitome of the Mughal era in India and is the face of tourist attractions in Delhi." },
  { image: indiagate,      title: "India Gate",               description: "India Gate is one monument that defines Delhi or India for that matter. It was built in 1931." },
  { image: rastrapati,     title: "Rashtrapati Bhawan",       description: "On the opposite of the Rajpath is the residence of the President of India, with four floors and 340 rooms." },
  { image: qutubminar,     title: "Qutub Minar",              description: "Among the other places to visit in Delhi, Qutub Minar stands tall with its 73 meter tall brick minaret." },
  { image: jantarmantar,   title: "Jantar Mantar",            description: "Constructed in 1724 by Maharaja Jai Singh of Jaipur, Jantar Mantar is an astronomical observatory." },
  { image: akshardham,     title: "Akshardham",               description: "Swaminarayan Akshardham is one of the largest Hindu temples in the world and a must-visit in Delhi." },
  { image: chattarpur,     title: "Chattarpur Temple",        description: "Set amid the beautiful surroundings of South Delhi, Chattarpur is a popular temple founded in the 1970s." },
  { image: safdarjung,     title: "The Tomb of Safdarjung",   description: "A famous attraction in Delhi made up of marble and sandstone, showcasing exquisite Mughal architecture." },
  { image: banglaSahib,    title: "Gurudwara Bangla Sahib",   description: "The iconic shrine of Sikhs is visited by hundreds every day for its serene ambiance and rich heritage." },
  { image: lotusTemple,    title: "Lotus Temple",             description: "Famously known as the Lotus Temple, this Bahai House of Worship symbolizes unity among religions." },
  { image: gardenOfSenses, title: "Garden of Five Senses",    description: "This 20-acre lush green park offers a relaxing retreat from Delhi's bustling streets." },
  { image: dilliHaat,      title: "Dilli Haat",               description: "An open-air food plaza and craft bazaar near INA, managed by the Delhi Tourism Authority." },
];

const AUTO_MS = 5000;

export default function TouristSpots() {
  const [index,   setIndex]   = useState(0);
  const [paused,  setPaused]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const intervalRef           = useRef(null);

  /* auto-play */
  useEffect(() => {
    if (paused || hovered) return;
    intervalRef.current = setInterval(
      () => setIndex((p) => (p + 1) % SPOTS.length),
      AUTO_MS,
    );
    return () => clearInterval(intervalRef.current);
  }, [paused, hovered]);

  const next = () => setIndex((p) => (p + 1) % SPOTS.length);
  const prev = () => setIndex((p) => (p - 1 + SPOTS.length) % SPOTS.length);

  const active = SPOTS[index];

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 items-end">
          <div>
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">Visitor Guide</span>
            <h1 className="mt-2 font-[Playfair_Display,serif] font-light tracking-tight text-[#02062c] leading-[1]">
              <span className="block text-2xl sm:text-3xl">Let's</span>
              <span className="block text-5xl sm:text-7xl lg:text-8xl mt-1">
                Explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Delhi</span>
              </span>
              <span className="block text-lg sm:text-xl mt-3 text-zinc-600">With Your Family &amp; Friends</span>
            </h1>
          </div>

          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Click below to explore top tourist spots
            </h3>
            <div className="flex flex-wrap gap-2">
              {SPOTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); setPaused(true); }}
                  className={`px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider rounded-full border transition-all
                    ${i === index
                      ? "bg-[#02062c] text-white border-[#02062c]"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-400 hover:text-blue-600"}`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-zinc-900"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.6/1]">
            {SPOTS.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === index ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                {/* info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <MdPlace size={18} className="text-amber-400" />
                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-300">
                      Spot {i + 1} of {SPOTS.length}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight font-[Playfair_Display,serif] mb-2 sm:mb-3">
                    {s.title}
                  </h2>
                  <p className="text-[13px] sm:text-[15px] leading-relaxed text-zinc-200 max-w-2xl">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}

            {/* prev / next */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-zinc-900 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all"
            >
              <MdChevronLeft size={28} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-zinc-900 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all"
            >
              <MdChevronRight size={28} />
            </button>

            {/* play/pause */}
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all"
            >
              {paused ? <MdPlayArrow size={20} /> : <MdPause size={18} />}
            </button>
          </div>

          {/* progress bar */}
          {!paused && !hovered && (
            <div
              key={index}
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 origin-left"
              style={{ animation: `progress ${AUTO_MS}ms linear forwards` }}
            />
          )}

          {/* dots — overlay on bottom */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-1.5">
            {SPOTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to spot ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail strip — desktop only */}
        <div className="hidden lg:grid grid-cols-6 gap-3 mt-4">
          {SPOTS.slice(0, 6).map((s, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden group transition-all ${
                i === index ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#fafafb]" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-1.5 left-2 right-2 text-[11px] font-bold uppercase tracking-tight text-white truncate">
                {s.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes progress {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
