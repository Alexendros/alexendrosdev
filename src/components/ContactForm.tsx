import { useEffect, useRef, useState, type FormEvent } from 'react';
import { track } from '../lib/tracking/events';
import { contactSchema, parseContactBody } from '../lib/contactSchema';
import { readReferralCookie } from '../lib/referral';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  subjects: string[];
  calUrl: string;
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
};

const BUDGET_OPTIONS = [
  'Menos de 1.000 €',
  '1.000–2.500 €',
  '2.500–5.000 €',
  'Más de 5.000 €',
  'Aún no lo sé'
] as const;

const STEP_LABELS = ['Datos de contacto', 'Tu proyecto', 'Mensaje'] as const;

const stepOneSchema = contactSchema.pick({ name: true, email: true, company: true });
const stepTwoSchema = contactSchema.pick({ subject: true, budget: true });

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
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    subject: subjects[0] ?? '',
    budget: '',
    message: '',
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [started, setStarted] = useState(false);

  const stepRef = useRef(step);
  stepRef.current = step;
  const startedRef = useRef(started);
  startedRef.current = started;
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      if (!startedRef.current || statusRef.current === 'ok') return;
      track('form_abandon_step', { step: stepRef.current + 1 });
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const markStart = () => {
    if (started) return;
    setStarted(true);
    track('form_start');
  };

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const goNext = () => {
    const data = {
      name: form.name,
      email: form.email,
      company: form.company,
      subject: form.subject,
      budget: form.budget
    };
    const ok =
      step === 0
        ? stepOneSchema.safeParse({ ...data, company: form.company || undefined }).success
        : stepTwoSchema.safeParse({ ...data, budget: form.budget || undefined }).success;
    if (!ok) {
      setStepError(true);
      return;
    }
    setStepError(false);
    const next = Math.min(step + 1, STEP_LABELS.length - 1);
    setStep(next);
    track('form_step', { step: next + 1 });
  };

  const goBack = () => {
    setStepError(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEP_LABELS.length - 1) {
      goNext();
      return;
    }
    const parsed = parseContactBody({
      ...form,
      company: form.company || undefined,
      budget: form.budget || undefined,
      referralCode: readReferralCookie() || undefined,
      consent: form.consent ? true : undefined,
      turnstileToken: turnstileToken || undefined
    });
    if (!parsed.success) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    track('form_submit', { subject: form.subject });
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
  const progress = ((step + 1) / STEP_LABELS.length) * 100;
  const isLast = step === STEP_LABELS.length - 1;

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
      onFocus={markStart}
      className="space-y-5 border border-border rounded-lg p-6 bg-card"
      noValidate
    >
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium text-muted">
            Paso {step + 1} de {STEP_LABELS.length} · {STEP_LABELS[step]}
          </p>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primaryGhost"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_LABELS.length}
          aria-valuenow={step + 1}
          aria-label="Progreso del formulario"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
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
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="contact-subject" className="text-sm">
              ¿Qué necesitas?*
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
            <label htmlFor="contact-budget" className="text-sm">
              Presupuesto aproximado (opcional)
            </label>
            <select
              id="contact-budget"
              name="budget"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className={inputClass}
            >
              <option value="">Sin definir</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="contact-message" className="text-sm">
              Cuéntame tu caso* (20-2000 chars)
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
          <TurnstileWidget
            key={turnstileKey}
            siteKey={turnstileSiteKey}
            onToken={setTurnstileToken}
          />
        </div>
      )}

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

      {stepError && (
        <div className="text-sm text-danger" role="alert">
          Revisa los campos de este paso: nombre, email válido, asunto y presupuesto.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="border border-border-strong text-brand px-5 py-2.5 rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Atrás
          </button>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-primary text-ink px-6 py-3 rounded-lg font-medium disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {status === 'loading' ? 'Enviando...' : isLast ? 'Enviar →' : 'Siguiente →'}
        </button>
      </div>

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
