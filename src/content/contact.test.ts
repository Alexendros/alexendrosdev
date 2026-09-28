import { describe, expect, it } from 'vitest';
import { contact, publicBookingEvents } from './contact';

describe('reservas públicas de contacto', () => {
  it('expone solo diagnóstico 75 € y sesión técnica 150 €', () => {
    expect(publicBookingEvents.map((event) => event.calLink)).toEqual([
      'alexendros/diagnostico',
      'alexendros/sesion-tecnica'
    ]);
    expect(publicBookingEvents.map((event) => event.url)).toEqual([
      'https://cal.com/alexendros/diagnostico',
      'https://cal.com/alexendros/sesion-tecnica'
    ]);
    // Los precios usan espacio fino no separable (U+202F) antes del €
    expect(publicBookingEvents.map((event) => event.priceLabel)).toEqual(['75 €', '150 €']);
    expect(JSON.stringify(contact)).not.toMatch(/retainer/i);
  });

  it('mantiene el formulario y apunta Cal al ancla de reservas', () => {
    expect(contact.channels.some((channel) => channel.id === 'form')).toBe(true);
    expect(contact.channels.find((channel) => channel.id === 'cal')?.href).toBe('#reservar');
    expect(contact.bookings.scanLabel).toBe('Escanea para reservar');
  });
});
