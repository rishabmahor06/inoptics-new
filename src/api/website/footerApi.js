import { apiFetch, apiPost, apiPostForm } from './websiteBase';

// Footers 2 and 3 are text-only — backend only accepts JSON.
// Footers 1 and 4 have image uploads — backend accepts multipart FormData.
const isTextOnly = (n) => n === 2 || n === 3;

const fdToJson = (fd) => {
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = v;
  return obj;
};

export const getFooter = (n) => apiFetch(`get_footer_details${n}.php`);

export const addFooter = (n, fd) =>
  isTextOnly(n)
    ? apiPost(`add_footer_details${n}.php`, fdToJson(fd))
    : apiPostForm(`add_footer_details${n}.php`, fd);

export const updateFooter = (n, fd) =>
  isTextOnly(n)
    ? apiPost(`update_footer_details${n}.php`, fdToJson(fd))
    : apiPostForm(`update_footer_details${n}.php`, fd);

export const deleteFooter = (n, id) => apiPost(`delete_footer_details${n}.php`, { id });
