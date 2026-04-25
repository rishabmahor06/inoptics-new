import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getExhibitorsMain = () => apiFetch('get_exhibitors_main.php');
export const addExhibitorsMain = (fd) => apiPostForm('add_exhibitors_main.php', fd);
export const updateExhibitorsMain = (fd) => apiPostForm('update_exhibitors_main.php', fd);
export const deleteExhibitorsMain = (id) => apiPost('delete_exhibitors_main.php', { id });

export const getExhibitorsCards = () => apiFetch('get_exhibitors_cards.php');
export const addExhibitorsCard = (fd) => apiPostForm('add_exhibitors_card.php', fd);
export const updateExhibitorsCard = (fd) => apiPostForm('update_exhibitors_card.php', fd);
export const deleteExhibitorsCard = (id) => apiPost('delete_exhibitors_card.php', { id });
