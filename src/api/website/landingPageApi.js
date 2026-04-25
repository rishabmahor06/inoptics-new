import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getSponsors = () => apiFetch('get_sponsor_images_list.php');
export const addSponsor    = (fd) => apiPostForm('upload_sponsor_image.php', fd);
export const updateSponsor = (fd) => apiPostForm('update_sponsor_image.php', fd);
export const deleteSponsor = (id) => apiPost('delete_sponsor_image.php', { id });
