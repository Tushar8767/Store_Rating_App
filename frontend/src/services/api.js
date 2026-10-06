const BASE = '/api';

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// One place that talks to the backend. Adds the JWT and turns errors into Error objects.
async function request(path, { method = 'GET', body, params } = {}) {
  const token = localStorage.getItem('token');
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    : '';

  let response;
  try {
    response = await fetch(BASE + path + query, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // 401 on a logged-in request means the token expired or is invalid
    if (response.status === 401 && token) onUnauthorized();
    const error = new Error(data.message || 'Something went wrong.');
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  changePassword: (body) => request('/users/password', { method: 'PUT', body }),

  getStores: (params) => request('/stores', { params }),
  createRating: (storeId, rating) => request(`/stores/${storeId}/rating`, { method: 'POST', body: { rating } }),
  updateRating: (storeId, rating) => request(`/stores/${storeId}/rating`, { method: 'PUT', body: { rating } }),

  adminDashboard: () => request('/admin/dashboard'),
  adminUsers: (params) => request('/admin/users', { params }),
  adminUser: (id) => request(`/admin/users/${id}`),
  adminCreateUser: (body) => request('/admin/users', { method: 'POST', body }),
  adminStores: (params) => request('/admin/stores', { params }),
  adminCreateStore: (body) => request('/admin/stores', { method: 'POST', body }),
  adminOwners: () => request('/admin/owners'),

  ownerDashboard: () => request('/owner/dashboard'),
};
