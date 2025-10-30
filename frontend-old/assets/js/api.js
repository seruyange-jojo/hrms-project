const Api = (() => {
  const base = () => (window.__API_BASE__ || 'http://localhost:3000').replace(/\/$/, '');

  async function request(path, options = {}) {
    const url = base() + path;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const auth = Auth.get();
    if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed ${res.status}`);
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  }

  // Example endpoints (placeholders)
  const Employees = {
    list: () => request('/employees'),
    create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  };

  return { request, Employees };
})();
