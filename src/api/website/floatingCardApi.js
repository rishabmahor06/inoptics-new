import { apiFetch, apiPost } from './websiteBase';

export const getFloatingCards = () => apiFetch('get_floatingcard_details.php');
export const addFloatingCard = (data) => apiPost('add_floatingcard_details.php', data);
export const updateFloatingCard = (data) => apiPost('update_floatingcard_details.php', data);
export const deleteFloatingCard = (id) => apiPost('delete_floatingcard_details.php', { id });
