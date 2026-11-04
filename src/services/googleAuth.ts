export const DEFAULT_LINKED_ACCOUNT = 'data/GDSL_2026_Teams_Roster.xlsx';

export interface ServerExcelUser {
  email: string;
  displayName: string;
}

export const initAuth = (
  onSuccess?: (user: ServerExcelUser, token: string) => void,
  _onFailure?: () => void
) => {
  if (onSuccess) {
    onSuccess(
      { email: DEFAULT_LINKED_ACCOUNT, displayName: 'Server Excel Storage' },
      'server-excel-local'
    );
  }
  return () => {};
};

export const googleSignIn = async (): Promise<{
  user: ServerExcelUser;
  accessToken: string;
} | null> => {
  return {
    user: { email: DEFAULT_LINKED_ACCOUNT, displayName: 'Server Excel Storage' },
    accessToken: 'server-excel-local',
  };
};

export const getAccessToken = async (_interactiveIfMissing: boolean = false): Promise<string | null> => {
  return 'server-excel-local';
};

export const getCurrentUser = (): ServerExcelUser => {
  return {
    email: DEFAULT_LINKED_ACCOUNT,
    displayName: 'Server Excel Storage',
  };
};

export const getLinkedAccountEmail = (): string => {
  return DEFAULT_LINKED_ACCOUNT;
};

export const logoutGoogle = async (): Promise<void> => {};
