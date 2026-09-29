import { useState, type FormEvent } from 'react';
import { track } from '@vercel/analytics';
import { parseContactBody } from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  subjects: string[];
  calUrl: string;
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
};

const inputClass =
  'mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function ContactForm({
  subjects,
  calUrl,
  successMessage,
  errorMessage,
  turnstileSiteKey
}: Props) {
  const [status, setStatus] = useState<
    'idle' | 'ok' | 'error' | 'rate_limited' | 'unavailable' | 'loading'
  >('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    subject: subjects[0] ?? '',
    message: '',
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseContactBody({
      ...form,
      company: form.company || undefined,
      consent: form.consent ? true : undefined,
      turnstileToken: turnstileToken || undefined
    });
    if (!parsed.success) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (res.status === 429) {
        resetTurnstile();
        setStatus('rate_limited');
        return;
      }
      if (res.status === 503) {
        resetTurnstile();
        setStatus('unavailable');
        return;
      }
      if (!res.ok) {
        resetTurnstile();
        setStatus('error');
        return;
      }
      track('contact_form_success');
      setStatus('ok');
    } catch {
      resetTurnstile();
      setStatus('unavailable');
    }
  };

  const bookingIsExternal = /^https?:\/\//i.test(calUrl);

  if (status === 'ok') {
    return (
      <div className="border border-primarySoft bg-primaryGhost rounded-lg p-6" role="status">
        ✓ {successMessage}{' '}
        <a
          className="underline rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href={calUrl}
          {...(bookingIsExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          Reservar una sesión
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 border border-border rounded-lg p-6 bg-card"
      noValidate
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="text-sm">
            Nombre*
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm">
            Email*
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-company" className="text-sm">
          Empresa (opcional)
        </label>
        <input
          id="contact-company"
          name="company"
          autoComplete="organization"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="text-sm">
          Asunto*
        </label>
        <select
          id="contact-subject"
          name="subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={inputClass}
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm">
          Mensaje* (20-2000 chars)
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
          placeholder="Contexto: alcance, plazos, enlaces relevantes..."
        />
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        />
      </div>
      <div className="flex gap-2 text-xs items-start">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-0.5"
        />
        <label htmlFor="contact-consent">
          Acepto{' '}
          <a href="/privacidad" className="underline">
            política privacidad
          </a>{' '}
          — datos para responder, máx 12 meses, sin marketing.
        </label>
      </div>
      <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-primary text-ink px-6 py-3 rounded-lg font-medium w-full md:w-auto disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {status === 'loading' ? 'Enviando...' : 'Enviar →'}
      </button>
      {status === 'error' && (
        <div className="text-sm text-danger" role="alert">
          {errorMessage} Revisa: nombre, email válido, mensaje 20+ chars y consentimiento.
        </div>
      )}
      {status === 'rate_limited' && (
        <div className="text-sm text-danger" role="alert">
          Demasiados envíos. Espera un minuto e inténtalo de nuevo.
        </div>
      )}
      {status === 'unavailable' && (
        <div className="text-sm text-danger" role="alert">
          El servicio de contacto no está disponible ahora. Escríbenos a operaciones@alexendros.dev
          o reserva en{' '}
          <a className="underline" href={calUrl} target="_blank" rel="noopener noreferrer">
            Cal.com
          </a>
          .
        </div>
      )}
    </form>
  );
}
