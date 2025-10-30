(function () {
  function qs(sel, ctx = document) { return ctx.querySelector(sel); }

  function bindHeader() {
    const signOut = document.getElementById('signOutBtn');
    if (signOut) signOut.addEventListener('click', () => { Auth.logout(); window.location.hash = '#/login'; });
  }

  function onPageLoaded() {
    window.addEventListener('page:loaded', (e) => {
      const view = e.detail.view;
      if (view === 'login') attachLoginHandlers();
      if (view === 'employees') attachEmployeesHandlers();
    });
  }

  function attachLoginHandlers() {
    const form = qs('#loginForm');
    if (!form) return;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = qs('#email').value.trim();
      const password = qs('#password').value.trim();
      if (!email || !password) { showToast('Please enter email and password'); return; }
      try {
        await Auth.login(email, password);
        window.location.hash = '#/dashboard';
      } catch (err) { showToast(err.message || 'Login failed'); }
    });
  }

  function attachEmployeesHandlers() {
    const form = qs('#employeeForm');
    if (form) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        showToast('Employee saved (placeholder).');
        form.reset();
      });
    }
  }

  function showToast(msg) {
    let t = qs('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.position = 'fixed';
      t.style.right = '16px';
      t.style.bottom = '16px';
      t.style.background = '#2563eb';
      t.style.color = '#fff';
      t.style.padding = '10px 12px';
      t.style.borderRadius = '10px';
      t.style.zIndex = '50';
      t.style.boxShadow = '0 8px 20px rgba(37,99,235,0.35)';
      t.style.transform = 'translateY(8px)';
      t.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => { 
      t.style.opacity = '0'; 
      t.style.transform = 'translateY(8px)';
    }, 2200);
  }

  bindHeader();
  onPageLoaded();
  Router.start();
})();
