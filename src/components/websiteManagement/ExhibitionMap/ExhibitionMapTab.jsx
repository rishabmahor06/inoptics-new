import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MdAdd, MdRemove, MdRefresh, MdClose, MdMap,
  MdPanTool, MdImageNotSupported, MdVisibility,
  MdToggleOn, MdToggleOff,
} from 'react-icons/md';
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdActions, imgSrc,
} from '../shared/WmShared';

const API = 'https://inoptics.in/api';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

/* ============ Preview with zoom/pan/reset ============ */
function MapPreview({ src, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pan = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const pinch = useRef({ active: false, startDist: 0, startZoom: 1 });

  const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  /* wheel zoom */
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => clamp(+(z + delta).toFixed(2)));
  };

  /* mouse pan */
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    pan.current = {
      active: true,
      startX: e.clientX, startY: e.clientY,
      baseX: offset.x, baseY: offset.y,
    };
  };
  const onMouseMove = (e) => {
    if (!pan.current.active) return;
    setOffset({
      x: pan.current.baseX + (e.clientX - pan.current.startX),
      y: pan.current.baseY + (e.clientY - pan.current.startY),
    });
  };
  const endPan = () => { pan.current.active = false; };

  /* touch (pan + pinch) */
  const dist = (t1, t2) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinch.current = {
        active: true,
        startDist: dist(e.touches[0], e.touches[1]),
        startZoom: zoom,
      };
    } else if (e.touches.length === 1) {
      pan.current = {
        active: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        baseX: offset.x, baseY: offset.y,
      };
    }
  };
  const onTouchMove = (e) => {
    if (pinch.current.active && e.touches.length === 2) {
      const d = dist(e.touches[0], e.touches[1]);
      const ratio = d / pinch.current.startDist;
      setZoom(clamp(+(pinch.current.startZoom * ratio).toFixed(2)));
    } else if (pan.current.active && e.touches.length === 1) {
      setOffset({
        x: pan.current.baseX + (e.touches[0].clientX - pan.current.startX),
        y: pan.current.baseY + (e.touches[0].clientY - pan.current.startY),
      });
    }
  };
  const onTouchEnd = () => {
    pan.current.active = false;
    pinch.current.active = false;
  };

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => clamp(z + ZOOM_STEP));
      if (e.key === '-' || e.key === '_') setZoom((z) => clamp(z - ZOOM_STEP));
      if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-900 border-b border-white/10 text-white">
        <div className="flex items-center gap-2">
          <MdMap size={18} className="text-blue-400" />
          <h3 className="text-[14px] font-semibold">Exhibition Map Preview</h3>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded bg-white/10 text-[11px] font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => clamp(z - ZOOM_STEP))}
            className="w-9 h-9 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom Out (-)"
          >
            <MdRemove size={18} />
          </button>
          <button
            onClick={() => setZoom((z) => clamp(z + ZOOM_STEP))}
            className="w-9 h-9 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom In (+)"
          >
            <MdAdd size={18} />
          </button>
          <button
            onClick={reset}
            className="px-3 h-9 rounded bg-white/10 hover:bg-white/20 text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset (0)"
          >
            <MdRefresh size={16} /> Reset
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center transition-colors ml-1"
            title="Close (Esc)"
          >
            <MdClose size={18} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        className="flex-1 overflow-hidden relative select-none touch-none cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: pan.current.active ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <img
            src={src}
            alt="Exhibition Map"
            draggable={false}
            className="max-w-none block"
            style={{ maxHeight: '85vh' }}
          />
        </div>

        {/* Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded bg-black/60 text-white text-[11px] flex items-center gap-2 pointer-events-none">
          <MdPanTool size={12} /> Drag to pan · Scroll / pinch to zoom · Press 0 to reset
        </div>
      </div>
    </div>
  );
}

/* ============ Main Tab ============ */
export default function ExhibitionMapTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [active, setActive]   = useState(true);
  const [file, setFile]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/get_exhibition_map.php`);
      const d = await r.json();
      setRows(Array.isArray(d) ? d : d?.data || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isActiveRow = (row) => {
    const v = row?.status ?? row?.active ?? row?.is_active;
    if (v === undefined || v === null) return false;
    const s = String(v).toLowerCase();
    return s === '1' || s === 'true' || s === 'active' || s === 'yes';
  };

  const openAdd = () => {
    setActive(false); setFile(null); setEditing(null); setModal('add');
  };
  const openEdit = (row) => {
    setActive(isActiveRow(row));
    setFile(null);
    setEditing(row);
    setModal('edit');
  };

  const handleSave = async () => {
    if (modal === 'add' && !file) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('status', active ? 'active' : 'inactive');
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const r = await fetch(
        `${API}/${modal === 'add' ? 'add_exhibition_map.php' : 'update_exhibition_map.php'}`,
        { method: 'POST', body: fd }
      );
      const res = await r.json().catch(() => ({}));
      const ok = res?.success === true || res?.status === 'success' || /success/i.test(res?.message || '');
      if (ok) {
        toast.success(res.message || 'Saved');
        setModal(null);
        load();
      } else {
        toast.error(res?.message || 'Failed to save');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this map?')) return;
    try {
      const r = await fetch(`${API}/delete_exhibition_map.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const res = await r.json().catch(() => ({}));
      const ok = res?.success === true || res?.status === 'success' || /success/i.test(res?.message || '');
      if (ok) { toast.success(res.message || 'Deleted'); load(); }
      else toast.error(res?.message || 'Failed to delete');
    } catch {
      toast.error('Server error');
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Exhibition Map" count={rows.length}>
        <AddBtn onClick={openAdd} label="Add Map" />
      </SectionHeader>

      {/* Cards grid */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {rows.map((row) => {
            const src = imgSrc(row.image);
            return (
              <div
                key={row.id}
                className="bg-white rounded border border-zinc-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group flex flex-col"
              >
                <div
                  className="relative h-44 bg-zinc-50 flex items-center justify-center cursor-pointer"
                  onClick={() => src && setPreview(src)}
                >
                  {src ? (
                    <>
                      <img src={src} alt="" className="h-full w-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 text-white text-[12px] font-semibold bg-black/70 px-3 py-1.5 rounded">
                          <MdVisibility size={14} /> Preview
                        </span>
                      </div>
                    </>
                  ) : (
                    <MdImageNotSupported className="text-zinc-300" size={40} />
                  )}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-zinc-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-zinc-800 truncate">
                      Map #{row.id}
                    </p>
                    <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold uppercase tracking-wider ${isActiveRow(row) ? 'text-emerald-600' : 'text-zinc-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded ${isActiveRow(row) ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                      {isActiveRow(row) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <EditBtn onClick={() => openEdit(row)} />
                    <DelBtn onClick={() => handleDelete(row.id)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <WmTable
        headers={['#', 'IMAGE', 'STATUS', 'ACTIONS']}
        loading={loading}
        empty={rows.length === 0}
      >
        {rows.map((row, i) => {
          const src = imgSrc(row.image);
          const act = isActiveRow(row);
          return (
            <TrRow key={row.id} index={i}>
              <TdId>{row.id}</TdId>
              <Td>
                {src ? (
                  <img
                    src={src}
                    alt=""
                    onClick={() => setPreview(src)}
                    className="h-12 w-20 object-contain rounded border border-zinc-200 bg-zinc-50 cursor-pointer hover:opacity-80"
                  />
                ) : (
                  <span className="text-zinc-300 text-xs">No image</span>
                )}
              </Td>
              <Td>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${act ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded ${act ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                  {act ? 'Active' : 'Inactive'}
                </span>
              </Td>
              <TdActions>
                <EditBtn onClick={() => openEdit(row)} />
                <DelBtn onClick={() => handleDelete(row.id)} />
              </TdActions>
            </TrRow>
          );
        })}
      </WmTable>

      {/* Add / Edit modal */}
      {modal && (
        <WmModal
          title={modal === 'add' ? 'Add Exhibition Map' : 'Edit Exhibition Map'}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        >
          <div className="space-y-4">
            <Field label="Status">
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {active ? <MdToggleOn size={24} /> : <MdToggleOff size={24} />}
                {active ? 'Active' : 'Inactive'}
              </button>
              <p className="text-[11px] text-zinc-400 mt-1">
                {active
                  ? 'This map will be visible on the website.'
                  : 'This map will be hidden from the website.'}
              </p>
            </Field>
            {modal === 'edit' && editing?.image && (
              <Field label="Current Image">
                <img
                  src={imgSrc(editing.image)}
                  alt=""
                  className="h-28 w-44 object-contain rounded border border-zinc-200 bg-zinc-50 cursor-pointer"
                  onClick={() => setPreview(imgSrc(editing.image))}
                />
                <p className="text-xs text-zinc-400 mt-1">Click to preview</p>
              </Field>
            )}
            <Field label={modal === 'edit' ? 'Replace Image (optional)' : 'Image'} required={modal === 'add'}>
              <WmFileInput onChange={(e) => setFile(e.target.files[0])} />
              {file && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-20 w-32 object-contain rounded border border-zinc-200 bg-zinc-50"
                  />
                  <p className="text-xs text-emerald-600">{file.name}</p>
                </div>
              )}
            </Field>
          </div>
        </WmModal>
      )}

      {/* Zoom/pan preview overlay */}
      {preview && <MapPreview src={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
