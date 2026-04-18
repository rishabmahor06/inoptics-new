import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ContractorRequirementModal from '../components/contractor/ContractorRequirementModal';

const API = 'https://inoptics.in/api';

const TABS = [
  'Contractors Requirement',
  'Booth Design',
  'Undertaking & Registration Fees',
  'Guidelines For Construction',
  'Unlock Exhibitors',
  'Contractor Badges',
  'Exhibitor Mandatory Forms',
];

const stepFormMap = { 1: 'appointed', 2: 'undertaking', 3: 'booth_design', 4: 'contractor_badge' };


export default function Contractor() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Shared
  const [exhibitorData, setExhibitorData] = useState([]);
  const [formsMap, setFormsMap] = useState({});
  const [boothIdMap, setBoothIdMap] = useState({});

  // Contractors Requirement
  const [contractorData, setContractorData] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSearch, setReqSearch] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editItem, setEditItem] = useState(null);

  // Unlock Exhibitors
  const [unlockRequests, setUnlockRequests] = useState([]);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  // Contractor Badges
  const [badgeRows, setBadgeRows] = useState([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [payments, setPayments] = useState({});
  const [paidRows, setPaidRows] = useState({});
  const [editPaymentRow, setEditPaymentRow] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgeProcessing, setBadgeProcessing] = useState(null);

  // Exhibitor Mandatory Forms
  const [stepRequests, setStepRequests] = useState({});
  const [formSearch, setFormSearch] = useState('');
  const [openCompany, setOpenCompany] = useState(null);
  const [stepLoading, setStepLoading] = useState(false);

  // Booth Design
  const [finalListData, setFinalListData] = useState([]);
  const [boothLoading, setBoothLoading] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedBoothId, setSelectedBoothId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Undertaking & Registration
  const [undertakingData, setUndertakingData] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [viewedUndertaking, setViewedUndertaking] = useState(null);
  const [viewedRegistration, setViewedRegistration] = useState(null);
  const [showAddUndertaking, setShowAddUndertaking] = useState(false);
  const [showEditUndertaking, setShowEditUndertaking] = useState(false);
  const [showAddRegistration, setShowAddRegistration] = useState(false);
  const [showEditRegistration, setShowEditRegistration] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [richText, setRichText] = useState('');

  // Guidelines
  const [guidelinesList, setGuidelinesList] = useState([]);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [guidelinesText, setGuidelinesText] = useState('');
  const [editingGuidelineIndex, setEditingGuidelineIndex] = useState(null);

  // ── Init ────────────────────────────────────────────────────
  useEffect(() => {
    fetchExhibitors();
    fetchFormsMap();
  }, []);

  useEffect(() => {
    if (activeTab === 'Contractors Requirement') fetchContractorRequirements();
    if (activeTab === 'Unlock Exhibitors') fetchUnlockRequests();
    if (activeTab === 'Contractor Badges') { fetchBadges(); fetchPayments(); }
    if (activeTab === 'Exhibitor Mandatory Forms') fetchStepRequests();
    if (activeTab === 'Booth Design') fetchFinalList();
    if (activeTab === 'Undertaking & Registration Fees') { fetchUndertakings(); fetchRegistrationFees(); }
    if (activeTab === 'Guidelines For Construction') fetchGuidelines();
  }, [activeTab]);

  // ── Shared Fetches ──────────────────────────────────────────
  const fetchExhibitors = async () => {
    try {
      const res = await fetch(`${API}/get_exhibitors.php`);
      const data = await res.json();
      setExhibitorData(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchFormsMap = async () => {
    try {
      const res = await fetch(`${API}/get_all_uploaded_exhibitor_forms.php`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) return;
      const grouped = {};
      const boothIds = {};
      json.data.forEach((row) => {
        const company = row.exhibitor_company_name?.trim();
        if (!company) return;
        if (!grouped[company]) grouped[company] = [];
        grouped[company].push(row);
        if (row.booth_design?.trim()) boothIds[company] = row.id;
      });
      setFormsMap(grouped);
      setBoothIdMap(boothIds);
    } catch {}
  };

  // ── Contractors Requirement ─────────────────────────────────
  const fetchContractorRequirements = async () => {
    setReqLoading(true);
    try {
      const res = await fetch(`${API}/get_contractor_requirement.php`);
      const data = await res.json();
      setContractorData(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load'); }
    finally { setReqLoading(false); }
  };

const deleteContractorReq = async (id) => {
    if (!window.confirm('Delete this contractor?')) return;
    try {
      const res = await fetch(`${API}/delete_contractor_requirement.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      toast.success(data.message || 'Deleted');
      fetchContractorRequirements();
    } catch { toast.error('Error deleting'); }
  };

  const exportContractorsToExcel = () => {
    if (!contractorData.length) { toast.error('No data to export'); return; }
    const ws = XLSX.utils.json_to_sheet(contractorData.map((item, i) => ({
      ID: i + 1, 'Company Name': item.company_name, Name: item.name,
      City: item.city, Pincode: item.pincode, Mobile: item.mobile_numbers,
      Email: item.email, Address: item.address, State: item.state,
      Phone: item.phone_numbers,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contractors');
    XLSX.writeFile(wb, 'Contractors_Requirement.xlsx');
    toast.success('Exported successfully');
  };

  // ── Unlock Exhibitors ───────────────────────────────────────
  const fetchUnlockRequests = async () => {
    setUnlockLoading(true);
    try {
      const res = await fetch(`${API}/admin_unlock_requests.php`);
      const data = await res.json();
      setUnlockRequests(Array.isArray(data) ? data : data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setUnlockLoading(false); }
  };

  const handleUnlockExhibitor = async (company) => {
    if (!window.confirm(`Unlock contractor form for ${company}?`)) return;
    setProcessing(company);
    try {
      const res = await fetch(`${API}/admin_unlock_contractor.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitor_company: company }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Unlocked successfully!');
        setUnlockRequests(prev => prev.filter(i => i.exhibitor_company !== company));
      } else toast.error('Unlock failed');
    } catch { toast.error('Server error'); }
    finally { setProcessing(null); }
  };

  // ── Contractor Badges ───────────────────────────────────────
  const getKey = (row) =>
    row.exhibitor_company_name?.trim().toLowerCase() + '_' + row.contractor_company_name?.trim().toLowerCase();

  const fetchBadges = async () => {
    setBadgeLoading(true);
    try {
      const res = await fetch(`${API}/get_all_contractor_badges.php`);
      const data = await res.json();
      setBadgeRows(data.success && Array.isArray(data.records) ? data.records : []);
    } catch { toast.error('Failed to load badges'); }
    finally { setBadgeLoading(false); }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API}/fetch_all_exhibitor_contractor_payments.php`);
      const data = await res.json();
      if (data.success) { setPayments(data.payments || {}); setPaidRows(data.paidRows || {}); }
    } catch {}
  };

  const handlePaymentChange = (key, value) =>
    setPayments(prev => ({ ...prev, [key]: { ...(prev[key] || {}), payment: value } }));

  const getStallNo = (companyName) =>
    exhibitorData.find(ex => ex.company_name?.trim().toLowerCase() === companyName?.trim().toLowerCase())?.stall_no || '-';

  const handlePaymentSubmit = async (row) => {
    const key = getKey(row);
    try {
      const res = await fetch(`${API}/exhibitor_contractor_payments.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: row.exhibitor_company_name,
          stall_no: getStallNo(row.exhibitor_company_name),
          contractor_name: row.contractor_company_name,
          badge_quantity: row.badge_quantity,
          payment: payments[key]?.payment ?? '',
        }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Payment saved'); setPaidRows(prev => ({ ...prev, [key]: true })); fetchPayments(); }
    } catch { toast.error('Server error'); }
  };

  const handlePaymentUpdate = async (row) => {
    const key = getKey(row);
    const paymentData = payments[key];
    if (!paymentData?.id) { toast.error('Payment ID missing'); return; }
    try {
      const res = await fetch(`${API}/update_exhibitor_contractor_payments.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: paymentData.id,
          company_name: row.exhibitor_company_name,
          contractor_name: row.contractor_company_name,
          stall_no: getStallNo(row.exhibitor_company_name),
          badge_quantity: row.badge_quantity,
          payment: paymentData.payment,
        }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Updated'); setEditPaymentRow(prev => ({ ...prev, [key]: false })); fetchPayments(); }
      else toast.error(data.message || 'Update failed');
    } catch { toast.error('Server error'); }
  };

  const handleBadgeUnlock = async (id, row) => {
    setBadgeProcessing(id);
    try {
      const res = await fetch(`${API}/unlock_contractor_badge.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Badge unlocked');
        fetchBadges();
        fetch(`${API}/send_power_unlocked_mail.php`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_name: row.exhibitor_company_name, email: row.exhibitor_email || '', template_name: 'InOptics 2026 @ Contractor Badge Unlock' }),
        });
      } else toast.error(data.message || 'Unlock failed');
    } catch { toast.error('Server error'); }
    finally { setBadgeProcessing(null); }
  };

  const handleBadgeDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${API}/delete_contractor_badge.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Deleted'); fetchBadges(); }
      else toast.error('Delete failed');
    } catch { toast.error('Server error'); }
  };

  const handleBadgeUpdate = async () => {
    try {
      const res = await fetch(`${API}/update_contractor_badge.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) { toast.success('Updated'); setShowEditPopup(false); fetchBadges(); }
      else toast.error('Update failed');
    } catch { toast.error('Server error'); }
  };

  const exportBadgesToExcel = () => {
    if (!badgeRows.length) { toast.error('No data'); return; }
    const exportData = badgeRows.map((row, i) => {
      const lockStatus = Number(row.is_locked);
      const key = getKey(row);
      return {
        ID: i + 1, 'Exhibitor Company': row.exhibitor_company_name,
        'Contractor Company': row.contractor_company_name,
        'Stall No': getStallNo(row.exhibitor_company_name),
        'Badge Quantity': row.badge_quantity,
        Payment: payments[key]?.payment || 0,
        Status: lockStatus === 0 ? 'Unlocked' : lockStatus === 2 ? 'Requested' : 'Locked',
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contractor Badges');
    XLSX.writeFile(wb, 'Contractor_Badge_Report.xlsx');
    toast.success('Exported');
  };

  // ── Exhibitor Mandatory Forms ───────────────────────────────
  const fetchStepRequests = async () => {
    setStepLoading(true);
    try {
      const res = await fetch(`${API}/get_all_contractor_unlock_requests.php`);
      const data = await res.json();
      if (data.success) setStepRequests(data.data || {});
    } catch { toast.error('Fetch failed'); }
    finally { setStepLoading(false); }
  };

  const updateStepStatus = async (company, step) => {
    const fd = new FormData();
    fd.append('exhibitor_company_name', company);
    fd.append('step_number', step);
    fd.append('status', 'approved');
    try {
      const res = await fetch(`${API}/admin_contractor_step_unlock.php`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { toast.success('Unlocked'); fetchStepRequests(); }
    } catch { toast.error('Update failed'); }
  };

  // ── Booth Design ────────────────────────────────────────────
  const fetchFinalList = async () => {
    setBoothLoading(true);
    try {
      const res = await fetch(`${API}/get_all_contractor_badges.php`);
      const data = await res.json();
      setFinalListData(data.success && Array.isArray(data.records) ? data.records : []);
    } catch {}
    finally { setBoothLoading(false); }
  };

  const approveBooth = async (company) => {
    try {
      const res = await fetch(`${API}/approve_booth_design.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitor_company_name: company }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Booth approved'); fetchFinalList(); fetchFormsMap(); }
      else toast.error(data.message || 'Approve failed');
    } catch { toast.error('Server error'); }
  };

  const handleRejectBooth = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    try {
      const res = await fetch(`${API}/reject_booth_design.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBoothId, reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Rejected'); setShowRejectPopup(false); setRejectReason(''); fetchFinalList(); }
      else toast.error('Reject failed');
    } catch { toast.error('Server error'); }
    finally { setRejecting(false); }
  };

  // ── Undertaking & Registration Fees ────────────────────────
  const fetchUndertakings = async () => {
    try {
      const res = await fetch(`${API}/get_contractor_undertaking.php`);
      const data = await res.json();
      setUndertakingData(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchRegistrationFees = async () => {
    try {
      const res = await fetch(`${API}/get_registration_fees.php`);
      const data = await res.json();
      setRegistrationData(Array.isArray(data) ? data : []);
    } catch {}
  };

  const addUndertaking = async () => {
    try {
      const res = await fetch(`${API}/add_contractor_undertaking.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declaration_text: richText }),
      });
      const data = await res.json();
      toast.success(data.message || 'Added');
      setShowAddUndertaking(false); setRichText(''); fetchUndertakings();
    } catch { toast.error('Error adding'); }
  };

  const updateUndertaking = async () => {
    const item = undertakingData[selectedItemIndex];
    if (!item) return;
    try {
      const res = await fetch(`${API}/update_contractor_undertaking.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, declaration_text: richText }),
      });
      const data = await res.json();
      toast.success(data.message || 'Updated');
      setShowEditUndertaking(false); fetchUndertakings();
    } catch { toast.error('Error updating'); }
  };

  const deleteUndertaking = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      const res = await fetch(`${API}/delete_contractor_undertaking.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      toast.success(data.message || 'Deleted'); fetchUndertakings();
    } catch { toast.error('Error'); }
  };

  const addRegistrationFee = async () => {
    try {
      const res = await fetch(`${API}/add_registration_fees.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declaration_text: richText }),
      });
      const data = await res.json();
      toast.success(data.message || 'Added');
      setShowAddRegistration(false); setRichText(''); fetchRegistrationFees();
    } catch { toast.error('Error adding'); }
  };

  const updateRegistrationFee = async () => {
    const item = registrationData[selectedItemIndex];
    if (!item) return;
    try {
      const res = await fetch(`${API}/update_registration_fees.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, declaration_text: richText }),
      });
      const data = await res.json();
      toast.success(data.message || 'Updated');
      setShowEditRegistration(false); fetchRegistrationFees();
    } catch { toast.error('Error updating'); }
  };

  const deleteRegistrationFee = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      const res = await fetch(`${API}/delete_registration_fees.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      toast.success(data.message || 'Deleted'); fetchRegistrationFees();
    } catch { toast.error('Error'); }
  };

  // ── Guidelines ──────────────────────────────────────────────
  const fetchGuidelines = async () => {
    try {
      const res = await fetch(`${API}/get_guidelines_for_construction.php`);
      const data = await res.json();
      setGuidelinesList(
        Array.isArray(data)
          ? data.map(d => d.content || d.declaration_text || d.guideline || d.text || '')
          : []
      );
    } catch {}
  };

  const saveGuideline = async () => {
    const isEdit = editingGuidelineIndex !== null;
    const url = isEdit ? `${API}/update_guidelines_for_construction.php` : `${API}/add_guidelines_for_construction.php`;
    try {
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: guidelinesText }),
      });
      const data = await res.json();
      toast.success(isEdit ? 'Updated' : 'Added');
      setShowGuidelinesModal(false); setGuidelinesText(''); fetchGuidelines();
    } catch { toast.error('Error saving'); }
  };

  const deleteGuideline = async () => {
    if (!window.confirm('Delete guideline?')) return;
    try {
      const res = await fetch(`${API}/delete_guidelines_for_construction.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: 0 }),
      });
      const data = await res.json();
      toast.success(data.message || 'Deleted'); fetchGuidelines();
    } catch { toast.error('Error'); }
  };

  // ── Derived ─────────────────────────────────────────────────
  const filteredContractors = contractorData.filter(item =>
    item.name?.toLowerCase().includes(reqSearch.toLowerCase()) ||
    item.company_name?.toLowerCase().includes(reqSearch.toLowerCase())
  );

  const filteredBadges = badgeRows.filter(row => {
    const t = badgeSearch.toLowerCase();
    return row.exhibitor_company_name?.toLowerCase().includes(t) || row.contractor_company_name?.toLowerCase().includes(t);
  });

  const filteredFormsCompanies = Object.entries(formsMap).filter(([company]) =>
    company.toLowerCase().includes(formSearch.toLowerCase())
  );

  const closeAllForms = () => {
    setShowAddUndertaking(false); setShowEditUndertaking(false);
    setShowAddRegistration(false); setShowEditRegistration(false);
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 overflow-x-auto">
        <ul className="flex min-w-max">
          {TABS.map(tab => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 sm:p-6">

        {/* ═══════════════════════════════════════════════════
            CONTRACTORS REQUIREMENT
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Contractors Requirement' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or company..."
                  value={reqSearch}
                  onChange={e => setReqSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportContractorsToExcel}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Excel
                </button>
                <button
                  onClick={() => { setEditItem(null); setModalMode('add'); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Contractor
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                  <tr>
                    {['ID', 'Company Name', 'Name', 'City', 'Pincode', 'Mobile', 'Email', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reqLoading ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">Loading...</td></tr>
                  ) : filteredContractors.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">No data found</td></tr>
                  ) : filteredContractors.map((item, i) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">{item.company_name}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{item.city}</td>
                      <td className="px-4 py-3 text-zinc-600">{item.pincode}</td>
                      <td className="px-4 py-3 text-zinc-600">{item.mobile_numbers}</td>
                      <td className="px-4 py-3 text-zinc-600 max-w-[180px] break-words">{item.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditItem(item); setModalMode('edit'); }}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors"
                          >Edit</button>
                          <button
                            onClick={() => deleteContractorReq(item.id)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors"
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Modal */}
            {modalMode && (
              <ContractorRequirementModal
                mode={modalMode}
                editItem={editItem}
                onClose={() => { setModalMode(null); setEditItem(null); }}
                onSuccess={fetchContractorRequirements}
              />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            BOOTH DESIGN
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Booth Design' && (
          <div>
            {boothLoading ? (
              <div className="flex items-center justify-center py-12 text-zinc-400 text-sm">Loading...</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                    <tr>
                      {['ID', 'Exhibitor', 'Contractor', 'Badges', 'Booth Design', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {finalListData.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No data found</td></tr>
                    ) : finalListData.map((item, i) => {
                      const company = item.exhibitor_company_name?.trim();
                      const forms = formsMap[company] || [];
                      const boothId = boothIdMap[company] || null;
                      const boothFile = forms.find(f => f.booth_design?.trim());
                      return (
                        <tr key={i} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">{company}</td>
                          <td className="px-4 py-3 text-zinc-700">{item.contractor_name || item.contractor_company_name}</td>
                          <td className="px-4 py-3 text-zinc-600">{item.badge_quantity || '—'}</td>
                          <td className="px-4 py-3">
                            {boothFile ? (
                              <a
                                href={`https://inoptics.in/api/${boothFile.booth_design}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md font-medium transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </a>
                            ) : <span className="text-zinc-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'rejected' ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveBooth(company)}
                                className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-medium transition-colors"
                              >Approve</button>
                              <button
                                onClick={() => {
                                  if (!boothId) { alert('Booth design not found'); return; }
                                  setSelectedBoothId(boothId); setSelectedCompany(company);
                                  setRejectReason(''); setShowRejectPopup(true);
                                }}
                                className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors"
                              >Reject</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reject Popup */}
            {showRejectPopup && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-base font-semibold text-zinc-800 mb-1">Reject Booth Design</h3>
                  <p className="text-sm text-zinc-500 mb-4">Enter the reason for rejecting this booth design.</p>
                  <textarea
                    rows={4}
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setShowRejectPopup(false); setRejectReason(''); }}
                      disabled={rejecting}
                      className="flex-1 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors"
                    >Cancel</button>
                    <button
                      onClick={handleRejectBooth}
                      disabled={!rejectReason.trim() || rejecting}
                      className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                    >{rejecting ? 'Rejecting...' : 'Reject Booth Design'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            UNDERTAKING & REGISTRATION FEES
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Undertaking & Registration Fees' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => { closeAllForms(); setShowAddUndertaking(true); setRichText(''); }}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Undertaking
              </button>
              <button
                onClick={() => { closeAllForms(); setShowAddRegistration(true); setRichText(''); }}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Registration Fee
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-1/2">Undertaking Content</th>
                    <th className="px-4 py-3 text-left font-semibold w-1/2">Registration Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {undertakingData.length === 0 && registrationData.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-10 text-center text-zinc-400">No data found</td></tr>
                  ) : Array.from({ length: Math.max(undertakingData.length, registrationData.length) }).map((_, i) => {
                    const u = undertakingData[i];
                    const r = registrationData[i];
                    return (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 border-r border-zinc-100">
                          {u?.declaration_text ? (
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <span className="text-zinc-700 font-medium text-sm">Contractor Undertaking - {i + 1}</span>
                              <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => setViewedUndertaking(u.declaration_text)} className="px-2.5 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md font-medium transition-colors">View</button>
                                <button onClick={() => { closeAllForms(); setSelectedItemIndex(i); setRichText(u.declaration_text || ''); setShowEditUndertaking(true); }} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors">Edit</button>
                                <button onClick={() => deleteUndertaking(u.id)} className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors">Delete</button>
                              </div>
                            </div>
                          ) : <span className="text-zinc-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {r?.declaration_text ? (
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <span className="text-zinc-700 font-medium text-sm">Registration Fee - {i + 1}</span>
                              <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => setViewedRegistration(r.declaration_text)} className="px-2.5 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md font-medium transition-colors">View</button>
                                <button onClick={() => { closeAllForms(); setSelectedItemIndex(i); setRichText(r.declaration_text || ''); setShowEditRegistration(true); }} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors">Edit</button>
                                <button onClick={() => deleteRegistrationFee(r.id)} className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors">Delete</button>
                              </div>
                            </div>
                          ) : <span className="text-zinc-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add/Edit Form */}
            {(showAddUndertaking || showEditUndertaking || showAddRegistration || showEditRegistration) && (
              <div className="mt-5 p-5 border border-zinc-200 rounded-xl bg-zinc-50">
                <h3 className="text-base font-semibold text-zinc-800 mb-3">
                  {showAddUndertaking ? 'Add Contractor Undertaking'
                    : showEditUndertaking ? 'Edit Contractor Undertaking'
                    : showAddRegistration ? 'Add Registration Fee'
                    : 'Edit Registration Fee'}
                </h3>
                <textarea
                  rows={8}
                  value={richText}
                  onChange={e => setRichText(e.target.value)}
                  placeholder="Enter content here (HTML supported)..."
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono bg-white"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={showAddUndertaking ? addUndertaking : showEditUndertaking ? updateUndertaking : showAddRegistration ? addRegistrationFee : updateRegistrationFee}
                    className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >{(showAddUndertaking || showAddRegistration) ? 'Add' : 'Update'}</button>
                  <button onClick={closeAllForms} className="px-5 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-medium transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* View Modals */}
            {viewedUndertaking && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <h3 className="text-base font-semibold text-zinc-800 mb-4">Viewing Contractor Undertaking</h3>
                  <div className="overflow-y-auto flex-1 text-sm text-zinc-700 border border-zinc-100 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: viewedUndertaking }} />
                  <button onClick={() => setViewedUndertaking(null)} className="mt-4 px-5 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-medium transition-colors self-end">Close</button>
                </div>
              </div>
            )}
            {viewedRegistration && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                  <h3 className="text-base font-semibold text-zinc-800 mb-4">Viewing Registration Fees</h3>
                  <div className="overflow-y-auto flex-1 text-sm text-zinc-700 border border-zinc-100 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: viewedRegistration }} />
                  <button onClick={() => setViewedRegistration(null)} className="mt-4 px-5 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-medium transition-colors self-end">Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            GUIDELINES FOR CONSTRUCTION
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Guidelines For Construction' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-800">Contractors Guidelines</h3>
              <div className="flex gap-2">
                {guidelinesList.length === 0 ? (
                  <button
                    onClick={() => { setGuidelinesText(''); setEditingGuidelineIndex(null); setShowGuidelinesModal(true); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setGuidelinesText(guidelinesList[0] || ''); setEditingGuidelineIndex(0); setShowGuidelinesModal(true); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={deleteGuideline}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border border-zinc-200 rounded-xl p-5 min-h-[200px]">
              {guidelinesList.length === 0 ? (
                <p className="text-zinc-400 text-sm">No guidelines added.</p>
              ) : (
                <div className="text-sm text-zinc-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: guidelinesList[0] }} />
              )}
            </div>

            {showGuidelinesModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
                  <h3 className="text-base font-semibold text-zinc-800 mb-4">
                    {editingGuidelineIndex !== null ? 'Edit Guideline' : 'Add Guideline'}
                  </h3>
                  <textarea
                    rows={10}
                    value={guidelinesText}
                    onChange={e => setGuidelinesText(e.target.value)}
                    placeholder="Enter guidelines content (HTML supported)..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveGuideline} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                      {editingGuidelineIndex !== null ? 'Update' : 'Add'}
                    </button>
                    <button onClick={() => setShowGuidelinesModal(false)} className="px-5 py-2 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-medium transition-colors">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            UNLOCK EXHIBITORS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Unlock Exhibitors' && (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                <tr>
                  {['ID', 'Exhibitor Company', 'Exhibitor Email', 'Contractor Name', 'Contractor Email', 'Requested At', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {unlockLoading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">Loading...</td></tr>
                ) : unlockRequests.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">No unlock requests</td></tr>
                ) : unlockRequests.map((req, i) => (
                  <tr key={req.exhibitor_company || i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">{req.exhibitor_company}</td>
                    <td className="px-4 py-3 text-zinc-600">{req.exhibitor_email}</td>
                    <td className="px-4 py-3 text-zinc-600">{req.contractor_name}</td>
                    <td className="px-4 py-3 text-zinc-600 max-w-[160px] break-words">{req.contractor_email}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{req.requested_at}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnlockExhibitor(req.exhibitor_company)}
                        disabled={processing === req.exhibitor_company}
                        className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-md font-medium transition-colors"
                      >
                        {processing === req.exhibitor_company ? 'Unlocking...' : 'Unlock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            CONTRACTOR BADGES
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Contractor Badges' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Exhibitor / Contractor..."
                  value={badgeSearch}
                  onChange={e => setBadgeSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={exportBadgesToExcel}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Excel
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                  <tr>
                    {['ID', 'Exhibitor Company', 'Stall No', 'Contractor Company', 'Badge Qty', 'Status', 'Payment', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {badgeLoading ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">Loading...</td></tr>
                  ) : filteredBadges.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">No badge records</td></tr>
                  ) : filteredBadges.map((row, i) => {
                    const lockStatus = Number(row.is_locked);
                    const key = getKey(row);
                    const stall_no = getStallNo(row.exhibitor_company_name);
                    return (
                      <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">{row.exhibitor_company_name}</td>
                        <td className="px-4 py-3 text-zinc-600">{stall_no}</td>
                        <td className="px-4 py-3 text-zinc-600">{row.contractor_company_name}</td>
                        <td className="px-4 py-3 text-zinc-600 text-center">{row.badge_quantity}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            lockStatus === 0 ? 'bg-emerald-100 text-emerald-700'
                              : lockStatus === 2 ? 'bg-amber-100 text-amber-700'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {lockStatus === 0 ? 'Unlocked' : lockStatus === 2 ? 'Requested' : 'Locked'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 min-w-[130px]">
                            <textarea
                              rows={2}
                              value={payments[key]?.payment || ''}
                              disabled={paidRows[key] && !editPaymentRow[key]}
                              onChange={e => handlePaymentChange(key, e.target.value)}
                              className="px-2 py-1 text-xs border border-zinc-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-zinc-50 disabled:text-zinc-500"
                            />
                            {!paidRows[key] ? (
                              <button onClick={() => handlePaymentSubmit(row)} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">Submit</button>
                            ) : editPaymentRow[key] ? (
                              <button onClick={() => handlePaymentUpdate(row)} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors">Save</button>
                            ) : (
                              <button onClick={() => setEditPaymentRow(prev => ({ ...prev, [key]: true }))} className="px-2 py-1 text-xs bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-md font-medium transition-colors">Edit</button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => { setEditData({ ...row }); setShowEditPopup(true); }} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium transition-colors">Edit</button>
                            <button onClick={() => handleBadgeDelete(row.id)} className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors">Delete</button>
                            {lockStatus === 2 && (
                              <button
                                onClick={() => handleBadgeUnlock(row.id, row)}
                                disabled={badgeProcessing === row.id}
                                className="px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 rounded-md font-medium transition-colors"
                              >
                                {badgeProcessing === row.id ? '...' : 'Unlock'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit Badge Popup */}
            {showEditPopup && editData && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                  <h3 className="text-base font-semibold text-zinc-800 mb-4">Edit Contractor Badge</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Contractor Company</label>
                      <input
                        type="text"
                        value={editData.contractor_company_name || ''}
                        onChange={e => setEditData({ ...editData, contractor_company_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1">Badge Quantity</label>
                      <input
                        type="number"
                        value={editData.badge_quantity || ''}
                        onChange={e => setEditData({ ...editData, badge_quantity: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setShowEditPopup(false)} className="flex-1 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors">Cancel</button>
                    <button onClick={handleBadgeUpdate} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            EXHIBITOR MANDATORY FORMS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'Exhibitor Mandatory Forms' && (
          <div>
            <div className="relative mb-4 max-w-xs">
              <input
                type="text"
                placeholder="Search company..."
                value={formSearch}
                onChange={e => setFormSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {stepLoading && <div className="py-10 text-center text-zinc-400 text-sm">Loading...</div>}
            {!stepLoading && filteredFormsCompanies.length === 0 && (
              <div className="py-10 text-center text-zinc-400 text-sm">No data found</div>
            )}

            <div className="space-y-3">
              {filteredFormsCompanies.map(([company, forms]) => (
                <div key={company} className="border border-zinc-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
                    onClick={() => setOpenCompany(openCompany === company ? null : company)}
                  >
                    <span className="font-medium text-zinc-800 text-sm">{company}</span>
                    <svg className={`w-4 h-4 text-zinc-400 transition-transform ${openCompany === company ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openCompany === company && (
                    <div className="p-4">
                      <div className="overflow-x-auto rounded-lg border border-zinc-100">
                        <table className="w-full text-sm">
                          <thead className="bg-zinc-50 text-zinc-600 text-xs uppercase tracking-wide">
                            <tr>
                              {['Step', 'Form Type', 'View', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {forms.map((form) => {
                              const stepNumber = Object.keys(stepFormMap).find(k => stepFormMap[k] === form.form_type);
                              const companyRequests = stepRequests[company] || [];
                              const matchedRequest = companyRequests.find(r => r.step_number == stepNumber);
                              return (
                                <tr key={form.id} className="hover:bg-zinc-50">
                                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{stepNumber ? `Step ${stepNumber}` : '—'}</td>
                                  <td className="px-4 py-3 text-zinc-700 font-medium capitalize">{form.form_type}</td>
                                  <td className="px-4 py-3">
                                    <a
                                      href={form.file_preview_url || `https://inoptics.in/api/${form.file_path}`}
                                      target="_blank" rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-md font-medium transition-colors"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </a>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                      matchedRequest?.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                                        : matchedRequest?.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                        : 'bg-zinc-100 text-zinc-500'
                                    }`}>
                                      {matchedRequest?.status || 'locked'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {matchedRequest?.status === 'pending' && (
                                      <button
                                        onClick={() => updateStepStatus(company, stepNumber)}
                                        className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-medium transition-colors"
                                      >Unlock</button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
