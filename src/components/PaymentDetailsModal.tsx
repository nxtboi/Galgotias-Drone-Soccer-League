import React, { useEffect, useState } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  Landmark,
  Smartphone,
  Upload,
  Info,
} from 'lucide-react';
import {
  RegisteredTeamProfile,
  PaymentDetailsConfig,
  EMPTY_PAYMENT_DETAILS,
  getDivisionFee,
  fetchPaymentDetailsConfig,
  hasPaymentDetails,
} from '../data/teamAuthData';

export interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: RegisteredTeamProfile;
  /** Opens the "upload payment proof" flow after the captain has paid. */
  onUploadProof?: () => void;
}

const CopyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div className="flex items-center justify-between gap-3 bg-[#1b1e17] border border-white/10 rounded-xl px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          {label}
        </div>
        <div className="text-sm font-semibold text-white truncate font-mono">{value}</div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#d0fe1d] hover:text-black border border-white/15 text-[#d0fe1d] text-[11px] font-rajdhani font-bold uppercase transition-all cursor-pointer"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  team,
  onUploadProof,
}) => {
  const [details, setDetails] = useState<PaymentDetailsConfig>({ ...EMPTY_PAYMENT_DETAILS });
  const [loading, setLoading] = useState(false);
  const fee = getDivisionFee(team.division);
  const configured = hasPaymentDetails(details);

  // Load the latest payment details from the server each time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    fetchPaymentDetailsConfig()
      .then((cfg) => {
        if (!cancelled) setDetails(cfg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-lg bg-[#141612] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-white my-8">
        {/* Header */}
        <div className="bg-[#1b1e17] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-base font-orbitron font-bold uppercase tracking-wider text-[#d0fe1d]">
              Pay Registration Fee
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {team.teamName} ({team.teamId}) · {team.division}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block font-mono uppercase">Amount</span>
              <span className="text-lg font-orbitron font-bold tabular-nums text-white">
                {fee.formatted}.00
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-left">
          {loading && !configured ? (
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-4 text-neutral-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
              Loading payment details…
            </div>
          ) : !configured ? (
            <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-amber-200 text-xs leading-relaxed">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Payment details have not been published by tournament administration yet. Please
                use <strong>Request Payment Details on Email</strong>, or check back shortly.
              </span>
            </div>
          ) : (
            <>
              {/* UPI */}
              {details.upiId && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>UPI Payment</span>
                  </div>
                  <CopyRow label="UPI ID / VPA" value={details.upiId} />
                  {details.payeeName && <CopyRow label="Payee Name" value={details.payeeName} />}
                </div>
              )}

              {/* QR */}
              {details.qrImageUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Scan to Pay</span>
                  </div>
                  <div className="flex justify-center bg-white rounded-xl p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={details.qrImageUrl}
                      alt="Payment QR code"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Bank transfer */}
              {details.accountNumber && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                    <Landmark className="w-4 h-4" />
                    <span>Bank Transfer (NEFT / IMPS)</span>
                  </div>
                  {details.bankName && <CopyRow label="Bank" value={details.bankName} />}
                  <CopyRow label="Account Number" value={details.accountNumber} />
                  {details.ifsc && <CopyRow label="IFSC" value={details.ifsc} />}
                  {details.branch && <CopyRow label="Branch" value={details.branch} />}
                  {details.payeeName && !details.upiId && (
                    <CopyRow label="Account Name" value={details.payeeName} />
                  )}
                </div>
              )}

              {/* Instructions */}
              {details.instructions && (
                <div className="bg-[#1b1e17] border border-white/10 rounded-xl p-3.5 text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                  {details.instructions}
                </div>
              )}

              <div className="flex items-start gap-2 text-[11px] text-neutral-400 leading-relaxed">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#d0fe1d]" />
                <span>
                  After paying the {fee.formatted} fee, upload your transaction reference and
                  screenshot so administration can verify and confirm your registration.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#1b1e17] border-t border-white/10 px-6 py-4 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
          {onUploadProof && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onUploadProof();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>I&apos;ve Paid · Upload Proof</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
