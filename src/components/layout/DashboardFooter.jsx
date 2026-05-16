import React from "react";
import { Link } from "react-router-dom";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdShield,
  MdOpenInNew,
} from "react-icons/md";

/**
 * Compact footer for dashboard panels (admin + exhibitor).
 * Fully responsive — stacks on mobile, 3-column grid on md+.
 * Variant changes the accent (admin = amber, exhibitor = blue).
 */
export default function DashboardFooter({ variant = "exhibitor" }) {
  const isAdmin = variant === "admin";
  const accent = isAdmin ? "amber" : "blue";
  const accentClasses = {
    blue: {
      text: "text-blue-600",
      hover: "hover:text-blue-700",
      pill: "bg-blue-50 text-blue-700 border-blue-100",
    },
    amber: {
      text: "text-amber-600",
      hover: "hover:text-amber-700",
      pill: "bg-amber-50 text-amber-700 border-amber-100",
    },
  }[accent];

  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 bg-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border ${accentClasses.pill}`}
              >
                <MdShield size={11} />
                {isAdmin ? "Admin Console" : "Exhibitor Portal"}
              </span>
            </div>
            <p className="mt-3 text-[13px] text-zinc-600 leading-relaxed max-w-xs">
              InOptics 2026 — manage stalls, payments, badges and event
              operations from one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Quick Links
            </p>
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <Link
                  to="/"
                  className={`inline-flex items-center gap-1 text-zinc-600 ${accentClasses.hover} transition-colors`}
                >
                  <MdOpenInNew size={13} /> Public Site
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`text-zinc-600 ${accentClasses.hover} transition-colors`}
                >
                  About InOptics
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`text-zinc-600 ${accentClasses.hover} transition-colors`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/rules-policy"
                  className={`text-zinc-600 ${accentClasses.hover} transition-colors`}
                >
                  Rules & Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Get in touch
            </p>
            <ul className="space-y-2 text-[12.5px] text-zinc-600">
              <li className="flex items-start gap-2">
                <MdLocationOn
                  size={14}
                  className={`${accentClasses.text} mt-0.5 shrink-0`}
                />
                <span>Defence Colony, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2">
                <MdEmail size={14} className={`${accentClasses.text} shrink-0`} />
                <a
                  href="mailto:info@inoptics.in"
                  className={`${accentClasses.hover} transition-colors`}
                >
                  info@inoptics.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MdPhone size={14} className={`${accentClasses.text} shrink-0`} />
                <a
                  href="tel:+911140000000"
                  className={`${accentClasses.hover} transition-colors`}
                >
                  +91 11 4000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11.5px] text-zinc-500">
            © {year} InOptics — Powered by{" "}
            <span className="font-semibold text-zinc-700">RSD Expositions</span>
          </p>
          <div className="flex items-center gap-4 text-[11.5px] text-zinc-500">
            <Link to="/rules-policy" className={accentClasses.hover}>
              Terms
            </Link>
            <span className="text-zinc-300">·</span>
            <Link to="/rules-policy" className={accentClasses.hover}>
              Privacy
            </Link>
            <span className="text-zinc-300">·</span>
            <a
              href="mailto:info@inoptics.in"
              className={accentClasses.hover}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
