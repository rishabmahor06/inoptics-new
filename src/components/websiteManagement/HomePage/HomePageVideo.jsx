import React, { useEffect, useState } from 'react';
import { useHomeVideoStore } from '../../../store/website/useHomeVideoStore';
import { AddBtn, DelBtn, WmModal, Field, WmFileInput, SectionHeader, WmTable, TrRow, TdId, TdActions } from '../shared/WmShared';
import { MdPlayCircle } from 'react-icons/md';

export default function HomePageVideo() {
  const { videos, loading, fetchVideos, uploadVideo, deleteVideo } = useHomeVideoStore();
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleSave = async () => {
    if (!file) { alert('Please select a video file'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      await uploadVideo(fd);
      setModal(false); setFile(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Home Page Videos" count={videos.length}>
        <AddBtn onClick={() => { setFile(null); setModal(true); }} label="Upload Video" />
      </SectionHeader>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <MdPlayCircle className="mx-auto mb-2 opacity-20" size={48} />
          <p className="text-sm">No videos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((row, i) => (
            <div key={row.id} className="relative group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
              <video src={row.video || row.url} className="w-full h-40 object-cover opacity-90" controls preload="metadata" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteVideo(row.id)}
                  className="bg-red-600 text-white rounded-lg p-2 hover:bg-red-700 transition-colors shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-[11px] text-zinc-400 bg-black/60 rounded px-2 py-0.5">#{row.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WmModal title="Upload Home Video" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <Field label="Video File" required>
            <WmFileInput accept="video/*" onChange={e => setFile(e.target.files[0])} label="Choose Video" />
            {file && <p className="text-xs text-emerald-600 mt-1.5">{file.name}</p>}
          </Field>
        </WmModal>
      )}
    </div>
  );
}
