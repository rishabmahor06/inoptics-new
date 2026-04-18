import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import CustomEditor from '../components/CustomEditor/CustomEditor';

const API = 'https://inoptics.in/api';

const apiFetch = (ep) => fetch(`${API}/${ep}`).then(r => r.json());
const apiPost  = (ep, data) => fetch(`${API}/${ep}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(r => r.json());
const apiPostForm = (ep, fd) => fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());

const SPONSOR_TYPES = [
  'Platinum','Gold','Footer-hoya','Silver','Bronze','Diamond','Title',
  'Co-Title','Associate','Supporting','Media Partner','Knowledge Partner',
  'Technology Partner','Hospitality Partner','Logistics Partner','Exhibition Partner','Other',
];

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function AddBtn({ onClick, label = 'Add' }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3.5 py-2 text-[13px] font-semibold hover:bg-blue-700 transition-colors">
      <MdAdd size={16}/>{label}
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-green-100 transition-colors">
      <MdEdit size={13}/>Edit
    </button>
  );
}

function DelBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-red-100 transition-colors">
      <MdDelete size={13}/>Delete
    </button>
  );
}

function Modal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TableShell({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-100">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h}
                className="bg-zinc-900 text-white px-4 py-3 text-left font-semibold text-[11px] tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="py-12 text-center text-zinc-400 text-sm">Loading...</td></tr>
          ) : empty ? (
            <tr><td colSpan={headers.length} className="py-12 text-center text-zinc-400 text-sm">No records found.</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-zinc-300"/>
  );
}

function FileInput({ onChange, accept = 'image/*' }) {
  return (
    <input type="file" accept={accept} onChange={onChange}
      className="w-full text-sm text-zinc-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
  );
}

// ─── Landing Page (Sponsors) ──────────────────────────────────────────────────

function LandingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sponsor_type: SPONSOR_TYPES[0] });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_sponsors.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load sponsors'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', sponsor_type: SPONSOR_TYPES[0] }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ name: row.name || '', sponsor_type: row.sponsor_type || SPONSOR_TYPES[0] }); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('sponsor_type', form.sponsor_type);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_sponsor.php' : 'update_sponsor.php', fd);
      toast.success(res.message || 'Saved');
      load(); setModal(null);
    } catch { toast.error('Error saving sponsor'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try { const r = await apiPost('delete_sponsor.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Sponsors</h3>
        <AddBtn onClick={openAdd} label="Add Sponsor"/>
      </div>
      <TableShell headers={['ID','NAME','SPONSOR TYPE','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-semibold text-zinc-800">{row.name}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-600">{row.sponsor_type}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-10 w-16 object-contain rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Sponsor' : 'Edit Sponsor'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Name" required>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sponsor name"/>
            </Field>
            <Field label="Sponsor Type">
              <select value={form.sponsor_type} onChange={e => setForm(p => ({ ...p, sponsor_type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SPONSOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Floating Card ────────────────────────────────────────────────────────────

function FloatingCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_floating_card.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setContent(row.description || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
      const res = await apiPost(modal === 'add' ? 'add_floating_card.php' : 'update_floating_card.php', payload);
      toast.success(res.message || 'Saved');
      load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_floating_card.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Floating Card</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','DESCRIPTION','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xl">
              <div className="text-[13px] text-zinc-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Floating Card' : 'Edit Floating Card'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <Field label="Description">
            <CustomEditor value={content} onChange={setContent} placeholder="Enter description..."/>
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─── Home Page Video ──────────────────────────────────────────────────────────

function HomePageVideo() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_home_video.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load videos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!file) { toast.error('Please select a video'); return; }
    setSaving(true);
    try {
      const fd = new FormData(); fd.append('video', file);
      const res = await apiPostForm('add_home_video.php', fd);
      toast.success(res.message || 'Uploaded'); load(); setModal(false);
    } catch { toast.error('Error uploading'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try { const r = await apiPost('delete_home_video.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Home Page Video</h3>
        <AddBtn onClick={() => { setFile(null); setModal(true); }} label="Upload Video"/>
      </div>
      <TableShell headers={['ID','VIDEO','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.video && <video src={row.video} className="h-16 w-28 rounded object-cover" controls/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <DelBtn onClick={() => handleDelete(row.id)}/>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title="Upload Home Video" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <Field label="Video File"><FileInput accept="video/*" onChange={e => setFile(e.target.files[0])}/></Field>
        </Modal>
      )}
    </div>
  );
}

// ─── Founder Section ──────────────────────────────────────────────────────────

function FounderSection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_founder_section.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setHeading(''); setDescription(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setHeading(row.heading || ''); setDescription(row.description || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('heading', heading);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_founder_section.php' : 'update_founder_section.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_founder_section.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Founder Section</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','HEADING','DESCRIPTION','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.heading}</td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Founder' : 'Edit Founder'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Heading"><Input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Heading"/></Field>
            <Field label="Description"><CustomEditor value={description} onChange={setDescription} placeholder="Description..."/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── People Comments ──────────────────────────────────────────────────────────

function PeopleComments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', designation: '' });
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_people_comments.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', designation: '' }); setComment(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ name: row.name || '', designation: row.designation || '' }); setComment(row.comments || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('designation', form.designation);
      fd.append('comments', comment);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_people_comment.php' : 'update_people_comment.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_people_comment.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">People Comments</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','IMAGE','COMMENTS','NAME','DESIGNATION','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-12 object-cover rounded-full"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.comments }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.name}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-600">{row.designation}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Comment' : 'Edit Comment'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name"><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name"/></Field>
              <Field label="Designation"><Input value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="Designation"/></Field>
            </div>
            <Field label="Comment"><CustomEditor value={comment} onChange={setComment} placeholder="Comment..."/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Our Story ────────────────────────────────────────────────────────────────

function OurStory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_our_story.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setTitle(''); setDescription(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title, description, ...(modal === 'edit' ? { id: editing.id } : {}) };
      const res = await apiPost(modal === 'add' ? 'add_our_story.php' : 'update_our_story.php', payload);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_our_story.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Our Story</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','TITLE','DESCRIPTION','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Story' : 'Edit Story'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"/></Field>
            <Field label="Description"><CustomEditor value={description} onChange={setDescription} placeholder="Description..."/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Footer Section (generic) ─────────────────────────────────────────────────

function FooterSection({ num, colHeaders, fields }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [editorVal, setEditorVal] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch(`get_footer_${num}.php`); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error(`Failed to load footer ${num}`); }
    finally { setLoading(false); }
  }, [num]);

  useEffect(() => { load(); }, [load]);

  const buildInitForm = (row = null) => {
    const f = {};
    fields.forEach(fld => { if (fld.type !== 'file' && fld.type !== 'editor') f[fld.key] = row?.[fld.key] || ''; });
    return f;
  };

  const openAdd = () => { setForm(buildInitForm()); setEditorVal(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => {
    setForm(buildInitForm(row));
    const ef = fields.find(f => f.type === 'editor');
    if (ef) setEditorVal(row[ef.key] || '');
    setFile(null); setEditing(row); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const hasFile = fields.some(f => f.type === 'file');
      const ef = fields.find(f => f.type === 'editor');
      if (hasFile) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (ef) fd.append(ef.key, editorVal);
        if (file) fd.append('image', file);
        if (modal === 'edit') fd.append('id', editing.id);
        const res = await apiPostForm(modal === 'add' ? `add_footer_${num}.php` : `update_footer_${num}.php`, fd);
        toast.success(res.message || 'Saved');
      } else {
        const payload = { ...form, ...(ef ? { [ef.key]: editorVal } : {}), ...(modal === 'edit' ? { id: editing.id } : {}) };
        const res = await apiPost(modal === 'add' ? `add_footer_${num}.php` : `update_footer_${num}.php`, payload);
        toast.success(res.message || 'Saved');
      }
      load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost(`delete_footer_${num}.php`, { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Footer {num}</h4>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID', ...colHeaders, 'ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            {fields.filter(f => f.showInTable).map(f => (
              <td key={f.key} className="px-4 py-3 border-b border-zinc-100">
                {f.type === 'image'
                  ? (row[f.key] && <img src={row[f.key]} alt="" className="h-10 w-14 object-contain rounded"/>)
                  : f.type === 'editor'
                  ? <div className="text-[13px] text-zinc-600 line-clamp-1 max-w-xs" dangerouslySetInnerHTML={{ __html: row[f.key] }}/>
                  : <span className="text-[13px] text-zinc-700">{row[f.key]}</span>}
              </td>
            ))}
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} Footer ${num}`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {fields.map(f => (
              <Field key={f.key} label={f.label}>
                {f.type === 'editor'
                  ? <CustomEditor value={editorVal} onChange={setEditorVal} placeholder={f.label}/>
                  : f.type === 'file'
                  ? <FileInput onChange={e => setFile(e.target.files[0])}/>
                  : <Input value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.label}/>}
              </Field>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Generic content section (title + description + editor) ───────────────────

function ContentSection({ title, getEndpoint, addEndpoint, updateEndpoint, deleteEndpoint, hasTitle = true }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch(getEndpoint); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [getEndpoint]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setItemTitle(''); setContent(''); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setItemTitle(row.title || ''); setContent(row.description || row.content || ''); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(hasTitle ? { title: itemTitle } : {}),
        description: content,
        ...(modal === 'edit' ? { id: editing.id } : {}),
      };
      const res = await apiPost(modal === 'add' ? addEndpoint : updateEndpoint, payload);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost(deleteEndpoint, { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  const tableHeaders = hasTitle ? ['ID','TITLE','DESCRIPTION','ACTION'] : ['ID','DESCRIPTION','ACTION'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={tableHeaders} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            {hasTitle && <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>}
            <td className="px-4 py-3 border-b border-zinc-100 max-w-sm">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description || row.content || '' }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} ${title}`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {hasTitle && <Field label="Title"><Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Title"/></Field>}
            <Field label="Description"><CustomEditor value={content} onChange={setContent} placeholder="Content..."/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Press Release ────────────────────────────────────────────────────────────

function PressRelease() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', date: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_press_release.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ title: '', date: '' }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ title: row.title || '', date: row.date || '' }); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('date', form.date);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_press_release.php' : 'update_press_release.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_press_release.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Press Release</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','TITLE','DATE','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-600">{row.date}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-10 w-14 object-contain rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Press Release' : 'Edit Press Release'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title"/></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Media Gallery ────────────────────────────────────────────────────────────

function MediaGallery() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_media_gallery.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title);
      const res = await apiPostForm('add_media_gallery.php', fd);
      toast.success(res.message || 'Added'); load(); setModal(false); setTitle(''); setFile(null);
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_media_gallery.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Media Gallery</h3>
        <AddBtn onClick={() => { setFile(null); setTitle(''); setModal(true); }} label="Upload"/>
      </div>
      {loading ? (
        <p className="text-sm text-zinc-400 py-8 text-center">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-400 py-8 text-center">No media found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {rows.map(row => (
            <div key={row.id} className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
              <img src={row.image || row.url} alt="" className="w-full h-28 object-cover"/>
              {row.title && <p className="text-xs text-zinc-600 px-2 py-1 truncate">{row.title}</p>}
              <button onClick={() => handleDelete(row.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdDelete size={14}/>
              </button>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title="Upload Media" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title (optional)"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Home Page (with sub-tabs) ────────────────────────────────────────────────

const HOME_SUB_TABS = ['Home Page Video','Founder Section','People Comments','Our Story','Footer','Privacy & Terms','Rules & Policy','Press Release','Media Gallery'];

const FOOTER_CONFIG = {
  1: {
    colHeaders: ['IMAGE','DESCRIPTION'],
    fields: [
      { key: 'description', label: 'Description', type: 'editor', showInTable: true },
      { key: 'image',       label: 'Image',       type: 'file',   showInTable: true },
    ],
  },
  2: {
    colHeaders: ['TITLE','DESCRIPTION'],
    fields: [
      { key: 'title',       label: 'Title',       type: 'text',   showInTable: true },
      { key: 'description', label: 'Description', type: 'editor', showInTable: true },
    ],
  },
  3: {
    colHeaders: ['DESCRIPTION'],
    fields: [
      { key: 'description', label: 'Description', type: 'editor', showInTable: true },
    ],
  },
  4: {
    colHeaders: ['TITLE','IMAGE'],
    fields: [
      { key: 'title', label: 'Title', type: 'text',   showInTable: true },
      { key: 'image', label: 'Image', type: 'file',   showInTable: true },
    ],
  },
};

function HomePage() {
  const [sub, setSub] = useState(HOME_SUB_TABS[0]);

  const renderSub = () => {
    switch (sub) {
      case 'Home Page Video':  return <HomePageVideo/>;
      case 'Founder Section':  return <FounderSection/>;
      case 'People Comments':  return <PeopleComments/>;
      case 'Our Story':        return <OurStory/>;
      case 'Footer':
        return (
          <div className="space-y-8">
            {[1, 2, 3, 4].map(n => (
              <FooterSection key={n} num={n} colHeaders={FOOTER_CONFIG[n].colHeaders} fields={FOOTER_CONFIG[n].fields}/>
            ))}
          </div>
        );
      case 'Privacy & Terms':
        return <ContentSection title="Privacy & Terms" getEndpoint="get_privacy_terms.php" addEndpoint="add_privacy_terms.php" updateEndpoint="update_privacy_terms.php" deleteEndpoint="delete_privacy_terms.php"/>;
      case 'Rules & Policy':
        return <ContentSection title="Rules & Policy" getEndpoint="get_rules_policy.php" addEndpoint="add_rules_policy.php" updateEndpoint="update_rules_policy.php" deleteEndpoint="delete_rules_policy.php"/>;
      case 'Press Release':   return <PressRelease/>;
      case 'Media Gallery':   return <MediaGallery/>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {HOME_SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {renderSub()}
    </div>
  );
}

// ─── About Us ─────────────────────────────────────────────────────────────────

function AboutUs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_about_us.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setTitle(''); setDescription(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_about_us.php' : 'update_about_us.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_about_us.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">About Us</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','TITLE','DESCRIPTION','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add About Us' : 'Edit About Us'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"/></Field>
            <Field label="Description"><CustomEditor value={description} onChange={setDescription} placeholder="Description..."/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Why Exhibit ──────────────────────────────────────────────────────────────

function WhyExhibit() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_why_exhibit.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setTitle(''); setDescription(''); setFile(null); setPdfFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setTitle(row.title || ''); setDescription(row.description || ''); setFile(null); setPdfFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('image', file);
      if (pdfFile) fd.append('pdf', pdfFile);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_why_exhibit.php' : 'update_why_exhibit.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_why_exhibit.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Why Exhibit</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','TITLE','DESCRIPTION','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100 max-w-xs">
              <div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description }}/>
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Why Exhibit' : 'Edit Why Exhibit'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"/></Field>
            <Field label="Description"><CustomEditor value={description} onChange={setDescription} placeholder="Description..."/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
            <Field label="PDF (optional)"><FileInput accept=".pdf" onChange={e => setPdfFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Reusable Image+Title card section ───────────────────────────────────────

function ImageCardSection({ title, getEndpoint, addEndpoint, updateEndpoint, deleteEndpoint }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch(getEndpoint); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [getEndpoint]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setItemTitle(''); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setItemTitle(row.title || ''); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', itemTitle);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? addEndpoint : updateEndpoint, fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost(deleteEndpoint, { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','TITLE','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} ${title}`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Title"/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Home Exhibitor List ──────────────────────────────────────────────────────

function HomeExhibitorList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_home_exhibitor_list.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setFile(null); setModal(true); };
  const openEdit = (row) => { setEditing(row); setFile(null); setModal(true); };

  const handleSave = async () => {
    if (!file && !editing) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      if (editing) fd.append('id', editing.id);
      const res = await apiPostForm(editing ? 'update_home_exhibitor_list.php' : 'add_home_exhibitor_list.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(false);
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_home_exhibitor_list.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Home Exhibitor List</h3>
        <AddBtn onClick={openAdd} label="Add Logo"/>
      </div>
      <TableShell headers={['ID','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-20 object-contain rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={editing ? 'Edit Exhibitor Logo' : 'Add Exhibitor Logo'} onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
        </Modal>
      )}
    </div>
  );
}

// ─── Visitor Guide ────────────────────────────────────────────────────────────

function VisitorGuide() {
  const [sub, setSub] = useState('Main');
  const SUB_TABS = ['Main','Cards','Metro Maps'];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {sub === 'Main'       && <ContentSection title="Visitor Guide - Main" getEndpoint="get_visitor_guide.php" addEndpoint="add_visitor_guide.php" updateEndpoint="update_visitor_guide.php" deleteEndpoint="delete_visitor_guide.php"/>}
      {sub === 'Cards'      && <ImageCardSection title="Visitor Guide Cards" getEndpoint="get_visitor_guide_cards.php" addEndpoint="add_visitor_guide_card.php" updateEndpoint="update_visitor_guide_card.php" deleteEndpoint="delete_visitor_guide_card.php"/>}
      {sub === 'Metro Maps' && <ImageCardSection title="Metro Maps" getEndpoint="get_metro_maps.php" addEndpoint="add_metro_map.php" updateEndpoint="update_metro_map.php" deleteEndpoint="delete_metro_map.php"/>}
    </div>
  );
}

// ─── For Exhibitors ───────────────────────────────────────────────────────────

function ForExhibitors() {
  const [sub, setSub] = useState('Main');
  const SUB_TABS = ['Main','Cards'];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {sub === 'Main'  && <ContentSection title="For Exhibitors - Main" getEndpoint="get_for_exhibitors.php" addEndpoint="add_for_exhibitor.php" updateEndpoint="update_for_exhibitor.php" deleteEndpoint="delete_for_exhibitor.php"/>}
      {sub === 'Cards' && <ImageCardSection title="For Exhibitors Cards" getEndpoint="get_for_exhibitors_cards.php" addEndpoint="add_for_exhibitors_card.php" updateEndpoint="update_for_exhibitors_card.php" deleteEndpoint="delete_for_exhibitors_card.php"/>}
    </div>
  );
}

// ─── Outer Page ───────────────────────────────────────────────────────────────

function OuterPage() {
  return (
    <ContentSection
      title="Outer Page (Unsubscribe)"
      getEndpoint="get_outer_page.php"
      addEndpoint="add_outer_page.php"
      updateEndpoint="update_outer_page.php"
      deleteEndpoint="delete_outer_page.php"
    />
  );
}

// ─── Become An Exhibitor ──────────────────────────────────────────────────────

function BecomeAnExhibitor() {
  const [sub, setSub] = useState('Powering Future');
  const SUB_TABS = ['Powering Future','Why Exhibit'];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {sub === 'Powering Future' && <ContentSection title="Powering Future" getEndpoint="get_powering_future.php" addEndpoint="add_powering_future.php" updateEndpoint="update_powering_future.php" deleteEndpoint="delete_powering_future.php"/>}
      {sub === 'Why Exhibit'     && <ContentSection title="Why Exhibit" getEndpoint="get_become_exhibitor_why_exhibit.php" addEndpoint="add_become_exhibitor_why_exhibit.php" updateEndpoint="update_become_exhibitor_why_exhibit.php" deleteEndpoint="delete_become_exhibitor_why_exhibit.php"/>}
    </div>
  );
}

