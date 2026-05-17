// graphService — Sparq / Microsoft Graph integration.
//
// Three execution paths, in priority order:
//  1. SPFx host: caller passes WebPartContext → use msGraphClientFactory.
//  2. Browser MSAL session: an Azure AD user is signed in via MSAL
//     (see src/auth/msalInstance.ts) → call Graph REST directly with the
//     bearer token.
//  3. No auth available (this Lovable preview, or unconfigured tenant) →
//     return mock data so the UI keeps working.

import { acquireGraphToken } from '@/auth/msalInstance';

/**
 * Shape of billing data used in UI
 */
export interface BillingDetails {
  businessSegment?: string;
  business?: string;
  glCode?: string;
  costCenter?: string;
  location?: string;
  department?: string;
  division?: string;
  employeeId?: string;
  managerId?: string;
  manager?: string;
  rawBillingString?: string;
}

export type GraphContext = any | undefined;

const EXT_PREFIX = 'extension_ecae76899d904e1088fb6a8b5844ca60_';
const GRAPH_BETA = 'https://graph.microsoft.com/beta';

const getExtension = (user: any, key: string): string | undefined => user?.[key] ?? undefined;

const mapUserToBilling = (user: any): BillingDetails => ({
  businessSegment: getExtension(user, `${EXT_PREFIX}uht_InternalSegment`),
  business: getExtension(user, `${EXT_PREFIX}uht_Business`),
  glCode: getExtension(user, `${EXT_PREFIX}uht_GLDepartmentID`),
  costCenter: getExtension(user, `${EXT_PREFIX}uht_GLDepartmentID`),
  location: getExtension(user, `${EXT_PREFIX}uht_GLLocation`),
  department: user?.department,
  division: getExtension(user, `${EXT_PREFIX}uht_Division`),
  employeeId: user?.employeeId,
  managerId: getExtension(user, `${EXT_PREFIX}uht_SupervisorID`),
  rawBillingString: user?.onPremisesExtensionAttributes?.extensionAttribute10,
});

// ── Mock fallback ─────────────────────────────────────────────────────
const MOCK_BILLING: BillingDetails = {
  businessSegment: 'Optum Technology',
  business: 'Optum',
  glCode: 'GL-48820-1024',
  costCenter: 'CC-7781',
  location: 'Gurgaon, IN',
  department: 'Engineering',
  division: 'Enterprise Platforms',
  employeeId: 'EMP-0001',
  managerId: 'MGR-1042',
  rawBillingString: 'OPT|TECH|GL-48820-1024|CC-7781',
};
const MOCK_MANAGER = 'Gourav Banathia';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const hasSpfxGraph = (context: GraphContext): boolean =>
  !!context && typeof context?.msGraphClientFactory?.getClient === 'function';

// ── Direct REST helpers (used in MSAL path) ───────────────────────────
const fetchGraph = async <T>(token: string, path: string): Promise<T> => {
  const res = await fetch(`${GRAPH_BETA}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Graph ${path} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
};

/**
 * Fetch user billing details from Microsoft Graph (/beta/me)
 */
export const getUserBillingDetails = async (
  context?: GraphContext,
  overrides?: Partial<BillingDetails>,
): Promise<BillingDetails> => {
  // Path 1: SPFx host
  if (hasSpfxGraph(context)) {
    const client: any = await context.msGraphClientFactory.getClient('3');
    const user = await client.api('/me').version('beta').get();
    return { ...mapUserToBilling(user), ...overrides };
  }

  // Path 2: browser MSAL session
  const token = await acquireGraphToken();
  if (token) {
    try {
      const user = await fetchGraph<any>(token, '/me');
      return { ...mapUserToBilling(user), ...overrides };
    } catch (err) {
      console.error('Graph /me failed, falling back to mock:', err);
    }
  }

  // Path 3: mock
  await delay(300);
  const result = { ...MOCK_BILLING, ...overrides };
  // eslint-disable-next-line no-console
  console.log('%c[Graph • demo] GET /me (mock)', 'color:#0ea5e9;font-weight:600', {
    employeeId: result.employeeId,
    businessSegment: result.businessSegment,
    glCode: result.glCode,
    costCenter: result.costCenter,
    note: 'No VITE_AZURE_CLIENT_ID configured — returning mock billing payload.',
  });
  return result;
};

/**
 * Fetch manager display name (/beta/me/manager)
 */
export const getManager = async (context?: GraphContext): Promise<string | undefined> => {
  if (hasSpfxGraph(context)) {
    try {
      const client: any = await context.msGraphClientFactory.getClient('3');
      const manager = await client.api('/me/manager').version('beta').get();
      return manager?.displayName;
    } catch (error) {
      console.warn('Manager fetch failed (SPFx):', error);
      return undefined;
    }
  }

  const token = await acquireGraphToken();
  if (token) {
    try {
      const manager = await fetchGraph<any>(token, '/me/manager');
      return manager?.displayName;
    } catch (error) {
      console.warn('Manager fetch failed (MSAL):', error);
    }
  }

  await delay(150);
  // eslint-disable-next-line no-console
  console.info('[Graph • mock] /me/manager →', MOCK_MANAGER);
  return MOCK_MANAGER;
};
