import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Lock,
  CheckCircle2,
  CreditCard,
  QrCode,
  Printer,
  Download,
  Mail,
  Upload,
  FileText,
  Copy,
  Check,
  X,
  Send,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import {
  RegisteredTeamProfile,
  saveRegisteredTeam,
  setCurrentSession,
  getDivisionFee,
  getRegisteredTeams,
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

  // Request Payment Details on Email Modal State
  const [isEmailDetailsModalOpen, setIsEmailDetailsModalOpen] = useState(false);
  const [emailForPaymentDetails, setEmailForPaymentDetails] = useState(team.captainEmail);
  const [isSendingEmailDetails, setIsSendingEmailDetails] = useState(false);
  const [emailDetailsSentSuccess, setEmailDetailsSentSuccess] = useState(false);
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);

  // Upload Payment Details Modal State
  const [isUploadPaymentModalOpen, setIsUploadPaymentModalOpen] = useState(false);
  const [uploadTxId, setUploadTxId] = useState(
    team.paymentInfo.transactionId && team.paymentInfo.transactionId !== 'PENDING'
      ? team.paymentInfo.transactionId
      : ''
  );
  const [uploadPaymentMode, setUploadPaymentMode] = useState(
    team.paymentInfo.paymentMode && team.paymentInfo.paymentMode !== 'Pending Dashboard Checkout'
      ? team.paymentInfo.paymentMode
      : 'UPI Transfer (GPay / PhonePe / Paytm)'
  );
  const [uploadAmount, setUploadAmount] = useState(
    team.paymentInfo.amount || getDivisionFee(team.division).formatted
  );
  const [uploadPaidDate, setUploadPaidDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [uploadPayerDetails, setUploadPayerDetails] = useState(
    team.paymentInfo.payerDetails || team.captainName
  );
  const [uploadRemarks, setUploadRemarks] = useState(
    team.paymentInfo.remarks || ''
  );
  const [uploadProofFileName, setUploadProofFileName] = useState(
    team.paymentInfo.proofFileName || ''
  );
  const [uploadProofDataUrl, setUploadProofDataUrl] = useState(
    team.paymentInfo.proofDataUrl || ''
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

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
    const syncFromServerExcel = async () => {
      try {
        setSheetSyncLoading(true);
        const res = await fetch('/api/excel/status');
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (Array.isArray(data.teams) && data.teams.length > 0) {
            localStorage.setItem('gdsl_registered_teams_v1', JSON.stringify(data.teams));
            const serverMatch = data.teams.find(
              (t: RegisteredTeamProfile) =>
                t.teamId.trim().toLowerCase() === team.teamId.trim().toLowerCase()
            );
            if (serverMatch) {
              setCurrentSession(serverMatch);
              if (onUpdateTeam && JSON.stringify(serverMatch) !== JSON.stringify(team)) {
                onUpdateTeam(serverMatch);
              }
            } else {
              // Team does not exist on server yet; push it once
              await syncTeamToSheet(team);
            }
          }
          setSheetInfo(getStoredSheetInfo());
        }
      } catch (err: any) {
        console.warn('Server Excel status check notice on mount:', err);
      } finally {
        if (!isCancelled) {
          setSheetSyncLoading(false);
        }
      }
    };

    syncFromServerExcel();

    return () => {
      isCancelled = true;
    };
  }, [team.teamId]);

  // Sync latest team profile from storage so changes made in the Admin Panel reflect live
  useEffect(() => {
    const syncLatest = () => {
      const allTeams = getRegisteredTeams();
      const latest = allTeams.find((t) => t.teamId === team.teamId);
      if (latest && JSON.stringify(latest.paymentInfo) !== JSON.stringify(team.paymentInfo) && onUpdateTeam) {
        onUpdateTeam(latest);
      }
    };
    syncLatest();
    window.addEventListener('storage', syncLatest);
    return () => window.removeEventListener('storage', syncLatest);
  }, [team.teamId, team.paymentInfo, onUpdateTeam]);

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

  const handleResetToPendingDemo = async () => {
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

    try {
      await syncTeamToSheet(updatedTeam);
    } catch (err) {
      console.warn('Reset pending sync notice:', err);
    }
  };

  const handleOpenEmailDetailsModal = () => {
    setEmailForPaymentDetails(team.paymentInfo.emailRequestedTo || team.captainEmail);
    setEmailDetailsSentSuccess(false);
    setIsEmailDetailsModalOpen(true);
  };

  const handleCopyBankValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedBankField(label);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  const handleRequestPaymentDetailsEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailForPaymentDetails.trim() || team.captainEmail;
    setIsSendingEmailDetails(true);

    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} · ${now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })} IST`;

    setTimeout(async () => {
      const updatedTeam: RegisteredTeamProfile = {
        ...team,
        paymentInfo: {
          ...team.paymentInfo,
          emailRequestedTo: targetEmail,
          emailRequestedAt: timestamp,
        },
      };

      saveRegisteredTeam(updatedTeam);
      setCurrentSession(updatedTeam);
      if (onUpdateTeam) onUpdateTeam(updatedTeam);
      setIsSendingEmailDetails(false);
      setEmailDetailsSentSuccess(true);
      setSheetSyncSuccess(
        `Official GDSL 2026 Fee Payment Details (${fee.formatted} for ${team.division}) sent to ${targetEmail}.`
      );
      setTimeout(() => setSheetSyncSuccess(null), 6000);

      try {
        await syncTeamToSheet(updatedTeam);
      } catch (err) {
        console.warn('Email request sheet sync notice:', err);
      }
    }, 600);
  };

  const handleOpenUploadModal = () => {
    setUploadTxId(
      team.paymentInfo.transactionId && team.paymentInfo.transactionId !== 'PENDING'
        ? team.paymentInfo.transactionId
        : ''
    );
    setUploadPaymentMode(
      team.paymentInfo.paymentMode && team.paymentInfo.paymentMode !== 'Pending Dashboard Checkout'
        ? team.paymentInfo.paymentMode
        : 'UPI Transfer (GPay / PhonePe / Paytm)'
    );
    setUploadAmount(team.paymentInfo.amount || fee.formatted);
    setUploadPayerDetails(team.paymentInfo.payerDetails || team.captainName);
    setUploadRemarks(team.paymentInfo.remarks || '');
    setUploadProofFileName(team.paymentInfo.proofFileName || '');
    setUploadProofDataUrl(team.paymentInfo.proofDataUrl || '');
    setUploadError(null);
    setIsUploadPaymentModalOpen(true);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File size must be under 8 MB. Please upload a smaller screenshot or PDF.');
      return;
    }

    setUploadProofFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
            setUploadProofDataUrl(compressedDataUrl);
          } else {
            setUploadProofDataUrl(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setUploadProofDataUrl('PDF_DOCUMENT');
    }
  };

  const handleUploadPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const cleanTxId = uploadTxId.trim();
    if (!cleanTxId || cleanTxId.length < 4) {
      setUploadError('Please enter a valid Transaction ID / UTR / Reference Number (min 4 characters).');
      return;
    }

    setIsUploadingPayment(true);

    setTimeout(async () => {
      const now = new Date();
      const formattedPaidAt = uploadPaidDate
        ? new Date(uploadPaidDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : now.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

      const uploadedTimestamp = `${now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} · ${now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })} IST`;

      const receiptNo =
        team.paymentInfo.receiptNo && team.paymentInfo.receiptNo !== 'PENDING'
          ? team.paymentInfo.receiptNo
          : `GDSL-REC-2026-${Math.floor(100 + Math.random() * 900)}`;

      const updatedTeam: RegisteredTeamProfile = {
        ...team,
        scrutineeringStatus: 'PRE_APPROVED',
        paymentInfo: {
          ...team.paymentInfo,
          receiptNo,
          amount: uploadAmount.trim() || fee.formatted,
          status: 'PAID',
          transactionId: cleanTxId,
          paymentMode: uploadPaymentMode,
          paidAt: `${formattedPaidAt} (Uploaded Proof)`,
          currency: 'INR',
          payerDetails: uploadPayerDetails.trim() || team.captainName,
          remarks: uploadRemarks.trim(),
          proofFileName: uploadProofFileName,
          proofDataUrl: uploadProofDataUrl,
          uploadedAt: uploadedTimestamp,
        },
      };

      saveRegisteredTeam(updatedTeam);
      setCurrentSession(updatedTeam);
      if (onUpdateTeam) onUpdateTeam(updatedTeam);
      setIsUploadingPayment(false);
      setIsUploadPaymentModalOpen(false);
      setSheetSyncSuccess(
        `Payment details (Ref: ${cleanTxId}) uploaded and recorded for ${team.teamName}! Your Event Pass and Receipt are now available.`
      );
      setTimeout(() => setSheetSyncSuccess(null), 6000);

      try {
        await syncTeamToSheet(updatedTeam);
      } catch (err) {
        console.warn('Uploaded payment sheet sync notice:', err);
      }
    }, 600);
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
    <div className="relative z-20 min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
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
          <div className="bg-[#1b1c15] border-2 border-[#d0fe1d]/50 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-left shadow-[0_0_35px_rgba(208,254,29,0.15)]">
            <div className="space-y-1.5">
              <div className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
                <span>Action Required · Registration Fee Pending ({fee.code}: {fee.formatted})</span>
              </div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white uppercase tracking-wider">
                Complete Your {fee.formatted} Entry Fee or Upload Payment Details
              </h2>
              <p className="text-xs text-neutral-300 max-w-2xl font-sans">
                Request official bank/UPI payment details on your email, pay via UPI/NEFT, and upload your transaction details &amp; screenshot to unlock your Event Pass and Receipt.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenEmailDetailsModal}
                className="px-4 py-2.5 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d]/20 text-[#d0fe1d] text-xs font-rajdhani font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Request Payment Details on Email</span>
              </button>
              <button
                type="button"
                onClick={handleOpenUploadModal}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-orbitron font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#d0fe1d]" />
                <span>Upload Payment Details</span>
              </button>
            </div>
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
              <button
                type="button"
                onClick={handleOpenEmailDetailsModal}
                className="px-3.5 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-200 hover:border-[#d0fe1d] hover:text-[#d0fe1d] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                title="Receive official bank account & UPI fee payment details on email"
              >
                <Mail className="w-3.5 h-3.5 text-[#d0fe1d]" />
                <span>Request Payment Details</span>
              </button>
              <button
                type="button"
                onClick={handleOpenUploadModal}
                className="px-3.5 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 text-[#d0fe1d] hover:bg-[#d0fe1d] hover:text-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                title="Upload your UTR / Transaction ID and payment screenshot"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Payment Details</span>
              </button>
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
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-200 hover:border-[#d0fe1d] hover:text-[#d0fe1d] transition-all cursor-pointer whitespace-nowrap"
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
                <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                  {isPaymentCompleted ? (
                    <>
                      <div className="flex items-center gap-2">
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
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenUploadModal}
                        className="w-full py-2 px-3 border border-white/15 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-300 text-[11px] font-rajdhani font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Update Uploaded Payment Details</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full py-2.5 px-3 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer"
                      >
                        Pay {fee.formatted} Now
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={handleOpenEmailDetailsModal}
                          className="py-2 px-2 border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-200 text-[10px] font-rajdhani font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3 text-[#d0fe1d]" />
                          <span>Email Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenUploadModal}
                          className="py-2 px-2 border border-[#d0fe1d]/40 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black text-[10px] font-rajdhani font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Proof</span>
                        </button>
                      </div>
                    </>
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

            {/* Dedicated Payment Details on Email & Upload Payment Details Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Panel: Request Payment Details on Email */}
              <div className="bg-[#141612]/95 border border-white/15 hover:border-[#d0fe1d]/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                      <Mail className="w-4 h-4" />
                      <span>OFFICIAL PAYMENT INSTRUCTIONS</span>
                    </div>
                    {team.paymentInfo.emailRequestedAt && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        ✓ Sent to Email
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wide">
                    Request Payment Details on Email
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Need to pay via college accounts, NEFT/RTGS, or a separate UPI device? Request official Galgotias University bank account details, UPI ID, and fee invoice instructions directly to your email.
                  </p>
                  <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Recipient Email:</span>
                      <span className="text-white font-semibold">{team.paymentInfo.emailRequestedTo || team.captainEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Official UPI ID:</span>
                      <span className="text-[#d0fe1d] font-bold">gcdis.galgotias@hdfcbank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Division Fee ({fee.code}):</span>
                      <span className="text-white font-bold">{fee.formatted}.00</span>
                    </div>
                    {team.paymentInfo.emailRequestedAt && (
                      <div className="flex justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-neutral-400">Last Dispatched:</span>
                        <span className="text-emerald-400">{team.paymentInfo.emailRequestedAt}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenEmailDetailsModal}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(208,254,29,0.25)] cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Request Payment Details on Email</span>
                  </button>
                </div>
              </div>

              {/* Right Panel: Upload Payment Details & Proof */}
              <div className="bg-[#141612]/95 border border-white/15 hover:border-[#d0fe1d]/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                      <Upload className="w-4 h-4" />
                      <span>PAYMENT VERIFICATION SUBMISSION</span>
                    </div>
                    {team.paymentInfo.uploadedAt ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        ✓ Proof Uploaded
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Upload Available
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wide">
                    Upload Payment Details &amp; Screenshot
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    Already completed your {fee.formatted} fee transfer via UPI, NEFT, or Bank Deposit? Upload your UTR / Transaction Reference Number and payment screenshot here to update your registration.
                  </p>
                  <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-3.5 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Transaction / UTR Ref:</span>
                      <span className="text-white font-bold">{team.paymentInfo.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Payment Mode:</span>
                      <span className="text-neutral-200 truncate max-w-[200px]">{team.paymentInfo.paymentMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Uploaded Proof File:</span>
                      <span className="text-[#d0fe1d] truncate max-w-[200px]">
                        {team.paymentInfo.proofFileName || 'No screenshot uploaded yet'}
                      </span>
                    </div>
                    {team.paymentInfo.uploadedAt && (
                      <div className="flex justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-neutral-400">Submitted At:</span>
                        <span className="text-emerald-400">{team.paymentInfo.uploadedAt}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenUploadModal}
                    className="flex-1 py-3 px-4 rounded-xl border border-[#d0fe1d] bg-[#d0fe1d]/15 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {team.paymentInfo.uploadedAt
                        ? 'Update Uploaded Payment Details'
                        : 'Upload Payment Details'}
                    </span>
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
              <div className="bg-[#141612]/95 backdrop-blur-2xl border-2 border-amber-500/50 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    REGISTRATION STATUS: PENDING · PAYMENT REQUIRED
                  </span>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white uppercase tracking-wider">
                    Complete Registration (Make Payment) to Unlock Event Pass
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed font-sans">
                    Your registration payment status has been set to <span className="text-amber-400 font-bold">PENDING</span> by tournament administration. Participants receive their Official GDSL 2026 Event Pass, gate QR access credential, and Pit Bay assignment immediately upon completing the {fee.formatted} registration fee for {team.division}.
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
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Payment Status</span>
                    <span className="font-mono font-bold text-amber-400">PENDING (Awaiting Fee)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 font-mono">Entry Fee Payable</span>
                    <span className="font-orbitron font-bold text-[#d0fe1d]">{fee.formatted}.00</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-black uppercase tracking-wider text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(208,254,29,0.35)] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Complete Registration (Pay {fee.formatted})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenUploadModal}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black font-orbitron font-bold uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Payment Details</span>
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleOpenEmailDetailsModal}
                    className="text-xs font-mono text-neutral-300 hover:text-[#d0fe1d] underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d0fe1d]" />
                    <span>Request Official Payment Details on Email ({team.captainEmail})</span>
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
              <div className="bg-[#141612]/95 backdrop-blur-2xl border-2 border-amber-500/50 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    REGISTRATION STATUS: PENDING · RECEIPT LOCKED
                  </span>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white uppercase tracking-wider">
                    Complete Registration (Make Payment) to Generate Official Receipt
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto font-sans leading-relaxed">
                    Your tournament fee is marked as <span className="text-amber-400 font-bold">PENDING</span> by tournament administration. Complete your {fee.formatted} registration fee for {team.division} to instantly generate and download your official GSTIN tax invoice and verified payment receipt.
                  </p>
                </div>

                <div className="bg-[#1b1e17] border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-xs space-y-2 text-left">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Invoice For</span>
                    <span className="font-bold text-white font-orbitron">{team.teamName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Division</span>
                    <span className="font-medium text-white">{team.division}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400 font-mono">Status</span>
                    <span className="font-mono font-bold text-amber-400">PENDING PAYMENT</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 font-mono">Payable Fee</span>
                    <span className="font-orbitron font-bold text-[#d0fe1d]">{fee.formatted}.00</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-black uppercase tracking-wider text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(208,254,29,0.35)] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Complete Registration (Pay {fee.formatted})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenUploadModal}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black font-orbitron font-bold uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Payment Details</span>
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleOpenEmailDetailsModal}
                    className="text-xs font-mono text-neutral-300 hover:text-[#d0fe1d] underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d0fe1d]" />
                    <span>Request Official Payment Details on Email ({team.captainEmail})</span>
                  </button>
                </div>
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
                      onClick={handleOpenUploadModal}
                      className="px-3.5 py-2.5 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-[#d0fe1d]/40 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload / Update Proof</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenEmailDetailsModal}
                      className="px-3.5 py-2.5 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Payment Info</span>
                    </button>
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

                {/* Uploaded Payment Details & Screenshot Summary (If User Uploaded Payment Details) */}
                {(team.paymentInfo.uploadedAt || team.paymentInfo.proofDataUrl || team.paymentInfo.payerDetails) && (
                  <div className="bg-[#141612]/95 border border-[#d0fe1d]/40 rounded-2xl p-5 max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                        ✓ USER UPLOADED PAYMENT PROOF ON RECORD
                      </div>
                      <div className="text-white font-semibold">
                        UTR / Ref: <span className="font-mono text-[#d0fe1d]">{team.paymentInfo.transactionId}</span> · Mode: {team.paymentInfo.paymentMode}
                      </div>
                      <div className="text-neutral-400">
                        Payer: {team.paymentInfo.payerDetails || team.captainName}
                        {team.paymentInfo.uploadedAt ? ` · Uploaded: ${team.paymentInfo.uploadedAt}` : ''}
                      </div>
                      {team.paymentInfo.remarks && (
                        <div className="text-neutral-300 italic">Note: &ldquo;{team.paymentInfo.remarks}&rdquo;</div>
                      )}
                    </div>
                    {team.paymentInfo.proofDataUrl && team.paymentInfo.proofDataUrl !== 'PDF_DOCUMENT' && (
                      <div className="shrink-0 flex items-center gap-3">
                        <img
                          src={team.paymentInfo.proofDataUrl}
                          alt="Uploaded Payment Receipt Proof"
                          className="w-16 h-16 object-cover rounded-lg border border-white/20 bg-black"
                        />
                      </div>
                    )}
                  </div>
                )}

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
            {/* Pending Payment Alert & Complete Registration Option */}
            {!isPaymentCompleted && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-[#1b170e] to-amber-950/60 border-2 border-amber-500/70 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
                      REGISTRATION STATUS: PENDING · ACTION REQUIRED
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-orbitron font-bold text-white uppercase tracking-wide">
                    Complete Registration (Make Payment) to Validate OD Letter
                  </h3>
                  <p className="text-xs text-neutral-300 font-sans max-w-2xl leading-relaxed">
                    Tournament administration has set your registration payment status to <span className="font-bold text-amber-300 uppercase">PENDING</span>. Complete your {fee.formatted} entry fee for {team.division} or upload your payment details to authenticate the official GCDIS stamp and dean&apos;s attendance grant clearance.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenEmailDetailsModal}
                    className="px-4 py-3 rounded-xl border border-amber-400/50 bg-black/40 hover:bg-black/70 text-amber-300 font-rajdhani font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Payment Info</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenUploadModal}
                    className="px-4 py-3 rounded-xl border border-[#d0fe1d]/60 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Payment Proof</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-[0_0_20px_rgba(208,254,29,0.35)] flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {fee.formatted} Now</span>
                  </button>
                </div>
              </div>
            )}

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

              {!isPaymentCompleted ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-400">
                      PROVISIONAL DRAFT · PENDING PAYMENT
                    </span>
                    <span className="text-xs">
                      Official seal requires completed registration fee ({fee.formatted}).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="text-xs font-bold text-amber-950 underline hover:text-black cursor-pointer print:hidden text-left"
                  >
                    Complete Registration (Make Payment) →
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                    VERIFIED REGISTRATION · OFFICIAL OD ENDORSEMENT
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700">
                    Fee Paid: {fee.formatted} · {team.paymentInfo.receiptNo}
                  </span>
                </div>
              )}

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

      {/* ===================================================================== */}
      {/* MODAL: REQUEST PAYMENT DETAILS ON EMAIL                               */}
      {/* ===================================================================== */}
      {isEmailDetailsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#141612] border border-[#d0fe1d]/40 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#d0fe1d]/15 border border-[#d0fe1d]/40 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#d0fe1d]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d0fe1d] block">
                    GCDIS Fee Remittance Desk
                  </span>
                  <h3 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase">
                    Request Payment Details on Email
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Send the official Galgotias University Drone Soccer League bank account, NEFT/RTGS/IMPS instructions, and UPI QR merchant credentials for{' '}
              <strong className="text-white">{team.teamName}</strong> (<span className="text-[#d0fe1d] font-mono">{team.teamId}</span>) directly to your email or finance department.
            </p>

            {/* Official Bank / UPI Remittance Card */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d0fe1d]">
                  Official Remittance Credentials
                </span>
                <span className="text-[11px] font-mono font-bold text-white">
                  Payable: <strong className="text-[#d0fe1d]">{fee.formatted}.00</strong>
                </span>
              </div>

              {[
                { label: 'Beneficiary Name', value: 'Galgotias University - GCDIS', key: 'beneficiary' },
                { label: 'Bank & Branch', value: 'HDFC Bank Ltd., Greater Noida', key: 'bank' },
                { label: 'Account Number', value: '50100482910452', key: 'acc' },
                { label: 'IFSC Code', value: 'HDFC0001248', key: 'ifsc' },
                { label: 'Official UPI ID', value: 'gcdis.galgotias@hdfcbank', key: 'upi' },
                { label: 'Payment Remarks / Ref', value: `${team.teamId} - ${team.teamName}`, key: 'ref' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
                  <span className="text-neutral-400 font-mono text-[11px]">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-right">{row.value}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyBankValue(row.key, row.value)}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-[#d0fe1d] transition-colors cursor-pointer"
                      title={`Copy ${row.label}`}
                    >
                      {copiedBankField === row.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleRequestPaymentDetailsEmail} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Recipient Email Address (Captain / Institution Finance Office) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailForPaymentDetails}
                    onChange={(e) => setEmailForPaymentDetails(e.target.value)}
                    placeholder="captain@university.edu"
                    className="w-full pl-10 pr-4 py-3 bg-black/70 border border-white/15 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
              </div>

              {emailDetailsSentSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-orbitron font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Payment Instructions Dispatched!
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Official fee payment instructions for <strong className="text-white">{team.teamId}</strong> ({fee.formatted}.00) have been dispatched to{' '}
                    <span className="text-[#d0fe1d] font-mono font-bold">{emailForPaymentDetails}</span>. Once you complete the transfer, click{' '}
                    <strong className="text-white">Upload Payment Details</strong> to submit your UTR / transaction reference.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                <a
                  href={`mailto:${encodeURIComponent(emailForPaymentDetails || team.captainEmail)}?subject=${encodeURIComponent(
                    `GDSL 2026 Official Fee Payment Details - ${team.teamName} (${team.teamId})`
                  )}&body=${encodeURIComponent(
                    `Dear ${team.captainName},\n\nPlease find below the official fee remittance details for Galgotias Drone Soccer League (GDSL 2026):\n\nTeam Name: ${team.teamName}\nRegistration ID: ${team.teamId}\nDivision: ${team.division}\nPayable Fee Amount: ${fee.formatted}.00\n\nOFFICIAL BANK / UPI CREDENTIALS:\nBeneficiary Name: Galgotias University - GCDIS\nBank: HDFC Bank Ltd., Greater Noida\nAccount Number: 50100482910452\nIFSC Code: HDFC0001248\nOfficial UPI ID: gcdis.galgotias@hdfcbank\nPayment Remarks: ${team.teamId} - ${team.teamName}\n\nAfter completing your payment, please upload your Transaction ID / UTR and payment screenshot in the Team Dashboard.\n\nRegards,\nGCDIS Finance & Scrutineering Desk\nGalgotias University`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-mono text-[11px] transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-[#d0fe1d]" />
                  Open in Email Client
                </a>

                <div className="flex items-center gap-2.5">
                  {emailDetailsSentSuccess && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEmailDetailsModalOpen(false);
                        handleOpenUploadModal();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-orbitron font-bold uppercase text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#d0fe1d]" />
                      Upload Payment Proof
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSendingEmailDetails}
                    className="px-5 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] disabled:opacity-50 text-black font-orbitron font-black uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {isSendingEmailDetails
                      ? 'Sending Details...'
                      : emailDetailsSentSuccess
                      ? 'Resend to Email'
                      : 'Send Payment Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: UPLOAD PAYMENT DETAILS & RECEIPT SCREENSHOT                    */}
      {/* ===================================================================== */}
      {isUploadPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#141612] border border-[#d0fe1d]/40 rounded-3xl p-6 sm:p-8 text-left space-y-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#d0fe1d]/15 border border-[#d0fe1d]/40 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-[#d0fe1d]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d0fe1d] block">
                    Payment Verification Submission
                  </span>
                  <h3 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase">
                    Upload Payment Details &amp; Proof
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Paid via UPI, NEFT, IMPS, RTGS, or Demand Draft? Submit your transaction reference / UTR number and upload your payment screenshot below to immediately update your registration payment record and unlock your Event Pass, Payment Receipt, and OD Attendance Letter.
            </p>

            {uploadError && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadPaymentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Transaction ID / UTR / Reference No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTxId}
                    onChange={(e) => setUploadTxId(e.target.value)}
                    placeholder="e.g. UTR431982741092 / TXN_982341"
                    className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={uploadPaymentMode}
                    onChange={(e) => setUploadPaymentMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  >
                    <option value="UPI / QR Scan (GPay / PhonePe / Paytm)">UPI / QR Scan (GPay / PhonePe / Paytm)</option>
                    <option value="NEFT / RTGS / IMPS Bank Transfer">NEFT / RTGS / IMPS Bank Transfer</option>
                    <option value="NetBanking / Corporate Portal">NetBanking / Corporate Portal</option>
                    <option value="Debit / Credit Card">Debit / Credit Card</option>
                    <option value="University Demand Draft / Challan">University Demand Draft / Challan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Amount Paid *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadAmount}
                    onChange={(e) => setUploadAmount(e.target.value)}
                    placeholder={fee.formatted}
                    className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-[#d0fe1d] font-mono font-bold focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadPaidDate}
                    onChange={(e) => setUploadPaidDate(e.target.value)}
                    placeholder="e.g. Nov 15, 2026"
                    className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Account Holder / Sender UPI ID / Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadPayerDetails}
                    onChange={(e) => setUploadPayerDetails(e.target.value)}
                    placeholder="e.g. Aarav Sharma - SBI / aarav@okaxis"
                    className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#d0fe1d]"
                  />
                </div>
              </div>

              {/* Screenshot / Receipt File Upload */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Upload Payment Screenshot / Bank Receipt (PNG, JPG, WebP)
                </label>
                <label className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/60 border border-dashed border-[#d0fe1d]/40 hover:border-[#d0fe1d] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d0fe1d]/10 border border-[#d0fe1d]/30 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-[#d0fe1d]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {uploadProofFileName ? uploadProofFileName : 'Click to attach payment screenshot or bank receipt'}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono block">
                        Supports UPI confirmation screenshots, NEFT slips, or receipt images
                      </span>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#d0fe1d] font-mono font-bold text-[11px] shrink-0">
                    {uploadProofFileName ? 'Change File' : 'Browse File'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleProofFileChange}
                    className="hidden"
                  />
                </label>

                {uploadProofDataUrl && uploadProofDataUrl.startsWith('data:image') && (
                  <div className="mt-3 p-3 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={uploadProofDataUrl}
                        alt="Payment Proof Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-[#d0fe1d]/40"
                      />
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                          ✓ Receipt Image Attached
                        </span>
                        <span className="text-xs text-white font-mono truncate max-w-[240px] block">
                          {uploadProofFileName}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadProofFileName('');
                        setUploadProofDataUrl('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-[11px] font-mono cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Additional Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  placeholder="e.g. Paid via college reimbursement account / split UPI transfer"
                  className="w-full px-3.5 py-2.5 bg-black/70 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#d0fe1d]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadPaymentModalOpen(false);
                    handleOpenEmailDetailsModal();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-[#d0fe1d] transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Need Bank / UPI Details on Email?
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadPaymentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 font-rajdhani font-bold uppercase text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingPayment}
                    className="px-6 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] disabled:opacity-50 text-black font-orbitron font-black uppercase text-xs tracking-wider transition-all shadow-[0_0_25px_rgba(208,254,29,0.35)] cursor-pointer inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {isUploadingPayment ? 'Saving Payment Proof...' : 'Submit Payment Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboardPage;
