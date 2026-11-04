// Transmitter & Gamepad Input Manager for RC Drone Soccer Pilots

export type TransmitterStickMode = 'mode2' | 'mode1';
export type FlightMode = 'angle' | 'acro' | 'alt_hold';

export interface TransmitterChannels {
  throttle: number; // 0 to 1 (0 = cut/idle, 1 = max thrust)
  yaw: number;      // -1 to 1 (negative = turn left/CCW, positive = turn right/CW)
  pitch: number;    // -1 to 1 (negative = pitch backward/nose up, positive = pitch forward/nose down)
  roll: number;     // -1 to 1 (negative = roll left/bank left, positive = roll right/bank right)
  armed: boolean;
  flightMode: FlightMode;
  rawAxes: number[];
  connectedDevice: string | null;
  isGamepadActive: boolean;
}

export interface TransmitterSettings {
  stickMode: TransmitterStickMode;
  throttleAxis: number;
  invertThrottle: boolean;
  yawAxis: number;
  invertYaw: boolean;
  pitchAxis: number;
  invertPitch: boolean;
  rollAxis: number;
  invertRoll: boolean;
  deadband: number;
  expo: number;
  armButton: number;
  flightModeButton: number;
}

export const DEFAULT_TRANSMITTER_SETTINGS: TransmitterSettings = {
  stickMode: 'mode2',
  throttleAxis: 1,      // Left Stick Vertical on Gamepad (Mode 2)
  invertThrottle: false,// Default Gamepad: stick UP (-1.0) -> 100% throttle; stick DOWN (+1.0) -> 0% throttle
  yawAxis: 0,           // Left Stick Horizontal on Gamepad
  invertYaw: false,     // Stick RIGHT (+1.0) -> yaw right (+1.0)
  pitchAxis: 3,         // Right Stick Vertical on Gamepad
  invertPitch: false,   // Default Gamepad: stick UP (-1.0) -> pitch forward (+1.0); stick DOWN (+1.0) -> pitch back (-1.0)
  rollAxis: 2,          // Right Stick Horizontal on Gamepad
  invertRoll: false,    // Stick RIGHT (+1.0) -> roll right (+1.0)
  deadband: 0.04,
  expo: 0.22,
  armButton: 0,
  flightModeButton: 1,
};

// Preset Radio profiles
export interface RadioProfile {
  name: string;
  description: string;
  settings: Partial<TransmitterSettings>;
}

