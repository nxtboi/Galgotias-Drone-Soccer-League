import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  RegisteredTeamProfile,
  saveRegisteredTeam,
  setCurrentSession,
} from '../data/teamAuthData';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import { GoogleSheetsSyncBar } from '../components/GoogleSheetsSyncBar';
import { SheetsConfirmModal } from '../components/SheetsConfirmModal';
import { syncTeamToSheet, getStoredSheetInfo } from '../services/googleSheetsService';
import { getAccessToken, getCurrentUser } from '../services/googleAuth';

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
  const [sheetSyncLoading, setSheetSyncLoading] = useState(false);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<string | null>(null);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);
  const [showSheetConfirmModal, setShowSheetConfirmModal] = useState(false);
  const [pendingUpdateTeam, setPendingUpdateTeam] = useState<RegisteredTeamProfile | null>(null);
  const [updateActionReason, setUpdateActionReason] = useState<string>('Team details updated');

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

  const handleSaveProfile = (e: React.FormEvent) => {
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

    // Prompt user to update details in Google Sheets
    setPendingUpdateTeam(updatedTeam);
    setUpdateActionReason('Squad contact phone and drone specifications updated');
    setShowSheetConfirmModal(true);
  };

  const handleUpdateRoll = (index: number, roll: string) => {
    const updated = [...students];
    updated[index].rollNo = roll;
    setStudents(updated);
  };

  const handleSaveAttendance = () => {
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

    // Prompt user to update details in Google Sheets
    setPendingUpdateTeam(updatedTeam);
    setUpdateActionReason('Faculty mentor endorsement & student roll numbers updated');
    setShowSheetConfirmModal(true);
  };

  const executeConfirmedSheetUpdate = async () => {
    const targetTeam = pendingUpdateTeam || team;
    setSheetSyncLoading(true);
    setSheetSyncError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to sync updates with Google Sheets.');
      }
      const res = await syncTeamToSheet(targetTeam, token);
      setSheetSyncSuccess(res.message);
      setShowSheetConfirmModal(false);
      setTimeout(() => setSheetSyncSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating Google Sheets:', err);
      setSheetSyncError(err.message || 'Failed to update Google Sheets.');
      setShowSheetConfirmModal(false);
    } finally {
      setSheetSyncLoading(false);
    }
  };

  const handleManualSyncCurrentSquad = () => {
    setPendingUpdateTeam(team);
    setUpdateActionReason('Manual squad roster synchronization');
    setShowSheetConfirmModal(true);
  };

  const handleDownloadReceiptPdf = async () => {
    // If not in receipt tab, switch to it to ensure DOM element is ready
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
      setPdfError('Unable to generate PDF directly with html2pdf. You can use the Print / Save PDF option.');
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

  return (
    <div className="relative z-20 min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-slate-800">
      
      {/* Google Sheets Synchronization Hub Bar */}
      <div className="mb-6">
        <GoogleSheetsSyncBar />
      </div>

      {/* Sync Alerts */}
      {sheetSyncSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between">
          <span>✅ {sheetSyncSuccess}</span>
          <button onClick={() => setSheetSyncSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {sheetSyncError && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between">
          <span>⚠️ {sheetSyncError}</span>
          <button onClick={() => setSheetSyncError(null)} className="text-rose-700 hover:text-rose-950 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* 1. Basic Clean Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <GcdisLogo size="sm" showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {team.teamName}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Registered
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {team.institution} · {team.city}, {team.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualSyncCurrentSquad}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Sync current squad details to Google Sheets"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Sync with Google Sheets</span>
              <span className="sm:hidden">Sheets Sync</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Main Site
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick info row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Team ID</span>
            <span className="font-mono font-bold text-slate-800">{team.teamId}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Division &amp; Prize Pool</span>
            <span className="font-semibold text-slate-800">
              {team.division} ({team.division?.includes('20') ? 'D-20: ₹37,000 Pool' : 'D-40: ₹57,000 Pool'})
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Captain</span>
            <span className="font-semibold text-slate-800">{team.captainName}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tournament Dates</span>
            <span className="font-semibold text-slate-800">{GDSL_TOURNAMENT_INFO.dates}</span>
          </div>
        </div>
      </div>

      {/* 2. Basic Navigation Tabs - Horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none sm:flex-wrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'receipt'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Payment Receipt
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'attendance'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Attendance (OD Letter)
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Team Profile &amp; Roster
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 sm:px-4 py-2 min-h-[40px] shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'schedule'
              ? 'bg-blue-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Match Schedule
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB: OVERVIEW (Basic 4-card dashboard view)               */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 text-left">
          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Payment Receipt */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🧾</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    PAID
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Payment Receipt</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Registration fee of {team.paymentInfo.amount} paid. Download official receipt.
                </p>
                <div className="mt-3 text-xs font-mono text-slate-600">
                  Ref: {team.paymentInfo.receiptNo}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleDownloadReceiptPdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download Receipt</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('receipt')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  title="View complete invoice"
                >
                  View →
                </button>
              </div>
            </div>

            {/* Card 2: Attendance Request */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🎓</span>
                  <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                    AVAILABLE
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Attendance Request</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate On-Duty (OD) sanction letter for your college/university faculty.
                </p>
                <div className="mt-3 text-xs text-slate-600">
                  {students.length} students enrolled
                </div>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-lg transition-colors text-center"
              >
                Apply for OD Letter →
              </button>
            </div>

            {/* Card 3: Team Profile */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">👤</span>
                  <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                    {team.division}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Team Profile</h3>
                <p className="text-xs text-slate-500 mt-1">
                  View full squad roster, captain contact info, and drone hardware specifications.
                </p>
                <div className="mt-3 text-xs text-slate-600 truncate">
                  Captain: {team.captainName}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-lg transition-colors text-center"
              >
                View Profile →
              </button>
            </div>

            {/* Card 4: Match Schedule */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">⏱️</span>
                  <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    COMING SOON
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Match Schedule</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Arena matches and pool stage timing will be announced ahead of the event.
                </p>
                <div className="mt-3 text-xs text-slate-600 font-medium">
                  {GDSL_TOURNAMENT_INFO.dates}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="mt-4 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition-colors text-center"
              >
                Schedule Status →
              </button>
            </div>

          </div>

          {/* Quick Details Table in Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Registration Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-800">{team.institution}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Registration Date:</span>
                <span className="font-semibold text-slate-800">{team.paymentInfo.paidAt}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Captain Contact:</span>
                <span className="font-semibold text-slate-800">{team.captainPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Captain Email:</span>
                <span className="font-semibold text-slate-800">{team.captainEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Drone Hardware:</span>
                <span className="font-semibold text-slate-800">{team.droneModel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Allocated Pit:</span>
                <span className="font-semibold text-blue-900">{team.allocatedPit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: PAYMENT RECEIPT                                      */}
      {/* ========================================================= */}
      {activeTab === 'receipt' && (
        <div className="space-y-6 text-left">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Payment Receipt &amp; Tax Invoice</h2>
              <p className="text-xs text-slate-500">
                Official proof of entry payment and verified tournament registration status.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadReceiptPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Generate printable PDF invoice using html2pdf"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Download Receipt (PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-950 text-white flex items-center gap-1.5 transition-colors"
              >
                <span>🖨️</span>
                <span>Print</span>
              </button>

              <button
                onClick={handleCopyReceiptNo}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copiedReceipt ? '✓ Copied' : 'Copy Receipt #'}
              </button>
            </div>
          </div>

          {/* PDF Download Alerts */}
          {pdfDownloadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <span>🎉</span>
                <span>
                  Official printable invoice for <strong>{team.teamName}</strong> downloaded successfully!
                </span>
              </span>
              <button
                onClick={() => setPdfDownloadSuccess(false)}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {pdfError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-fade-in">
              <span>⚠️ {pdfError}</span>
              <button
                onClick={() => setPdfError(null)}
                className="text-rose-700 hover:text-rose-950 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Printable Receipt Paper for html2pdf */}
          <div
            ref={receiptRef}
            id="printable-team-receipt"
            className="bg-white border border-slate-300 rounded-xl p-8 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6 text-slate-900 print:border-none print:shadow-none"
          >
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                    G
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Galgotias University</h3>
                    <p className="text-xs text-slate-600 font-medium">Galgotias Centre for Drone &amp; Innovative Systems (GCDIS)</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, Gautam Buddha Nagar, UP - 203201
                  <br />
                  <span className="font-mono text-slate-400">GSTIN: 09AAAAU0000A1Z5 · Tournament Tax Invoice / Cash Receipt</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-300 shadow-2xs">
                  PAID RECEIPT
                </span>
                <div className="text-xs text-slate-500 mt-2">
                  Date: <span className="font-semibold text-slate-800">{team.paymentInfo.paidAt}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Receipt No: <span className="font-mono font-bold text-slate-900">{team.paymentInfo.receiptNo}</span>
                </div>
              </div>
            </div>

            {/* Registration Status Banner on Receipt */}
            <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider block font-bold">
                    OFFICIAL REGISTRATION STATUS
                  </span>
                  <span className="font-bold text-blue-950 text-sm">
                    Confirmed Entry · {team.scrutineeringStatus === 'PRE_APPROVED' ? 'Pre-Approved for Technical Scrutineering' : 'Pending On-Site Inspection'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white border border-blue-200 text-blue-900 font-mono text-[11px] px-2.5 py-1 rounded-md font-bold">
                  {team.allocatedPit}
                </span>
                <span className="bg-emerald-600 text-white font-mono text-[11px] px-2.5 py-1 rounded-md font-bold">
                  SLOT VERIFIED
                </span>
              </div>
            </div>

            {/* Billed To & Event Details */}
            <div className="grid grid-cols-2 gap-4 text-xs py-1">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Billed To (Registered Squad):</span>
                <span className="font-black text-slate-900 text-sm block mt-0.5 uppercase">{team.teamName}</span>
                <span className="text-slate-700 font-medium block">{team.institution}</span>
                <span className="text-slate-600 block">{team.city}, {team.state}</span>
                <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                  <strong>Captain:</strong> {team.captainName} ({team.captainPhone})
                  <br />
                  <strong>Email:</strong> {team.captainEmail}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-right">
                <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Tournament Classification:</span>
                <span className="font-bold text-slate-900 block mt-0.5">Galgotias Drone Soccer League 2026</span>
                <span className="text-blue-900 font-bold block">{team.division}</span>
                <span className="font-mono text-slate-600 block">Team ID: <strong className="text-slate-900">{team.teamId}</strong></span>
                <span className="text-slate-600 block mt-1.5 pt-1.5 border-t border-slate-200">
                  <strong>Payment Mode:</strong> {team.paymentInfo.paymentMode}
                  <br />
                  <strong>Event Dates:</strong> {GDSL_TOURNAMENT_INFO.dates}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-left border-t border-b border-slate-200">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60 font-mono">
                  <th className="py-2.5 px-3 font-bold">Description</th>
                  <th className="py-2.5 px-2 font-bold text-center">Division</th>
                  <th className="py-2.5 px-2 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block text-xs">Squad Registration &amp; Pilot Accreditation</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Entry pass for 5 pilots + 1 pit mechanic, official credentials, arena access &amp; technical bay allocation.
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-mono">{team.division}</td>
                  <td className="py-3 px-2 text-center font-mono">1 Squad</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{team.paymentInfo.amount}.00</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-600">Subtotal</td>
                  <td></td>
                  <td></td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">{team.paymentInfo.amount}.00</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-600">GST (Educational &amp; Technical Sports Exemption)</td>
                  <td></td>
                  <td></td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">₹0.00</td>
                </tr>
                <tr className="bg-slate-100/80 font-bold text-slate-900 text-sm">
                  <td className="py-3 px-3">Total Amount Paid</td>
                  <td></td>
                  <td></td>
                  <td className="py-3 px-3 text-right text-blue-900 font-mono text-base font-black">
                    {team.paymentInfo.amount}.00
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Verified Pilot Roster Summary on Invoice */}
            <div className="bg-slate-50/60 border border-slate-200/70 rounded-lg p-3 text-[11px]">
              <span className="font-bold text-slate-700 block font-mono uppercase text-[10px] mb-1">
                Accredited Squad Personnel:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>• Striker Pilot: <strong>{team.strikerPilot}</strong></div>
                <div>• Goalkeeper: <strong>{team.goalkeeper}</strong></div>
                <div>• Defender 1: <strong>{team.defender1}</strong></div>
                <div>• Defender 2: <strong>{team.defender2}</strong></div>
                <div>• Pit Mechanic: <strong>{team.pitMechanic}</strong></div>
                <div>• Radio/Hardware: <strong>{team.droneModel}</strong></div>
              </div>
            </div>

            {/* Payment & Security Verification Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-3 items-center">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Electronic Transaction Reference:</span>
                <span className="font-mono text-slate-600 text-[11px]">{team.paymentInfo.transactionId}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                  <span>✓</span> Payment Verified &amp; Slot Confirmed
                </span>
                <span className="text-slate-400 text-[11px]">GCDIS Finance &amp; Tournament Secretariat</span>
              </div>
            </div>

            {/* Footer Note with Security Hash */}
            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 space-y-1">
              <div>
                This is an official computer-generated receipt issued by the Galgotias Centre for Drone &amp; Innovative Systems (GCDIS).
              </div>
              <div className="font-mono text-[9px] text-slate-400">
                VERIFICATION HASH: GDSL-2026-SEC-{team.teamId}-{team.paymentInfo.receiptNo} · DIGITAL STAMP VALIDATED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: ATTENDANCE APPLICATION (OD LETTER)                   */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 text-left">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Attendance Application (On-Duty / OD Letter)</h2>
              <p className="text-xs text-slate-500">
                Official attendance recommendation letter to submit to your Dean / Head of Department.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAttendance}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Save Changes
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-950 flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Print / Save OD Letter</span>
              </button>
            </div>
          </div>

          {odDispatchedAlert && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-medium">
              ✓ Attendance letter details updated successfully!
            </div>
          )}

          {/* Configuration Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm">Recipient Details (Customize for Your College)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">To (Authority Title):</label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Department:</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">College / University Name:</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Printable Official OD Letter */}
          <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6 text-slate-800 font-serif leading-relaxed">
            {/* Letter Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base uppercase font-sans tracking-wide">
                  Galgotias Centre for Drone &amp; Innovative Systems
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  Galgotias University, Greater Noida · Secretariat of Student Aeromodelling
                </p>
              </div>
              <div className="text-right font-sans text-xs text-slate-500">
                <div>Ref: GCDIS/OD-2026/{team.teamId}</div>
                <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Letter To */}
            <div className="text-xs space-y-0.5 pt-2">
              <div className="font-bold">To,</div>
              <div>{facultyName}</div>
              <div>{department}</div>
              <div>{collegeName}</div>
            </div>

            {/* Subject */}
            <div className="text-xs font-bold pt-2 border-l-2 border-blue-900 pl-3 py-1 font-sans">
              Subject: Official Request for Attendance Grant / On-Duty (OD) Leave for Students Participating in the Galgotias Drone Soccer League 2026.
            </div>

            {/* Letter Body */}
            <div className="text-xs space-y-3 font-sans text-slate-700">
              <p>Respected Sir / Madam,</p>
              <p>
                This is to officially certify that the following bonafide students of your esteemed institution have qualified and registered their team <strong>"{team.teamName}"</strong> (Team ID: <span className="font-mono font-bold text-slate-900">{team.teamId}</span>) to compete in the prestigious <strong>Galgotias Drone Soccer League 2026</strong>.
              </p>
              <p>
                The national tournament will be conducted under the international FIDA 5th Revision regulations at the Galgotias Drone Arena, Greater Noida on <strong>{GDSL_TOURNAMENT_INFO.dates}</strong>.
              </p>
            </div>

            {/* Students Table with Editable Roll Numbers */}
            <div className="font-sans">
              <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase">Official Participating Student Contingent:</h4>
              <table className="w-full text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2 border border-slate-200 text-left">#</th>
                    <th className="p-2 border border-slate-200 text-left">Student Name</th>
                    <th className="p-2 border border-slate-200 text-left">Tournament Role</th>
                    <th className="p-2 border border-slate-200 text-left">Roll / Reg No</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200">{i + 1}</td>
                      <td className="p-2 border border-slate-200 font-semibold">{st.name}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">{st.role}</td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={st.rollNo || ''}
                          onChange={(e) => handleUpdateRoll(i, e.target.value)}
                          className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-xs font-mono font-bold"
                          placeholder="Enter Roll No"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Request note */}
            <div className="text-xs space-y-2 font-sans text-slate-700">
              <p>
                Kindly consider their participation as official academic On-Duty (OD) representation, and grant academic attendance dispensation for the event days (including travel allowances where applicable).
              </p>
              <p>Thanking you in anticipation of your kind support for collegiate student innovation.</p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between items-end font-sans text-xs">
              <div>
                <div className="text-slate-400 italic mb-2">[Official Stamp / Seal]</div>
                <div className="font-bold text-slate-800">Organizing Committee</div>
                <div className="text-slate-500">Galgotias Drone Soccer League</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">Director, GCDIS</div>
                <div className="text-slate-500">Galgotias University</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: TEAM PROFILE & ROSTER                                */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Profile &amp; Pilot Roster</h2>
              <p className="text-xs text-slate-500">Your registered team details and drone specifications.</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isEditing ? 'Cancel Editing' : '✏️ Edit Contact / Hardware'}
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg font-medium">
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Edit Form Modal/Box if toggled */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Update Contact &amp; Drone Specs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Captain Phone Number:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Drone Model:</label>
                  <input
                    type="text"
                    value={editDroneModel}
                    onChange={(e) => setEditDroneModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">VTX Band / Channel:</label>
                  <input
                    type="text"
                    value={editVtx}
                    onChange={(e) => setEditVtx(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-bold text-xs"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Basic Roster Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Official 6-Person Squad Roster
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Striker Pilot</span>
                <span className="font-bold text-slate-900 text-sm block">{team.strikerPilot}</span>
                <span className="text-slate-500 text-[11px]">Primary scorer · Green LED</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-blue-700 font-bold block uppercase">Goalkeeper Pilot</span>
                <span className="font-bold text-slate-900 text-sm block">{team.goalkeeper}</span>
                <span className="text-slate-500 text-[11px]">Hoop defender · White LED</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-sky-700 font-bold block uppercase">Defender 1 (Libero)</span>
                <span className="font-bold text-slate-900 text-sm block">{team.defender1}</span>
                <span className="text-slate-500 text-[11px]">Blocker · Sky Blue LED</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Defender 2 (Sweeper)</span>
                <span className="font-bold text-slate-900 text-sm block">{team.defender2}</span>
                <span className="text-slate-500 text-[11px]">Zone sweeper · Yellow LED</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-purple-700 font-bold block uppercase">Team Captain &amp; Pilot</span>
                <span className="font-bold text-slate-900 text-sm block">{team.captainName}</span>
                <span className="text-slate-500 text-[11px]">Telemetry &amp; Tactics</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-700 font-bold block uppercase">Pit Mechanic</span>
                <span className="font-bold text-slate-900 text-sm block">{team.pitMechanic}</span>
                <span className="text-slate-500 text-[11px]">Battery &amp; Airframe repair</span>
              </div>
            </div>
          </div>

          {/* Technical Hardware Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4">
              Drone Hardware &amp; Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Exoskeleton Model:</span>
                <span className="font-bold text-slate-800">{team.droneModel}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Radio Protocol:</span>
                <span className="font-bold text-slate-800">{team.controlProtocol}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">VTX Band:</span>
                <span className="font-mono font-bold text-slate-800">{team.vtxBand}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Pit Allocation:</span>
                <span className="font-bold text-blue-900">{team.allocatedPit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: MATCH SCHEDULE (COMING SOON)                         */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-xs text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto border border-amber-200">
              ⏱️
            </div>
            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                Coming Soon
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Tournament Fixtures &amp; Match Schedule
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                The official pool draws and arena time slots will be published prior to tournament kick-off.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-2 text-left">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Event Dates:</span>
                <span className="font-bold text-slate-900">{GDSL_TOURNAMENT_INFO.dates}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Fixture Release:</span>
                <span className="font-bold text-slate-900">December 01, 2026 (7:00 PM IST)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Your Allocated Pit:</span>
                <span className="font-bold text-blue-900">{team.allocatedPit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Team Classification:</span>
                <span className="font-bold text-slate-900">{team.division}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setScheduleAlert(true);
                  setTimeout(() => setScheduleAlert(false), 3000);
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-colors shadow-xs"
              >
                {scheduleAlert ? '✓ Alert Enabled for ' + team.captainEmail : 'Notify Captain on WhatsApp/Email When Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit User Confirmation for Google Sheets Mutation */}
      <SheetsConfirmModal
        isOpen={showSheetConfirmModal}
        title="Update Team Details in Google Sheets?"
        description="With your permission, this will update the technical specs, contact details, and student attendance records for this squad in your connected Google Sheet."
        details={[
          { label: 'Team Name', value: pendingUpdateTeam?.teamName || team.teamName },
          { label: 'Team ID', value: pendingUpdateTeam?.teamId || team.teamId },
          { label: 'Update Action', value: updateActionReason },
          { label: 'Drone Model', value: pendingUpdateTeam?.droneModel || team.droneModel },
        ]}
        confirmLabel="Confirm & Push to Google Sheets"
        cancelLabel="Cancel"
        isLoading={sheetSyncLoading}
        onConfirm={executeConfirmedSheetUpdate}
        onCancel={() => setShowSheetConfirmModal(false)}
      />

    </div>
  );
};

export default TeamDashboardPage;
