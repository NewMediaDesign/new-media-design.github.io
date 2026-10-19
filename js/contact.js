// ── Contact overlay ──────────────────────────────────────────────────────────
const overlay    = document.getElementById('contact-overlay');
const closeBtn   = document.getElementById('co-close');
const form       = document.getElementById('co-form');
const success    = document.getElementById('co-success');
const contextEl  = document.getElementById('co-context');
const corsoInput = document.getElementById('co-corso');

function openContact(corso) {
  if (contextEl && corsoInput) {
    if (corso) {
      contextEl.textContent = 'Richiesta per “' + corso + '”';
      contextEl.hidden = false;
      corsoInput.value = corso;
    } else {
      contextEl.textContent = '';
      contextEl.hidden = true;
      corsoInput.value = '';
    }
  }
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeContact() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// delegation: copre anche i bottoni generati dinamicamente (corsi a catalogo)
document.addEventListener('click', e => {
  const btn = e.target.closest('#open-contact, .js-open-contact');
  if (!btn) return;
  openContact(btn.dataset.corso || '');
});
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
      btn.textContent = 'Errore, riprova';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Errore, riprova';
    btn.disabled = false;
  }
});
