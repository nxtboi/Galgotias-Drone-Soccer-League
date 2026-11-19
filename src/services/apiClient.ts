import type { RegisteredTeamProfile } from '../data/teamAuthData';

const TOKEN_KEY = 'gdsl_auth_token_v1';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** fetch() for the portal's own /api routes, adding the signed session token if present. */
export function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

export type AdminRole = 'super_admin' | 'admin';

export type LoginResult =
  | { success: true; role: 'admin'; adminRole: AdminRole; name: string; token: string }
  | { success: true; role: 'team'; token: string; team: RegisteredTeamProfile }
  | { success: false; error: string };

export async function loginWithServer(identifier: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.token) {
      return { success: false, error: data.error || 'Sign-in failed. Please try again.' };
    }
    setAuthToken(data.token);
    return data as LoginResult;
  } catch {
    return { success: false, error: 'Could not reach the server. Check your connection and try again.' };
  }
}

/** Asks the server who the stored token belongs to. Clears the token if it is no longer valid. */
export async function fetchCurrentAuth(): Promise<
  | { role: 'admin'; adminRole: AdminRole; name: string }
  | { role: 'team'; team: RegisteredTeamProfile }
  | null
> {
  if (!getAuthToken()) return null;
  try {
    const res = await apiFetch('/api/auth/me');
    if (res.status === 401) {
      clearAuthToken();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (data.role === 'admin') {
      return { role: 'admin', adminRole: data.adminRole === 'super_admin' ? 'super_admin' : 'admin', name: data.name || 'Admin' };
    }
    if (data.role === 'team' && data.team) return { role: 'team', team: data.team };
    return null;
  } catch {
    return null;
  }
}
