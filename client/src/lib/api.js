const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '요청 실패');
  return data;
}

export const api = {
  auth: {
    register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    me: () => request('/auth/me'),
  },
  connections: {
    list: () => request('/connections'),
    create: (data) => request('/connections', { method: 'POST', body: data }),
    delete: (id) => request(`/connections/${id}`, { method: 'DELETE' }),
  },
  commands: {
    list: () => request('/commands'),
  },
  execute: {
    ssh: (data) => request('/execute/ssh', { method: 'POST', body: data }),
    history: () => request('/execute/history'),
  },
};
