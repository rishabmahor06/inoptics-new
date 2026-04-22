import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getPressRelease = () => apiFetch('get_pressrelease_details.php');
export const addPressRelease = (fd) => apiPostForm('add_pressrelease_details.php', fd);
export const updatePressRelease = (fd) => apiPostForm('update_pressrelease_details.php', fd);
export const deletePressRelease = (id) => apiPost('delete_pressrelease_details.php', { id });
