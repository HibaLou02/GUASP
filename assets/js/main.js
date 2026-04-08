/* ══════════════════════════════
   TABS
══════════════════════════════ */
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

document.getElementById('tab-login').addEventListener('click', () => showTab('login'));
document.getElementById('tab-signup').addEventListener('click', () => showTab('signup'));

/* ══════════════════════════════
   ROLE CARDS
══════════════════════════════ */
function selRole(id) {
  document.querySelectorAll('.role').forEach(r => r.classList.remove('active'));
  document.getElementById('r-' + id).classList.add('active');
  const radio = document.querySelector('#r-' + id + ' input[type="radio"]');
  if (radio) radio.checked = true;
}

/* ══════════════════════════════
   LOGIN
══════════════════════════════ */
document.getElementById('btn-login').addEventListener('click', () => {
  const email = document.getElementById('le').value.trim();
  const pass  = document.getElementById('lp').value.trim();
  const err   = document.getElementById('le-err');

  if (!email || !pass) {
    err.classList.add('on');
    return;
  }
  err.classList.remove('on');

  // Dev: redirect directly to dashboard
  window.location.href = './dashboard.html';
});

/* ══════════════════════════════
   SIGNUP
══════════════════════════════ */
document.getElementById('btn-signup').addEventListener('click', () => {
  const fn  = document.getElementById('sfn').value.trim();
  const ln  = document.getElementById('sln').value.trim();
  const em  = document.getElementById('sem').value.trim();
  const pw  = document.getElementById('spw').value.trim();
  const err = document.getElementById('se-err');

  if (!fn || !ln || !em || !pw) {
    err.classList.add('on');
    return;
  }
  err.classList.remove('on');

  // TODO: connecter à votre backend
  console.log('Signup:', { fn, ln, em });

  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('success-msg').classList.add('on');
});

/* ══════════════════════════════
   BACK TO LOGIN AFTER SIGNUP
══════════════════════════════ */
document.getElementById('btn-to-login').addEventListener('click', () => {
  document.getElementById('success-msg').classList.remove('on');
  document.getElementById('signup-form').style.display = '';
  showTab('login');
});