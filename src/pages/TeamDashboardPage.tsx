import React, { useState } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  RegisteredTeamProfile,
  saveRegisteredTeam,
  setCurrentSession,
  clearCurrentSession,
} from '../data/teamAuthData';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface TeamDashboardPageProps {
  team: RegisteredTeamProfile;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  onUpdateTeam?: (updated: RegisteredTeamProfile) => void;
}

export const TeamDashboardPage: React.FC<TeamDashboardPageProps> = ({
  team,
  onLogout,
  onNavigate,
  onUpdateTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'receipt' | 'attendance' | 'schedule'>('profile');

  // Profile editable state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phoneInput, setPhoneInput] = useState(team.captainPhone);
  const [droneModelInput, setDroneModelInput] = useState(team.droneModel);
  const [vtxBandInput, setVtxBandInput] = useState(team.vtxBand);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Attendance Letter generator state
  const [facultyName, setFacultyName] = useState(
    team.attendanceData?.facultyName || 'The Dean / Head of Department'
  );
  const [designation, setDesignation] = useState(
    team.attendanceData?.designation || 'Head of Department'
  );
  const [department, setDepartment] = useState(
    team.attendanceData?.department || 'Department of Mechanical / Aerospace Engineering'
  );
  const [collegeName, setCollegeName] = useState(
    team.attendanceData?.collegeName || team.institution
  );
  const [includeTravelDates, setIncludeTravelDates] = useState(
    team.attendanceData?.travelDatesIncluded ?? true
  );

  // Default students roster with roll numbers
  const [students, setStudents] = useState(
    team.attendanceData?.students || [
      { name: team.captainName, role: 'Team Captain & Telemetry Lead', rollNo: 'ROLL-01' },
      { name: team.strikerPilot, role: 'Designated Striker Pilot', rollNo: 'ROLL-02' },
      { name: team.goalkeeper, role: 'Goalkeeper Pilot', rollNo: 'ROLL-03' },
      { name: team.defender1, role: 'Defender 1 (Libero)', rollNo: 'ROLL-04' },
      { name: team.defender2, role: 'Defender 2 (Sweeper)', rollNo: 'ROLL-05' },
      { name: team.pitMechanic, role: 'Pit Engineer / Mechanic', rollNo: 'ROLL-06' },
    ]
  );

  const [odDispatchedAlert, setOdDispatchedAlert] = useState<string | null>(null);
  const [copiedReceiptId, setCopiedReceiptId] = useState(false);
  const [scheduleSubscribed, setScheduleSubscribed] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      captainPhone: phoneInput,
      droneModel: droneModelInput,
      vtxBand: vtxBandInput,
    };
    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
    setIsEditingProfile(false);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const handleUpdateStudentRoll = (index: number, roll: string) => {
    const updated = [...students];
    updated[index].rollNo = roll;
    setStudents(updated);
  };

  const handleDispatchOdRequest = () => {
    // Save attendance configuration to team profile
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      attendanceData: {
        facultyName,
        designation,
        department,
        collegeName,
        travelDatesIncluded: includeTravelDates,
        students,
      },
    };
    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);

    setOdDispatchedAlert(
      `Official Attendance OD Request (Ref: GCDIS/OD-2026/${team.teamId}) has been registered and emailed to ${team.captainEmail} & the GCDIS Academic Liaison office!`
    );
    setTimeout(() => setOdDispatchedAlert(null), 6000);
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(team.paymentInfo.receiptNo);
    setCopiedReceiptId(true);
    setTimeout(() => setCopiedReceiptId(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/30 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="flex items-start sm:items-center gap-4">
            <div className="shrink-0 p-2 bg-white/10 rounded-2xl border border-white/20">
              <GcdisLogo size="md" showWordmark={false} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase">
                  {team.teamId}
                </span>
                <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONFIRMED ENTRY
                </span>
                <span className="font-mono text-xs bg-white/10 text-sky-200 px-2.5 py-0.5 rounded-full">
                  {team.division}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-sans font-black uppercase tracking-tight text-white">
                {team.teamName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans">
                {team.institution} · {team.city}, {team.state}
              </p>
            </div>
          </div>

          {/* Quick Stats & Logout */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">PIT ASSIGNMENT</span>
              <span className="text-xs font-mono font-bold text-amber-300">{team.allocatedPit}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('home')}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-sans text-xs uppercase font-bold transition-all border border-white/10"
              >
                Website Home
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white font-sans text-xs uppercase font-bold transition-all shadow-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-blue-200 pb-3">
          {[
            { id: 'profile', label: 'Squad Profile & Roster', icon: '📋' },
            { id: 'receipt', label: 'Payment Receipt (₹2,500)', icon: '🧾' },
            { id: 'attendance', label: 'Attendance OD Application', icon: '🎓' },
            { id: 'schedule', label: 'Match Schedule (Coming Soon)', icon: '⏱️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-950 text-white shadow-sm scale-102'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: SQUAD PROFILE & PILOT ROSTER */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 text-left">
            {profileSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in font-medium">
                <span>✓</span>
                <span>Team contact and drone specifications updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Official Pilot Roster */}
              <div className="lg:col-span-2 bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 uppercase">
                      OFFICIAL 6-PERSON CREW
                    </span>
                    <h3 className="text-xl font-sans font-black text-blue-950 uppercase">
                      PILOT &amp; PIT ROSTER
                    </h3>
                  </div>
                  <span className="text-xs font-mono bg-blue-50 text-blue-900 px-3 py-1 rounded-full font-bold border border-blue-200">
                    FIDA 5TH REVISION ROSTER
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Striker */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                        STRIKER PILOT
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" title="Green LED Tag" />
                    </div>
                    <div className="font-sans font-black text-base text-emerald-950 uppercase">
                      {team.strikerPilot}
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Sole designated scoring drone ball. Equipped with Green LED and ribbon tag.
                    </p>
                  </div>

                  {/* Goalkeeper */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-700 uppercase">
                        GOALKEEPER PILOT
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 shadow-xs" title="White LED" />
                    </div>
                    <div className="font-sans font-black text-base text-slate-950 uppercase">
                      {team.goalkeeper}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Guards own hoop. White LED strip. Anti-reverse entry rule enforced.
                    </p>
                  </div>

                  {/* Defender 1 (Libero) */}
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-sky-800 uppercase">
                        DEFENDER 1 · LIBERO
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs" title="Sky Blue LED" />
                    </div>
                    <div className="font-sans font-black text-base text-sky-950 uppercase">
                      {team.defender1}
                    </div>
                    <p className="text-[11px] text-sky-800">
                      Frontline defensive blocker. Attacks opposing guide. Sky Blue LED.
                    </p>
                  </div>

                  {/* Defender 2 (Sweeper) */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">
                        DEFENDER 2 · SWEEPER
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" title="Yellow LED" />
                    </div>
                    <div className="font-sans font-black text-base text-amber-950 uppercase">
                      {team.defender2}
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Rear guard defender. Positioned behind keeper. Yellow LED.
                    </p>
                  </div>

                  {/* Captain */}
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase">
                      TEAM CAPTAIN
                    </span>
                    <div className="font-sans font-black text-base text-blue-950 uppercase">
                      {team.captainName}
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Liaison with Head Referee &amp; VAR Challenge Ticket submissions.
                    </p>
                  </div>

                  {/* Pit Mechanic */}
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase">
                      PIT MECHANIC &amp; SAFETY
                    </span>
                    <div className="font-sans font-black text-base text-purple-950 uppercase">
                      {team.pitMechanic}
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Inter-set battery swaps, cage mesh repair &amp; LiPo safety compliance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Drone Specs & Scrutineering Status */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-blue-100 pb-4">
                  <span className="font-mono text-xs font-bold text-blue-700 uppercase">
                    TECHNICAL HARDWARE
                  </span>
                  <h3 className="text-xl font-sans font-black text-blue-950 uppercase">
                    SCRUTINEERING STATUS
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>{team.scrutineeringStatus.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Pre-verified for {team.division}. On-site cage weight &amp; LED inspection will take place at Bay {team.allocatedPit} on December 02 at 08:30 IST.
                    </p>
                  </div>

                  {!isEditingProfile ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Drone Model</span>
                        <span className="font-bold text-blue-950">{team.droneModel}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">RC Protocol</span>
                        <span className="font-mono font-bold text-blue-900">{team.controlProtocol}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">VTX Channel</span>
                        <span className="font-mono font-bold text-blue-900">{team.vtxBand}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Captain Phone</span>
                        <span className="font-mono font-bold text-blue-950">{team.captainPhone}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Captain Email</span>
                        <span className="font-mono text-blue-950 truncate max-w-[160px]">{team.captainEmail}</span>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="w-full py-2.5 rounded-full border border-blue-300 hover:bg-blue-50 text-blue-900 font-sans font-bold text-xs uppercase transition-all"
                        >
                          ✏️ Update Hardware / Contact
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                          Drone Exoskeleton Model
                        </label>
                        <input
                          type="text"
                          value={droneModelInput}
                          onChange={(e) => setDroneModelInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs text-blue-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                          VTX Band &amp; Frequency
                        </label>
                        <input
                          type="text"
                          value={vtxBandInput}
                          onChange={(e) => setVtxBandInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs font-mono text-blue-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-950 uppercase mb-1">
                          Captain Emergency Contact
                        </label>
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs font-mono text-blue-950"
                        />
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-600 font-sans font-bold text-xs uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PAYMENT RECEIPT (DOWNLOAD & PRINT) */}
        {/* ============================================================== */}
        {activeTab === 'receipt' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 uppercase">
                  FINANCIAL ACCREDITATION &amp; ENTRY INVOICE
                </span>
                <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                  OFFICIAL TOURNAMENT ENTRY RECEIPT
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyReceipt}
                  className="px-4 py-2.5 rounded-full border border-blue-300 bg-white hover:bg-blue-50 text-blue-950 font-sans font-bold text-xs uppercase transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>📋</span>
                  <span>{copiedReceiptId ? 'Copied Receipt No!' : 'Copy Receipt ID'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Download / Print Receipt (PDF)</span>
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              id="printable-receipt"
              className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-12 shadow-lg space-y-8 max-w-4xl mx-auto"
            >
              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-blue-900/20 pb-6">
                <div className="flex items-center gap-4">
                  <GcdisLogo size="lg" showWordmark={true} />
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-sm text-blue-950">GALGOTIAS UNIVERSITY</div>
                  <div>Centre for Drone Intelligence &amp; Simulation (GCDIS)</div>
                  <div>Plot No. 2, Sector 17A, Yamuna Expressway, Greater Noida, UP</div>
                  <div className="text-blue-900 font-bold">GSTIN / TAX ID: 09AAATG3821K1ZM</div>
                </div>
              </div>

              {/* Receipt Reference Numbers & Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">RECEIPT NO.</span>
                  <span className="font-mono font-black text-blue-950 text-sm">{team.paymentInfo.receiptNo}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">TRANSACTION REF</span>
                  <span className="font-mono font-bold text-blue-950">{team.paymentInfo.transactionId}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">DATE &amp; TIME</span>
                  <span className="font-mono font-medium text-slate-700">{team.paymentInfo.paidAt}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">PAYMENT STATUS</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-black text-[11px] border border-emerald-300">
                    ✓ {team.paymentInfo.status}
                  </span>
                </div>
              </div>

              {/* Billed Entity (Participating Squad) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="font-mono font-bold text-blue-900 uppercase text-[11px]">
                    BILLED TO PARTICIPATING INSTITUTION:
                  </div>
                  <div className="font-black text-base text-blue-950 uppercase">{team.teamName}</div>
                  <div className="font-semibold text-slate-900">{team.institution}</div>
                  <div>{team.city}, {team.state}, India</div>
                  <div className="font-mono text-slate-600">Assigned Team ID: {team.teamId}</div>
                </div>

                <div className="space-y-1 text-xs text-slate-700 sm:text-right">
                  <div className="font-mono font-bold text-blue-900 uppercase text-[11px]">
                    EVENT PARTICIPATION DETAILS:
                  </div>
                  <div className="font-bold text-slate-950">Galgotias Drone Soccer League (GDSL 2026)</div>
                  <div className="font-mono text-blue-900">Tournament Dates: {GDSL_TOURNAMENT_INFO.dates}</div>
                  <div className="font-mono text-amber-800 font-bold">Division: {team.division}</div>
                  <div className="font-mono text-slate-600">Allocated Pit: {team.allocatedPit}</div>
                </div>
              </div>

              {/* Itemized Invoice Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-blue-950 text-white font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Item &amp; Service Description</th>
                      <th className="py-3 px-4 text-center">HSN/SAC</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    <tr>
                      <td className="py-3 px-4 font-mono">01</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-950">
                          GDSL 2026 National Championship Official Team Entry License
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Official squad registration for 5v5 / 3v3 caged aerial soccer, arena cage time &amp; broadcast tracking
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">999291</td>
                      <td className="py-3 px-4 text-center font-mono">1 Squad</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹2,000.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono">02</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-950">
                          Arena Scrutineering, Frequency Allocation &amp; Safety Cage Certification
                        </div>
                        <div className="text-[11px] text-slate-500">
                          FIDA Class compliance calibration, 5.8GHz VTX spectrum analyzer lock &amp; pit bay power access
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">999291</td>
                      <td className="py-3 px-4 text-center font-mono">1 Unit</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹300.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono">03</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-950">
                          Official FAI Pilot Accreditation Passes &amp; Arena Lanyards (6 Pax)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Laminated NFC pilot credentials, pit mechanic passes &amp; emergency medical coverage
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">999291</td>
                      <td className="py-3 px-4 text-center font-mono">6 Badges</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">₹200.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right font-mono uppercase text-slate-700">
                        Total Amount Paid (Inclusive of all applicable event taxes):
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-base text-blue-950">
                        {team.paymentInfo.amount}.00
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Digital Seal & Authorizer */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="font-mono text-slate-700 font-bold">PAYMENT GATEWAY: {team.paymentInfo.paymentMode}</div>
                  <div>This is a digitally generated institutional receipt verified by GCDIS Accounts.</div>
                  <div className="font-mono text-[10px] text-slate-400">VERIFICATION HASH: 8f4a-9c2b-e104-9428-f19b</div>
                </div>

                <div className="text-center sm:text-right space-y-1 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="w-32 h-12 border-b border-dashed border-slate-400 mx-auto sm:ml-auto flex items-end justify-center pb-1">
                    <span className="font-serif italic text-xs text-blue-900 font-bold">Finance Officer</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 block">
                    Finance &amp; Accounts Division
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-900 uppercase block">
                    GALGOTIAS UNIVERSITY · GCDIS
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ATTENDANCE ON-DUTY (OD) APPLICATION & LETTER GENERATOR */}
        {/* ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 uppercase">
                  ACADEMIC EXEMPTION &amp; ON-DUTY PERMISSION
                </span>
                <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                  APPLICATION FOR ON-DUTY (OD) ATTENDANCE
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDispatchOdRequest}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>✉️</span>
                  <span>Request Secretariat Dispatch</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print OD Letter (PDF)</span>
                </button>
              </div>
            </div>

            {odDispatchedAlert && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-start gap-2.5 animate-fade-in">
                <span className="text-base leading-none">✓</span>
                <div className="space-y-1">
                  <div className="font-bold">OD Request Dispatched Successfully!</div>
                  <div className="leading-relaxed">{odDispatchedAlert}</div>
                </div>
              </div>
            )}

            {/* Customizer Panel */}
            <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-sans font-black text-base text-blue-950 uppercase border-b border-blue-100 pb-3">
                CUSTOMIZE LETTER FOR YOUR COLLEGE / UNIVERSITY AUTHORITY
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-blue-950 uppercase mb-1">
                    Addressed Authority Name / Designation
                  </label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="e.g. Dr. R. K. Sharma / The Dean"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs text-blue-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-950 uppercase mb-1">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Dept of Aerospace &amp; Mechanical Engineering"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs text-blue-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-blue-950 uppercase mb-1">
                    College / Institute Name
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs text-blue-950"
                  />
                </div>
              </div>

              {/* Editable Student Roll Numbers */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 uppercase">
                    STUDENT PILOT ROSTER &amp; ROLL NUMBERS (FOR COLLEGE RECORDS):
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTravelDates}
                      onChange={(e) => setIncludeTravelDates(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-900 border-blue-300"
                    />
                    <span>Include 1-day travel buffer (Dec 01 arrival &amp; Dec 04 return)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {students.map((st, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                      <div className="font-bold text-blue-950 truncate">{st.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{st.role}</div>
                      <div>
                        <input
                          type="text"
                          value={st.rollNo || ''}
                          onChange={(e) => handleUpdateStudentRoll(idx, e.target.value)}
                          placeholder="Enter Roll / Reg No."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono text-blue-900 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Letterhead Preview */}
            <div
              id="printable-od-letter"
              className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-12 shadow-lg space-y-6 max-w-4xl mx-auto"
            >
              {/* University Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-blue-950 pb-5">
                <div className="flex items-center gap-3">
                  <GcdisLogo size="lg" showWordmark={true} />
                </div>
                <div className="text-right font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-xs text-blue-950">GALGOTIAS UNIVERSITY</div>
                  <div>Centre for Drone Intelligence &amp; Simulation (GCDIS)</div>
                  <div>Office of the Tournament Organizing Committee</div>
                  <div className="font-bold text-blue-900">REF: GCDIS/GDSL-2026/OD-REQ/{team.teamId}</div>
                  <div>DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Addressee */}
              <div className="space-y-1 text-xs text-slate-800">
                <div className="font-bold">To,</div>
                <div className="font-bold text-blue-950">{facultyName}</div>
                <div>{designation}</div>
                <div>{department}</div>
                <div className="font-semibold">{collegeName}</div>
              </div>

              {/* Subject */}
              <div className="p-3 bg-blue-50/80 border-l-4 border-blue-900 rounded-r-xl text-xs text-blue-950 font-bold leading-relaxed">
                SUBJECT: OFFICIAL REQUEST FOR GRANT OF ACADEMIC ON-DUTY (OD) ATTENDANCE EXEMPTION FOR PARTICIPATION IN GALGOTIAS DRONE SOCCER LEAGUE (GDSL 2026) – REG.
              </div>

              {/* Letter Body */}
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
                <p>
                  Respected Sir / Madam,
                </p>
                <p>
                  Greetings from <strong>Galgotias University</strong> and the <strong>Galgotias Centre for Drone Intelligence &amp; Simulation (GCDIS)</strong>.
                </p>
                <p>
                  We are pleased to inform your good office that the student delegation representing <strong>{team.teamName}</strong> from your esteemed institution has successfully registered and qualified to compete in the <strong>Galgotias Drone Soccer League (GDSL 2026)</strong>. GDSL 2026 is India&apos;s premier national intercollegiate 3D aerial robotics e-sport championship, organized under the technical regulations of the Federation of International Dronesoccer Association (FIDA) and FAI Class F9A.
                </p>
                <p>
                  The tournament will be held at the <strong>Galgotias University Indoor Drone Arena, Greater Noida, Uttar Pradesh</strong> on <strong>{GDSL_TOURNAMENT_INFO.dates}</strong>{includeTravelDates ? ', with official team arrival on December 01, 2026 and return travel scheduled on December 04, 2026' : ''}.
                </p>
                <p>
                  The following bona fide students from your institution constitute the official participating crew:
                </p>

                {/* Table of students */}
                <div className="overflow-x-auto py-2">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-mono text-[11px] uppercase text-blue-950">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Student Full Name</th>
                        <th className="py-2.5 px-3">Designated Role</th>
                        <th className="py-2.5 px-3 font-mono">College Roll / Reg No.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((st, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-blue-950">{st.name}</td>
                          <td className="py-2 px-3 text-slate-600">{st.role}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-900">{st.rollNo || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p>
                  Considering the technical rigor and national significance of this collegiate championship, where teams compete for a grand prize pool of <strong>{GDSL_TOURNAMENT_INFO.totalPrizePool}</strong> and represent their respective universities on live arena broadcast, we respectfully request your esteemed administration to kindly grant <strong>On-Duty (OD) Academic Attendance exemption</strong> to the aforementioned students for the period of <strong>{includeTravelDates ? 'December 01, 2026 to December 04, 2026' : GDSL_TOURNAMENT_INFO.dates}</strong> so that their academic records remain unaffected.
                </p>
                <p>
                  Your encouragement towards student innovation in aerial robotics and autonomous systems is deeply appreciated.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-slate-200">
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-blue-950">Event Organizing Secretariat</div>
                  <div>Galgotias Drone Soccer League (GDSL 2026)</div>
                  <div className="font-mono text-[10px] text-slate-400">Email: {GDSL_TOURNAMENT_INFO.supportEmail}</div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="font-serif italic text-sm text-blue-950 font-bold">Dr. V. K. Singh</div>
                  <div className="text-xs font-bold text-blue-900">Director, GCDIS</div>
                  <div className="text-[11px] text-slate-500">Galgotias Centre for Drone Intelligence &amp; Simulation</div>
                  <div className="text-[10px] font-mono font-bold text-blue-950">GALGOTIAS UNIVERSITY</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MATCH SCHEDULE (COMING SOON) */}
        {/* ============================================================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 text-left">
            <div className="bg-white border border-blue-200 rounded-3xl p-8 sm:p-12 shadow-md text-center space-y-6">
              {/* Coming soon banner */}
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider border border-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>OFFICIAL FIXTURE DRAW IN PROGRESS</span>
              </div>

              <div className="space-y-3 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
                  MATCH SCHEDULE · COMING SOON
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  The official group stage allocations and arena match timings for <strong>{team.teamName}</strong> ({team.division}) will be published right after tournament registrations close on <strong>November 05, 2026</strong>.
                </p>
              </div>

              {/* Reveal Timeline Card */}
              <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block">STEP 1</span>
                  <div className="font-bold text-sm text-blue-950">Scrutineering Close</div>
                  <p className="text-[11px] text-slate-600">Nov 05, 2026 · Frequency lock and 32 squad verification</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">STEP 2</span>
                  <div className="font-bold text-sm text-amber-950">Live Fixture Draw</div>
                  <p className="text-[11px] text-amber-900">Nov 28, 2026 · Live-streamed from GCDIS Broadcast Studio</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">STEP 3</span>
                  <div className="font-bold text-sm text-emerald-950">Tournament Clash</div>
                  <p className="text-[11px] text-emerald-900">Dec 02 – 03, 2026 · 5v5 Aerial Caged Action at GU Arena</p>
                </div>
              </div>

              {/* WhatsApp Notification Subscription */}
              <div className="max-w-xl mx-auto p-5 bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl border border-blue-400/30 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-300 font-bold uppercase">
                    CAPTAIN ALERT SUBSCRIPTION
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300">AUTO-NOTIFY ENABLED</span>
                </div>
                <p className="text-xs text-slate-300">
                  We will dispatch your exact arena cage assignment, match timing, and opponent roster directly to <strong>{team.captainPhone}</strong> &amp; <strong>{team.captainEmail}</strong> as soon as the live draw concludes.
                </p>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setScheduleSubscribed(true);
                      setTimeout(() => setScheduleSubscribed(false), 4000);
                    }}
                    disabled={scheduleSubscribed}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <span>{scheduleSubscribed ? '✓ ALERT CONFIRMED FOR CAPTAIN' : '🔔 PUSH SCHEDULE ALERT TO MY PHONE'}</span>
                  </button>
                </div>
              </div>

              {/* Fixtures Simulator Link */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('bracket')}
                  className="px-5 py-2.5 rounded-full border border-blue-300 hover:bg-blue-50 text-blue-900 font-sans font-bold text-xs uppercase tracking-wider transition-all"
                >
                  View Tournament Bracket Structure →
                </button>
                <button
                  onClick={() => onNavigate('rules')}
                  className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-sans font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Review FIDA Match Rules →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TeamDashboardPage;
