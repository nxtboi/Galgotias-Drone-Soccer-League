import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  X,
  ArrowRight,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { RegisteredTeamProfile, getDivisionFee } from '../data/teamAuthData';

export interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: RegisteredTeamProfile;
  onPaymentSuccess: (paymentDetails: {
    receiptNo: string;
    amount: string;
    transactionId: string;
    paymentMode: string;
    paidAt: string;
  }) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  team,
  onPaymentSuccess,
}) => {
  const fee = getDivisionFee(team.division);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // UPI State
  const [upiMode, setUpiMode] = useState<'qr' | 'vpa'>('qr');
  const [upiVpa, setUpiVpa] = useState('');
  const [copiedUpiId, setCopiedUpiId] = useState(false);

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(team.captainName || '');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Net Banking / Institutional State
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [utrReference, setUtrReference] = useState('');

  // Processing & Validation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const merchantUpi = 'gcdis.galgotias@hdfcbank';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpi);
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2000);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const finalizeTransaction = (paymentModeLabel: string, txPrefix: string) => {
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const receiptNo = `GDSL-REC-2026-${Math.floor(100 + Math.random() * 900)}`;
      const transactionId =
        utrReference.trim() ||
        `${txPrefix}-${Math.floor(100000000 + Math.random() * 900000000)}`;

      setIsProcessing(false);
      setOtpStep(false);
      onPaymentSuccess({
        receiptNo,
        amount: fee.formatted,
        transactionId,
        paymentMode: paymentModeLabel,
        paidAt: `${dateStr} · ${timeStr} IST`,
      });
    }, 900);
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upiMode === 'vpa') {
      if (!upiVpa.includes('@') || upiVpa.trim().length < 5) {
        setErrorMsg('Please enter a valid UPI ID (e.g. captain@okaxis or 9811234567@ybl).');
        return;
      }
      finalizeTransaction(`UPI (${upiVpa.trim()})`, 'UPI-NPCI');
    } else {
      finalizeTransaction('UPI QR Instant Scan', 'UPI-QR');
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const rawDigits = cardNumber.replace(/\s/g, '');
    if (!otpStep) {
      if (rawDigits.length < 16) {
        setErrorMsg('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please enter card expiry in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a valid 3-digit CVV.');
        return;
      }
      setOtpStep(true);
      return;
    }

    if (otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification OTP.');
      return;
    }

    const last4 = rawDigits.slice(-4);
    finalizeTransaction(`Card (ending ${last4})`, 'CARD-AUTH');
  };

  const handleNetBankingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    finalizeTransaction(`Net Banking (${selectedBank})`, 'NEFT-BANK');
  };

  const banks = [
    'State Bank of India (SBI)',
    'HDFC Bank Corporate',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank (PNB)',
    'Kotak Mahindra Bank',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Top Merchant Header (Razorpay Checkout Style) */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
              GDSL
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Galgotias Drone Soccer League 2026
                </h2>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {team.teamName} ({team.teamId}) · {team.division}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Payable Fee</span>
              <span className="text-lg font-bold font-mono tabular-nums text-white">
                {fee.formatted}.00
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close payment gateway"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Division Fee Breakdown Strip */}
        <div className="bg-slate-800/50 border-b border-slate-700/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <span>
            Category: <strong className="text-white">{fee.code} ({team.division})</strong>
          </span>
          <span className="font-mono tabular-nums">
            Registration Fee: <strong className="text-emerald-400">{fee.formatted}</strong> (D-20: ₹1,400 · D-40: ₹4,000)
          </span>
        </div>

        {/* Body: Sidebar Payment Methods + Main Method Form */}
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[380px]">
          {/* Left Method Selector */}
          <div className="sm:col-span-4 bg-slate-800/40 border-b sm:border-b-0 sm:border-r border-slate-700 p-3 space-y-1.5 text-left">
            <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
              Payment Options
            </div>
            <button
              type="button"
              onClick={() => {
                setMethod('upi');
                setOtpStep(false);
                setErrorMsg(null);
              }}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                method === 'upi'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-semibold">UPI / QR</div>
                <div className="text-[10px] opacity-80">GPay, PhonePe, Paytm</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('card');
                setOtpStep(false);
                setErrorMsg(null);
              }}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                method === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-semibold">Credit / Debit Card</div>
                <div className="text-[10px] opacity-80">Visa, Mastercard, RuPay</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('netbanking');
                setOtpStep(false);
                setErrorMsg(null);
              }}
              className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                method === 'netbanking'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-semibold">Net Banking</div>
                <div className="text-[10px] opacity-80">All Indian Banks &amp; NEFT</div>
              </div>
            </button>
          </div>

          {/* Right Active Payment Form */}
          <div className="sm:col-span-8 p-6 flex flex-col justify-between text-left">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-red-950/60 border border-red-700/60 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* METHOD 1: UPI */}
            {method === 'upi' && (
              <form onSubmit={handleUpiSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                    <h3 className="text-sm font-semibold text-white">Instant UPI Payment</h3>
                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-md border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setUpiMode('qr')}
                        className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                          upiMode === 'qr' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Scan QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode('vpa')}
                        className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                          upiMode === 'vpa' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Enter UPI ID
                      </button>
                    </div>
                  </div>

                  {upiMode === 'qr' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                      {/* Crisp SVG QR Code */}
                      <div className="w-32 h-32 bg-white p-2.5 rounded-lg shrink-0 flex flex-col items-center justify-center border border-slate-300">
                        <QrCode className="w-24 h-24 text-slate-900" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="font-semibold text-white">
                          Scan with any UPI App ({fee.formatted}.00)
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          Open Google Pay, PhonePe, Paytm, or BHIM on your phone and scan the QR code to pay the {team.division} registration fee.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <span className="font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                            {merchantUpi}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedUpiId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUpiId ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1.5">
                          Virtual Payment Address (UPI ID)
                        </label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="e.g. captain@okaxis or 9811234567@ybl"
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['@okaxis', '@oksbi', '@ybl', '@paytm', '@icici'].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const base = upiVpa.split('@')[0] || 'captain';
                              setUpiVpa(`${base}${suffix}`);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying UPI Payment with NPCI...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Pay {fee.formatted}.00</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 2: CREDIT / DEBIT CARD */}
            {method === 'card' && (
              <form onSubmit={handleCardSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                {!otpStep ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <h3 className="text-sm font-semibold text-white">Enter Card Details</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNumber('4532 8910 4421 8892');
                          setCardExpiry('08/28');
                          setCardCvv('419');
                        }}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Fill Demo Test Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm font-mono tabular-nums text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm font-mono tabular-nums text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm font-mono tabular-nums text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3.5 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-b border-slate-700 pb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">3D Secure Bank OTP Verification</h3>
                      <button
                        type="button"
                        onClick={() => setOtpCode('482910')}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Auto-Fill OTP (482910)
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Enter the 6-digit OTP sent to {team.captainPhone} to authorize payment of{' '}
                      <strong className="text-white">{fee.formatted}.00</strong>.
                    </p>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">One-Time Password (OTP)</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-md text-base font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing Card Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{otpStep ? `Confirm OTP & Pay ${fee.formatted}.00` : `Proceed to Pay ${fee.formatted}.00`}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 3: NET BANKING & INSTITUTIONAL TRANSFER */}
            {method === 'netbanking' && (
              <form onSubmit={handleNetBankingSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="border-b border-slate-700 pb-2">
                    <h3 className="text-sm font-semibold text-white">Net Banking &amp; Institutional NEFT</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {banks.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-md border text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-blue-950/60 border-blue-500 text-white font-medium'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span className="truncate">{bank}</span>
                        {selectedBank === bank && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Optional: Institutional UTR / NEFT Reference (if pre-transferred by University)
                    </label>
                    <input
                      type="text"
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      placeholder="Leave blank for instant online Net Banking redirect"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Bank Transfer...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay {fee.formatted}.00 via {selectedBank.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Security Bar */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>256-Bit TLS Encrypted Payment Gateway · GCDIS Finance</span>
          </span>
          <span>Instant Event Pass &amp; GST Invoice Unlock</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
