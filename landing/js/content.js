// Carica content.json e popola tutte le sezioni della pagina
fetch('data/content.json')
  .then(r => r.json())
  .then(data => {
    buildServices(data.services);
    buildNumbers(data.numbers);
    buildClients(data.clients);
    buildContacts(data.contacts);
    buildPortfolioList(data.gallery);
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
      <img src="${c.logo}" alt="${c.name}" loading="lazy" />
    </div>`).join('');
}

function buildContacts(items) {
  document.querySelector('.contacts').innerHTML = items.map(c => {
    let href = '#';
    const v = c.value;
    if (c.label === 'Email')    href = 'mailto:' + v;
    if (c.label === 'Mobile')   href = 'tel:' + v.replace(/\s/g, '');
    if (c.label === 'LinkedIn') href = 'https://' + v;
    if (c.label === 'Web')      href = 'https://' + v;
    const external = c.label === 'LinkedIn' || c.label === 'Web';
    return `
    <div class="contact-item">
      <span>${c.label}</span>
      <a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${v}</a>
    </div>`;
  }).join('');
}

function buildPortfolioList(categories) {
  const listEl = document.getElementById('pf-list');
  if (!listEl) return;
  listEl.innerHTML = categories.map((cat, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `
      <button class="pf-item" type="button" data-cat="${i}">
        <span class="pf-num">${n}</span>
        <span class="pf-name">${cat.category}</span>
        <span class="pf-rule"></span>
        <span class="pf-count">${cat.slides.length} works</span>
        <span class="pf-arrow">&rarr;</span>
      </button>`;
  }).join('');
}