// ─── Exhibitor Login ──────────────────────────────────────────────────────────

function ExhibitorLogin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ heading: '', sub_heading: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_exhibitor_login_page.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ heading: '', sub_heading: '' }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ heading: row.heading || '', sub_heading: row.sub_heading || '' }); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('heading', form.heading);
      fd.append('sub_heading', form.sub_heading);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_exhibitor_login_page.php' : 'update_exhibitor_login_page.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_exhibitor_login_page.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Exhibitor Login</h3>
        <AddBtn onClick={openAdd}/>
      </div>
      <TableShell headers={['ID','HEADING','SUB HEADING','IMAGE','ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.heading}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-600">{row.sub_heading}</td>
            <td className="px-4 py-3 border-b border-zinc-100">
              {row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded"/>}
            </td>
            <td className="px-4 py-3 border-b border-zinc-100">
              <div className="flex gap-1.5">
                <EditBtn onClick={() => openEdit(row)}/>
                <DelBtn onClick={() => handleDelete(row.id)}/>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Exhibitor Login' : 'Edit Exhibitor Login'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Heading"><Input value={form.heading} onChange={e => setForm(p => ({ ...p, heading: e.target.value }))} placeholder="Heading"/></Field>
            <Field label="Sub Heading"><Input value={form.sub_heading} onChange={e => setForm(p => ({ ...p, sub_heading: e.target.value }))} placeholder="Sub Heading"/></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])}/></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MAIN_TABS = [
  'Landing page',
  'Home page',
  'About Us',
  'Why Exhibit',
  'Floating Card',
  'Home Exhibitor List',
  'Visitor Guide',
  'For Exhibitors',
  'Outer page',
  'Become An Exhibitor',
  'Exhibitor Login',
];

