import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdHome, MdChevronRight } from "react-icons/md";

export default function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 px-4 sm:px-6 py-3 text-[12px] text-zinc-500">
      <Link to="/home" className="flex items-center gap-1 hover:text-zinc-900 transition">
        <MdHome size={14} /> Home
      </Link>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <MdChevronRight size={14} className="text-zinc-300" />
          <span className={i === parts.length - 1 ? "text-zinc-900 font-semibold capitalize" : "capitalize"}>
            {p.replace(/-/g, " ")}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}
