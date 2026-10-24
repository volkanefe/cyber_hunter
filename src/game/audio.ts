// Procedural Web Audio API sound & multi-track dynamic music engine

export type MusicMood = 'title' | 'combat' | 'boss' | 'paused' | 'victory' | 'gameover';

// Musical Note Frequencies (Hz) for multi-scale synthesis
export const MUSIC_FREQUENCIES: Record<string, number> = {
  // Low Sub Octaves
  E1: 41.2,
  F1: 43.65,
  Fs1: 46.25,
  G1: 49.0,
  A1: 55.0,
  B1: 61.74,
  C2: 65.41,
  Cs2: 69.3,
  D2: 73.42,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  Fs2: 92.5,
  G2: 98.0,
  Ab2: 103.83,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  // Mid Range
  C3: 130.81,
  Cs3: 138.59,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185.0,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  // High / Lead / Arp Range
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

export interface MusicTrackDef {
  id: number;
  code: string;
  nameTr: string;
  nameEn: string;
  genreTr: string;
  key: string;
  baseBpm: number;
  descriptionTr: string;
  accentColor: string;
}

export const MUSIC_TRACKS: MusicTrackDef[] = [
  {
    id: 0,
    code: 'TRK-01',
    nameTr: 'Kozmik Derinlik',
    nameEn: 'Cosmic Ambient',
    genreTr: 'Atmosferik Uzay Synth',
    key: 'D Minor',
    baseBpm: 96,
    descriptionTr: 'Derin uzay dinginliği, yankılanan kristal arp ezgileri ve yumuşak alt bas.',
    accentColor: '#38bdf8',
  },
  {
    id: 1,
    code: 'TRK-02',
    nameTr: 'Siberpunk Hızlanış',
    nameEn: 'Cyberpunk Neon Rush',
    genreTr: 'Yüksek Hızlı Tekno',
    key: 'A Minor',
    baseBpm: 124,
    descriptionTr: 'Senkoplu kare dalga bas ritmi, akıcı hi-hat vuruşları ve neon kulüp enerjisi.',
    accentColor: '#a855f7',
  },
  {
    id: 2,
    code: 'TRK-03',
    nameTr: 'Hiçlik Dretnotu',
    nameEn: 'Void Industrial Drone',
    genreTr: 'Karanlık Ağır Synth',
    key: 'F# Minor',
    baseBpm: 112,
    descriptionTr: 'Ağır zırhlı endüstriyel dretnot sesi, bozulmuş testere alt basları ve sert trampetler.',
    accentColor: '#f97316',
  },
  {
    id: 3,
    code: 'TRK-04',
    nameTr: 'Yıldız Savaşçısı',
    nameEn: 'Starlight Heroic Odyssey',
    genreTr: 'Melodik Kahramanlık',
    key: 'C Major / A Minor',
    baseBpm: 128,
    descriptionTr: 'Yükselen parlak synth lead melodileri, dörtnala itki ritmi ve galaktik zafer coşkusu.',
    accentColor: '#34d399',
  },
  {
    id: 4,
    code: 'TRK-05',
    nameTr: 'Omega Çekirdek',
    nameEn: 'Omega Metal Overdrive',
    genreTr: 'Savaş Metal Hızı',
    key: 'E Phrygian',
    baseBpm: 144,
    descriptionTr: 'Çift bas davul saldırısı, çılgın 32lik bas yürüyüşü ve rezonans tepe filtreleri.',
    accentColor: '#ef4444',
  },
];

export function calculateDynamicBpm(baseBpm: number, combatIntensity: number): number {
  const clampedIntensity = Math.max(0, Math.min(1, combatIntensity));
  // Accelerates tempo up to +36 BPM during peak combat!
  return Math.round(baseBpm + clampedIntensity * 36);
}

export interface AudioEngineSettings {
  sfxMuted: boolean;
  musicMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  currentMood: MusicMood;
  currentTrackId: number;
  combatIntensity: number;
  effectiveBpm: number;
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

  // Multi-Track State
  private currentTrackId: number = 0;
  private combatIntensity: number = 0.0; // 0.0 (calm) to 1.0 (extreme combat)
  private currentMood: MusicMood = 'title';
  private isMusicPlaying: boolean = false;
  private schedulerTimerId: ReturnType<typeof setTimeout> | null = null;
  private nextStepTime: number = 0;
  private currentStep: number = 0;

  // Pad persistent oscillators
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;

  constructor() {
    // Context initializes on user gesture
  }

  public getSettings(): AudioEngineSettings {
    const track = this.getCurrentTrack();
    return {
      sfxMuted: this.sfxMuted,
      musicMuted: this.musicMuted,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      currentMood: this.currentMood,
      currentTrackId: this.currentTrackId,
      combatIntensity: this.combatIntensity,
      effectiveBpm: this.getCurrentBpm(),
    };
  }

  public getAvailableTracks(): MusicTrackDef[] {
    return MUSIC_TRACKS;
  }

  public getCurrentTrack(): MusicTrackDef {
    return MUSIC_TRACKS[this.currentTrackId] || MUSIC_TRACKS[0];
  }

  public getCurrentTrackId(): number {
    return this.currentTrackId;
  }

  public selectTrack(trackId: number): MusicTrackDef {
    const validId = Math.max(0, Math.min(MUSIC_TRACKS.length - 1, Math.floor(trackId)));
    this.currentTrackId = validId;
    this.updateDroneFrequencies();
    return this.getCurrentTrack();
  }

  public nextTrack(): MusicTrackDef {
    const nextId = (this.currentTrackId + 1) % MUSIC_TRACKS.length;
    return this.selectTrack(nextId);
  }

  public setCombatIntensity(intensity: number) {
    this.combatIntensity = Math.max(0, Math.min(1, intensity));
    this.applyDynamicFilterAndIntensity();
  }

  public getCombatIntensity(): number {
    return this.combatIntensity;
  }

  public getCurrentBpm(): number {
    const base = this.getCurrentTrack().baseBpm;
    if (this.currentMood === 'title') return 96;
    if (this.currentMood === 'paused') return base;
    if (this.currentMood === 'victory') return 108;
    return calculateDynamicBpm(base, this.combatIntensity);
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

        // Music Bus with Dynamic Resonant Lowpass Filter
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

  // ---- Dynamic Procedural Multi-Track Music Engine ----

  public startMusic(initialMood: MusicMood = 'title', trackId?: number) {
    this.initContext();
    if (trackId !== undefined) {
      this.selectTrack(trackId);
    }
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
    this.applyDynamicFilterAndIntensity();
  }

  public getMusicMood(): MusicMood {
    return this.currentMood;
  }

  private applyDynamicFilterAndIntensity() {
    if (!this.ctx || !this.musicFilter || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const mood = this.currentMood;
    const intensity = this.combatIntensity;

    if (mood === 'paused') {
      this.musicFilter.frequency.setTargetAtTime(420, t, 0.2);
      this.musicFilter.Q.setTargetAtTime(1.0, t, 0.2);
      if (!this.musicMuted) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.45, t, 0.2);
      }
      return;
    }

    if (mood === 'gameover') {
      this.musicFilter.frequency.setTargetAtTime(280, t, 0.5);
      if (!this.musicMuted) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.2, t, 0.5);
      }
      return;
    }

    if (mood === 'victory') {
      this.musicFilter.frequency.setTargetAtTime(3200, t, 0.3);
      if (!this.musicMuted) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.75, t, 0.3);
      }
      return;
    }

    if (mood === 'title') {
      this.musicFilter.frequency.setTargetAtTime(1500, t, 0.4);
      this.musicFilter.Q.setTargetAtTime(1.5, t, 0.3);
      if (!this.musicMuted) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.8, t, 0.3);
      }
      return;
    }

    // Combat or Boss: Filter and resonance scale up with Combat Intensity!
    const baseFreq = mood === 'boss' ? 4200 : 2600;
    const targetFreq = baseFreq + intensity * 4200; // Opens up up to 6800-8400Hz!
    const targetQ = 1.8 + intensity * 2.2; // Resonant bite during high danger
    this.musicFilter.frequency.setTargetAtTime(targetFreq, t, 0.25);
    this.musicFilter.Q.setTargetAtTime(targetQ, t, 0.25);

    if (!this.musicMuted) {
      const volBoost = 1.0 + intensity * 0.2;
      this.musicGain.gain.setTargetAtTime(this.musicVolume * volBoost, t, 0.2);
    }
  }

  private updateDroneFrequencies() {
    if (!this.ctx || !this.padOsc1 || !this.padOsc2) return;
    const t = this.ctx.currentTime;
    const track = this.currentTrackId;

    let f1 = MUSIC_FREQUENCIES.D2;
    let f2 = MUSIC_FREQUENCIES.A2;

    if (track === 1) {
      // A Minor
      f1 = MUSIC_FREQUENCIES.A1;
      f2 = MUSIC_FREQUENCIES.E2;
    } else if (track === 2) {
      // F# Minor
      f1 = MUSIC_FREQUENCIES.Fs1;
      f2 = MUSIC_FREQUENCIES.Cs2;
    } else if (track === 3) {
      // C Major
      f1 = MUSIC_FREQUENCIES.C2;
      f2 = MUSIC_FREQUENCIES.G2;
    } else if (track === 4) {
      // E Phrygian
      f1 = MUSIC_FREQUENCIES.E1;
      f2 = MUSIC_FREQUENCIES.B1;
    }

    this.padOsc1.frequency.setTargetAtTime(f1, t, 0.5);
    this.padOsc2.frequency.setTargetAtTime(f2, t, 0.5);
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

      this.padOsc1.frequency.setValueAtTime(MUSIC_FREQUENCIES.D2, t);
      this.padOsc2.frequency.setValueAtTime(MUSIC_FREQUENCIES.A2, t);
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
      // In non-browser / headless test environment without Web Audio context, do not loop
      this.isMusicPlaying = false;
      return;
    }

    const scheduleAheadTime = 0.15; // 150ms lookahead
    const currentBpm = this.getCurrentBpm();
    const stepDuration = 60 / currentBpm / 4; // 16th note duration

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
    if (mood === 'gameover') return;

    const trackId = this.currentTrackId;
    const intensity = this.combatIntensity;

    // 1. Kick Drum (Different rhythm patterns per track + intensity layer)
    this.scheduleTrackKick(step, time, trackId, mood, intensity);

    // 2. Hi-Hat & Percussion
    this.scheduleTrackHats(step, time, trackId, mood, intensity);

    // 3. Bassline (Unique key, scales and synthesis for all 5 tracks)
    this.scheduleTrackBass(step, time, trackId, mood, intensity);

    // 4. Arpeggios & Leads
    if (mood !== 'paused') {
      this.scheduleTrackLeadArp(step, time, trackId, mood, intensity);
    }
  }

  private scheduleTrackKick(
    step: number,
    time: number,
    trackId: number,
    mood: MusicMood,
    intensity: number
  ) {
    if (mood === 'title' || mood === 'victory') {
      if (step === 0 || step === 8) {
        this.synthesizeKick(time, 0.18, 120, 36);
      }
      return;
    }

    let isKick = false;
    let punch = 0.24;

    switch (trackId) {
      case 0: // Cosmic Ambient: Half-time soft heartbeat kick
        isKick = step === 0 || step === 8;
        punch = 0.22;
        break;

      case 1: // Cyberpunk Neon Rush: Four-on-the-floor + ghost kick on 14
        isKick = step % 4 === 0 || (intensity > 0.4 && step === 14);
        punch = 0.26 + intensity * 0.08;
        break;

      case 2: // Industrial Void: Booming half-time kick with sub punch
        isKick = step === 0 || step === 6 || (intensity > 0.5 && step === 12);
        punch = 0.32;
        break;

      case 3: // Heroic Odyssey: Energetic upbeat kick on 0, 4, 8, 12
        isKick = step % 4 === 0;
        punch = 0.25;
        break;

      case 4: // Omega Overdrive: Relentless double-bass kick attack
        isKick =
          step % 4 === 0 ||
          step === 2 ||
          step === 6 ||
          step === 10 ||
          step === 14 ||
          (intensity > 0.5 && step % 2 === 0);
        punch = 0.34;
        break;
    }

    if (isKick) {
      const startPitch = trackId === 2 ? 160 : trackId === 4 ? 145 : 135;
      this.synthesizeKick(time, punch, startPitch, 35);
    }
  }

  private scheduleTrackHats(
    step: number,
    time: number,
    trackId: number,
    mood: MusicMood,
    intensity: number
  ) {
    if (mood === 'title') {
      if (step === 4 || step === 12) {
        this.synthesizeHat(time, 0.02, false, 7000);
      }
      return;
    }

    let playHat = false;
    let isOpen = false;
    let hatGain = 0.035;

    switch (trackId) {
      case 0: // Cosmic: Gentle ticking 8th notes
        playHat = step % 4 === 2;
        isOpen = step === 10;
        hatGain = 0.025;
        break;

      case 1: // Cyberpunk: Fast 16th hats with off-beat open hat
        playHat = step % 2 === 0 || intensity > 0.35;
        isOpen = step % 4 === 2;
        hatGain = 0.035 + intensity * 0.02;
        break;

      case 2: // Industrial: Metallic industrial sizzle
        playHat = step % 4 === 2 || (step % 2 === 1 && intensity > 0.4);
        isOpen = step === 8;
        hatGain = 0.04;
        break;

      case 3: // Heroic: Crisp off-beat 8th hats (classic disco/synthwave gallop)
        playHat = step % 2 === 1;
        isOpen = step % 4 === 2;
        hatGain = 0.032;
        break;

      case 4: // Omega Metal: Furious 16th hat barrage
        playHat = true; // Every 16th note!
        isOpen = step % 4 === 2;
        hatGain = 0.045;
        break;
    }

    if (playHat) {
      this.synthesizeHat(time, hatGain, isOpen, trackId === 2 ? 5500 : 7500);
    }
  }

  private scheduleTrackBass(
    step: number,
    time: number,
    trackId: number,
    mood: MusicMood,
    intensity: number
  ) {
    if (!this.ctx || !this.musicFilter) return;

    let freq = MUSIC_FREQUENCIES.D2;
    let shouldPlay = false;
    let waveType: OscillatorType = 'sawtooth';
    let filterCutoff = 800;
    let noteDuration = 0.14;
    let bassVol = 0.2;

    switch (trackId) {
      // TRACK 0: Cosmic Ambient (D Minor: D -> F -> G -> A)
      case 0: {
        waveType = 'triangle';
        shouldPlay = step % 4 === 0;
        const barStep = step >> 2;
        const notes = [
          MUSIC_FREQUENCIES.D2,
          MUSIC_FREQUENCIES.F2,
          MUSIC_FREQUENCIES.G2,
          MUSIC_FREQUENCIES.A1,
        ];
        freq = notes[barStep % notes.length];
        filterCutoff = 550;
        noteDuration = 0.22;
        bassVol = 0.22;
        break;
      }

      // TRACK 1: Cyberpunk Neon Rush (A Minor Dorian: A -> C -> D -> E with 16th roll)
      case 1: {
        waveType = 'square';
        shouldPlay = step % 2 === 0 || (intensity > 0.4 && step % 2 === 1);
        const subIndex = Math.floor(step / 4);
        const progression = [
          MUSIC_FREQUENCIES.A1,
          MUSIC_FREQUENCIES.C2,
          MUSIC_FREQUENCIES.D2,
          MUSIC_FREQUENCIES.E2,
        ];
        freq = progression[subIndex % progression.length];
        if (step % 4 === 3) freq = MUSIC_FREQUENCIES.G2;
        filterCutoff = 950 + intensity * 600;
        noteDuration = 0.11;
        bassVol = 0.2;
        break;
      }

      // TRACK 2: Void Industrial Drone (F# Minor Heavy Sub)
      case 2: {
        waveType = 'sawtooth';
        shouldPlay = step === 0 || step === 3 || step === 6 || step === 10 || step === 12;
        const fProg = [
          MUSIC_FREQUENCIES.Fs1,
          MUSIC_FREQUENCIES.Fs1,
          MUSIC_FREQUENCIES.A1,
          MUSIC_FREQUENCIES.Cs2,
        ];
        freq = fProg[Math.floor(step / 4) % fProg.length];
        filterCutoff = 1100 + intensity * 700;
        noteDuration = 0.16;
        bassVol = 0.26;
        break;
      }

      // TRACK 3: Heroic Odyssey (C Major / A Minor: C -> G -> A -> F uplifting pump)
      case 3: {
        waveType = 'sawtooth';
        shouldPlay = step % 2 === 0;
        const octaveHop = step % 4 === 2;
        const rootIndex = Math.floor(step / 4);
        const roots = [
          MUSIC_FREQUENCIES.C2,
          MUSIC_FREQUENCIES.G1,
          MUSIC_FREQUENCIES.A1,
          MUSIC_FREQUENCIES.F1,
        ];
        const baseNote = roots[rootIndex % roots.length];
        freq = octaveHop ? baseNote * 2 : baseNote;
        filterCutoff = 800 + intensity * 500;
        noteDuration = 0.12;
        bassVol = 0.21;
        break;
      }

      // TRACK 4: Omega Overdrive (E Phrygian relentless metal rumble)
      case 4: {
        waveType = 'sawtooth';
        shouldPlay = true; // Non-stop driving bass!
        const cycle = step % 8;
        const eNotes = [
          MUSIC_FREQUENCIES.E1,
          MUSIC_FREQUENCIES.E1,
          MUSIC_FREQUENCIES.F1,
          MUSIC_FREQUENCIES.E1,
          MUSIC_FREQUENCIES.G1,
          MUSIC_FREQUENCIES.E1,
          MUSIC_FREQUENCIES.Bb1,
          MUSIC_FREQUENCIES.A1,
        ];
        freq = eNotes[cycle];
        filterCutoff = 1350 + intensity * 900;
        noteDuration = 0.09;
        bassVol = 0.25;
        break;
      }
    }

    if (!shouldPlay) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + noteDuration);

      gain.gain.setValueAtTime(bassVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + noteDuration);
    } catch {}
  }

  private scheduleTrackLeadArp(
    step: number,
    time: number,
    trackId: number,
    mood: MusicMood,
    intensity: number
  ) {
    if (!this.ctx || !this.musicFilter) return;

    let freq = MUSIC_FREQUENCIES.D4;
    let playArp = false;
    let waveType: OscillatorType = 'sine';
    let duration = 0.18;
    let arpVol = 0.08 + intensity * 0.04;

    switch (trackId) {
      // TRACK 0: Cosmic Starlight (Pentatonic twinkle)
      case 0: {
        const starNotes = [
          MUSIC_FREQUENCIES.D4,
          MUSIC_FREQUENCIES.F4,
          MUSIC_FREQUENCIES.A4,
          MUSIC_FREQUENCIES.C5,
          MUSIC_FREQUENCIES.D5,
        ];
        playArp = step % 4 === 2 || (intensity > 0.4 && step % 2 === 1);
        freq = starNotes[(step >> 1) % starNotes.length];
        waveType = 'sine';
        duration = 0.28;
        break;
      }

      // TRACK 1: Cyberpunk Neon Rush (Ascending / Descending syncopated arp)
      case 1: {
        const cyberNotes = [
          MUSIC_FREQUENCIES.A4,
          MUSIC_FREQUENCIES.C5,
          MUSIC_FREQUENCIES.E5,
          MUSIC_FREQUENCIES.G4,
          MUSIC_FREQUENCIES.A4,
          MUSIC_FREQUENCIES.D5,
          MUSIC_FREQUENCIES.C5,
          MUSIC_FREQUENCIES.E4,
        ];
        playArp = step % 2 === 1;
        freq = cyberNotes[(step >> 1) % cyberNotes.length];
        waveType = 'sawtooth';
        duration = 0.12;
        break;
      }

      // TRACK 2: Void Heavy Drone (Dark ominous stabs)
      case 2: {
        const voidNotes = [
          MUSIC_FREQUENCIES.Fs4,
          MUSIC_FREQUENCIES.Cs4,
          MUSIC_FREQUENCIES.A4,
          MUSIC_FREQUENCIES.Fs5,
        ];
        playArp = step === 4 || step === 12 || (intensity > 0.5 && step === 14);
        freq = voidNotes[(step >> 2) % voidNotes.length];
        waveType = 'sawtooth';
        duration = 0.22;
        break;
      }

      // TRACK 3: Heroic Odyssey (Soaring triumphant lead)
      case 3: {
        const heroicNotes = [
          MUSIC_FREQUENCIES.C4,
          MUSIC_FREQUENCIES.E4,
          MUSIC_FREQUENCIES.G4,
          MUSIC_FREQUENCIES.C5,
          MUSIC_FREQUENCIES.D5,
          MUSIC_FREQUENCIES.E5,
          MUSIC_FREQUENCIES.G5,
          MUSIC_FREQUENCIES.E5,
        ];
        playArp = step % 2 === 1;
        freq = heroicNotes[(step >> 1) % heroicNotes.length];
        waveType = 'triangle';
        duration = 0.16;
        break;
      }

      // TRACK 4: Omega Metal (Furious screeching shred arpeggio)
      case 4: {
        const metalNotes = [
          MUSIC_FREQUENCIES.E4,
          MUSIC_FREQUENCIES.F4,
          MUSIC_FREQUENCIES.G4,
          MUSIC_FREQUENCIES.Bb4,
          MUSIC_FREQUENCIES.B4,
          MUSIC_FREQUENCIES.D5,
          MUSIC_FREQUENCIES.E5,
          MUSIC_FREQUENCIES.F5,
        ];
        playArp = step % 2 === 1 || intensity > 0.6;
        freq = metalNotes[step % metalNotes.length];
        waveType = 'sawtooth';
        duration = 0.08;
        break;
      }
    }

    if (!playArp) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(arpVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }

  private synthesizeKick(
    time: number,
    gainLevel: number,
    startPitch: number = 135,
    endPitch: number = 38
  ) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startPitch, time);
      osc.frequency.exponentialRampToValueAtTime(endPitch, time + 0.08);

      gain.gain.setValueAtTime(gainLevel, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + 0.13);
    } catch {}
  }

  private synthesizeHat(
    time: number,
    gainLevel: number,
    open: boolean = false,
    cutoff: number = 6500
  ) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const dur = open ? 0.06 : 0.025;
      const buffer = this.ctx.createBuffer(
        1,
        Math.floor(this.ctx.sampleRate * dur),
        this.ctx.sampleRate
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(cutoff, time);

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
