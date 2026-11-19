import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { RegisteredTeamProfile } from '../data/teamAuthData';
import { setAuthToken } from '../services/apiClient';

/**
 * "Continue with Google" for TEAM LEADERS only, using the official Google-rendered button
 * (Google Identity Services, popup ID-token flow). Ported from the GCDIS website portal.
 * Renders nothing when the server reports Google sign-in as disabled or the script can't load.
 */

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
    itp_support?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const PENDING_SIGNUP_KEY = 'gdsl_google_signup_v1';

export interface PendingGoogleSignup {
  signupToken: string;
  profile: { email: string; name: string };
}

/** A new leader who signed in with Google but has not registered a team yet (this tab only). */
export function getPendingGoogleSignup(): PendingGoogleSignup | null {
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
    return raw ? (JSON.parse(raw) as PendingGoogleSignup) : null;
  } catch {
    return null;
  }
}

export function clearPendingGoogleSignup(): void {
  try {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
  } catch {
    // ignore
  }
}

let configPromise: Promise<{ enabled?: boolean; clientId?: string } | null> | null = null;
function loadGoogleConfig() {
  if (!configPromise) {
    configPromise = fetch('/api/auth/google/config')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => {
        configPromise = null;
        return null;
      });
  }
  return configPromise;
}

let gsiScriptPromise: Promise<boolean> | null = null;
function loadGsiScript(): Promise<boolean> {
  if (window.google?.accounts?.id) return Promise.resolve(true);
  if (gsiScriptPromise) return gsiScriptPromise;
  gsiScriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(Boolean(window.google?.accounts?.id));
    script.onerror = () => {
      gsiScriptPromise = null;
      script.remove();
      resolve(false);
    };
    document.head.appendChild(script);
  });
  return gsiScriptPromise;
}

// GIS is initialised once per page; the mounted button receives credentials via this ref.
let initializedClientId: string | null = null;
const activeCallback: { current: ((r: GoogleCredentialResponse) => void) | null } = { current: null };

interface GoogleSignInButtonProps {
  /** Existing leader: signed in to their team (token already stored). */
  onSignedIn: (team: RegisteredTeamProfile) => void;
  /** New leader: verified Google profile to start a registration with. */
  onNewLeader: (signup: PendingGoogleSignup) => void;
  onError: (message: string) => void;
  caption?: string;
}

export function GoogleSignInButton({ onSignedIn, onNewLeader, onError, caption }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const handlers = useRef({ onSignedIn, onNewLeader, onError });
  handlers.current = { onSignedIn, onNewLeader, onError };

  useEffect(() => {
    let cancelled = false;
    void loadGoogleConfig().then((cfg) => {
      if (!cancelled && cfg?.enabled && cfg.clientId) setClientId(cfg.clientId);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response?.credential) {
      handlers.current.onError('Google sign-in was cancelled or did not complete. Please try again.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        handlers.current.onError(data.error || 'Google sign-in failed. Please try again.');
        return;
      }
      if (data.status === 'signed_in' && data.token && data.team) {
        clearPendingGoogleSignup();
        setAuthToken(data.token);
        handlers.current.onSignedIn(data.team);
        return;
      }
      if (data.status === 'new_leader' && data.signupToken) {
        const signup: PendingGoogleSignup = { signupToken: data.signupToken, profile: data.profile };
        try {
          sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(signup));
        } catch {
          // ignore
        }
        handlers.current.onNewLeader(signup);
        return;
      }
      handlers.current.onError('Google sign-in failed. Please try again.');
    } catch {
      handlers.current.onError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    activeCallback.current = handleCredential;
    loadGsiScript().then((loaded) => {
      if (cancelled) return;
      if (!loaded || !window.google) {
        setUnavailable(true);
        return;
      }
      if (initializedClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (r) => activeCallback.current?.(r),
          ux_mode: 'popup',
          auto_select: false,
          itp_support: true,
        });
        initializedClientId = clientId;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (activeCallback.current === handleCredential) activeCallback.current = null;
    };
  }, [clientId, handleCredential]);

  useEffect(() => {
    const el = containerRef.current;
    if (!ready || !el || !window.google) return;
    const width = Math.max(200, Math.min(400, Math.floor(el.clientWidth)));
    el.innerHTML = '';
    window.google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'left',
      width,
    });
  }, [ready]);

  if (!clientId || unavailable) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
      <div
        ref={containerRef}
        aria-label="Continue with Google (team leader)"
        style={{
          width: '100%',
          maxWidth: 400,
          minHeight: 44,
          display: 'flex',
          justifyContent: 'center',
          opacity: busy ? 0.6 : 1,
          pointerEvents: busy ? 'none' : 'auto',
        }}
      />
      {busy && (
        <span role="status" style={{ fontSize: 11, opacity: 0.75 }}>
          Verifying Google account…
        </span>
      )}
      {caption && <p style={{ margin: 0, fontSize: 11, opacity: 0.7, textAlign: 'center' }}>{caption}</p>}
    </div>
  );
}
