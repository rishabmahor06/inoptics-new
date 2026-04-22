import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API, MasterField, MasterInput } from './_shared';

export default function ExhibitorSeriesEdit() {
  const [saved, setSaved]   = useState(null);
  const [series, setSeries] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/get_exhibitor_badge_series.php`);
      const d = await r.json();
      if (d.success && d.data) setSaved(d.data);
    } catch { toast.error('Failed to load series'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadForEdit = () => {
    if (!saved) return;
    setSeries(saved.exhibitor_badge_series || '');
    setNumber(saved.exhibitor_badge_num || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!series.trim() || !number) { toast.error('Both fields are required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/update_exhibitor_badge_series.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitor_badge_series: series.trim(), exhibitor_badge_num: Number(number) }),
      }).then(r => r.json());
      if (res.success) { toast.success('Series saved successfully'); setSeries(''); setNumber(''); load(); }
      else toast.error(res.message || 'Save failed');
    } catch { toast.error('Server error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-800">Exhibitor Series Edit</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Configure the exhibitor badge series prefix and starting number</p>
      </div>

      {/* Current Series Card */}
      {loading ? (
        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-400">Loading...</div>
      ) : saved ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-5 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Current Configuration</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100">
              <p className="text-xs text-zinc-400 mb-1">Badge Series</p>
              <p className="text-base font-bold text-zinc-800">{saved.exhibitor_badge_series || '—'}</p>
            </div>
            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100">
              <p className="text-xs text-zinc-400 mb-1">Starting Number</p>
              <p className="text-base font-bold text-zinc-800">{saved.exhibitor_badge_num || '—'}</p>
            </div>
          </div>
          <button onClick={loadForEdit}
            className="mt-4 w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            Load for Editing
          </button>
        </div>
      ) : (
        <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 mb-6 text-center text-sm text-zinc-400">No series configured yet</div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Update Series</p>
        <MasterField label="Badge Series Prefix" required>
          <MasterInput value={series} onChange={e => setSeries(e.target.value)} placeholder="e.g. INOP-2026" />
        </MasterField>
        <MasterField label="Starting Number" required>
          <MasterInput type="number" value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 1001" />
        </MasterField>
        <button type="submit" disabled={saving}
          className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Series'}
        </button>
      </form>
    </div>
  );
}
