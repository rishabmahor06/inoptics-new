import { apiFetch, apiPost, apiPostForm } from './websiteBase';

/* For Exhibitors MAIN (header + text) */
export const getForExhibitorsMain  = () => apiFetch('get_exhibitors_main.php');
export const saveForExhibitorsMain = (fd) => apiPostForm('save_exhibitors_main.php', fd);

/* For Exhibitors CARDS */
export const getForExhibitorsCards   = () => apiFetch('get_exhibitors_cards.php');
export const addForExhibitorCard     = (fd) => apiPostForm('add_exhibitors_card.php', fd);
export const updateForExhibitorCard  = (fd) => apiPostForm('update_exhibitors_card.php', fd);
export const deleteForExhibitorCard  = (id) => apiPost('delete_exhibitors_card.php', { id });
