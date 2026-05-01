import React, { useEffect, useState } from "react";
import {
  MdLocationOn, MdAccessTime, MdCalendarToday, MdVisibility,
  MdOpacity, MdAir, MdThermostat, MdWbSunny,
} from "react-icons/md";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const API_KEY = "d54796fa262538bba493d8f1d47108b2";
const LAT = 28.6139;
const LON = 77.2090;

export default function WeatherInfo() {
  const [forecast, setForecast] = useState([]);
  const [current,  setCurrent]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`,
        );
        const d = await r.json();
        setForecast(d.list || []);
        setCurrent(d.list?.[0] || null);
      } catch (e) {
        console.error("Weather API error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafb]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-zinc-200 border-t-blue-500 animate-spin" />
          <p className="text-[13px] text-zinc-500">Loading weather...</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  /* unique daily forecast (12:00 noon entries) */
  const dailyDays = [...new Set(forecast.map((it) => it.dt_txt.split(" ")[0]))]
    .slice(0, 6)
    .map((day) => forecast.find((it) => it.dt_txt.includes(`${day} 12:00:00`)) || forecast.find((it) => it.dt_txt.startsWith(day)))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fafafb] flex flex-col">
      <Breadcrumbs />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">Visitor Guide</span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif]">
            New Delhi Weather
          </h1>
          <p className="mt-2 text-[13px] sm:text-[14px] text-zinc-500 flex items-center justify-center gap-1.5">
            <MdLocationOn size={16} className="text-blue-500" />
            Live forecast & conditions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* ============ MAIN CARD (current temp) ============ */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-[#02062c] via-[#0a1450] to-[#1e3a8a] rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-2xl">
            {/* decorative blob */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

            <div className="relative">
              {/* date / time */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.25em] text-blue-200 font-semibold">
                    {now.toLocaleDateString("en-US", { weekday: "long" })}
                  </p>
                  <p className="text-[24px] sm:text-[28px] font-light font-[Playfair_Display,serif] tracking-tight">
                    {now.toLocaleDateString("en-US", { month: "long" })}
                  </p>
                </div>
                <MdWbSunny size={42} className="text-amber-300" />
              </div>

              <div className="flex items-center gap-4 text-[12px] text-blue-200 mb-6 pb-6 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <MdCalendarToday size={13} />
                  {now.toLocaleDateString("en-GB")}
                </span>
                <span className="flex items-center gap-1.5">
                  <MdAccessTime size={13} />
                  {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </div>

              {/* temp */}
              <div className="flex items-end gap-4">
                <div className="text-[80px] sm:text-[100px] font-light leading-none font-[Playfair_Display,serif]">
                  {Math.round(current.main.temp)}
                  <sup className="text-[36px] sm:text-[44px] align-top">°</sup>
                </div>
                <div className="pb-4 sm:pb-5">
                  <p className="text-[18px] sm:text-[20px] font-semibold tracking-tight">New Delhi</p>
                  <p className="text-[13px] text-blue-200 capitalize">{current.weather[0].description}</p>
                </div>
              </div>

              <p className="mt-2 text-[12px] text-blue-200">
                High: <span className="text-white font-semibold">{Math.round(current.main.temp_max)}°C</span>
                <span className="mx-2 text-blue-300/40">|</span>
                Low: <span className="text-white font-semibold">{Math.round(current.main.temp_min)}°C</span>
              </p>

              {/* details grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10">
                <DetailPill icon={<MdThermostat size={15} />} label="Feels Like" value={`${Math.round(current.main.feels_like)}°`} />
                <DetailPill icon={<MdVisibility size={15} />} label="Visibility" value={`${current.visibility / 1000} km`} />
                <DetailPill icon={<MdOpacity size={15} />}    label="Humidity"   value={`${current.main.humidity}%`} />
                <DetailPill icon={<MdAir size={15} />}        label="Wind"       value={`${current.wind.speed} m/s`} />
              </div>

              {/* UV */}
              <div className="mt-5 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">UV Index</p>
                  <p className="text-[12px] font-semibold text-white">Moderate</p>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ============ HOURLY ============ */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
              <h3 className="text-[15px] font-bold text-[#02062c] mb-4 flex items-center gap-2">
                <MdAccessTime size={18} className="text-blue-500" />
                Hourly Forecast
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {forecast.slice(0, 6).map((item, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-b from-zinc-50 to-white border border-zinc-100 rounded-xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {new Date(item.dt_txt).toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt={item.weather[0].description}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-[10px] text-zinc-500 capitalize truncate">{item.weather[0].main}</p>
                    <p className="text-[15px] font-bold text-[#02062c] mt-1">{Math.round(item.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 6-DAY ============ */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
              <h3 className="text-[15px] font-bold text-[#02062c] mb-4 flex items-center gap-2">
                <MdCalendarToday size={18} className="text-blue-500" />
                6-Day Forecast
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {dailyDays.map((d, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-b from-zinc-50 to-white border border-zinc-100 rounded-xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {new Date(d.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`}
                      alt={d.weather[0].description}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-[15px] font-bold text-[#02062c] mt-1">{Math.round(d.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function DetailPill({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-blue-200 text-[11px] uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <p className="text-[15px] font-bold text-white">{value}</p>
    </div>
  );
}
