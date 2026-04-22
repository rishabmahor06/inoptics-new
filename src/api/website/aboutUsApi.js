import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getAboutUs = () => apiFetch('get_about_us.php');
export const addAboutUs = (fd) => apiPostForm('add_about_us.php', fd);
export const updateAboutUs = (fd) => apiPostForm('update_about_us.php', fd);
export const deleteAboutUs = (id) => apiPost('delete_about_us.php', { id });

export const getOurVision = () => apiFetch('get_our_vision.php');
export const addOurVision = (data) => apiPost('add_our_vision.php', data);
export const updateOurVision = (data) => apiPost('update_our_vision.php', data);
export const deleteOurVision = (id) => apiPost('delete_our_vision.php', { id });
