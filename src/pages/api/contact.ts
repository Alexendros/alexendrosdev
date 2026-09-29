import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  buildContactEmailHtml,
  handleContactPost,
  methodNotAllowed,
  type ContactDeps
} from '../../lib/contactHandler';
import { verifyTurnstileToken } from '../../lib/turnstile';
import { isCapiConfigured, sendCapiEvent } from '../../lib/tracking/capi';
import { createNotionLeadsStore } from '../../lib/calNotionClient';

export const prerender = false;

const MAIL_FROM = 'operaciones@alexendros.dev';
const MAIL_TO = 'operaciones@alexendros.dev';

let cachedRatelimit: Ratelimit | null = null;

function getContactRatelimit(): Ratelimit {
  if (cachedRatelimit) return cachedRatelimit;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis_misconfigured');
  cachedRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'alexendros:contact'
  });
  return cachedRatelimit;
}

function createProductionDeps(): ContactDeps {
  return {
    getEnv: () => ({
      SMTP_HOST: import.meta.env.SMTP_HOST,
      SMTP_PORT: import.meta.env.SMTP_PORT,
      SMTP_USER: import.meta.env.SMTP_USER,
      SMTP_PASS: import.meta.env.SMTP_PASS,
      UPSTASH_REDIS_REST_URL: import.meta.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
      TURNSTILE_SECRET_KEY: import.meta.env.TURNSTILE_SECRET_KEY
    }),
    rateLimit: async (ip) => {
      const result = await getContactRatelimit().limit(ip);
      return { success: result.success, reset: result.reset };
    },
    verifyTurnstile: async (token, ip) => {
      const secret = import.meta.env.TURNSTILE_SECRET_KEY;
      if (!secret) return false;
      return verifyTurnstileToken(secret, token, ip);
    },
    sendLeadEvent: async ({ email, ip, userAgent, sourceUrl }) => {
      const cfg = {
        pixelId: import.meta.env.META_PIXEL_ID ?? import.meta.env.PUBLIC_META_PIXEL_ID,
        accessToken: import.meta.env.META_CAPI_TOKEN,
        testEventCode: import.meta.env.META_CAPI_TEST_EVENT_CODE
      };
      if (!isCapiConfigured(cfg)) return;
      await sendCapiEvent(cfg, {
        eventName: 'Lead',
        eventSourceUrl: sourceUrl ?? undefined,
        userData: { email, ip, userAgent: userAgent ?? undefined }
      });
    },
    saveLead: async ({ name, email, company, subject, message, budget, vertical }) => {
      const token = import.meta.env.NOTION_TOKEN;
      const dataSourceId =
        import.meta.env.NOTION_LEADS_DATA_SOURCE_ID ?? import.meta.env.NOTION_LEADS_DATABASE_ID;
      if (!token || !dataSourceId) return;
      const store = createNotionLeadsStore(token, dataSourceId);
      await store.create({
        nombre: name,
        email,
        canal: 'Formulario',
        tipo: 'Lead contacto',
        estado: 'Nuevo',
        asunto: subject,
        mensaje: company ? `${message}\n\nEmpresa: ${company}` : message,
        fuente: vertical ? `formulario/${vertical}` : 'formulario',
        vertical,
        budget,
        consentMarketing: false
      });
    },
    sendMail: async ({ name, email, company, subject, message, smtp }) => {
      const { html, text, mailSubject } = buildContactEmailHtml({
        name,
        email,
        company,
        subject,
        message
      });
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: { user: smtp.user, pass: smtp.pass }
      });
      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: mailSubject,
        html,
        text
      });
    }
  };
}

export const POST: APIRoute = async ({ request }) =>
  handleContactPost(request, createProductionDeps());

/** Métodos distintos de POST → 405 Allow: POST */
export const ALL: APIRoute = async () => methodNotAllowed();
