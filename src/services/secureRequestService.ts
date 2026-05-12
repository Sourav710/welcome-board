/**
 * Secure Request Status Service (MOCK simulation).
 *
 * Mirrors the Optum Secure Request API status model so this layer can be
 * swapped for a real Edge Function -> gateway.optum.com call without touching
 * UI code. See API spec for endpoints:
 *   GET https://gateway.optum.com/api/infra/secureiam-request/v1/Request/{requestID}
 *
 * Pending statuses (RequestStatusId): 18,19,20,24,34,36,37
 * End statuses:                       21,25,26,28
 */

export type SecureRequestStatusId = 18 | 19 | 20 | 21 | 24 | 25 | 26 | 28 | 34 | 36 | 37;

export interface SecureRequestStatus {
  requestId: string;
  requestStatusId: SecureRequestStatusId;
  requestStatusValue: string;
  isPending: boolean;
  isEndState: boolean;
  fetchedAt: string;
}

const STATUS_LABELS: Record<SecureRequestStatusId, string> = {
  18: 'Request Created',
  19: 'Pending Approval',
  20: 'Request Approved',
  24: 'Pending Fulfillment',
  34: 'Pending Manual',
  36: 'Manual Complete',
  37: 'Provisioning Failed',
  21: 'Request Rejected',
  25: 'Request Cancelled',
  26: 'Request Expired',
  28: 'Request Complete',
};

const PENDING_IDS: SecureRequestStatusId[] = [18, 19, 20, 24, 34, 36, 37];
const END_IDS: SecureRequestStatusId[] = [21, 25, 26, 28];

// Mock progression timeline (seconds from request creation -> status id).
// Tuned short for demo purposes. Real API would return the live status.
const MOCK_TIMELINE: { afterSeconds: number; statusId: SecureRequestStatusId }[] = [
  { afterSeconds: 0, statusId: 18 },     // Request Created
  { afterSeconds: 20, statusId: 19 },    // Pending Approval
  { afterSeconds: 60, statusId: 20 },    // Request Approved
  { afterSeconds: 100, statusId: 24 },   // Pending Fulfillment
  { afterSeconds: 160, statusId: 28 },   // Request Complete
];

export function buildStatus(requestId: string, statusId: SecureRequestStatusId): SecureRequestStatus {
  return {
    requestId,
    requestStatusId: statusId,
    requestStatusValue: STATUS_LABELS[statusId],
    isPending: PENDING_IDS.includes(statusId),
    isEndState: END_IDS.includes(statusId),
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Mock equivalent of: GET /Request/{requestID}
 * Returns the current simulated status based on how long ago the request was created.
 *
 * To go live: replace this with `supabase.functions.invoke('secure-request-status', { body: { requestId } })`
 * where the Edge Function performs the Stargate-authenticated GET against the gateway.
 */
export async function fetchSecureRequestStatus(
  requestId: string,
  createdAtIso: string,
): Promise<SecureRequestStatus> {
  // simulate small network latency
  await new Promise((r) => setTimeout(r, 250));

  const elapsedSeconds = (Date.now() - new Date(createdAtIso).getTime()) / 1000;
  let current: SecureRequestStatusId = 18;
  for (const step of MOCK_TIMELINE) {
    if (elapsedSeconds >= step.afterSeconds) current = step.statusId;
  }
  return buildStatus(requestId, current);
}

export function mapSecureStatusToItemStatus(
  statusId: SecureRequestStatusId,
): 'pending' | 'in_progress' | 'complete' | 'rejected' {
  if (statusId === 28 || statusId === 36) return 'complete';
  if (statusId === 21 || statusId === 25 || statusId === 26 || statusId === 37) return 'rejected';
  if (statusId === 18 || statusId === 19) return 'pending';
  return 'in_progress';
}
