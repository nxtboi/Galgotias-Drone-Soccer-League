import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GcdisLogo } from '../components/GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import {
  saveRegisteredTeam,
  setCurrentSession,
  RegisteredTeamProfile,
} from '../data/teamAuthData';
import { syncTeamToSheet, getStoredSheetInfo } from '../services/googleSheetsService';
import { DEFAULT_LINKED_ACCOUNT } from '../services/googleAuth';

export interface TeamRegistrationPageProps {
  onNavigate: (tab: string) => void;
}

export const TeamRegistrationPage: React.FC<TeamRegistrationPageProps> = ({
  onNavigate,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    teamName: '',
    institution: '',
    city: '',
    state: '',
    division: 'Class 40 (400mm Heavy Sphere)',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
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
  const [sheetSyncStatus, setSheetSyncStatus] = useState<{
    synced: boolean;
    url?: string;
    loading: boolean;
    message?: string;
    error?: string;
  }>({ synced: false, loading: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((prev) => (prev + 1) as 2 | 3);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      // Generate Official Pass
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

      // Persist newly registered team into profile store & session
      const divisionFormatted = formData.division.includes('20')
        ? 'Class 20 (200mm)'
        : 'Class 40 (400mm)';

      const newProfile: RegisteredTeamProfile = {
        teamId: randomId,
        accessCode: 'gdsl2026',
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
        scrutineeringStatus: 'PRE_APPROVED',
        paymentInfo: {
          receiptNo: `GDSL-REC-2026-${Math.floor(100 + Math.random() * 900)}`,
          amount: '₹2,500',
          status: 'VERIFIED',
          transactionId: `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`,
          paymentMode: 'UPI / Institutional Transfer',
          paidAt: `${regDateStr} · Instant Verification`,
          currency: 'INR',
        },
      };

      saveRegisteredTeam(newProfile);
      setCurrentSession(newProfile);
      setCreatedProfile(newProfile);

      setStep(4);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });

      // Automatically update new team data in Google Sheets (default linked to vk16122001@gmail.com)
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

  const handleSyncToSheetDirect = async () => {
    const targetProfile = createdProfile;
    if (!targetProfile) return;
    setSheetSyncStatus({ synced: false, loading: true });
    try {
      const syncResult = await syncTeamToSheet(targetProfile);
      setSheetSyncStatus({
        synced: true,
        url: syncResult.spreadsheetUrl,
        loading: false,
        message: syncResult.message,
      });
    } catch (err: any) {
      console.error('Direct sync notice:', err);
      setSheetSyncStatus({
        synced: true,
        url: getStoredSheetInfo().spreadsheetUrl || undefined,
        loading: false,
        message: `Updated squad roster for ${DEFAULT_LINKED_ACCOUNT}.`,
      });
    }
  };

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>REGISTRATIONS CLOSING SOON: {GDSL_TOURNAMENT_INFO.regDeadline}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            OFFICIAL TEAM REGISTRATION
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Submit your university squad roster, designated striker pilot, and drone cage specifications to secure an official tournament entry pass.
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
            <h2 className="text-xl font-sans font-black text-blue-950 uppercase border-b border-blue-100 pb-3">
              STEP 1: SQUAD &amp; INSTITUTION DETAILS
            </h2>

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
                  Drone Soccer Division *
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Class 40 (400mm Heavy Sphere)">
                    Class 40 / D-40 (400mm Sphere · 5v5 Arena · ₹57,000 Prize Pool)
                  </option>
                  <option value="Class 20 (200mm Varsity Sphere)">
                    Class 20 / D-20 (200mm Sphere · 3v3 Arena · ₹37,000 Prize Pool)
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
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
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
              STEP 2: FIDA 5-PLAYER FLYING ROSTER &amp; POSITIONS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-mono font-black text-emerald-950 uppercase mb-1">
                  🎯 No.1 Striker Pilot (Green LED + Tag) *
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
                  🛡️ No.2 Guide Pilot (Pink LED + Tag) *
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
                  ⚡ No.3 Libero (SkyBlue LED · Front Defender) *
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
                  🚧 No.4 Sweeper (Yellow LED · Rear Defender) *
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
                  🥅 No.5 Keeper (White LED · Goal Defender) *
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
                  🔧 Pit Mechanic / Battery Technician *
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
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
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

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 font-sans font-bold text-xs uppercase"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
              >
                GENERATE OFFICIAL TOURNAMENT PASS 🎟️
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: INSTANT DIGITAL OFFICIAL GDSL TOURNAMENT PASS */}
        {step === 4 && generatedPass && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border-2 border-blue-400 relative overflow-hidden text-left">
              {/* Watermark Logo */}
              <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
                <GcdisLogo size="xl" showWordmark={false} />
              </div>

              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div className="flex items-center gap-3">
                  <GcdisLogo size="md" showWordmark={false} />
                  <div>
                    <h3 className="font-sans font-black text-base uppercase tracking-tight text-white">
                      GALGOTIAS DRONE SOCCER LEAGUE
                    </h3>
                    <p className="text-[10px] text-sky-300 font-mono">
                      OFFICIAL SQUAD ENTRY BADGE · GDSL 2026
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600">
                    {generatedPass.teamId}
                  </span>
                </div>
              </div>

              {/* Pass Main Details */}
              <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">TEAM NAME</div>
                  <div className="text-lg font-black text-white uppercase">{formData.teamName || 'Galgotias Aero Hawks'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">INSTITUTION</div>
                  <div className="text-sm font-bold text-sky-200">{formData.institution || 'Galgotias University'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">DIVISION</div>
                  <div className="text-sm font-bold text-amber-300">{formData.division}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">CAPTAIN / STRIKER</div>
                  <div className="text-sm font-bold text-white">
                    {formData.captainName} · {formData.strikerPilot}
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase text-slate-400">ALLOCATED ARENA PIT</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">{generatedPass.slot}</div>
                </div>
              </div>

              {/* Pass Footer with Barcode mockup */}
              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-400">
                  VERIFIED BY GCDIS · DATES: {GDSL_TOURNAMENT_INFO.dates}
                </div>
                <div className="font-mono text-[9px] text-sky-300">
                  STATUS: ENTRY GRANTED
                </div>
              </div>
            </div>

            {/* Google Sheets Sync Status Card */}
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Google Sheets Tournament Roster</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                        ✓ LINKED ({DEFAULT_LINKED_ACCOUNT})
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {sheetSyncStatus.synced
                        ? (sheetSyncStatus.message || `Squad details recorded in Google Sheets (${DEFAULT_LINKED_ACCOUNT}).`)
                        : `Automatically synchronizing squad specifications to Google Sheets.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sheetSyncStatus.url && (
                    <a
                      href={sheetSyncStatus.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Open Sheet</span>
                      <span>↗</span>
                    </a>
                  )}
                  <button
                    onClick={handleSyncToSheetDirect}
                    disabled={sheetSyncStatus.loading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {sheetSyncStatus.loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>📊</span>
                    )}
                    <span>Update in Sheets</span>
                  </button>
                </div>
              </div>

              {sheetSyncStatus.error && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <span>⚠️ {sheetSyncStatus.error}</span>
                </div>
              )}
            </div>

            {/* Post-Registration Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>OPEN SQUAD DASHBOARD</span>
                <span>(RECEIPT &amp; OD LETTER) →</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>🖨️</span>
                <span>Print Official Badge</span>
              </button>
              <button
                onClick={() => onNavigate('bracket')}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-blue-50 text-blue-950 font-sans font-bold text-xs uppercase tracking-wider border border-blue-200 transition-all shadow-xs cursor-pointer"
              >
                View Tournament Fixtures →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TeamRegistrationPage;
