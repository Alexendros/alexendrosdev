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
    // Histeresis de 1px: evita el parpadeo de .is-scrolled cuando el
    // borde del sentinel coincide exactamente con el del viewport.
    { threshold: 0, rootMargin: '0px 0px -1px 0px' }
  );

  observer.observe(sentinel);
  // MPA: cada navegación descarta el documento, pero si se adopta el
  // router de Astro el observer no debe acumularse entre swaps.
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

export {};
