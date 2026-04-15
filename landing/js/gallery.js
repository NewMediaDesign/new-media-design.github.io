// Gallery overlay — tabs + slideshow
// Legge window.__galleryData impostato da content.js

let currentCat   = 0;
let currentSlide = 0;

const overlay   = document.getElementById('gallery-overlay');
const navEl     = document.getElementById('ov-nav');
const slideWrap = document.getElementById('slide-wrap');
const capClient = document.getElementById('cap-client');
const capType   = document.getElementById('cap-type');
const counter   = document.getElementById('counter');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('open-gallery').addEventListener('click', openGallery);
  document.getElementById('close-gallery').addEventListener('click', closeGallery);
  document.getElementById('prev-slide').addEventListener('click', prevSlide);
  document.getElementById('next-slide').addEventListener('click', nextSlide);

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     closeGallery();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft')  prevSlide();
  });
});

function openGallery() {
  const data = window.__galleryData;
  if (!data) return;
  buildTabs(data);
  currentCat = 0; currentSlide = 0;
  setActiveTab(0);
  renderSlide();
  overlay.classList.add('open');
}

function closeGallery() {
  overlay.classList.remove('open');
}

function buildTabs(data) {
  navEl.innerHTML = data.map((cat, i) =>
    `<button class="ov-tab${i === 0 ? ' active' : ''}" data-cat="${i}">${cat.category}</button>`
  ).join('');
  navEl.querySelectorAll('.ov-tab').forEach(btn => {
    btn.addEventListener('click', () => switchCat(parseInt(btn.dataset.cat)));
  });
}

function switchCat(i) {
  currentCat = i; currentSlide = 0;
  setActiveTab(i);
  renderSlide();
}

function setActiveTab(i) {
  navEl.querySelectorAll('.ov-tab').forEach((t, idx) =>
    t.classList.toggle('active', idx === i)
  );
}

function renderSlide() {
  const data  = window.__galleryData;
  const cat   = data[currentCat];
  const slide = cat.slides[currentSlide];
  const total = cat.slides.length;
  const n     = currentSlide + 1;

  slideWrap.innerHTML = `
    <img
      src="${slide.image}"
      alt="${slide.client}"
      onerror="this.outerHTML='<div class=\\"slide-placeholder\\"><div class=\\"ph-label\\">${cat.category} · ${n}/${total}</div><div class=\\"ph-title\\">${slide.client}</div></div>'"
    />`;

  capClient.textContent = slide.client;
  capType.textContent   = slide.type;
  counter.textContent   = `${n} / ${total}`;
}

function nextSlide() {
  const total = window.__galleryData[currentCat].slides.length;
  currentSlide = (currentSlide + 1) % total;
  renderSlide();
}

function prevSlide() {
  const total = window.__galleryData[currentCat].slides.length;
  currentSlide = (currentSlide - 1 + total) % total;
  renderSlide();
}
