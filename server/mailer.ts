import nodemailer, { type Transporter } from 'nodemailer';
import type { RegisteredTeamProfile } from '../src/data/teamAuthData.ts';
import { getDivisionFee } from '../src/data/teamAuthData.ts';

/**
 * Payment-details emails, sent from ONE official GDSL address (MAIL_FROM) to the team that
 * asked for them. Configure in .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.
 * When email is not configured, requests are only recorded and the secretariat sends the
 * details manually (the admin dashboard / Excel show "Email Requested To").
 */

function env(name: string, fallback = ''): string {
  return (process.env[name] || fallback).trim();
}

export function isEmailConfigured(): boolean {
  return Boolean(env('SMTP_HOST') && env('MAIL_FROM'));
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(env('SMTP_PORT', '465'));
    transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      secure: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
      auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
  return transporter;
}

export async function verifyEmailTransport(): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[mail] Email is not configured (SMTP_HOST, MAIL_FROM): payment-detail requests are recorded for manual sending.');
    return;
  }
  try {
    await getTransporter()?.verify();
    console.log(`[mail] SMTP ready (${env('SMTP_HOST')}), sending as ${env('MAIL_FROM')}`);
  } catch (err: any) {
    console.warn(`[mail] SMTP connection check failed: ${err?.message || err}`);
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip CR/LF so team-supplied text can never break an email header. */
function oneLine(value: unknown, max = 120): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);
}

/** Organiser payment details from .env. Empty rows are left out of the email. */
function paymentAccountRows(): [string, string][] {
  const rows: [string, string][] = [
    ['Account Holder', env('PAYMENT_ACCOUNT_NAME')],
    ['Bank', env('PAYMENT_BANK_NAME')],
    ['Account Number', env('PAYMENT_ACCOUNT_NUMBER')],
    ['IFSC Code', env('PAYMENT_IFSC')],
    ['Branch', env('PAYMENT_BRANCH')],
    ['UPI ID', env('PAYMENT_UPI_ID')],
  ];
  return rows.filter(([, v]) => v);
}

export function buildPaymentDetailsEmail(team: RegisteredTeamProfile, portalUrl: string) {
  const fee = getDivisionFee(team.division);
  const reference = `${team.teamId} - ${oneLine(team.teamName, 60)}`;
  const account = paymentAccountRows();
  const contactEmail = env('PAYMENT_CONTACT_EMAIL', env('MAIL_FROM'));
  const contactPhone = env('PAYMENT_CONTACT_PHONE');
  const dashboardUrl = portalUrl.replace(/\/$/, '');
  const subject = `GDSL 2026 fee payment details - ${oneLine(team.teamName, 60)} (${team.teamId})`;

  const accountText = account.length
    ? account.map(([k, v]) => `${k}: ${v}`).join('\n')
    : 'Our account details will be shared by the secretariat shortly.';

  const text = `Dear ${oneLine(team.captainName) || 'Team Captain'},

Thank you for registering for the Galgotias Drone Soccer League (GDSL 2026).
Please pay your registration fee using the details below.

TEAM
Team Name: ${oneLine(team.teamName)}
Team ID: ${team.teamId}
Division: ${team.division} (${fee.code})
Amount Payable: ${fee.formatted}.00 (INR)

PAY TO
${accountText}

Payment remarks / reference: ${reference}

AFTER PAYING
1. Sign in to the Team Dashboard: ${dashboardUrl}
2. Open Payment and upload your Transaction ID / UTR and a screenshot of the payment.
3. The secretariat will verify it and unlock your Official Event Pass.

Questions? ${contactEmail}${contactPhone ? ` | ${contactPhone}` : ''}

Regards,
GCDIS Finance & Scrutineering Desk
Galgotias University, Greater Noida`;

  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111827;font-weight:600">${escapeHtml(v)}</td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#111210;padding:20px 24px">
    <div style="color:#d0fe1d;font-size:12px;letter-spacing:2px;font-weight:700">GALGOTIAS DRONE SOCCER LEAGUE 2026</div>
    <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:6px">Registration fee payment details</div>
  </td></tr>
  <tr><td style="padding:24px">
    <p style="margin:0 0 16px;color:#111827;font-size:15px">Dear ${escapeHtml(team.captainName || 'Team Captain')},</p>
    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.5">Thank you for registering. Please pay your registration fee using the details below.</p>
    <div style="font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;margin-bottom:4px">TEAM</div>
    <table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px;margin-bottom:20px">
      ${row('Team Name', team.teamName)}
      ${row('Team ID', team.teamId)}
      ${row('Division', `${team.division} (${fee.code})`)}
    </table>
    <div style="background:#f7fee7;border:1px solid #d9f99d;border-radius:10px;padding:16px;margin-bottom:20px">
      <div style="font-size:12px;color:#4d7c0f;font-weight:700;letter-spacing:1px">AMOUNT PAYABLE</div>
      <div style="font-size:26px;color:#111827;font-weight:800;margin-top:4px">${escapeHtml(fee.formatted)}.00</div>
    </div>
    <div style="font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;margin-bottom:4px">PAY TO</div>
    ${
      account.length
        ? `<table role="presentation" cellspacing="0" cellpadding="0" style="font-size:14px;margin-bottom:12px">${account
            .map(([k, v]) => row(k, v))
            .join('')}</table>`
        : `<p style="margin:0 0 12px;color:#374151;font-size:14px">Our account details will be shared by the secretariat shortly.</p>`
    }
    <p style="margin:0 0 20px;font-size:14px;color:#374151">Payment remarks / reference: <strong style="color:#111827">${escapeHtml(reference)}</strong></p>
    <div style="font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;margin-bottom:6px">AFTER PAYING</div>
    <ol style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:14px;line-height:1.6">
      <li>Sign in to the Team Dashboard.</li>
      <li>Open <strong>Payment</strong> and upload your Transaction ID / UTR and a payment screenshot.</li>
      <li>The secretariat will verify it and unlock your Official Event Pass.</li>
    </ol>
    <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#d0fe1d;color:#111210;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;font-size:14px">Open Team Dashboard</a>
    <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.5">Questions? ${escapeHtml(contactEmail)}${
      contactPhone ? ` &middot; ${escapeHtml(contactPhone)}` : ''
    }<br>GCDIS Finance &amp; Scrutineering Desk, Galgotias University, Greater Noida</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}

/** Sends the payment details from the single official address (MAIL_FROM). */
export async function sendPaymentDetailsEmail(team: RegisteredTeamProfile, to: string, portalUrl: string): Promise<void> {
  const t = getTransporter();
  if (!t) throw new Error('EMAIL_NOT_CONFIGURED');
  const { subject, text, html } = buildPaymentDetailsEmail(team, portalUrl);
  await t.sendMail({
    from: env('MAIL_FROM'),
    to,
    replyTo: env('PAYMENT_CONTACT_EMAIL') || undefined,
    subject,
    text,
    html,
  });
}
