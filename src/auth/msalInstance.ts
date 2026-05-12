// MSAL singleton + helpers for Microsoft sign-in and Graph token acquisition.

import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  type AccountInfo,
} from '@azure/msal-browser';
import { msalConfig, loginRequest, graphTokenRequest, isMsalConfigured } from './msalConfig';

let instance: PublicClientApplication | null = null;
let initPromise: Promise<void> | null = null;

export const getMsalInstance = (): PublicClientApplication => {
  if (!instance) instance = new PublicClientApplication(msalConfig);
  return instance;
};

const ensureInitialized = async (): Promise<PublicClientApplication> => {
  const msal = getMsalInstance();
  if (!initPromise) initPromise = msal.initialize();
  await initPromise;
  return msal;
};

export const getActiveAccount = (): AccountInfo | null => {
  if (!isMsalConfigured()) return null;
  try {
    const msal = getMsalInstance();
    const active = msal.getActiveAccount();
    if (active) return active;
    const all = msal.getAllAccounts();
    if (all.length > 0) {
      msal.setActiveAccount(all[0]);
      return all[0];
    }
  } catch {
    /* not initialised yet */
  }
  return null;
};

export const signInWithMicrosoft = async (): Promise<AccountInfo> => {
  if (!isMsalConfigured()) {
    throw new Error('Microsoft SSO is not configured. Set VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID.');
  }
  const msal = await ensureInitialized();
  const result = await msal.loginPopup(loginRequest);
  msal.setActiveAccount(result.account);
  return result.account;
};

export const signOutMicrosoft = async (): Promise<void> => {
  if (!isMsalConfigured()) return;
  const msal = await ensureInitialized();
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (account) await msal.logoutPopup({ account });
};

/**
 * Acquire a Microsoft Graph access token for the signed-in user.
 * Returns null if no MSAL session exists (caller should fall back to mock).
 */
export const acquireGraphToken = async (): Promise<string | null> => {
  if (!isMsalConfigured()) return null;
  const msal = await ensureInitialized();
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) return null;

  try {
    const res = await msal.acquireTokenSilent({ ...graphTokenRequest, account });
    return res.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      const res = await msal.acquireTokenPopup(graphTokenRequest);
      return res.accessToken;
    }
    console.error('acquireGraphToken failed:', err);
    return null;
  }
};
