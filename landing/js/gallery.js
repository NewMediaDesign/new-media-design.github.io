// Gallery — editorial category index + PhotoSwipe v5 lightbox
// Reads window.__galleryData set by content.js
import PhotoSwipeLightbox from '../vendor/photoswipe/photoswipe-lightbox.esm.min.js';

let indexEl, gridEl, openBtn, closeBtn;
let lightbox = null;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  indexEl  = document.getElementById('gallery-index');
  gridEl   = document.getElementById('gx-grid');
  openBtn  = document.getElementById('open-gallery');
  closeBtn = document.getElementById('gx-close');

  openBtn.addEventListener('click', openIndex);
  closeBtn.addEventListener('click', closeIndex);

  // direct-to-category click on portfolio list items (bypasses editorial index)
  document.addEventListener('click', e => {
    const item = e.target.closest('.pf-item');
    if (!item) return;
    e.preventDefault();
    openCategory(parseInt(item.dataset.cat, 10));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && indexEl.classList.contains('open') && !document.querySelector('.pswp--open')) {
      closeIndex();
    }
  });
}

function openIndex() {
  const data = window.__galleryData;
  if (!data) return;
  if (!gridEl.dataset.built) {
    buildCards(data);
    gridEl.dataset.built = '1';
  }
  indexEl.classList.add('open');
  indexEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeIndex() {
  indexEl.classList.remove('open');
  indexEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function splitTitle(s) {
  const words = s.split(' ');
  if (words.length === 1) return `<em>${s}</em>`;
  const last = words.pop();
  return `${words.join(' ')} <em>${last}</em>`;
}

function buildCards(data) {
  gridEl.innerHTML = data.map((cat, i) => {
    const n = String(i + 1).padStart(2, '0');
    const cover = cat.slides[0].image;
    const count = cat.slides.length;
    return `
      <button class="gx-card" type="button" data-cat="${i}" aria-label="Open ${cat.category}">
        <div class="gx-card-cover" data-placeholder="${cat.category}">
          <img src="${cover}" alt="${cat.category}" onerror="this.parentElement.classList.add('no-img')"/>
          <div class="gx-card-hover">Open gallery &rarr;</div>
        </div>
        <div class="gx-card-meta">
          <span class="gx-num">${n}</span>
          <span class="gx-meta-rule"></span>
          <span class="gx-count">${count} works</span>
        </div>
        <h3 class="gx-card-title">${splitTitle(cat.category)}</h3>
      </button>`;
  }).join('');
  gridEl.querySelectorAll('.gx-card').forEach(btn => {
    btn.addEventListener('click', () => openCategory(parseInt(btn.dataset.cat, 10)));
  });
}

function openCategory(catIndex) {
  const cat = window.__galleryData[catIndex];
  if (!cat) return;
  currentCategory = cat;

  const items = cat.slides.map(s => ({
    src: s.image,
    width: s.width || 1600,
    height: s.height || 2000,
    alt: s.client
  }));

  if (lightbox) { lightbox.destroy(); lightbox = null; }

  lightbox = new PhotoSwipeLightbox({
    dataSource: items,
    pswpModule: () => import('../vendor/photoswipe/photoswipe.esm.min.js'),
    showHideAnimationType: 'fade',
    bgOpacity: 1,
    padding: { top: 60, bottom: 120, left: 40, right: 40 },
    wheelToZoom: true,
  });

  lightbox.on('uiRegister', () => {
    // wordmark top-left
    lightbox.pswp.ui.registerElement({
      name: 'wordmark',
      order: 5,
      isButton: false,
      appendTo: 'bar',
      html: `<span class="pswp__wordmark"><strong>Portfolio</strong> &middot; Andrea Spinazzola &middot; 2026</span>`,
    });

    // custom caption
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: '<div class="pswp__custom-caption"></div>',
      onInit: (el, pswp) => {
        const box = el.querySelector('.pswp__custom-caption');
        const update = () => {
          const s = currentCategory.slides[pswp.currIndex];
          const n = pswp.currIndex + 1;
          const total = currentCategory.slides.length;
          box.innerHTML = `
            <div class="pswp__cap-inner">
              <p class="pswp__cap-eyebrow">${currentCategory.category}</p>
              <p class="pswp__cap-client">${s.client}</p>
              <p class="pswp__cap-type">${s.type}</p>
            </div>
            <div class="pswp__cap-meta">
              <span>NMD &middot; 2026</span>
              <span>${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
            </div>`;
        };
        pswp.on('change', update);
        update();
      }
    });
  });

  lightbox.init();
  lightbox.loadAndOpen(0);
}
