import { useEffect, useState, type FormEvent } from 'react';
import { track } from '../lib/tracking/events';
import {
  contactChannels,
  contactReasonForService,
  contactReasons,
  entityLabels,
  entityTypes,
  formatContactFieldErrors,
  parseContactBody,
  reasonLabels,
  validateContactField,
  validateContactForm,
  type ContactInput,
  type FieldError
} from '../lib/contactSchema';
import TurnstileWidget from './TurnstileWidget';

type Props = {
  successMessage: string;
  errorMessage: string;
  turnstileSiteKey?: string;
};

const inputClass = 'mt-1 w-full bg-bg border border-border-strong rounded-lg px-3 py-2 focus-ring';

const FIELD_IDS: Record<string, string | undefined> = {
  reason: 'contact-reason',
  name: 'contact-name',
  entityType: 'contact-entity',
  channel: undefined,
  phone: 'contact-phone',
  email: 'contact-email',
  message: 'contact-message',
  consent: 'contact-consent'
};

function reasonFromSearch(motivo: string | null, servicio: string | null): ContactInput['reason'] {
  if (motivo && (contactReasons as readonly string[]).includes(motivo)) {
    return motivo as ContactInput['reason'];
  }
  return contactReasonForService(servicio);
}

function FieldErrorText({ id, error }: { id: string; error?: FieldError }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {error.label}: {error.cause}
    </p>
  );
}

function describedBy(id: string, error?: FieldError) {
  return error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}

