/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAudioContext } from './audioEngine';

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  src: string;
  genre: string;
}

export const PRELOADED_TRACKS: TrackMetadata[] = [
  {
    id: 'track-6lack',
    title: '6LACK',
    artist: 'Mino Enchilotto ft. Otis TayNino',
    bpm: 130,
    key: '4A / F minor',
    duration: 184,
    src: '/assets/aistudio/Mino_Enchilotto___Otis_TayNino_-_6LACK_3f0bf1eb.mp3',
    genre: 'Trap Soul',
  },
  {
    id: 'track-vent',
    title: 'Vent',
    artist: 'Mino Enchilotto',
    bpm: 126,
    key: '8A / A minor',
    duration: 172,
    src: '/assets/aistudio/mino-enchilotto_mino-enchilotto-vent_d6798f78.mp3',
    genre: 'Conscious Hip Hop',
  },
  {
    id: 'track-perform',
    title: 'Perform',
    artist: 'Mino Enchilotto',
    bpm: 124,
    key: '2A / E minor',
    duration: 195,
    src: '/assets/aistudio/perform_aa6c94c0.mp3',
    genre: 'Alternative Rap',
  },
  {
    id: 'track-hillside',
    title: 'Hillside Therapy',
    artist: 'VVU Sound Lab',
    bpm: 120,
    key: '6B / B♭ Major',
    duration: 168,
    src: '/assets/aistudio/Hillside_Therapy_4827260b.mp3',
    genre: 'Afro House / Soul',
  },
  {
    id: 'track-dawn',
    title: 'Before Dawn (83F0R3)',
    artist: 'Mino Enchilotto',
    bpm: 128,
    key: '5A / C minor',
    duration: 210,
    src: '/assets/aistudio/83F0R3_D4WN_e88d1ea3.mp3',
    genre: 'Amapiano Hybrid',
  },
  {
    id: 'track-blxnk',
    title: 'Blxnk',
    artist: 'VVU Stems',
    bpm: 125,
    key: '11B / A Major',
    duration: 145,
    src: '/assets/aistudio/Blxnk_9b229f17.mp3',
    genre: 'Rhythmic Instrumental',
  },
  {
    id: 'track-0ff',
    title: '0FF',
    artist: 'Mino Enchilotto',
    bpm: 132,
    key: '9A / G minor',
    duration: 160,
    src: '/assets/aistudio/0FF__be9cbc16.mp3',
    genre: 'Ubuntu Drill',
  },
  {
    id: 'track-type-way',
    title: 'Type of Way',
    artist: 'Prod. Papamitrou x Nick Papz',
    bpm: 88,
    key: '1A / G# minor',
    duration: 175,
    src: '/assets/aistudio/_SOLD__J.Cole_Nas_Type_Beat_Instrumental__Type_of_Way___Prod._Papamitrou___Nick_Papz__PapamitrouAlex_4d317e56.mp3',
    genre: 'Boom Bap Classique',
  },
  {
    id: 'track-amiri',
    title: 'Amiri (Ambient)',
    artist: 'Gunna Type / VVU Beat',
    bpm: 122,
    key: '7A / D minor',
    duration: 154,
    src: '/assets/aistudio/_Free__Gunna_Type_Beat_2021__Amiri____Ambient_Type_Beat___Instrumental_72c5a4ed.mp3',
    genre: 'Ambient Trap',
  },
  {
    id: 'track-illmatic',
    title: 'Illmatic Legend',
    artist: 'Lil Wayne Type Cut',
    bpm: 94,
    key: '3B / D♭ Major',
    duration: 180,
    src: '/assets/aistudio/_FREE__LIL_WAYNE_TYPE_BEAT_-__ILLMATIC__9dc0d772.mp3',
    genre: 'East Coast Brass',
  },
  {
    id: 'track-night',
    title: "Don't Sleep at Night",
    artist: 'Nav x The Weeknd Style',
    bpm: 115,
    key: '12A / E minor',
    duration: 190,
    src: '/assets/aistudio/_FREE__Nav_x_The_Weeknd_Type_Beat_-__i_don_t_sleep_at_night__3c197ca9.mp3',
    genre: 'Dark Synth R&B',
  },
  {
    id: 'track-homegrown',
    title: 'Homegrown (J.Cole x Kendrick)',
    artist: 'Prod. Homage',
    bpm: 86,
    key: '10A / B minor',
    duration: 202,
    src: '/assets/aistudio/_SOLD__J_Cole_x_Kendrick_Lamar_Type_Beat_Chill_Hip_Hop_Instrumental_2017____Homegrown___Prod_Homage__eee89af4.mp3',
    genre: 'Chill Hip Hop',
  },
  {
    id: 'track-sober',
    title: 'Sober Freestyle',
    artist: 'Accent Beats',
    bpm: 90,
    key: '4A / F minor',
    duration: 165,
    src: '/assets/aistudio/J_Cole_Type_Beat_-_Sober_Freestyle_Type_Instrumental_Accent_Beats_-_Accent_Beats_319786ed.mp3',
    genre: 'Conscious Hip Hop',
  },
  {
    id: 'track-hell-hot',
    title: 'Hell Is Hot',
    artist: 'Prod. Novmber',
    bpm: 92,
    key: '6A / G minor',
    duration: 178,
    src: '/assets/aistudio/_FREE__Hell_Is_Hot_-_J._Cole___Logic_Type_Beat_2023__Prod._Novmber__-_NOVMBER_0e06389c.mp3',
    genre: 'Lyrical Fire',
  },
  {
    id: 'track-darker-days',
    title: 'Darker Days',
    artist: 'Othello Beats',
    bpm: 98,
    key: '2B / F# Major',
    duration: 182,
    src: '/assets/aistudio/DJ_Khaled_x_Big_Sean_x_Dave_East_Type_Beat_Darker_Days_-_Othello_Beats_a81e4051.mp3',
    genre: 'Anthem Banger',
  },
  {
    id: 'track-championship',
    title: 'Championship Season',
    artist: 'Prod. Xane OTB',
    bpm: 140,
    key: '8B / C Major',
    duration: 195,
    src: '/assets/aistudio/Dave_East_x_Meek_Mill_x_A_Boogie_Type_Beat_NEW_2019__Prod._By_Xane_OTB__d60d369c.mp3',
    genre: 'High Energy Brass',
  },
];

