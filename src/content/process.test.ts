import { describe, expect, it } from 'vitest';
import { processPage, type ProcessStep } from './process';

/** Términos del glosario comercial a evitar en la página pública. */
const PROCESS_JARGON = [
  'recorridos',
  'hallazgos',
  'pentest',
  'cabeceras',
  'entrega comprobable',
  'controles automáticos',
  'exposición de datos',
  'hitos de revisión',
  'continuidad definida'
] as const;

function nonEmpty(value: string, label: string) {
  expect(value.trim().length, label).toBeGreaterThan(0);
}

function collectVisibleStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (!value.startsWith('/') && !value.startsWith('http') && !value.includes('origen=')) {
      out.push(value);
    }
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectVisibleStrings(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'seo' || key === 'id' || key === 'href') continue;
      collectVisibleStrings(child, out);
    }
  }
  return out;
}

function visibleCopy(): string {
  return collectVisibleStrings(processPage).join(' ');
}

function wordCount(text: string): number {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

describe('processPage — copy público de metodología', () => {
  it('tiene seo, hero, 4 pasos del mock y cierre', () => {
    nonEmpty(processPage.seo.title, 'seo.title');
    nonEmpty(processPage.seo.description, 'seo.description');
    expect(processPage.seo.description).toMatch(/desde la idea hasta el producto entregado/i);
    nonEmpty(processPage.hero.h1Lead, 'hero.h1Lead');
    expect(processPage.title).toMatch(/paso a paso/i);

    expect(processPage.steps).toHaveLength(4);
    const stepIds = processPage.steps.map((s: ProcessStep) => s.id);
    expect(new Set(stepIds).size).toBe(stepIds.length);
    for (const step of processPage.steps) {
      nonEmpty(step.title, `step.${step.id}.title`);
      nonEmpty(step.description, `step.${step.id}.description`);
      nonEmpty(step.receive, `step.${step.id}.receive`);
    }

    expect(processPage.steps.map((s) => s.id)).toEqual([
      'propuesta',
      'acuerdo',
      'desarrollo',
      'entrega'
    ]);

    expect(processPage.close.heading).toBe('Solicitar propuesta');
    expect(processPage.close.body).toMatch(/en un día laborable/i);
    expect(processPage.close.href).toBe('/#contacto');
  });

  it('mantiene densidad baja y evita el glosario técnico', () => {
    const copy = visibleCopy();
    expect(wordCount(copy)).toBeLessThanOrEqual(400);
    for (const term of PROCESS_JARGON) {
      expect(copy.toLowerCase(), term).not.toContain(term.toLowerCase());
    }
  });
});
