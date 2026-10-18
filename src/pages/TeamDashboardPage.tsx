import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'receipt' | 'attendance' | 'profile' | 'schedule'>('overview');

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

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'receipt', label: 'Payment Receipt' },
    { id: 'attendance', label: 'OD Letter' },
    { id: 'profile', label: 'Profile & Roster' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div className="basic-dashboard-scope relative z-20 min-h-screen bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Status Notifications */}
        {sheetSyncSuccess && (
          <div className="p-3 rounded-md bg-slate-800 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between">
            <span>{sheetSyncSuccess}</span>
            <button
              onClick={() => setSheetSyncSuccess(null)}
              className="text-slate-400 hover:text-white font-medium ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {sheetSyncError && (
          <div className="p-3 rounded-md bg-slate-800 border border-red-700/60 text-red-300 text-xs flex items-center justify-between">
            <span>{sheetSyncError}</span>
            <button
              onClick={() => setSheetSyncError(null)}
              className="text-slate-400 hover:text-white font-medium ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Basic Utilitarian Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Squad Dashboard</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Registered</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{team.teamId}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                {team.teamName}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {team.institution} · {team.city}, {team.state}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Main Site
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-medium rounded-md border border-red-800/70 bg-red-950/40 text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Key Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Team ID</span>
              <span className="font-mono tabular-nums font-medium text-slate-100 mt-0.5 block">
                {team.teamId}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Division</span>
              <span className="font-medium text-slate-100 mt-0.5 block">
                {team.division}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Captain</span>
              <span className="font-medium text-slate-100 mt-0.5 block">
                {team.captainName}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Event Dates</span>
              <span className="font-medium text-slate-100 mt-0.5 block tabular-nums">
                {GDSL_TOURNAMENT_INFO.dates}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Standard Horizontal Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-white bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW                                           */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            {/* Simple 4-Card Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="mt-3 text-xs font-mono tabular-nums text-slate-300">
                    Ref: {team.paymentInfo.receiptNo}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReceiptPdf}
                    disabled={isGeneratingPdf}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipt')}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap"
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
                  <div className="mt-3 text-xs tabular-nums text-slate-300">
                    {students.length} roster members listed
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
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
                  <div className="mt-3 text-xs text-slate-300 truncate">
                    Model: {team.droneModel}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
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
                  <div className="mt-3 text-xs text-slate-300">
                    Pit: {team.allocatedPit}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Check Status
                  </button>
                </div>
              </div>
            </div>

            {/* Registration Summary Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-white mb-4 pb-2.5 border-b border-slate-700">
                Registration Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Institution</span>
                  <span className="font-medium text-slate-200 text-right">{team.institution}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Registration Date</span>
                  <span className="font-medium text-slate-200 tabular-nums">{team.paymentInfo.paidAt}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Captain Phone</span>
                  <span className="font-mono tabular-nums font-medium text-slate-200">{team.captainPhone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Captain Email</span>
                  <span className="font-medium text-slate-200">{team.captainEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Drone Hardware</span>
                  <span className="font-medium text-slate-200">{team.droneModel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/70">
                  <span className="text-slate-400">Allocated Pit</span>
                  <span className="font-medium text-slate-200">{team.allocatedPit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PAYMENT RECEIPT                                    */}
        {/* ========================================================= */}
        {activeTab === 'receipt' && (
          <div className="space-y-5 text-left">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Payment Receipt &amp; Tax Invoice</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proof of entry fee payment and verified tournament registration.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadReceiptPdf}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 text-xs font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleCopyReceiptNo}
                  className="px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedReceipt ? 'Copied' : 'Copy Receipt #'}
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

            {/* Printable A4 Receipt Paper (Retains Clean White Document Contrast for PDF/Print) */}
            <div
              ref={receiptRef}
              id="printable-receipt"
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 max-w-3xl mx-auto space-y-6 text-slate-900 print:border-none print:shadow-none"
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
                    Receipt No: <span className="font-mono font-semibold text-slate-900">{team.paymentInfo.receiptNo}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Billed To</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">{team.teamName}</span>
                  <span className="text-slate-700 block">{team.institution}</span>
                  <span className="text-slate-600 block">{team.city}, {team.state}</span>
                  <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                    Captain: {team.captainName} ({team.captainPhone})
                    <br />
                    Email: {team.captainEmail}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 sm:text-right">
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
                        Squad Registration &amp; Pilot Accreditation
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Entry for 5 pilots + 1 pit mechanic, arena access &amp; pit bay ({team.allocatedPit}).
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">{team.division}</td>
                    <td className="py-3 px-2 text-center font-mono tabular-nums">1</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {team.paymentInfo.amount}.00
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-semibold text-slate-900">
                    <td className="py-2.5 px-3">Total Paid</td>
                    <td></td>
                    <td></td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm font-bold">
                      {team.paymentInfo.amount}.00
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
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ATTENDANCE APPLICATION (OD LETTER)                 */}
        {/* ========================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-5 text-left">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-white">Attendance Application (On-Duty Letter)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize recipient details and student roll numbers before printing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
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
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4 text-xs">
              <h3 className="font-semibold text-white text-sm">Recipient Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">To (Authority Title)</label>
                  <input
                    type="text"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Printable Official OD Letter Paper */}
            <div
              id="printable-od-letter"
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 max-w-3xl mx-auto space-y-5 text-slate-800 leading-relaxed"
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
                <div className="text-right text-xs text-slate-500 tabular-nums">
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
        {/* TAB 4: TEAM PROFILE & ROSTER                              */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-5 text-left">
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
                className="px-3.5 py-2 text-xs font-medium rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
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
                className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-4 text-xs"
              >
                <h3 className="font-semibold text-white text-sm">Update Contact &amp; Drone Specs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Captain Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Drone Model</label>
                    <input
                      type="text"
                      value={editDroneModel}
                      onChange={(e) => setEditDroneModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">VTX Band / Channel</label>
                    <input
                      type="text"
                      value={editVtx}
                      onChange={(e) => setEditVtx(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-md text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Clean Roster Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-700">
                <h3 className="font-semibold text-white text-sm">Squad Roster (6 Members)</h3>
              </div>
              <div className="overflow-x-auto">
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
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h3 className="font-semibold text-white text-sm border-b border-slate-700 pb-3 mb-4">
                Hardware &amp; Pit Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Drone Model</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.droneModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Radio Protocol</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.controlProtocol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">VTX Band</span>
                  <span className="font-mono font-medium text-slate-100 mt-0.5 block">{team.vtxBand}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pit Bay</span>
                  <span className="font-medium text-slate-100 mt-0.5 block">{team.allocatedPit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MATCH SCHEDULE                                     */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-left space-y-5">
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
              <div className="flex justify-between py-2 border-b border-slate-700/70">
                <span className="text-slate-400">Event Dates</span>
                <span className="font-medium text-slate-200 tabular-nums">{GDSL_TOURNAMENT_INFO.dates}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/70">
                <span className="text-slate-400">Fixture Release</span>
                <span className="font-medium text-slate-200 tabular-nums">Dec 01, 2026 · 7:00 PM IST</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/70">
                <span className="text-slate-400">Allocated Pit Bay</span>
                <span className="font-medium text-slate-200">{team.allocatedPit}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/70">
                <span className="text-slate-400">Division</span>
                <span className="font-medium text-slate-200">{team.division}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-400">
                Notification recipient: <strong className="text-slate-200">{team.captainEmail}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setScheduleAlert(true);
                  setTimeout(() => setScheduleAlert(false), 3000);
                }}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {scheduleAlert ? 'Notification Enabled' : 'Notify When Fixtures Release'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboardPage;
