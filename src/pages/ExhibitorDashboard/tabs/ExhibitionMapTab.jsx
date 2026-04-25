import React, { useState, useEffect, useRef } from 'react';
import {
  MdMap, MdZoomIn, MdZoomOut, MdEdit, MdDelete, MdDownload,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { apiFetch, apiPost, apiPostForm, SectionShell, Modal, ModalActions } from '../shared';

export default function ExhibitionMapTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal]         = useState(null);
  const [imgFile, setImgFile]     = useState(null);
  const [view, setView]           = useState({ zoom: 1, panX: 0, panY: 0 });
  const [fitView, setFitView]     = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const dragRef      = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 });
  const fitViewRef   = useRef(null);
  const fileRef      = useRef(null);
  const touchRef     = useRef({ active: false, x: 0, y: 0, panX: 0, panY: 0 });

  const load = async () => {
    setLoading(true);
    fitViewRef.current = null;
    setFitView(null);
    setView({ zoom: 1, panX: 0, panY: 0 });
    try { setItems(await apiFetch('get_exhibition_map.php')); }
    catch { setItems([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  /* Wheel zoom */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const mx    = e.clientX - rect.left;
      const my    = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.12 : 0.12;
      setView(v => {
        const minZoom = fitViewRef.current?.zoom ?? 0.2;
        const newZoom = Math.min(Math.max(v.zoom + delta, minZoom), 6);
        const scale   = newZoom / v.zoom;
        return { zoom: newZoom, panX: mx - (mx - v.panX) * scale, panY: my - (my - v.panY) * scale };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [items]);

  const zoomBy = (delta) => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const mx = width / 2, my = height / 2;
    setView(v => {
      const minZoom = fitViewRef.current?.zoom ?? 0.2;
      const newZoom = Math.min(Math.max(v.zoom + delta, minZoom), 6);
      const scale   = newZoom / v.zoom;
      return { zoom: newZoom, panX: mx - (mx - v.panX) * scale, panY: my - (my - v.panY) * scale };
    });
  };

  const resetView = () => setView(fitView ?? { zoom: 1, panX: 0, panY: 0 });

  const handleImgLoad = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const iW = e.target.naturalWidth;
    const iH = e.target.naturalHeight;
    if (!iW || !iH) return;
    const scale = Math.min(width / iW, height / iH) * 0.96;
    const panX  = (width  - iW * scale) / 2;
    const panY  = (height - iH * scale) / 2;
    const fit   = { zoom: scale, panX, panY };
    fitViewRef.current = fit;
    setFitView(fit);
    setView(fit);
  };

  /* Drag pan */
  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panX: view.panX, panY: view.panY };
    setIsDragging(true);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setView(v => ({ ...v, panX: dragRef.current.panX + dx, panY: dragRef.current.panY + dy }));
  };
  const onMouseUp = () => { dragRef.current.active = false; setIsDragging(false); };

  /* Touch pan */
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { active: true, x: t.clientX, y: t.clientY, panX: view.panX, panY: view.panY };
  };
  const onTouchMove = (e) => {
    if (!touchRef.current.active) return;
    e.preventDefault();
    const t  = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    setView(v => ({ ...v, panX: touchRef.current.panX + dx, panY: touchRef.current.panY + dy }));
  };
  const onTouchEnd = () => { touchRef.current.active = false; };

  const handleDownload = async (imageUrl) => {
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'exhibition-map';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { window.open(imageUrl, '_blank'); }
  };

  const handleUpload = async () => {
    if (!imgFile) { toast.error('Please select an image'); return; }
    const fd = new FormData();
    fd.append('image', imgFile);
    if (modal?.id) fd.append('id', modal.id);
    setUploading(true);
    try {
      await apiPostForm(modal?.id ? 'update_exhibition_map.php' : 'add_exhibition_map.php', fd);
      toast.success(modal?.id ? 'Map updated' : 'Map uploaded');
      setModal(null); setImgFile(null); load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this map?')) return;
    try { await apiPost('delete_exhibition_map.php', { id }); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const map = items[0];

  return (
    <>
      <SectionShell icon={MdMap} iconBg="#fce7f3" iconColor="#ec4899"
        title="Exhibition Map"
        subtitle="Upload and manage the exhibition floor plan"
        onAdd={map ? undefined : () => setModal({})}
        addLabel="Upload Map"
        loading={loading}
        >
        {loading ? (
          <div className="h-64 bg-zinc-100 rounded-xl animate-pulse" />
        ) : !map ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-xl">
            <MdMap size={40} className="text-zinc-300 mx-auto mb-2" />
            <p className="text-[13px] text-zinc-400">No exhibition map uploaded</p>
            <button onClick={() => setModal({})} className="mt-2 text-[12px] font-semibold text-blue-600 hover:underline">+ Upload map</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => zoomBy(0.25)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 transition-colors">
                <MdZoomIn size={14} /> Zoom In
              </button>
              <button onClick={() => zoomBy(-0.25)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 transition-colors">
                <MdZoomOut size={14} /> Zoom Out
              </button>
              <button onClick={resetView}
                className="px-3 py-1.5 text-[12px] font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors">
                Reset ({Math.round(view.zoom * 100)}%)
              </button>
              <p className="text-[10px] text-zinc-400 hidden sm:block">Scroll to zoom · Drag to pan</p>
              <div className="flex-1" />
              <button onClick={() => handleDownload(map.image)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <MdDownload size={14} /> Download
              </button>
              <button onClick={() => { setModal({ id: map.id }); setImgFile(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                <MdEdit size={13} /> Replace
              </button>
              <button onClick={() => handleDelete(map.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <MdDelete size={13} /> Delete
              </button>
            </div>

            <div
              ref={containerRef}
              className="relative rounded-xl border border-zinc-200 bg-[#f4f4f4] overflow-hidden select-none"
              style={{ height: '100vh', cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={map.image}
                alt="Exhibition Map"
                draggable={false}
                onLoad={handleImgLoad}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
                  transformOrigin: '0 0',
                  pointerEvents: 'none',
                  maxWidth: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease',
                }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
                {Math.round(view.zoom * 100)}%
              </div>
            </div>
          </div>
        )}
      </SectionShell>

      {modal !== null && (
        <Modal title={modal.id ? 'Replace Exhibition Map' : 'Upload Exhibition Map'}
          onClose={() => { setModal(null); setImgFile(null); }}>
          <div
            className="border-2 border-dashed border-zinc-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            onClick={() => fileRef.current?.click()}>
            <MdMap size={36} className="text-zinc-400 mx-auto mb-2" />
            {imgFile
              ? <p className="text-[13px] font-semibold text-blue-600">{imgFile.name}</p>
              : <><p className="text-[13px] text-zinc-500">Click to select an image</p>
                  <p className="text-[11px] text-zinc-400 mt-1">JPG, PNG, GIF up to 10 MB</p></>
            }
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => setImgFile(e.target.files[0])} />
          </div>
          {imgFile && (
            <img src={URL.createObjectURL(imgFile)} alt="preview"
              className="w-full rounded-xl border border-zinc-200 max-h-48 object-contain mt-3" />
          )}
          <ModalActions
            onCancel={() => { setModal(null); setImgFile(null); }}
            onSave={handleUpload}
            saving={uploading}
            saveLabel={modal.id ? 'Replace' : 'Upload'}
          />
        </Modal>
      )}
    </>
  );
}
