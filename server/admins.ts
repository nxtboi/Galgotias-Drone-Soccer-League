import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword, verifyPassword } from './auth.ts';

/**
 * Admin accounts for the GDSL portal.
 *
 * - The SUPER ADMIN is the single account from .env (ADMIN_USERNAME / ADMIN_PASSWORD).
 *   Only the super admin can register, approve, disable or remove other admins.
 * - Other ADMINS live in data/admins.json with scrypt-hashed passwords. They can sign in
 *   only while their status is "active": either registered directly by the super admin,
 *   or requested publicly and then approved by the super admin.
 */

export type AdminStatus = 'pending' | 'active' | 'disabled';

export interface AdminAccount {
  id: string;
  username: string; // lowercase
  email: string; // lowercase
  name: string;
  passwordHash: string;
  status: AdminStatus;
  createdAt: string;
  createdBy: 'super_admin' | 'request';
  requestNote?: string;
  approvedAt?: string;
  lastLoginAt?: string;
}

export type PublicAdminAccount = Omit<AdminAccount, 'passwordHash'>;

export const SUPER_ADMIN_ID = 'super';
export const MIN_ADMIN_PASSWORD_LENGTH = 10;
const MAX_PENDING_REQUESTS = 25;

const ADMINS_PATH = path.join(process.cwd(), 'data', 'admins.json');

export class AdminError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function readAdmins(): AdminAccount[] {
  try {
    if (!fs.existsSync(ADMINS_PATH)) return [];
    const parsed = JSON.parse(fs.readFileSync(ADMINS_PATH, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[admins] Could not read data/admins.json:', err);
    return [];
  }
}

function writeAdmins(admins: AdminAccount[]) {
  fs.mkdirSync(path.dirname(ADMINS_PATH), { recursive: true });
  fs.writeFileSync(ADMINS_PATH, JSON.stringify(admins, null, 2), 'utf-8');
}

export function toPublicAdmin(a: AdminAccount): PublicAdminAccount {
  const { passwordHash: _hash, ...rest } = a;
  return rest;
}

export function getSuperAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
}

export function findAdminByIdentifier(identifier: string): AdminAccount | undefined {
  const id = identifier.trim().toLowerCase();
  if (!id) return undefined;
  return readAdmins().find((a) => a.username === id || a.email === id);
}

export function findActiveAdminById(id: string | undefined): AdminAccount | undefined {
  if (!id) return undefined;
  return readAdmins().find((a) => a.id === id && a.status === 'active');
}

function validateNewAdmin(input: { username?: unknown; email?: unknown; name?: unknown; password?: unknown }) {
  const username = String(input.username || '').trim().toLowerCase();
  const email = String(input.email || '').trim().toLowerCase();
  const name = String(input.name || '').trim().slice(0, 80);
  const password = String(input.password || '');

  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    throw new AdminError(400, 'Username must be 3–40 characters: letters, numbers, dot, dash or underscore.');
  }
  if (username === getSuperAdminUsername()) {
    throw new AdminError(409, 'That username is reserved.');
  }
  if (email.length > 200 || !/^[^\s@,;<>"'()\\]+@[^\s@,;<>"'()\\]+\.[A-Za-z]{2,}$/.test(email)) {
    throw new AdminError(400, 'Please enter a valid email address.');
  }
  if (!name) {
    throw new AdminError(400, 'Please enter a name.');
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH || password.length > 200) {
    throw new AdminError(400, `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`);
  }
  const admins = readAdmins();
  if (admins.some((a) => a.username === username)) {
    throw new AdminError(409, 'That username is already taken.');
  }
  if (admins.some((a) => a.email === email)) {
    throw new AdminError(409, 'An admin account with that email already exists.');
  }
  return { username, email, name, password, admins };
}

/** Super admin registers an admin directly (active immediately). */
export function createAdmin(input: { username?: unknown; email?: unknown; name?: unknown; password?: unknown }): AdminAccount {
  const { username, email, name, password, admins } = validateNewAdmin(input);
  const now = new Date().toISOString();
  const account: AdminAccount = {
    id: crypto.randomUUID(),
    username,
    email,
    name,
    passwordHash: hashPassword(password),
    status: 'active',
    createdAt: now,
    createdBy: 'super_admin',
    approvedAt: now,
  };
  writeAdmins([...admins, account]);
  return account;
}

/** Public "request admin access": stored as pending until the super admin approves it. */
export function requestAdminAccess(input: {
  username?: unknown;
  email?: unknown;
  name?: unknown;
  password?: unknown;
  note?: unknown;
}): AdminAccount {
  const { username, email, name, password, admins } = validateNewAdmin(input);
  if (admins.filter((a) => a.status === 'pending').length >= MAX_PENDING_REQUESTS) {
    throw new AdminError(429, 'Too many pending admin requests. Please contact the super admin directly.');
  }
  const account: AdminAccount = {
    id: crypto.randomUUID(),
    username,
    email,
    name,
    passwordHash: hashPassword(password),
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: 'request',
    requestNote: String(input.note || '').trim().slice(0, 300) || undefined,
  };
  writeAdmins([...admins, account]);
  return account;
}

/** Super admin: approve / disable / re-enable an admin, or set a new password. */
export function updateAdmin(id: string, changes: { status?: unknown; password?: unknown }): AdminAccount {
  const admins = readAdmins();
  const index = admins.findIndex((a) => a.id === id);
  if (index < 0) throw new AdminError(404, 'Admin not found.');
  const updated: AdminAccount = { ...admins[index] };

  if (changes.status !== undefined) {
    if (changes.status !== 'active' && changes.status !== 'disabled') {
      throw new AdminError(400, 'Status must be "active" or "disabled".');
    }
    if (changes.status === 'active' && updated.status !== 'active') {
      updated.approvedAt = new Date().toISOString();
    }
    updated.status = changes.status;
  }
  if (changes.password !== undefined) {
    const password = String(changes.password || '');
    if (password.length < MIN_ADMIN_PASSWORD_LENGTH || password.length > 200) {
      throw new AdminError(400, `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`);
    }
    updated.passwordHash = hashPassword(password);
  }

  admins[index] = updated;
  writeAdmins(admins);
  return updated;
}

/** Super admin: delete an admin, or reject a pending request. */
export function deleteAdmin(id: string): void {
  const admins = readAdmins();
  if (!admins.some((a) => a.id === id)) throw new AdminError(404, 'Admin not found.');
  writeAdmins(admins.filter((a) => a.id !== id));
}

export function recordAdminLogin(id: string): void {
  const admins = readAdmins();
  const index = admins.findIndex((a) => a.id === id);
  if (index < 0) return;
  admins[index] = { ...admins[index], lastLoginAt: new Date().toISOString() };
  writeAdmins(admins);
}

/** Checks a (non-super) admin's password. Returns the account, or throws with a user-facing reason. */
export function authenticateAdmin(account: AdminAccount, password: string): AdminAccount {
  // Verify the password first so the reply doesn't reveal account status to someone guessing.
  if (!verifyPassword(account.passwordHash, password)) {
    throw new AdminError(401, 'Incorrect Team ID / email or password.');
  }
  if (account.status === 'pending') {
    throw new AdminError(403, 'Your admin access request is waiting for super admin approval.');
  }
  if (account.status !== 'active') {
    throw new AdminError(403, 'This admin account has been disabled. Please contact the super admin.');
  }
  return account;
}
