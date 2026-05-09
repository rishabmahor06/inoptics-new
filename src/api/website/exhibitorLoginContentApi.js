import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getExhibitorLoginContent    = () => apiFetch('get_exhibitor_login.php');
export const addExhibitorLoginContent    = (fd) => apiPostForm('add_exhibitor_login.php', fd);
export const updateExhibitorLoginContent = (fd) => apiPostForm('update_exhibitor_login.php', fd);
export const deleteExhibitorLoginContent = (id) => apiPost('delete_exhibitor_login.php', { id });
