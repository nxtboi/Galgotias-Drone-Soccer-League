import React, { useState } from 'react';
import { SAMPLE_TEAMS, MATCH_FIXTURES, MatchFixture } from '../data/droneSoccerData';

export interface TournamentBracketPageProps {
  onNavigate: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const TournamentBracketPage: React.FC<TournamentBracketPageProps> = ({
  onNavigate,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'Alpha' | 'Beta' | 'Gamma' | 'Delta'>('Alpha');
  const [fixtures, setFixtures] = useState<MatchFixture[]>(MATCH_FIXTURES);
  const [activeTab, setActiveTab] = useState<'bracket' | 'groups' | 'simulator'>('bracket');

  // Interactive Match Simulator State
  const [simTeamA, setSimTeamA] = useState(SAMPLE_TEAMS[0].name);
  const [simTeamB, setSimTeamB] = useState(SAMPLE_TEAMS[1].name);
  const [simResult, setSimResult] = useState<{
    set1: [number, number];
    set2: [number, number];
    set3: [number, number];
    winner: string;
    totalGoals: number;
  } | null>(null);

  const handleSimulateMatch = () => {
    // Random realistic 3-set drone soccer scores
    const s1A = Math.floor(Math.random() * 6) + 8;
    const s1B = Math.floor(Math.random() * 6) + 7;
    const s2A = Math.floor(Math.random() * 6) + 8;
    const s2B = Math.floor(Math.random() * 6) + 7;
    const s3A = Math.floor(Math.random() * 6) + 9;
    const s3B = Math.floor(Math.random() * 6) + 8;

    let winsA = (s1A > s1B ? 1 : 0) + (s2A > s2B ? 1 : 0) + (s3A > s3B ? 1 : 0);
    const winner = winsA >= 2 ? simTeamA : simTeamB;

    setSimResult({
      set1: [s1A, s1B],
      set2: [s2A, s2B],
      set3: [s3A, s3B],
      winner,
      totalGoals: s1A + s1B + s2A + s2B + s3A + s3B,
    });
  };

  const groupTeams = SAMPLE_TEAMS.filter((t) => t.group === selectedGroup);

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OFFICIAL GDSL 2026 FIXTURES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            TOURNAMENT BRACKET &amp; MATCHES
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Track real-time knockout progression, set-by-set goal tallies, group standings, or simulate high-speed clashes in the arena cage.
          </p>

          {/* Sub-view Switcher */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'bracket'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Knockout Bracket
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'groups'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Group Standings
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              Match Simulator
            </button>
          </div>
        </div>

        {/* VIEW 1: KNOCKOUT BRACKET */}
        {activeTab === 'bracket' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: Quarter-Finals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <h3 className="font-sans font-black text-sm uppercase tracking-wider text-blue-950">
                    QUARTER-FINALS (4 MATCHES)
                  </h3>
                  <span className="font-mono text-[10px] text-blue-600 font-bold">BEST OF 3 SETS</span>
                </div>

                <div className="space-y-4">
                  {fixtures
                    .filter((f) => f.round === 'Quarter-Final')
                    .map((fix) => (
                      <div
                        key={fix.id}
                        className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs text-left space-y-3 hover:border-blue-400 transition-all"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>{fix.scheduledTime}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                            {fix.court}
                          </span>
                        </div>

                        {/* Team A */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            fix.scores?.winner === fix.teamA
                              ? 'bg-blue-50 font-bold text-blue-950'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                            <span className="text-xs truncate">{fix.teamA}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-xs">
                            {fix.scores?.teamA.map((s, idx) => (
                              <span
                                key={idx}
                                className="w-5 text-center px-1 py-0.5 rounded bg-white border border-blue-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Team B */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            fix.scores?.winner === fix.teamB
                              ? 'bg-blue-50 font-bold text-blue-950'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                            <span className="text-xs truncate">{fix.teamB}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-xs">
                            {fix.scores?.teamB.map((s, idx) => (
                              <span
                                key={idx}
                                className="w-5 text-center px-1 py-0.5 rounded bg-white border border-blue-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {fix.scores?.winner && (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1 pt-1 border-t border-slate-100">
                            <span>ADVANCES:</span>
                            <span className="font-bold">{fix.scores.winner}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: Semi-Finals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <h3 className="font-sans font-black text-sm uppercase tracking-wider text-blue-950">
                    SEMI-FINALS (2 MATCHES)
                  </h3>
                  <span className="font-mono text-[10px] text-blue-600 font-bold">BEST OF 3 SETS</span>
                </div>

                <div className="space-y-4 pt-0 lg:pt-8">
                  {fixtures
                    .filter((f) => f.round === 'Semi-Final')
                    .map((fix) => (
                      <div
                        key={fix.id}
                        className="bg-white border-2 border-blue-300 rounded-2xl p-4 shadow-sm text-left space-y-3"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>{fix.scheduledTime}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                            {fix.court}
                          </span>
                        </div>

                        {/* Team A */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            fix.scores?.winner === fix.teamA
                              ? 'bg-blue-100 font-black text-blue-950'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shrink-0" />
                            <span className="text-xs truncate">{fix.teamA}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-xs">
                            {fix.scores?.teamA.map((s, idx) => (
                              <span key={idx} className="w-5 text-center px-1 py-0.5 rounded bg-white font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Team B */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-xl ${
                            fix.scores?.winner === fix.teamB
                              ? 'bg-blue-100 font-black text-blue-950'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                            <span className="text-xs truncate">{fix.teamB}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-xs">
                            {fix.scores?.teamB.map((s, idx) => (
                              <span key={idx} className="w-5 text-center px-1 py-0.5 rounded bg-white font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {fix.scores?.winner && (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1 pt-1 border-t border-slate-100">
                            <span>QUALIFIED FOR FINALE:</span>
                            <span className="font-bold">{fix.scores.winner}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: Grand Finale & Trophy */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-300">
                  <h3 className="font-sans font-black text-sm uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span>🏆</span>
                    <span>GRAND FINALE CLASH</span>
                  </h3>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                    ₹21,000 CUP
                  </span>
                </div>

                <div className="pt-0 lg:pt-16">
                  {fixtures
                    .filter((f) => f.round === 'Grand Finale')
                    .map((fix) => (
                      <div
                        key={fix.id}
                        className="bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400 text-left space-y-4 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-300 font-bold">{fix.scheduledTime}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black animate-pulse text-[10px]">
                            LIVE ARENA
                          </span>
                        </div>

                        <div className="space-y-3 py-2">
                          <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                            <span className="font-sans font-black text-sm uppercase text-sky-200">
                              {fix.teamA}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-300">
                              {fix.scores?.teamA.map((s, idx) => (
                                <span key={idx} className="bg-black/40 px-2 py-1 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-center font-mono text-[11px] text-slate-400 font-bold uppercase">
                            VS
                          </div>

                          <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                            <span className="font-sans font-black text-sm uppercase text-purple-200">
                              {fix.teamB}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-300">
                              {fix.scores?.teamB.map((s, idx) => (
                                <span key={idx} className="bg-black/40 px-2 py-1 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/20 text-center">
                          <span className="text-[11px] text-amber-200 font-medium">
                            Set 3 in progress · Deciding National Championship
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: GROUP STAGE TABLES */}
        {activeTab === 'groups' && (
          <div className="space-y-6 text-left">
            {/* Group Tabs */}
            <div className="flex items-center gap-2 border-b border-blue-200 pb-3">
              {(['Alpha', 'Beta', 'Gamma', 'Delta'] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-4 py-1.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all ${
                    selectedGroup === grp
                      ? 'bg-blue-900 text-white'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  Group {grp}
                </button>
              ))}
            </div>

            {/* Standings Table */}
            <div className="bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50/80 border-b border-blue-200 font-mono text-[11px] text-blue-900 uppercase">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Team / Institution</th>
                      <th className="py-3.5 px-3 font-bold text-center">Class</th>
                      <th className="py-3.5 px-3 font-bold text-center">Played</th>
                      <th className="py-3.5 px-3 font-bold text-center">Won</th>
                      <th className="py-3.5 px-3 font-bold text-center">Lost</th>
                      <th className="py-3.5 px-3 font-bold text-center">Goals (GF-GA)</th>
                      <th className="py-3.5 px-4 font-bold text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupTeams.map((team, index) => (
                      <tr key={team.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-4 px-4 font-sans font-bold text-blue-950 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-mono text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-sm font-black">{team.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal">
                              {team.institution} · {team.city}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-mono text-center text-slate-600">
                          {team.division.includes('20') ? 'Class 20' : 'Class 40'}
                        </td>
                        <td className="py-4 px-3 font-mono text-center font-semibold text-slate-800">
                          {team.stats.matchesPlayed}
                        </td>
                        <td className="py-4 px-3 font-mono text-center font-bold text-emerald-600">
                          {team.stats.wins}
                        </td>
                        <td className="py-4 px-3 font-mono text-center text-rose-500">
                          {team.stats.losses}
                        </td>
                        <td className="py-4 px-3 font-mono text-center text-slate-700">
                          {team.stats.goalsFor} - {team.stats.goalsAgainst}
                        </td>
                        <td className="py-4 px-4 font-mono font-black text-right text-sm text-blue-950">
                          {team.stats.points} PTS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: INTERACTIVE MATCH SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="max-w-2xl mx-auto bg-white border border-blue-200 rounded-3xl p-8 shadow-md text-left space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                AI ARENA ENGINE
              </span>
              <h2 className="mt-2 text-2xl font-sans font-black text-blue-950 uppercase">
                5v5 AERIAL CLASH SIMULATOR
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Select two university teams and simulate a 3-set drone soccer match with aerodynamic goal trajectory logic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  BLUE SQUAD (TEAM A)
                </label>
                <select
                  value={simTeamA}
                  onChange={(e) => setSimTeamA(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm font-semibold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SAMPLE_TEAMS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  RED SQUAD (TEAM B)
                </label>
                <select
                  value={simTeamB}
                  onChange={(e) => setSimTeamB(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white font-sans text-sm font-semibold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SAMPLE_TEAMS.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.institution})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulateMatch}
              className="w-full py-3.5 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-sm uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>SIMULATE 3-MINUTE AERIAL SETS</span>
            </button>

            {simResult && (
              <div className="mt-6 p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-500 uppercase">RESULT</span>
                  <span className="font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                    WINNER: {simResult.winner}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="bg-white p-3 rounded-xl border border-blue-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">SET 1</div>
                    <div className="text-lg font-black text-blue-950 mt-1">
                      {simResult.set1[0]} - {simResult.set1[1]}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">SET 2</div>
                    <div className="text-lg font-black text-blue-950 mt-1">
                      {simResult.set2[0]} - {simResult.set2[1]}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">SET 3</div>
                    <div className="text-lg font-black text-blue-950 mt-1">
                      {simResult.set3[0]} - {simResult.set3[1]}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-center text-slate-600 font-medium pt-2">
                  Total match goals scored: <span className="font-bold">{simResult.totalGoals} goals</span> across 9 minutes of flight time.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default TournamentBracketPage;
