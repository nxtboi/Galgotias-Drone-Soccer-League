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

// Ensure Firebase is initialized once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

// Prompt account selection
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
const TOKEN_STORAGE_KEY = 'gdsl_google_access_token_v1';
const USER_STORAGE_KEY = 'gdsl_google_user_profile_v1';
const STORAGE_SESSION_FLAG = 'gdsl_google_connected_v1';

// Initialize cached access token from localStorage for permanent persistence
let cachedAccessToken: string | null = (typeof window !== 'undefined') ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
let currentGoogleUser: User | null = null;

export interface SavedGoogleProfile {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  uid?: string;
}

export const getSavedGoogleProfile = (): SavedGoogleProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Initialize auth state listener. Call this on app load.
 * Restores permanent access token and user credentials without prompting again.
 */
export const initAuth = (
  onAuthSuccess?: (user: User | any, token: string) => void,
  onAuthFailure?: () => void
) => {
  // If we already have a saved access token and profile in localStorage, notify listeners immediately
  const savedToken = (typeof window !== 'undefined') ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  const savedProfile = getSavedGoogleProfile();
  if (savedToken) {
    cachedAccessToken = savedToken;
    if (savedProfile && onAuthSuccess) {
      onAuthSuccess(savedProfile as any, savedToken);
    }
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    currentGoogleUser = user;
    if (user) {
      const token = cachedAccessToken || localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        cachedAccessToken = token;
        const profile: SavedGoogleProfile = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem(STORAGE_SESSION_FLAG, 'true');
        if (onAuthSuccess) onAuthSuccess(user, token);
      }
    } else {
      // If user signed out of firebase, check if we have offline saved token
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const profile = getSavedGoogleProfile();
      if (token && profile) {
        cachedAccessToken = token;
        if (onAuthSuccess) onAuthSuccess(profile as any, token);
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Must be called from a button click or user interaction
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google authentication.');
    }

    cachedAccessToken = credential.accessToken;
    currentGoogleUser = result.user;
    
    // Save token permanently to localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
    localStorage.setItem(STORAGE_SESSION_FLAG, 'true');
    const profile: SavedGoogleProfile = {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      uid: result.user.uid,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  }
  return null;
};

export const setAccessTokenInMemory = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(STORAGE_SESSION_FLAG, 'true');
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
};

export const getCurrentGoogleUser = (): User | any | null => {
  return currentGoogleUser || auth.currentUser || getSavedGoogleProfile();
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Google sign-out notice:', err);
  }
  cachedAccessToken = null;
  currentGoogleUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(STORAGE_SESSION_FLAG);
  }
};