export const RADIO_PROFILES: Record<string, RadioProfile> = {
  genericGamepad: {
    name: 'Xbox / PlayStation / Gamepad (Mode 2)',
    description: 'Left: Throttle (Y) & Yaw (X) · Right: Pitch (Y) & Roll (X)',
    settings: {
      stickMode: 'mode2',
      throttleAxis: 1,
      invertThrottle: false, // Up is -1 -> (1 - (-1))/2 = 1.0 (Full Thr)
      yawAxis: 0,
      invertYaw: false,      // Right is +1 -> +1.0
      pitchAxis: 3,
      invertPitch: false,    // Up is -1 -> -(-1) = +1.0 (Pitch Fwd)
      rollAxis: 2,
      invertRoll: false,     // Right is +1 -> +1.0 (Roll Right)
    },
  },
  radiomasterAetr: {
    name: 'RadioMaster / EdgeTX / OpenTX (AETR)',
    description: 'Standard USB Joystick: Ch1: Roll, Ch2: Pitch, Ch3: Throttle, Ch4: Yaw',
    settings: {
      stickMode: 'mode2',
      throttleAxis: 2,       // Channel 3 = Throttle (Axis 2)
      invertThrottle: true,  // Throttle at top is +1 -> (1 + 1)/2 = 1.0
      yawAxis: 3,            // Channel 4 = Yaw (Axis 3)
      invertYaw: false,      // Yaw right is +1 -> +1.0
      pitchAxis: 1,          // Channel 2 = Pitch (Axis 1)
      invertPitch: true,     // Pitch forward is +1 -> +1.0
      rollAxis: 0,           // Channel 1 = Roll (Axis 0)
      invertRoll: false,     // Roll right is +1 -> +1.0
    },
  },
  radiomasterTaer: {
    name: 'Spektrum / EdgeTX / Horizon (TAER)',
    description: 'Standard TAER order: Ch1: Throttle, Ch2: Aileron, Ch3: Elevator, Ch4: Rudder',
    settings: {
      stickMode: 'mode2',
      throttleAxis: 0,       // Channel 1 = Throttle
      invertThrottle: true,
      yawAxis: 3,            // Channel 4 = Yaw
      invertYaw: false,
      pitchAxis: 2,          // Channel 3 = Pitch
      invertPitch: true,
      rollAxis: 1,          // Channel 2 = Roll
      invertRoll: false,
    },
  },
  betafpv: {
    name: 'BETAFPV LiteRadio / FrSky USB',
    description: 'Direct 4-Channel stick mapping for LiteRadio 2/3/SE',
    settings: {
      stickMode: 'mode2',
      throttleAxis: 1,
      invertThrottle: true,
      yawAxis: 0,
      invertYaw: false,
      pitchAxis: 3,
      invertPitch: true,
      rollAxis: 2,
      invertRoll: false,
    },
  },
  djiRemote: {
    name: 'DJI FPV Remote Controller 2 / 3',
    description: 'DJI standard gamepad mapping with Mode 2 gimbals',
    settings: {
      stickMode: 'mode2',
      throttleAxis: 1,
      invertThrottle: false,
      yawAxis: 0,
      invertYaw: false,
      pitchAxis: 3,
      invertPitch: false,
      rollAxis: 2,
      invertRoll: false,
    },
  },
};

export class TransmitterManager {
  private settings: TransmitterSettings = { ...DEFAULT_TRANSMITTER_SETTINGS };
  private keyboardState: Record<string, boolean> = {};
  private virtualStickLeft = { x: 0, y: 0 };
  private virtualStickRight = { x: 0, y: 0 };
  private keyboardThrottle: number = 0;
  private isArmed: boolean = true;
  private currentFlightMode: FlightMode = 'angle';

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    this.keyboardState[e.code] = true;

    // Cycle flight mode
    if (e.code === 'KeyM') {
      if (this.currentFlightMode === 'angle') this.currentFlightMode = 'alt_hold';
      else if (this.currentFlightMode === 'alt_hold') this.currentFlightMode = 'acro';
      else this.currentFlightMode = 'angle';
    }
    // Arm / Disarm toggle
    if (e.code === 'KeyX') {
      this.isArmed = !this.isArmed;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keyboardState[e.code] = false;
  };

  public getSettings(): TransmitterSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<TransmitterSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  public setRadioProfile(profileKey: keyof typeof RADIO_PROFILES) {
    const profile = RADIO_PROFILES[profileKey];
    if (profile) {
      this.settings = { ...this.settings, ...profile.settings };
      this.saveSettings();
    }
  }

  public setFlightMode(mode: FlightMode) {
    this.currentFlightMode = mode;
  }

  public setArmed(armed: boolean) {
    this.isArmed = armed;
  }

