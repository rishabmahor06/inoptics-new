import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCloudUpload, MdRefresh, MdClose, MdContentCopy } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = 'https://inoptics.in/api';

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

const fmtExt = (url = '') => {
  const ext = url.split('.').pop()?.toUpperCase();
  return ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(ext) ? ext : 'IMG';
};

const fmtName = (url = '') => url.split('/').pop() || 'image';

export default function Media() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/get_email_media_images.php`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : data.data || []);
    } catch { setImages([]); }
    finally { setLoading(false); }
  };

  /* ── File pick ── */
  const pickFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('File exceeds 10 MB limit'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onInputChange = (e) => pickFile(e.target.files[0]);

  /* ── Drag & drop ── */
  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop      = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }, []);

  /* ── Clear selection ── */
  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── Upload ── */
  const handleUpload = async () => {
    if (!file) { toast.error('Select an image first'); return; }
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const res  = await fetch(`${API}/upload_email_media_image.php`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success('Image uploaded successfully');
        clearFile();
        fetchImages();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const res  = await fetch(`${API}/delete_email_media_image.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Image deleted');
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch { toast.error('Delete failed'); }
  };

  /* ── Copy link ── */
  const handleCopy = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      toast.success('Link copied!');
      setTimeout(() => setCopied(null), 2000);
    } catch { toast.error('Copy failed'); }
  };

  return (
    <div className="space-y-4 p-2 lg:p-6">

     

      {/* ── Upload panel ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left — drag & drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer select-none
              ${dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50/40'}`}
            style={{ minHeight: 220 }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              className="hidden"
              onChange={onInputChange}
            />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${dragging ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <MdCloudUpload size={30} className="text-white" />
            </div>
            <div className="text-center px-4">
              <p className="text-[13px] font-semibold text-zinc-700">
                {dragging ? 'Drop your image here' : 'Drag & Drop your images here'}
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">or</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Browse Files
            </button>
            <p className="text-[11px] text-zinc-400 mt-1">JPG, PNG, GIF, WEBP up to 10MB</p>
          </div>

          {/* Right — preview */}
          <div className="flex flex-col rounded-xl border border-zinc-200 overflow-hidden bg-white">
            {/* Preview header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <p className="text-[13px] font-bold text-zinc-800">Preview</p>
              {preview && (
                <button onClick={clearFile}
                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                  <MdClose size={16} />
                </button>
              )}
            </div>

            {/* Preview body */}
            {preview ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-start gap-3 p-4 flex-1">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-28 h-24 object-cover rounded-xl border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 break-all leading-tight">{file?.name}</p>
                    <p className="text-[12px] text-zinc-400 mt-1">{fmtSize(file?.size)}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <MdCloudUpload size={16} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 px-6 text-center"
                style={{ minHeight: 170 }}>
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mb-1">
                  <MdCloudUpload size={24} className="text-zinc-400" />
                </div>
                <p className="text-[12px] font-medium text-zinc-500">No image selected</p>
                <p className="text-[11px] text-zinc-400">Select or drag an image to preview it here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-bold text-zinc-800">Uploaded Images</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg">
              {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </span>
            <button onClick={fetchImages} disabled={loading}
              className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors disabled:opacity-50">
              <MdRefresh size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-100 overflow-hidden">
                <div className="h-40 bg-zinc-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-zinc-100 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-zinc-100 rounded animate-pulse" />
                  <div className="h-8 bg-zinc-100 rounded-lg animate-pulse mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <MdCloudUpload size={28} className="text-zinc-300" />
            </div>
            <p className="text-[13px] font-medium text-zinc-400">No images uploaded yet</p>
            <p className="text-[11px] text-zinc-300">Upload your first image above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {images.map((img) => (
              <div key={img.id}
                className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all group">
                {/* Image */}
                <div className="relative overflow-hidden bg-zinc-100" style={{ height: 160 }}>
                  <img
                    src={img.image_url}
                    alt="media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {/* Format badge */}
                  <span className="absolute top-2 right-2 text-[9px] font-bold text-zinc-600 bg-white/90 border border-zinc-200 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {fmtExt(img.image_url)}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[11px] font-semibold text-zinc-800 truncate leading-tight">
                    {img.name || fmtName(img.image_url)}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {img.size ? fmtSize(img.size) : '—'} &bull; {fmtExt(img.image_url)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button
                      onClick={() => handleCopy(img.image_url, img.id)}
                      className={`flex-1 h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-colors
                        ${copied === img.id
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                    >
                      <MdContentCopy size={12} />
                      {copied === img.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                    >
                      <FaRegTrashAlt size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
