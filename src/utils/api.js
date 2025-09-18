// Lightweight API client for NoteZ
// - Uses fetch with sensible defaults
// - Injects Authorization header when token is provided
// - No localStorage usage; token is provided by AuthContext at runtime

const DEFAULT_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const getBaseUrl = () => DEFAULT_BASE_URL;

const buildHeaders = (extra = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = (isJson ? data?.message : data) || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.response = { data };
    throw error;
  }

  return data;
};

const request = (method) => async (url, body = undefined, options = {}) => {
  const res = await fetch(`${DEFAULT_BASE_URL}${url}`, {
    method,
    headers: buildHeaders(options.headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
    credentials: 'omit',
  });
  return handleResponse(res);
};

export const api = {
  get: (url, options) => request('GET')(url, undefined, options),
  post: (url, body, options) => request('POST')(url, body, options),
  put: (url, body, options) => request('PUT')(url, body, options),
  patch: (url, body, options) => request('PATCH')(url, body, options),
  delete: (url, options) => request('DELETE')(url, undefined, options),
};
