// Procedural Web Audio API sound & synthwave background music engine

export type MusicMood = 'title' | 'combat' | 'boss' | 'paused' | 'victory' | 'gameover';

// Musical Note Frequencies (Hz) in D Minor Pentatonic & Aeolian
export const MUSIC_FREQUENCIES: Record<string, number> = {
  D1: 36.71,
  A1: 55.0,
  D2: 73.42,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
};

// Pure logic helper for testing and state verification
export interface AudioEngineSettings {
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  currentMood: MusicMood;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  // Settings
  private sfxMuted: boolean = false;
  private musicMuted: boolean = false;
  private sfxVolume: number = 0.35;
  private musicVolume: number = 0.28;

  // Music Sequencer State
  private currentMood: MusicMood = 'title';
  private isMusicPlaying: boolean = false;
  private schedulerTimerId: ReturnType<typeof setTimeout> | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0;
  private tempoBpm: number = 96;

  // Pad persistent oscillators
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;

  constructor() {
    // Context initializes on user gesture
  }

  public getSettings(): AudioEngineSettings {
    return {
      sfxMuted: this.sfxMuted,
      musicMuted: this.musicMuted,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      currentMood: this.currentMood,
    };
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Bus
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // SFX Bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(
          this.sfxMuted ? 0 : this.sfxVolume,
          this.ctx.currentTime
        );
        this.sfxGain.connect(this.masterGain);

