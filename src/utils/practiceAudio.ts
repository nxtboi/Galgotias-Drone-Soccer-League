// Web Audio API Synthesizer for 3D Drone Soccer Simulator

class PracticeAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private motorOsc1: OscillatorNode | null = null;
  private motorOsc2: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private isMotorRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopMotor();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Brushless Motor Sound (Dynamic Pitch with Throttle)
  public startMotor(): void {
    if (this.isMuted || this.isMotorRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.motorOsc1 = this.ctx.createOscillator();
      this.motorOsc2 = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();

      this.motorOsc1.type = 'sawtooth';
      this.motorOsc2.type = 'triangle';

      this.motorOsc1.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.motorOsc2.frequency.setValueAtTime(220, this.ctx.currentTime);

      // Low initial volume (idle idle spin)
      this.motorGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.motorOsc1.connect(this.motorGain);
      this.motorOsc2.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);

      this.motorOsc1.start();
      this.motorOsc2.start();
      this.isMotorRunning = true;
    } catch {
      // Audio failed to initialize gracefully
    }
  }

  public updateMotorThrottle(throttle01: number): void {
    if (this.isMuted || !this.isMotorRunning || !this.ctx) return;

    try {
      const clamped = Math.max(0, Math.min(1, throttle01));
      const baseFreq = 95 + clamped * 380; // 95Hz idle -> 475Hz full spool
      const volume = 0.02 + clamped * 0.09;

      if (this.motorOsc1) {
        this.motorOsc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
      }
      if (this.motorOsc2) {
        this.motorOsc2.frequency.setTargetAtTime(baseFreq * 1.5, this.ctx.currentTime, 0.05);
      }
      if (this.motorGain) {
        this.motorGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
      }
    } catch {
      // Ignore audio glitches
    }
  }

  public stopMotor(): void {
    if (!this.isMotorRunning) return;
    try {
      if (this.motorOsc1) {
        this.motorOsc1.stop();
        this.motorOsc1.disconnect();
        this.motorOsc1 = null;
      }
      if (this.motorOsc2) {
        this.motorOsc2.stop();
        this.motorOsc2.disconnect();
        this.motorOsc2 = null;
      }
      if (this.motorGain) {
        this.motorGain.disconnect();
        this.motorGain = null;
      }
    } catch {
      // Ignore
    }
    this.isMotorRunning = false;
  }

  // Cage-to-Cage Drone Clash Impact
  public playCageClash(intensity: number = 0.7): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-pitched polycarbonate crack + hollow resonance
      const crackOsc = this.ctx.createOscillator();
      const hollowOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      crackOsc.type = 'triangle';
      crackOsc.frequency.setValueAtTime(620, now);
      crackOsc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      hollowOsc.type = 'sine';
      hollowOsc.frequency.setValueAtTime(280, now);
      hollowOsc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      const vol = Math.min(0.28, 0.08 + intensity * 0.2);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      crackOsc.connect(gain);
      hollowOsc.connect(gain);
      gain.connect(this.ctx.destination);

      crackOsc.start(now);
      hollowOsc.start(now);
      crackOsc.stop(now + 0.18);
      hollowOsc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  // Soccer Ball Kick / Impact Thump
  public playBallKick(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  // Referee Whistle (Dual-frequency trill)
  public playRefereeWhistle(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2600, now);
      osc2.frequency.setValueAtTime(2850, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Official Arena Goal Horn / Buzzer
  public playGoalHorn(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Dual-tone stadium horn (F#3 + C#4)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(185, now); // F#3
      osc2.frequency.setValueAtTime(277.18, now); // C#4

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch {
      // Ignore
    }
  }

  // Cage Collision / Net Bounce Thud
  public playCollision(intensity: number = 0.5): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      const vol = Math.min(0.2, 0.05 + intensity * 0.15);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  // Countdown Beeps (for 5s Penalty and 3-2-1 starts)
  public playBeep(isHigh: boolean = false): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigh ? 880 : 440, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isHigh ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isHigh ? 0.35 : 0.15));
    } catch {
      // Ignore
    }
  }
}

export const practiceAudio = new PracticeAudioEngine();
