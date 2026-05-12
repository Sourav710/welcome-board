// graphService — Sparq / Microsoft Graph integration.
//
// In the SPFx host, pass the WebPartContext as `context`. We dynamically use
// `context.msGraphClientFactory` so we don't have to import
// `@microsoft/sp-http` (that package only resolves inside SharePoint and
// breaks the Vite build). When `context` is omitted (this prototype runs
// outside SharePoint) we return mock data with the same shape so the UI
// keeps working.

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

/** Helper to safely extract extension fields */
const getExtension = (user: any, key: string): string | undefined => {
  return user?.[key] ?? undefined;
};

const EXT_PREFIX = 'extension_ecae76899d904e1088fb6a8b5844ca60_';

// ── Mock fallback (used when no SPFx context is provided) ─────────────
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

const hasGraph = (context: GraphContext): boolean =>
  !!context && typeof context?.msGraphClientFactory?.getClient === 'function';

/**
 * Fetch user billing details from Microsoft Graph (/beta/me)
 */
export const getUserBillingDetails = async (
  context?: GraphContext,
  overrides?: Partial<BillingDetails>,
): Promise<BillingDetails> => {
  if (!hasGraph(context)) {
    await delay(300);
    return { ...MOCK_BILLING, ...overrides };
  }

  const client: any = await context.msGraphClientFactory.getClient('3');
  const user = await client.api('/me').version('beta').get();

  return {
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
    ...overrides,
  };
};

/**
 * Fetch manager display name
 */
export const getManager = async (
  context?: GraphContext,
): Promise<string | undefined> => {
  if (!hasGraph(context)) {
    await delay(150);
    return MOCK_MANAGER;
  }

  try {
    const client: any = await context.msGraphClientFactory.getClient('3');
    const manager = await client.api('/me/manager').version('beta').get();
    return manager?.displayName;
  } catch (error) {
    console.warn('Manager fetch failed:', error);
    return undefined;
  }
};
