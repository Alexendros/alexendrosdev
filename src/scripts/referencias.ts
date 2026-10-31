/** Filtro por botones y dialog de ficha desde <template> (sin innerHTML). */

export function initReferencias(): void {
  const grid = document.querySelector<HTMLElement>('[data-ref-grid]');
  const live = document.querySelector<HTMLElement>('[data-ref-live]');
  const filters = document.querySelectorAll<HTMLButtonElement>('[data-ref-filters] [data-filter]');
  if (!grid || !filters.length) return;

  function applyFilter(id: string) {
    const cards = grid!.querySelectorAll<HTMLElement>('[data-kind]');
    let visible = 0;
    cards.forEach((card) => {
      const kind = card.getAttribute('data-kind') ?? 'all';
      const show = id === 'all' || kind === id;
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach((btn) => {
      const active = btn.getAttribute('data-filter') === id;
      btn.classList.toggle('btn-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (live) {
      live.textContent =
        id === 'all'
          ? `Mostrando todos los proyectos (${visible}).`
          : `Mostrando ${visible} proyecto${visible === 1 ? '' : 's'}.`;
    }
  }

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter') ?? 'all');
    });
  });

  const dialog = document.querySelector<HTMLDialogElement>('#ref-dialog');
  const body = dialog?.querySelector<HTMLElement>('[data-dialog-body]');
  const actions = dialog?.querySelector<HTMLElement>('[data-dialog-actions]');
  const closeBtn = dialog?.querySelector<HTMLButtonElement>('[data-dialog-close]');
  let lastTrigger: HTMLElement | null = null;

  function openFromTemplate(slug: string, trigger: HTMLElement) {
    if (!dialog || !body || !actions) return;
    const tpl = document.querySelector<HTMLTemplateElement>(
      `[data-project-template="${CSS.escape(slug)}"]`
    );
    if (!tpl) return;
    lastTrigger = trigger;
    body.replaceChildren();
    actions.replaceChildren();
    const frag = tpl.content.cloneNode(true) as DocumentFragment;
    const nodes = Array.from(frag.childNodes);
    const actionNodes: Node[] = [];
    nodes.forEach((node) => {
      if (
        node instanceof HTMLElement &&
        (node.matches('[data-tpl-link]') || node.matches('[data-tpl-consult]'))
      ) {
        actionNodes.push(node);
      } else {
        body.appendChild(node);
      }
    });
    actionNodes.forEach((n) => actions.appendChild(n));
    const title = body.querySelector('[data-tpl-title]');
    if (title && !title.id) title.id = 'ref-dialog-title';
    dialog.showModal();
    closeBtn?.focus();
  }

  document.querySelectorAll<HTMLAnchorElement>('[data-open-dialog]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      const slug = link.getAttribute('data-open-dialog');
      if (slug) openFromTemplate(slug, link);
    });
  });

  dialog?.addEventListener('close', () => {
    lastTrigger?.focus();
    lastTrigger = null;
  });

  actions?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const consult = target?.closest<HTMLButtonElement>('[data-tpl-consult]');
    if (!consult) return;
    dialog?.close();
    const message = document.querySelector<HTMLTextAreaElement>(
      '#contact-message, #m, [name="message"]'
    );
    const title = consult.getAttribute('data-project') ?? '';
    if (message && !message.value.trim()) {
      message.value = `Consulta sobre: ${title}.`;
    }
    message?.focus();
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  });
}
