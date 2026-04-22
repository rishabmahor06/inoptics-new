import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { API, MasterTable, MasterTr, MasterTd, MasterActions, MasterModal, MasterField, MasterInput, SectionHead } from './_shared';

const EMPTY = { match_value: '', success_message: '', error_message: '', status: 1 };

export default function MessageRules() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/get_message_rules.php`);
      const d = await r.json();
      setRows(d.success && Array.isArray(d.data) ? d.data : []);
    } catch { toast.error('Failed to load message rules'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r =>
    r.match_value?.toLowerCase().includes(search.toLowerCase()) ||
    r.success_message?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm({ match_value: row.match_value || '', success_message: row.success_message || '', error_message: row.error_message || '', status: row.status ?? 1 });
    setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.match_value.trim()) { toast.error('Match value is required'); return; }
    setSaving(true);
    try {
      const body = modal === 'add' ? form : { ...form, id: editing.id };
      const ep = modal === 'add' ? 'create_message_rule.php' : 'update_message_rule.php';
      const res = await fetch(`${API}/${ep}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json());
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await fetch(`${API}/delete_message_rule.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast.success('Deleted'); load();
    } catch { toast.error('Error deleting'); }
  };

  return (
    <div>
      <SectionHead title="Message Rules" count={rows.length} onAdd={openAdd} addLabel="+ Add Rule" search={search} onSearch={setSearch} />
      <MasterTable headers={['#', 'MATCH VALUE', 'SUCCESS MESSAGE', 'ERROR MESSAGE', 'STATUS', 'ACTIONS']} loading={loading} empty={filtered.length === 0}>
        {filtered.map((row, i) => (
          <MasterTr key={row.id} index={i}>
            <MasterTd className="text-zinc-400 text-[12px]">{i + 1}</MasterTd>
            <MasterTd className="font-medium text-zinc-800 max-w-[140px] truncate">{row.match_value}</MasterTd>
            <MasterTd className="max-w-[200px]">
              <p className="text-[12px] text-emerald-700 line-clamp-2">{row.success_message}</p>
            </MasterTd>
            <MasterTd className="max-w-[200px]">
              <p className="text-[12px] text-red-600 line-clamp-2">{row.error_message}</p>
            </MasterTd>
            <MasterTd>
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${row.status == 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                {row.status == 1 ? 'Active' : 'Inactive'}
              </span>
            </MasterTd>
            <MasterActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row.id)} />
          </MasterTr>
        ))}
      </MasterTable>

      {modal && (
        <MasterModal title={`${modal === 'add' ? 'Add' : 'Edit'} Message Rule`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <MasterField label="Match Value" required>
              <MasterInput value={form.match_value} onChange={set('match_value')} placeholder="Keyword or pattern to match" />
            </MasterField>
            <MasterField label="Success Message">
              <textarea value={form.success_message} onChange={set('success_message')} rows={3} placeholder="Message shown on success..."
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-zinc-300" />
            </MasterField>
            <MasterField label="Error Message">
              <textarea value={form.error_message} onChange={set('error_message')} rows={3} placeholder="Message shown on error..."
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-zinc-300" />
            </MasterField>
            <MasterField label="Status">
              <select value={form.status} onChange={set('status')}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </MasterField>
          </div>
        </MasterModal>
      )}
    </div>
  );
}
