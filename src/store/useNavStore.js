import { create } from 'zustand';

export const TAB_LABELS = {
  'dashboard':             'Dashboard',
  'exhibitor-dashboard':   'Exhibitor Dashboard',
  'exhibitors':            'Exhibitors',
  'promotes-brands':       'Promotes Your Brands',
  'fascia-name':           'Fascia Name',
  'exhibitor-power':       'Exhibitor Power',
  'exhibitor-history':     'Exhibitor History',
  'exhibitor-badges':      'Exhibitor Badges',
  'extra-furniture':       'Extra Furniture',
  'contractor-badges':     'Contractor Badges',
  'mandatory-forms':       'Exhibitor Mandatory Forms',
  'unlock-contractor':     'Unlock Contractor',
  'payments':              'Payments',
  'communication':         'Communication',
  'stalls-management':     'Stalls Management',
  'forms':                 'Forms',
  'masters':               'Masters',
  'website-management':    'Website Management',
  'contractor':            'Contractor',
  'new-exhibitor-request': 'New Exhibitor Request',
  'contact-support':       'Contact Support',
  'media':                 'Media',
  'export':                'Export',
};

export const useNavStore = create((set) => ({
  activeTab:       'dashboard',
  setActiveTab:    (tab) => set({ activeTab: tab, editingExhibitor: null, selectedPayment: null }),

  editingExhibitor:    null,
  setEditingExhibitor: (exhibitor) => set({ editingExhibitor: exhibitor }),

  selectedPayment:    null,
  setSelectedPayment: (payment) => set({ selectedPayment: payment }),

  communicationSubTab:    'emails',
  setCommunicationSubTab: (sub) => set({ activeTab: 'communication', communicationSubTab: sub }),

  masterSubTab:    'business_requirement',
  setMasterSubTab: (sub) => set({ activeTab: 'masters', masterSubTab: sub }),
}));
