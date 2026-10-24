/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global AudioContext singleton
let sharedAudioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;

export const NOTES_FREQUENCIES: { name: string; freq: number }[] = [
  { name: 'B3', freq: 246.94 },
  { name: 'A#3', freq: 233.08 },
  { name: 'A3', freq: 220.00 },
  { name: 'G#3', freq: 207.65 },
  { name: 'G3', freq: 196.00 },
  { name: 'F#3', freq: 185.00 },
  { name: 'F3', freq: 174.61 },
  { name: 'E3', freq: 164.81 },
  { name: 'D#3', freq: 155.56 },
  { name: 'D3', freq: 146.83 },
  { name: 'C#3', freq: 138.59 },
  { name: 'C3', freq: 130.81 },
];

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();

    masterGain = sharedAudioCtx.createGain();
    masterGain.gain.value = 0.8;

    analyserNode = sharedAudioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.85;

    masterGain.connect(analyserNode);
    analyserNode.connect(sharedAudioCtx.destination);
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }

  return sharedAudioCtx;
}

export function getAnalyser(): AnalyserNode | null {
  if (!analyserNode) {
    getAudioContext();
  }
  return analyserNode;
}

export function setMasterGainValue(volume: number) {
  if (masterGain && sharedAudioCtx) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), sharedAudioCtx.currentTime);
  }
}

// ----------------------------------------------------
// REAL-TIME SYNTHESIS
// ----------------------------------------------------

export function playKick(ctx: BaseAudioContext, destination: AudioNode, time?: number) {
  const t = time ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(32, t + 0.14);

  gain.gain.setValueAtTime(1.0, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(t);
  osc.stop(t + 0.18);
}

export function playSnare(ctx: BaseAudioContext, destination: AudioNode, time?: number) {
  const t = time ?? ctx.currentTime;
  const sampleRate = ctx.sampleRate;
  const bufferLength = Math.floor(sampleRate * 0.18);
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 900;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.7, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(destination);

  // Body tone
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.frequency.setValueAtTime(180, t);
  bodyOsc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  bodyGain.gain.setValueAtTime(0.5, t);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(destination);

  whiteNoise.start(t);
  bodyOsc.start(t);
  bodyOsc.stop(t + 0.12);
}

export function playHiHat(ctx: BaseAudioContext, destination: AudioNode, time?: number, open = false) {
  const t = time ?? ctx.currentTime;
  const duration = open ? 0.32 : 0.055;
  const sampleRate = ctx.sampleRate;
  const bufferLength = Math.floor(sampleRate * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(open ? 0.45 : 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  whiteNoise.start(t);
}

export function playClap(ctx: BaseAudioContext, destination: AudioNode, time?: number) {
  const t = time ?? ctx.currentTime;
  const sampleRate = ctx.sampleRate;
  const bufferLength = Math.floor(sampleRate * 0.22);
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1100;
  filter.Q.value = 2.0;

  const gain = ctx.createGain();
  // Multi-burst clap envelope
  gain.gain.setValueAtTime(0.6, t);
  gain.gain.setValueAtTime(0.2, t + 0.015);
  gain.gain.setValueAtTime(0.7, t + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  whiteNoise.start(t);
}

export function playTom(ctx: BaseAudioContext, destination: AudioNode, startFreq = 160, time?: number) {
  const t = time ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, t + 0.25);

  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(t);
  osc.stop(t + 0.28);
}

export function playCymbal(ctx: BaseAudioContext, destination: AudioNode, time?: number) {
  const t = time ?? ctx.currentTime;
  const duration = 0.8;
  const sampleRate = ctx.sampleRate;
  const bufferLength = Math.floor(sampleRate * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferLength; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  whiteNoise.start(t);
}

export function playSynth(ctx: BaseAudioContext, destination: AudioNode, freq = 220, time?: number, type: OscillatorType = 'sawtooth') {
  const t = time ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + 0.24);

  gain.gain.setValueAtTime(0.32, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(t);
  osc.stop(t + 0.28);
}

// ----------------------------------------------------
// 16-BIT PCM WAV ENCODER
// ----------------------------------------------------

export function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // 16 for PCM
  setUint16(1); // Linear quantization
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// ----------------------------------------------------
// OFFLINE WAV EXPORT
// ----------------------------------------------------

export async function exportWAVFile(
  channels: { name: string; pattern: boolean[]; muted: boolean }[],
  bpm: number,
  loops = 2
): Promise<Blob> {
  const totalSteps = 16 * loops;
  const stepDuration = 60 / bpm / 4;
  const totalDuration = stepDuration * totalSteps + 0.5; // tail room
  const sampleRate = 44100;

  const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);
  const renderMaster = offlineCtx.createGain();
  renderMaster.gain.value = 0.85;
  renderMaster.connect(offlineCtx.destination);

  for (let step = 0; step < totalSteps; step++) {
    const patternStep = step % 16;
    const time = step * stepDuration;

    for (const ch of channels) {
      if (ch.muted || !ch.pattern[patternStep]) continue;

      if (ch.name === 'KICK') {
        playKick(offlineCtx, renderMaster, time);
      } else if (ch.name === 'SNARE') {
        playSnare(offlineCtx, renderMaster, time);
      } else if (ch.name === 'HI-HAT') {
        playHiHat(offlineCtx, renderMaster, time, false);
      } else if (ch.name === 'SYNTH') {
        playSynth(offlineCtx, renderMaster, 196.0, time, 'sawtooth');
      }
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return bufferToWave(renderedBuffer, renderedBuffer.length);
}
