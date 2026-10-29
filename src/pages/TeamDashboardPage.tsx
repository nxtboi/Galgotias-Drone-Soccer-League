import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { Lock, CheckCircle2, CreditCard, QrCode, Printer, Download } from 'lucide-react';
import {
  RegisteredTeamProfile,
  saveRegisteredTeam,
  setCurrentSession,
  getDivisionFee,
} from '../data/teamAuthData';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import {
  syncTeamToSheet,
  updateAllTournamentDataOnSheets,
  getStoredSheetInfo,
} from '../services/googleSheetsService';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';

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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pass' | 'receipt' | 'attendance' | 'profile' | 'schedule'
  >('overview');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fee = getDivisionFee(team.division);
  const isPaymentCompleted =
    team.paymentInfo.status === 'VERIFIED' || team.paymentInfo.status === 'PAID';

  // Refs for PDF Generation
  const receiptRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPassPdf, setIsGeneratingPassPdf] = useState(false);
  const [pdfDownloadSuccess, setPdfDownloadSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Edit Profile State (All Team Details)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    teamName: team.teamName,
    institution: team.institution,
    city: team.city,
    state: team.state,
    division: team.division,
    accessCode: team.accessCode,
    captainName: team.captainName,
    captainEmail: team.captainEmail,
    captainPhone: team.captainPhone,
    strikerPilot: team.strikerPilot,
    goalkeeper: team.goalkeeper,
    defender1: team.defender1,
    defender2: team.defender2,
    pitMechanic: team.pitMechanic,
    droneModel: team.droneModel,
    controlProtocol: team.controlProtocol,
    vtxBand: team.vtxBand,
    allocatedPit: team.allocatedPit,
    facultyName: team.attendanceData?.facultyName || 'The Dean / Head of Department',
    designation: team.attendanceData?.designation || 'Head of Department',
    department: team.attendanceData?.department || 'Department of Mechanical / Aerospace Engineering',
    collegeName: team.attendanceData?.collegeName || team.institution,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Google Sheets Integration State
  const [, setSheetSyncLoading] = useState(false);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<string | null>(null);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);
  const [, setSheetInfo] = useState(getStoredSheetInfo());

  // Attendance Letter State
  const [facultyName, setFacultyName] = useState(
    team.attendanceData?.facultyName || 'The Dean / Head of Department'
  );
  const [department, setDepartment] = useState(
    team.attendanceData?.department || 'Department of Mechanical / Aerospace Engineering'
  );
  const [collegeName, setCollegeName] = useState(
    team.attendanceData?.collegeName || team.institution
  );
  const [students, setStudents] = useState(
    team.attendanceData?.students || [
      { name: team.captainName, role: 'Team Captain / Pilot', rollNo: 'ROLL-01' },
      { name: team.strikerPilot, role: 'Striker Pilot', rollNo: 'ROLL-02' },
      { name: team.goalkeeper, role: 'Goalkeeper Pilot', rollNo: 'ROLL-03' },
      { name: team.defender1, role: 'Defender 1 (Libero)', rollNo: 'ROLL-04' },
      { name: team.defender2, role: 'Defender 2 (Sweeper)', rollNo: 'ROLL-05' },
      { name: team.pitMechanic, role: 'Pit Engineer / Mechanic', rollNo: 'ROLL-06' },
    ]
  );
  const [odDispatchedAlert, setOdDispatchedAlert] = useState(false);
  const [scheduleAlert, setScheduleAlert] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const autoUpdateDataOnSheets = async () => {
      try {
        setSheetSyncLoading(true);
        await syncTeamToSheet(team);
        if (!isCancelled) {
          setSheetInfo(getStoredSheetInfo());
          updateAllTournamentDataOnSheets()
            .then(() => {
              if (!isCancelled) {
                setSheetInfo(getStoredSheetInfo());
              }
            })
            .catch((e) => console.log('Background all-team sync notice:', e));
        }
      } catch (err: any) {
        console.warn('Auto update sheets notice on mount:', err);
      } finally {
        if (!isCancelled) {
          setSheetSyncLoading(false);
        }
      }
    };

    autoUpdateDataOnSheets();

    return () => {
      isCancelled = true;
    };
  }, [team.teamId]);

  const handlePaymentSuccess = async (paymentDetails: {
    receiptNo: string;
    amount: string;
    transactionId: string;
    paymentMode: string;
    paidAt: string;
  }) => {
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      scrutineeringStatus: 'PRE_APPROVED',
      paymentInfo: {
        receiptNo: paymentDetails.receiptNo,
        amount: paymentDetails.amount,
        status: 'VERIFIED',
        transactionId: paymentDetails.transactionId,
        paymentMode: paymentDetails.paymentMode,
        paidAt: paymentDetails.paidAt,
        currency: 'INR',
      },
    };

    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
    setIsPaymentModalOpen(false);
    setActiveTab('pass');
    setSheetSyncSuccess(
      `Payment of ${paymentDetails.amount} verified (${paymentDetails.transactionId}). Official Event Pass unlocked!`
    );
    setTimeout(() => setSheetSyncSuccess(null), 6000);

    try {
      await syncTeamToSheet(updatedTeam);
    } catch (err) {
      console.warn('Payment sheet sync notice:', err);
    }
  };

  const handleResetToPendingDemo = () => {
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      scrutineeringStatus: 'PENDING_ON_SITE',
      paymentInfo: {
        ...team.paymentInfo,
        amount: fee.formatted,
        status: 'PENDING',
        receiptNo: 'PENDING',
        transactionId: 'PENDING',
        paymentMode: 'Pending Dashboard Checkout',
        paidAt: 'Awaiting Fee Payment',
      },
    };
    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
    setSheetSyncSuccess(
      `Payment status set to PENDING (${fee.formatted} for ${fee.code}). Event Pass is now locked until payment.`
    );
    setTimeout(() => setSheetSyncSuccess(null), 5000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFee = getDivisionFee(editForm.division);
    const syncedStudents = [
      {
        name: editForm.captainName,
        role: students[0]?.role || 'Team Captain / Pilot',
        rollNo: students[0]?.rollNo || 'ROLL-01',
        phone: editForm.captainPhone,
      },
      {
        name: editForm.strikerPilot,
        role: students[1]?.role || 'Striker Pilot',
        rollNo: students[1]?.rollNo || 'ROLL-02',
        phone: students[1]?.phone || '',
      },
      {
        name: editForm.goalkeeper,
        role: students[2]?.role || 'Goalkeeper Pilot',
        rollNo: students[2]?.rollNo || 'ROLL-03',
        phone: students[2]?.phone || '',
      },
      {
        name: editForm.defender1,
        role: students[3]?.role || 'Defender 1 (Libero)',
        rollNo: students[3]?.rollNo || 'ROLL-04',
        phone: students[3]?.phone || '',
      },
      {
        name: editForm.defender2,
        role: students[4]?.role || 'Defender 2 (Sweeper)',
        rollNo: students[4]?.rollNo || 'ROLL-05',
        phone: students[4]?.phone || '',
      },
      {
        name: editForm.pitMechanic,
        role: students[5]?.role || 'Pit Engineer / Mechanic',
        rollNo: students[5]?.rollNo || 'ROLL-06',
        phone: students[5]?.phone || '',
      },
    ];

    setStudents(syncedStudents);
    setFacultyName(editForm.facultyName);
    setDepartment(editForm.department);
    setCollegeName(editForm.collegeName);

    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      teamName: editForm.teamName,
      institution: editForm.institution,
      city: editForm.city,
      state: editForm.state,
      division: editForm.division,
      accessCode: editForm.accessCode,
      captainName: editForm.captainName,
      captainEmail: editForm.captainEmail,
      captainPhone: editForm.captainPhone,
      strikerPilot: editForm.strikerPilot,
      goalkeeper: editForm.goalkeeper,
      defender1: editForm.defender1,
      defender2: editForm.defender2,
      pitMechanic: editForm.pitMechanic,
      droneModel: editForm.droneModel,
      controlProtocol: editForm.controlProtocol,
      vtxBand: editForm.vtxBand,
      allocatedPit: editForm.allocatedPit,
      paymentInfo: {
        ...team.paymentInfo,
        amount:
          team.paymentInfo.status === 'PENDING'
            ? updatedFee.formatted
            : team.paymentInfo.amount,
      },
      attendanceData: {
        facultyName: editForm.facultyName,
        designation: editForm.designation,
        department: editForm.department,
        collegeName: editForm.collegeName,
        travelDatesIncluded: true,
        students: syncedStudents,
      },
    };
    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    setSheetSyncLoading(true);
    try {
      await syncTeamToSheet(updatedTeam);
      setSheetSyncSuccess('All squad profile, roster, and hardware details updated.');
      setTimeout(() => setSheetSyncSuccess(null), 4000);
    } catch (err: any) {
      console.warn('Profile save notice:', err);
    } finally {
      setSheetSyncLoading(false);
    }
  };

  const handleUpdateRoll = (index: number, roll: string) => {
    const updated = [...students];
    updated[index].rollNo = roll;
    setStudents(updated);
  };

  const handleSaveAttendance = async () => {
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      attendanceData: {
        facultyName,
        designation: 'Head of Department',
        department,
        collegeName,
        travelDatesIncluded: true,
        students,
      },
    };
    saveRegisteredTeam(updatedTeam);
    setCurrentSession(updatedTeam);
    if (onUpdateTeam) onUpdateTeam(updatedTeam);
    setOdDispatchedAlert(true);
    setTimeout(() => setOdDispatchedAlert(false), 4000);

    setSheetSyncLoading(true);
    try {
      await syncTeamToSheet(updatedTeam);
      setSheetSyncSuccess('Attendance and roster records updated.');
      setTimeout(() => setSheetSyncSuccess(null), 4000);
    } catch (err: any) {
      console.warn('Attendance save notice:', err);
    } finally {
      setSheetSyncLoading(false);
    }
  };

  const handleDownloadReceiptPdf = async () => {
    if (!isPaymentCompleted) {
      setIsPaymentModalOpen(true);
      return;
    }
    if (activeTab !== 'receipt') {
      setActiveTab('receipt');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    setPdfDownloadSuccess(false);
    setPdfError(null);

    try {
      const element = receiptRef.current;
      const cleanTeamId = team.teamId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanReceiptNo = (team.paymentInfo?.receiptNo || 'REC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `GDSL_Invoice_${cleanTeamId}_${cleanReceiptNo}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 900,
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(opt).from(element).save();
      setPdfDownloadSuccess(true);
      setTimeout(() => setPdfDownloadSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to generate PDF with html2pdf:', err);
      setPdfError('Unable to generate PDF directly. You can use the Print option instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPassPdf = async () => {
    if (!isPaymentCompleted) {
      setIsPaymentModalOpen(true);
      return;
    }
    if (activeTab !== 'pass') {
      setActiveTab('pass');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!passRef.current) return;
    setIsGeneratingPassPdf(true);

    try {
      const element = passRef.current;
      const cleanTeamId = team.teamId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `GDSL_Official_Event_Pass_${cleanTeamId}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 850,
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Failed to generate Pass PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPassPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptNo = () => {
    navigator.clipboard.writeText(team.paymentInfo.receiptNo);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const tabs: { id: typeof activeTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'pass',
      label: 'Event Pass',
      badge: isPaymentCompleted ? 'Unlocked' : 'Locked',
    },
    { id: 'receipt', label: 'Payment Receipt' },
    { id: 'attendance', label: 'OD Letter' },
    { id: 'profile', label: 'Profile & Roster' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div className="relative z-20 min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-white font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Status Notifications */}
        {sheetSyncSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
            <span>{sheetSyncSuccess}</span>
            <button
              onClick={() => setSheetSyncSuccess(null)}
              className="text-emerald-400 hover:text-white font-medium ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {sheetSyncError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <span>{sheetSyncError}</span>
            <button
              onClick={() => setSheetSyncError(null)}
              className="text-rose-400 hover:text-white font-medium ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Prominent Pending Payment Banner (When Payment is Not Yet Completed) */}
        {!isPaymentCompleted && (
          <div className="bg-[#1b1c15] border-2 border-[#d0fe1d]/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-left shadow-[0_0_35px_rgba(208,254,29,0.15)]">
            <div className="space-y-1.5">
              <div className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
                <span>Action Required · Registration Fee Pending ({fee.code}: {fee.formatted})</span>
              </div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white uppercase tracking-wider">
                Complete Your {fee.formatted} Entry Fee to Unlock Your Official Event Pass
              </h2>
              <p className="text-xs text-neutral-300 max-w-2xl font-sans">
                Official accreditation event passes and verified tax receipts are issued immediately after completing the registration fee ({team.division} — {fee.formatted}).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs sm:text-sm font-orbitron font-bold uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay {fee.formatted} Now</span>
            </button>
          </div>
        )}

        {/* 1. High-Tech Squad Header Card */}
        <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 text-left shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-white/10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-[#d0fe1d] border border-[#d0fe1d]/30">
                  SQUAD DASHBOARD
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                {isPaymentCompleted ? (
                  <span className="text-emerald-400 font-mono text-xs font-semibold">
                    ✓ Fee Paid ({fee.formatted}) · Pass Unlocked
                  </span>
                ) : (
                  <span className="text-amber-400 font-mono text-xs font-semibold">
                    ⏳ Payment Pending ({fee.formatted}) · Pass Locked
                  </span>
                )}
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="font-mono tabular-nums text-neutral-300 font-bold">{team.teamId}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
                {team.teamName}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-1">
                {team.institution} · <span className="text-neutral-300">{team.city}, {team.state}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {!isPaymentCompleted ? (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer whitespace-nowrap"
                >
                  Pay Fee ({fee.formatted})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToPendingDemo}
                  className="px-3.5 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-300 hover:border-[#d0fe1d] hover:text-[#d0fe1d] transition-all cursor-pointer whitespace-nowrap"
                  title="Reset payment status to PENDING to test the payment gateway checkout"
                >
                  Test Payment Gateway
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditing(true);
                }}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 text-[#d0fe1d] hover:bg-[#d0fe1d] hover:text-black transition-all cursor-pointer whitespace-nowrap"
              >
                Edit Team Details
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-200 hover:border-[#d0fe1d] hover:text-[#d0fe1d] transition-all cursor-pointer whitespace-nowrap"
              >
                Main Site
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Key Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-sm">
            <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Team ID</span>
              <span className="font-orbitron font-bold text-white mt-1 block">
                {team.teamId}
              </span>
            </div>
            <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Division &amp; Fee</span>
              <span className="font-orbitron font-bold text-white mt-1 block truncate">
                {team.division} ({fee.formatted})
              </span>
            </div>
            <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Payment Status</span>
              <span
                className={`font-orbitron font-bold mt-1 block truncate ${
                  isPaymentCompleted ? 'text-[#d0fe1d]' : 'text-amber-400'
                }`}
              >
                {isPaymentCompleted ? `Verified (${fee.formatted})` : `Pending (${fee.formatted})`}
              </span>
            </div>
            <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Event Pass</span>
              <span
                className={`font-orbitron font-bold mt-1 block truncate ${
                  isPaymentCompleted ? 'text-emerald-400' : 'text-neutral-400'
                }`}
              >
                {isPaymentCompleted ? 'Ready to Download' : 'Locked Until Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Cyber Horizontal Tabs */}
        <div className="flex items-center gap-2 border-b border-white/15 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#d0fe1d] text-black shadow-[0_0_20px_rgba(208,254,29,0.35)]'
                    : 'bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-black/80 text-[#d0fe1d]'
                        : isPaymentCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW                                           */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            {/* Cyber 4-Card Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Registration Payment & Receipt */}
              <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
                <div>
                  <div
                    className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${
                      isPaymentCompleted ? 'text-emerald-400' : 'text-[#d0fe1d]'
                    }`}
                  >
                    {isPaymentCompleted
                      ? `Paid · ${fee.formatted}`
                      : `Payment Due · ${fee.formatted}`}
                  </div>
                  <h2 className="font-orbitron font-bold text-white text-base tracking-wide uppercase mt-1">
                    {isPaymentCompleted ? 'Payment Receipt' : 'Entry Fee Payment'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    {isPaymentCompleted
                      ? 'Official registration fee receipt and tax invoice.'
                      : `Pay ${fee.formatted} (${fee.code} Division) via UPI, Card, or Net Banking.`}
                  </p>
                  <div className="mt-3 text-xs font-mono tabular-nums text-neutral-300">
                    {isPaymentCompleted
                      ? `Ref: ${team.paymentInfo.receiptNo}`
                      : `Amount Due: ${fee.formatted}.00`}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                  {isPaymentCompleted ? (
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadReceiptPdf}
                        disabled={isGeneratingPdf}
                        className="flex-1 py-2.5 px-3 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase rounded-xl transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(208,254,29,0.3)]"
                      >
                        {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('receipt')}
                        className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-neutral-200 text-xs font-rajdhani font-bold uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap"
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
                    >
                      Pay {fee.formatted} Now
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Official Event Pass (Gated by Payment) */}
              <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
                <div>
                  <div
                    className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${
                      isPaymentCompleted ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isPaymentCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unlocked &amp; Active</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked Until Payment</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-orbitron font-bold text-white text-base tracking-wide uppercase mt-1">Official Event Pass</h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    {isPaymentCompleted
                      ? 'Official squad entry badge & pit bay pass ready for download.'
                      : 'Complete your registration payment to unlock the event pass.'}
                  </p>
                  <div className="mt-3 text-xs font-mono tabular-nums text-[#d0fe1d]">
                    {isPaymentCompleted ? team.allocatedPit : 'Requires Fee Verification'}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  {isPaymentCompleted ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('pass')}
                      className="w-full py-2.5 px-3 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] cursor-pointer"
                    >
                      View &amp; Download Pass
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full py-2.5 px-3 border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-300 text-xs font-rajdhani font-bold uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Pay {fee.formatted} to Unlock
                    </button>
                  )}
                </div>
              </div>

              {/* Card 3: Attendance Request */}
              <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider mb-1">
                    University Document
                  </div>
                  <h2 className="font-orbitron font-bold text-white text-base tracking-wide uppercase mt-1">OD Attendance Letter</h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    On-Duty leave letter for college faculty and department heads.
                  </p>
                  <div className="mt-3 text-xs tabular-nums text-neutral-300 font-mono">
                    {students.length} roster members listed
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="w-full py-2.5 px-3 border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-white text-xs font-rajdhani font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Open OD Letter
                  </button>
                </div>
              </div>

              {/* Card 4: Team Profile */}
              <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider mb-1">
                    Roster &amp; Specs
                  </div>
                  <h2 className="font-orbitron font-bold text-white text-base tracking-wide uppercase mt-1">Squad Profile</h2>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
                    Pilot assignments, captain contact details, and drone hardware.
                  </p>
                  <div className="mt-3 text-xs text-neutral-300 truncate font-mono">
                    Model: {team.droneModel}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      setIsEditing(true);
                    }}
                    className="flex-1 py-2.5 px-3 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="py-2.5 px-3 border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-white text-xs font-rajdhani font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Registration Summary Table */}
            <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-base font-orbitron font-black text-white uppercase tracking-wider mb-4 pb-3 border-b border-white/10">
                Registration &amp; Fee Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Institution</span>
                  <span className="font-medium text-white text-right">{team.institution}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Division &amp; Entry Fee</span>
                  <span className="font-orbitron font-bold text-[#d0fe1d] tabular-nums">
                    {team.division} · {fee.formatted}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Payment Status</span>
                  <span
                    className={`font-mono font-bold ${
                      isPaymentCompleted ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isPaymentCompleted
                      ? `PAID (${team.paymentInfo.transactionId})`
                      : `PENDING (${fee.formatted} Due)`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Captain Contact</span>
                  <span className="font-mono tabular-nums font-medium text-white">
                    {team.captainPhone}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Drone Hardware</span>
                  <span className="font-medium text-white">{team.droneModel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-neutral-400 font-mono">Allocated Pit</span>
                  <span className="font-mono font-bold text-[#d0fe1d]">
                    {isPaymentCompleted ? team.allocatedPit : 'Assigned Upon Payment'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OFFICIAL EVENT PASS (STRICTLY GATED BY PAYMENT)    */}
        {/* ========================================================= */}
        {activeTab === 'pass' && (
          <div className="space-y-5 text-left">
            {!isPaymentCompleted ? (
              <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#d0fe1d]/10 border border-[#d0fe1d]/40 text-[#d0fe1d] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(208,254,29,0.2)]">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider">
                    Event Pass Locked · Fee Payment Required
                  </span>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white uppercase tracking-wider">
                    Complete Your {fee.formatted} Registration Fee to Unlock Event Pass
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed font-sans">
                    Participants receive their Official GDSL 2026 Event Pass, gate QR access credential, and Pit Bay assignment immediately after the {fee.formatted} registration fee for {team.division} is verified.
                  </p>
                </div>

                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-xs space-y-2 text-left">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Squad Name</span>
                    <span className="font-bold text-white font-orbitron">{team.teamName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Division Classification</span>
                    <span className="font-medium text-white">{team.division}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 font-mono">Entry Fee Payable</span>
                    <span className="font-orbitron font-bold text-[#d0fe1d]">{fee.formatted}.00</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold uppercase tracking-wider text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {fee.formatted} &amp; Unlock Event Pass</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141612]/95 border border-white/15 p-5 rounded-2xl shadow-xl">
                  <div>
                    <h2 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">
                      Official GDSL 2026 Event Pass &amp; Squad Entry Badge
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                      Payment verified ({fee.formatted}). Present this pass at Arena Security &amp; Scrutineering Desk.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadPassPdf}
                      disabled={isGeneratingPassPdf}
                      className="px-4 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingPassPdf ? 'Generating PDF...' : 'Download Pass (PDF)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2.5 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Pass</span>
                    </button>
                  </div>
                </div>

                {/* Printable Official Event Pass Sheet */}
                <div
                  ref={passRef}
                  id="printable-receipt"
                  className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 text-slate-900 shadow-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
                    <div>
                      <div className="text-[11px] font-mono font-bold uppercase text-blue-700">
                        OFFICIAL PARTICIPANT ENTRY PASS · GDSL 2026
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        Galgotias Drone Soccer League
                      </h3>
                      <p className="text-xs text-slate-600">
                        Galgotias University Indoor Arena, Greater Noida · {GDSL_TOURNAMENT_INFO.dates}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded">
                        ENTRY AUTHORIZED · FEE PAID ({fee.formatted})
                      </span>
                      <div className="font-mono text-sm font-bold text-slate-900 mt-1.5">
                        Pass ID: {team.teamId}
                      </div>
                    </div>
                  </div>

                  {/* Squad & Pit Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Registered Squad</span>
                        <span className="font-bold text-slate-900 text-sm">{team.teamName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Institution</span>
                        <span className="font-semibold text-slate-800">{team.institution}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Division</span>
                        <span className="font-semibold text-blue-800">{team.division} ({fee.code})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Allocated Pit Bay</span>
                        <span className="font-semibold text-emerald-700">{team.allocatedPit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Payment Receipt</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {team.paymentInfo.receiptNo} ({fee.formatted})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Transaction ID</span>
                        <span className="font-mono text-slate-700">{team.paymentInfo.transactionId}</span>
                      </div>
                    </div>

                    {/* Verification QR Box */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
                      <QrCode className="w-24 h-24 text-slate-900" strokeWidth={1.5} />
                      <span className="font-mono text-[10px] text-slate-600 mt-2">
                        GATE SCAN · {team.teamId}
                      </span>
                    </div>
                  </div>

                  {/* Accredited 6-Member Squad Roster on Event Pass */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">
                      Accredited Squad Personnel (Admit 6):
                    </h4>
                    <table className="w-full text-xs border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="py-2 px-3 border border-slate-200 text-left">Role</th>
                          <th className="py-2 px-3 border border-slate-200 text-left">Participant Name</th>
                          <th className="py-2 px-3 border border-slate-200 text-left">Arena Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Team Captain</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.captainName}</td>
                          <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-medium">Flight Deck + Pit Bay</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Striker Pilot</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.strikerPilot}</td>
                          <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-medium">Flight Deck + Pit Bay</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Goalkeeper Pilot</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.goalkeeper}</td>
                          <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-medium">Flight Deck + Pit Bay</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Defender 1 (Guide)</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.defender1}</td>
                          <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-medium">Flight Deck + Pit Bay</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Defender 2 (Libero)</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.defender2}</td>
                          <td className="py-2 px-3 border border-slate-200 text-emerald-700 font-medium">Flight Deck + Pit Bay</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-slate-200 font-medium">Pit Mechanic</td>
                          <td className="py-2 px-3 border border-slate-200 font-semibold">{team.pitMechanic}</td>
                          <td className="py-2 px-3 border border-slate-200 text-slate-700 font-medium">Pit Repair Bay</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Issued by GCDIS Tournament Secretariat · Galgotias University</span>
                    <span className="font-mono">Verified: {team.paymentInfo.paidAt}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PAYMENT RECEIPT                                    */}
        {/* ========================================================= */}
        {activeTab === 'receipt' && (
          <div className="space-y-5 text-left">
            {!isPaymentCompleted ? (
              <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-[#d0fe1d]/10 border border-[#d0fe1d]/40 text-[#d0fe1d] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(208,254,29,0.2)]">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white uppercase tracking-wider">
                  Registration Fee Payment Pending ({fee.formatted})
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto font-sans leading-relaxed">
                  Your official tax invoice and payment receipt will be generated automatically once you complete the {fee.formatted} fee payment for {team.division}.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold uppercase tracking-wider text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
                >
                  <span>Pay {fee.formatted} Now</span>
                </button>
              </div>
            ) : (
              <>
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141612]/95 border border-white/15 p-5 rounded-2xl shadow-xl">
                  <div>
                    <h2 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Payment Receipt &amp; Tax Invoice</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                      Proof of entry fee payment ({fee.formatted}) and verified tournament registration.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadReceiptPdf}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2.5 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyReceiptNo}
                      className="px-3.5 py-2.5 text-xs font-mono rounded-xl border border-white/15 bg-white/5 text-neutral-300 hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {copiedReceipt ? '✓ Copied' : 'Copy Receipt #'}
                    </button>
                  </div>
                </div>

                {pdfDownloadSuccess && (
                  <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl flex items-center justify-between shadow-lg">
                    <span>Invoice PDF for {team.teamName} downloaded.</span>
                    <button
                      type="button"
                      onClick={() => setPdfDownloadSuccess(false)}
                      className="text-emerald-400 hover:text-white ml-2 cursor-pointer font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {pdfError && (
                  <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs rounded-xl flex items-center justify-between shadow-lg">
                    <span>{pdfError}</span>
                    <button
                      type="button"
                      onClick={() => setPdfError(null)}
                      className="text-rose-400 hover:text-white ml-2 cursor-pointer font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Printable A4 Receipt Paper */}
                <div
                  ref={receiptRef}
                  id="printable-receipt"
                  className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 text-slate-900 shadow-2xl print:border-none print:shadow-none"
                >
                  <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Galgotias University</h3>
                      <p className="text-xs text-slate-600">
                        Galgotias Centre for Drone &amp; Innovative Systems (GCDIS)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, UP - 203201
                        <br />
                        <span className="font-mono text-slate-500">
                          GSTIN: 09AAAAU0000A1Z5 · Tournament Registration Receipt
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 text-xs">
                      <div className="font-semibold text-emerald-700">PAID RECEIPT</div>
                      <div className="text-slate-500 mt-1 tabular-nums">
                        Date: <span className="font-medium text-slate-800">{team.paymentInfo.paidAt}</span>
                      </div>
                      <div className="text-slate-500 tabular-nums">
                        Receipt No:{' '}
                        <span className="font-mono font-semibold text-slate-900">
                          {team.paymentInfo.receiptNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[11px] font-medium">Billed To</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{team.teamName}</span>
                      <span className="text-slate-700 block">{team.institution}</span>
                      <span className="text-slate-600 block">
                        {team.city}, {team.state}
                      </span>
                      <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                        Captain: {team.captainName} ({team.captainPhone})
                        <br />
                        Email: {team.captainEmail}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded border border-slate-200 sm:text-right">
                      <span className="text-slate-500 block text-[11px] font-medium">Event Details</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        Galgotias Drone Soccer League 2026
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {team.division} ({fee.code})
                      </span>
                      <span className="font-mono text-slate-600 block">Team ID: {team.teamId}</span>
                      <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                        Payment Mode: {team.paymentInfo.paymentMode}
                        <br />
                        Event Dates: {GDSL_TOURNAMENT_INFO.dates}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border-t border-b border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold">Description</th>
                        <th className="py-2.5 px-2 font-semibold text-center">Division</th>
                        <th className="py-2.5 px-2 font-semibold text-center">Qty</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">
                            Squad Registration &amp; Event Pass ({fee.code})
                          </span>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            Entry for 5 pilots + 1 pit mechanic, arena access &amp; pit bay ({team.allocatedPit}).
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{team.division}</td>
                        <td className="py-3 px-2 text-center font-mono tabular-nums">1</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {fee.formatted}.00
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-semibold text-slate-900">
                        <td className="py-2.5 px-3">Total Paid</td>
                        <td></td>
                        <td></td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm font-bold">
                          {fee.formatted}.00
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <div className="font-mono tabular-nums">
                      Transaction Ref: {team.paymentInfo.transactionId}
                    </div>
                    <div>
                      Status: Verified · {team.allocatedPit}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ATTENDANCE APPLICATION (OD LETTER)                 */}
        {/* ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141612]/95 border border-white/15 p-5 rounded-2xl shadow-xl">
              <div>
                <h2 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Attendance Application (On-Duty Letter)</h2>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  Customize recipient authority details and student roll numbers before printing.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-200 hover:border-[#d0fe1d] hover:text-[#d0fe1d] transition-all cursor-pointer whitespace-nowrap"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] cursor-pointer whitespace-nowrap"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>

            {odDispatchedAlert && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl shadow-lg">
                Attendance letter details saved.
              </div>
            )}

            <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
              <h3 className="font-orbitron font-bold text-white text-sm uppercase tracking-wider">Recipient Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">To (Authority Title)</label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
              </div>
            </div>

            <div
              id="printable-od-letter"
              className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-5 text-slate-800 leading-relaxed shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Galgotias Centre for Drone &amp; Innovative Systems
                  </h3>
                  <p className="text-xs text-slate-600">
                    Galgotias University, Greater Noida · Tournament Secretariat
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 tabular-nums font-mono">
                  <div>Ref: GCDIS/OD-2026/{team.teamId}</div>
                  <div>
                    Date:{' '}
                    {new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-slate-900">To,</div>
                <div>{facultyName}</div>
                <div>{department}</div>
                <div>{collegeName}</div>
              </div>

              <div className="text-xs font-semibold text-slate-900 bg-slate-50 p-3 rounded border border-slate-200">
                Subject: Request for On-Duty (OD) Attendance Grant for Students Participating in Galgotias Drone Soccer League 2026 ({GDSL_TOURNAMENT_INFO.dates}).
              </div>

              <div className="text-xs space-y-2.5 text-slate-700">
                <p>Respected Sir / Madam,</p>
                <p>
                  This is to certify that the following students from your institution have registered squad{' '}
                  <strong>{team.teamName}</strong> (Team ID:{' '}
                  <span className="font-mono font-semibold text-slate-900">{team.teamId}</span>) to compete in the{' '}
                  <strong>Galgotias Drone Soccer League 2026</strong> held at Galgotias University, Greater Noida on{' '}
                  <strong>{GDSL_TOURNAMENT_INFO.dates}</strong>.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  Participating Student Roster:
                </h4>
                <table className="w-full text-xs border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="p-2 border border-slate-200 text-left w-10">#</th>
                      <th className="p-2 border border-slate-200 text-left">Student Name</th>
                      <th className="p-2 border border-slate-200 text-left">Role</th>
                      <th className="p-2 border border-slate-200 text-left">Roll / Reg No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st, i) => (
                      <tr key={i}>
                        <td className="p-2 border border-slate-200 tabular-nums">{i + 1}</td>
                        <td className="p-2 border border-slate-200 font-medium text-slate-900">{st.name}</td>
                        <td className="p-2 border border-slate-200 text-slate-600">{st.role}</td>
                        <td className="p-2 border border-slate-200">
                          <input
                            type="text"
                            value={st.rollNo || ''}
                            onChange={(e) => handleUpdateRoll(i, e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900 bg-white"
                            placeholder="Enter Roll No"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <p>
                  Kindly consider their participation as official academic On-Duty representation and grant attendance dispensation for the tournament dates.
                </p>
              </div>

              <div className="pt-6 flex justify-between items-end text-xs border-t border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Organizing Committee</div>
                  <div className="text-slate-500">Galgotias Drone Soccer League</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">Director, GCDIS</div>
                  <div className="text-slate-500">Galgotias University</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: TEAM PROFILE & ROSTER                              */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141612]/95 border border-white/15 p-5 rounded-2xl shadow-xl">
              <div>
                <h2 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Squad Profile &amp; Pilot Roster</h2>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  Registered squad members, contact channels, and drone hardware specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-xs font-orbitron font-bold uppercase tracking-wider rounded-xl border border-[#d0fe1d] bg-[#d0fe1d] text-black hover:bg-[#e2ff54] transition-all cursor-pointer whitespace-nowrap shadow-[0_0_15px_rgba(208,254,29,0.25)]"
              >
                {isEditing ? 'Cancel Editing' : 'Edit All Team Details'}
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl shadow-lg">
                All team details updated and saved successfully.
              </div>
            )}

            {isEditing && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-[#141612]/95 border border-[#d0fe1d]/40 rounded-3xl p-6 sm:p-8 space-y-6 text-xs shadow-2xl"
              >
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-orbitron font-bold text-white text-sm sm:text-base uppercase tracking-wider">
                      Edit All Squad &amp; Roster Details
                    </h3>
                    <p className="text-neutral-400 text-xs mt-0.5">
                      Modify team identity, institution, division, all 6 squad members, hardware specs, and OD details.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#d0fe1d] uppercase px-2.5 py-1 rounded bg-[#d0fe1d]/10 border border-[#d0fe1d]/30">
                    {team.teamId}
                  </span>
                </div>

                {/* Section 1: Team & Institution Identity */}
                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    1. Team &amp; Institution Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Team Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.teamName}
                        onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Institution / University</label>
                      <input
                        type="text"
                        required
                        value={editForm.institution}
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Tournament Division</label>
                      <select
                        value={editForm.division}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            division: e.target.value as 'Class 40 (400mm)' | 'Class 20 (200mm)',
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      >
                        <option value="Class 40 (400mm)">Class 40 (400mm)</option>
                        <option value="Class 20 (200mm)">Class 20 (200mm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">City</label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">State</label>
                      <input
                        type="text"
                        required
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Access Code / Password</label>
                      <input
                        type="text"
                        required
                        value={editForm.accessCode}
                        onChange={(e) => setEditForm({ ...editForm, accessCode: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Captain & Pilot Roster (All 6 Members) */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    2. Captain &amp; Squad Pilot Roster (6 Members)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Team Captain Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.captainName}
                        onChange={(e) => setEditForm({ ...editForm, captainName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Captain Email</label>
                      <input
                        type="email"
                        required
                        value={editForm.captainEmail}
                        onChange={(e) => setEditForm({ ...editForm, captainEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Captain Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editForm.captainPhone}
                        onChange={(e) => setEditForm({ ...editForm, captainPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Striker Pilot</label>
                      <input
                        type="text"
                        required
                        value={editForm.strikerPilot}
                        onChange={(e) => setEditForm({ ...editForm, strikerPilot: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Goalkeeper Pilot</label>
                      <input
                        type="text"
                        required
                        value={editForm.goalkeeper}
                        onChange={(e) => setEditForm({ ...editForm, goalkeeper: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Defender 1 (Libero)</label>
                      <input
                        type="text"
                        required
                        value={editForm.defender1}
                        onChange={(e) => setEditForm({ ...editForm, defender1: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Defender 2 (Sweeper)</label>
                      <input
                        type="text"
                        required
                        value={editForm.defender2}
                        onChange={(e) => setEditForm({ ...editForm, defender2: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Pit Mechanic / Engineer</label>
                      <input
                        type="text"
                        required
                        value={editForm.pitMechanic}
                        onChange={(e) => setEditForm({ ...editForm, pitMechanic: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Drone Hardware & Arena Specifications */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    3. Drone Hardware &amp; Arena Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Drone Model</label>
                      <input
                        type="text"
                        required
                        value={editForm.droneModel}
                        onChange={(e) => setEditForm({ ...editForm, droneModel: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Radio Control Protocol</label>
                      <input
                        type="text"
                        required
                        value={editForm.controlProtocol}
                        onChange={(e) => setEditForm({ ...editForm, controlProtocol: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">VTX Band / Channel</label>
                      <input
                        type="text"
                        required
                        value={editForm.vtxBand}
                        onChange={(e) => setEditForm({ ...editForm, vtxBand: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Allocated Pit Bay</label>
                      <input
                        type="text"
                        value={editForm.allocatedPit}
                        onChange={(e) => setEditForm({ ...editForm, allocatedPit: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Institutional OD & Faculty Details */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    4. Institutional OD &amp; Faculty Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Faculty / HOD Name</label>
                      <input
                        type="text"
                        value={editForm.facultyName}
                        onChange={(e) => setEditForm({ ...editForm, facultyName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Designation</label>
                      <input
                        type="text"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Department</label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">College Name (For OD)</label>
                      <input
                        type="text"
                        value={editForm.collegeName}
                        onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-sans focus:outline-none focus:border-[#d0fe1d]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold uppercase rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(208,254,29,0.35)] cursor-pointer"
                  >
                    Save All Team Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 border border-white/20 bg-white/5 text-neutral-300 hover:bg-white/10 rounded-xl text-xs font-rajdhani font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="bg-[#141612]/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="font-orbitron font-bold text-white text-sm uppercase tracking-wider">Squad Roster (6 Accredited Members)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0e100d] text-neutral-400 font-mono uppercase text-[11px]">
                      <th className="py-3 px-5 font-medium">Position / Role</th>
                      <th className="py-3 px-5 font-medium">Member Name</th>
                      <th className="py-3 px-5 font-medium">Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-[#d0fe1d] font-mono font-bold">Team Captain</td>
                      <td className="py-3 px-5 font-bold text-white">{team.captainName}</td>
                      <td className="py-3 px-5 text-neutral-400">Tactics &amp; Communications</td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-neutral-300 font-mono">Striker Pilot</td>
                      <td className="py-3 px-5 font-bold text-white">{team.strikerPilot}</td>
                      <td className="py-3 px-5 text-neutral-400">Primary Goal Scorer</td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-neutral-300 font-mono">Goalkeeper</td>
                      <td className="py-3 px-5 font-bold text-white">{team.goalkeeper}</td>
                      <td className="py-3 px-5 text-neutral-400">Hoop Defense</td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-neutral-300 font-mono">Defender 1</td>
                      <td className="py-3 px-5 font-bold text-white">{team.defender1}</td>
                      <td className="py-3 px-5 text-neutral-400">Midfield Blocker</td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-neutral-300 font-mono">Defender 2</td>
                      <td className="py-3 px-5 font-bold text-white">{team.defender2}</td>
                      <td className="py-3 px-5 text-neutral-400">Zone Sweeper</td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-5 text-neutral-300 font-mono">Pit Mechanic</td>
                      <td className="py-3 px-5 font-bold text-white">{team.pitMechanic}</td>
                      <td className="py-3 px-5 text-neutral-400">Battery &amp; Airframe Maintenance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-6 shadow-2xl">
              <h3 className="font-orbitron font-bold text-white text-sm uppercase tracking-wider border-b border-white/10 pb-3 mb-4">
                Hardware &amp; Pit Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Drone Model</span>
                  <span className="font-orbitron font-bold text-white mt-1 block">{team.droneModel}</span>
                </div>
                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Radio Protocol</span>
                  <span className="font-orbitron font-bold text-white mt-1 block">{team.controlProtocol}</span>
                </div>
                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">VTX Band</span>
                  <span className="font-mono font-bold text-[#d0fe1d] mt-1 block">{team.vtxBand}</span>
                </div>
                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block tracking-wider">Pit Bay</span>
                  <span className="font-orbitron font-bold text-[#d0fe1d] mt-1 block">
                    {isPaymentCompleted ? team.allocatedPit : 'Assigned Upon Payment'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: MATCH SCHEDULE                                     */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-orbitron font-black text-white uppercase tracking-wider">
                  Tournament Fixtures &amp; Match Schedule
                </h2>
                <p className="text-xs text-neutral-400 mt-1 font-sans">
                  Pool stage draws and match timings will be published after technical scrutineering.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30">
                Seeding Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex justify-between py-2.5 border-b border-white/10">
                <span className="text-neutral-400 font-mono">Event Dates</span>
                <span className="font-orbitron font-bold text-white tabular-nums">{GDSL_TOURNAMENT_INFO.dates}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/10">
                <span className="text-neutral-400 font-mono">Fixture Release</span>
                <span className="font-orbitron font-bold text-[#d0fe1d] tabular-nums">Dec 01, 2026 · 7:00 PM IST</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/10">
                <span className="text-neutral-400 font-mono">Allocated Pit Bay</span>
                <span className="font-orbitron font-bold text-[#d0fe1d]">
                  {isPaymentCompleted ? team.allocatedPit : 'Assigned Upon Payment'}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-white/10">
                <span className="text-neutral-400 font-mono">Division</span>
                <span className="font-medium text-white">{team.division}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between flex-wrap gap-4 border-t border-white/10">
              <span className="text-xs text-neutral-400">
                Notification recipient: <strong className="text-white font-mono">{team.captainEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setScheduleAlert(true);
                  setTimeout(() => setScheduleAlert(false), 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold uppercase text-xs transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
              >
                {scheduleAlert ? 'Notification Enabled ✓' : 'Notify When Fixtures Release'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Razorpay-Style Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        team={team}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TeamDashboardPage;
