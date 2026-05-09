import { apiFetch, apiPost, apiPostForm } from './websiteBase';

/* ── Visitor Guide MAIN (single hero text) ── */
export const getVisitorGuideMain    = () => apiFetch('get_visitor_guide_main.php');
export const saveVisitorGuideMain   = (fd) => apiPostForm('save_visitor_guide_main.php', fd);

/* ── Visitor Guide CARDS (multi rows) ── */
export const getVisitorGuideCards   = () => apiFetch('get_visitor_guide_cards.php');
export const addVisitorGuideCard    = (fd) => apiPostForm('add_visitor_guide_card.php', fd);
export const updateVisitorGuideCard = (fd) => apiPostForm('update_visitor_guide_card.php', fd);
export const deleteVisitorGuideCard = (id) => apiPost('delete_visitor_guide_card.php', { id });

/* ── Metro Map (single image + description) ── */
export const getVisitorMetroMap     = () => apiFetch('get_visitor_metro_map.php');
export const saveVisitorMetroMap    = (fd) => apiPostForm('save_visitor_metro_map.php', fd);
