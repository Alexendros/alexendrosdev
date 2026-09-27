export function nextIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

export function prevIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}

const AUTOPLAY_MS = 6000;

function initSlider(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]');
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot]'));
  const counter = root.querySelector<HTMLElement>('[data-counter]');
  if (slides.length === 0) return;

  let current = 0;
  let timer: number | null = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pad = (n: number): string => String(n).padStart(2, '0');

  function render(): void {
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('bp-slide-hidden', !active);
      if (active) slide.removeAttribute('inert');
      else slide.setAttribute('inert', '');
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, i) => {
      if (i === current) {
        dot.setAttribute('aria-current', 'true');
        dot.classList.remove('bg-border', 'hover:bg-muted');
        dot.classList.add('bg-primary');
      } else {
        dot.removeAttribute('aria-current');
        dot.classList.remove('bg-primary');
        dot.classList.add('bg-border', 'hover:bg-muted');
      }
    });
    if (counter) counter.textContent = `${pad(current + 1)}/${pad(slides.length)}`;
  }

  function go(n: number): void {
    current = ((n % slides.length) + slides.length) % slides.length;
    render();
  }

  function stop(): void {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function start(): void {
    if (reduceMotion || timer !== null) return;
    timer = window.setInterval(() => go(current + 1), AUTOPLAY_MS);
  }

  prevBtn?.addEventListener('click', () => {
    go(current - 1);
  });
  nextBtn?.addEventListener('click', () => {
    go(current + 1);
  });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => go(i));
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(current - 1);
    if (e.key === 'ArrowRight') go(current + 1);
  });
  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  render();
  start();
}

function initAll(): void {
  document.querySelectorAll<HTMLElement>('[data-service-slider]').forEach(initSlider);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}
