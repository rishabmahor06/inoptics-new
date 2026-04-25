export const API = 'https://inoptics.in/api';

/* Unwrap array from any common PHP response shape:
   - plain array
   - { data: [...] }
   - { records: [...] }
   - { items: [...] }
   - { <anyKey>: [...] }   ← picks the first (and only) array value
*/
function extractArr(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    for (const key of ['data', 'records', 'items', 'result', 'results']) {
      if (Array.isArray(json[key])) return json[key];
    }
    // Fallback: pick the first array value found
    const arrays = Object.values(json).filter(Array.isArray);
    if (arrays.length > 0) return arrays[0];
  }
  return json; // non-array responses (status messages etc.) returned unchanged
}

export const apiFetch = (ep) => fetch(`${API}/${ep}`).then(r => r.json()).then(extractArr);

export const apiPost = (ep, data) =>
  fetch(`${API}/${ep}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const apiPostForm = (ep, fd) =>
  fetch(`${API}/${ep}`, { method: 'POST', body: fd }).then(r => r.json());
