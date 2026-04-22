export const API = 'https://inoptics.in/api';

export const apiFetch = (ep) => fetch(`${API}/${ep}`).then(r => r.json());

export const apiPost = (ep, data) =>
  fetch(`${API}/${ep}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const apiPostForm = (ep, fd) =>
  fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());
