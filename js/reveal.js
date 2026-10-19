// Reveal sobrio allo scroll — token motion DS, rispetta prefers-reduced-motion
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('reveal-on');

  const targets = document.querySelectorAll('.header, .section, .footer');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(t => io.observe(t));
})();
