import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getSponsors = () => apiFetch('get_sponsors.php');
export const addSponsor = (fd) => apiPostForm('add_sponsor.php', fd);
export const updateSponsor = (fd) => apiPostForm('update_sponsor.php', fd);
export const deleteSponsor = (id) => apiPost('delete_sponsor_image.php', { id });
