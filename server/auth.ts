import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { RegisteredTeamProfile } from '../src/data/teamAuthData.ts';
import { findActiveAdminById, SUPER_ADMIN_ID } from './admins.ts';

/**
 * Server-side authentication for the GDSL portal.
 *
 * - Admin credentials come only from the environment (ADMIN_USERNAME / ADMIN_PASSWORD).
 * - Sessions are stateless HMAC-signed tokens (signed with ADMIN_SECRET_KEY).
 * - Every protected /api route checks the token with requireAdmin / getAuth.
 */

export type AuthRole = 'admin' | 'team';

export interface AuthPayload {
  role: AuthRole;
  teamId?: string;
  /** Admin tokens: 'super' for the .env super admin, otherwise the id from data/admins.json */
  adminId?: string;
  adminRole?: 'super_admin' | 'admin';
  exp: number; // epoch ms
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const isProduction = process.env.NODE_ENV === 'production';

function resolveSecret(): Buffer {
  const fromEnv = process.env.ADMIN_SECRET_KEY;
  if (fromEnv && fromEnv.length >= 16 && !fromEnv.startsWith('change_this')) {
    return Buffer.from(fromEnv, 'utf-8');
  }
  console.warn(
    '[auth] ADMIN_SECRET_KEY is missing or weak. Using a random secret: all sessions will be logged out when the server restarts.'
  );
  return crypto.randomBytes(32);
}

const SECRET = resolveSecret();

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const ADMIN_PASSWORD: string | null = (() => {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv && fromEnv.length >= 8) return fromEnv;
  if (isProduction) {
    console.warn('[auth] ADMIN_PASSWORD is not set (min 8 chars). Admin login is DISABLED.');
    return null;
  }
  const generated = crypto.randomBytes(9).toString('base64url');
  console.warn(
    `[auth] ADMIN_PASSWORD is not set. Development admin login for this run: username "${ADMIN_USERNAME}", password "${generated}"`
  );
  return generated;
})();

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function createToken(payload: Omit<AuthPayload, 'exp'>): string {
  const full: AuthPayload = { ...payload, exp: Date.now() + TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(full), 'utf-8').toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined | null): AuthPayload | null {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as AuthPayload;
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (payload.role !== 'admin' && payload.role !== 'team') return null;
    if (payload.role === 'team' && !payload.teamId) return null;
    if (payload.role === 'admin' && !payload.adminId) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Short-lived proof that a NEW team leader signed in with Google. Issued by POST /api/auth/google
 * when no team exists for that Google account yet, and redeemed by the registration request,
 * which then locks the captain email to the verified Google address.
 */
export interface GoogleSignupPayload {
  kind: 'google_signup';
  sub: string;
  email: string;
  name: string;
  exp: number;
}

const GOOGLE_SIGNUP_TTL_MS = 30 * 60 * 1000;

export function createGoogleSignupToken(identity: { sub: string; email: string; name: string }): string {
  const payload: GoogleSignupPayload = { kind: 'google_signup', ...identity, exp: Date.now() + GOOGLE_SIGNUP_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  return `${body}.${sign(`google_signup:${body}`)}`;
}

export function verifyGoogleSignupToken(token: unknown): GoogleSignupPayload | null {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(`google_signup:${body}`));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as GoogleSignupPayload;
    if (p.kind !== 'google_signup' || !p.sub || !p.email || typeof p.exp !== 'number' || p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

export function getAuth(req: Request): AuthPayload | null {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  return verifyToken(token);
}

/**
 * Returns the admin session for this request, or null. A non-super admin must still be
 * active in data/admins.json, so disabling or removing an admin ends their sessions at once.
 */
export function getActiveAdmin(req: Request): AuthPayload | null {
  const auth = getAuth(req);
  if (!auth || auth.role !== 'admin' || !auth.adminId) return null;
  if (auth.adminId === SUPER_ADMIN_ID) return auth.adminRole === 'super_admin' ? auth : null;
  return findActiveAdminById(auth.adminId) ? { ...auth, adminRole: 'admin' } : null;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!getActiveAdmin(req)) {
    res.status(401).json({ success: false, error: 'Admin authentication required.' });
    return;
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const admin = getActiveAdmin(req);
  if (!admin) {
    res.status(401).json({ success: false, error: 'Admin authentication required.' });
    return;
  }
  if (admin.adminRole !== 'super_admin') {
    res.status(403).json({ success: false, error: 'Only the super admin can manage admin accounts.' });
    return;
  }
  next();
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkAdminCredentials(identifier: string, password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const userOk = safeEqual(identifier.trim().toLowerCase(), ADMIN_USERNAME);
  const passOk = safeEqual(password, ADMIN_PASSWORD);
  return userOk && passOk;
}

export function isAdminIdentifier(identifier: string): boolean {
  return identifier.trim().toLowerCase() === ADMIN_USERNAME;
}

// ---------------------------------------------------------------------------
// Team password hashing (scrypt). Stored format: scrypt$<N>$<salt b64url>$<hash b64url>
// ---------------------------------------------------------------------------
const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 32;
export const MIN_TEAM_PASSWORD_LENGTH = 6;

export function isHashedPassword(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.startsWith('scrypt$') && value.split('$').length === 4;
}

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(stored: string | undefined | null, plain: string): boolean {
  if (!stored || !plain) return false;
  if (!isHashedPassword(stored)) {
    // Legacy plain-text value (only until the startup migration has run)
    return safeEqual(stored.trim(), plain);
  }
  const [, nStr, saltB64, hashB64] = stored.split('$');
  const N = Number(nStr);
  if (!Number.isInteger(N) || N < 1024) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = crypto.scryptSync(plain, Buffer.from(saltB64, 'base64url'), expected.length, { N });
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Decides which stored password value to keep when a team record is saved.
 * A non-blank new plain-text password (min length) is hashed; anything else
 * (blank, too short, or a hash sent back by a client) keeps the existing value.
 */
export function resolveAccessCode(existing: string | undefined, incoming: string | undefined): string {
  const next = (incoming || '').trim();
  if (next && !isHashedPassword(next) && next.length >= MIN_TEAM_PASSWORD_LENGTH) {
    return hashPassword(next);
  }
  return existing || '';
}

/** Hashes any plain-text passwords left in a list of teams (seed data / old stores). */
export function hashPlainTextPasswords(teams: RegisteredTeamProfile[]): {
  teams: RegisteredTeamProfile[];
  changed: number;
} {
  let changed = 0;
  const out = teams.map((t) => {
    if (t.accessCode && !isHashedPassword(t.accessCode)) {
      changed += 1;
      return { ...t, accessCode: hashPassword(t.accessCode.trim()) };
    }
    return t;
  });
  return { teams: out, changed };
}

export function findTeamForLogin(
  teams: RegisteredTeamProfile[],
  identifier: string,
  password: string
): RegisteredTeamProfile | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();
  if (!cleanId || !cleanPass) return null;
  const matched = teams.find(
    (t) =>
      t.teamId?.trim().toLowerCase() === cleanId ||
      t.captainEmail?.trim().toLowerCase() === cleanId ||
      t.teamName?.trim().toLowerCase() === cleanId
  );
  if (!matched || !matched.accessCode) return null;
  return verifyPassword(matched.accessCode, cleanPass) ? matched : null;
}

/** Simple in-memory limiter for login attempts: max N failures per IP per window. */
const FAILED_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (entry.resetAt < Date.now()) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string) {
  const now = Date.now();
  const entry = failures.get(ip);
  if (!entry || entry.resetAt < now) {
    failures.set(ip, { count: 1, resetAt: now + FAILED_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(ip: string) {
  failures.delete(ip);
}

const PAYMENT_STATUSES_TEAM_CAN_SET = new Set(['PENDING', 'PAYMENT REQUESTED', 'PAID']);

/**
 * Applies the rules for a team editing its own profile: teams cannot verify their own
 * payment, approve their own scrutineering, move pits or change identity fields.
 */
export function applyTeamEditRules(
  existing: RegisteredTeamProfile,
  incoming: RegisteredTeamProfile
): RegisteredTeamProfile {
  const incomingStatus = String(incoming.paymentInfo?.status || '').toUpperCase();
  const existingStatus = String(existing.paymentInfo?.status || '').toUpperCase();

  let paymentInfo = { ...existing.paymentInfo, ...(incoming.paymentInfo || {}) };
  if (incomingStatus === 'VERIFIED' && existingStatus !== 'VERIFIED') {
    paymentInfo = { ...paymentInfo, status: 'PAID' };
  } else if (incomingStatus !== existingStatus && !PAYMENT_STATUSES_TEAM_CAN_SET.has(incomingStatus)) {
    paymentInfo = { ...paymentInfo, status: existing.paymentInfo?.status || 'PENDING' };
  }

  return {
    ...existing,
    ...incoming,
    teamId: existing.teamId,
    registeredAt: existing.registeredAt,
    allocatedPit: existing.allocatedPit,
    scrutineeringStatus: existing.scrutineeringStatus,
    captainGoogleSub: existing.captainGoogleSub,
    captainGoogleLinked: undefined,
    accessCode: resolveAccessCode(existing.accessCode, incoming.accessCode),
    paymentInfo,
  };
}

/** Normalises a brand-new public registration so it cannot pre-approve or pre-pay itself. */
export function applyNewRegistrationRules(incoming: RegisteredTeamProfile): RegisteredTeamProfile {
  return {
    ...incoming,
    scrutineeringStatus: 'PENDING_ON_SITE',
    paymentInfo: {
      ...(incoming.paymentInfo || ({} as RegisteredTeamProfile['paymentInfo'])),
      status: 'PENDING',
      receiptNo: 'PENDING',
      transactionId: 'PENDING',
    },
  };
}

/** Removes the stored password hash from a team record before it leaves the server. */
export function withoutAccessCode(team: RegisteredTeamProfile): RegisteredTeamProfile {
  const { captainGoogleSub: _sub, ...rest } = team;
  return { ...rest, accessCode: '', captainGoogleLinked: Boolean(team.captainGoogleSub) };
}
