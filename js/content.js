// Carica content.json e popola tutte le sezioni della pagina
fetch('data/content.json')
  .then(r => r.json())
  .then(data => {
    buildServices(data.services);
    buildNumbers(data.numbers);
    buildCourses(data.courses);
    buildClients(data.clients);
    buildContacts(data.contacts);
    buildPortfolioList(data.gallery);
    window.__galleryData = data.gallery;
  });

// testo breve sempre visibile; il "+" apre l'approfondimento (stesso pattern dei corsi)
function buildServices(items) {
  const wrap = document.querySelector('.services');
  wrap.innerHTML = items.map((s, i) => {
    const more = s.more ? `
        <button class="svc-more-btn" type="button" aria-expanded="false" aria-controls="svc-more-${i}">
          <span class="svc-more-label">Approfondisci</span>
          <span class="course-toggle" aria-hidden="true"></span>
        </button>
        <p class="svc-more" id="svc-more-${i}" hidden>${s.more}</p>` : '';
    return `
    <div class="svc">
      <p class="svc-title">${s.title}</p>
      <div class="svc-body">
        <p class="svc-desc">${s.desc}</p>${more}
      </div>
    </div>`;
  }).join('');
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.svc-more-btn');
    if (!btn) return;
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.closest('.svc').classList.toggle('open', open);
    document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
  });
}

function buildNumbers(items) {
  const row = document.querySelector('.numbers-row');
  if (!row || !items) return;
  row.innerHTML = items.map(n => `
    <div class="num-item">
      <p class="num-big">${n.value}<span>${n.suffix}</span></p>
      <p class="num-label">${n.label}</p>
    </div>`).join('');
}

function buildCourses(items) {
  const listEl = document.getElementById('courses-list');
  if (!listEl || !items) return;
  listEl.innerHTML = items.map((c, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `
      <div class="course">
        <button class="course-head" type="button" aria-expanded="false">
          <span class="course-num">${n}</span>
          <span class="course-name">${c.title}</span>
          <span class="course-toggle" aria-hidden="true"></span>
        </button>
        <div class="course-body">
          <p class="course-sub">${c.subtitle}</p>
          <ul class="course-program">
            ${c.program.map(p => `<li>${p}</li>`).join('')}
          </ul>
          <button class="course-cta js-open-contact" type="button" data-corso="${c.title}">
            Richiedi informazioni <span aria-hidden="true">&#8599;</span>
          </button>
        </div>
      </div>`;
  }).join('');
  listEl.addEventListener('click', e => {
    const head = e.target.closest('.course-head');
    if (!head) return;
    const open = head.parentElement.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
  });
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
  // le anteprime esistono solo nella veste DS (l'archivio editoriale non le prevede)
  const withThumbs = !!document.querySelector('link[href*="theme-ds"]');
  listEl.innerHTML = categories.map((cat, i) => {
    const n = String(i + 1).padStart(2, '0');
    const thumb = withThumbs && cat.cover
      ? `<span class="pf-thumb"><img src="${cat.cover}" alt="${cat.category}" loading="lazy" /></span>`
      : '';
    return `
      <button class="pf-item" type="button" data-cat="${i}">
        ${thumb}
        <span class="pf-num">${n}</span>
        <span class="pf-name">${cat.category}</span>
        <span class="pf-rule"></span>
        <span class="pf-count">${cat.slides.length} lavori</span>
        <span class="pf-arrow">&rarr;</span>
      </button>`;
  }).join('');
}
