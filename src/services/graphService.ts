// graphService — Sparq / Microsoft Graph integration shim.
//
// In the SPFx host this module would call MS Graph via the WebPartContext's
// MSGraphClientFactory (e.g. /me, /me/manager, and the custom Sparq billing
// endpoint). This prototype runs outside SharePoint, so we expose the same
// async signatures backed by mock data. Swap the bodies for real Graph calls
// when the SPFx web part is wired up — the consuming component will not
// need to change.

export interface BillingDetails {
  businessSegment: string;
  glCode: string;
  costCenter: string;
  location: string;
  department: string;
  division: string;
  employeeId: string;
}

// Loose context type so callers can pass an SPFx WebPartContext when
// available, or `undefined` in the standalone prototype.
export type GraphContext = unknown | undefined;

const MOCK_BILLING: BillingDetails = {
  businessSegment: 'Optum Technology',
  glCode: 'GL-48820-1024',
  costCenter: 'CC-7781',
  location: 'Gurgaon, IN',
  department: 'Engineering',
  division: 'Enterprise Platforms',
  employeeId: 'EMP-0001',
};

const MOCK_MANAGER = 'Gourav Banathia';

// Simulate network latency so the loading state is visible.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getUserBillingDetails(
  _context?: GraphContext,
  overrides?: Partial<BillingDetails>,
): Promise<BillingDetails> {
  await delay(300);
  return { ...MOCK_BILLING, ...overrides };
}

export async function getManager(_context?: GraphContext): Promise<string> {
  await delay(150);
  return MOCK_MANAGER;
}
