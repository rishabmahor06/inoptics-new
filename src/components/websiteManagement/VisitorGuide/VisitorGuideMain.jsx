import React, { useEffect, useState } from "react";
import { useVisitorGuideStore } from "../../../store/website/useVisitorGuideStore";
import { Field, WmInput, SectionHeader, LoadingSpinner } from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function VisitorGuideMain() {
  const { main, loadingMain, fetchMain, saveMain } = useVisitorGuideStore();
  const [title, setTitle]       = useState("");
  const [text,  setText]        = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchMain(); }, [fetchMain]);

  useEffect(() => {
    if (main) {
      setTitle(main.title || "");
      setText(main.text || main.description || "");
    }
  }, [main]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (main?.id) fd.append("id", main.id);
      fd.append("title", title);
      fd.append("text",  text);
      fd.append("description", text);
      await saveMain(fd);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Visitor Guide — Hero Section" />

      {loadingMain ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <Field label="Title">
            <WmInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Visitor Guide title..." />
          </Field>

          <Field label="Description">
            <CustomEditor value={text} onChange={setText} placeholder="Description / intro paragraph..." />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
