/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrackChannel {
  id: string;
  name: string;
  color: string;
  pattern: boolean[];
  muted: boolean;
  solo: boolean;
  volume: number; // 0 to 1
}

export interface DrumPad {
  id: number;
  name: string;
  sub: string;
  type: 'kick' | 'snare' | 'closed_hh' | 'open_hh' | 'clap' | 'tom_low' | 'tom_mid' | 'tom_high' | 'perc1' | 'perc2' | 'cymbal' | 'ride' | 'synth';
  noteIndex?: number;
  hotkey: string;
  color: string;
}

export interface ProjectTrack {
  id: string;
  number: string;
  title: string;
  artist: string;
  format: string;
  duration: string;
  durationSeconds: number;
  bpm: number;
  key: string;
  status: 'Concluído' | 'Em mixagem' | 'Demo';
}

export interface ProductionStage {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'Concluído' | 'Em progresso' | 'Bloqueado';
  progress: number;
  accent: 'moss' | 'ochre' | 'yellow' | 'dim';
  gatesPassed: number;
  gatesTotal: number;
}

export interface MilestoneMetric {
  id: string;
  title: string;
  category: string;
  assignee: string;
  status: 'VERIFIED' | 'IN_REVIEW' | 'FLAGGED' | 'COMPUTED';
  cycle: string;
  gateHash: string;
  completionDate: string;
  score: number;
}

export interface TeamMetric {
  metric: string;
  value: string;
  subtext: string;
  trend: 'up' | 'stable' | 'down';
  change: string;
}
