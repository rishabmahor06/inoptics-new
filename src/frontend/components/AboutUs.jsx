import React, { useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

export default function AboutUs() {
  const [aboutUsData, setAboutUsData]     = useState([]);
  const [ourVisionData, setOurVisionData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_about_us.php");
        setAboutUsData(await r.json() || []);
      } catch (e) { console.error("About Us fetch failed", e); }
    })();
    (async () => {
      try {
        const r = await fetch("https://inoptics.in/api/get_our_vision.php");
        setOurVisionData(await r.json() || []);
      } catch (e) { console.error("Our Vision fetch failed", e); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumbs />
      <div className="max-w-250 mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* About */}
        <section>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#02062c] mb-4 font-[Playfair_Display,serif]"
            dangerouslySetInnerHTML={{ __html: aboutUsData[0]?.title || "About Us" }}
          />
          <div
            className="text-[14px] sm:text-[15px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: aboutUsData[0]?.description || "Loading..." }}
          />
        </section>

        {/* Vision */}
        <section className="bg-[#e8effd] rounded-2xl p-6 sm:p-10">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#02062c] mb-3 font-[Playfair_Display,serif]"
            dangerouslySetInnerHTML={{ __html: ourVisionData[0]?.title || "Our Vision" }}
          />
          <div
            className="text-[14px] sm:text-[15px] leading-relaxed text-zinc-700 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: ourVisionData[0]?.description || "Loading..." }}
          />
        </section>
      </div>
      <Footer />
    </div>
  );
}
