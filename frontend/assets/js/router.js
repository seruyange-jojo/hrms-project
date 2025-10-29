const Router = (() => {
  const routes = {
    '#/login': { view: 'login', public: true },
    '#/dashboard': { view: 'dashboard' },
    '#/employees': { view: 'employees' },
    '#/attendance': { view: 'attendance' },
    '#/leave': { view: 'leave' },
    '#/payroll': { view: 'payroll' },
    '#/performance': { view: 'performance' },
    '#/settings': { view: 'settings', roles: ['Admin', 'HR'] },
  };

  const defaultRoute = '#/dashboard';

  function setActiveNav(currentHash) {
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(a => {
      const match = currentHash && a.getAttribute('href') === currentHash;
      a.classList.toggle('active', !!match);
    });
  }

  async function load(view) {
    const el = document.getElementById('app');
    const res = await fetch(`./pages/${view}.html`, { cache: 'no-store' });
    const html = await res.text();
    el.innerHTML = html;
    window.dispatchEvent(new CustomEvent('page:loaded', { detail: { view } }));
  }

  function resolve() {
    let hash = window.location.hash || defaultRoute;
    if (!(hash in routes)) hash = '#/login';

    const def = routes[hash];
    if (!def.public && !Auth.isAuthed()) {
      window.location.hash = '#/login';
      setActiveNav(null);
      return load('login');
    }
    if (def.roles && !def.roles.some(r => Auth.hasRole(r))) {
      setActiveNav(null);
      return load('not-found');
    }
    setActiveNav(hash);
    return load(def.view);
  }

  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { start };
})();
