// Estado "en scroll" del header: IntersectionObserver sobre un sentinel
// (sin scroll listener). Cuando el sentinel sale del viewport, el header
// gana .is-scrolled (sombra vía pseudo-elemento). Degradación nativa:
// sin IntersectionObserver el header simplemente no gana sombra.
const SELECTOR = '[data-header-sentinel]';
const HEADER_ID = 'site-header';

function init(): void {
  const sentinel = document.querySelector(SELECTOR);
  const header = document.getElementById(HEADER_ID);
  if (!(sentinel instanceof HTMLElement) || !(header instanceof HTMLElement)) return;
  if (typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        header.classList.toggle('is-scrolled', !entry.isIntersecting);
      }
    },
    { threshold: 0 }
  );

  observer.observe(sentinel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