  public setVirtualSticks(left: { x: number; y: number }, right: { x: number; y: number }) {
    this.virtualStickLeft = left;
    this.virtualStickRight = right;
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('gdsl_transmitter_settings_v2');
      if (saved) {
        this.settings = { ...DEFAULT_TRANSMITTER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('gdsl_transmitter_settings_v2', JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
  }

  private applyExpo(val: number, expo: number): number {
    return (1 - expo) * val + expo * Math.pow(val, 3);
  }

  private applyDeadband(val: number, deadband: number): number {
    if (Math.abs(val) < deadband) return 0;
    const sign = val > 0 ? 1 : -1;
    return sign * ((Math.abs(val) - deadband) / (1 - deadband));
  }

  // Poll current controller state and merge with keyboard/touch
  public poll(deltaTimeSec: number = 0.016): TransmitterChannels {
    let connectedDevice: string | null = null;
    let isGamepadActive = false;
    let rawAxes: number[] = [];

    let rawThrottle = 0;
    let rawYaw = 0;
    let rawPitch = 0;
    let rawRoll = 0;

    // Check Web Gamepad API
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          connectedDevice = gp.id;
          isGamepadActive = true;
          rawAxes = Array.from(gp.axes);

          // Handle Mode 1 vs Mode 2 axis assignment
          let effectiveThrAxis = this.settings.throttleAxis;
          let effectivePitchAxis = this.settings.pitchAxis;
          if (this.settings.stickMode === 'mode1') {
            // Mode 1: Pitch on left vertical, Throttle on right vertical
            effectiveThrAxis = this.settings.pitchAxis;
            effectivePitchAxis = this.settings.throttleAxis;
          }

          const axisT = rawAxes[effectiveThrAxis] ?? 0;
          const axisY = rawAxes[this.settings.yawAxis] ?? 0;
          const axisP = rawAxes[effectivePitchAxis] ?? 0;
          const axisR = rawAxes[this.settings.rollAxis] ?? 0;

          // Process Throttle (0 to 1)
          // Gamepad: Stick UP is -1.0, Stick DOWN is +1.0 -> (1 - axisT) / 2
          // RC Transmitters: Stick UP is +1.0, Stick DOWN is -1.0 -> (axisT + 1) / 2
          const computedThrottle = this.settings.invertThrottle
            ? (axisT + 1) / 2
            : (1 - axisT) / 2;
          rawThrottle = Math.max(0, Math.min(1, computedThrottle));

          // Process Pitch (-1 = backward / nose up, +1 = forward / nose down)
          // Gamepad: Stick UP is -1.0, Stick DOWN is +1.0 -> -axisP gives +1.0 on UP
          // RC Transmitters (with invertPitch): Stick UP is +1.0 -> +axisP gives +1.0 on UP
          const computedPitch = this.settings.invertPitch ? axisP : -axisP;
          rawPitch = this.applyDeadband(computedPitch, this.settings.deadband);

          // Process Roll (-1 = roll left, +1 = roll right)
          // Stick RIGHT is +1.0 -> +axisR gives +1.0
          const computedRoll = this.settings.invertRoll ? -axisR : axisR;
          rawRoll = this.applyDeadband(computedRoll, this.settings.deadband);

          // Process Yaw (-1 = yaw left, +1 = yaw right)
          // Stick RIGHT is +1.0 -> +axisY gives +1.0
          const computedYaw = this.settings.invertYaw ? -axisY : axisY;
          rawYaw = this.applyDeadband(computedYaw, this.settings.deadband);

          // Check arm button if pressed
          if (gp.buttons[this.settings.armButton]?.pressed) {
            this.isArmed = true;
          }
          break;
        }
      }
    }

    // Keyboard Fallback / Overlay if no physical stick deflection
    const kb = this.keyboardState;
    const kbActive =
      kb['KeyW'] || kb['KeyS'] || kb['KeyA'] || kb['KeyD'] ||
      kb['ArrowUp'] || kb['ArrowDown'] || kb['ArrowLeft'] || kb['ArrowRight'] ||
      kb['KeyI'] || kb['KeyK'] || kb['KeyJ'] || kb['KeyL'] ||
      kb['Space'] || kb['ShiftLeft'];

    if (kbActive || !isGamepadActive) {
      // Keyboard Throttle: W/S or Space/Shift
      const throttleSpeed = 1.35 * deltaTimeSec;
      if (kb['KeyW'] || kb['Space']) {
        this.keyboardThrottle = Math.min(1, this.keyboardThrottle + throttleSpeed);
      } else if (kb['KeyS'] || kb['ShiftLeft']) {
        this.keyboardThrottle = Math.max(0, this.keyboardThrottle - throttleSpeed * 1.5);
      }

      // If alt-hold mode and no throttle pressed, keep hover level (~0.5)
      if (this.currentFlightMode === 'alt_hold' && !kb['KeyW'] && !kb['KeyS'] && !kb['Space']) {
        this.keyboardThrottle = 0.5;
      }

      // Keyboard Yaw: A/D or Q/E (A/Q = turn left -1, D/E = turn right +1)
      let kbYaw = 0;
      if (kb['KeyD'] || kb['KeyE']) kbYaw += 1;
      if (kb['KeyA'] || kb['KeyQ']) kbYaw -= 1;

      // Keyboard Pitch: ArrowUp/ArrowDown or I/K (Up/I = pitch forward +1, Down/K = pitch backward -1)
      let kbPitch = 0;
      if (kb['ArrowUp'] || kb['KeyI']) kbPitch += 1;
      if (kb['ArrowDown'] || kb['KeyK']) kbPitch -= 1;

      // Keyboard Roll: ArrowRight/ArrowLeft or L/J (Right/L = roll right +1, Left/J = roll left -1)
      let kbRoll = 0;
      if (kb['ArrowRight'] || kb['KeyL']) kbRoll += 1;
      if (kb['ArrowLeft'] || kb['KeyJ']) kbRoll -= 1;

      // Touch / Virtual sticks overlay
      if (this.settings.stickMode === 'mode2') {
        if (Math.abs(this.virtualStickLeft.y) > 0.05 || Math.abs(this.virtualStickLeft.x) > 0.05) {
          this.keyboardThrottle = (this.virtualStickLeft.y + 1) / 2;
          kbYaw = this.virtualStickLeft.x;
        }
        if (Math.abs(this.virtualStickRight.y) > 0.05 || Math.abs(this.virtualStickRight.x) > 0.05) {
          kbPitch = this.virtualStickRight.y;
          kbRoll = this.virtualStickRight.x;
        }
      } else {
        // Mode 1: Left has Pitch & Yaw, Right has Throttle & Roll
        if (Math.abs(this.virtualStickLeft.y) > 0.05 || Math.abs(this.virtualStickLeft.x) > 0.05) {
          kbPitch = this.virtualStickLeft.y;
          kbYaw = this.virtualStickLeft.x;
        }
        if (Math.abs(this.virtualStickRight.y) > 0.05 || Math.abs(this.virtualStickRight.x) > 0.05) {
          this.keyboardThrottle = (this.virtualStickRight.y + 1) / 2;
          kbRoll = this.virtualStickRight.x;
        }
      }

      if (!isGamepadActive) {
        rawThrottle = this.keyboardThrottle;
        rawYaw = kbYaw;
        rawPitch = kbPitch;
        rawRoll = kbRoll;
      } else {
        // Blend keyboard if keys pressed
        if (Math.abs(kbYaw) > 0.1) rawYaw = kbYaw;
        if (Math.abs(kbPitch) > 0.1) rawPitch = kbPitch;
        if (Math.abs(kbRoll) > 0.1) rawRoll = kbRoll;
      }
    }

    // Apply exponential curve to stick deflections
    const finalThrottle = Math.max(0, Math.min(1, rawThrottle));
    const finalYaw = this.applyExpo(Math.max(-1, Math.min(1, rawYaw)), this.settings.expo);
    const finalPitch = this.applyExpo(Math.max(-1, Math.min(1, rawPitch)), this.settings.expo);
    const finalRoll = this.applyExpo(Math.max(-1, Math.min(1, rawRoll)), this.settings.expo);

    return {
      throttle: finalThrottle,
      yaw: finalYaw,
      pitch: finalPitch,
      roll: finalRoll,
      armed: this.isArmed,
      flightMode: this.currentFlightMode,
      rawAxes,
      connectedDevice,
      isGamepadActive,
    };
  }
}

export const transmitter = new TransmitterManager();

