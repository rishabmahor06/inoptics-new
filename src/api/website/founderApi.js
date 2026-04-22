import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getFounders = () => apiFetch('get_founder_section.php');
export const addFounder = (fd) => apiPostForm('add_founder_section.php', fd);
export const updateFounder = (fd) => apiPostForm('update_founder_section.php', fd);
export const deleteFounder = (id) => apiPost('delete_founder_section.php', { id });
