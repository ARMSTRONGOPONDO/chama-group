const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chama_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = (res) => res.data;
const handleError = (err) => {
  const status = err?.status ?? err?.response?.status;
  if (status === 401) {
    localStorage.removeItem('chama_token');
    localStorage.removeItem('chama_user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  throw err;
};

export const api = {
  get: (url, config = {}) =>
    fetch(`${API_BASE}${url}`, { ...config, headers: { ...getAuthHeaders(), ...config.headers } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .catch(handleError),
  post: (url, data, config = {}) =>
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...config.headers },
      body: JSON.stringify(data),
      ...config,
    })
      .then((r) => (r.ok ? (r.status === 204 ? null : r.json()) : Promise.reject(r)))
      .catch(handleError),
  put: (url, data, config = {}) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...config.headers },
      body: JSON.stringify(data),
      ...config,
    })
      .then((r) => (r.ok ? (r.status === 204 ? null : r.json()) : Promise.reject(r)))
      .catch(handleError),
  delete: (url, config = {}) =>
    fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: getAuthHeaders(), ...config })
      .then((r) => (r.ok ? (r.status === 204 ? null : r.json().catch(() => ({}))) : Promise.reject(r)))
      .catch(handleError),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  getProfile: () => api.get('/auth/me'),
};

export const membersApi = {
  getAll: () => api.get('/members'),
  getOne: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const savingsApi = {
  getAll: (params) => api.get('/savings' + (params ? `?${new URLSearchParams(params)}` : '')),
  getByMember: (memberId) => api.get(`/savings?memberId=${memberId}`),
  create: (data) => api.post('/savings', data),
};

export const loansApi = {
  getAll: () => api.get('/loans'),
  getOne: (id) => api.get(`/loans/${id}`),
  create: (data) => api.post('/loans', data),
  getRepayments: (loanId) => api.get(`/loans/${loanId}/repayments`),
};

export const repaymentsApi = {
  getAll: (params) => api.get('/repayments' + (params ? `?${new URLSearchParams(params)}` : '')),
  create: (data) => api.post('/repayments', data),
};

export const reportsApi = {
  getSummary: () => api.get('/reports/summary'),
  getSavingsGrowth: () => api.get('/reports/savings-growth'),
  getLoansIssued: () => api.get('/reports/loans-issued'),
  getInterestDistribution: () => api.get('/reports/interest-distribution'),
  getMemberBreakdown: () => api.get('/reports/member-breakdown'),
};
