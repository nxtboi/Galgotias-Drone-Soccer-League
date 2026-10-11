import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const DEFAULT_LINKED_ACCOUNT = 'vk16122001@gmail.com';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Default to linking vk16122001@gmail.com with login_hint
provider.setCustomParameters({
  login_hint: DEFAULT_LINKED_ACCOUNT,
});

// Flag to track sign-in in-flight and active promise debounce
let isSigningIn = false;
let activeSignInPromise: Promise<{ user: User; accessToken: string } | null> | null = null;
// In-memory access token cache (NOT persisted in localStorage per SKILL.md)
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

type AuthCallback = (user: User, token: string) => void;
const authListeners: AuthCallback[] = [];

export const onGoogleAuthSuccess = (callback: AuthCallback) => {
  authListeners.push(callback);
  if (cachedUser && cachedAccessToken) {
    callback(cachedUser, cachedAccessToken);
  }
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
};

/**
 * Initialize Firebase Auth listener. Clears cached token when signed out.
 */
export const initAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onSuccess) onSuccess(user, cachedAccessToken);
        authListeners.forEach((fn) => fn(user, cachedAccessToken!));
      } else if (!isSigningIn) {
        // User logged in to Firebase but token expired / not in memory
        if (onFailure) onFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

/**
 * Trigger official Google Sign-In popup with required Workspace scopes.
 * Debounced to guarantee only one popup operation is attempted at any time.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (activeSignInPromise) {
    return activeSignInPromise;
  }

  activeSignInPromise = (async () => {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Google Sign-In completed, but no OAuth access token was returned.');
      }

      cachedAccessToken = credential.accessToken;
      cachedUser = result.user;

      authListeners.forEach((fn) => fn(result.user, cachedAccessToken!));
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      const errCode = error?.code || '';
      const errMsg = error?.message || '';

      // Gracefully handle common browser popup blocking or cancellation without breaking the app
      if (
        errCode === 'auth/popup-blocked' ||
        errCode === 'auth/cancelled-popup-request' ||
        errCode === 'auth/popup-closed-by-user' ||
        errMsg.includes('INTERNAL ASSERTION FAILED')
      ) {
        console.warn('Google Sign-In popup notice (handled gracefully):', errCode || errMsg);
        return null;
      }

      console.warn('Google Sign-In notice:', error);
      return null;
    } finally {
      isSigningIn = false;
      activeSignInPromise = null;
    }
  })();

  return activeSignInPromise;
};

/**
 * Get current in-memory access token, or prompt interactive sign-in with default account vk16122001@gmail.com if missing
 */
export const getAccessToken = async (interactiveIfMissing: boolean = false): Promise<string | null> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  if (interactiveIfMissing) {
    try {
      const res = await googleSignIn();
      return res?.accessToken || null;
    } catch (err) {
      console.warn('Interactive OAuth token acquisition notice:', err);
      return null;
    }
  }
  return null;
};

/**
 * Get current user or default linked account
 */
export const getCurrentUser = (): User | { email: string; displayName: string } | null => {
  if (cachedUser) return cachedUser;
  if (auth.currentUser) return auth.currentUser;
  return {
    email: DEFAULT_LINKED_ACCOUNT,
    displayName: 'vk16122001',
  };
};

export const getLinkedAccountEmail = (): string => {
  return DEFAULT_LINKED_ACCOUNT;
};

/**
 * Disconnect Google session and clear in-memory tokens
 */
export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};
