import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

// ─── New tab components ───────────────────────────────────────────────────────
import LandingPage      from '../components/websiteManagement/LandingPage/LandingPage';
import HomePage         from '../components/websiteManagement/HomePage/HomePage';
import AboutUsTab       from '../components/websiteManagement/AboutUs/AboutUsTab';
import WhyExhibitTab    from '../components/websiteManagement/WhyExhibit/WhyExhibitTab';
import FloatingCard     from '../components/websiteManagement/FloatingCard/FloatingCard';
import HomeExhibitorTab from '../components/websiteManagement/HomeExhibitor/HomeExhibitorTab';

import CustomEditor from '../components/CustomEditor/CustomEditor';

const API = 'https://inoptics.in/api';
const apiFetch    = (ep) => fetch(`${API}/${ep}`).then(r => r.json());
const apiPost     = (ep, data) => fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
const apiPostForm = (ep, fd) => fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());

// ─── Shared UI ────────────────────────────────────────────────────────────────

function AddBtn({ onClick, label = 'Add' }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-lg px-3.5 py-2 text-[13px] font-semibold hover:bg-blue-700 transition-colors">
      <MdAdd size={16} />{label}
    </button>
  );
}
function EditBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-green-100 transition-colors">
      <MdEdit size={13} />Edit
    </button>
  );
}
function DelBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold hover:bg-red-100 transition-colors">
      <MdDelete size={13} />Delete
    </button>
  );
}
function Modal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-base font-semibold text-zinc-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
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
          <tr>{headers.map(h => <th key={h} className="bg-zinc-900 text-white px-4 py-3 text-left font-semibold text-[11px] tracking-wider whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={headers.length} className="py-12 text-center text-zinc-400 text-sm">Loading...</td></tr>
          : empty ? <tr><td colSpan={headers.length} className="py-12 text-center text-zinc-400 text-sm">No records found.</td></tr>
          : children}
        </tbody>
      </table>
    </div>
  );
}
function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-zinc-300" />;
}
function FileInput({ onChange, accept = 'image/*' }) {
  return <input type="file" accept={accept} onChange={onChange} className="w-full text-sm text-zinc-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />;
}

// ─── Legacy components (kept for remaining tabs) ───────────────────────────────

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
      const payload = { ...(hasTitle ? { title: itemTitle } : {}), description: content, ...(modal === 'edit' ? { id: editing.id } : {}) };
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
        <AddBtn onClick={openAdd} />
      </div>
      <TableShell headers={hasTitle ? ['ID', 'TITLE', 'DESCRIPTION', 'ACTION'] : ['ID', 'DESCRIPTION', 'ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            {hasTitle && <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>}
            <td className="px-4 py-3 border-b border-zinc-100 max-w-sm"><div className="text-[13px] text-zinc-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: row.description || row.content || '' }} /></td>
            <td className="px-4 py-3 border-b border-zinc-100"><div className="flex gap-1.5"><EditBtn onClick={() => openEdit(row)} /><DelBtn onClick={() => handleDelete(row.id)} /></div></td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} ${title}`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {hasTitle && <Field label="Title"><Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Title" /></Field>}
            <Field label="Description"><CustomEditor value={content} onChange={setContent} placeholder="Content..." /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

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
        <AddBtn onClick={openAdd} />
      </div>
      <TableShell headers={['ID', 'TITLE', 'IMAGE', 'ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.title}</td>
            <td className="px-4 py-3 border-b border-zinc-100">{row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded" />}</td>
            <td className="px-4 py-3 border-b border-zinc-100"><div className="flex gap-1.5"><EditBtn onClick={() => openEdit(row)} /><DelBtn onClick={() => handleDelete(row.id)} /></div></td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} ${title}`} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title"><Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Title" /></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])} /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Visitor Guide ────────────────────────────────────────────────────────────

function VisitorGuide() {
  const [sub, setSub] = useState('Main');
  const SUB_TABS = ['Main', 'Cards', 'Metro Maps'];
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
      {sub === 'Main'       && <ContentSection title="Visitor Guide - Main" getEndpoint="get_visitor_guide.php" addEndpoint="add_visitor_guide.php" updateEndpoint="update_visitor_guide.php" deleteEndpoint="delete_visitor_guide.php" />}
      {sub === 'Cards'      && <ImageCardSection title="Visitor Guide Cards" getEndpoint="get_visitor_guide_cards.php" addEndpoint="add_visitor_guide_card.php" updateEndpoint="update_visitor_guide_card.php" deleteEndpoint="delete_visitor_guide_card.php" />}
      {sub === 'Metro Maps' && <ImageCardSection title="Metro Maps" getEndpoint="get_metro_maps.php" addEndpoint="add_visitor_metro_map.php" updateEndpoint="update_visitor_metro_map.php" deleteEndpoint="delete_visitor_metro_map.php" />}
    </div>
  );
}

// ─── For Exhibitors ───────────────────────────────────────────────────────────

function ForExhibitors() {
  const [sub, setSub] = useState('Main');
  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {['Main', 'Cards'].map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {sub === 'Main'  && <ContentSection title="For Exhibitors - Main" getEndpoint="get_for_exhibitors.php" addEndpoint="add_for_exhibitor.php" updateEndpoint="update_for_exhibitor.php" deleteEndpoint="delete_for_exhibitor.php" />}
      {sub === 'Cards' && <ImageCardSection title="For Exhibitors Cards" getEndpoint="get_for_exhibitors_cards.php" addEndpoint="add_exhibitors_card.php" updateEndpoint="update_exhibitors_card.php" deleteEndpoint="delete_exhibitors_card.php" />}
    </div>
  );
}

