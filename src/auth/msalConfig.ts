// MSAL configuration for Microsoft Entra ID (Azure AD) SSO.
//
// Add these as Vite env vars (Workspace → Build Secrets, prefixed VITE_):
//   VITE_AZURE_CLIENT_ID  — Application (client) ID from Azure App Registration
//   VITE_AZURE_TENANT_ID  — Directory (tenant) ID (or "common" / "organizations")
//
// While unset, isMsalConfigured() returns false and the app silently falls back
// to its existing mock login + mock billing data — nothing breaks.

import type { Configuration, PopupRequest } from '@azure/msal-browser';

const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const TENANT_ID = (import.meta.env.VITE_AZURE_TENANT_ID as string | undefined) ?? 'common';

export const isMsalConfigured = (): boolean =>
  !!CLIENT_ID && CLIENT_ID !== 'PLACEHOLDER_CLIENT_ID';

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes requested at sign-in. User.Read covers /me; User.Read.All is needed
// for /me/manager and most directory-extension attributes.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'User.Read.All'],
};

// Scopes for silent token acquisition before each Graph call.
export const graphTokenRequest = {
  scopes: ['https://graph.microsoft.com/User.Read', 'https://graph.microsoft.com/User.Read.All'],
};
