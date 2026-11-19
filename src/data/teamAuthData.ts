import { apiFetch } from '../services/apiClient';

export interface TeamMember {
  name: string;
  role: string;
  rollNo?: string;
  phone?: string;
}

export interface RegisteredTeamProfile {
  teamId: string;
  accessCode: string; // Password / PIN
  teamName: string;
  institution: string;
  city: string;
  state: string;
  division: 'Class 40 (400mm)' | 'Class 20 (200mm)';
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  /** Server-only: Google account id of a leader who signed up with Google (never sent to browsers). */
  captainGoogleSub?: string;
  /** Sent to browsers instead of captainGoogleSub. */
  captainGoogleLinked?: boolean;
  strikerPilot: string;
  goalkeeper: string;
  defender1: string;
  defender2: string;
  pitMechanic: string;
  droneModel: string;
  controlProtocol: string;
  vtxBand: string;
  failsafeAgreed: boolean;
  registeredAt: string;
  allocatedPit: string;
  scrutineeringStatus: 'PENDING_ON_SITE' | 'PRE_APPROVED';
  paymentInfo: {
    receiptNo: string;
    amount: string;
    status: 'PENDING' | 'PAYMENT REQUESTED' | 'PAID' | 'VERIFIED' | string;
    transactionId: string;
    paymentMode: string;
    paidAt: string;
    currency: string;
    emailRequestedTo?: string;
    emailRequestedAt?: string;
    payerDetails?: string;
    proofFileName?: string;
    proofDataUrl?: string;
    remarks?: string;
    uploadedAt?: string;
  };
  attendanceData?: {
    facultyName: string;
    designation: string;
    department: string;
    collegeName: string;
    travelDatesIncluded: boolean;
    students: TeamMember[];
  };
}

export function getDivisionFee(division: string): {
  numeric: number;
  formatted: string;
  code: 'D-20' | 'D-40';
} {
  const isD20 = String(division || '').includes('20');
  return isD20
    ? { numeric: 1500, formatted: '₹1,500', code: 'D-20' }
    : { numeric: 2000, formatted: '₹2,000', code: 'D-40' };
}

function normalizeTeamFee(team: RegisteredTeamProfile): RegisteredTeamProfile {
  const expectedFee = getDivisionFee(team.division).formatted;
  if (team.paymentInfo.amount === '₹2,500' || team.paymentInfo.amount === '₹1,400' || !team.paymentInfo.amount) {
    return {
      ...team,
      paymentInfo: {
        ...team.paymentInfo,
        amount: expectedFee,
      },
    };
  }
  return team;
}

const STORAGE_KEY_TEAMS = 'gdsl_registered_teams_v1';
const STORAGE_KEY_SESSION = 'gdsl_current_team_session_v1';

/** The browser never keeps a squad password; the server stores only a hash. */
function withoutPassword(team: RegisteredTeamProfile): RegisteredTeamProfile {
  return { ...team, accessCode: '' };
}

/**
 * Local cache only. The server is the source of truth and only returns the teams this
 * browser may see (its own squad after a team login, every squad after an admin login).
 * Passwords are checked on the server (POST /api/auth/login), never in the browser.
 */
export function getRegisteredTeams(): RegisteredTeamProfile[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => t && t.teamId).map(normalizeTeamFee);
    }
  } catch {
    // fallback
  }
  return [];
}

export function clearRegisteredTeamsCache(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_TEAMS);
  } catch {
    // ignore
  }
}

export function saveRegisteredTeam(team: RegisteredTeamProfile): void {
  try {
    const current = getRegisteredTeams();
    const existingIndex = current.findIndex((t) => t.teamId === team.teamId);
    let updated: RegisteredTeamProfile[];
    const safeTeam = withoutPassword(team);
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = safeTeam;
    } else {
      updated = [safeTeam, ...current];
    }
    sessionStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save team profile in local storage', err);
  }
}

export function getCurrentSession(): RegisteredTeamProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegisteredTeamProfile;
    const teams = getRegisteredTeams();
    const latestFromStore = teams.find(
      (t) => t.teamId.toLowerCase() === parsed.teamId?.toLowerCase()
    );
    return normalizeTeamFee(latestFromStore || parsed);
  } catch {
    return null;
  }
}

export function setCurrentSession(team: RegisteredTeamProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(withoutPassword(team)));
  } catch (err) {
    console.error('Failed to set current session', err);
  }
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

/* ----------------------------------------------------------------------------
 * Tournament payment details — configured by the super admin in the Admin Panel
 * and shown to teams when they click "Pay" on the dashboard.
 * -------------------------------------------------------------------------- */
export interface PaymentDetailsConfig {
  payeeName: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  qrImageUrl: string;
  instructions: string;
  updatedAt: string;
}

const STORAGE_KEY_PAYMENT_DETAILS = 'gdsl_payment_details_v1';

export const EMPTY_PAYMENT_DETAILS: PaymentDetailsConfig = {
  payeeName: '',
  upiId: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  qrImageUrl: '',
  instructions: '',
  updatedAt: '',
};

/**
 * Reads the super-admin-configured tournament payment details from the SERVER, so every
 * visitor sees the same current details regardless of browser or device.
 */
export async function fetchPaymentDetailsConfig(): Promise<PaymentDetailsConfig> {
  try {
    const res = await fetch('/api/payments/details');
    if (!res.ok) return { ...EMPTY_PAYMENT_DETAILS };
    const data = await res.json().catch(() => ({}));
    return { ...EMPTY_PAYMENT_DETAILS, ...(data?.details || {}) };
  } catch {
    return { ...EMPTY_PAYMENT_DETAILS };
  }
}

/** Saves the payment details on the server (super admin only); the server stamps updatedAt. */
export async function savePaymentDetailsConfig(
  cfg: Partial<PaymentDetailsConfig>
): Promise<PaymentDetailsConfig> {
  const res = await apiFetch('/api/payments/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Could not save payment details. Please sign in as the super admin.');
  }
  return { ...EMPTY_PAYMENT_DETAILS, ...data.details };
}

/**
 * One-time migration helper: payment details that an admin saved in THIS browser before the
 * server-backed version existed. Returned so they can be pushed to the server once.
 */
export function readLegacyLocalPaymentDetails(): PaymentDetailsConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PaymentDetailsConfig>;
    return { ...EMPTY_PAYMENT_DETAILS, ...parsed };
  } catch {
    return null;
  }
}

/** Clears the legacy per-browser payment details once they have been migrated to the server. */
export function clearLegacyLocalPaymentDetails(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PAYMENT_DETAILS);
  } catch {
    // ignore
  }
}

/** True when the super admin has entered at least one payable destination. */
export function hasPaymentDetails(cfg: PaymentDetailsConfig): boolean {
  return Boolean(cfg.upiId || cfg.accountNumber || cfg.qrImageUrl);
}
