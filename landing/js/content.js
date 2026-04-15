// Carica content.json e popola tutte le sezioni della pagina
fetch('data/content.json')
  .then(r => r.json())
  .then(data => {
    buildServices(data.services);
    buildNumbers(data.numbers);
    buildClients(data.clients);
    buildContacts(data.contacts);
    window.__galleryData = data.gallery;
  });

function buildServices(items) {
  document.querySelector('.services').innerHTML = items.map(s => `
    <div class="svc">
      <p class="svc-title">${s.title}</p>
      <p class="svc-desc">${s.desc}</p>
    </div>`).join('');
}

function buildNumbers(items) {
  document.querySelector('.numbers-row').innerHTML = items.map(n => `
    <div class="num-item">
      <p class="num-big">${n.value}<span>${n.suffix}</span></p>
      <p class="num-label">${n.label}</p>
    </div>`).join('');
}

function buildClients(items) {
  document.querySelector('.clients-grid').innerHTML = items.map(c => `
    <div class="client-item">
      <p class="client-name">${c.name}</p>
      <p class="client-sector${c.accent ? ' hi' : ''}">${c.sector}</p>
    </div>`).join('');
}

function buildContacts(items) {
  document.querySelector('.contacts').innerHTML = items.map(c => `
    <div class="contact-item">
      <span>${c.label}</span>
      <p>${c.value}</p>
    </div>`).join('');
}
