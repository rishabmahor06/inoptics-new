const API = 'https://inoptics.in/api';
const post = (ep, data) =>
  fetch(`${API}/${ep}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const proformaApi = {
  getAddresses:     ()        => fetch(`${API}/get_invoice_addresses.php`).then(r => r.json()),
  saveAddress:      (data)    => post('update_invoice_address.php', data),
  deleteAddress:    (label)   => post('delete_invoice_address.php', { label }),
  setActiveAddress: (id)      => post('set_active_invoice_address.php', { id }),

  getServices:      ()        => fetch(`${API}/get_services.php`).then(r => r.json()),
  addService:       (data)    => post('add_service.php', data),
  updateService:    (data)    => post('update_service.php', data),
  deleteService:    (name)    => post('delete_service.php', { name }),
};
