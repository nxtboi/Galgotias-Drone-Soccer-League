import React, { useState } from 'react';
import {
  FIDA_CLASS_SPECS,
  FIDA_7_COLORS,
  FIDA_REFEREE_SIGNALS,
  FIDA_5TH_REVISION_UPDATES,
  FIDA_VIOLATIONS,
  FREQUENT_QUESTIONS,
  GDSL_TOURNAMENT_INFO,
} from '../data/droneSoccerData';
import { GcdisLogo } from '../components/GcdisLogo';

export interface RulesAndSpecsPageProps {
  onNavigate: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const RulesAndSpecsPage: React.FC<RulesAndSpecsPageProps> = ({
  onNavigate,
}) => {
  const [selectedClass, setSelectedClass] = useState<'class40' | 'class20'>('class40');
  const [activeTab, setActiveTab] = useState<'specs' | 'positions' | 'scoring' | 'referee' | 'var' | 'violations' | 'faq'>('specs');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // 5-second penalty kick simulator
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

  const handleDownloadPdf = (className: string) => {
    setDownloadSuccess(`FIDA_Rulebook_${className}_5th_Revision_Oct2025.pdf`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const spec = FIDA_CLASS_SPECS[selectedClass];

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header with FIDA 5th Revision Accreditation */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span>FIDA OFFICIAL RULEBOOK · 5TH REVISION (OCT 1, 2025)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            RULES &amp; DRONE SPECIFICATIONS
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Standard regulations governed by the Federation of International Dronesoccer Association (FIDA) for Class 20 and Class 40, incorporating full VAR video review protocols, 7-color LED identification, and technical arena schematics.
          </p>

          {/* Download Rulebook Triggers */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleDownloadPdf('Class40')}
              className="px-5 py-2.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Class 40 Rulebook (PDF)</span>
            </button>

            <button
              onClick={() => handleDownloadPdf('Class20')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-blue-50 text-blue-950 font-sans font-bold text-xs uppercase tracking-wider border border-blue-200 transition-all shadow-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Class 20 Rulebook (PDF)</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 py-1.5 px-4 rounded-full inline-block animate-fade-in">
              ✓ {downloadSuccess} ready for offline inspection!
            </div>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-blue-200 pb-4">
          {[
            { id: 'specs', label: 'Class 20 vs 40 Specs' },
            { id: 'positions', label: '7-Color Position LEDs' },
            { id: 'scoring', label: 'Scoring & Offside' },
            { id: 'referee', label: 'Referee Signals' },
            { id: 'var', label: 'VAR Protocol' },
            { id: 'violations', label: 'Violations & Cards' },
            { id: 'faq', label: 'League FAQ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CLASS 20 VS CLASS 40 TECHNICAL SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-8 text-left">
            {/* Division Switcher */}
            <div className="flex items-center justify-between bg-blue-50/80 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-blue-900 uppercase">SELECT DIVISION:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClass('class40')}
                    className={`px-4 py-1.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                      selectedClass === 'class40'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-blue-100'
                    }`}
                  >
                    Class 40 (Standard Collegiate)
                  </button>
                  <button
                    onClick={() => setSelectedClass('class20')}
                    className={`px-4 py-1.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                      selectedClass === 'class20'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-blue-100'
                    }`}
                  >
                    Class 20 (Junior / Varsity)
                  </button>
                </div>
              </div>
              <span className="text-[11px] font-mono text-blue-700 font-bold hidden sm:inline">
                {spec.targetCategory}
              </span>
            </div>

            {/* Drone Ball & Goal Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drone Ball Specs */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                    DRONE BALL SPECIFICATION ({spec.classId})
                  </h3>
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    FIDA RULE 2
                  </span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Ball Diameter</span>
                    <span className="font-mono text-blue-900 font-bold">{spec.ballDiameter}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Max Weight During Play</span>
                    <span className="font-mono text-blue-900 font-bold">{spec.ballWeightMax}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Exoskeleton Max Open Area</span>
                    <span className="font-mono text-slate-700">{spec.exoskeletonOpenArea}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Equipment Modifications</span>
                    <span
                      className={`font-bold ${
                        spec.ballModificationAllowed ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {spec.ballModificationAllowed
                        ? 'Permitted within tolerances'
                        : 'Strictly Prohibited in Class 20'}
                    </span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Players &amp; Drone Balls</span>
                    <span className="font-mono text-slate-700">{spec.playersPerTeam}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="font-bold text-blue-950">In-Game Striker Sub</span>
                    <span className="text-xs text-slate-700 font-medium">{spec.strikerSubDuringGame}</span>
                  </li>
                </ul>
              </div>

              {/* Skyfence & Goal Hoop Specs */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                    SKYFENCE &amp; GOAL HOOP ({spec.classId})
                  </h3>
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    FIDA RULE 1
                  </span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Skyfence Dimensions</span>
                    <span className="font-mono text-blue-900 font-bold">{spec.arenaDimensions}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Goal Aperture (Inner / Outer)</span>
                    <span className="font-mono text-blue-900 font-bold">
                      {spec.goalInnerDiameter} / {spec.goalOuterDiameter}
                    </span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Goal Hoop Thickness</span>
                    <span className="font-mono text-slate-700">{spec.goalThickness}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Goal Elevation (Center to Floor)</span>
                    <span className="font-mono text-blue-900 font-bold">{spec.goalCenterHeight}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold text-blue-950">Goal Unit Weight</span>
                    <span className="font-mono text-slate-700">{spec.goalWeight}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="font-bold text-blue-950">Netting Max Deflection</span>
                    <span className="font-mono text-slate-700">{spec.netDeflectionLimit}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Full Comparative Table */}
            <div className="bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-5 bg-blue-950 text-white flex items-center justify-between">
                <h4 className="font-sans font-black text-sm uppercase tracking-wide">
                  COMPLETE FIDA TECHNICAL COMPARATOR MATRIX
                </h4>
                <span className="text-xs font-mono text-sky-300">5TH REVISION REGULATION SPEC</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-blue-50 font-mono text-[11px] text-blue-950 uppercase border-b border-blue-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Regulation Parameter</th>
                      <th className="py-3 px-4 font-bold text-blue-900">Class 40 (Standard)</th>
                      <th className="py-3 px-4 font-bold text-blue-900">Class 20 (Varsity)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Sphere Diameter</td>
                      <td className="py-3 px-4 font-mono">40 cm ± 2 cm</td>
                      <td className="py-3 px-4 font-mono">20 cm ± 1 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Max Drone Ball Weight</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-950">≤ 1,100 grams</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-950">≤ 110 grams</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Skyfence Arena Dimensions</td>
                      <td className="py-3 px-4">16m × 8m × 4.5m (10-20m long, 5-10m wide)</td>
                      <td className="py-3 px-4">8m × 4m × 3m (Fixed rectangular frame)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Goal Inner Diameter</td>
                      <td className="py-3 px-4 font-mono">60 cm ± 1 cm</td>
                      <td className="py-3 px-4 font-mono">30 cm ± 1 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Goal Outer Diameter</td>
                      <td className="py-3 px-4 font-mono">100 cm ± 1 cm</td>
                      <td className="py-3 px-4 font-mono">50 cm ± 1 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Goal Elevation above Floor</td>
                      <td className="py-3 px-4 font-mono">3.0 m to 3.5 m (Center of hoop)</td>
                      <td className="py-3 px-4 font-mono">1.8 m to 2.2 m (Center of hoop)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Goal Unit Weight</td>
                      <td className="py-3 px-4">10 to 15 kg each (stabilized anti-sway)</td>
                      <td className="py-3 px-4">Standard identical weight</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Position LED Roles</td>
                      <td className="py-3 px-4 font-semibold text-blue-900">
                        7 Official Colors (Striker, Guide, Libero, Sweeper, Keeper)
                      </td>
                      <td className="py-3 px-4 text-slate-600">Red &amp; Blue Team LEDs + Striker Tag</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-blue-950">Inter-Set Repair Time</td>
                      <td className="py-3 px-4 font-mono">5 min guaranteed (+3 min for 3+ repairs)</td>
                      <td className="py-3 px-4 font-mono">5 min guaranteed (+3 min for 3+ repairs)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 7-COLOR POSITION & BALL IDENTIFICATION (RULE 2-5) */}
        {activeTab === 'positions' && (
          <div className="space-y-8 text-left">
            <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                FIDA CLASS 40 · REGULATION 2-5
              </span>
              <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                THE 7 OFFICIAL COLORS FOR BALL &amp; POSITION IDENTIFICATION
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                To prevent visual confusion inside the high-speed arena netting, only seven standardized colors are permitted on the drone ball. Team affiliation is shown by a circular LED strip, and position roles are designated by specific LED hues.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FIDA_7_COLORS.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-sm flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: item.hex }}
                    />
                    <div>
                      <div className="font-sans font-black text-base text-blue-950 uppercase">
                        {item.color}
                      </div>
                      <div className="text-[11px] font-mono text-blue-700 font-bold">
                        {item.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                    <div>
                      <span className="font-bold text-blue-950">Tactical Role:</span> {item.user}
                    </div>
                    <div>
                      <span className="font-bold text-blue-950">Hardware:</span> {item.method}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Diagram: 5-Player Team Composition */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-sans font-black text-base uppercase text-blue-950">
                TEAM FORMATION ROLES &amp; STRIKER SUBSTITUTION RULE (RULE 3-4)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center font-mono text-xs">
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl">
                  <span className="block font-black text-emerald-900 text-sm">1. STRIKER</span>
                  <span className="text-[10px] text-emerald-800">GREEN LED + TAG</span>
                  <p className="mt-1 text-[10px] text-emerald-950 font-sans">Only scoring drone</p>
                </div>
                <div className="p-3 bg-pink-100 border border-pink-300 rounded-2xl">
                  <span className="block font-black text-pink-900 text-sm">2. GUIDE</span>
                  <span className="text-[10px] text-pink-800">PINK LED + TAG</span>
                  <p className="mt-1 text-[10px] text-pink-950 font-sans">Clears path / Striker sub</p>
                </div>
                <div className="p-3 bg-sky-100 border border-sky-300 rounded-2xl">
                  <span className="block font-black text-sky-900 text-sm">3. LIBERO</span>
                  <span className="text-[10px] text-sky-800">SKYBLUE LED</span>
                  <p className="mt-1 text-[10px] text-sky-950 font-sans">Front defender (hits guide)</p>
                </div>
                <div className="p-3 bg-amber-100 border border-amber-300 rounded-2xl">
                  <span className="block font-black text-amber-900 text-sm">4. SWEEPER</span>
                  <span className="text-[10px] text-amber-800">YELLOW LED</span>
                  <p className="mt-1 text-[10px] text-amber-950 font-sans">Rear defender (blocks path)</p>
                </div>
                <div className="p-3 bg-white border border-slate-300 rounded-2xl">
                  <span className="block font-black text-slate-900 text-sm">5. KEEPER</span>
                  <span className="text-[10px] text-slate-600">WHITE LED</span>
                  <p className="mt-1 text-[10px] text-slate-950 font-sans">Blocks goal hoop</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Mid-Set Striker Substitution (Class 40):</strong> If the Striker crashes or withdraws, the Guide may substitute as Striker! The Guide&apos;s drone ball must physically contact the withdrawn Striker&apos;s ball, and the Guide pilot touches the Striker pilot after the controller is placed on the floor. Head referee confirms with 2 short whistle blows.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: SCORING, OFFSIDE & DEFENSIVE REVERSE-ENTRY */}
        {activeTab === 'scoring' && (
          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scoring & Offside */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                    SCORING CRITERIA (RULE 8-1)
                  </h3>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    FRONT → BACK
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p>
                    A goal is awarded when the <strong>Striker&apos;s drone ball completely passes from the front to the back</strong> of the opponent&apos;s circular goal hoop.
                  </p>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-950">
                    <strong>A goal shall NOT be counted if:</strong>
                    <ul className="list-disc list-inside space-y-1 pt-1">
                      <li>The Striker is in an offside position at the time of scoring.</li>
                      <li>The drone ball fails to completely pass through and rebounds.</li>
                      <li>The Striker passes in the reverse direction (back to front).</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <h4 className="font-bold text-blue-950 text-xs uppercase mb-1">
                      THE OFFSIDE STATE (RULE 8-2):
                    </h4>
                    <p className="text-xs text-slate-600">
                      When a Striker passes through the opponent&apos;s goal in any direction, the team enters an <strong>offside state</strong>. To clear offside, <strong>all drone balls from the scoring team</strong> in the opponent&apos;s half must retreat completely behind the center half line.
                    </p>
                  </div>
                </div>
              </div>

              {/* Defensive Reverse Entry (Rule 8-3) */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                    DEFENSIVE REVERSE ENTRY (RULE 8-3)
                  </h3>
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    PROHIBITED
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p>
                    While defending, players may pass through their own goal from front to back. However, <strong>reverse entry (back to front) is strictly prohibited</strong> under any circumstance.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                    <li>If more than half of the drone ball enters the goal from the front and comes back out, it is considered a reverse entry.</li>
                    <li>If a defender enters the goal from the back side, even slightly, it is considered a reverse entry.</li>
                  </ul>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-blue-950">Valid vs. Invalid Defensive Position:</div>
                    <p className="text-slate-600">
                      <strong>Valid (Figure 1):</strong> If the defender hovers in front of the goal without protruding past the back rim, it is valid.
                    </p>
                    <p className="text-slate-600">
                      <strong>Infraction (Figure 2):</strong> If the defender passes the back of the goal, it must not advance forward—it must retreat around the outside of the goal!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Second Penalty Kick Simulator */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                    FIDA REGULATION 9
                  </span>
                  <h3 className="text-2xl font-sans font-black uppercase text-white">
                    5-SECOND 1-ON-1 PENALTY KICK
                  </h3>
                </div>
                <button
                  onClick={startPenaltySim}
                  disabled={penaltyTimer !== null && penaltyTimer > 0}
                  className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-black text-xs uppercase tracking-wider transition-all self-start sm:self-auto"
                >
                  {penaltyTimer !== null && penaltyTimer > 0
                    ? `COUNTDOWN: ${penaltyTimer}s`
                    : 'SIMULATE 5-SEC PENALTY KICK'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-blue-200">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                  <div className="font-bold text-white uppercase text-sm mb-1">When Awarded</div>
                  <p>
                    Consecutive goals while offside, defender passing through own goal in reverse, or accumulating &gt;2 warnings.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                  <div className="font-bold text-white uppercase text-sm mb-1">1-on-1 Format</div>
                  <p>
                    Conducted after set completion. Striker takes off from half line; Keeper starts below the goal hoop.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15">
                  <div className="font-bold text-white uppercase text-sm mb-1">Multiple Goals in 5s</div>
                  <p>
                    Multiple goals may be scored within 5 seconds as long as the Striker clears offside after each hoop penetration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REFEREE SIGNALS & GOAL LED STATES */}
        {activeTab === 'referee' && (
          <div className="space-y-8 text-left">
            <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                FIDA RULES 5-7 &amp; 6-4
              </span>
              <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                REFEREE SIGNALS, WHISTLE AUDIO &amp; GOAL LED STATES
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Head Referees and Assistant Referees (Score Referee &amp; Penalty Referee) use standardized whistle patterns, flag gestures, and manual goal hoop LED color switches.
              </p>
            </div>

            <div className="bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-blue-950 text-white font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Event Category</th>
                      <th className="py-3.5 px-4">Hand / Flag Signal</th>
                      <th className="py-3.5 px-4">Whistle Audio</th>
                      <th className="py-3.5 px-4 text-center">Goal Hoop LED</th>
                      <th className="py-3.5 px-4">Officiating Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {FIDA_REFEREE_SIGNALS.map((sig, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-blue-950">{sig.category}</td>
                        <td className="py-4 px-4 text-slate-700">{sig.handSignal}</td>
                        <td className="py-4 px-4 font-mono font-bold text-blue-900">{sig.whistle}</td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-black ${
                              sig.goalLed.includes('RED')
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}
                          >
                            {sig.goalLed}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 text-xs">{sig.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VAR PROTOCOL (5TH REVISION) */}
        {activeTab === 'var' && (
          <div className="space-y-8 text-left">
            <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                FIDA ADDENDUM 2 · 5TH REVISION (OCT 1, 2025)
              </span>
              <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                VIDEO ASSISTANT REFEREE (VAR) PROTOCOL
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                The VAR protocol assists the Head Referee to correct &quot;clear and obvious errors&quot; or serious missed incidents. Under the 5th Revision, matches feature multi-camera high frame-rate replay systems and coach challenge tickets.
              </p>
            </div>

            {/* 3 VAR Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs space-y-3">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  TIER 1 · BASIC VAR
                </span>
                <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                  3 SYNCHRONIZED CAMERAS
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li>• Replay Operator (RO)</li>
                  <li>• Both Goals (2) + Entire Arena (1)</li>
                  <li>• Standard video recording and playback</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-blue-400 rounded-3xl p-6 shadow-sm space-y-3">
                <span className="font-mono text-xs font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                  TIER 2 · PRO VAR (GDSL)
                </span>
                <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                  5 CAMERAS (1080/60P)
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li>• Dedicated VAR Referee + Professional RO</li>
                  <li>• Both Goals (2) + Both Pilot Dugouts (2) + Arena (1)</li>
                  <li>• Synchronized timecode with scoreboard monitor</li>
                </ul>
              </div>

              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs space-y-3">
                <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                  TIER 3 · ADVANCED VAR
                </span>
                <h4 className="font-sans font-black text-base text-blue-950 uppercase">
                  6+ CAMERAS &amp; VOR ROOM
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li>• VAR Referee + Assistant VARs + VOR Room</li>
                  <li>• Multi-angle overhead tracking + slow-motion</li>
                  <li>• Broadcast replay integration</li>
                </ul>
              </div>
            </div>

            {/* VAR Scope & Challenge Rules */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-sans font-black text-base uppercase text-blue-950">
                COACH CHALLENGE TICKETS &amp; REVIEW SCOPE (RULE 6)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-950 uppercase">When Can VAR Intervene?</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Goal validation (including buzzer-beater goals crossing prior to whistle).</li>
                    <li>Correction of penalty kick awards and offside clearances.</li>
                    <li>Scoreboard hardware discrepancies and timer errors.</li>
                    <li>Disciplinary ejections and serious safety incidents.</li>
                  </ul>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-950 uppercase">Challenge Ticket Procedure:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Coaches must submit challenge ticket right after the set-ending whistle.</li>
                    <li>Must specify precise incident (e.g., &quot;the 3rd goal at 2m 14s&quot;).</li>
                    <li>If the decision is overturned, the challenge ticket is <strong>refunded</strong>!</li>
                    <li>Repeated non-compliant challenge requests incur a Warning.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VIOLATIONS, SET LOSS & DISQUALIFICATION (RULE 11) */}
        {activeTab === 'violations' && (
          <div className="space-y-8 text-left">
            <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                FIDA REGULATION 11
              </span>
              <h2 className="text-2xl font-sans font-black text-blue-950 uppercase">
                OFFICIAL VIOLATIONS, WARNINGS &amp; PENALTIES
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                Violations are strictly categorized into Warnings, Set Losses, and Game Losses to ensure player safety and fair competitive integrity inside the enclosed netting.
              </p>
            </div>

            <div className="space-y-6">
              {FIDA_VIOLATIONS.map((violation, index) => (
                <div
                  key={index}
                  className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                      LEVEL {index + 1}: {violation.level}
                    </h3>
                    <span className="font-mono text-xs font-bold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full">
                      {violation.consequence}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-blue-900 uppercase block mb-2">
                      Specific Triggers:
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {violation.triggers.map((t, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: LEAGUE FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-6 text-left">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-sans font-black text-blue-950 uppercase">
                FREQUENTLY ASKED RULES QUESTIONS
              </h3>
              <p className="text-xs text-slate-600">
                Official clarifications from the FIDA 5th Revision handbook for participating university squads.
              </p>
            </div>

            <div className="space-y-3">
              {FREQUENT_QUESTIONS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between font-sans font-bold text-sm text-blue-950 hover:bg-blue-50/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="font-mono text-base text-blue-600 font-black">
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 pt-1 text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RulesAndSpecsPage;