        // Music Bus with Dynamic Resonant Lowpass Filter (muffled during pause/menu)
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(
          this.musicMuted ? 0 : this.musicVolume,
          this.ctx.currentTime
        );

        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);
        this.musicFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        this.musicFilter.connect(this.musicGain);
        this.musicGain.connect(this.masterGain);

        // Start ambient pad drone
        this.startPadDrone();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // ---- Volume & Mute Controls ----

  public setSfxMuted(mute: boolean) {
    this.sfxMuted = mute;
    if (this.sfxGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.sfxGain.gain.setValueAtTime(this.sfxGain.gain.value, t);
      this.sfxGain.gain.linearRampToValueAtTime(mute ? 0 : this.sfxVolume, t + 0.05);
    }
  }

  public setMusicMuted(mute: boolean) {
    this.musicMuted = mute;
    if (this.musicGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
      this.musicGain.gain.linearRampToValueAtTime(mute ? 0 : this.musicVolume, t + 0.15);
    }
    if (!mute && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public toggleSfxMute(): boolean {
    this.setSfxMuted(!this.sfxMuted);
    return this.sfxMuted;
  }

  public toggleMusicMute(): boolean {
    this.initContext();
    this.setMusicMuted(!this.musicMuted);
    return this.musicMuted;
  }

  // Master mute toggle (for backwards compatibility / 'M' key)
  public toggleMute(): boolean {
    const next = !this.sfxMuted;
    this.setSfxMuted(next);
    return next;
  }

  public isMuted(): boolean {
    return this.sfxMuted;
  }

  public isMusicMuted(): boolean {
    return this.musicMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && !this.sfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && !this.musicMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  // ---- Dynamic Procedural Synthwave Music Engine ----

  public startMusic(initialMood: MusicMood = 'title') {
    this.initContext();
    this.setMusicMood(initialMood);

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.ctx) {
      this.nextStepTime = this.ctx.currentTime + 0.05;
      this.currentStep = 0;
    }

    this.runMusicScheduler();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.schedulerTimerId !== null) {
      clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  public setMusicMood(mood: MusicMood) {
    this.currentMood = mood;
    if (!this.ctx || !this.musicFilter || !this.musicGain) return;

    const t = this.ctx.currentTime;

    // Adapt tempo and filter resonance smoothly based on situation
    switch (mood) {
      case 'title':
        this.tempoBpm = 96;
        this.musicFilter.frequency.setTargetAtTime(1400, t, 0.4);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.8, t, 0.3);
        }
        break;

      case 'combat':
        this.tempoBpm = 124;
        this.musicFilter.frequency.setTargetAtTime(3600, t, 0.3);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume, t, 0.2);
        }
        break;

      case 'boss':
        // Fast, intense battle tempo with open resonant filter
        this.tempoBpm = 138;
        this.musicFilter.frequency.setTargetAtTime(5400, t, 0.2);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume * 1.15, t, 0.2);
        }
        break;

      case 'paused':
        // Classic underwater / low-pass filter effect
        this.musicFilter.frequency.setTargetAtTime(420, t, 0.2);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.45, t, 0.2);
        }
        break;

      case 'victory':
        this.tempoBpm = 104;
        this.musicFilter.frequency.setTargetAtTime(2800, t, 0.4);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.7, t, 0.4);
        }
        break;

      case 'gameover':
        this.musicFilter.frequency.setTargetAtTime(300, t, 0.6);
        if (!this.musicMuted) {
          this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.25, t, 0.6);
        }
        break;
    }
  }

  public getMusicMood(): MusicMood {
    return this.currentMood;
  }

  private startPadDrone() {
    if (!this.ctx || !this.musicFilter) return;

    try {
      const t = this.ctx.currentTime;
      this.padOsc1 = this.ctx.createOscillator();
      this.padOsc2 = this.ctx.createOscillator();
      this.padGain = this.ctx.createGain();
      this.padFilter = this.ctx.createBiquadFilter();

      this.padOsc1.type = 'sawtooth';
      this.padOsc2.type = 'triangle';

      // D2 / A2 detuned lush drone
      this.padOsc1.frequency.setValueAtTime(73.42, t);
      this.padOsc2.frequency.setValueAtTime(110.0, t);
      this.padOsc1.detune.setValueAtTime(-6, t);
      this.padOsc2.detune.setValueAtTime(7, t);

      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(650, t);
      this.padFilter.Q.setValueAtTime(2.0, t);

      this.padGain.gain.setValueAtTime(0.045, t);

      this.padOsc1.connect(this.padFilter);
      this.padOsc2.connect(this.padFilter);
      this.padFilter.connect(this.padGain);
      this.padGain.connect(this.musicFilter);

      this.padOsc1.start(t);
      this.padOsc2.start(t);
    } catch {
      // Audio context error ignore
    }
  }

  // Precise Web Audio clock scheduler
  private runMusicScheduler = () => {
    if (!this.isMusicPlaying) return;

    if (!this.ctx) {
      this.schedulerTimerId = setTimeout(this.runMusicScheduler, 100);
      return;
    }

    const scheduleAheadTime = 0.15; // 150ms lookahead
    const stepDuration = 60 / this.tempoBpm / 4; // 16th note duration

    while (this.nextStepTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextStepTime);
      this.nextStepTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
    }

    this.schedulerTimerId = setTimeout(this.runMusicScheduler, 35);
  };

  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.musicFilter || this.musicMuted) return;

    const mood = this.currentMood;
    if (mood === 'gameover') return; // Silence during game over

    // 1. Kick Drum
    if (mood === 'combat' || mood === 'boss') {
      const isKickStep =
        mood === 'boss'
          ? step % 4 === 0 || step === 14 // Punchy driving boss kick
          : step === 0 || step === 8; // Four-beat foundation

      if (isKickStep) {
        this.synthesizeKick(time, mood === 'boss' ? 0.35 : 0.22);
      }
    }

    // 2. Hi-Hat
    if (mood === 'combat' || mood === 'boss') {
      // 16th or 8th ticking hi-hat
      if (step % 2 === 0 || (mood === 'boss' && step % 2 === 1)) {
        this.synthesizeHat(time, mood === 'boss' ? 0.05 : 0.035, step % 4 === 2);
      }
    }

    // 3. Cyberpunk Bassline
    this.synthesizeBassStep(step, time, mood);

    // 4. Shimmering Arpeggios (Upper register)
    if (mood !== 'paused') {
      this.synthesizeArpStep(step, time, mood);
    }
  }

  private synthesizeKick(time: number, gainLevel: number) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(135, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.08);

      gain.gain.setValueAtTime(gainLevel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + 0.13);
    } catch {}
  }

  private synthesizeHat(time: number, gainLevel: number, open: boolean = false) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const dur = open ? 0.06 : 0.025;
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicFilter);

      noise.start(time);
      noise.stop(time + dur);
    } catch {}
  }

  private synthesizeBassStep(step: number, time: number, mood: MusicMood) {
    if (!this.ctx || !this.musicFilter) return;

    // Bass notes sequence (D minor progression: D -> F -> G -> A / Bb)
    let freq = MUSIC_FREQUENCIES.D2;
    let shouldPlay = false;

    if (mood === 'title') {
      // Slow ambient 8th pulses
      if (step === 0) {
        freq = MUSIC_FREQUENCIES.D2;
        shouldPlay = true;
      } else if (step === 8) {
        freq = MUSIC_FREQUENCIES.A1;
        shouldPlay = true;
      }
    } else if (mood === 'combat') {
      // Driving 16th-note synthwave bass
      shouldPlay = step % 2 === 0;
      if (step < 4) freq = MUSIC_FREQUENCIES.D2;
      else if (step < 8) freq = MUSIC_FREQUENCIES.F2;
      else if (step < 12) freq = MUSIC_FREQUENCIES.G2;
      else freq = MUSIC_FREQUENCIES.A2;
    } else if (mood === 'boss') {
      // Relentless 16th-note assault with octave ping-pong
      shouldPlay = true;
      const octaveNote = step % 2 === 1 ? MUSIC_FREQUENCIES.D3 : MUSIC_FREQUENCIES.D2;
      if (step < 8) {
        freq = octaveNote;
      } else if (step < 12) {
        freq = step % 2 === 1 ? MUSIC_FREQUENCIES.F3 : MUSIC_FREQUENCIES.F2;
      } else {
        freq = step % 2 === 1 ? MUSIC_FREQUENCIES.Bb2 : MUSIC_FREQUENCIES.A2;
      }
    } else if (mood === 'victory') {
      // Triumphant progression (D -> G -> A -> D)
      if (step === 0) {
        freq = MUSIC_FREQUENCIES.D2;
        shouldPlay = true;
      } else if (step === 8) {
        freq = MUSIC_FREQUENCIES.A2;
        shouldPlay = true;
      }
    }

    if (!shouldPlay) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = mood === 'boss' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      const cutoff = mood === 'boss' ? 1200 : 700;
      filter.frequency.setValueAtTime(cutoff, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + 0.12);

      const dur = 0.14;
      const vol = mood === 'boss' ? 0.24 : 0.18;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + dur);
    } catch {}
  }

  private synthesizeArpStep(step: number, time: number, mood: MusicMood) {
    if (!this.ctx || !this.musicFilter) return;

    // Upper synth arpeggio notes
    const arpNotes = [
      MUSIC_FREQUENCIES.D4,
      MUSIC_FREQUENCIES.F4,
      MUSIC_FREQUENCIES.A4,
      MUSIC_FREQUENCIES.C5,
      MUSIC_FREQUENCIES.D5,
      MUSIC_FREQUENCIES.C5,
      MUSIC_FREQUENCIES.A4,
      MUSIC_FREQUENCIES.F4,
    ];

    let playArp = false;
    let noteIndex = 0;

    if (mood === 'title') {
      // Gentle cosmic twinkle every 4 steps
      if (step === 4 || step === 12) {
        playArp = true;
        noteIndex = step === 4 ? 2 : 4;
      }
    } else if (mood === 'combat') {
      // Syncopated synth arp
      if (step % 2 === 1) {
        playArp = true;
        noteIndex = (step >> 1) % arpNotes.length;
      }
    } else if (mood === 'boss') {
      // Intense arpeggio every odd step
      if (step % 2 === 1) {
        playArp = true;
        noteIndex = ((step + 2) >> 1) % arpNotes.length;
      }
    } else if (mood === 'victory') {
      if (step % 4 === 0) {
        playArp = true;
        noteIndex = (step / 4) % arpNotes.length;
      }
    }

    if (!playArp) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(arpNotes[noteIndex], time);

      const dur = mood === 'title' ? 0.45 : 0.16;
      const vol = mood === 'boss' ? 0.14 : 0.09;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + dur);
    } catch {}
  }

  // ---- Sound Effects (SFX) ----

  public playLaser(pitchOffset: number = 0) {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 880 * (1 + (Math.random() * 0.16 - 0.08) + pitchOffset);
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch {}
  }

  public playHit() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch {}
  }

  public playExplosion(heavy: boolean = false) {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const duration = heavy ? 0.45 : 0.25;

      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(heavy ? 600 : 900, t);
      filter.frequency.exponentialRampToValueAtTime(60, t + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(heavy ? 0.35 : 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + duration);

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(heavy ? 120 : 150, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + duration);

      subGain.gain.setValueAtTime(heavy ? 0.4 : 0.25, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      sub.connect(subGain);
      subGain.connect(this.sfxGain);

      sub.start(t);
      sub.stop(t + duration);
    } catch {}
  }

  public playDash() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(720, t + 0.15);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.17);
    } catch {}
  }

  public playPickup() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, t);
      osc.frequency.setValueAtTime(880, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  public playLevelUp() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {}
  }

  public playTelegraph() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.linearRampToValueAtTime(520, t + 0.35);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch {}
  }

  public playBossAlarm() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const stepTime = t + i * 0.24;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, stepTime);
        osc.frequency.exponentialRampToValueAtTime(110, stepTime + 0.18);

        gain.gain.setValueAtTime(0.15, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.01, stepTime + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(stepTime);
        osc.stop(stepTime + 0.19);
      }
    } catch {}
  }

  public playVictory() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.45);
      });
    } catch {}
  }

  public playDefeat() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const notes = [440, 392, 349.23, 293.66];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime + idx * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.36);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
