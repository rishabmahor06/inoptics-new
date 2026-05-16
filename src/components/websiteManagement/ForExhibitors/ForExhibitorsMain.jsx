import React, { useEffect, useState } from "react";
import { useForExhibitorsStore } from "../../../store/website/useForExhibitorsStore";
import { Field, WmInput, SectionHeader, LoadingSpinner } from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function ForExhibitorsMain() {
  const { main, loadingMain, fetchMain, saveMain } = useForExhibitorsStore();
  const [header, setHeader] = useState("");
  const [text,   setText]   = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMain(); }, [fetchMain]);

  useEffect(() => {
    if (main) {
      setHeader(main.header || main.title || "");
      setText(main.text || main.description || "");
    }
  }, [main]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (main?.id) fd.append("id", main.id);
      fd.append("header", header);
      fd.append("title",  header);
      fd.append("text",   text);
      fd.append("description", text);
      await saveMain(fd);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="For Exhibitors — Hero" />

      {loadingMain ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-zinc-200 rounded p-5 sm:p-6 space-y-4">
          <Field label="Header">
            <WmInput value={header} onChange={(e) => setHeader(e.target.value)} placeholder="For Exhibitors hero header..." />
          </Field>
          <Field label="Description">
            <CustomEditor value={text} onChange={setText} placeholder="Hero description..." />
          </Field>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
