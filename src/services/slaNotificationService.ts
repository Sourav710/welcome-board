// SLA Notification Service
// Pure logic for detecting breached / soon-to-breach checklist items
// and dispatching notification emails (via emailTransport).
//
// Two trigger types per item:
//   - 'reminder' : sent ~24h BEFORE dueDate
//   - 'breach'   : sent AFTER dueDate has passed and item still open
//
// A small de-dup ledger in localStorage prevents repeat sends.

import type { ChecklistItem, User } from '@/types/onboarding';
import { sendEmail, type EmailDeliveryResult } from './emailTransport';

export type SlaTriggerType = 'reminder' | 'breach';

export interface SlaCandidate {
  item: ChecklistItem;
  user: User;
  manager?: User;
  trigger: SlaTriggerType;
  hoursUntilDue: number; // negative when overdue
}

const LEDGER_KEY = 'onboardinghub.sla.notified.v1';
const REMINDER_WINDOW_HOURS = 24;

// ── De-dup ledger ─────────────────────────────────────────────
function readLedger(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LEDGER_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeLedger(led: Record<string, string>) {
  try { localStorage.setItem(LEDGER_KEY, JSON.stringify(led)); } catch {}
}
function ledgerKey(itemId: string, trigger: SlaTriggerType) {
  return `${itemId}::${trigger}`;
}
export function hasNotified(itemId: string, trigger: SlaTriggerType): boolean {
  return Boolean(readLedger()[ledgerKey(itemId, trigger)]);
}
export function markNotified(itemId: string, trigger: SlaTriggerType) {
  const led = readLedger();
  led[ledgerKey(itemId, trigger)] = new Date().toISOString();
  writeLedger(led);
}
export function resetLedger() { writeLedger({}); }

// ── Detection ─────────────────────────────────────────────────
const OPEN_STATUSES = new Set(['not_started', 'in_progress', 'pending']);

export function findSlaCandidates(
  items: ChecklistItem[],
  users: User[],
  now: Date = new Date(),
): SlaCandidate[] {
  const usersById = new Map(users.map(u => [u.id, u]));
  const out: SlaCandidate[] = [];

  for (const item of items) {
    if (!OPEN_STATUSES.has(item.status)) continue;
    const due = new Date(item.dueDate).getTime();
    if (Number.isNaN(due)) continue;

    const hoursUntilDue = (due - now.getTime()) / 3_600_000;
    const user = usersById.get(item.userId);
    if (!user) continue;
    const manager = user.managerId ? usersById.get(user.managerId) : undefined;

    let trigger: SlaTriggerType | null = null;
    if (hoursUntilDue <= 0) trigger = 'breach';
    else if (hoursUntilDue <= REMINDER_WINDOW_HOURS) trigger = 'reminder';
    if (!trigger) continue;
    if (hasNotified(item.id, trigger)) continue;

    out.push({ item, user, manager, trigger, hoursUntilDue });
  }
  return out;
}

// ── Email rendering ───────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium', timeStyle: 'short',
  });
}

export function buildEmail(c: SlaCandidate): { subject: string; html: string; text: string } {
  const { item, user, trigger, hoursUntilDue } = c;
  const overdueHrs = Math.abs(Math.round(hoursUntilDue));
  const isBreach = trigger === 'breach';

  const subject = isBreach
    ? `[ONBOARDINGHUB] SLA BREACHED — "${item.title}" is overdue`
    : `[ONBOARDINGHUB] Reminder — "${item.title}" due in ${overdueHrs}h`;

  const headline = isBreach
    ? `SLA Breach: task is ${overdueHrs}h overdue`
    : `Upcoming deadline in ${overdueHrs} hour${overdueHrs === 1 ? '' : 's'}`;

  const text = [
    `Hi ${user.name},`,
    ``,
    headline,
    ``,
    `Task     : ${item.title}`,
    `Section  : ${item.section}`,
    `Owner    : ${item.owner}`,
    `Status   : ${item.status}`,
    `Due Date : ${fmtDate(item.dueDate)}`,
    ``,
    item.description,
    ``,
    `Please log in to ONBOARDINGHUB to update the status.`,
    `— ONBOARDINGHUB Onboarding Hub`,
  ].join('\n');

  const color = isBreach ? '#c0392b' : '#d68910';
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;color:#1f2937;max-width:560px;margin:auto">
    <div style="background:${color};color:#fff;padding:14px 20px;border-radius:8px 8px 0 0;font-weight:600">
      ${headline}
    </div>
    <div style="border:1px solid #e5e7eb;border-top:0;padding:20px;border-radius:0 0 8px 8px">
      <p>Hi ${user.name},</p>
      <p>The following onboarding task requires your attention:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#6b7280">Task</td><td><b>${item.title}</b></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Section</td><td>${item.section}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Owner</td><td>${item.owner}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Status</td><td>${item.status}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">Due</td><td>${fmtDate(item.dueDate)}</td></tr>
      </table>
      <p style="color:#4b5563">${item.description}</p>
      <p style="margin-top:18px">Please log in to <b>ONBOARDINGHUB</b> to update the status.</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">
        Manager has been CC'd on this notification.
      </p>
    </div>
  </div>`;
  return { subject, html, text };
}

// ── Dispatch ──────────────────────────────────────────────────
export interface DispatchOutcome {
  candidate: SlaCandidate;
  result: EmailDeliveryResult;
}

export async function dispatchSlaNotifications(
  candidates: SlaCandidate[],
): Promise<DispatchOutcome[]> {
  const outcomes: DispatchOutcome[] = [];
  for (const c of candidates) {
    const { subject, html, text } = buildEmail(c);
    const cc = c.manager?.email ? [c.manager.email] : undefined;
    const result = await sendEmail({
      to: c.user.email,
      cc,
      subject,
      html,
      text,
      meta: {
        itemId: c.item.id,
        userId: c.user.id,
        managerId: c.manager?.id,
        trigger: c.trigger,
        section: c.item.section,
      },
    });
    if (result.ok) markNotified(c.item.id, c.trigger);
    outcomes.push({ candidate: c, result });
  }
  return outcomes;
}
