// Email Transport — pluggable backend for SLA notifications.
//
// By default, runs in "dry-run" mode: logs the payload to the console and
// records a synthetic delivery record. To wire your own cloud (AWS SES,
// SendGrid, Mailgun, an Azure Function, a Node API, etc.), set:
//
//   VITE_SLA_EMAIL_ENDPOINT = "https://your-cloud.example.com/send-email"
//   VITE_SLA_EMAIL_API_KEY  = "<bearer token>"   (optional)
//
// Your endpoint must accept POST { to, cc, subject, html, text, meta }
// and return 2xx on success.

export interface EmailPayload {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  meta?: Record<string, unknown>;
}

export interface EmailDeliveryResult {
  ok: boolean;
  status: number;
  mode: 'http' | 'dry-run';
  error?: string;
  timestamp: string;
}

const ENDPOINT = (import.meta.env.VITE_SLA_EMAIL_ENDPOINT as string | undefined) || '';
const API_KEY = (import.meta.env.VITE_SLA_EMAIL_API_KEY as string | undefined) || '';

export async function sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
  const timestamp = new Date().toISOString();

  if (!ENDPOINT) {
    // Dry-run: visible in console + audit log so QA can verify without a backend.
    // eslint-disable-next-line no-console
    console.info('[SLA Email • dry-run]', {
      to: payload.to,
      cc: payload.cc,
      subject: payload.subject,
      meta: payload.meta,
    });
    return { ok: true, status: 200, mode: 'dry-run', timestamp };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    return {
      ok: res.ok,
      status: res.status,
      mode: 'http',
      error: res.ok ? undefined : await res.text().catch(() => res.statusText),
      timestamp,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      mode: 'http',
      error: err instanceof Error ? err.message : String(err),
      timestamp,
    };
  }
}
