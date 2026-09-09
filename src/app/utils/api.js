import { clearPortalSession, getActivePortalRole, getActiveToken } from './authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const UPLOAD_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/role-select',
  '/forgot-password',
  '/reset-password',
  '/portal-gate',
  '/browse',
];

let isLoggingOut = false;

const clearSessionAndRedirect = () => {
  if (typeof window === 'undefined' || isLoggingOut) return;

  isLoggingOut = true;
  const role = getActivePortalRole();
  clearPortalSession(role);

  const pathname = `${window.location.pathname}${window.location.search}`;
  const onPublicPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!onPublicPage) {
    const next = encodeURIComponent(pathname);
    const roleQuery = role ? `&role=${encodeURIComponent(role)}` : '';
    window.location.href = `/role-select?next=${next}${roleQuery}`;
  } else {
    isLoggingOut = false;
  }
};

const handleUnauthorized = (endpoint, hadToken) => {
  // Don't treat failed login/register credentials as session expiry
  const isCredentialEndpoint =
    endpoint.startsWith('/auth/') && !endpoint.startsWith('/auth/profile');

  if (hadToken && !isCredentialEndpoint) {
    clearSessionAndRedirect();
  }
};

const request = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? getActiveToken() : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    handleUnauthorized(endpoint, !!token);
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    const detail = data.errors?.[0]?.msg;
    throw new Error(detail || data.message || 'Request failed');
  }

  return data;
};

const uploadRequest = async (endpoint, formData, method = 'POST') => {
  const token = typeof window !== 'undefined' ? getActiveToken() : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    handleUnauthorized(endpoint, !!token);
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const buildPropertyFormData = (form, photos, existingPhotos = []) => {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (key === 'confirmed') return;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'boolean') {
      formData.append(key, String(value));
    } else {
      formData.append(key, value ?? '');
    }
  });

  if (existingPhotos.length > 0) {
    formData.append(
      'keepPhotos',
      JSON.stringify(existingPhotos.map((p) => p.split('/').pop()))
    );
  }

  photos.forEach((p) => {
    if (p.file) formData.append('photos', p.file);
  });

  return formData;
};

export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${UPLOAD_BASE_URL}${path}`;
};

export const authApi = {
  getRoles: () => request('/auth/roles'),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  sendRegistrationOtp: (body) =>
    request('/auth/send-registration-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendLoginOtp: (body) => request('/auth/send-login-otp', { method: 'POST', body: JSON.stringify(body) }),
  loginWithOtp: (body) => request('/auth/login-otp', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  sendResetOtp: (body) => request('/auth/send-reset-otp', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPasswordOtp: (body) =>
    request('/auth/reset-password-otp', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

export const propertyApi = {
  getAvailable: () => request('/properties/available'),
  getMine: () => request('/properties/mine'),
  getStats: () => request('/properties/mine/stats'),
  getOne: (id) => request(`/properties/${id}`),
  create: (form, photos) =>
    uploadRequest('/properties', buildPropertyFormData(form, photos)),
  update: (id, form, photos, existingPhotos = []) =>
    uploadRequest(`/properties/${id}`, buildPropertyFormData(form, photos, existingPhotos), 'PUT'),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
};

export const requirementApi = {
  getMine: () => request('/requirements/mine'),
  getOne: (id) => request(`/requirements/${id}`),
  create: (body) => request('/requirements', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/requirements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/requirements/${id}`, { method: 'DELETE' }),
};

export const matchApi = {
  getRequirements: () => request('/matches/requirements'),
  getRequirement: (id) => request(`/matches/requirements/${id}`),
  send: (body) => request('/matches', { method: 'POST', body: JSON.stringify(body) }),
  getSellerMatches: () => request('/matches/seller/mine'),
  getSellerSiteVisits: () => request('/matches/seller/site-visits'),
  completeSellerVisit: (id) =>
    request(`/matches/seller/${id}/complete-visit`, { method: 'PATCH' }),
  getBuyerMatches: () => request('/matches/buyer/mine'),
  getBuyerStats: () => request('/matches/buyer/stats'),
  getBuyerSiteVisits: () => request('/matches/buyer/site-visits'),
  acceptBuyerMatch: (id) => request(`/matches/buyer/${id}/accept`, { method: 'PATCH' }),
  completeBuyerVisit: (id) =>
    request(`/matches/buyer/${id}/complete-visit`, { method: 'PATCH' }),
};
