const API = 'https://inoptics.in/api';
const post = (ep, data) =>
  fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const hallNumbersApi = {
  getAll:  ()     => fetch(`${API}/get_hall_numbers.php`).then(r => r.json()),
  add:     (data) => post('add_hall_number.php', data),
  update:  (data) => post('update_hall_number.php', data),
  delete:  (id)   => post('delete_hall_number.php', { id }),
};
