import { apiFetch, apiPost } from './websiteBase';

export const getRules = () => apiFetch('get_rules_details.php');
export const addRules = (data) => apiPost('add_rules_details.php', data);
export const updateRules = (data) => apiPost('update_rules_details.php', data);
export const deleteRules = (id) => apiPost('delete_rules_details.php', { id });
