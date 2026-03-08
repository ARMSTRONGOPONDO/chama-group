const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL}/api` : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chama_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const extractErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    if (payload?.message) return payload.message;
    if (payload?.error) return payload.error;
    return JSON.stringify(payload);
  } catch (err) {
    const text = await response.text().catch(() => '');
    return text || response.statusText || 'Request failed';
  }
};

const handleError = (error) => {
  const status = error?.status;
  if (status === 401) {
    localStorage.removeItem('chama_token');
    localStorage.removeItem('chama_user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  throw error;
};

const handleApiResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }
  const message = await extractErrorMessage(response);
  const error = new Error(message);
  error.status = response.status;
  throw error;
};

const mergeHeaders = (custom = {}, contentType = true) => ({
  ...(contentType ? { 'Content-Type': 'application/json' } : {}),
  ...getAuthHeaders(),
  ...custom,
});

export const api = {
  get: (url, config = {}) =>
    fetch(`${API_BASE}${url}`, { ...config, headers: mergeHeaders(config.headers, false) })
      .then(handleApiResponse)
      .catch(handleError),
  post: (url, data, config = {}) =>
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: mergeHeaders(config.headers),
      body: JSON.stringify(data),
      ...config,
    })
      .then(handleApiResponse)
      .catch(handleError),
  put: (url, data, config = {}) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: mergeHeaders(config.headers),
      body: JSON.stringify(data),
      ...config,
    })
      .then(handleApiResponse)
      .catch(handleError),
  delete: (url, config = {}) =>
    fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: mergeHeaders(config.headers, false), ...config })
      .then(handleApiResponse)
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
  create: (data) => api.post('/loans/apply', data),
  getRepayments: (loanId) => api.get(`/loans/${loanId}/repayments`),
};

export const repaymentsApi = {
  getAll: (params) => api.get('/repayments' + (params ? `?${new URLSearchParams(params)}` : '')),
  create: (data) => api.post('/repayments', data),
};

export const reportsApi = {
  getSummary: () => api.get('/reports/overview'),
  getSavingsGrowth: () => api.get('/reports/savings-growth'),
  getLoansIssued: () => api.get('/reports/loans-issued'),
  getInterestDistribution: () => api.get('/reports/interest-distribution'),
  getMemberBreakdown: () => api.get('/reports/member-breakdown'),
};
