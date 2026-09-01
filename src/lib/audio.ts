// Web Audio API Sound Engine for Metronome, Guitar & Piano Synthesis

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Metronome Scheduling State
  private isMetronomePlaying: boolean = false;
  private metronomeTimerId: number | null = null;
  private nextNoteTime: number = 0;
  private currentSubdivisionIndex: number = 0;
  private currentBeat: number = 0;
  private bpm: number = 120;
  private beatsPerBar: number = 4;
  private beatUnit: number = 4;
  private subdivision: "quarter" | "eighth" | "sixteenth" | "triplet" =
    "quarter";
  private soundType: "click" | "woodblock" | "tick" | "beep" = "click";
  private volume: number = 1;
  private onBeatCallback:
    | ((beat: number, isAccent: boolean, isSubdivision: boolean) => void)
    | null = null;
  private metronomeStateListeners: Set<(isPlaying: boolean) => void> =
    new Set();

  constructor() {
    // AudioContext will be lazily initialized upon first user gesture
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private notifyMetronomeStateListeners() {
    const isPlaying = this.isMetronomePlaying;
    this.metronomeStateListeners.forEach((listener) => listener(isPlaying));
  }

  public onMetronomeStateChange(
    listener: (isPlaying: boolean) => void,
  ): () => void {
    this.metronomeStateListeners.add(listener);
    return () => {
      this.metronomeStateListeners.delete(listener);
    };
  }

  public setMetronomeBeatCallback(
    onBeat:
      | ((beat: number, isAccent: boolean, isSubdivision: boolean) => void)
      | null,
  ) {
    this.onBeatCallback = onBeat;
  }

  public getMetronomeState() {
    return {
      isPlaying: this.isMetronomePlaying,
      bpm: this.bpm,
      timeSignature: `${this.beatsPerBar}/${this.beatUnit}`,
      subdivision: this.subdivision,
      soundType: this.soundType,
      currentBeat: this.currentBeat,
    };
  }

  // Convert Note Name + Octave to Frequency (Hz)
  public noteToFrequency(note: string, octave: number = 4): number {
    const noteMap: { [key: string]: number } = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
    };

    const semitone = noteMap[note] ?? 0;
    const midiNumber = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  // Play a realistic synthesized acoustic guitar pluck
  public playGuitarPluck(
    note: string,
    octave: number = 3,
    duration: number = 2.0,
    timeOffset: number = 0,
  ) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const startTime = ctx.currentTime + timeOffset;
    const freq = this.noteToFrequency(note, octave);

    // Fundamental & Harmonics
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    // Body Filter (Lowpass with acoustic resonance)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), startTime);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(freq * 1.5, 200),
      startTime + duration,
    );
    filter.Q.setValueAtTime(3.0, startTime);

    // Waveforms: triangle + soft sawtooth
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 2nd harmonic

    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 3, startTime); // 3rd harmonic

    // Pluck attack & decay envelope
    const masterPluckGain = ctx.createGain();
    masterPluckGain.gain.setValueAtTime(0, startTime);
    masterPluckGain.gain.linearRampToValueAtTime(0.7, startTime + 0.005); // Rapid snap attack
    masterPluckGain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.15); // Initial transient decay
    masterPluckGain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration,
    ); // Ringing tail

    gain1.gain.setValueAtTime(0.8, startTime);
    gain2.gain.setValueAtTime(0.3, startTime);
    gain3.gain.setValueAtTime(0.15, startTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);

    filter.connect(masterPluckGain);
    if (this.masterGain) {
      masterPluckGain.connect(this.masterGain);
    } else {
      masterPluckGain.connect(ctx.destination);
    }

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
  }

  // Play a realistic synthesized acoustic piano tone
  public playPianoNote(
    note: string,
    octave: number = 4,
    duration: number = 2.5,
    timeOffset: number = 0,
  ) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const startTime = ctx.currentTime + timeOffset;
    const freq = this.noteToFrequency(note, octave);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 8, 10000), startTime);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(freq * 2, 350),
      startTime + duration,
    );

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.75, startTime + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.4, startTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.001, startTime); // Slight acoustic detune

    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(freq * 3, startTime);

    const mix1 = ctx.createGain();
    const mix2 = ctx.createGain();
    const mix3 = ctx.createGain();

    mix1.gain.value = 0.8;
    mix2.gain.value = 0.35;
    mix3.gain.value = 0.15;

    osc1.connect(mix1);
    osc2.connect(mix2);
    osc3.connect(mix3);

    mix1.connect(filter);
    mix2.connect(filter);
    mix3.connect(filter);

    filter.connect(gainNode);
    if (this.masterGain) {
      gainNode.connect(this.masterGain);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
  }

  // Play chord arpeggio / strum
  public playChordArpeggio(
    notes: { note: string; octave: number }[],
    instrument: "guitar" | "piano" = "guitar",
    staggerSec: number = 0.06,
  ) {
    notes.forEach((n, idx) => {
      const offset = idx * staggerSec;
      if (instrument === "guitar") {
        this.playGuitarPluck(n.note, n.octave, 2.2, offset);
      } else {
        this.playPianoNote(n.note, n.octave, 2.5, offset);
      }
    });
  }

  // Metronome Click / Woodblock / Tick Synthesis
  private scheduleMetronomeTick(
    time: number,
    isAccent: boolean,
    isSubdivision: boolean,
  ) {
    if (this.isMuted) return;
    const ctx = this.getContext();

    if (this.soundType === "woodblock") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        isAccent ? 1200 : isSubdivision ? 700 : 900,
        time,
      );
      filter.Q.setValueAtTime(8, time);

      osc.type = "sine";
      osc.frequency.setValueAtTime(
        isAccent ? 960 : isSubdivision ? 600 : 780,
        time,
      );

      const amp = isAccent ? 1.25 : isSubdivision ? 0.55 : 0.9;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(amp, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      else gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.05);
    } else if (this.soundType === "tick") {
      // Mechanical Tick
      const bufferSize = ctx.sampleRate * 0.02;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        isAccent ? 3500 : isSubdivision ? 1800 : 2600,
        time,
      );
      filter.Q.setValueAtTime(12, time);

      const gain = ctx.createGain();
      const amp = isAccent ? 1.1 : isSubdivision ? 0.5 : 0.85;
      gain.gain.setValueAtTime(amp, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      else gain.connect(ctx.destination);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.02);
    } else if (this.soundType === "beep") {
      // Pure Beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(
        isAccent ? 1760 : isSubdivision ? 880 : 1320,
        time,
      );

      const amp = isAccent ? 1.0 : isSubdivision ? 0.45 : 0.75;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(amp, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      else gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.07);
    } else {
      // Crisp Digital Click (Default)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(
        isAccent ? 2400 : isSubdivision ? 1000 : 1600,
        time,
      );
      osc.frequency.exponentialRampToValueAtTime(
        isAccent ? 300 : 200,
        time + 0.012,
      );

      const amp = isAccent ? 1.3 : isSubdivision ? 0.6 : 0.95;
      gain.gain.setValueAtTime(amp, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);

      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      else gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.025);
    }
  }

  // High-Precision Lookahead Scheduler
  private getSubdivisionsPerBeat(): number {
    switch (this.subdivision) {
      case "eighth":
        return 2;
      case "sixteenth":
        return 4;
      case "triplet":
        return 3;
      case "quarter":
      default:
        return 1;
    }
  }

  private advanceSubdivision() {
    const subsPerBeat = this.getSubdivisionsPerBeat();
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPerSub = secondsPerBeat / subsPerBeat;

    this.nextNoteTime += secondsPerSub;
    this.currentSubdivisionIndex++;

    if (this.currentSubdivisionIndex >= subsPerBeat) {
      this.currentSubdivisionIndex = 0;
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
    }
  }

  private scheduler() {
    if (!this.isMetronomePlaying) return;
    const ctx = this.getContext();
    const lookaheadSec = 0.1; // 100ms lookahead
    const scheduleIntervalMs = 25; // check every 25ms

    while (this.nextNoteTime < ctx.currentTime + lookaheadSec) {
      const isBeatStart = this.currentSubdivisionIndex === 0;
      const isAccent = isBeatStart && this.currentBeat === 0;
      const isSub = !isBeatStart;

      this.scheduleMetronomeTick(this.nextNoteTime, isAccent, isSub);

      if (this.onBeatCallback) {
        const beatNum = this.currentBeat;
        const timeDiff = Math.max(
          0,
          (this.nextNoteTime - ctx.currentTime) * 1000,
        );
        setTimeout(() => {
          if (this.isMetronomePlaying && this.onBeatCallback) {
            this.onBeatCallback(beatNum, isAccent, isSub);
          }
        }, timeDiff);
      }

      this.advanceSubdivision();
    }

    this.metronomeTimerId = window.setTimeout(
      () => this.scheduler(),
      scheduleIntervalMs,
    );
  }

  // Metronome Public Controls
  public startMetronome(
    bpm: number,
    timeSignature: string,
    subdivision: "quarter" | "eighth" | "sixteenth" | "triplet",
    sound: "click" | "woodblock" | "tick" | "beep",
    onBeat?: (beat: number, isAccent: boolean, isSubdivision: boolean) => void,
  ) {
    const ctx = this.getContext();
    this.bpm = bpm;
    this.subdivision = subdivision;
    this.soundType = sound;
    if (onBeat) {
      this.onBeatCallback = onBeat;
    }

    const parts = timeSignature.split("/");
    this.beatsPerBar = parseInt(parts[0], 10) || 4;
    this.beatUnit = parseInt(parts[1], 10) || 4;

    this.isMetronomePlaying = true;
    this.currentBeat = 0;
    this.currentSubdivisionIndex = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.notifyMetronomeStateListeners();

    this.scheduler();
  }

  public updateMetronomeParams(
    bpm: number,
    timeSignature: string,
    subdivision: "quarter" | "eighth" | "sixteenth" | "triplet",
    sound: "click" | "woodblock" | "tick" | "beep",
  ) {
    this.bpm = bpm;
    this.subdivision = subdivision;
    this.soundType = sound;
    const parts = timeSignature.split("/");
    this.beatsPerBar = parseInt(parts[0], 10) || 4;
    this.beatUnit = parseInt(parts[1], 10) || 4;
  }

  public stopMetronome() {
    this.isMetronomePlaying = false;
    if (this.metronomeTimerId !== null) {
      clearTimeout(this.metronomeTimerId);
      this.metronomeTimerId = null;
    }
    this.notifyMetronomeStateListeners();
  }

  public isRunning(): boolean {
    return this.isMetronomePlaying;
  }
}

export const audioEngine = new AudioEngine();
