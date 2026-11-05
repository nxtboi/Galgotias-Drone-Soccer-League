import React, { useState } from 'react';
import {
  GCDIS_CLASS_SPECS,
  GCDIS_7_COLORS,
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

  const spec = GCDIS_CLASS_SPECS[selectedClass];
  const isD20 = selectedClass === 'class20';

  const quickStripMetrics = isD20
    ? [
        { value: '2–5', label: 'Members per team' },
        { value: 'Ø 20 cm', label: 'Drone ball' },
        { value: '150 g', label: 'Max drone weight' },
        { value: '3 × 3 min', label: 'Sets per game' },
        { value: '5 min', label: 'Repair between sets' },
        { value: '₹1,500', label: 'Registration fee' },
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

      </div>
    </div>
  );
};
export default RulesAndSpecsPage;
