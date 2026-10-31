/** Ciclo sistema → claro → oscuro; sincroniza theme-controller y localStorage. */

type ThemeMode = 'system' | 'alexlight' | 'alexdark';

const LABELS: Record<ThemeMode, string> = {
  system: 'Tema: sistema. Pulsar para claro',
  alexlight: 'Tema: claro. Pulsar para oscuro',
  alexdark: 'Tema: oscuro. Pulsar para sistema'
};

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem('theme');
    if (v === 'alexlight' || v === 'alexdark') return v;
  } catch {
    /* ignore */
  }
  return 'system';
}

function applyMode(mode: ThemeMode, input: HTMLInputElement, button: HTMLButtonElement) {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-theme');
    try {
      localStorage.removeItem('theme');
    } catch {
      /* ignore */
    }
    input.checked = false;
  } else if (mode === 'alexlight') {
    root.setAttribute('data-theme', 'alexlight');
    try {
      localStorage.setItem('theme', 'alexlight');
    } catch {
      /* ignore */
    }
    input.checked = false;
  } else {
    root.setAttribute('data-theme', 'alexdark');
    try {
      localStorage.setItem('theme', 'alexdark');
    } catch {
      /* ignore */
    }
    input.checked = true;
  }
  button.setAttribute('aria-label', LABELS[mode]);
}

export function initThemeToggle(): void {
  const input = document.querySelector<HTMLInputElement>('[data-theme-input]');
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!input || !button) return;

  let mode = readStored();
  applyMode(mode, input, button);

  button.addEventListener('click', () => {
    mode = mode === 'system' ? 'alexlight' : mode === 'alexlight' ? 'alexdark' : 'system';
    applyMode(mode, input, button);
  });
}
