import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundVideo from "../../assets/Background_Video3.webm";

export default function LandingPage() {
  const navigate = useNavigate();
  const [sponsorImages, setSponsorImages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("https://inoptics.in/api/get_sponsor_images_list.php");
        const data = await res.json();
        setSponsorImages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching sponsor images:", err);
      }
    })();
  }, []);

  const getSponsorImage = (type) => {
    const target = type.toLowerCase();
    const sponsor = sponsorImages.find((img) =>
      String(img.sponsor_type || "")
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .includes(target),
    );
    return sponsor ? `https://inoptics.in/api/${sponsor.image_path}` : null;
  };

  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden flex justify-center items-center text-zinc-900 font-[Quicksand,sans-serif]">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-105 z-0"
      >
        <source src={backgroundVideo} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Soft overlay */}
      <div className="absolute inset-0 bg-[rgba(225,237,252,0.5)] z-10" />

      {/* Content */}
      <section
        id="section1"
        className="absolute z-20 max-w-[95%] flex flex-col items-center justify-center
                   px-4 py-5 gap-3
                   sm:px-5 sm:gap-4
                   md:px-8 md:gap-6
                   lg:px-10 lg:gap-7"
      >
        {/* Logo — 3D flip in */}
        {getSponsorImage("Main-logo") && (
          <img
            src={getSponsorImage("Main-logo")}
            alt="InOptics Logo"
            className="z-30 h-auto max-w-[90vw] w-[clamp(250px,45vw,600px)] animate-[threedflip_1s_ease-in-out_0s_forwards] opacity-0"
          />
        )}

        {/* Tagline — slide in from left */}
        <p
          className="z-30 m-0 text-center uppercase font-thin
                     text-[clamp(28px,8vw,50px)] tracking-[-1px] leading-[1.1]
                     animate-[slideinleft_1s_ease-in-out_1.5s_forwards] opacity-0
                     mt-[clamp(20px,5vw,50px)]"
        >
          India's #1 Exhibition on Optics
        </p>

        {/* Subtagline — slide in from right */}
        <p
          className="z-30 m-0 text-center uppercase font-normal
                     text-[clamp(18px,5vw,25px)] tracking-[-1px] leading-[1.2]
                     animate-[slideinright_1s_ease-in-out_1.5s_forwards] opacity-0
                     mt-[clamp(10px,3vw,20px)]"
        >
          A Grand Showcase of Visionary Innovation, Technology, and Excellence in the World of Optics
        </p>

        {/* Dates / Venue — fade in */}
        <p
          className="z-30 text-center uppercase font-thin tracking-[-1px] leading-[1.3]
                     mt-[clamp(25px,6vw,50px)]
                     animate-[fadeInText_1s_ease-in-out_2.5s_forwards] opacity-0"
        >
          <span className="text-[clamp(32px,9vw,50px)]">
            28<sup className="text-[clamp(20px,6vw,30px)] lowercase">th</sup> – 30
            <sup className="text-[clamp(20px,6vw,30px)] lowercase">th</sup> MARCH, 2026
          </span>
          <br />
          <span className="text-[clamp(16px,4.5vw,25px)] font-normal">
            HALL #1 – Yashobhoomi (India International Convention &amp; Expo Centre)
          </span>
          <br />
          <span className="text-[clamp(16px,4.5vw,25px)] font-normal">
            Sector 25, Dwarka, New Delhi
          </span>
        </p>
      </section>

      {/* Animations (kept inline so this component is fully self-contained) */}
      <style>{`
        @keyframes threedflip {
          0%   { transform: perspective(400px) rotateY(90deg); opacity: 0; visibility: hidden; }
          100% { transform: perspective(400px) rotateY(0deg);  opacity: 1; visibility: visible; }
        }
        @keyframes fadeInText {
          0%   { opacity: 0; visibility: hidden; }
          100% { opacity: 1; visibility: visible; }
        }
        @keyframes slideinleft {
          0%   { transform: translateX(-100px); opacity: 0; visibility: hidden; }
          100% { transform: translateX(0);      opacity: 1; visibility: visible; }
        }
        @keyframes slideinright {
          0%   { transform: translateX(100px); opacity: 0; visibility: hidden; }
          100% { transform: translateX(0);     opacity: 1; visibility: visible; }
        }
        @media (max-width: 768px) {
          @keyframes slideinleft  { 0% { transform: translateX(-50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slideinright { 0% { transform: translateX(50px);  opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        }
        @media (max-width: 480px) {
          @keyframes slideinleft  { 0% { transform: translateX(-35px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
          @keyframes slideinright { 0% { transform: translateX(35px);  opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        }
        @media (max-height: 500px) and (orientation: landscape) {
          #section1 { padding: 10px !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
}
