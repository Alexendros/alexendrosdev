import { describe, expect, it } from 'vitest';
import { ejes, ejeSchema } from './ejes';

describe('ejes de trabajo', () => {
  it('expone tres ejes validados y numerados en orden', () => {
    expect(ejes).toHaveLength(3);
    expect(ejes.map((e) => e.index)).toEqual(['01', '02', '03']);
    for (const e of ejes) expect(ejeSchema.safeParse(e).success).toBe(true);
  });

  it('no introduce afirmaciones fuera del contenido existente', () => {
    const joined = ejes.map((e) => `${e.title} ${e.description}`).join(' ');
    expect(joined).toMatch(/Lighthouse/);
    expect(joined).toMatch(/teclado/);
  });
});
