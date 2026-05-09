import React, { useEffect, useState } from "react";
import { useVisitorGuideStore } from "../../../store/website/useVisitorGuideStore";
import {
  Field, WmFileInput, SectionHeader, LoadingSpinner, imgSrc, ImgPreview,
} from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function VisitorMetroMap() {
  const { metro, loadingMetro, fetchMetro, saveMetro } = useVisitorGuideStore();
  const [desc, setDesc]       = useState("");
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchMetro(); }, [fetchMetro]);

  useEffect(() => {
    if (metro) setDesc(metro.description || "");
  }, [metro]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (metro?.id) fd.append("id", metro.id);
      fd.append("description", desc);
      if (file) fd.append("image", file);
      await saveMetro(fd);
      setFile(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Visitor Guide — Metro Map" />

      {loadingMetro ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <Field label="Description">
            <CustomEditor value={desc} onChange={setDesc} placeholder="Metro map directions / how to reach..." />
          </Field>

          {(metro?.image || metro?.image_path) && (
            <Field label="Current Map">
              <img
                src={imgSrc(metro.image || metro.image_path)}
                alt="Metro Map"
                onClick={() => setPreview(imgSrc(metro.image || metro.image_path))}
                className="max-w-full h-auto max-h-72 object-contain rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer hover:opacity-90 transition-opacity"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Click to preview</p>
            </Field>
          )}

          <Field label={metro?.image || metro?.image_path ? "Replace Map (optional)" : "Upload Map"}>
            <WmFileInput onChange={(e) => setFile(e.target.files[0])} />
            {file && (
              <div className="mt-2 flex items-center gap-3">
                <img src={URL.createObjectURL(file)} alt="" className="h-20 w-32 object-contain rounded-lg border border-zinc-200" />
                <p className="text-xs text-emerald-600">{file.name}</p>
              </div>
            )}
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

      {preview && <ImgPreview src={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
