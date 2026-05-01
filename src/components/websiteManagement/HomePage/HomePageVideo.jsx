import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useHomeVideoStore } from '../../../store/website/useHomeVideoStore';
import { AddBtn, WmModal, Field, WmFileInput, SectionHeader } from '../shared/WmShared';
import { MdPlayCircle, MdLink, MdUpload, MdDelete, MdYoutubeSearchedFor } from 'react-icons/md';

const isEmbed = (s = '') => /youtube\.com\/embed|player\.vimeo\.com/i.test(s);
const isFile  = (s = '') => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(s);

export default function HomePageVideo() {
  const { videos, loading, fetchVideos, uploadVideo, uploadVideoLink, deleteVideo } = useHomeVideoStore();
  const [modal,  setModal]  = useState(false);
  const [tab,    setTab]    = useState('link');   // 'link' | 'file'
  const [file,   setFile]   = useState(null);
  const [url,    setUrl]    = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const reset = () => { setFile(null); setUrl(''); setTab('link'); };
  const open  = () => { reset(); setModal(true); };

  const handleSave = async () => {
    if (tab === 'file') {
      if (!file) { toast.error('Please select a video file'); return; }
      setSaving(true);
      try {
        const fd = new FormData();
        fd.append('video', file);
        await uploadVideo(fd);
        setModal(false); reset();
      } finally { setSaving(false); }
    } else {
      const trimmed = url.trim();
      if (!trimmed) { toast.error('Please paste a video link'); return; }
      setSaving(true);
      try {
        const res = await uploadVideoLink(trimmed);
        if (!res?.error) { setModal(false); reset(); }
      } finally { setSaving(false); }
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Home Page Videos" count={videos.length}>
        <AddBtn onClick={open} label="Add Video" />
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
          <p className="text-sm">No videos added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((row) => {
            const src = row.video_url || row.video_path || row.video || row.url || '';
            const fullSrc = src.startsWith('http') ? src : `https://inoptics.in/api/${src}`;
            return (
              <div key={row.id} className="relative group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-sm">
                {isEmbed(fullSrc) ? (
                  <iframe
                    src={fullSrc}
                    className="w-full h-40"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    title={`Video ${row.id}`}
                  />
                ) : isFile(fullSrc) ? (
                  <video src={fullSrc} className="w-full h-40 object-cover opacity-90" controls preload="metadata" />
                ) : (
                  <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs px-3 text-center break-all">
                    {fullSrc || 'Unknown source'}
                  </div>
                )}

                <button
                  onClick={() => deleteVideo(row.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-2 hover:bg-red-700 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <MdDelete size={16} />
                </button>

                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-700 bg-white rounded px-2 py-0.5">#{row.id}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isEmbed(fullSrc) ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {isEmbed(fullSrc) ? 'Link' : 'File'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <WmModal title="Add Home Video" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setTab('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-md transition-all ${
                tab === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MdLink size={16} /> YouTube / Link
            </button>
            <button
              type="button"
              onClick={() => setTab('file')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-md transition-all ${
                tab === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MdUpload size={16} /> Upload File
            </button>
          </div>

          {tab === 'link' ? (
            <Field label="Video Link" required>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-10 px-3 text-[14px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="flex items-center gap-1 text-[11px] text-zinc-500 mt-2">
                <MdYoutubeSearchedFor size={13} /> YouTube, Vimeo, or direct .mp4 link supported
              </p>
            </Field>
          ) : (
            <Field label="Video File" required>
              <WmFileInput accept="video/*" onChange={(e) => setFile(e.target.files[0])} label="Choose Video" />
              {file && <p className="text-xs text-emerald-600 mt-1.5">{file.name}</p>}
            </Field>
          )}
        </WmModal>
      )}
    </div>
  );
}
