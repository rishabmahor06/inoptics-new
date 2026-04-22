import { apiFetch, apiPost } from './websiteBase';

export const getPrivacy = () => apiFetch('get_privacy_details.php');
export const addPrivacy = (data) => apiPost('add_privacy_details.php', data);
export const updatePrivacy = (data) => apiPost('update_privacy_details.php', data);
export const deletePrivacy = (id) => apiPost('delete_privacy_details.php', { id });

export const getTerms = () => apiFetch('get_terms_details.php');
export const addTerms = (data) => apiPost('add_terms_details.php', data);
export const updateTerms = (data) => apiPost('update_terms_details.php', data);
export const deleteTerms = (id) => apiPost('delete_terms_details.php', { id });
