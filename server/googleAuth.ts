import { OAuth2Client } from 'google-auth-library';

/**
 * "Continue with Google" for TEAM LEADERS (captains) only.
 * Ported from the GCDIS website (apps/api/src/auth/google-auth.service.ts):
 * Google Identity Services ID-token flow. The browser gets a Google-signed ID token (JWT)
 * from the official Google button and posts it to the server; the server verifies signature,
 * audience, issuer, expiry and a verified email before trusting the identity.
 * Admin access is never available through Google (admin uses ADMIN_USERNAME / ADMIN_PASSWORD).
 * Without GOOGLE_CLIENT_ID the feature is disabled and the button is hidden.
 */

const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

export class GoogleAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface VerifiedGoogleIdentity {
  sub: string;
  email: string;
  name: string;
  hostedDomain?: string;
}

/** GOOGLE_CLIENT_ID, trimmed; undefined when Google sign-in is not configured. */
export function getGoogleClientId(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const value = (env.GOOGLE_CLIENT_ID || '').trim();
  return value.length > 0 ? value : undefined;
}

/** Optional comma list of Google Workspace hosted domains (hd claim) allowed to sign in. */
export function getAllowedHostedDomains(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.GOOGLE_ALLOWED_HOSTED_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
}

export function getGooglePublicConfig(): { enabled: boolean; clientId?: string } {
  const clientId = getGoogleClientId();
  return clientId ? { enabled: true, clientId } : { enabled: false };
}

let client: OAuth2Client | undefined;
let clientFor: string | undefined;

function getClient(clientId: string): OAuth2Client {
  if (!client || clientFor !== clientId) {
    client = new OAuth2Client({ clientId });
    clientFor = clientId;
  }
  return client;
}

/** Verifies a Google Identity Services credential and returns the trusted identity. */
export async function verifyGoogleCredential(credential: string): Promise<VerifiedGoogleIdentity> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new GoogleAuthError(404, 'Google sign-in is not enabled.');
  }

  let payload: any;
  try {
    const ticket = await getClient(clientId).verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket?.getPayload();
  } catch (err: any) {
    console.warn(`[google] ID token rejected: ${err?.message || 'verification failed'}`);
    throw new GoogleAuthError(401, 'Google sign-in could not be verified. Please try again.');
  }

  if (!payload || typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new GoogleAuthError(401, 'Google sign-in could not be verified. Please try again.');
  }
  // Defence in depth: the library checks these too, but the contract must not depend on it.
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(clientId) || !GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new GoogleAuthError(401, 'Google sign-in could not be verified. Please try again.');
  }
  if (typeof payload.email !== 'string' || payload.email.length === 0 || payload.email_verified !== true) {
    throw new GoogleAuthError(401, 'Your Google account email address is not verified.');
  }

  const allowedDomains = getAllowedHostedDomains();
  const hd = typeof payload.hd === 'string' ? payload.hd.toLowerCase() : undefined;
  if (allowedDomains.length > 0 && (!hd || !allowedDomains.includes(hd))) {
    throw new GoogleAuthError(403, 'This Google account is not from an allowed organisation domain.');
  }

  const email = payload.email.trim().toLowerCase();
  const name =
    typeof payload.name === 'string' && payload.name.trim().length > 0
      ? payload.name.trim().slice(0, 120)
      : email.split('@')[0];

  return { sub: payload.sub, email, name, hostedDomain: hd };
}
