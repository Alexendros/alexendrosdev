export type ResendConfig = {
  apiKey?: string;
  from?: string;
  fromName?: string;
};

export type ResendEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  replyTo?: string;
};

export function isResendConfigured(cfg: ResendConfig): boolean {
  return Boolean(cfg.apiKey?.trim() && cfg.from?.trim());
}

function formatFrom(cfg: ResendConfig): string {
  const from = (cfg.from ?? '').trim();
  const name = (cfg.fromName ?? '').trim();
  if (!name) return from;
  return `${name} <${from}>`;
}

export async function sendResendEmail(cfg: ResendConfig, email: ResendEmail): Promise<boolean> {
  if (!isResendConfigured(cfg)) return false;
  const payload: Record<string, unknown> = {
    from: formatFrom(cfg),
    to: Array.isArray(email.to) ? email.to : [email.to],
    subject: email.subject,
    html: email.html
  };
  if (email.text) payload.text = email.text;
  if (email.headers) payload.headers = email.headers;
  if (email.replyTo) payload.reply_to = email.replyTo;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch {
    return false;
  }
}