export interface DeckState {
  track: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  pitch: number; // -8% to +8%
  effectiveBpm: number;
  syncActive: boolean;
  volume: number; // 0 to 1
  cuePoint: number;
  hotCues: (number | null)[]; // 4 slots
  loopActive: boolean;
  loopBeats: number;
  loopStart: number;
  loopEnd: number;
  // 3-Band EQ (-12 to +12 dB, kill if boolean)
  eqHigh: number;
  eqMid: number;
  eqLow: number;
  killHigh: boolean;
  killMid: boolean;
  killLow: boolean;
  // FX
  filterType: 'off' | 'lpf' | 'hpf';
  filterSweep: number; // -1 (LPF) to 0 (off) to +1 (HPF)
  fxDelayActive: boolean;
  fxReverbActive: boolean;
  fxFlangerActive: boolean;
  isCuePfl: boolean;
  vuLevel: number; // 0 to 1
}

export class UbuntuDjEngine {
  private ctx: AudioContext;
  private audioA: HTMLAudioElement;
  private audioB: HTMLAudioElement;
  private sourceA: MediaElementAudioSourceNode | null = null;
  private sourceB: MediaElementAudioSourceNode | null = null;

  // Deck A Filters & Nodes
  private lowA!: BiquadFilterNode;
  private midA!: BiquadFilterNode;
  private highA!: BiquadFilterNode;
  private filterA!: BiquadFilterNode;
  private gainA!: GainNode;
  private crossGainA!: GainNode;
  private analyserA!: AnalyserNode;

  // Deck B Filters & Nodes
  private lowB!: BiquadFilterNode;
  private midB!: BiquadFilterNode;
  private highB!: BiquadFilterNode;
  private filterB!: BiquadFilterNode;
  private gainB!: GainNode;
  private crossGainB!: GainNode;
  private analyserB!: AnalyserNode;

  // Master & FX bus
  private masterGain!: GainNode;
  private delayA!: DelayNode;
  private delayGainA!: GainNode;
  private delayB!: DelayNode;
  private delayGainB!: GainNode;

  // Recording
  private streamDestination!: MediaStreamAudioDestinationNode;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // State
  public crossfader = 0.5; // 0 (Deck A) to 1 (Deck B), 0.5 is center
  public masterVolume = 0.85;
  private initialized = false;

  constructor() {
    this.ctx = getAudioContext();
    this.audioA = new Audio();
    this.audioB = new Audio();
    this.audioA.crossOrigin = 'anonymous';
    this.audioB.crossOrigin = 'anonymous';
    this.audioA.preload = 'auto';
    this.audioB.preload = 'auto';

    this.setupNodes();
  }

