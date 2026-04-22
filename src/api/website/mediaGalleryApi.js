import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getMediaGallery = () => apiFetch('get_mediagallery_details.php');
export const addMediaGallery = (fd) => apiPostForm('add_mediagallery_details.php', fd);
export const deleteMediaGallery = (id) => apiPost('delete_mediagallery_details.php', { id });
