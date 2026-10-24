/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MixingPreset {
  id: string;
  name: string;
  category: 'Vocal' | 'Drums' | 'Bass' | 'Master' | 'Acoustic' | 'Creative';
  description: string;
  target: 'channel' | 'master';
  eq: {
    lowGain: number; // dB (-12 to +12)
    midGain: number; // dB (-12 to +12)
    highGain: number; // dB (-12 to +12)
    lowCutHz: number;
    highAirHz: number;
  };
  dynamics: {
    threshold: number; // -30 to 0 dB
    ratio: number; // 2:1 to 12:1
    attackMs: number;
    releaseMs: number;
    makeupGainDb: number;
  };
  color: {
    saturationDrive: number; // 0 to 1
    stereoWidth: number; // 0 to 200%
    reverbWet: number; // 0 to 1
    delayWet: number; // 0 to 1
  };
}

export const MIXING_PRESETS: MixingPreset[] = [
  {
    id: 'preset-vocal-polish',
    name: 'Vocal Polish & Air',
    category: 'Vocal',
    description: 'Crisp 12kHz top air boost, gentle 120Hz low cut to eliminate mud, and smooth 3:1 optical compression for lead vocal presence.',
    target: 'channel',
    eq: { lowGain: -2.5, midGain: 1.2, highGain: 4.0, lowCutHz: 120, highAirHz: 12500 },
    dynamics: { threshold: -16, ratio: 3.5, attackMs: 15, releaseMs: 120, makeupGainDb: 3.0 },
    color: { saturationDrive: 0.15, stereoWidth: 105, reverbWet: 0.22, delayWet: 0.12 },
  },
  {
    id: 'preset-amapiano-log-punch',
    name: 'Amapiano Log Drum Punch',
    category: 'Bass',
    description: 'Sub-bass 55Hz acoustic resonance boost, scooped mid-boxiness at 450Hz, with heavy 6:1 transient snap.',
    target: 'channel',
    eq: { lowGain: 5.5, midGain: -3.8, highGain: 1.0, lowCutHz: 28, highAirHz: 8000 },
    dynamics: { threshold: -18, ratio: 6.0, attackMs: 25, releaseMs: 80, makeupGainDb: 4.5 },
    color: { saturationDrive: 0.45, stereoWidth: 90, reverbWet: 0.05, delayWet: 0.0 },
  },
  {
    id: 'preset-808-warmth',
    name: '808 Harmonic Warmth',
    category: 'Bass',
    description: 'Even harmonic tape drive across second and third overtones, mono-centered low frequencies, punchy low-end sustain.',
    target: 'channel',
    eq: { lowGain: 4.2, midGain: 0.5, highGain: -2.0, lowCutHz: 32, highAirHz: 6500 },
    dynamics: { threshold: -14, ratio: 4.0, attackMs: 18, releaseMs: 160, makeupGainDb: 2.8 },
    color: { saturationDrive: 0.55, stereoWidth: 80, reverbWet: 0.0, delayWet: 0.0 },
  },
  {
    id: 'preset-truepeak-master-14',
    name: 'True Peak Master (-14 LUFS)',
    category: 'Master',
    description: 'Streaming-compliant limiter headroom (-1.0 dB True Peak ceiling), transparent multi-band balance, and cross-system translation.',
    target: 'master',
    eq: { lowGain: 1.0, midGain: -0.5, highGain: 1.5, lowCutHz: 25, highAirHz: 16000 },
    dynamics: { threshold: -12, ratio: 2.5, attackMs: 30, releaseMs: 200, makeupGainDb: 2.2 },
    color: { saturationDrive: 0.08, stereoWidth: 110, reverbWet: 0.0, delayWet: 0.0 },
  },
  {
    id: 'preset-club-heavy-master',
    name: 'Johannesburg Club Rig (-9 LUFS)',
    category: 'Master',
    description: 'High-impact sound system punch, tight punchy transient limiter, and controlled low-end weight designed for large club PAs.',
    target: 'master',
    eq: { lowGain: 3.5, midGain: 0.8, highGain: 2.0, lowCutHz: 30, highAirHz: 15000 },
    dynamics: { threshold: -8, ratio: 4.5, attackMs: 12, releaseMs: 110, makeupGainDb: 4.0 },
    color: { saturationDrive: 0.25, stereoWidth: 115, reverbWet: 0.0, delayWet: 0.0 },
  },
  {
    id: 'preset-lofi-vintage-tape',
    name: 'Lo-Fi Vintage Cassette',
    category: 'Creative',
    description: 'Analog tape saturation, rolled off highs at 8kHz, slight stereo flutter and warm harmonic distortion.',
    target: 'channel',
    eq: { lowGain: 2.0, midGain: 1.5, highGain: -5.0, lowCutHz: 180, highAirHz: 7500 },
    dynamics: { threshold: -15, ratio: 3.0, attackMs: 40, releaseMs: 250, makeupGainDb: 2.0 },
    color: { saturationDrive: 0.65, stereoWidth: 95, reverbWet: 0.35, delayWet: 0.25 },
  },
  {
    id: 'preset-crisp-lead-synth',
    name: 'Crisp Lead Synth & Widener',
    category: 'Creative',
    description: 'Wide Haas-effect stereo expansion, glistening high shelf at 10kHz, with synced quarter-note dub echo.',
    target: 'channel',
    eq: { lowGain: -3.0, midGain: 2.0, highGain: 3.5, lowCutHz: 220, highAirHz: 14000 },
    dynamics: { threshold: -14, ratio: 3.0, attackMs: 10, releaseMs: 90, makeupGainDb: 2.5 },
    color: { saturationDrive: 0.20, stereoWidth: 145, reverbWet: 0.30, delayWet: 0.35 },
  },
  {
    id: 'preset-boom-bap-snare',
    name: 'Boom Bap 12-Bit Snare Crack',
    category: 'Drums',
    description: 'Aggressive 200Hz body resonance, punchy 5kHz crack, and gated room tail for raw authentic 90s hip-hop groove.',
    target: 'channel',
    eq: { lowGain: 1.5, midGain: 3.2, highGain: 2.0, lowCutHz: 140, highAirHz: 10000 },
    dynamics: { threshold: -20, ratio: 5.0, attackMs: 5, releaseMs: 65, makeupGainDb: 4.0 },
    color: { saturationDrive: 0.38, stereoWidth: 100, reverbWet: 0.18, delayWet: 0.08 },
  },
];
