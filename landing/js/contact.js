// ── Contact overlay ──────────────────────────────────────────────────────────
const overlay  = document.getElementById('contact-overlay');
const openBtn  = document.getElementById('open-contact');
const closeBtn = document.getElementById('co-close');
const form     = document.getElementById('co-form');
const success  = document.getElementById('co-success');

function openContact() {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeContact() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

openBtn.addEventListener('click', openContact);
closeBtn.addEventListener('click', closeContact);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeContact();
});

// ── Form submission via Formspree ─────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('.co-submit');
  btn.textContent = 'Invio in corso…';
  btn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.classList.add('hidden');
      success.classList.add('visible');
    } else {
      btn.textContent = 'Errore — riprova';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Errore — riprova';
    btn.disabled = false;
  }
});