  private setupNodes() {
    if (this.initialized) return;

    // Deck A graph: Source -> Low -> Mid -> High -> Filter -> Gain -> CrossGain -> Master
    this.lowA = this.ctx.createBiquadFilter();
    this.lowA.type = 'lowshelf';
    this.lowA.frequency.value = 250;

    this.midA = this.ctx.createBiquadFilter();
    this.midA.type = 'peaking';
    this.midA.frequency.value = 1200;
    this.midA.Q.value = 1.0;

    this.highA = this.ctx.createBiquadFilter();
    this.highA.type = 'highshelf';
    this.highA.frequency.value = 3500;

    this.filterA = this.ctx.createBiquadFilter();
    this.filterA.type = 'allpass';

    this.gainA = this.ctx.createGain();
    this.crossGainA = this.ctx.createGain();
    this.analyserA = this.ctx.createAnalyser();
    this.analyserA.fftSize = 256;

    // Delay FX for A
    this.delayA = this.ctx.createDelay();
    this.delayA.delayTime.value = 0.375; // 3/16 dotted note
    this.delayGainA = this.ctx.createGain();
    this.delayGainA.gain.value = 0;
    this.delayA.connect(this.delayGainA);
    this.delayGainA.connect(this.delayA);

    // Deck B graph
    this.lowB = this.ctx.createBiquadFilter();
    this.lowB.type = 'lowshelf';
    this.lowB.frequency.value = 250;

    this.midB = this.ctx.createBiquadFilter();
    this.midB.type = 'peaking';
    this.midB.frequency.value = 1200;
    this.midB.Q.value = 1.0;

    this.highB = this.ctx.createBiquadFilter();
    this.highB.type = 'highshelf';
    this.highB.frequency.value = 3500;

    this.filterB = this.ctx.createBiquadFilter();
    this.filterB.type = 'allpass';

    this.gainB = this.ctx.createGain();
    this.crossGainB = this.ctx.createGain();
    this.analyserB = this.ctx.createAnalyser();
    this.analyserB.fftSize = 256;

    // Delay FX for B
    this.delayB = this.ctx.createDelay();
    this.delayB.delayTime.value = 0.375;
    this.delayGainB = this.ctx.createGain();
    this.delayGainB.gain.value = 0;
    this.delayB.connect(this.delayGainB);
    this.delayGainB.connect(this.delayB);

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.masterVolume;

    // Recorder destination
    this.streamDestination = this.ctx.createMediaStreamDestination();

    // Connect Deck A chain
    this.lowA.connect(this.midA);
    this.midA.connect(this.highA);
    this.highA.connect(this.filterA);
    this.filterA.connect(this.gainA);
    this.gainA.connect(this.analyserA);
    this.gainA.connect(this.crossGainA);
    this.crossGainA.connect(this.masterGain);

    // Deck A delay route
    this.gainA.connect(this.delayA);
    this.delayGainA.connect(this.crossGainA);

    // Connect Deck B chain
    this.lowB.connect(this.midB);
    this.midB.connect(this.highB);
    this.highB.connect(this.filterB);
    this.filterB.connect(this.gainB);
    this.gainB.connect(this.analyserB);
    this.gainB.connect(this.crossGainB);
    this.crossGainB.connect(this.masterGain);

    // Deck B delay route
    this.gainB.connect(this.delayB);
    this.delayGainB.connect(this.crossGainB);

    // Master to Speakers and Stream
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.streamDestination);

