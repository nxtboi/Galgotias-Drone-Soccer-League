import React, { useState } from 'react';
import {
  GCDIS_CLASS_SPECS,
  OFFICIAL_RULEBOOK_SECTIONS,
  GCDIS_7_COLORS,
  GCDIS_REFEREE_SIGNALS,
  GCDIS_VIOLATIONS,
  FREQUENT_QUESTIONS,
} from '../data/droneSoccerData';
import { GcdisLogo } from '../components/GcdisLogo';

export interface RulesAndSpecsPageProps {
  onNavigate: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const RulesAndSpecsPage: React.FC<RulesAndSpecsPageProps> = ({
  onNavigate,
  onOpenRegister,
}) => {
  const [selectedClass, setSelectedClass] = useState<'class20' | 'class40'>('class20');
  const [activeTab, setActiveTab] = useState<
    'rulebook' | 'arena' | 'scoring' | 'violations' | 'compare' | 'faq'
  >('rulebook');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [penaltyTimer, setPenaltyTimer] = useState<number | null>(null);

  const startPenaltySim = () => {
    setPenaltyTimer(5);
    const interval = setInterval(() => {
      setPenaltyTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const spec = GCDIS_CLASS_SPECS[selectedClass];
  const isD20 = selectedClass === 'class20';

  const quickStripMetrics = isD20
    ? [
        { value: '2–5', label: 'Members per team' },
        { value: 'Ø 20 cm', label: 'Drone ball' },
        { value: '150 g', label: 'Max drone weight' },
        { value: '3 × 3 min', label: 'Sets per game' },
        { value: '5 min', label: 'Repair between sets' },
        { value: '₹2,000', label: 'Registration fee' },
      ]
    : [
        { value: '2–3', label: 'Members per team' },
        { value: 'Ø 40 cm', label: 'Drone ball' },
        { value: '1.2 kg', label: 'Max drone weight' },
        { value: '3 × 3 min', label: 'Sets per game' },
        { value: '5 min', label: 'Repair between sets' },
        { value: '₹2,000', label: 'Registration fee' },
      ];

  const workflowSteps = [
    { step: '01', title: 'Register', sub: isD20 ? '2–5 Members · Rs. 1500/-' : '2–3 Members · Own / GCDIS Drone' },
    { step: '02', title: 'Inspect Drones', sub: isD20 ? 'Ø 20±1 cm · ≤ 150 g · ≤ 70 cm²' : 'Ø 40±2 cm · ≤ 1.2 kg · ≤ 150 cm²' },
    { step: '03', title: 'Toss & Ready', sub: 'Pick Pilot Area · 1 Long Whistle' },
    { step: '04', title: 'Play 3 Sets', sub: '3 × 3 Min · 5 Min Repair' },
    { step: '05', title: 'Penalty Kicks', sub: '1-on-1 · 5 Seconds' },
    { step: '06', title: 'Winner', sub: 'Set Wins / Overtime / Shoot-out' },
  ];

  return (
    <div className="relative z-20 min-h-screen pt-24 sm:pt-28 pb-24 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-white">
      <div className="w-full max-w-[1440px] mx-auto space-y-10 sm:space-y-12">
        {/* TOP HEADER & OFFICIAL PDF DOWNLOADS */}
        <div className="xotc-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 left-0 w-[2px] h-16 bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#d0fe1d]" />
          <div className="absolute top-0 right-0 w-[2px] h-16 bg-[#d0fe1d]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 text-left max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                <span>GALGOTIAS UNIVERSITY · SOENGG</span>
                <span aria-hidden="true">·</span>
                <span>DEPT. OF ELECTRICAL, ELECTRONICS &amp; COMMUNICATION ENGINEERING</span>
                <span aria-hidden="true">·</span>
                <span>LEARN · BUILD · FLY</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
                NATIONAL DRONE SOCCER LEAGUE <span className="text-[#d0fe1d]">RULE BOOK</span>
              </h1>
              <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
                Official competition rule books issued by the Galgotias Centre for Drone Intelligence &amp; Simulation (GCDIS), School of Engineering, Galgotias University for <strong className="text-white">Class D20</strong> and <strong className="text-white">Class D40</strong> divisions.
              </p>
            </div>
          </div>
        </div>

        {/* CLASS SWITCHER BAR (CLASS D20 vs CLASS D40) */}
        <div className="xotc-card-lime p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <GcdisLogo size="sm" showWordmark={false} />
            <div className="text-left">
              <div className="text-[11px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                ACTIVE RULE BOOK EDITION
              </div>
              <div className="text-base sm:text-xl font-orbitron font-black text-white uppercase">
                RULE BOOK | {spec.classId}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSelectedClass('class20')}
              className={`px-5 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isD20 ? 'xotc-btn-lime' : 'xotc-btn-outline'
              }`}
            >
              Class D20 (Ø 20 cm · 150 g · 2–5 Members)
            </button>
            <button
              onClick={() => setSelectedClass('class40')}
              className={`px-5 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                !isD20 ? 'xotc-btn-lime' : 'xotc-btn-outline'
              }`}
            >
              Class D40 (Ø 40 cm · 1.2 kg · 2–3 Members)
            </button>
          </div>
        </div>

        {/* PAGE 2 TOP METRICS STRIP (6 QUICK SPEC BOXES FROM PDF) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickStripMetrics.map((item, idx) => (
            <div
              key={idx}
              className="xotc-card p-4 text-center flex flex-col items-center justify-center space-y-1 border border-white/15"
            >
              <div className="text-lg sm:text-xl font-orbitron font-black text-[#d0fe1d] tabular-nums">
                {item.value}
              </div>
              <div className="text-[11px] sm:text-xs font-sans text-neutral-300">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* HIGHLIGHTED CHAMPIONSHIP PRIZE POOL CALLOUT FOR SELECTED CLASS */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#211a0d] via-[#151712] to-[#121b18] border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.22)] relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-widest mb-1">
                <span>🏆 OFFICIAL DIVISION PURSE</span>
                <span>·</span>
                <span>{isD20 ? 'CLASS D20 HIGH-SPEED' : 'CLASS D40 HEAVYWEIGHT'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
                {isD20 ? '₹74,000' : '₹94,000'}{' '}
                <span className="text-[#d0fe1d]">DIVISION PRIZE PURSE</span>
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Part of the nationwide <strong className="text-amber-300">₹2,00,000 Championship Pool</strong>. Direct cash disbursements, official GCDIS rolling trophies, medals, and national pilot certificates.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2.5 bg-[#171915] hover:border-amber-400 border border-white/20 text-xs font-orbitron font-bold text-amber-300 uppercase tracking-wider transition-colors cursor-pointer"
              >
                View Full ₹2 Lakh Pool ↓
              </button>
              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="xotc-btn-lime px-5 py-2.5 text-xs font-orbitron font-bold uppercase tracking-wider cursor-pointer"
                >
                  Register Now →
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            <div className="bg-[#241c0e] border border-amber-400/60 p-4">
              <span className="text-[10px] font-orbitron font-black text-amber-300 uppercase tracking-widest block">
                🥇 1ST PLACE CHAMPION
              </span>
              <div className="text-2xl sm:text-3xl font-orbitron font-black text-amber-300 my-1">
                {isD20 ? '₹31,000' : '₹41,000'}
              </div>
              <p className="text-xs text-neutral-300 font-sans">
                Championship Rolling Trophy · Gold Medals · Cash Prize · Official Merit Certificate
              </p>
            </div>

            <div className="bg-[#1c1e22] border border-slate-400/40 p-4">
              <span className="text-[10px] font-orbitron font-black text-slate-300 uppercase tracking-widest block">
                🥈 2ND PLACE · 1ST RUNNER-UP
              </span>
              <div className="text-2xl sm:text-3xl font-orbitron font-black text-white my-1">
                {isD20 ? '₹21,000' : '₹31,000'}
              </div>
              <p className="text-xs text-neutral-300 font-sans">
                Runner-Up Trophy · Silver Medals · Cash Prize · Official Merit Certificate
              </p>
            </div>

            <div className="bg-[#221711] border border-orange-500/40 p-4">
              <span className="text-[10px] font-orbitron font-black text-orange-300 uppercase tracking-widest block">
                🥉 3RD PLACE · 2ND RUNNER-UP
              </span>
              <div className="text-2xl sm:text-3xl font-orbitron font-black text-orange-200 my-1">
                ₹11,000
              </div>
              <p className="text-xs text-neutral-300 font-sans">
                Podium Trophy · Bronze Medals · Cash Prize · Official Merit Certificate
              </p>
            </div>
          </div>
        </div>

        {/* PAGE 1 SUMMARY TRIAD: REGISTRATION · LEAGUE DETAILS · ARENA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {/* Card 1: REGISTRATION */}
          <div className="xotc-card p-5 sm:p-6 text-left flex flex-col justify-between space-y-4">
            <div className="border-b border-white/15 pb-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-orbitron font-black text-[#d0fe1d] uppercase tracking-wider">
                REGISTRATION
              </h2>
              <span className="text-xs font-mono text-neutral-400">{spec.classId}</span>
            </div>
            {isD20 ? (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-neutral-400">Registration fee</span>
                  <span className="font-mono font-bold text-[#d0fe1d]">Rs. 1500/-</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-neutral-400">Security deposit</span>
                  <span className="font-mono font-bold text-white">None</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Own drone</span>
                  <span className="font-mono font-bold text-white">Allowed</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-neutral-400">Registration fee</span>
                  <span className="font-mono font-bold text-white">To be announced</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-neutral-400">Own drone</span>
                  <span className="font-mono font-bold text-white">Allowed</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-neutral-400">GCDIS drone</span>
                  <span className="font-mono font-bold text-[#d0fe1d]">Rs. 3000/- deposit</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-400">Deposit</span>
                  <span className="font-mono font-bold text-white">Refunded on return</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: LEAGUE DETAILS */}
          <div className="xotc-card p-5 sm:p-6 text-left flex flex-col justify-between space-y-4">
            <div className="border-b border-white/15 pb-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-orbitron font-black text-[#d0fe1d] uppercase tracking-wider">
                LEAGUE DETAILS
              </h2>
              <span className="text-xs font-mono text-neutral-400">{spec.classId}</span>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Team size</span>
                <span className="font-mono font-bold text-white">{isD20 ? '2–5 members' : '2–3 members'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Max drone weight</span>
                <span className="font-mono font-bold text-[#d0fe1d]">{isD20 ? '150 g' : '1.2 kg'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Drone ball</span>
                <span className="font-mono font-bold text-white">{isD20 ? 'Ø 20 cm' : 'Ø 40 cm'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-400">Game</span>
                <span className="font-mono font-bold text-white">3 sets × 3 min, penalty kicks</span>
              </div>
            </div>
          </div>

          {/* Card 3: ARENA */}
          <div className="xotc-card p-5 sm:p-6 text-left flex flex-col justify-between space-y-4">
            <div className="border-b border-white/15 pb-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-orbitron font-black text-[#d0fe1d] uppercase tracking-wider">
                ARENA
              </h2>
              <span className="text-xs font-mono text-neutral-400">{spec.classId}</span>
            </div>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Cage</span>
                <span className="font-mono font-bold text-white">Custom-made allowed</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Standard size</span>
                <span className="font-mono font-bold text-[#d0fe1d]">{isD20 ? '8 × 4 × 3 m' : '16 × 7 × 4.5 m'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span className="text-neutral-400">Goal</span>
                <span className="font-mono font-bold text-white">{isD20 ? 'Ø 30 cm ring' : 'Ø 60 cm ring'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-400">Pilot areas</span>
                <span className="font-mono font-bold text-white">2 m at each end</span>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL 6-STEP MATCH WORKFLOW (FROM PAGE 1 OF RULE BOOK PDF) */}
        <div className="xotc-card p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="text-left">
              <span className="text-[11px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                OFFICIAL TOURNAMENT PROGRESSION
              </span>
              <h2 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase">
                MATCH WORKFLOW ({spec.classId})
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Register → Inspect Drones → Toss &amp; Ready → Play 3 Sets → Penalty Kicks → Winner
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {workflowSteps.map((w, idx) => (
              <div
                key={w.step}
                className="relative bg-[#111210] border border-white/15 p-4 text-left flex flex-col justify-between space-y-2 hover:border-[#d0fe1d]/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#d0fe1d]">STEP {w.step}</span>
                  {idx < workflowSteps.length - 1 && (
                    <span className="text-xs font-mono text-neutral-500 hidden lg:inline">→</span>
                  )}
                </div>
                <div className="font-orbitron font-black text-xs sm:text-sm text-white uppercase">
                  {w.title}
                </div>
                <div className="text-[11px] text-neutral-400 font-sans leading-snug">
                  {w.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/15">
          {[
            { id: 'rulebook', label: `All 10 Official Rules (${spec.classId})` },
            { id: 'arena', label: 'Arena Layout & Equipment (Rules 2–4)' },
            { id: 'scoring', label: 'Scoring, Offside & Penalty Kicks (Rules 6–8)' },
            { id: 'violations', label: 'Violations & Officials (Rules 9–10)' },
            { id: 'compare', label: 'Class D20 vs D40 Matrix' },
            { id: 'faq', label: 'Rule Book FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 min-h-[40px] shrink-0 whitespace-nowrap font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id ? 'xotc-btn-lime' : 'xotc-btn-outline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ALL 10 OFFICIAL RULE BOOK SECTIONS (PAGES 2 & 3 OF PDF) */}
        {activeTab === 'rulebook' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  COMPLETE OFFICIAL REGULATIONS · {spec.classId}
                </span>
                <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                  SECTIONS 1 TO 10 ({spec.classId} RULE BOOK)
                </h2>
              </div>
              <div className="text-xs font-mono text-neutral-400">
                Switch between Class D20 and Class D40 above to view class-specific rules
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
              {OFFICIAL_RULEBOOK_SECTIONS.map((sec) => {
                const bullets = isD20 ? sec.d20Bullets : sec.d40Bullets;
                return (
                  <div
                    key={sec.number}
                    className="xotc-card p-5 sm:p-7 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-[#d0fe1d] text-black font-orbitron font-black text-xs">
                            {sec.number}
                          </span>
                          <h3 className="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-wide">
                            {sec.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono text-[#d0fe1d] uppercase">
                          {spec.classId}
                        </span>
                      </div>

                      <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="text-[#d0fe1d] font-mono font-bold mt-0.5 shrink-0">■</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ARENA LAYOUT (TOP VIEW) & DRONE BALL / GOAL SPECS */}
        {activeTab === 'arena' && (
          <div className="space-y-8 text-left">
            {/* Interactive Top-View Arena Blueprint (Matching Page 1 Diagram) */}
            <div className="xotc-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                    ARENA LAYOUT (TOP VIEW) · RULE 2 &amp; RULE 3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                    STANDARD CAGE: {isD20 ? '8 × 4 × 3 m' : '16 × 7 × 4.5 m'}
                  </h2>
                </div>
                <div className="text-xs font-mono text-[#d0fe1d]">
                  Goal: {isD20 ? 'Ø 30 cm ring' : 'Ø 60 cm ring'} · Pilot areas: 2 m each end
                </div>
              </div>

              {/* Top View Schematic Diagram */}
              <div className="w-full max-w-4xl mx-auto bg-[#111210] border-2 border-[#d0fe1d]/50 p-4 sm:p-6">
                <div className="grid grid-cols-12 min-h-[220px] sm:min-h-[280px] border-2 border-white/70 bg-[#182614] relative">
                  {/* Left Pilot Area (2 m wide) */}
                  <div className="col-span-2 border-r-2 border-white/70 bg-[#22341c] flex items-center justify-center p-2">
                    <span className="font-orbitron font-black text-[10px] sm:text-xs text-[#d0fe1d] tracking-widest uppercase -rotate-90 whitespace-nowrap">
                      PILOT AREA (2 m)
                    </span>
                  </div>

                  {/* Left Field Half */}
                  <div className="col-span-4 border-r-2 border-white/80 relative flex items-center justify-start p-3">
                    {/* Takeoff line & Goal Marker (1.5 m from short side) */}
                    <div className="w-8 sm:w-12 h-24 sm:h-32 border-y-2 border-r-2 border-white/80 flex items-center justify-end pr-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#d0fe1d] bg-[#d0fe1d]/20" title="Goal Ring (1.5 m from short side)" />
                    </div>
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-neutral-300">
                      1.5 m Takeoff &amp; Goal
                    </div>
                  </div>

                  {/* Center Circle Overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-white/80 flex items-center justify-center">
                      <span className="text-[9px] sm:text-[10px] font-mono text-[#d0fe1d] bg-[#182614]/90 px-1.5 py-0.5">
                        HALF LINE
                      </span>
                    </div>
                  </div>

                  {/* Right Field Half */}
                  <div className="col-span-4 border-r-2 border-white/70 relative flex items-center justify-end p-3">
                    <div className="w-8 sm:w-12 h-24 sm:h-32 border-y-2 border-l-2 border-white/80 flex items-center justify-start pl-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#d0fe1d] bg-[#d0fe1d]/20" title="Goal Ring (1.5 m from short side)" />
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] font-mono text-neutral-300">
                      1.5 m Takeoff &amp; Goal
                    </div>
                  </div>

                  {/* Right Pilot Area (2 m wide) */}
                  <div className="col-span-2 bg-[#22341c] flex items-center justify-center p-2">
                    <span className="font-orbitron font-black text-[10px] sm:text-xs text-[#d0fe1d] tracking-widest uppercase rotate-90 whitespace-nowrap">
                      PILOT AREA (2 m)
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-300">
                  <span>Cage: {isD20 ? '8 m long × 4 m wide × 3 m high' : '16 m long × 7 m wide × 4.5 m high (Short 5–10 m, Long 10–20 m, Height 4–5 m)'}</span>
                  <span className="text-[#d0fe1d]">Custom-made cages allowed if dimensions match spec</span>
                </div>
              </div>
            </div>

            {/* Detailed Specs for Drone Ball, Goal & Identification LEDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="xotc-card p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="font-orbitron font-black text-base sm:text-lg text-white uppercase">
                    DRONE BALL &amp; EQUIPMENT ({spec.classId})
                  </h3>
                  <span className="font-mono text-xs text-[#d0fe1d]">RULE 4</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Exoskeleton Diameter</span>
                    <span className="font-mono font-bold text-[#d0fe1d]">{spec.ballDiameter}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Max Weight in Play</span>
                    <span className="font-mono font-bold text-white">{spec.ballWeightMax}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Open Surface Limit</span>
                    <span className="font-mono text-white">{spec.exoskeletonOpenArea}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Team LED Ring</span>
                    <span className="font-mono text-white">Red or Blue (visible from all sides)</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Striker Identification</span>
                    <span className="font-mono text-[#d0fe1d]">Green Tag &amp; Green LED</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Controllers &amp; FPV</span>
                    <span className="font-mono text-white">1 controller/pilot; FPV optional</span>
                  </li>
                  <li className="py-1 text-xs text-neutral-400">
                    <strong className="text-white">Banned:</strong> lights that dazzle opponents, jammers or transmitters, distracting audio devices, and modifications made only to gain an unfair advantage.
                  </li>
                </ul>
              </div>

              <div className="xotc-card p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="font-orbitron font-black text-base sm:text-lg text-white uppercase">
                    ARENA NETTING &amp; GOAL RING ({spec.classId})
                  </h3>
                  <span className="font-mono text-xs text-[#d0fe1d]">RULE 2 &amp; 3</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Goal Ring Inner / Outer Ø</span>
                    <span className="font-mono font-bold text-[#d0fe1d]">
                      {spec.goalInnerDiameter} / {spec.goalOuterDiameter}
                    </span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Goal Ring Thickness</span>
                    <span className="font-mono text-white">{spec.goalThickness}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Goal Placement &amp; Height</span>
                    <span className="font-mono text-white">{spec.goalCenterHeight}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Goal Weight &amp; Mounting</span>
                    <span className="font-mono text-white text-right">{spec.goalWeight}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Net Max Deflection</span>
                    <span className="font-mono text-white">{spec.netDeflectionLimit}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-neutral-400">Vertical Wire Wall Spec</span>
                    <span className="font-mono text-white">{spec.wireWallSpec}</span>
                  </li>
                  <li className="py-1 text-xs text-neutral-400">
                    <strong className="text-white">Goal LEDs:</strong> White and red LEDs switched manually from outside the cage. Turns <strong className="text-white">red</strong> for an approved goal and back to <strong className="text-white">white</strong> afterwards.
                  </li>
                </ul>
              </div>
            </div>

            {/* Official LED & Tag Identification Cards */}
            <div className="xotc-card p-6 sm:p-7 space-y-4">
              <h3 className="font-orbitron font-black text-base sm:text-lg text-white uppercase">
                OFFICIAL TEAM LED, STRIKER TAG &amp; GOAL RING COLOURS (RULE 3 &amp; 4)
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                No other colours that confuse team or position are permitted. If the Striker’s tag falls off and opponents cannot identify it, goals scored afterwards do not count.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {GCDIS_7_COLORS.map((c, idx) => (
                  <div key={idx} className="bg-[#111210] border border-white/15 p-4 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-orbitron font-bold text-xs text-white uppercase">
                        {c.color}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#d0fe1d]">{c.role}</div>
                    <p className="text-xs text-neutral-400 leading-snug">{c.method}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCORING, OFFSIDE, PENALTY KICKS & WINNING (RULES 6, 7 & 8) */}
        {activeTab === 'scoring' && (
          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Rule 6: Scoring & Offside */}
              <div className="xotc-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="font-orbitron font-black text-base text-white uppercase">
                    06. SCORING &amp; OFFSIDE
                  </h3>
                  <span className="font-mono text-xs text-[#d0fe1d]">FRONT → BACK</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <li>
                    <strong className="text-white">Goal:</strong> The Striker’s ball passes completely through the opponent’s goal from front to back. Only <strong className="text-[#d0fe1d]">{isD20 ? 'Strikers (maximum two per team in Class D20)' : 'the Striker (one per team in Class D40)'}</strong> can score; every other pilot defends.
                  </li>
                  <li>
                    <strong className="text-white">No Goal:</strong> If the ball rebounds without clearing the ring, passes back to front, or the team is offside.
                  </li>
                  <li>
                    <strong className="text-white">Offside:</strong> After a Striker passes through the opponent’s goal in either direction, the team cannot score again until every one of its balls in the opponent’s half has returned behind the half line. If a ball there is uncontrollable, offside stays until its pilot gives up the set and puts the controller down.
                  </li>
                </ul>
              </div>

              {/* Rule 6: Defence & Reverse Entry */}
              <div className="xotc-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="font-orbitron font-black text-base text-white uppercase">
                    06. DEFENCE &amp; REVERSE ENTRY
                  </h3>
                  <span className="font-mono text-xs text-[#d0fe1d]">PROHIBITED</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <li>
                    <strong className="text-white">Permitted Direction:</strong> Defenders may fly through their own goal from <strong className="text-[#d0fe1d]">front to back only</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Reverse Entry Infraction:</strong> Entering from the back, even slightly, or entering from the front with more than half the ball and coming back out, is a <strong className="text-white">reverse entry</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Mandatory Retreat:</strong> A ball that pokes past the back of the goal must retreat to its defending position. A reverse entry into a team’s own goal awards a penalty kick to the opponent.
                  </li>
                </ul>
              </div>

              {/* Rule 8: Winning, Overtime & Shoot-Out */}
              <div className="xotc-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <h3 className="font-orbitron font-black text-base text-white uppercase">
                    08. WINNING &amp; TIE-BREAKERS
                  </h3>
                  <span className="font-mono text-xs text-[#d0fe1d]">3 SETS</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <li>
                    <strong className="text-white">Set Winner:</strong> More goals in a set wins the set; equal goals (including 0–0) is a drawn set.
                  </li>
                  <li>
                    <strong className="text-white">Match Winner:</strong> After three sets the team with more set wins is the winner: <strong className="text-[#d0fe1d]">two wins</strong>, or <strong className="text-[#d0fe1d]">one win and two draws</strong>.
                  </li>
                  <li>
                    <strong className="text-white">Still Level:</strong> One <strong className="text-white">overtime set</strong> in the same format, then a <strong className="text-white">penalty shoot-out of 3 kicks per team</strong> (pilots may repeat in small teams) in a fixed order, then <strong className="text-white">sudden death</strong> (first team to score while the other misses wins). If a competition allows draws, there is no overtime or shoot-out.
                  </li>
                </ul>
              </div>
            </div>

            {/* Rule 7: 5-Second 1-on-1 Penalty Kick Interactive Panel */}
            <div className="xotc-card-lime p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-[#d0fe1d] uppercase tracking-widest">
                    RULE 7 · PENALTY KICKS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-orbitron font-black uppercase text-white mt-1">
                    5-SECOND 1-ON-1 PENALTY KICK (STRIKER VS KEEPER)
                  </h3>
                </div>
                <button
                  onClick={startPenaltySim}
                  disabled={penaltyTimer !== null && penaltyTimer > 0}
                  className="xotc-btn-lime px-6 py-3 text-xs cursor-pointer self-start sm:self-auto whitespace-nowrap"
                >
                  {penaltyTimer !== null && penaltyTimer > 0
                    ? `PENALTY CLOCK: ${penaltyTimer}s`
                    : 'START 5-SEC PENALTY TIMER'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-neutral-300">
                <div className="p-4 bg-[#111210] border border-white/15 space-y-1.5">
                  <div className="font-orbitron font-bold text-[#d0fe1d] uppercase text-xs">1. When Awarded</div>
                  <p>
                    Awarded for consecutive goals scored while offside, a reverse entry into a team’s own goal, or two accumulated warnings (carry across sets, reset every game).
                  </p>
                </div>
                <div className="p-4 bg-[#111210] border border-white/15 space-y-1.5">
                  <div className="font-orbitron font-bold text-[#d0fe1d] uppercase text-xs">2. Offset After Set</div>
                  <p>
                    After each set, penalties of both teams are offset and the difference is awarded to the other team. All penalties are still recorded.
                  </p>
                </div>
                <div className="p-4 bg-[#111210] border border-white/15 space-y-1.5">
                  <div className="font-orbitron font-bold text-[#d0fe1d] uppercase text-xs">3. 5-Second Execution</div>
                  <p>
                    One-on-one, Striker vs Keeper, for 5 seconds from the referee’s signal. Striker starts at the half line, Keeper (one defender) below its goal. Several goals may be scored; offside rules still apply.
                  </p>
                </div>
                <div className="p-4 bg-[#111210] border border-white/15 space-y-1.5">
                  <div className="font-orbitron font-bold text-[#d0fe1d] uppercase text-xs">4. Group vs Knockout</div>
                  <p>
                    Group stage: every awarded kick must be taken (counts for goal difference). Knockout stage: the awarded team may waive it. Set ends after the kick, followed by 5 minutes of repair time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIOLATIONS & OFFICIALS / REFEREE SIGNALS (RULES 9 & 10) */}
        {activeTab === 'violations' && (
          <div className="space-y-8 text-left">
            {/* Rule 9: Violations */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  RULE 9 · DISCIPLINARY HIERARCHY
                </span>
                <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                  WARNING, SET LOSS &amp; GAME LOSS VIOLATIONS
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {GCDIS_VIOLATIONS.map((violation, index) => (
                  <div
                    key={index}
                    className="xotc-card p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <h3 className="font-orbitron font-black text-base sm:text-lg text-white uppercase">
                          {violation.level}
                        </h3>
                        <span className="font-mono text-xs text-[#d0fe1d]">LEVEL 0{index + 1}</span>
                      </div>
                      <p className="text-xs font-mono text-[#d0fe1d] leading-relaxed">
                        {violation.consequence}
                      </p>
                      <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 pt-1">
                        {violation.triggers.map((t, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-[#d0fe1d] font-bold">■</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule 10: Officials & Decisions + Whistle & Assistant Signals */}
            <div className="xotc-card p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-white/15 pb-4">
                <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  RULE 5 &amp; RULE 10 · OFFICIALS &amp; DECISIONS
                </span>
                <h3 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                  REFEREE CREW, OFFICIAL RECORDING REVIEW &amp; SIGNALS
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-4xl">
                  Every game has <strong className="text-white">one head referee</strong> and <strong className="text-white">two assistant referees</strong> (up to four: score referees and penalty referees). Assistants judge goals, offside and penalties; if they disagree, the head referee decides. <strong className="text-[#d0fe1d]">Head referee decisions are final.</strong> The head referee may stop the game, remove a pilot for safety, and review the official recording to correct a decision before play resumes. <strong className="text-white">Private footage is never accepted.</strong>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead className="bg-[#111210] font-orbitron uppercase text-[11px] text-[#d0fe1d] border-b border-white/20">
                    <tr>
                      <th className="py-3.5 px-4">Signal / Match Event</th>
                      <th className="py-3.5 px-4">Assistant Flag / Action</th>
                      <th className="py-3.5 px-4">Whistle Audio</th>
                      <th className="py-3.5 px-4">Goal Ring LED</th>
                      <th className="py-3.5 px-4">Official Rule Book Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-sans">
                    {GCDIS_REFEREE_SIGNALS.map((sig, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{sig.category}</td>
                        <td className="py-3.5 px-4 text-neutral-300">{sig.handSignal}</td>
                        <td className="py-3.5 px-4 font-mono text-[#d0fe1d]">{sig.whistle}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{sig.goalLed}</td>
                        <td className="py-3.5 px-4 text-neutral-300">{sig.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FULL CLASS D20 VS CLASS D40 COMPARATOR MATRIX */}
        {activeTab === 'compare' && (
          <div className="xotc-card overflow-hidden text-left">
            <div className="p-5 sm:p-6 bg-[#111210] border-b border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  SIDE-BY-SIDE SPECIFICATION TABLE
                </span>
                <h3 className="font-orbitron font-black text-base sm:text-xl text-white uppercase">
                  CLASS D20 VS CLASS D40 RULE BOOK COMPARISON
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">GCDIS OFFICIAL RULE BOOKS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-[#181b15] font-orbitron text-xs text-[#d0fe1d] uppercase border-b border-white/15">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Rule Book Parameter</th>
                    <th className="py-3.5 px-4 font-bold">Class D20</th>
                    <th className="py-3.5 px-4 font-bold">Class D40</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-sans text-neutral-300">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Team Size &amp; Flying Balls</td>
                    <td className="py-3.5 px-4 font-mono text-[#d0fe1d]">2–5 members (1 ball/pilot, max 5)</td>
                    <td className="py-3.5 px-4 font-mono text-[#d0fe1d]">2–3 members (1 ball/pilot, max 3)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Minimum Pilots Seated</td>
                    <td className="py-3.5 px-4">At least 2 pilots seated (else game/set lost)</td>
                    <td className="py-3.5 px-4">At least 2 pilots seated (else game/set lost)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Registration Fee &amp; Deposit</td>
                    <td className="py-3.5 px-4 font-mono">Rs. 1500/- · Security deposit: None</td>
                    <td className="py-3.5 px-4 font-mono">TBA · Rs. 3000/- refundable deposit for GCDIS drone</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Drone Provision</td>
                    <td className="py-3.5 px-4">Own drone allowed</td>
                    <td className="py-3.5 px-4">Own drone allowed OR use a GCDIS drone</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Drone Ball Exoskeleton Ø</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">Ø 20 ± 1 cm</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">Ø 40 ± 2 cm</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Max Drone Weight in Play</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#d0fe1d]">150 g</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#d0fe1d]">1.2 kg</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Max Single Open Surface</td>
                    <td className="py-3.5 px-4 font-mono">≤ 70 cm²</td>
                    <td className="py-3.5 px-4 font-mono">≤ 150 cm²</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Standard Arena (Cage) Size</td>
                    <td className="py-3.5 px-4 font-mono">8 m long × 4 m wide × 3 m high</td>
                    <td className="py-3.5 px-4 font-mono">16 m × 7 m × 4.5 m (Short 5–10m, Long 10–20m, H 4–5m)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Custom-Made Cages</td>
                    <td className="py-3.5 px-4">Allowed if dimensions match specification</td>
                    <td className="py-3.5 px-4">Allowed if dimensions match specification</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Net Deflection &amp; Wire Walls</td>
                    <td className="py-3.5 px-4 font-mono">≤ 10 cm at 3 m/s · 1–2 mm wires, 10 cm apart</td>
                    <td className="py-3.5 px-4 font-mono">≤ 20 cm at 5 m/s · 2.3–3.2 mm wires, 10 cm apart</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Goal Ring Dimensions</td>
                    <td className="py-3.5 px-4 font-mono">Inner Ø 30 ± 1 cm, Outer Ø 50 ± 1 cm, 10 cm thick</td>
                    <td className="py-3.5 px-4 font-mono">Inner Ø 60 ± 1 cm, Outer Ø 100 ± 1 cm, 20 cm thick</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Goal Weight &amp; Height</td>
                    <td className="py-3.5 px-4 font-mono">Centre 1.8–2.2 m above floor (1.5 m from short side)</td>
                    <td className="py-3.5 px-4 font-mono">10–15 kg · Centre 3–3.5 m above floor (1.5 m from short side)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Designated Strikers Allowed</td>
                    <td className="py-3.5 px-4 font-bold text-[#d0fe1d]">Maximum 2 Strikers per team</td>
                    <td className="py-3.5 px-4 font-bold text-[#d0fe1d]">Only 1 Striker per team</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Substitutions</td>
                    <td className="py-3.5 px-4">Only between sets from registered roster (inspected)</td>
                    <td className="py-3.5 px-4">Only between sets from registered roster (inspected)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Match Format &amp; Repair Time</td>
                    <td className="py-3.5 px-4 font-mono">3 sets × 3 min (no time-outs) · ≥ 5 min repair</td>
                    <td className="py-3.5 px-4 font-mono">3 sets × 3 min (no time-outs) · ≥ 5 min repair</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: RULE BOOK FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                OFFICIAL CLARIFICATIONS
              </span>
              <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                FREQUENTLY ASKED QUESTIONS (CLASS D20 &amp; D40)
              </h2>
            </div>

            <div className="space-y-3">
              {FREQUENT_QUESTIONS.map((faq, idx) => (
                <div key={idx} className="xotc-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between font-orbitron font-bold text-xs sm:text-sm text-white hover:text-[#d0fe1d] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="font-mono text-lg text-[#d0fe1d] font-black ml-4">
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 pt-2 text-xs sm:text-sm text-neutral-300 border-t border-white/10 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM CTA BANNER */}
        <div className="xotc-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#d0fe1d]/40">
          <div className="space-y-1 text-left">
            <div className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
              GALGOTIAS CENTRE FOR DRONE INTELLIGENCE &amp; SIMULATION (GCDIS)
            </div>
            <h3 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase">
              READY TO COMPETE IN CLASS D20 OR CLASS D40?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Register your squad roster and prepare your drone balls for pre-match inspection.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => (onOpenRegister ? onOpenRegister() : onNavigate('register'))}
              className="xotc-btn-lime px-6 py-3 text-xs cursor-pointer whitespace-nowrap"
            >
              REGISTER SQUAD NOW →
            </button>
            <button
              onClick={() => onNavigate('bracket')}
              className="xotc-btn-outline px-5 py-3 text-xs cursor-pointer whitespace-nowrap"
            >
              VIEW BRACKET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RulesAndSpecsPage;
