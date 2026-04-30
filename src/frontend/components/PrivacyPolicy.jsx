import React from "react";
import { MdArrowBack } from "react-icons/md";

export default function PrivacyPolicy({ goBack }) {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {goBack && (
        <button onClick={goBack} className="mb-6 inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full transition">
          <MdArrowBack size={14} /> Back
        </button>
      )}
      <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#02062c] mb-6 font-[Playfair_Display,serif]">Privacy Policy</h1>
      <div className="space-y-4 text-[14px] leading-relaxed text-zinc-700">
        <p>This Privacy Policy describes how InOptics collects, uses, and shares your personal information when you visit our website or attend our exhibition.</p>
        <p>Replace this placeholder with your actual privacy policy content.</p>
      </div>
    </div>
  );
}
