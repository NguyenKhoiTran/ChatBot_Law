// ─── API Configuration ────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper: lấy token từ localStorage
const getToken = () => localStorage.getItem('token');

// Helper: build headers với JWT nếu có
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// Helper: xử lý response, throw lỗi đẹp
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Lỗi không xác định');
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (username, email, password) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }).then(handleResponse),

  login: (username, password) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders() })
      .then(handleResponse),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatApi = {
  ask: (question, sessionId = null) =>
    fetch(`${BASE_URL}/api/chat/ask`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ question, session_id: sessionId }),
    }).then(handleResponse),

  getSessions: () =>
    fetch(`${BASE_URL}/api/chat/sessions`, { headers: authHeaders() })
      .then(handleResponse),

  getMessages: (sessionId) =>
    fetch(`${BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
      headers: authHeaders(),
    }).then(handleResponse),

  deleteSession: (sessionId) =>
    fetch(`${BASE_URL}/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

// ─── Documents API ────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type for multipart
      body: formData,
    }).then(handleResponse);
  },

  list: () =>
    fetch(`${BASE_URL}/api/documents/`, { headers: authHeaders() })
      .then(handleResponse),

  stats: () =>
    fetch(`${BASE_URL}/api/documents/stats`, { headers: authHeaders() })
      .then(handleResponse),
};