export default function WebsiteManagement() {
  const [activeTab, setActiveTab] = useState(MAIN_TABS[0]);

  const renderTab = () => {
    switch (activeTab) {
      case 'Landing page':        return <LandingPage/>;
      case 'Home page':           return <HomePage/>;
      case 'About Us':            return <AboutUs/>;
      case 'Why Exhibit':         return <WhyExhibit/>;
      case 'Floating Card':       return <FloatingCard/>;
      case 'Home Exhibitor List': return <HomeExhibitorList/>;
      case 'Visitor Guide':       return <VisitorGuide/>;
      case 'For Exhibitors':      return <ForExhibitors/>;
      case 'Outer page':          return <OuterPage/>;
      case 'Become An Exhibitor': return <BecomeAnExhibitor/>;
      case 'Exhibitor Login':     return <ExhibitorLogin/>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <h1 className="text-base font-bold text-zinc-800">Website Management</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Manage all website content from here</p>
      </div>

      {/* Tab Nav */}
      <div className="px-5 pt-3 pb-0 border-b border-zinc-100 overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12px] font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2
                ${activeTab === tab
                  ? 'text-blue-700 border-blue-600 bg-blue-50'
                  : 'text-zinc-500 border-transparent hover:text-zinc-700 hover:bg-zinc-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {renderTab()}
      </div>
    </div>
  );
}
