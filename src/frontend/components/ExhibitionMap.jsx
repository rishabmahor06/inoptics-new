import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

export default function ExhibitionMap() {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r    = await fetch("https://inoptics.in/api/get_exhibition_map.php");
        const data = await r.json();
        setExhibitionData(Array.isArray(data) ? data : []);
      } catch (e) { console.error("Exhibition map fetch failed", e); }
      finally    { setLoading(false); }
    })();
  }, []);

  const imageUrl = exhibitionData[0]?.image || null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Breadcrumbs />
      <div className="max-w-300 mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#02062c] mb-3 font-[Playfair_Display,serif]">
          Exhibition Map
        </h1>
        <p className="text-[14px] sm:text-[15px] text-zinc-700 mb-6">
          Save Time, Find the Booths – The Exhibition Map is Your Personal Guide to In-Optics!
        </p>

        {loading ? (
          <p className="text-zinc-500">Loading map...</p>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Exhibition Hall Map"
            className="w-full rounded-xl shadow-sm"
            onError={(e) => { e.target.onerror = null; e.target.src = "/assets/map-not-found.jpg"; }}
          />
        ) : (
          <p className="text-zinc-500">No map data available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
