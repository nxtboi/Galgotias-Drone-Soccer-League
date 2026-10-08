// Audio system completely disabled / silenced per request.
// All sound methods are safely no-oped to ensure silence across the entire application.

class SoundManager {
  public getIsMuted(): boolean {
    return true;
  }

  public setMuted(_muted: boolean): void {}

  public toggleMute(): boolean {
    return true;
  }

  public startMotor(): void {}

  public setMotorThrottle(_throttle01: number): void {}

  public stopMotor(): void {}

  public playDshotBootBeeps(): void {}

  public playArmChirp(): void {}

  public playDisarmBeep(): void {}

  public playDisarmChirp(): void {}

  public playAcroSwoop(_intensity?: number): void {}

  public playWhoosh(): void {}

  public playFlightWhoosh(): void {}

  public playModeSwitch(_isAcro: boolean): void {}

  public playWarningTone(): void {}

  public playBeep(_freq?: number, _duration?: number): void {}
}

export const soundFx = new SoundManager();
