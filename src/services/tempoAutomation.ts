/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TempoKeyframe {
  id: string;
  step: number; // 0 to 15 (or up to 63 for 4 bars)
  bpm: number; // 60 to 180 BPM
  curve: 'linear' | 'smooth' | 'step';
}

export interface TempoAutomationPreset {
  id: string;
  name: string;
  description: string;
  keyframes: TempoKeyframe[];
}

export const TEMPO_PRESETS: TempoAutomationPreset[] = [
  {
    id: 'constant',
    name: 'Standard Locked (124 BPM)',
    description: 'Flat tempo across all bars with rock-solid studio synchronization.',
    keyframes: [
      { id: 'kf-0', step: 0, bpm: 124, curve: 'linear' },
      { id: 'kf-15', step: 15, bpm: 124, curve: 'linear' },
    ],
  },
  {
    id: 'amapiano-accelerando',
    name: 'Amapiano Accelerando (112 ➔ 118 ➔ 124)',
    description: 'Gradual groove acceleration mimicking South African club build up into the drop.',
    keyframes: [
      { id: 'kf-0', step: 0, bpm: 112, curve: 'smooth' },
      { id: 'kf-4', step: 4, bpm: 114, curve: 'smooth' },
      { id: 'kf-8', step: 8, bpm: 118, curve: 'smooth' },
      { id: 'kf-12', step: 12, bpm: 122, curve: 'smooth' },
      { id: 'kf-15', step: 15, bpm: 124, curve: 'linear' },
    ],
  },
  {
    id: 'club-energy-build',
    name: 'Club Drop Ramp (124 ➔ 134 BPM)',
    description: 'Dynamic tempo climb building anticipation towards the 16th bar release.',
    keyframes: [
      { id: 'kf-0', step: 0, bpm: 124, curve: 'smooth' },
      { id: 'kf-8', step: 8, bpm: 127, curve: 'smooth' },
      { id: 'kf-12', step: 12, bpm: 131, curve: 'smooth' },
      { id: 'kf-15', step: 15, bpm: 134, curve: 'linear' },
    ],
  },
  {
    id: 'halftime-trap',
    name: 'Half-Time Trap Drop (130 ➔ 65 BPM)',
    description: 'Sudden half-time switch for deep 808 sub bass space.',
    keyframes: [
      { id: 'kf-0', step: 0, bpm: 130, curve: 'step' },
      { id: 'kf-8', step: 8, bpm: 65, curve: 'step' },
      { id: 'kf-15', step: 15, bpm: 65, curve: 'step' },
    ],
  },
  {
    id: 'ritardando-outro',
    name: 'Ritardando Outro (124 ➔ 88 BPM)',
    description: 'Cinematic decelerando tapering off smoothly for track endings.',
    keyframes: [
      { id: 'kf-0', step: 0, bpm: 124, curve: 'smooth' },
      { id: 'kf-6', step: 6, bpm: 115, curve: 'smooth' },
      { id: 'kf-11', step: 11, bpm: 98, curve: 'smooth' },
      { id: 'kf-15', step: 15, bpm: 88, curve: 'linear' },
    ],
  },
];

export function calculateBpmAtStep(
  step: number,
  keyframes: TempoKeyframe[],
  fallbackBpm = 124
): number {
  if (!keyframes || keyframes.length === 0) return fallbackBpm;

  // Sort keyframes by step
  const sorted = [...keyframes].sort((a, b) => a.step - b.step);

  // Exact match
  const exact = sorted.find((k) => k.step === step);
  if (exact) return exact.bpm;

  // Before first keyframe
  if (step <= sorted[0].step) return sorted[0].bpm;

  // After last keyframe
  if (step >= sorted[sorted.length - 1].step) {
    return sorted[sorted.length - 1].bpm;
  }

  // Interpolate between prev and next keyframes
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].step <= step && sorted[i + 1].step >= step) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  if (prev.step === next.step) return prev.bpm;

  const t = (step - prev.step) / (next.step - prev.step);

  if (prev.curve === 'step') {
    return prev.bpm;
  }

  if (prev.curve === 'smooth') {
    // S-curve smoothstep interpolation
    const smoothT = t * t * (3 - 2 * t);
    return +(prev.bpm + (next.bpm - prev.bpm) * smoothT).toFixed(1);
  }

  // Linear interpolation
  return +(prev.bpm + (next.bpm - prev.bpm) * t).toFixed(1);
}
