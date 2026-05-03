import { useEffect, useRef, ReactNode } from 'react';
import { useChecklist } from './ChecklistContext';
import { useAuditLog } from './AuditLogContext';
import { teamMembers, managerUser, adminUser } from '@/data/mockData';
import {
  findSlaCandidates,
  dispatchSlaNotifications,
} from '@/services/slaNotificationService';

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Runs an SLA check on mount and every 15 minutes.
 * - Detects items past due (breach) or due within 24h (reminder)
 * - Sends email To: employee, CC: manager via emailTransport
 * - Logs every dispatch to AuditLog
 * - Skips items already notified for the same trigger (localStorage ledger)
 */
export function SlaNotificationProvider({ children }: { children: ReactNode }) {
  const { items } = useChecklist();
  const { addLog } = useAuditLog();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const allUsers = [...teamMembers, managerUser, adminUser];

    const runCheck = async () => {
      const candidates = findSlaCandidates(itemsRef.current, allUsers);
      if (candidates.length === 0) return;
      const outcomes = await dispatchSlaNotifications(candidates);
      outcomes.forEach(({ candidate, result }) => {
        addLog({
          userId: candidate.user.id,
          userName: candidate.user.name,
          userRole: candidate.user.role,
          action: candidate.trigger === 'breach' ? 'SLA_BREACH_EMAIL' : 'SLA_REMINDER_EMAIL',
          category: 'system',
          details: `${result.ok ? 'Sent' : 'FAILED'} ${candidate.trigger} for "${candidate.item.title}" → ${candidate.user.email}${candidate.manager ? ` (cc: ${candidate.manager.email})` : ''} [${result.mode}]`,
          metadata: {
            itemId: candidate.item.id,
            trigger: candidate.trigger,
            mode: result.mode,
            status: String(result.status),
            ...(result.error ? { error: result.error } : {}),
          },
        });
      });
    };

    // Initial run shortly after mount, then on interval.
    const kickoff = setTimeout(runCheck, 3000);
    const interval = setInterval(runCheck, CHECK_INTERVAL_MS);
    return () => { clearTimeout(kickoff); clearInterval(interval); };
  }, [addLog]);

  return <>{children}</>;
}
