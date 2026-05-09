import React from "react";

export default function TabShell({ title, subtitle, Icon, children }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#02062c] font-[Playfair_Display,serif] leading-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-[13px] text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
