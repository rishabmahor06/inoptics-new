import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getFooter = (n) => apiFetch(`get_footer_details${n}.php`);
export const addFooter = (n, fd) => apiPostForm(`add_footer_details${n}.php`, fd);
export const updateFooter = (n, fd) => apiPostForm(`update_footer_details${n}.php`, fd);
export const deleteFooter = (n, id) => apiPost(`delete_footer_details${n}.php`, { id });
