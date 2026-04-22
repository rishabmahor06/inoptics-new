const API = 'https://inoptics.in/api';
const post = (ep, data) =>
  fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const stallCategoriesApi = {
  getAll:  ()     => fetch(`${API}/get_stall_category.php`).then(r => r.json()),
  add:     (data) => post('add_stall_category.php', data),
  update:  (data) => post('update_stall_category.php', data),
  delete:  (id)   => post('delete_stall_category.php', { id }),
};
