import fs from 'fs';
import path from 'path';

/**
 * Tournament payment details, configured by the SUPER ADMIN and shown to every team
 * on the "Pay" modal. Stored on the server (data/payment_details.json) so one change
 * reaches all visitors and survives restarts — unlike the old per-browser localStorage.
 */

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

const PAYMENT_PATH = path.join(process.cwd(), 'data', 'payment_details.json');

// Length caps so a bad/oversized payload can't bloat the store (qrImageUrl may be a data: URI).
const MAX_LEN: Record<keyof PaymentDetailsConfig, number> = {
  payeeName: 120,
  upiId: 120,
  bankName: 120,
  accountNumber: 40,
  ifsc: 20,
  branch: 120,
  qrImageUrl: 2_000_000,
  instructions: 2000,
  updatedAt: 40,
};

export function readPaymentDetails(): PaymentDetailsConfig {
  try {
    if (!fs.existsSync(PAYMENT_PATH)) return { ...EMPTY_PAYMENT_DETAILS };
    const parsed = JSON.parse(fs.readFileSync(PAYMENT_PATH, 'utf-8'));
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_PAYMENT_DETAILS };
    return { ...EMPTY_PAYMENT_DETAILS, ...parsed };
  } catch (err) {
    console.warn('[payments] Could not read data/payment_details.json:', err);
    return { ...EMPTY_PAYMENT_DETAILS };
  }
}

/** Validates and saves the super admin's payment details, stamping updatedAt. */
export function savePaymentDetails(input: unknown): PaymentDetailsConfig {
  const incoming = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const current = readPaymentDetails();
  const next: PaymentDetailsConfig = { ...current };

  (Object.keys(EMPTY_PAYMENT_DETAILS) as (keyof PaymentDetailsConfig)[]).forEach((key) => {
    if (key === 'updatedAt') return; // server-stamped, never client-set
    if (incoming[key] === undefined) return; // field omitted -> keep current value
    const value = String(incoming[key] ?? '').trim().slice(0, MAX_LEN[key]);
    next[key] = value;
  });

  next.updatedAt = new Date().toISOString();

  fs.mkdirSync(path.dirname(PAYMENT_PATH), { recursive: true });
  fs.writeFileSync(PAYMENT_PATH, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}