export default function ContactForm({ successMessage, errorMessage, turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<
    'idle' | 'ok' | 'error' | 'rate_limited' | 'unavailable' | 'loading'
  >('idle');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [form, setForm] = useState({
    name: '',
    entityType: 'particular' as ContactInput['entityType'],
    channel: 'correo' as ContactInput['channel'],
    phone: '',
    email: '',
    reason: 'informacionCliente' as ContactInput['reason'],
    message: '',
    modules: '',
    consent: false,
    honeypot: ''
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = reasonFromSearch(params.get('motivo'), params.get('servicio'));
    const modules = params.get('modulos') ?? '';
    setForm((prev) => ({
      ...prev,
      reason,
      modules
    }));
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey((k) => k + 1);
  };

  const fieldError = (field: string) => errors.find((e) => e.field === field);

  const setFieldErrors = (field: string, next: FieldError[]) => {
    setErrors((prev) => [...prev.filter((e) => e.field !== field), ...next]);
  };

  const blurField = (field: string) => () => {
    setFieldErrors(field, validateContactField(field, form));
  };

  const focusFirstError = (list: FieldError[]) => {
    const id = list[0] ? FIELD_IDS[list[0].field] : undefined;
    if (id) document.getElementById(id)?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const allErrors = validateContactForm(form);
    if (allErrors.length) {
      setErrors(allErrors);
      focusFirstError(allErrors);
      return;
    }
    setErrors([]);
    const payload = {
      name: form.name,
      entityType: form.entityType,
      channel: form.channel,
      phone: form.phone || undefined,
      email: form.email || undefined,
      reason: form.reason,
      message: form.message,
      modules: form.modules || undefined,
      consent: form.consent as true,
      honeypot: form.honeypot,
      turnstileToken: turnstileToken || undefined
    };
    const parsed = parseContactBody(payload);
    if (!parsed.success) {
      const errs = formatContactFieldErrors(parsed.error);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setStatus('loading');
    track('form_submit');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (res.status === 429) {
        setStatus('rate_limited');
        resetTurnstile();
        return;
      }
      if (res.status === 503) {
        setStatus('unavailable');
        resetTurnstile();
        return;
      }
      if (!res.ok) {
        setStatus('error');
        resetTurnstile();
        return;
      }
      setStatus('ok');
      track('contact_form_success');
    } catch {
      setStatus('error');
      resetTurnstile();
    }
  };

  if (status === 'ok') {
    return (
      <p role="status" className="rounded-lg border border-primarySoft bg-primaryGhost p-4 text-sm">
        {successMessage}
      </p>
    );
  }

  const reasonError = fieldError('reason');
  const nameError = fieldError('name');
  const phoneError = fieldError('phone');
  const emailError = fieldError('email');
  const messageError = fieldError('message');
  const consentError = fieldError('consent');

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Sitio web</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm((f) => ({ ...f, honeypot: e.target.value }))}
        />
      </div>

      {form.modules ? (
        <p className="text-sm text-muted">
          Módulos indicados: <strong className="text-fg">{form.modules}</strong>
        </p>
      ) : null}

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 text-sm text-danger">
          {errors.map((err) => (
            <li key={err.field}>
              {err.label}: {err.cause}
            </li>
          ))}
        </ul>
      )}

      <div>
        <label htmlFor="contact-reason" className="text-sm">
          Motivo*
        </label>
        <select
          id="contact-reason"
          name="reason"
          className={inputClass}
          value={form.reason}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              reason: e.target.value as ContactInput['reason']
            }))
          }
          onBlur={blurField('reason')}
          {...describedBy('contact-reason', reasonError)}
        >
          {contactReasons.map((r) => (
            <option key={r} value={r}>
              {reasonLabels[r]}
            </option>
          ))}
        </select>
        <FieldErrorText id="contact-reason-error" error={reasonError} />
      </div>

      <div>
        <label htmlFor="contact-name" className="text-sm">
          Nombre*
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onBlur={blurField('name')}
          {...describedBy('contact-name', nameError)}
        />
        <FieldErrorText id="contact-name-error" error={nameError} />
      </div>

      <div>
        <label htmlFor="contact-entity" className="text-sm">
          Categoría
        </label>
        <select
          id="contact-entity"
          name="entityType"
          className={inputClass}
          value={form.entityType}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              entityType: e.target.value as ContactInput['entityType']
            }))
          }
        >
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {entityLabels[t]}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm">Canal de preferencia para respuesta*</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {contactChannels.map((ch) => (
            <label key={ch} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="channel"
                value={ch}
                checked={form.channel === ch}
                onChange={() => {
                  setForm((f) => ({ ...f, channel: ch }));
                  setFieldErrors('phone', []);
                  setFieldErrors('email', []);
                }}
              />
              {ch === 'whatsapp' ? 'WhatsApp' : 'Correo electrónico'}
            </label>
          ))}
        </div>
        {form.channel === 'whatsapp' && (
          <div className="mt-3">
            <label htmlFor="contact-phone" className="text-sm">
              Teléfono WhatsApp*
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              onBlur={blurField('phone')}
              {...describedBy('contact-phone', phoneError)}
            />
            <FieldErrorText id="contact-phone-error" error={phoneError} />
          </div>
        )}
        {form.channel === 'correo' && (
          <div className="mt-3">
            <label htmlFor="contact-email" className="text-sm">
              Correo electrónico*
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              onBlur={blurField('email')}
              {...describedBy('contact-email', emailError)}
            />
            <FieldErrorText id="contact-email-error" error={emailError} />
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="contact-message" className="text-sm">
          Tu petición*
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          className={inputClass}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          onBlur={blurField('message')}
          placeholder="Describe qué necesitas o qué quieres preguntar."
          {...describedBy('contact-message', messageError)}
        />
        <FieldErrorText id="contact-message-error" error={messageError} />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input
            id="contact-consent"
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            onBlur={blurField('consent')}
            className="mt-1"
            {...describedBy('contact-consent', consentError)}
          />
          <span>
            Acepto el tratamiento de mis datos para responder a esta petición según la{' '}
            <a href="/privacidad" className="underline decoration-dotted underline-offset-2">
              política de privacidad
            </a>
            .
          </span>
        </label>
        <FieldErrorText id="contact-consent-error" error={consentError} />
      </div>

      {turnstileSiteKey ? (
        <TurnstileWidget
          key={turnstileKey}
          siteKey={turnstileSiteKey}
          onToken={setTurnstileToken}
        />
      ) : null}

      {status === 'error' && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}
      {status === 'rate_limited' && (
        <p role="alert" className="text-sm text-danger">
          Demasiados intentos. Espera un minuto e inténtalo de nuevo.
        </p>
      )}
      {status === 'unavailable' && (
        <p role="alert" className="text-sm text-danger">
          Servicio temporalmente no disponible. Escríbeme a contratacion@alexendros.dev.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover disabled:opacity-60"
        >
          {status === 'loading' ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}