    this.updateCrossfader(0.5);
    this.initialized = true;
  }

  public ensureMediaSources() {
    if (!this.sourceA && this.audioA) {
      try {
        this.sourceA = this.ctx.createMediaElementSource(this.audioA);
        this.sourceA.connect(this.lowA);
      } catch (err) {
        console.warn('Source A already connected or context issue', err);
      }
    }
    if (!this.sourceB && this.audioB) {
      try {
        this.sourceB = this.ctx.createMediaElementSource(this.audioB);
        this.sourceB.connect(this.lowB);
      } catch (err) {
        console.warn('Source B already connected or context issue', err);
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public loadTrack(deck: 'A' | 'B', track: TrackMetadata) {
    this.ensureMediaSources();
    const audio = deck === 'A' ? this.audioA : this.audioB;
    audio.src = track.src;
    audio.load();
  }

  public play(deck: 'A' | 'B') {
    this.ensureMediaSources();
    const audio = deck === 'A' ? this.audioA : this.audioB;
    return audio.play().catch((e) => {
      console.warn('Playback error:', e);
    });
  }

  public pause(deck: 'A' | 'B') {
    const audio = deck === 'A' ? this.audioA : this.audioB;
    audio.pause();
  }

  public seek(deck: 'A' | 'B', timeInSeconds: number) {
    const audio = deck === 'A' ? this.audioA : this.audioB;
    if (Number.isFinite(timeInSeconds) && timeInSeconds >= 0) {
      audio.currentTime = Math.min(timeInSeconds, audio.duration || 9999);
    }
  }

  public setPitch(deck: 'A' | 'B', pitchPercent: number) {
    const audio = deck === 'A' ? this.audioA : this.audioB;
    // pitchPercent is e.g. -8 to +8
    const rate = Math.max(0.5, Math.min(2.0, 1.0 + pitchPercent / 100));
    audio.playbackRate = rate;
  }

  public setChannelVolume(deck: 'A' | 'B', vol: number) {
    const gainNode = deck === 'A' ? this.gainA : this.gainB;
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
  }

  public setEQ(
    deck: 'A' | 'B',
    highDb: number,
    midDb: number,
    lowDb: number,
    killHigh = false,
    killMid = false,
    killLow = false
  ) {
    const high = deck === 'A' ? this.highA : this.highB;
    const mid = deck === 'A' ? this.midA : this.midB;
    const low = deck === 'A' ? this.lowA : this.lowB;

    const t = this.ctx.currentTime;
    high.gain.setValueAtTime(killHigh ? -70 : Math.max(-24, Math.min(12, highDb)), t);
    mid.gain.setValueAtTime(killMid ? -70 : Math.max(-24, Math.min(12, midDb)), t);
    low.gain.setValueAtTime(killLow ? -70 : Math.max(-24, Math.min(12, lowDb)), t);
  }

  public setFilterSweep(deck: 'A' | 'B', sweep: number) {
    // sweep is -1 (Full LPF) to 0 (flat/bypass) to +1 (Full HPF)
    const filter = deck === 'A' ? this.filterA : this.filterB;
    const t = this.ctx.currentTime;

    if (Math.abs(sweep) < 0.05) {
      filter.type = 'allpass';
      filter.frequency.setValueAtTime(1000, t);
    } else if (sweep < 0) {
      // Lowpass sweep from 20kHz down to 200Hz
      filter.type = 'lowpass';
      const freq = 200 + Math.pow(1 + sweep, 2) * 19800;
      filter.frequency.setValueAtTime(Math.max(120, freq), t);
      filter.Q.setValueAtTime(2.2, t);
    } else {
      // Highpass sweep from 20Hz up to 5kHz
      filter.type = 'highpass';
      const freq = 20 + Math.pow(sweep, 2) * 6000;
      filter.frequency.setValueAtTime(freq, t);
      filter.Q.setValueAtTime(2.2, t);
    }
  }

  public setDelayFx(deck: 'A' | 'B', active: boolean) {
    const delayGain = deck === 'A' ? this.delayGainA : this.delayGainB;
    delayGain.gain.setValueAtTime(active ? 0.45 : 0, this.ctx.currentTime);
  }

  public updateCrossfader(pos: number) {
    // pos is 0 (Deck A full) to 1 (Deck B full)
    this.crossfader = Math.max(0, Math.min(1, pos));
    // Equal power crossfade
    const gainA = Math.cos(this.crossfader * 0.5 * Math.PI);
    const gainB = Math.sin(this.crossfader * 0.5 * Math.PI);
    this.crossGainA.gain.setValueAtTime(gainA, this.ctx.currentTime);
    this.crossGainB.gain.setValueAtTime(gainB, this.ctx.currentTime);
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1.2, vol));
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
  }

  public getAudioElement(deck: 'A' | 'B'): HTMLAudioElement {
    return deck === 'A' ? this.audioA : this.audioB;
  }

  public getAnalyser(deck: 'A' | 'B'): AnalyserNode {
    return deck === 'A' ? this.analyserA : this.analyserB;
  }

  public getRMSLevel(deck: 'A' | 'B'): number {
    const analyser = deck === 'A' ? this.analyserA : this.analyserB;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    return Math.min(1.0, rms / 128);
  }

  // Live recording of the DJ mix
  public startRecording() {
    this.recordedChunks = [];
    const stream = this.streamDestination.stream;
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };
    this.mediaRecorder.start(100);
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(new Blob(this.recordedChunks, { type: 'audio/webm' }));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

// Singleton instance
export const ubuntuDjEngine = new UbuntuDjEngine();
