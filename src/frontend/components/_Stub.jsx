import React from "react";

/**
 * Placeholder component for frontend pages not yet copied from the legacy project.
 * Replace each frontend/components/<Name>.jsx file with the real implementation
 * and the route will start rendering it instead of this stub.
 */
export default function Stub({ name }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6">
      <div className="max-w-md text-center bg-white border border-zinc-200 rounded-xl shadow-sm p-8">
        <div className="text-[12px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">
          Component Pending
        </div>
        <h2 className="text-[18px] font-bold text-zinc-900 mb-2">{name}</h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          Paste this component into{" "}
          <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-[12px] font-mono text-zinc-700">
            src/frontend/components/{name}.jsx
          </code>{" "}
          to replace this placeholder.
        </p>
      </div>
    </div>
  );
}
