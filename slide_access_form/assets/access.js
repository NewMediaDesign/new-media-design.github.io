const form = document.querySelector('#registration-form');
const statusEl = document.querySelector('#form-status');

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');

  if (!form.reportValidity()) return;

  const button = form.querySelector('button[type="submit"]');
  const data = new FormData(form);

  button.disabled = true;
  setStatus('Invio in corso...');

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: data,
    });

    if (!response.ok) {
      throw new Error('Non sono riuscito a inviare la richiesta. Riprova tra poco.');
    }

    form.reset();
    window.location.href = 'thanks.html';
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
});