// ─── Become An Exhibitor ──────────────────────────────────────────────────────

function BecomeAnExhibitor() {
  const [sub, setSub] = useState('Powering Future');
  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap border-b border-zinc-200 pb-3">
        {['Powering Future', 'Why Exhibit'].map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${sub === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
            {t}
          </button>
        ))}
      </div>
      {sub === 'Powering Future' && <ContentSection title="Powering Future" getEndpoint="get_powering_future_become_an_exhibitor.php" addEndpoint="add_powering_future_become_an_exhibitor.php" updateEndpoint="update_powering_future_become_an_exhibitor.php" deleteEndpoint="delete_powering_future_become_an_exhibitor.php" />}
      {sub === 'Why Exhibit'     && <ContentSection title="Why Exhibit" getEndpoint="get_why_exhibit_become_an_exhibitor.php" addEndpoint="add_why_exhibit_become_an_exhibitor.php" updateEndpoint="update_why_exhibit_become_an_exhibitor.php" deleteEndpoint="delete_why_exhibit_become_an_exhibitor.php" />}
    </div>
  );
}

// ─── Outer Page ───────────────────────────────────────────────────────────────

function OuterPage() {
  return <ContentSection title="Outer Page (Unsubscribe)" getEndpoint="get_outer_page.php" addEndpoint="add_outer_page.php" updateEndpoint="update_outer_page.php" deleteEndpoint="delete_outer_page.php" />;
}

// ─── Exhibitor Login ──────────────────────────────────────────────────────────

function ExhibitorLogin() {
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ heading: '', sub_heading: '' });
  const [file, setFile]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch('get_exhibitor_login_page.php'); setRows(Array.isArray(d) ? d : []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ heading: '', sub_heading: '' }); setFile(null); setEditing(null); setModal('add'); };
  const openEdit = (row) => { setForm({ heading: row.heading || '', sub_heading: row.sub_heading || '' }); setFile(null); setEditing(row); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('heading', form.heading);
      fd.append('sub_heading', form.sub_heading);
      if (file) fd.append('image', file);
      if (modal === 'edit') fd.append('id', editing.id);
      const res = await apiPostForm(modal === 'add' ? 'add_exhibitor_login.php' : 'update_exhibitor_login.php', fd);
      toast.success(res.message || 'Saved'); load(); setModal(null);
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { const r = await apiPost('delete_exhibitor_login.php', { id }); toast.success(r.message || 'Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Exhibitor Login</h3>
        <AddBtn onClick={openAdd} />
      </div>
      <TableShell headers={['ID', 'HEADING', 'SUB HEADING', 'IMAGE', 'ACTION']} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <tr key={row.id} className={`hover:bg-zinc-50 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-400">{row.id}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] font-medium text-zinc-800">{row.heading}</td>
            <td className="px-4 py-3 border-b border-zinc-100 text-[13px] text-zinc-600">{row.sub_heading}</td>
            <td className="px-4 py-3 border-b border-zinc-100">{row.image && <img src={row.image} alt="" className="h-12 w-16 object-cover rounded" />}</td>
            <td className="px-4 py-3 border-b border-zinc-100"><div className="flex gap-1.5"><EditBtn onClick={() => openEdit(row)} /><DelBtn onClick={() => handleDelete(row.id)} /></div></td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Exhibitor Login' : 'Edit Exhibitor Login'} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Heading"><Input value={form.heading} onChange={e => setForm(p => ({ ...p, heading: e.target.value }))} placeholder="Heading" /></Field>
            <Field label="Sub Heading"><Input value={form.sub_heading} onChange={e => setForm(p => ({ ...p, sub_heading: e.target.value }))} placeholder="Sub Heading" /></Field>
            <Field label="Image"><FileInput onChange={e => setFile(e.target.files[0])} /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

const MAIN_TABS = [
  'Landing Page',
  'Home Page',
  'About Us',
  'Why Exhibit',
  'Floating Card',
  'Home Exhibitor',
  'Visitor Guide',
  'For Exhibitors',
  'Outer Page',
  'Become An Exhibitor',
  'Exhibitor Login',
];

export default function WebsiteManagement() {
  const [activeTab, setActiveTab] = useState(MAIN_TABS[0]);

  const renderTab = () => {
    switch (activeTab) {
      case 'Landing Page':        return <LandingPage />;
      case 'Home Page':           return <HomePage />;
      case 'About Us':            return <AboutUsTab />;
      case 'Why Exhibit':         return <WhyExhibitTab />;
      case 'Floating Card':       return <FloatingCard />;
      case 'Home Exhibitor':      return <HomeExhibitorTab />;
      case 'Visitor Guide':       return <VisitorGuide />;
      case 'For Exhibitors':      return <ForExhibitors />;
      case 'Outer Page':          return <OuterPage />;
      case 'Become An Exhibitor': return <BecomeAnExhibitor />;
      case 'Exhibitor Login':     return <ExhibitorLogin />;
      default:                    return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-screen">
      {/* Tab Nav */}
      <div className="border-b border-zinc-200 overflow-x-auto">
        <div className="flex min-w-max px-5 pt-3">
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-all mr-0.5
                ${activeTab === tab
                  ? 'text-blue-700 border-blue-600'
                  : 'text-zinc-500 border-transparent hover:text-zinc-800 hover:border-zinc-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTab()}
      </div>
    </div>
  );
}
