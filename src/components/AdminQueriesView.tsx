import React, { useState, useMemo } from 'react';
import { UserQuery } from '../data/userQueriesData';

export interface AdminQueriesViewProps {
  queries: UserQuery[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: UserQuery['status'], notes?: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteQuery: (id: string) => void;
}

export const AdminQueriesView: React.FC<AdminQueriesViewProps> = ({
  queries,
  onRefresh,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNREAD' | 'READ' | 'RESOLVED'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [activeModalQuery, setActiveModalQuery] = useState<UserQuery | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Filter queries based on search, status, and topic
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      // Status filter
      if (selectedStatus !== 'ALL' && q.status !== selectedStatus) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== 'ALL' && q.topic !== selectedTopic) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesName = q.name.toLowerCase().includes(queryLower);
        const matchesEmail = q.email.toLowerCase().includes(queryLower);
        const matchesInstitution = (q.institution || '').toLowerCase().includes(queryLower);
        const matchesSubject = q.subject.toLowerCase().includes(queryLower);
        const matchesMessage = q.message.toLowerCase().includes(queryLower);
        const matchesId = q.id.toLowerCase().includes(queryLower);
        if (!matchesName && !matchesEmail && !matchesInstitution && !matchesSubject && !matchesMessage && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [queries, selectedStatus, selectedTopic, searchQuery]);

  const totalCount = queries.length;
  const unreadCount = queries.filter((q) => q.status === 'UNREAD').length;
  const readCount = queries.filter((q) => q.status === 'READ').length;
  const resolvedCount = queries.filter((q) => q.status === 'RESOLVED').length;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleOpenModal = (q: UserQuery) => {
    setActiveModalQuery(q);
    setModalNotes(q.adminNotes || '');
    // Automatically mark as READ if currently UNREAD
    if (q.status === 'UNREAD') {
      onUpdateStatus(q.id, 'READ', q.adminNotes);
    }
  };

  const handleSaveModalNotes = () => {
    if (!activeModalQuery) return;
    onUpdateNotes(activeModalQuery.id, modalNotes);
    setActiveModalQuery({ ...activeModalQuery, adminNotes: modalNotes });
  };

  const handleExportCsv = () => {
    const headers = [
      'Query ID',
      'Sender Name',
      'Email',
      'Institution',
      'Topic',
      'Subject',
      'Message',
      'Status',
      'Priority',
      'Admin Notes',
      'Submitted At (IST)',
    ];

    const rows = queries.map((q) => [
      `"${q.id}"`,
      `"${q.name.replace(/"/g, '""')}"`,
      `"${q.email.replace(/"/g, '""')}"`,
      `"${(q.institution || '').replace(/"/g, '""')}"`,
      `"${q.topic.replace(/"/g, '""')}"`,
      `"${q.subject.replace(/"/g, '""')}"`,
      `"${q.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${q.status}"`,
      `"${q.priority || 'NORMAL'}"`,
      `"${(q.adminNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(q.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GDSL_2026_User_Queries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-configured email response templates for tournament directors
  const templates = [
    {
      title: 'Scrutineering Spec Clearance',
      text: 'Dear Pilot/Mentor,\n\nRegarding your technical scrutineering inquiry: GDSL regulations permit protective sphere enclosures up to 22cm (Class 20) and 40cm (Class 40) provided the maximum all-up weight ceiling is strictly adhered to. VTX transmission inside the caged arena is strictly capped at 25mW on authorized race channels.\n\nWarm regards,\nGDSL Technical Scrutineering Lead',
    },
    {
      title: 'Outstation Accommodation Confirmation',
      text: 'Dear Contingent Leader,\n\nWe have noted your team crew count. Official hostel allotment desks operate from March 13, 10:00 AM at Galgotias University Campus 1. Shuttle transit buses from Pari Chowk Metro Station will be operational every 30 minutes.\n\nBest wishes,\nGDSL Hospitality Secretariat',
    },
    {
      title: 'GST / Fee Receipt Acknowledgment',
      text: 'Respected Sir/Madam,\n\nYour query regarding registration fee receipt and invoice has been received. Our university finance office is processing your institutional billing documents. The stamped receipt will be sent shortly.\n\nSincerely,\nGDSL Tournament Accounts Directorate',
    },
  ];

  const handleCopyTemplate = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(title);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Console Top Header & Summary Stats */}
      <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-wider">
                User Queries &amp; Inquiries Console
              </h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/50 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{unreadCount} Unread</span>
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-300">
              Direct official messages submitted by participating pilots, university faculty advisors, sponsors, and media.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-rajdhani font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🔄</span>
              <span>Refresh Desk</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d]/20 text-[#d0fe1d] text-xs font-rajdhani font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>📥 Export CSV</span>
            </button>
          </div>
        </div>

        {/* Query Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-white/10 border-[#d0fe1d] shadow-[0_0_15px_rgba(208,254,29,0.15)]'
                : 'bg-black/40 border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              Total Queries
            </span>
            <span className="text-2xl font-black font-orbitron text-white mt-1 block">
              {totalCount}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono mt-0.5 block">
              All incoming messages
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('UNREAD')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedStatus === 'UNREAD'
                ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Unread
              </span>
              {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
            <span className="text-2xl font-black font-orbitron text-amber-300 mt-1 block">
              {unreadCount}
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono mt-0.5 block">
              Awaiting admin review
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('READ')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedStatus === 'READ'
                ? 'bg-sky-400/10 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">
              In Review / Read
            </span>
            <span className="text-2xl font-black font-orbitron text-sky-300 mt-1 block">
              {readCount}
            </span>
            <span className="text-[11px] text-sky-400/80 font-mono mt-0.5 block">
              Acknowledged inquiries
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('RESOLVED')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedStatus === 'RESOLVED'
                ? 'bg-emerald-400/10 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-black/40 border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              Resolved
            </span>
            <span className="text-2xl font-black font-orbitron text-emerald-300 mt-1 block">
              {resolvedCount}
            </span>
            <span className="text-[11px] text-emerald-400/80 font-mono mt-0.5 block">
              Completed &amp; replied
            </span>
          </button>
        </div>
      </div>

      {/* Search & Topic Filter Row */}
      <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, email, institution, topic, or message..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/60 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d0fe1d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Topic Select */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Topic Filter:
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-black/60 text-xs text-white focus:outline-none focus:border-[#d0fe1d] font-mono cursor-pointer"
            >
              <option value="ALL">All Inquiry Topics</option>
              <option value="Team Registration Assistance">Team Registration Assistance</option>
              <option value="Technical Scrutineering & Cage Specs">Technical Scrutineering &amp; Cage Specs</option>
              <option value="Outstation Accommodation & Transit">Outstation Accommodation &amp; Transit</option>
              <option value="Corporate Sponsorship & Arena Stalls">Corporate Sponsorship &amp; Arena Stalls</option>
              <option value="Media & Press Accreditation">Media &amp; Press Accreditation</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedStatus !== 'ALL' || selectedTopic !== 'ALL' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs font-mono text-neutral-400">
            <span>Filtered by:</span>
            {selectedStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                Status: {selectedStatus}
              </span>
            )}
            {selectedTopic !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-bold truncate max-w-[200px]">
                {selectedTopic}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#d0fe1d] font-bold">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedTopic('ALL');
                setSearchQuery('');
              }}
              className="text-[#d0fe1d] hover:underline ml-auto cursor-pointer font-bold"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {filteredQueries.length === 0 ? (
          <div className="bg-[#141612]/95 border border-white/15 rounded-3xl p-12 text-center space-y-3">
            <span className="text-4xl block">📬</span>
            <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">
              No User Queries Match Current Filters
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Try clearing the search query or selecting "All" to inspect all received communications.
            </p>
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedTopic('ALL');
                setSearchQuery('');
              }}
              className="xotc-btn-outline px-5 py-2 text-xs mt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQueries.map((query) => {
            const isUnread = query.status === 'UNREAD';
            const isResolved = query.status === 'RESOLVED';
            const formattedTime = new Date(query.submittedAt).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={query.id}
                className={`bg-[#141612]/95 border rounded-3xl p-6 transition-all shadow-xl space-y-4 hover:border-white/30 ${
                  isUnread
                    ? 'border-amber-400/50 bg-gradient-to-r from-amber-950/20 via-transparent to-transparent shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                    : isResolved
                    ? 'border-emerald-500/30 bg-emerald-950/5'
                    : 'border-white/15'
                }`}
              >
                {/* Query Header: ID, Status, Topic, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#d0fe1d] bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {query.id}
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isUnread
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : isResolved
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50'
                          : 'bg-sky-400/20 text-sky-300 border border-sky-400/50'
                      }`}
                    >
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                      {isResolved && <span>✓</span>}
                      <span>{query.status}</span>
                    </span>

                    {/* Topic Badge */}
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-300 bg-white/5 border border-white/10">
                      {query.topic}
                    </span>

                    {query.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ⚡ HIGH PRIORITY
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                    <span>🕒 {formattedTime} IST</span>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 rounded-2xl p-4 border border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-orbitron font-bold text-white">{query.name}</span>
                      {query.institution && (
                        <span className="text-xs font-sans text-neutral-400">
                          · {query.institution}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                      <span className="text-neutral-500">Email:</span>
                      <a
                        href={`mailto:${query.email}`}
                        className="text-[#d0fe1d] hover:underline"
                        title="Click to email"
                      >
                        {query.email}
                      </a>
                      <button
                        onClick={() => handleCopyEmail(query.email)}
                        className="text-[10px] text-neutral-400 hover:text-white ml-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 cursor-pointer"
                        title="Copy email address"
                      >
                        {copiedEmail === query.email ? 'Copied! ✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${query.email}?subject=Re: [GDSL 2026 Inquiry - ${query.id}] ${query.subject}&body=Dear ${query.name},%0D%0A%0D%0AIn response to your query regarding "${query.topic}":%0D%0A%0D%0A`}
                      className="px-3.5 py-2 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>✉️ Reply via Email</span>
                    </a>
                  </div>
                </div>

                {/* Subject & Message Body */}
                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-orbitron font-black text-white uppercase tracking-wider">
                    {query.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap bg-black/20 p-4 rounded-xl border border-white/5">
                    {query.message}
                  </p>
                </div>

                {/* Admin Notes if present */}
                {query.adminNotes && (
                  <div className="bg-[#1c1f17] border border-[#d0fe1d]/30 rounded-xl p-3.5 text-xs text-neutral-300 space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] uppercase font-bold">
                      <span className="text-[#d0fe1d]">INTERNAL ADMIN NOTE:</span>
                    </div>
                    <p className="italic">{query.adminNotes}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Status:</span>

                    {query.status !== 'UNREAD' && (
                      <button
                        onClick={() => onUpdateStatus(query.id, 'UNREAD', query.adminNotes)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-amber-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Mark Unread
                      </button>
                    )}

                    {query.status !== 'READ' && (
                      <button
                        onClick={() => onUpdateStatus(query.id, 'READ', query.adminNotes)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-sky-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}

                    {query.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onUpdateStatus(query.id, 'RESOLVED', query.adminNotes)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(query)}
                      className="px-3.5 py-1.5 rounded-lg border border-white/20 hover:border-[#d0fe1d] bg-white/5 hover:text-[#d0fe1d] text-white text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔍 Full Dossier &amp; Notes</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete inquiry ${query.id} from ${query.name}?`)) {
                          onDeleteQuery(query.id);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                      title="Delete inquiry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Query Detail & Action Modal */}
      {activeModalQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#141612] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#d0fe1d]/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 text-left">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#d0fe1d] bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                    {activeModalQuery.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      activeModalQuery.status === 'UNREAD'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                        : activeModalQuery.status === 'RESOLVED'
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-sky-400/20 text-sky-300 border border-sky-400/50'
                    }`}
                  >
                    {activeModalQuery.status}
                  </span>
                </div>
                <h3 className="text-xl font-orbitron font-black text-white uppercase tracking-wider mt-1">
                  {activeModalQuery.subject}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalQuery(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block">Sender Name:</span>
                <span className="text-white font-bold text-sm font-sans">{activeModalQuery.name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Official Email:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${activeModalQuery.email}`}
                    className="text-[#d0fe1d] hover:underline font-bold"
                  >
                    {activeModalQuery.email}
                  </a>
                  <button
                    onClick={() => handleCopyEmail(activeModalQuery.email)}
                    className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10 cursor-pointer"
                  >
                    {copiedEmail === activeModalQuery.email ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-neutral-500 block">Institution / Club:</span>
                <span className="text-neutral-200">{activeModalQuery.institution || 'Direct Visitor'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Topic:</span>
                <span className="text-neutral-200">{activeModalQuery.topic}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Submitted Timestamp:</span>
                <span className="text-neutral-300">
                  {new Date(activeModalQuery.submittedAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                  })}{' '}
                  IST
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Priority:</span>
                <span
                  className={`font-bold ${
                    activeModalQuery.priority === 'HIGH' ? 'text-rose-400' : 'text-neutral-300'
                  }`}
                >
                  {activeModalQuery.priority || 'NORMAL'}
                </span>
              </div>
            </div>

            {/* Full Message Text */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider block">
                FULL INQUIRY MESSAGE:
              </span>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
                {activeModalQuery.message}
              </div>
            </div>

            {/* Response Templates */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                ⚡ Quick Official Response Templates (Click to Copy):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.title}
                    onClick={() => handleCopyTemplate(tpl.text, tpl.title)}
                    className="p-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-[#d0fe1d]/50 hover:bg-[#d0fe1d]/5 text-left text-xs font-sans text-neutral-300 transition-all cursor-pointer"
                  >
                    <div className="font-bold text-white text-[11px] truncate">{tpl.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      {copiedTemplate === tpl.title ? '✓ Copied to clipboard!' : 'Copy response text'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Internal Notes Editor */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#d0fe1d] uppercase tracking-wider block">
                Internal Secretariat Notes &amp; Follow-up Actions:
              </span>
              <textarea
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Log internal follow-up, assignee, phone call summary, or resolved invoice number..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-sans focus:outline-none focus:border-[#d0fe1d]"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveModalNotes}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase">Set Status:</span>
                {(['UNREAD', 'READ', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(activeModalQuery.id, st, modalNotes);
                      setActiveModalQuery({ ...activeModalQuery, status: st, adminNotes: modalNotes });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeModalQuery.status === st
                        ? 'bg-[#d0fe1d] text-black shadow-xs'
                        : 'bg-white/5 border border-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${activeModalQuery.email}?subject=Re: [GDSL 2026 Inquiry - ${activeModalQuery.id}] ${activeModalQuery.subject}&body=Dear ${activeModalQuery.name},%0D%0A%0D%0AIn response to your query regarding "${activeModalQuery.topic}":%0D%0A%0D%0A`}
                  className="px-4 py-2 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>✉️ Open in Mail Client</span>
                </a>
                <button
                  onClick={() => setActiveModalQuery(null)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminQueriesView;
