// Único IntersectionObserver compartido para apariciones al hacer scroll.
// Blueprint Lab Fase 1 (EF-07): degradación nativa — sin JS, sin
// IntersectionObserver o con `prefers-reduced-motion`, el contenido
// queda visible; el JS solo añade la animación.
const SELECTOR = '[data-reveal]';

function init(): void {
  const targets = document.querySelectorAll(SELECTOR);
  if (targets.length === 0) return;
  if (typeof IntersectionObserver === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('reveal-enabled');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );

  targets.forEach((target) => {
    observer.observe(target);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
