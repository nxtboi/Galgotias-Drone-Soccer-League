import React, { useState, useEffect, useRef } from 'react';
import {
  transmitter,
  TransmitterChannels,
  RADIO_PROFILES,
  TransmitterStickMode,
} from '../../utils/transmitterManager';

export interface TransmitterGimbalVisualizerProps {
  telemetry: {
    throttlePct: number;
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
    armed: boolean;
  };
  onArmToggle: () => void;
  onResetDrone: () => void;
}

export const TransmitterGimbalVisualizer: React.FC<TransmitterGimbalVisualizerProps> = ({
  telemetry,
  onArmToggle,
  onResetDrone,
}) => {
  const [channels, setChannels] = useState<TransmitterChannels>({
    throttle: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    armed: true,
    flightMode: 'angle',
    rawAxes: [],
    connectedDevice: null,
    isGamepadActive: false,
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [detectingChannel, setDetectingChannel] = useState<'throttle' | 'pitch' | 'roll' | 'yaw' | null>(null);
  const baselineAxesRef = useRef<number[]>([]);

  const settings = transmitter.getSettings();

  // Poll loop for live UI stick updates
  useEffect(() => {
    let animId: number;
    const update = () => {
      const ch = transmitter.poll(0.016);
      setChannels(ch);

      // Auto-detection logic when user clicks "Detect" on a channel
      if (detectingChannel && ch.rawAxes.length > 0) {
        if (baselineAxesRef.current.length === 0) {
          baselineAxesRef.current = [...ch.rawAxes];
        } else {
          for (let i = 0; i < ch.rawAxes.length; i++) {
            const base = baselineAxesRef.current[i] ?? 0;
            const current = ch.rawAxes[i] ?? 0;
            const delta = current - base;
            if (Math.abs(delta) > 0.35) {
              // Detected axis i moving!
              if (detectingChannel === 'throttle') {
                // If moved positive, likely inverted or RC radio
                transmitter.updateSettings({ throttleAxis: i, invertThrottle: delta > 0 });
              } else if (detectingChannel === 'pitch') {
                transmitter.updateSettings({ pitchAxis: i, invertPitch: delta > 0 });
              } else if (detectingChannel === 'roll') {
                transmitter.updateSettings({ rollAxis: i, invertRoll: delta < 0 });
              } else if (detectingChannel === 'yaw') {
                transmitter.updateSettings({ yawAxis: i, invertYaw: delta < 0 });
              }
              setDetectingChannel(null);
              baselineAxesRef.current = [];
              break;
            }
          }
        }
      }

      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [detectingChannel]);

  // Touch gimbals drag handlers for mobile & mouse
  const leftGimbalRef = useRef<HTMLDivElement>(null);
  const rightGimbalRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  const handleTouchLeft = (e: React.TouchEvent | React.MouseEvent) => {
    if (!leftGimbalRef.current) return;
    const rect = leftGimbalRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const normX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, 1 - ((clientY - rect.top) / rect.height) * 2)); // Up = positive

    if (settings.stickMode === 'mode2') {
      transmitter.setVirtualSticks({ x: normX, y: normY }, { x: channels.roll, y: channels.pitch });
    } else {
      // Mode 1: Left has Pitch & Yaw
      transmitter.setVirtualSticks({ x: normX, y: normY }, { x: channels.roll, y: channels.throttle * 2 - 1 });
    }
  };

  const handleTouchRight = (e: React.TouchEvent | React.MouseEvent) => {
    if (!rightGimbalRef.current) return;
    const rect = rightGimbalRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const normX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, 1 - ((clientY - rect.top) / rect.height) * 2));

    if (settings.stickMode === 'mode2') {
      transmitter.setVirtualSticks({ x: channels.yaw, y: channels.throttle * 2 - 1 }, { x: normX, y: normY });
    } else {
      // Mode 1: Right has Throttle & Roll
      transmitter.setVirtualSticks({ x: channels.yaw, y: channels.pitch }, { x: normX, y: normY });
    }
  };

  const handleTouchEnd = () => {
    transmitter.setVirtualSticks({ x: 0, y: 0 }, { x: 0, y: 0 });
  };

  const isMode2 = settings.stickMode === 'mode2';

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-white shadow-xl">
      {/* Top Header: Transmitter Status & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                channels.isGamepadActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              {channels.isGamepadActive ? 'RC Transmitter Connected' : 'Keyboard / Touch Gimbals'}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-[280px]">
              {channels.connectedDevice || 'W/S: Thr · A/D: Yaw · Up/Down: Pitch · Left/Right: Roll'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Arm / Disarm Toggle */}
          <button
            onClick={onArmToggle}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              channels.armed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
            }`}
            title="Arm / Disarm Motors (Key: X)"
          >
            {channels.armed ? 'ARMED' : 'DISARMED'}
          </button>

          {/* Reset Position */}
          <button
            onClick={onResetDrone}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold transition-colors cursor-pointer"
            title="Reset Drone to Kickoff Position"
          >
            RESET
          </button>

          {/* Config Settings Modal Button */}
          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Transmitter Calibration & Channel Assignment"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Dual Stick Gimbals (Respects Mode 2 vs Mode 1) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Stick */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between w-full px-1">
            <span>LEFT STICK</span>
            {isMode2 ? (
              <span className="text-emerald-400 font-bold">THR: {Math.round(channels.throttle * 100)}%</span>
            ) : (
              <span className="text-cyan-400 font-bold">PITCH: {Math.round(channels.pitch * 100)}%</span>
            )}
          </div>

          <div
            ref={leftGimbalRef}
            onMouseDown={(e) => {
              isDraggingLeft.current = true;
              handleTouchLeft(e);
            }}
            onMouseMove={(e) => {
              if (isDraggingLeft.current) handleTouchLeft(e);
            }}
            onMouseUp={() => {
              isDraggingLeft.current = false;
              handleTouchEnd();
            }}
            onTouchStart={handleTouchLeft}
            onTouchMove={handleTouchLeft}
            onTouchEnd={handleTouchEnd}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center overflow-hidden cursor-crosshair shadow-inner"
          >
            {/* Gimbal Center Crosshair Axes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-slate-800" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-[1px] bg-slate-800" />
            </div>
            <div className="absolute inset-4 border border-dashed border-slate-800 rounded-full pointer-events-none" />

            {/* Moving Stick Handle Dot */}
            <div
              className={`absolute w-5 h-5 rounded-full border border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-none ${
                isMode2
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-300'
                  : 'bg-gradient-to-tr from-cyan-500 to-blue-400'
              }`}
              style={{
                left: `${50 + channels.yaw * 40}%`,
                top: isMode2
                  ? `${90 - channels.throttle * 80}%` // Mode 2: Throttle 0 is at bottom (90%), 1 is at top (10%)
                  : `${50 - channels.pitch * 40}%`,   // Mode 1: Pitch centered
              }}
            />
          </div>

          <div className="text-[9px] font-mono text-slate-400 mt-1 flex justify-between w-full px-2">
            <span>YAW: {Math.round(channels.yaw * 100)}%</span>
            <span className="text-slate-500 font-bold">{isMode2 ? 'THR / YAW' : 'PITCH / YAW'}</span>
          </div>
        </div>

        {/* Right Stick */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between w-full px-1">
            <span>RIGHT STICK</span>
            {isMode2 ? (
              <span className="text-cyan-400 font-bold">PITCH: {Math.round(channels.pitch * 100)}%</span>
            ) : (
              <span className="text-emerald-400 font-bold">THR: {Math.round(channels.throttle * 100)}%</span>
            )}
          </div>

          <div
            ref={rightGimbalRef}
            onMouseDown={(e) => {
              isDraggingRight.current = true;
              handleTouchRight(e);
            }}
            onMouseMove={(e) => {
              if (isDraggingRight.current) handleTouchRight(e);
            }}
            onMouseUp={() => {
              isDraggingRight.current = false;
              handleTouchEnd();
            }}
            onTouchStart={handleTouchRight}
            onTouchMove={handleTouchRight}
            onTouchEnd={handleTouchEnd}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center overflow-hidden cursor-crosshair shadow-inner"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-slate-800" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-full w-[1px] bg-slate-800" />
            </div>
            <div className="absolute inset-4 border border-dashed border-slate-800 rounded-full pointer-events-none" />

            {/* Moving Stick Handle Dot */}
            <div
              className={`absolute w-5 h-5 rounded-full border border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-none ${
                isMode2
                  ? 'bg-gradient-to-tr from-cyan-500 to-blue-400'
                  : 'bg-gradient-to-tr from-emerald-500 to-teal-300'
              }`}
              style={{
                left: `${50 + channels.roll * 40}%`,
                top: isMode2
                  ? `${50 - channels.pitch * 40}%`    // Mode 2: Pitch centered (top = fwd)
                  : `${90 - channels.throttle * 80}%`, // Mode 1: Throttle
              }}
            />
          </div>

          <div className="text-[9px] font-mono text-slate-400 mt-1 flex justify-between w-full px-2">
            <span>ROLL: {Math.round(channels.roll * 100)}%</span>
            <span className="text-slate-500 font-bold">{isMode2 ? 'PITCH / ROLL' : 'THR / ROLL'}</span>
          </div>
        </div>
      </div>

      {/* Transmitter Configuration & Calibration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-4 sm:p-5 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <div>
                  <h3 className="font-sans font-black text-sm sm:text-base uppercase">Transmitter &amp; Radio Config</h3>
                  <div className="text-[10px] text-slate-400">RC Stick Mode, Channel Mapping &amp; Axis Calibration</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setDetectingChannel(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Listening Banner for Auto-Detection */}
            {detectingChannel && (
              <div className="p-3 bg-blue-500/20 border border-blue-500 rounded-xl text-center space-y-1 animate-pulse">
                <div className="text-xs font-bold text-blue-300 uppercase">
                  Listening for {detectingChannel.toUpperCase()} Stick Movement...
                </div>
                <div className="text-[11px] text-blue-200">
                  Deflect your physical transmitter&apos;s <strong>{detectingChannel.toUpperCase()}</strong> stick fully up/down or left/right.
                </div>
                <button
                  onClick={() => setDetectingChannel(null)}
                  className="mt-1 text-[10px] px-2 py-0.5 bg-slate-800 rounded border border-slate-600 text-slate-300"
                >
                  Cancel Detection
                </button>
              </div>
            )}

            {/* Radio Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-slate-300">
                Radio Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(RADIO_PROFILES).map(([key, prof]) => (
                  <button
                    key={key}
                    onClick={() => transmitter.setRadioProfile(key as keyof typeof RADIO_PROFILES)}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500 text-left transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white">{prof.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{prof.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stick Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-slate-300">
                Stick Mode
              </label>
              <div className="flex gap-2">
                {(['mode2', 'mode1'] as TransmitterStickMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => transmitter.updateSettings({ stickMode: mode })}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                      settings.stickMode === mode
                        ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {mode === 'mode2' ? 'Mode 2 (Throttle Left)' : 'Mode 1 (Throttle Right)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Mapping & Axis Assignment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-300">
                  Channel Mapping &amp; Inversion
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Assigned Axis Index</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {/* Throttle */}
                <div className="p-2 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white w-20">Throttle:</span>
                    <select
                      value={settings.throttleAxis}
                      onChange={(e) => transmitter.updateSettings({ throttleAxis: parseInt(e.target.value, 10) })}
                      className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((chIdx) => (
                        <option key={chIdx} value={chIdx}>Axis {chIdx} (Ch{chIdx + 1})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.invertThrottle}
                        onChange={(e) => transmitter.updateSettings({ invertThrottle: e.target.checked })}
                      />
                      <span>Invert</span>
                    </label>
                    <button
                      onClick={() => setDetectingChannel('throttle')}
                      className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 border border-blue-500/50 text-blue-200 text-[10px] font-bold cursor-pointer"
                    >
                      Detect
                    </button>
                  </div>
                </div>

                {/* Pitch */}
                <div className="p-2 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-bold text-white w-20">Pitch:</span>
                    <select
                      value={settings.pitchAxis}
                      onChange={(e) => transmitter.updateSettings({ pitchAxis: parseInt(e.target.value, 10) })}
                      className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((chIdx) => (
                        <option key={chIdx} value={chIdx}>Axis {chIdx} (Ch{chIdx + 1})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.invertPitch}
                        onChange={(e) => transmitter.updateSettings({ invertPitch: e.target.checked })}
                      />
                      <span>Invert</span>
                    </label>
                    <button
                      onClick={() => setDetectingChannel('pitch')}
                      className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 border border-blue-500/50 text-blue-200 text-[10px] font-bold cursor-pointer"
                    >
                      Detect
                    </button>
                  </div>
                </div>

                {/* Roll */}
                <div className="p-2 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-bold text-white w-20">Roll:</span>
                    <select
                      value={settings.rollAxis}
                      onChange={(e) => transmitter.updateSettings({ rollAxis: parseInt(e.target.value, 10) })}
                      className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((chIdx) => (
                        <option key={chIdx} value={chIdx}>Axis {chIdx} (Ch{chIdx + 1})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.invertRoll}
                        onChange={(e) => transmitter.updateSettings({ invertRoll: e.target.checked })}
                      />
                      <span>Invert</span>
                    </label>
                    <button
                      onClick={() => setDetectingChannel('roll')}
                      className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 border border-blue-500/50 text-blue-200 text-[10px] font-bold cursor-pointer"
                    >
                      Detect
                    </button>
                  </div>
                </div>

                {/* Yaw */}
                <div className="p-2 bg-slate-800/70 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-white w-20">Yaw:</span>
                    <select
                      value={settings.yawAxis}
                      onChange={(e) => transmitter.updateSettings({ yawAxis: parseInt(e.target.value, 10) })}
                      className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-slate-200"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((chIdx) => (
                        <option key={chIdx} value={chIdx}>Axis {chIdx} (Ch{chIdx + 1})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.invertYaw}
                        onChange={(e) => transmitter.updateSettings({ invertYaw: e.target.checked })}
                      />
                      <span>Invert</span>
                    </label>
                    <button
                      onClick={() => setDetectingChannel('yaw')}
                      className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 border border-blue-500/50 text-blue-200 text-[10px] font-bold cursor-pointer"
                    >
                      Detect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Deflection Monitor */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                Live Channel Output Monitor
              </div>
              <div className="space-y-1.5 text-[11px] font-mono">
                {/* Throttle bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Throttle</span>
                    <span className="text-emerald-400 font-bold">{Math.round(channels.throttle * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${channels.throttle * 100}%` }}
                    />
                  </div>
                </div>

                {/* Pitch bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Pitch</span>
                    <span className="text-cyan-400 font-bold">{Math.round(channels.pitch * 100)}%</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-cyan-400 transition-all duration-75"
                      style={{
                        left: channels.pitch >= 0 ? '50%' : `${50 + channels.pitch * 50}%`,
                        width: `${Math.abs(channels.pitch) * 50}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Roll bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Roll</span>
                    <span className="text-blue-400 font-bold">{Math.round(channels.roll * 100)}%</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-blue-400 transition-all duration-75"
                      style={{
                        left: channels.roll >= 0 ? '50%' : `${50 + channels.roll * 50}%`,
                        width: `${Math.abs(channels.roll) * 50}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Yaw bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Yaw</span>
                    <span className="text-amber-400 font-bold">{Math.round(channels.yaw * 100)}%</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 bg-amber-400 transition-all duration-75"
                      style={{
                        left: channels.yaw >= 0 ? '50%' : `${50 + channels.yaw * 50}%`,
                        width: `${Math.abs(channels.yaw) * 50}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expo & Deadband Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Stick Expo (Smooth Center)</span>
                  <span>{Math.round(settings.expo * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={settings.expo}
                  onChange={(e) => transmitter.updateSettings({ expo: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Stick Deadband</span>
                  <span>{Math.round(settings.deadband * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={settings.deadband}
                  onChange={(e) => transmitter.updateSettings({ deadband: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowConfigModal(false);
                setDetectingChannel(null);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Done &amp; Save Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
