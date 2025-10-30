const Auth = (() => {
  const KEY = 'hr.auth';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  }
  function set(session) {
    localStorage.setItem(KEY, JSON.stringify(session));
  }
  function clear() { localStorage.removeItem(KEY); }

  function isAuthed() { return !!get(); }
  function hasRole(role) {
    const s = get();
    if (!s) return false;
    return s.roles?.includes(role);
  }

  async function login(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    // Placeholder: simulate successful login and roles
    const session = { token: 'demo-token', user: { email }, roles: ['Admin', 'HR'] };
    set(session);
    return session;
  }

  function logout() { clear(); }

  return { get, set, clear, isAuthed, hasRole, login, logout };
})();
