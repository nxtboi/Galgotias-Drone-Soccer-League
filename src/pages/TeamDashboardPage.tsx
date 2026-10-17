import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';
import {
  RegisteredTeamProfile,
  saveRegisteredTeam,
  setCurrentSession,
} from '../data/teamAuthData';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import {
  syncTeamToSheet,
  updateAllTournamentDataOnSheets,
  getStoredSheetInfo,
} from '../services/googleSheetsService';

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
    'overview' | 'checkin' | 'receipt' | 'attendance' | 'profile' | 'schedule'
  >('overview');

  // Venue Check-in QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [qrTokenNonce, setQrTokenNonce] = useState<string>(() =>
    team.paymentInfo?.receiptNo?.slice(-4) || '2026'
  );
  const [copiedCheckInCode, setCopiedCheckInCode] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  // Receipt HTML2PDF Ref & Generation State
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloadSuccess, setPdfDownloadSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(team.captainPhone);
  const [editDroneModel, setEditDroneModel] = useState(team.droneModel);
  const [editVtx, setEditVtx] = useState(team.vtxBand);
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

  const uniqueCheckInCode = `CHK-${team.teamId}-${qrTokenNonce}`;

  const generateTeamQrCode = async (nonceOverride?: string) => {
    setIsGeneratingQr(true);
    const activeNonce = nonceOverride || qrTokenNonce;
    const checkInCode = `CHK-${team.teamId}-${activeNonce}`;
    const qrPayload = JSON.stringify({
      event: 'GDSL_2026_VENUE_CHECKIN',
      checkInCode,
      teamId: team.teamId,
      teamName: team.teamName,
      institution: team.institution,
      division: team.division,
      captain: team.captainName,
      phone: team.captainPhone,
      allocatedPit: team.allocatedPit,
      rosterSize: 6,
      paymentStatus: 'VERIFIED_PAID',
      receiptNo: team.paymentInfo.receiptNo,
    });

    try {
      const url = await QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  useEffect(() => {
    generateTeamQrCode();
  }, [team.teamId, qrTokenNonce]);

  const handleOpenGenerateQr = () => {
    generateTeamQrCode();
    setQrModalOpen(true);
  };

  const handleRefreshQrToken = () => {
    const newNonce = Math.floor(1000 + Math.random() * 9000).toString();
    setQrTokenNonce(newNonce);
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `GDSL_CheckIn_QR_${team.teamId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCheckInCode = () => {
    navigator.clipboard.writeText(uniqueCheckInCode);
    setCopiedCheckInCode(true);
    setTimeout(() => setCopiedCheckInCode(false), 2000);
  };

  // Automatically update team and tournament data in Google Sheets on mount
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTeam: RegisteredTeamProfile = {
      ...team,
      captainPhone: editPhone,
      droneModel: editDroneModel,
      vtxBand: editVtx,
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
      setSheetSyncSuccess('Squad profile details updated.');
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

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptNo = () => {
    navigator.clipboard.writeText(team.paymentInfo.receiptNo);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const tabs: { id: typeof activeTab; label: string; shortLabel: string }[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
    { id: 'checkin', label: 'Check-in QR', shortLabel: 'QR Pass' },
    { id: 'receipt', label: 'Payment Receipt', shortLabel: 'Receipt' },
    { id: 'attendance', label: 'OD Letter', shortLabel: 'OD Letter' },
    { id: 'profile', label: 'Profile & Roster', shortLabel: 'Roster' },
    { id: 'schedule', label: 'Schedule', shortLabel: 'Schedule' },
  ];

  const handleTabSelect = (id: typeof activeTab) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="basic-dashboard-scope relative z-20 min-h-screen bg-slate-900 pt-20 sm:pt-24 pb-24 sm:pb-20 px-3.5 sm:px-6 lg:px-8 text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Status Notifications */}
        {sheetSyncSuccess && (
          <div className="p-3 rounded-md bg-slate-800 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <span>{sheetSyncSuccess}</span>
            <button
              onClick={() => setSheetSyncSuccess(null)}
              className="min-h-[36px] px-2 text-slate-400 hover:text-white font-medium cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {sheetSyncError && (
          <div className="p-3 rounded-md bg-slate-800 border border-red-700/60 text-red-300 text-xs flex items-center justify-between gap-2">
            <span>{sheetSyncError}</span>
            <button
              onClick={() => setSheetSyncError(null)}
              className="min-h-[36px] px-2 text-slate-400 hover:text-white font-medium cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Basic Utilitarian Header (Mobile-First Touch Layout) */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-slate-700">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-400 mb-1">
                <span>Squad Dashboard</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Registered</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-300">{team.teamId}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-semibold text-white leading-snug break-words">
                {team.teamName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 break-words">
                {team.institution} · {team.city}, {team.state}
              </p>
            </div>

            {/* Mobile: Full-width primary QR CTA on top, 2-col secondary buttons below */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleOpenGenerateQr}
                className="col-span-2 sm:col-span-1 min-h-[44px] sm:min-h-[38px] px-4 py-2.5 sm:py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Generate Check-in QR
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Main Site
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[44px] sm:min-h-[38px] px-3.5 py-2 text-xs font-medium rounded-md border border-red-800/70 bg-red-950/40 text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Key Info Grid: 2x2 on mobile with clean spacing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 text-xs sm:text-sm">
            <div className="bg-slate-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded border border-slate-700/60 sm:border-none">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Team ID</span>
              <span className="font-mono tabular-nums font-medium text-slate-100 mt-0.5 block truncate">
                {team.teamId}
              </span>
            </div>
            <div className="bg-slate-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded border border-slate-700/60 sm:border-none">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Division</span>
              <span className="font-medium text-slate-100 mt-0.5 block truncate">
                {team.division}
              </span>
            </div>
            <div className="bg-slate-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded border border-slate-700/60 sm:border-none">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Captain</span>
              <span className="font-medium text-slate-100 mt-0.5 block truncate">
                {team.captainName}
              </span>
            </div>
            <div className="bg-slate-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded border border-slate-700/60 sm:border-none">
              <span className="text-[11px] sm:text-xs text-slate-400 block">Event Dates</span>
              <span className="font-medium text-slate-100 mt-0.5 block tabular-nums truncate">
                {GDSL_TOURNAMENT_INFO.dates}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Standard Horizontal Tabs (44px min touch height & smooth horizontal scroll on mobile) */}
        <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1 border-b border-slate-700 overflow-x-auto snap-x snap-mandatory">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`snap-start min-h-[44px] px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-blue-500 text-white bg-slate-800/70'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW                                           */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 text-left">
            {/* Venue Rapid Check-in QR Banner (Mobile-Responsive Stack + Mini QR Preview) */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={handleOpenGenerateQr}
                    className="bg-white p-1.5 rounded border border-slate-200 shrink-0 cursor-pointer"
                    title="Tap to enlarge Check-in QR"
                  >
                    <img
                      src={qrDataUrl}
                      alt="Mini Check-in QR"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain block"
                    />
                  </button>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span>Venue Express Entry</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-300">{uniqueCheckInCode}</span>
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">
                    Rapid Venue Check-in QR Pass
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Show this QR code at the venue registration desk for express roster check-in and pit bay entry ({team.allocatedPit}).
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleOpenGenerateQr}
                  className="min-h-[44px] sm:min-h-[38px] px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Show QR Modal
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSelect('checkin')}
                  className="min-h-[44px] sm:min-h-[38px] px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Full QR Pass
                </button>
              </div>
            </div>

            {/* Simple 4-Card Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Card 1: Payment Receipt */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-emerald-400 font-medium mb-1">
                    Paid · {team.paymentInfo.amount}
                  </div>
                  <h2 className="font-semibold text-white text-sm">Payment Receipt</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Official registration fee receipt and tax invoice.
                  </p>
                  <div className="mt-2.5 text-xs font-mono tabular-nums text-slate-300">
                    Ref: {team.paymentInfo.receiptNo}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReceiptPdf}
                    disabled={isGeneratingPdf}
                    className="flex-1 min-h-[42px] sm:min-h-[36px] py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('receipt')}
                    className="min-h-[42px] sm:min-h-[36px] px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Card 2: Attendance Request */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">
                    University Document
                  </div>
                  <h2 className="font-semibold text-white text-sm">Attendance (OD Letter)</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    On-Duty leave letter for college faculty and department heads.
                  </p>
                  <div className="mt-2.5 text-xs tabular-nums text-slate-300">
                    {students.length} roster members listed
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleTabSelect('attendance')}
                    className="w-full min-h-[42px] sm:min-h-[36px] py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Open OD Letter
                  </button>
                </div>
              </div>

              {/* Card 3: Team Profile */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">
                    Roster &amp; Specs
                  </div>
                  <h2 className="font-semibold text-white text-sm">Team Profile</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pilot assignments, captain contact details, and drone hardware.
                  </p>
                  <div className="mt-2.5 text-xs text-slate-300 truncate">
                    Model: {team.droneModel}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleTabSelect('profile')}
                    className="w-full min-h-[42px] sm:min-h-[36px] py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Manage Profile
                  </button>
                </div>
              </div>

              {/* Card 4: Match Schedule */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-amber-400 font-medium mb-1">
                    Pending Draw
                  </div>
                  <h2 className="font-semibold text-white text-sm">Match Schedule</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Group stage fixtures and court timings for {GDSL_TOURNAMENT_INFO.dates}.
                  </p>
                  <div className="mt-2.5 text-xs text-slate-300">
                    Pit: {team.allocatedPit}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleTabSelect('schedule')}
                    className="w-full min-h-[42px] sm:min-h-[36px] py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              </div>
            </div>

            {/* Registration Summary Table (Stacks cleanly on narrow viewports) */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-white mb-3.5 pb-2.5 border-b border-slate-700">
                Registration Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Institution</span>
                  <span className="font-medium text-slate-200 xs:text-right break-words">{team.institution}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Registration Date</span>
                  <span className="font-medium text-slate-200 tabular-nums xs:text-right">{team.paymentInfo.paidAt}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Captain Phone</span>
                  <span className="font-mono tabular-nums font-medium text-slate-200 xs:text-right">{team.captainPhone}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Captain Email</span>
                  <span className="font-medium text-slate-200 xs:text-right break-all">{team.captainEmail}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Drone Hardware</span>
                  <span className="font-medium text-slate-200 xs:text-right">{team.droneModel}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                  <span className="text-slate-400">Allocated Pit</span>
                  <span className="font-medium text-slate-200 xs:text-right">{team.allocatedPit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VENUE CHECK-IN QR PASS                             */}
        {/* ========================================================= */}
        {activeTab === 'checkin' && (
          <div className="space-y-4 sm:space-y-5 text-left">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Venue Rapid Check-in QR Code</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan at the tournament venue registration desk for express squad entry and pit allocation.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  disabled={!qrDataUrl}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap text-center"
                >
                  Download QR
                </button>
                <button
                  type="button"
                  onClick={handleCopyCheckInCode}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  {copiedCheckInCode ? 'Copied Code' : 'Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshQrToken}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Refresh Token
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Print Pass
                </button>
              </div>
            </div>

            {/* Main Check-in QR Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              {/* Left: Scannable QR Image */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-5">
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  {qrDataUrl && !isGeneratingQr ? (
                    <img
                      src={qrDataUrl}
                      alt={`Venue Check-in QR Code for ${team.teamName}`}
                      referrerPolicy="no-referrer"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain block"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-xs text-slate-500">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[11px] text-slate-400 block">Check-in Token</span>
                  <span className="font-mono tabular-nums text-sm font-semibold text-white">
                    {uniqueCheckInCode}
                  </span>
                </div>
              </div>

              {/* Right: Embedded Verification Details */}
              <div className="md:col-span-7 space-y-4 text-xs">
                <div className="border-b border-slate-700 pb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-slate-400 block">Verified Squad Pass</span>
                    <h3 className="text-base font-semibold text-white mt-0.5 truncate">{team.teamName}</h3>
                  </div>
                  <span className="text-emerald-400 font-medium shrink-0">
                    Entry Authorized
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="p-3 rounded-md bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 block">Team ID</span>
                    <span className="font-mono tabular-nums font-medium text-white mt-0.5 block truncate">
                      {team.teamId}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 block">Division</span>
                    <span className="font-medium text-white mt-0.5 block truncate">
                      {team.division}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 block">Allocated Pit Bay</span>
                    <span className="font-medium text-white mt-0.5 block truncate">
                      {team.allocatedPit}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-slate-900 border border-slate-700">
                    <span className="text-slate-400 block">Accredited Roster</span>
                    <span className="font-medium text-white mt-0.5 block tabular-nums truncate">
                      6 Members ({team.captainName})
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-slate-900 border border-slate-700 space-y-1 text-slate-300 leading-relaxed">
                  <div className="font-medium text-white">Venue Check-in Procedure</div>
                  <p className="text-slate-400">
                    1. Show this QR code at the Galgotias Arena Gate 2 Registration Desk on {GDSL_TOURNAMENT_INFO.dates}.
                  </p>
                  <p className="text-slate-400">
                    2. Collect 6 physical pilot/mechanic lanyards and proceed directly to {team.allocatedPit} for drone cage inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PAYMENT RECEIPT                                    */}
        {/* ========================================================= */}
        {activeTab === 'receipt' && (
          <div className="space-y-4 sm:space-y-5 text-left">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Payment Receipt &amp; Tax Invoice</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proof of entry fee payment and verified tournament registration.
                </p>
              </div>
              <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadReceiptPdf}
                  disabled={isGeneratingPdf}
                  className="min-h-[44px] sm:min-h-[36px] px-3 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap text-center"
                >
                  {isGeneratingPdf ? 'Saving...' : 'Download PDF'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[44px] sm:min-h-[36px] px-3 py-2 text-xs font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleCopyReceiptNo}
                  className="min-h-[44px] sm:min-h-[36px] px-3 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  {copiedReceipt ? 'Copied' : 'Copy Ref'}
                </button>
              </div>
            </div>

            {pdfDownloadSuccess && (
              <div className="p-3 bg-slate-800 border border-emerald-700/60 text-emerald-300 text-xs rounded-md flex items-center justify-between">
                <span>Invoice PDF for {team.teamName} downloaded.</span>
                <button
                  type="button"
                  onClick={() => setPdfDownloadSuccess(false)}
                  className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {pdfError && (
              <div className="p-3 bg-slate-800 border border-red-700/60 text-red-300 text-xs rounded-md flex items-center justify-between">
                <span>{pdfError}</span>
                <button
                  type="button"
                  onClick={() => setPdfError(null)}
                  className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Printable A4 Receipt Paper (Mobile-friendly padding & horizontal scroll wrapper for table) */}
            <div
              ref={receiptRef}
              id="printable-receipt"
              className="bg-white border border-slate-300 rounded-lg p-4 sm:p-8 max-w-3xl mx-auto space-y-5 sm:space-y-6 text-slate-900 print:border-none print:shadow-none"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Galgotias University</h3>
                  <p className="text-xs text-slate-600">
                    Galgotias Centre for Drone &amp; Innovative Systems (GCDIS)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, UP - 203201
                    <br />
                    <span className="font-mono text-slate-500">
                      GSTIN: 09AAAAU0000A1Z5 · Tournament Registration Receipt
                    </span>
                  </p>
                </div>

                <div className="sm:text-right shrink-0 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="font-semibold text-emerald-700">PAID RECEIPT</div>
                  <div className="text-slate-500 mt-0.5 tabular-nums">
                    Date: <span className="font-medium text-slate-800">{team.paymentInfo.paidAt}</span>
                  </div>
                  <div className="text-slate-500 tabular-nums">
                    Receipt No: <span className="font-mono font-semibold text-slate-900">{team.paymentInfo.receiptNo}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="bg-slate-50 p-3 sm:p-3.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Billed To</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{team.teamName}</span>
                  <span className="text-slate-700 block">{team.institution}</span>
                  <span className="text-slate-600 block">{team.city}, {team.state}</span>
                  <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200 break-words">
                    Captain: {team.captainName} ({team.captainPhone})
                    <br />
                    Email: {team.captainEmail}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 sm:p-3.5 rounded border border-slate-200 sm:text-right">
                  <span className="text-slate-500 block text-[11px] font-medium">Event Details</span>
                  <span className="font-bold text-slate-900 block mt-0.5">Galgotias Drone Soccer League 2026</span>
                  <span className="text-slate-700 font-medium block">{team.division}</span>
                  <span className="font-mono text-slate-600 block">Team ID: {team.teamId}</span>
                  <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                    Payment Mode: {team.paymentInfo.paymentMode}
                    <br />
                    Event Dates: {GDSL_TOURNAMENT_INFO.dates}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[420px] text-xs text-left border-t border-b border-slate-200">
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
                          Squad Registration &amp; Pilot Accreditation
                        </span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Entry for 5 pilots + 1 pit mechanic, arena access &amp; pit bay ({team.allocatedPit}).
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono whitespace-nowrap">{team.division}</td>
                      <td className="py-3 px-2 text-center font-mono tabular-nums">1</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {team.paymentInfo.amount}.00
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold text-slate-900">
                      <td className="py-2.5 px-3">Total Paid</td>
                      <td></td>
                      <td></td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm font-bold whitespace-nowrap">
                        {team.paymentInfo.amount}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="font-mono tabular-nums break-all">
                  Transaction Ref: {team.paymentInfo.transactionId}
                </div>
                <div>
                  Status: Verified · {team.allocatedPit}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ATTENDANCE APPLICATION (OD LETTER)                 */}
        {/* ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 sm:space-y-5 text-left">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Attendance Application (On-Duty Letter)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize recipient details and student roll numbers before printing.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>

            {odDispatchedAlert && (
              <div className="p-3 bg-slate-800 border border-emerald-700/60 text-emerald-300 text-xs rounded-md">
                Attendance letter details saved.
              </div>
            )}

            {/* Recipient Configuration Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-5 space-y-4 text-xs">
              <h3 className="font-semibold text-white text-sm">Recipient Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">To (Authority Title)</label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Printable Official OD Letter Paper */}
            <div
              id="printable-od-letter"
              className="bg-white border border-slate-300 rounded-lg p-4 sm:p-8 max-w-3xl mx-auto space-y-5 text-slate-800 leading-relaxed"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-300 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Galgotias Centre for Drone &amp; Innovative Systems
                  </h3>
                  <p className="text-xs text-slate-600">
                    Galgotias University, Greater Noida · Tournament Secretariat
                  </p>
                </div>
                <div className="sm:text-right text-xs text-slate-500 tabular-nums">
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

                {/* Mobile-friendly stacked student Roll No editor (hidden on sm+ and print) */}
                <div className="sm:hidden print:hidden space-y-2.5">
                  {students.map((st, i) => (
                    <div key={i} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          {i + 1}. {st.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{st.role}</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Roll / Registration No.</label>
                        <input
                          type="text"
                          value={st.rollNo || ''}
                          onChange={(e) => handleUpdateRoll(i, e.target.value)}
                          className="w-full min-h-[38px] px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono text-slate-900 bg-white"
                          placeholder="Enter Roll No"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop & Print Table */}
                <table className="hidden sm:table print:table w-full text-xs border border-slate-200">
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
          <div className="space-y-4 sm:space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Team Profile &amp; Pilot Roster</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registered squad members, contact details, and drone hardware specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                {isEditing ? 'Cancel Editing' : 'Edit Contact / Hardware'}
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-slate-800 border border-emerald-700/60 text-emerald-300 text-xs rounded-md">
                Profile updated.
              </div>
            )}

            {isEditing && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-5 space-y-4 text-xs"
              >
                <h3 className="font-semibold text-white text-sm">Update Contact &amp; Drone Specs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Captain Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Drone Model</label>
                    <input
                      type="text"
                      value={editDroneModel}
                      onChange={(e) => setEditDroneModel(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">VTX Band / Channel</label>
                    <input
                      type="text"
                      value={editVtx}
                      onChange={(e) => setEditVtx(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="min-h-[44px] sm:min-h-[36px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-xs transition-colors cursor-pointer text-center"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Clean Roster Table / Mobile Cards */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-slate-700">
                <h3 className="font-semibold text-white text-sm">Squad Roster (6 Members)</h3>
              </div>

              {/* Mobile Stacked Roster List */}
              <div className="sm:hidden divide-y divide-slate-700/70 text-xs">
                {[
                  { role: 'Team Captain', name: team.captainName, duty: 'Tactics & Communications' },
                  { role: 'Striker Pilot', name: team.strikerPilot, duty: 'Primary Goal Scorer' },
                  { role: 'Goalkeeper', name: team.goalkeeper, duty: 'Hoop Defense' },
                  { role: 'Defender 1', name: team.defender1, duty: 'Midfield Blocker' },
                  { role: 'Defender 2', name: team.defender2, duty: 'Zone Sweeper' },
                  { role: 'Pit Mechanic', name: team.pitMechanic, duty: 'Battery & Airframe Maintenance' },
                ].map((member, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-white text-sm">{member.name}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{member.role}</div>
                    </div>
                    <span className="text-slate-400 text-[11px] text-right">{member.duty}</span>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-400">
                      <th className="py-2.5 px-5 font-medium">Position / Role</th>
                      <th className="py-2.5 px-5 font-medium">Member Name</th>
                      <th className="py-2.5 px-5 font-medium">Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/70">
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Team Captain</td>
                      <td className="py-3 px-5 font-medium text-white">{team.captainName}</td>
                      <td className="py-3 px-5 text-slate-400">Tactics &amp; Communications</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Striker Pilot</td>
                      <td className="py-3 px-5 font-medium text-white">{team.strikerPilot}</td>
                      <td className="py-3 px-5 text-slate-400">Primary Goal Scorer</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Goalkeeper</td>
                      <td className="py-3 px-5 font-medium text-white">{team.goalkeeper}</td>
                      <td className="py-3 px-5 text-slate-400">Hoop Defense</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Defender 1</td>
                      <td className="py-3 px-5 font-medium text-white">{team.defender1}</td>
                      <td className="py-3 px-5 text-slate-400">Midfield Blocker</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Defender 2</td>
                      <td className="py-3 px-5 font-medium text-white">{team.defender2}</td>
                      <td className="py-3 px-5 text-slate-400">Zone Sweeper</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-5 text-slate-300">Pit Mechanic</td>
                      <td className="py-3 px-5 font-medium text-white">{team.pitMechanic}</td>
                      <td className="py-3 px-5 text-slate-400">Battery &amp; Airframe Maintenance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hardware Specifications */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-5">
              <h3 className="font-semibold text-white text-sm border-b border-slate-700 pb-3 mb-3.5">
                Hardware &amp; Pit Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="p-2.5 sm:p-0 rounded bg-slate-900/50 sm:bg-transparent border border-slate-700/60 sm:border-none">
                  <span className="text-slate-400 block">Drone Model</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.droneModel}</span>
                </div>
                <div className="p-2.5 sm:p-0 rounded bg-slate-900/50 sm:bg-transparent border border-slate-700/60 sm:border-none">
                  <span className="text-slate-400 block">Radio Protocol</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.controlProtocol}</span>
                </div>
                <div className="p-2.5 sm:p-0 rounded bg-slate-900/50 sm:bg-transparent border border-slate-700/60 sm:border-none">
                  <span className="text-slate-400 block">VTX Band</span>
                  <span className="font-mono font-medium text-slate-100 mt-0.5 block">{team.vtxBand}</span>
                </div>
                <div className="p-2.5 sm:p-0 rounded bg-slate-900/50 sm:bg-transparent border border-slate-700/60 sm:border-none">
                  <span className="text-slate-400 block">Pit Bay</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.allocatedPit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: MATCH SCHEDULE                                     */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6 text-left space-y-5">
            <div className="border-b border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Tournament Fixtures &amp; Match Schedule
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pool stage draws and match timings will be published after technical scrutineering.
                </p>
              </div>
              <span className="text-xs font-medium text-amber-400">
                Seeding Pending
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                <span className="text-slate-400">Event Dates</span>
                <span className="font-medium text-slate-200 tabular-nums">{GDSL_TOURNAMENT_INFO.dates}</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                <span className="text-slate-400">Fixture Release</span>
                <span className="font-medium text-slate-200 tabular-nums">Dec 01, 2026 · 7:00 PM IST</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                <span className="text-slate-400">Allocated Pit Bay</span>
                <span className="font-medium text-slate-200">{team.allocatedPit}</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-slate-700/70 gap-0.5">
                <span className="text-slate-400">Division</span>
                <span className="font-medium text-slate-200">{team.division}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400 break-all">
                Notification recipient: <strong className="text-slate-200">{team.captainEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setScheduleAlert(true);
                  setTimeout(() => setScheduleAlert(false), 3000);
                }}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer text-center"
              >
                {scheduleAlert ? 'Notification Enabled' : 'Notify When Fixtures Release'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Thumb-Zone Quick Navigation Bar (Hidden on sm+ and print) */}
      <nav
        aria-label="Mobile Dashboard Sections"
        className="sm:hidden no-print fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 grid grid-cols-6 px-1 py-1"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id)}
              className={`min-h-[46px] flex flex-col items-center justify-center rounded-md px-1 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] leading-tight truncate max-w-full">
                {tab.shortLabel}
              </span>
              {isActive && <span className="w-4 h-0.5 bg-blue-500 rounded-full mt-1" />}
            </button>
          );
        })}
      </nav>

      {/* Rapid Venue Check-in QR Modal (Mobile Bottom-Sheet & Desktop Centered Modal) */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-slate-800 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-left space-y-4 sm:space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="sm:hidden w-10 h-1 bg-slate-600 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-medium block">
                  Rapid Venue Entry Pass
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {team.teamName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="min-h-[38px] min-w-[60px] text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-5">
              <div className="bg-white p-2.5 sm:p-3 rounded-md border border-slate-200">
                {qrDataUrl && !isGeneratingQr ? (
                  <img
                    src={qrDataUrl}
                    alt={`Check-in QR Code for ${team.teamName}`}
                    referrerPolicy="no-referrer"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain block"
                  />
                ) : (
                  <div className="w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center text-xs text-slate-500">
                    Generating QR...
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-400 block">Unique Check-in Code</span>
                <span className="font-mono tabular-nums text-sm font-semibold text-white">
                  {uniqueCheckInCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Team ID</span>
                <span className="font-mono tabular-nums font-medium text-white truncate block">{team.teamId}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Division</span>
                <span className="font-medium text-white truncate block">{team.division}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Pit Bay</span>
                <span className="font-medium text-white truncate block">{team.allocatedPit}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Captain</span>
                <span className="font-medium text-white truncate block">{team.captainName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="col-span-2 sm:flex-1 min-h-[44px] sm:min-h-[38px] py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors cursor-pointer text-center"
              >
                Download QR (PNG)
              </button>
              <button
                type="button"
                onClick={handleCopyCheckInCode}
                className="min-h-[44px] sm:min-h-[38px] py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-md transition-colors cursor-pointer text-center"
              >
                {copiedCheckInCode ? 'Copied' : 'Copy Code'}
              </button>
              <button
                type="button"
                onClick={handleRefreshQrToken}
                className="min-h-[44px] sm:min-h-[38px] py-2 px-3 border border-slate-600 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors cursor-pointer text-center"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboardPage;
