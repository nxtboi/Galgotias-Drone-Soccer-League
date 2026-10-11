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

// Prompt consent to ensure refreshed tokens with granted scopes
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in-flight
let isSigningIn = false;
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
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
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
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token or null
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Get current cached user
 */
export const getCurrentUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

/**
 * Disconnect Google session and clear in-memory tokens
 */
export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};
