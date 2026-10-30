import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GcdisLogo } from '../components/GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import {
  saveRegisteredTeam,
  setCurrentSession,
  RegisteredTeamProfile,
  getDivisionFee,
} from '../data/teamAuthData';
import { syncTeamToSheet, getStoredSheetInfo } from '../services/googleSheetsService';
import { DEFAULT_LINKED_ACCOUNT } from '../services/googleAuth';

export interface TeamRegistrationPageProps {
  onNavigate: (tab: string) => void;
  onRegisterSuccess?: (team: RegisteredTeamProfile) => void;
}

export const TeamRegistrationPage: React.FC<TeamRegistrationPageProps> = ({
  onNavigate,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    teamName: '',
    institution: '',
    city: '',
    state: '',
    division: 'Class 40 (400mm Heavy Sphere)',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    password: '',
    confirmPassword: '',
    strikerPilot: '',
    goalkeeper: '',
    defender1: '',
    defender2: '',
    pitMechanic: '',
    droneModel: '',
    controlProtocol: 'ELRS 2.4GHz',
    vtxBand: '5.8GHz Raceband (Locked Channels)',
    failsafeAgreed: true,
  });

  const [generatedPass, setGeneratedPass] = useState<{
    teamId: string;
    qrSeed: string;
    registeredAt: string;
    slot: string;
  } | null>(null);

  const [createdProfile, setCreatedProfile] = useState<RegisteredTeamProfile | null>(null);
  const [, setSheetSyncStatus] = useState<{
    synced: boolean;
    url?: string;
    loading: boolean;
    message?: string;
    error?: string;
  }>({ synced: false, loading: false });

  const selectedFee = getDivisionFee(formData.division);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password.trim().length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match. Please re-enter your confirmation password.');
        return;
      }
      setPasswordError('');
    }
    if (step < 3) {
      setStep((prev) => (prev + 1) as 2 | 3);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      const randomId = `GDSL-26-T${Math.floor(100 + Math.random() * 900)}`;
      const regDateStr = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      setGeneratedPass({
        teamId: randomId,
        qrSeed: `https://gcdis.galgotias.edu/pass/${randomId}`,
        registeredAt: regDateStr,
        slot: 'Arena Cage 1 · Scrutineering Bay 04',
      });

      const divisionFormatted = formData.division.includes('20')
        ? 'Class 20 (200mm)'
        : 'Class 40 (400mm)';
      const feeInfo = getDivisionFee(divisionFormatted);

      const newProfile: RegisteredTeamProfile = {
        teamId: randomId,
        accessCode: formData.password.trim() || 'gdsl2026',
        teamName: formData.teamName || 'Galgotias Aerial Squad',
        institution: formData.institution || 'Galgotias University',
        city: formData.city || 'Greater Noida',
        state: formData.state || 'Uttar Pradesh',
        division: divisionFormatted,
        captainName: formData.captainName || 'Team Captain',
        captainEmail: formData.captainEmail || 'captain@gdsl.in',
        captainPhone: formData.captainPhone || '+91 98123 45678',
        strikerPilot: formData.strikerPilot || 'Striker Pilot',
        goalkeeper: formData.goalkeeper || 'Goalkeeper Pilot',
        defender1: formData.defender1 || 'Defender 1',
        defender2: formData.defender2 || 'Defender 2',
        pitMechanic: formData.pitMechanic || 'Pit Mechanic',
        droneModel: formData.droneModel || 'AeroSphere 400 Pro',
        controlProtocol: formData.controlProtocol,
        vtxBand: formData.vtxBand,
        failsafeAgreed: formData.failsafeAgreed,
        registeredAt: regDateStr,
        allocatedPit: 'Arena Cage 1 · Scrutineering Bay 04',
        scrutineeringStatus: 'PENDING_ON_SITE',
        paymentInfo: {
          receiptNo: 'PENDING',
          amount: feeInfo.formatted,
          status: 'PENDING',
          transactionId: 'PENDING',
          paymentMode: 'Pending Dashboard Checkout',
          paidAt: 'Awaiting Fee Payment',
          currency: 'INR',
        },
      };

      saveRegisteredTeam(newProfile);
      setCurrentSession(newProfile);
      setCreatedProfile(newProfile);
      if (onRegisterSuccess) {
        onRegisterSuccess(newProfile);
      }

      setStep(4);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });

      (async () => {
        try {
          setSheetSyncStatus({ synced: false, loading: true });
          const syncResult = await syncTeamToSheet(newProfile);
          setSheetSyncStatus({
            synced: true,
            url: syncResult.spreadsheetUrl,
            loading: false,
            message: syncResult.message,
          });
        } catch (err: any) {
          console.warn('Google Sheets auto-sync notice:', err);
          setSheetSyncStatus({
            synced: true,
            url: getStoredSheetInfo().spreadsheetUrl || undefined,
            loading: false,
            message: `Roster queued for sync to ${DEFAULT_LINKED_ACCOUNT} Google Sheet.`,
          });
        }
      })();
    }
  };

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span>REGISTRATIONS OPEN · D-20: ₹1,400 · D-40: ₹4,000</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            OFFICIAL TEAM REGISTRATION
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Submit your university squad roster and drone specifications. After registration, complete your division entry fee payment (₹1,400 for D-20 or ₹4,000 for D-40) in your Squad Dashboard to unlock your Official Event Pass.
          </p>
        </div>

        {/* Progress Stepper (Only for Steps 1-3) */}
        {step < 4 && (
          <div className="flex items-center justify-between max-w-xl mx-auto border-b border-blue-200 pb-6">
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 1 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                1
              </span>
              <span className="text-xs font-sans font-bold text-blue-950 uppercase hidden sm:inline">
                Team Info
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-blue-100 mx-3" />
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 2 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                2
              </span>
              <span className="text-xs font-sans font-bold text-blue-950 uppercase hidden sm:inline">
                Pilot Roster
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-blue-100 mx-3" />
            <div className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 3 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                3
              </span>
              <span className="text-xs font-sans font-bold text-blue-950 uppercase hidden sm:inline">
                Cage Specs
              </span>
            </div>
          </div>
        )}

        {/* STEP 1: TEAM & INSTITUTION */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep}
            className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-10 shadow-xs text-left space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <h2 className="text-xl font-sans font-black text-blue-950 uppercase">
                STEP 1: SQUAD &amp; INSTITUTION DETAILS
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Selected Fee: {selectedFee.formatted} ({selectedFee.code})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Team Name *
                </label>
                <input
                  required
                  type="text"
                  name="teamName"
                  placeholder="e.g. Galgotias Aero Hawks"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  University / College *
                </label>
                <input
                  required
                  type="text"
                  name="institution"
                  placeholder="e.g. Galgotias University"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  City &amp; State *
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  placeholder="e.g. Greater Noida, Uttar Pradesh"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Drone Soccer Division &amp; Entry Fee *
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Class 40 (400mm Heavy Sphere)">
                    Class 40 / D-40 (400mm Sphere · ₹4,000 Registration Fee · ₹94,000 Pool)
                  </option>
                  <option value="Class 20 (200mm Varsity Sphere)">
                    Class 20 / D-20 (200mm Sphere · ₹1,400 Registration Fee · ₹74,000 Pool)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Team Captain Name *
                </label>
                <input
                  required
                  type="text"
                  name="captainName"
                  placeholder="Full name"
                  value={formData.captainName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Captain Email Address *
                </label>
                <input
                  required
                  type="email"
                  name="captainEmail"
                  placeholder="captain@university.edu"
                  value={formData.captainEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Captain Mobile / WhatsApp Number *
                </label>
                <input
                  required
                  type="tel"
                  name="captainPhone"
                  placeholder="+91 98123 45678"
                  value={formData.captainPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                    Create Squad Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-[11px] font-mono font-bold text-blue-700 hover:text-blue-900 uppercase cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters for Squad Login"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Confirm Squad Password *
                </label>
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono font-bold text-red-700">
                {passwordError}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Continue to Pilot Roster →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PILOT ROSTER */}
        {step === 2 && (
          <form
            onSubmit={handleNextStep}
            className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-10 shadow-xs text-left space-y-6"
          >
            <h2 className="text-xl font-sans font-black text-blue-950 uppercase border-b border-blue-100 pb-3">
              STEP 2: GCDIS 5-PLAYER FLYING ROSTER &amp; POSITIONS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-mono font-black text-emerald-950 uppercase mb-1">
                  No.1 Striker Pilot (Green LED + Tag) *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  The primary attacking pilot authorized to score through the goal hoop.
                </span>
                <input
                  required
                  type="text"
                  name="strikerPilot"
                  placeholder="Pilot name (e.g. Aarav Sharma)"
                  value={formData.strikerPilot}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-emerald-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200">
                <label className="block text-xs font-mono font-black text-pink-950 uppercase mb-1">
                  No.2 Guide Pilot (Pink LED + Tag) *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  Protects Striker and authorized for in-game Striker substitution.
                </span>
                <input
                  required
                  type="text"
                  name="defender1"
                  placeholder="Pilot name (e.g. Ananya Sen)"
                  value={formData.defender1}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-pink-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200">
                <label className="block text-xs font-mono font-bold text-sky-950 uppercase mb-1">
                  No.3 Libero (SkyBlue LED · Front Defender) *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  Hits opponent Guide and Striker in front of the goal.
                </span>
                <input
                  required
                  type="text"
                  name="defender2"
                  placeholder="Pilot name (e.g. Vikramaditya Rao)"
                  value={formData.defender2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-sky-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <label className="block text-xs font-mono font-bold text-amber-950 uppercase mb-1">
                  No.4 Sweeper (Yellow LED · Rear Defender) *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  Blocks opponent Striker goal approach in mid-court.
                </span>
                <input
                  required
                  type="text"
                  name="captainName"
                  placeholder="Pilot name (e.g. Raghav Joshi)"
                  value={formData.captainName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-amber-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300">
                <label className="block text-xs font-mono font-black text-slate-950 uppercase mb-1">
                  No.5 Keeper (White LED · Goal Defender) *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  Guards the circular hoop and defends 1-on-1 penalty kicks.
                </span>
                <input
                  required
                  type="text"
                  name="goalkeeper"
                  placeholder="Pilot name (e.g. Rohan Verma)"
                  value={formData.goalkeeper}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200">
                <label className="block text-xs font-mono font-bold text-blue-950 uppercase mb-1">
                  Pit Mechanic / Battery Technician *
                </label>
                <span className="text-[10px] text-slate-500 block mb-2">
                  Performs 5-minute inter-set battery swaps and cage repairs.
                </span>
                <input
                  required
                  type="text"
                  name="pitMechanic"
                  placeholder="Technician name"
                  value={formData.pitMechanic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Continue to Drone Specs →
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DRONE CAGE & RADIO SPECIFICATIONS */}
        {step === 3 && (
          <form
            onSubmit={handleNextStep}
            className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-10 shadow-xs text-left space-y-6"
          >
            <h2 className="text-xl font-sans font-black text-blue-950 uppercase border-b border-blue-100 pb-3">
              STEP 3: DRONE HARDWARE &amp; SAFETY DECLARATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Drone / Exoskeleton Frame Model *
                </label>
                <input
                  required
                  type="text"
                  name="droneModel"
                  placeholder="e.g. HawkSphere 400X Carbon / Skyball V3"
                  value={formData.droneModel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Radio Control Protocol *
                </label>
                <select
                  name="controlProtocol"
                  value={formData.controlProtocol}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ELRS 2.4GHz">ExpressLRS 2.4GHz (Packet Rate 250Hz)</option>
                  <option value="TBS Crossfire 868/915MHz">TBS Crossfire (868/915MHz)</option>
                  <option value="FrSky 2.4GHz ACCST">FrSky ACCESS / ACCST 2.4GHz</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Video Transmission Band *
                </label>
                <select
                  name="vtxBand"
                  value={formData.vtxBand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5.8GHz Raceband">5.8GHz Analog Raceband (R1 - R8)</option>
                  <option value="HDZero 5.8GHz">HDZero Low Latency Digital</option>
                  <option value="Walksnail Avatar HD">Walksnail Avatar HD Race Mode</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-6">
                <input
                  required
                  type="checkbox"
                  id="failsafeAgreed"
                  checked={formData.failsafeAgreed}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, failsafeAgreed: e.target.checked }))
                  }
                  className="w-5 h-5 rounded text-blue-900 border-blue-300 focus:ring-blue-500"
                />
                <label htmlFor="failsafeAgreed" className="text-xs text-slate-700 font-medium">
                  We confirm our drones have an automatic throttle-kill failsafe within 1.0 second of signal loss and 360° LED identification.
                </label>
              </div>
            </div>

            {/* Fee Notice Box */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-blue-950 block uppercase">
                  Next Step: Complete Registration Payment in Squad Dashboard
                </span>
                <span className="text-slate-600">
                  Your squad account will be created now. Official Event Passes unlock in your Squad Dashboard once the {selectedFee.formatted} ({selectedFee.code}) fee is paid.
                </span>
              </div>
              <div className="font-mono font-bold text-base text-blue-950 shrink-0">
                Fee: {selectedFee.formatted}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                SUBMIT REGISTRATION &amp; PROCEED TO DASHBOARD →
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: REGISTRATION RECORDED — PROCEED TO DASHBOARD FOR PAYMENT & EVENT PASS */}
        {step === 4 && generatedPass && createdProfile && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-white border border-blue-200 rounded-3xl p-8 sm:p-10 shadow-xl text-left space-y-6">
              <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                <div className="flex items-center gap-3">
                  <GcdisLogo size="md" showWordmark={false} />
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase block">
                      STEP 4 OF 4 · PAYMENT PENDING IN DASHBOARD
                    </span>
                    <h3 className="font-sans font-black text-lg uppercase text-blue-950">
                      SQUAD ACCOUNT CREATED
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-blue-950 bg-blue-50 px-3 py-1 rounded border border-blue-200">
                  {generatedPass.teamId}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your squad <strong>{createdProfile.teamName}</strong> has been registered for{' '}
                <strong>{createdProfile.division}</strong>. To unlock and download your{' '}
                <strong>Official GDSL 2026 Event Pass</strong> and tax invoice, please complete the{' '}
                <strong>{createdProfile.paymentInfo.amount}</strong> entry fee payment inside your Squad Dashboard.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block font-mono uppercase text-[10px]">Assigned Team ID</span>
                  <span className="font-mono font-bold text-blue-950 text-sm">{createdProfile.teamId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono uppercase text-[10px]">Squad Account Password</span>
                  <span className="font-mono font-bold text-blue-950 text-sm">{createdProfile.accessCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-mono uppercase text-[10px]">Registration Fee Due</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {createdProfile.paymentInfo.amount} ({createdProfile.division.includes('20') ? 'D-20' : 'D-40'})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>OPEN SQUAD DASHBOARD TO PAY {createdProfile.paymentInfo.amount} &amp; UNLOCK PASS →</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TeamRegistrationPage;
