export {
  auth,
  WORKSPACE_SCOPES,
  initAuth,
  googleSignIn,
  getAccessToken,
  getCurrentGoogleUser,
  logoutGoogle,
} from './googleAuthService';

export const DEFAULT_LINKED_ACCOUNT = 'Google Sheets Live Sync';

export const getLinkedAccountEmail = (): string => {
  return DEFAULT_LINKED_ACCOUNT;
};
