import { describe, expect, it } from 'vitest';
import { nextIndex, prevIndex } from './service-slider';

describe('service-slider', () => {
  it('avanza y envuelve al principio', () => {
    expect(nextIndex(0, 4)).toBe(1);
    expect(nextIndex(3, 4)).toBe(0);
  });

  it('retrocede y envuelve al final', () => {
    expect(prevIndex(1, 4)).toBe(0);
    expect(prevIndex(0, 4)).toBe(3);
  });

  it('tolera un total vacío', () => {
    expect(nextIndex(0, 0)).toBe(0);
    expect(prevIndex(0, 0)).toBe(0);
  });
});
