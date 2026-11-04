import React, { useState, useEffect } from 'react';
import {
  PracticeArenaCanvas,
  CameraViewMode,
  PracticeDrillMode,
  MatchDroneId,
} from '../components/practice/PracticeArenaCanvas';
import { ArenaType } from '../components/practice/arenaEnvironments';
import { TransmitterGimbalVisualizer } from '../components/practice/TransmitterGimbalVisualizer';
import { practiceAudio } from '../utils/practiceAudio';
import { transmitter, FlightMode } from '../utils/transmitterManager';
import { GcdisLogo } from '../components/GcdisLogo';

export interface PracticeArenaPageProps {
  onNavigate: (tab: string) => void;
}

export const PracticeArenaPage: React.FC<PracticeArenaPageProps> = ({ onNavigate }) => {
  // Arena Configuration
  const [arenaType, setArenaType] = useState<ArenaType>('stadium');
  const [arenaClass, setArenaClass] = useState<'class40' | 'class20'>('class40');
  const [matchMode, setMatchMode] = useState<'team3v3' | 'duel1v1' | 'solo'>('team3v3');
  const [activeDroneId, setActiveDroneId] = useState<MatchDroneId>('blue_striker');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [drillMode, setDrillMode] = useState<PracticeDrillMode>('free');
  const [strikerColor, setStrikerColor] = useState<'red' | 'blue' | 'green' | 'yellow' | 'cyan' | 'magenta' | 'white'>('red');
  const [isAudioMuted, setIsAudioMuted] = useState(practiceAudio.getMuted());

  // Score & Drill State
  const [matchScore, setMatchScore] = useState<{ blue: number; red: number }>({ blue: 0, red: 0 });
  const [highScore, setHighScore] = useState<number>(0);
  const [drillTimeRemaining, setDrillTimeRemaining] = useState<number>(60);
  const [isDrillRunning, setIsDrillRunning] = useState<boolean>(false);
  const [drillResultModal, setDrillResultModal] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Photo Reference Modal
  const [showArenaPhotoModal, setShowArenaPhotoModal] = useState<boolean>(false);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    altitude: 0.4,
    speedKmh: 0,
    batteryVoltage: 16.8,
    offside: false,
    armed: true,
    flightMode: 'angle' as FlightMode,
    throttlePct: 0,
    pitchDeg: 0,
    rollDeg: 0,
    yawDeg: 0,
  });

  // Drill Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isDrillRunning && drillTimeRemaining > 0) {
      interval = setInterval(() => {
        setDrillTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsDrillRunning(false);
            practiceAudio.playGoalHorn();
            const totalGoals = matchScore.blue + matchScore.red;
            if (totalGoals > highScore) {
              setHighScore(totalGoals);
            }
            setDrillResultModal(`Drill Complete! Goals Scored: ${totalGoals}`);
            return 0;
          }
          if (prev <= 4) {
            practiceAudio.playBeep(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDrillRunning, drillTimeRemaining, matchScore, highScore]);

  const handleStartDrill = (mode: PracticeDrillMode) => {
    setDrillMode(mode);
    setMatchScore({ blue: 0, red: 0 });
    setDrillResultModal(null);
    if (mode === 'rush60') {
      setDrillTimeRemaining(60);
      setIsDrillRunning(true);
      practiceAudio.playBeep(true);
    } else if (mode === 'penalty5s') {
      setDrillTimeRemaining(5);
      setIsDrillRunning(true);
      practiceAudio.playBeep(true);
    } else {
      setIsDrillRunning(false);
    }
  };

  const handleGoalScored = (team: 'blue' | 'red', newScore: { blue: number; red: number }) => {
    setMatchScore(newScore);
  };

  const handleToggleMute = () => {
    const muted = practiceAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleFlightModeChange = (mode: FlightMode) => {
    transmitter.setFlightMode(mode);
    setTelemetry((prev) => ({ ...prev, flightMode: mode }));
  };

  const handleArmToggle = () => {
    const nextArmed = !telemetry.armed;
    transmitter.setArmed(nextArmed);
    setTelemetry((prev) => ({ ...prev, armed: nextArmed }));
  };

  const handleResetDrone = () => {
    setResetTrigger((prev) => prev + 1);
    transmitter.setArmed(true);
  };

  return (
    <div className="relative z-20 min-h-screen pt-20 pb-12 px-3 sm:px-6 lg:px-8 bg-slate-950 text-white font-sans flex flex-col">
      {/* Top Bar: Title & Status */}
      <div className="max-w-7xl w-full mx-auto mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-mono"
            title="Return to Home"
          >
            <span>←</span>
            <span>BACK</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div>
            <h1 className="font-sans font-black text-lg sm:text-xl uppercase tracking-tight text-white flex items-center gap-2">
              <span>PRACTICE ARENA</span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full">
                3D TRANSMITTER SIMULATOR
              </span>
            </h1>
            <p className="text-slate-400 text-xs hidden sm:block">
              GCDIS regulation 16m×8m aerial soccer proving ground with USB/Bluetooth RC radio transmitter support.
            </p>
          </div>
        </div>

        {/* Quick Toolbar: Arena Type, Class Selector, Audio, Photo Reference */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Arena Environment Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            {[
              { id: 'stadium', label: '🏟️ Real Stadium' },
              { id: 'skyfence', label: '⚡ GCDIS Cage' },
              { id: 'lab', label: '🏢 Flight Lab' },
            ].map((arena) => (
              <button
                key={arena.id}
                onClick={() => setArenaType(arena.id as ArenaType)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  arenaType === arena.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to ${arena.label}`}
              >
                {arena.label}
              </button>
            ))}
          </div>

          {/* Class 40 vs Class 20 */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setArenaClass('class40')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                arenaClass === 'class40' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Class 40 (16m)
            </button>
            <button
              onClick={() => setArenaClass('class20')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                arenaClass === 'class20' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Class 20 (8m)
            </button>
          </div>

          {/* Match Mode (3v3, 1v1, Solo) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            {[
              { id: 'team3v3', label: '⚽ 3v3 Match' },
              { id: 'duel1v1', label: '🥊 1v1 Duel' },
              { id: 'solo', label: '🎯 Solo' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMatchMode(m.id as typeof matchMode)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  matchMode === m.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              !isAudioMuted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Engine & Arena Audio"
          >
            <span>{!isAudioMuted ? '🔊' : '🔇'}</span>
            <span className="hidden xs:inline">{!isAudioMuted ? 'Audio On' : 'Muted'}</span>
          </button>

          {/* Real Arena Photo Reference */}
          <button
            onClick={() => setShowArenaPhotoModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="View Real Galgotias Arena Photographs"
          >
            <span>📷</span>
            <span className="hidden sm:inline">Photos</span>
          </button>
        </div>
      </div>

      {/* Main 3D Simulation Container */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col lg:flex-row gap-4 items-stretch min-h-[580px] lg:min-h-[640px]">
        {/* Left Column: 3D Viewport & HUD Overlay */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl min-h-[420px] lg:min-h-[580px] flex flex-col">
          {/* Top In-Canvas HUD: Match Score, Drill Timer, Camera Switches */}
          <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-2">
            {/* Score & Offside Status */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg">
              <div className="text-xs font-mono font-bold flex items-center gap-2">
                <span className="text-blue-400 font-black">BLUE {matchScore.blue}</span>
                <span className="text-slate-600">·</span>
                <span className="text-red-400 font-black">RED {matchScore.red}</span>
              </div>
              {isDrillRunning && (
                <div className="border-l border-slate-800 pl-2 text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{drillTimeRemaining}s</span>
                </div>
              )}
            </div>

            {/* Camera Perspective Mode Buttons */}
            <div className="pointer-events-auto flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-1 text-[11px] font-mono shadow-lg">
              {[
                { id: 'chase', label: 'Follow', icon: '🎥' },
                { id: 'fpv', label: 'FPV Cockpit', icon: '🎯' },
                { id: 'pilot', label: 'Pilot Stand', icon: '🧍' },
                { id: 'referee', label: 'Referee View', icon: '🏟️' },
                { id: 'orbit', label: 'Free Orbit', icon: '🔄' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCameraMode(c.id as CameraViewMode)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    cameraMode === c.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${c.label} Camera`}
                >
                  <span>{c.icon}</span>
                  <span className="hidden sm:inline">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry OSD Overlay (Bottom of Viewport) */}
          <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none flex flex-wrap items-end justify-between gap-2">
            {/* OSD Telemetry Chips */}
            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-3 text-slate-300 shadow-lg pointer-events-auto">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">ALT:</span>
                <span className="text-emerald-400 font-bold">{telemetry.altitude}m</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">SPD:</span>
                <span className="text-cyan-400 font-bold">{telemetry.speedKmh} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">BATT:</span>
                <span className="text-amber-400 font-bold">{telemetry.batteryVoltage}V</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">MODE:</span>
                <span className="text-white font-bold uppercase">{telemetry.flightMode}</span>
              </div>
            </div>

            {/* Flight Mode Quick Selector */}
            <div className="pointer-events-auto flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 text-[11px] font-mono shadow-lg">
              {(['angle', 'alt_hold', 'acro'] as FlightMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleFlightModeChange(mode)}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all ${
                    telemetry.flightMode === mode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={
                    mode === 'angle'
                      ? 'Angle Mode (Self-Leveling)'
                      : mode === 'alt_hold'
                      ? 'Altitude Hold (Hover Assist)'
                      : 'Acro Mode (Full Rate 3D)'
                  }
                >
                  {mode === 'alt_hold' ? 'Alt-Hold' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Three.js 3D WebGL Canvas */}
          <div className="w-full h-full min-h-[420px] flex-1">
            <PracticeArenaCanvas
              cameraMode={cameraMode}
              drillMode={drillMode}
              arenaClass={arenaClass}
              arenaType={arenaType}
              matchMode={matchMode}
              activeDroneId={activeDroneId}
              strikerColor={strikerColor}
              onGoalScored={handleGoalScored}
              onTelemetryUpdate={setTelemetry}
              drillTimerSeconds={drillTimeRemaining}
              isDrillRunning={isDrillRunning}
              resetTrigger={resetTrigger}
            />
          </div>
        </div>

        {/* Right Column: Transmitter Sticks & Drill Control Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-3">
          {/* 1. Dual Gimbal Transmitter Visualizer */}
          <TransmitterGimbalVisualizer
            telemetry={telemetry}
            onArmToggle={handleArmToggle}
            onResetDrone={handleResetDrone}
          />

          {/* 2. Active Drone Soccer Selector (Multi-Drone Pilot Switcher) */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 text-white shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>🎮</span>
                <span>PILOT DRONE SOCCER BALL</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {matchMode === 'team3v3' ? '3v3 SQUAD' : matchMode === 'duel1v1' ? '1v1 DUEL' : 'SOLO'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setActiveDroneId('blue_striker')}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                  activeDroneId === 'blue_striker'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Blue Striker</span>
                </div>
                <div className="text-[10px] text-blue-300/80">Goal Hunter (You)</div>
              </button>

              <button
                onClick={() => setActiveDroneId('blue_keeper')}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                  activeDroneId === 'blue_keeper'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Blue Goalie</span>
                </div>
                <div className="text-[10px] text-slate-400">Goal Hoop Guard</div>
              </button>

              <button
                onClick={() => setActiveDroneId('red_striker')}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                  activeDroneId === 'red_striker'
                    ? 'bg-red-600/30 border-red-400 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Red Striker</span>
                </div>
                <div className="text-[10px] text-red-300/80">Opponent Ace</div>
              </button>

              <button
                onClick={() => setActiveDroneId('red_keeper')}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                  activeDroneId === 'red_keeper'
                    ? 'bg-red-600/30 border-red-400 text-white shadow-sm ring-1 ring-red-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Red Goalie</span>
                </div>
                <div className="text-[10px] text-slate-400">Hoop Deflector</div>
              </button>
            </div>
          </div>

          {/* 3. Practice Drills & Game Modes */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>🎯</span>
                <span>PRACTICE DRILLS</span>
              </h3>
              {highScore > 0 && (
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  BEST: {highScore} GOALS
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Free Flight */}
              <button
                onClick={() => handleStartDrill('free')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  drillMode === 'free'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Free Flight</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Explore full cage &amp; landing pads</div>
              </button>

              {/* 60s Striker Rush */}
              <button
                onClick={() => handleStartDrill('rush60')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  drillMode === 'rush60'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">60s Striker Rush</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Score goals with offside rules</div>
              </button>

              {/* 5s Penalty Kick */}
              <button
                onClick={() => handleStartDrill('penalty5s')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  drillMode === 'penalty5s'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">5s Penalty Sim</div>
                <div className="text-[10px] text-slate-400 mt-0.5">1-on-1 vs moving AI Keeper</div>
              </button>

              {/* Slalom Gate Course */}
              <button
                onClick={() => handleStartDrill('slalom')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  drillMode === 'slalom'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">Gate Slalom</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Precision ring gate navigation</div>
              </button>
            </div>
          </div>

          {/* 3. GCDIS 7-Color LED Role Customizer */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 text-white shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>💡</span>
                <span>GCDIS 7-COLOR ROLE LED</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">{strikerColor}</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {[
                { id: 'red', name: 'Striker Red', bg: 'bg-red-500' },
                { id: 'blue', name: 'Striker Blue', bg: 'bg-blue-500' },
                { id: 'green', name: 'Keeper Green', bg: 'bg-emerald-500' },
                { id: 'yellow', name: 'Defender Yellow', bg: 'bg-yellow-400' },
                { id: 'cyan', name: 'Guide Cyan', bg: 'bg-cyan-400' },
                { id: 'magenta', name: 'Pivot Magenta', bg: 'bg-pink-500' },
                { id: 'white', name: 'Neutral White', bg: 'bg-white' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setStrikerColor(c.id as typeof strikerColor)}
                  className={`h-7 rounded-lg transition-transform ${c.bg} ${
                    strikerColor === c.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 4. Flight Specs Cheat Sheet */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 text-slate-400 text-[11px] font-mono shadow-xl space-y-1.5">
            <div className="text-white font-bold flex justify-between">
              <span>ARENA SPECS</span>
              <span className="text-emerald-400">{arenaClass.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Length × Width:</span>
              <span className="text-slate-200">{arenaClass === 'class40' ? '16m × 8m' : '8m × 4m'}</span>
            </div>
            <div className="flex justify-between">
              <span>Goal Elevation:</span>
              <span className="text-slate-200">{arenaClass === 'class40' ? '3.2 meters' : '2.0 meters'}</span>
            </div>
            <div className="flex justify-between">
              <span>Goal Hoop Diameter:</span>
              <span className="text-slate-200">{arenaClass === 'class40' ? '60cm ID' : '30cm ID'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Result Modal */}
      {drillResultModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="text-4xl">🏆</div>
            <h3 className="font-sans font-black text-xl uppercase tracking-tight text-white">
              {drillResultModal}
            </h3>
            <p className="text-slate-400 text-xs">
              Great flight practice! Ready for the official Galgotias Drone Soccer League Championship arena.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStartDrill(drillMode)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-sans font-bold text-xs uppercase tracking-wider text-white transition-colors"
              >
                Retry Drill
              </button>
              <button
                onClick={() => setDrillResultModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-sans font-bold text-xs uppercase tracking-wider text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Arena Photo Modal */}
      {showArenaPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GcdisLogo size="sm" showWordmark={false} />
                <div>
                  <h3 className="font-sans font-black text-base uppercase">
                    Galgotias Drone Soccer League Arena Reference
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Indoor Sports Arena &amp; Proving Ground · Greater Noida, Uttar Pradesh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowArenaPhotoModal(false)}
                className="text-slate-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                  <img
                    src="/drone-lab.jpg"
                    alt="Galgotias Drone Arena Cage"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-bold text-slate-200">Main Flight Arena &amp; Skyfence Cage</div>
                <div className="text-[11px] text-slate-400">
                  Full 16m × 8m enclosure with high-tension netting, suspended toroidal goals, and overhead lighting rigs.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                  <img
                    src="/bg.jpg"
                    alt="Galgotias Drone Soccer Arena Flight Lab"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-bold text-slate-200">Pilot Dugout &amp; Pitch Surface</div>
                <div className="text-[11px] text-slate-400">
                  Dual pilot control zones behind the short wall netting, high-visibility GCDIS markings and takeoff pads.
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
              <div className="text-emerald-400 font-bold uppercase">
                GCDIS 5th Revision Technical Specifications Summary:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Class 40: 16m long × 8m wide × 4.5m ceiling with 60cm inner goal hoop at 3.2m height.</li>
                <li>Class 20: 8m long × 4m wide × 3m ceiling with 30cm inner goal hoop at 2.0m height.</li>
                <li>Offside Rule: Striker entering opponent half must clear back behind the center half line.</li>
                <li>USB/Bluetooth RC Radio: Fully calibrated for EdgeTX, OpenTX, BetaFPV, DJI, and standard gamepads.</li>
              </ul>
            </div>

            <button
              onClick={() => setShowArenaPhotoModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-white transition-colors"
            >
              Back to Flight Simulator
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
