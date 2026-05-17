// Demo Mode helpers — single source of truth for "are we running on mocks?"
// Used by the header badge and the service-layer console tags.

import { isMsalConfigured } from '@/auth/msalConfig';

export const isGraphMock = (): boolean => !isMsalConfigured();

export const isEmailMock = (): boolean =>
  !((import.meta.env.VITE_SLA_EMAIL_ENDPOINT as string | undefined) || '');

// Secure Request is always mocked in the prototype today; flip this when
// the Edge Function -> gateway.optum.com path is wired.
export const isSecureRequestMock = (): boolean =>
  ((import.meta.env.VITE_SECURE_REQUEST_MODE as string | undefined) || 'mock') === 'mock';

export interface DemoModeStatus {
  graph: boolean;
  email: boolean;
  secure: boolean;
  any: boolean;
}

export const getDemoModeStatus = (): DemoModeStatus => {
  const graph = isGraphMock();
  const email = isEmailMock();
  const secure = isSecureRequestMock();
  return { graph, email, secure, any: graph || email || secure };
};

// Timeline speed multiplier for Secure Request mock (1 = normal, 5 = 5× faster).
// Tunable via VITE_SECURE_REQUEST_DEMO_SPEED — defaults to 5× so a full
// lifecycle (~160s) completes in ~32s during a stakeholder demo.
export const getSecureDemoSpeed = (): number => {
  const raw = Number(import.meta.env.VITE_SECURE_REQUEST_DEMO_SPEED);
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
};
