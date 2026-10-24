/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrackChannel, DrumPad } from '../types/audio';
import {
  getAudioContext,
  playKick,
  playSnare,
  playHiHat,
  playClap,
  playTom,
  playCymbal,
  playSynth,
  exportWAVFile,
  NOTES_FREQUENCIES,
} from '../services/audioEngine';
import { TempoAutomationLane } from './TempoAutomationLane';
import {
  TempoKeyframe,
  TEMPO_PRESETS,
  calculateBpmAtStep,
} from '../services/tempoAutomation';
import { MIXING_PRESETS, MixingPreset } from '../services/mixingPresets';
import { projectTracker } from '../services/projectTracker';

interface DawStudioViewProps {
  onOpenMixer: () => void;
  onSelectDashboard: () => void;
  onOpenPlugins?: () => void;
  onOpenSoundPacks?: () => void;
}

const DEFAULT_CHANNELS: TrackChannel[] = [
  {
    id: 'ch-kick',
    name: 'KICK',
    color: '#00f2fe',
    pattern: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    muted: false,
    solo: false,
    volume: 0.9,
  },
  {
    id: 'ch-snare',
    name: 'SNARE',
    color: '#f43f5e',
    pattern: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    muted: false,
    solo: false,
    volume: 0.8,
  },
  {
    id: 'ch-hihat',
    name: 'HI-HAT',
    color: '#E8D56B',
    pattern: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    muted: false,
    solo: false,
    volume: 0.65,
  },
  {
    id: 'ch-synth',
    name: 'SYNTH',
    color: '#8b5cf6',
    pattern: [false, false, true, false, false, false, true, false, false, true, false, false, true, false, false, true],
    muted: false,
    solo: false,
    volume: 0.75,
  },
];

const DRUM_PADS_CONFIG: DrumPad[] = [
  { id: 0, name: 'KICK', sub: 'Pad 1 (1)', type: 'kick', hotkey: '1', color: '#00f2fe' },
  { id: 1, name: 'SNARE', sub: 'Pad 2 (2)', type: 'snare', hotkey: '2', color: '#f43f5e' },
  { id: 2, name: 'CLOSED HH', sub: 'Pad 3 (3)', type: 'closed_hh', hotkey: '3', color: '#E8D56B' },
  { id: 3, name: 'OPEN HH', sub: 'Pad 4 (4)', type: 'open_hh', hotkey: '4', color: '#E8D56B' },
  { id: 4, name: 'CLAP', sub: 'Pad 5 (Q)', type: 'clap', hotkey: 'Q', color: '#C47A2A' },
  { id: 5, name: 'LOW TOM', sub: 'Pad 6 (W)', type: 'tom_low', hotkey: 'W', color: '#6A8A4F' },
  { id: 6, name: 'MID TOM', sub: 'Pad 7 (E)', type: 'tom_mid', hotkey: 'E', color: '#6A8A4F' },
  { id: 7, name: 'HIGH TOM', sub: 'Pad 8 (R)', type: 'tom_high', hotkey: 'R', color: '#6A8A4F' },
  { id: 8, name: 'PERC 1', sub: 'Pad 9 (A)', type: 'perc1', hotkey: 'A', color: '#a855f7' },
  { id: 9, name: 'PERC 2', sub: 'Pad 10 (S)', type: 'perc2', hotkey: 'S', color: '#a855f7' },
  { id: 10, name: 'CYMBAL', sub: 'Pad 11 (D)', type: 'cymbal', hotkey: 'D', color: '#38bdf8' },
  { id: 11, name: 'RIDE', sub: 'Pad 12 (F)', type: 'ride', hotkey: 'F', color: '#38bdf8' },
  { id: 12, name: 'SYNTH C3', sub: 'Pad 13 (Z)', type: 'synth', noteIndex: 11, hotkey: 'Z', color: '#8b5cf6' },
  { id: 13, name: 'SYNTH E3', sub: 'Pad 14 (X)', type: 'synth', noteIndex: 7, hotkey: 'X', color: '#8b5cf6' },
  { id: 14, name: 'SYNTH G3', sub: 'Pad 15 (C)', type: 'synth', noteIndex: 4, hotkey: 'C', color: '#8b5cf6' },
  { id: 15, name: 'SYNTH B3', sub: 'Pad 16 (V)', type: 'synth', noteIndex: 0, hotkey: 'V', color: '#8b5cf6' },
];

export const DawStudioView: React.FC<DawStudioViewProps> = ({
  onOpenMixer,
  onSelectDashboard,
  onOpenPlugins,
  onOpenSoundPacks,
}) => {
  const [channels, setChannels] = useState<TrackChannel[]>(DEFAULT_CHANNELS);
  const [draggedChannelIndex, setDraggedChannelIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(124);
  const [activeTab, setActiveTab] = useState<'stepsequencer' | 'drumpads' | 'pianoroll'>('stepsequencer');
  const [hitPads, setHitPads] = useState<Record<number, boolean>>({});
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Tempo Automation State
  const [showTempoAutomation, setShowTempoAutomation] = useState<boolean>(false);
  const [isAutomationActive, setIsAutomationActive] = useState<boolean>(true);
  const [tempoKeyframes, setTempoKeyframes] = useState<TempoKeyframe[]>(() => TEMPO_PRESETS[1].keyframes);

  // Mixing Preset State
  const [activeMixingPreset, setActiveMixingPreset] = useState<string | null>('preset-amapiano-log-punch');
  const [mixingNotice, setMixingNotice] = useState<string | null>(null);

  const tempoKeyframesRef = useRef<TempoKeyframe[]>(tempoKeyframes);
  const isAutomationActiveRef = useRef<boolean>(isAutomationActive);
  const bpmRef = useRef<number>(bpm);
  const isPlayingRef = useRef<boolean>(false);
  const stepTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    tempoKeyframesRef.current = tempoKeyframes;
  }, [tempoKeyframes]);

  useEffect(() => {
    isAutomationActiveRef.current = isAutomationActive;
  }, [isAutomationActive]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Drag and drop reordering handlers (Reorderable Grid UI Pattern)
  const handleDragStart = (index: number) => {
    setDraggedChannelIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedChannelIndex === null || draggedChannelIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedChannelIndex === null || draggedChannelIndex === index) {
      setDraggedChannelIndex(null);
      setDragOverIndex(null);
      return;
    }

    setChannels((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedChannelIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });

    setDraggedChannelIndex(null);
    setDragOverIndex(null);
  };

  // Piano roll matrix: 12 notes x 16 steps
  const [pianoGrid, setPianoGrid] = useState<boolean[][]>(() => {
    return Array.from({ length: 12 }, (_, noteIdx) =>
      Array.from({ length: 16 }, (_, stepIdx) => {
        // Preset an arpeggio pattern in F# min / A
        if (noteIdx === 4 && (stepIdx === 2 || stepIdx === 6 || stepIdx === 10)) return true;
        if (noteIdx === 7 && (stepIdx === 0 || stepIdx === 8 || stepIdx === 14)) return true;
        if (noteIdx === 11 && (stepIdx === 4 || stepIdx === 12)) return true;
        return false;
      })
    );
  });

  const stepIntervalRef = useRef<number | null>(null);
  const channelsRef = useRef<TrackChannel[]>(channels);
  channelsRef.current = channels;

  const pianoGridRef = useRef<boolean[][]>(pianoGrid);
  pianoGridRef.current = pianoGrid;

  const currentStepRef = useRef<number>(0);

  // Trigger sound based on pad ID or type
  const triggerPad = useCallback((padId: number) => {
    const ctx = getAudioContext();
    const dest = ctx.destination;
    const now = ctx.currentTime;
    const pad = DRUM_PADS_CONFIG.find((p) => p.id === padId);
    if (!pad) return;

    // Visual hit flash
    setHitPads((prev) => ({ ...prev, [padId]: true }));
    setTimeout(() => {
      setHitPads((prev) => ({ ...prev, [padId]: false }));
    }, 120);

    switch (pad.type) {
      case 'kick':
        playKick(ctx, dest, now);
        break;
      case 'snare':
        playSnare(ctx, dest, now);
        break;
      case 'closed_hh':
        playHiHat(ctx, dest, now, false);
        break;
      case 'open_hh':
        playHiHat(ctx, dest, now, true);
        break;
      case 'clap':
        playClap(ctx, dest, now);
        break;
      case 'tom_low':
        playTom(ctx, dest, 120, now);
        break;
      case 'tom_mid':
        playTom(ctx, dest, 160, now);
        break;
      case 'tom_high':
        playTom(ctx, dest, 210, now);
        break;
      case 'perc1':
        playTom(ctx, dest, 320, now);
        break;
      case 'perc2':
        playClap(ctx, dest, now);
        break;
      case 'cymbal':
        playCymbal(ctx, dest, now);
        break;
      case 'ride':
        playHiHat(ctx, dest, now, true);
        break;
      case 'synth':
        if (pad.noteIndex !== undefined) {
          const freq = NOTES_FREQUENCIES[pad.noteIndex]?.freq || 220;
          playSynth(ctx, dest, freq, now, 'sawtooth');
        }
        break;
    }
  }, []);

  // Step sequencer clock step function
  const stepClock = useCallback(() => {
    const ctx = getAudioContext();
    const dest = ctx.destination;
    const now = ctx.currentTime;
    const step = currentStepRef.current;

    // Check channels solo state
    const hasSolo = channelsRef.current.some((c) => c.solo);

    channelsRef.current.forEach((ch) => {
      const isAudible = hasSolo ? ch.solo : !ch.muted;
      if (isAudible && ch.pattern[step]) {
        if (ch.name === 'KICK') playKick(ctx, dest, now);
        if (ch.name === 'SNARE') playSnare(ctx, dest, now);
        if (ch.name === 'HI-HAT') playHiHat(ctx, dest, now, false);
        if (ch.name === 'SYNTH') {
          // Check if any piano roll notes triggered at this step
          let triggeredNote = false;
          pianoGridRef.current.forEach((row, noteIdx) => {
            if (row[step]) {
              playSynth(ctx, dest, NOTES_FREQUENCIES[noteIdx].freq, now, 'sawtooth');
              triggeredNote = true;
            }
          });
          if (!triggeredNote) {
            playSynth(ctx, dest, 196, now, 'sawtooth');
          }
        }
      }
    });

    setCurrentStep(step);
    currentStepRef.current = (step + 1) % 16;
  }, []);

  // Dynamic tempo step scheduler for authentic African groove and tempo automation
  const runNextStep = useCallback(() => {
    if (!isPlayingRef.current) return;
    stepClock();

    const nextStep = currentStepRef.current;
    const effectiveBpm = isAutomationActiveRef.current
      ? calculateBpmAtStep(nextStep, tempoKeyframesRef.current, bpmRef.current)
      : bpmRef.current;
    const stepMs = Math.max(20, (60 / effectiveBpm / 4) * 1000);

    stepTimeoutRef.current = window.setTimeout(runNextStep, stepMs);
  }, [stepClock]);

  // Play / Pause toggle
  const togglePlay = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
        stepTimeoutRef.current = null;
      }
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      runNextStep();
    }
  };

  // Stop sequence and reset playhead
  const stopSequence = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    currentStepRef.current = 0;
    setCurrentStep(0);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  const handleApplyMixingPreset = (presetId: string) => {
    const found = MIXING_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setActiveMixingPreset(presetId);
    setMixingNotice(`Applied "${found.name}" (${found.category})`);
    setTimeout(() => setMixingNotice(null), 3000);
    projectTracker.touchProject('proj-horizonte', `Applied mixing preset: ${found.name}`);
  };

  // Keyboard shortcut listener for drum pads
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const key = e.key.toUpperCase();
      const pad = DRUM_PADS_CONFIG.find((p) => p.hotkey === key);
      if (pad) {
        e.preventDefault();
        triggerPad(pad.id);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPad, isPlaying]);

  // Toggle step pattern in channel rack
  const toggleStep = (chIdx: number, stepIdx: number) => {
    setChannels((prev) =>
      prev.map((ch, idx) => {
        if (idx !== chIdx) return ch;
        const newPattern = [...ch.pattern];
        newPattern[stepIdx] = !newPattern[stepIdx];
        return { ...ch, pattern: newPattern };
      })
    );
  };

  // Toggle mute
  const toggleMute = (chIdx: number) => {
    setChannels((prev) =>
      prev.map((ch, idx) => (idx === chIdx ? { ...ch, muted: !ch.muted } : ch))
    );
  };

  // Toggle solo
  const toggleSolo = (chIdx: number) => {
    setChannels((prev) =>
      prev.map((ch, idx) => (idx === chIdx ? { ...ch, solo: !ch.solo } : ch))
    );
  };

  // Piano cell toggle
  const togglePianoCell = (noteIdx: number, stepIdx: number) => {
    const ctx = getAudioContext();
    playSynth(ctx, ctx.destination, NOTES_FREQUENCIES[noteIdx].freq, undefined, 'sawtooth');

    setPianoGrid((prev) =>
      prev.map((row, r) =>
        r === noteIdx
          ? row.map((cell, s) => (s === stepIdx ? !cell : cell))
          : row
      )
    );
  };

  // Export 16-bit PCM WAV loop
  const handleExportWAV = async () => {
    try {
      setIsExporting(true);
      setExportNotice('Rendering audio in 16-bit PCM 44.1kHz...');
      const blob = await exportWAVFile(channels, bpm, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluid_studio_loop_${bpm}bpm.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportNotice('Loop exported successfully! (fluid_studio_loop.wav)');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      setExportNotice('Error exporting audio loop.');
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const barNumber = Math.floor(currentStep / 4) + 1;
  const beatNumber = (currentStep % 4) + 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] pt-16 bg-[#07090A] text-[#E8E6E0] font-mono-code select-none">
      {/* Top DAW Toolbar */}
      <div className="h-12 px-5 sm:px-8 border-b border-[#E8E6E0]/10 bg-[#0B0F12] flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectDashboard}
            className="text-[10px] tracking-[0.14em] uppercase text-[#E8E6E0]/50 hover:text-[#E8E6E0] flex items-center gap-1 cursor-pointer"
          >
            <span>←</span>
            <span>Overview</span>
          </button>
          <span className="text-[#E8E6E0]/20">/</span>
          <span className="text-xs font-bold tracking-wider text-[#C47A2A]">HORIZONTE · BEAT LAB WORKSPACE</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mixingNotice && (
            <span className="text-[10px] tracking-wider text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 border border-[#10b981]/40 rounded animate-fade-in hidden md:inline">
              ✓ {mixingNotice}
            </span>
          )}

          {/* Mixing Presets Dropdown */}
          <div className="flex items-center gap-1 bg-[#12141d] px-2 py-1 rounded border border-[#E8E6E0]/15 text-[10px]">
            <span className="text-[#E8D56B] font-bold hidden sm:inline">PRESET:</span>
            <select
              aria-label="Mixing preset selector"
              value={activeMixingPreset || ''}
              onChange={(e) => handleApplyMixingPreset(e.target.value)}
              className="bg-transparent text-[#E8E6E0] font-mono text-[10px] focus:outline-none cursor-pointer"
            >
              {MIXING_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#0B0F12] text-white">
                  [{preset.category}] {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tempo Automation Lane Toggle */}
          <button
            onClick={() => setShowTempoAutomation((prev) => !prev)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded tracking-wider cursor-pointer transition-all border ${
              showTempoAutomation
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe] shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                : 'bg-[#12141d] text-[#E8E6E0]/70 border-[#E8E6E0]/15 hover:border-[#00f2fe]/40'
            }`}
          >
            ⏱ TEMPO LANE
          </button>

          {/* Plugins Rack */}
          {onOpenPlugins && (
            <button
              onClick={onOpenPlugins}
              className="px-2.5 py-1 bg-[#12141d] hover:bg-[#1c2233] text-[#E8D56B] border border-[#E8D56B]/40 rounded text-[10px] font-bold tracking-wider cursor-pointer"
            >
              🔌 PLUGINS
            </button>
          )}

          {/* Sound Packs */}
          {onOpenSoundPacks && (
            <button
              onClick={onOpenSoundPacks}
              className="px-2.5 py-1 bg-[#12141d] hover:bg-[#1c2233] text-[#C47A2A] border border-[#C47A2A]/40 rounded text-[10px] font-bold tracking-wider cursor-pointer"
            >
              📦 PACKS
            </button>
          )}

          {exportNotice && (
            <span className="text-[10px] tracking-wider text-[#E8D56B] bg-[#E8D56B]/10 px-2 py-0.5 border border-[#E8D56B]/30 animate-pulse hidden sm:inline">
              {exportNotice}
            </span>
          )}
          <button
            onClick={handleExportWAV}
            disabled={isExporting}
            className="px-3 py-1 bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 text-white text-[10px] font-semibold tracking-wider cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? 'EXPORTING...' : 'EXPORT WAV'}
          </button>
          <button
            onClick={onOpenMixer}
            className="px-3 py-1 border border-[#00f2fe]/40 text-[#00f2fe] hover:bg-[#00f2fe]/10 text-[10px] tracking-wider cursor-pointer transition-all"
          >
            MIXER PiP
          </button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-14 bg-[#0B0F12] border-b border-[#E8E6E0]/10 overflow-x-auto relative flex items-center">
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#f43f5e] shadow-[0_0_10px_#f43f5e] z-30 pointer-events-none transition-[left] duration-75"
          style={{ left: `${(currentStep / 16) * 100}%` }}
        />

        <div className="flex h-full w-full min-w-[640px] relative">
          {Array.from({ length: 16 }).map((_, i) => {
            const isDownbeat = i % 4 === 0;
            const isCurrent = currentStep === i;
            return (
              <div
                key={i}
                className={`flex-1 border-r border-[#E8E6E0]/10 flex flex-col justify-between p-1.5 text-[9px] font-mono-code transition-colors ${
                  isDownbeat ? 'bg-[#00f2fe]/[0.03] border-r-[#00f2fe]/30 text-[#00f2fe]/80' : 'text-[#E8E6E0]/40'
                } ${isCurrent ? 'bg-[#f43f5e]/15' : ''}`}
              >
                <span>
                  {Math.floor(i / 4) + 1}.{(i % 4) + 1}
                </span>
                <span className="text-[7px] text-[#E8E6E0]/20">16th</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tempo Automation Lane */}
      {showTempoAutomation && (
        <div className="px-4 sm:px-8 bg-[#0B0F12] border-b border-[#E8E6E0]/10">
          <TempoAutomationLane
            currentStep={currentStep}
            isPlaying={isPlaying}
            baseBpm={bpm}
            keyframes={tempoKeyframes}
            onKeyframesChange={(kfs) => setTempoKeyframes(kfs)}
            isAutomationEnabled={isAutomationActive}
            onToggleAutomation={() => setIsAutomationActive((p) => !p)}
          />
        </div>
      )}

      {/* Editor & Sequencer View Body */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr] overflow-hidden bg-[#07090A]">
        {/* Left: Channel Rack & Sequencer Grid */}
        <div className="bg-[#0B0F12] border-r border-[#E8E6E0]/10 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] tracking-widest text-[#E8E6E0]/40 uppercase pb-2 border-b border-[#E8E6E0]/10">
            <span>CHANNEL RACK (REORDERABLE)</span>
            <span>MUTE / SOLO</span>
          </div>

          {channels.map((ch, chIdx) => {
            const isDragging = draggedChannelIndex === chIdx;
            const isOver = dragOverIndex === chIdx;

            return (
              <div
                key={ch.id}
                draggable
                onDragStart={() => handleDragStart(chIdx)}
                onDragOver={(e) => handleDragOver(e, chIdx)}
                onDrop={() => handleDrop(chIdx)}
                className={`bg-[#12141d] border p-2.5 rounded-sm flex flex-col gap-2 transition-all cursor-move select-none ${
                  isDragging ? 'opacity-40 scale-95 border-dashed border-[#E8D56B]' : 'border-[#E8E6E0]/10'
                } ${isOver ? 'border-t-2 border-t-[#C47A2A] bg-[#1a1d2b]' : ''}`}
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Drag Grip Handle */}
                    <span className="text-[#E8E6E0]/30 hover:text-[#E8E6E0] cursor-grab text-xs">
                      ⋮⋮
                    </span>
                    <span className="text-xs font-bold tracking-wide" style={{ color: ch.color }}>
                      {ch.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleMute(chIdx)}
                      className={`px-2 py-0.5 text-[9px] font-bold border transition-colors cursor-pointer ${
                        ch.muted
                          ? 'bg-[#f43f5e] text-white border-[#f43f5e]'
                          : 'bg-[#07090A] text-[#E8E6E0]/40 border-[#E8E6E0]/20 hover:text-[#E8E6E0]'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => toggleSolo(chIdx)}
                      className={`px-2 py-0.5 text-[9px] font-bold border transition-colors cursor-pointer ${
                        ch.solo
                          ? 'bg-[#E8D56B] text-[#07090A] border-[#E8D56B]'
                          : 'bg-[#07090A] text-[#E8E6E0]/40 border-[#E8E6E0]/20 hover:text-[#E8E6E0]'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>

              {/* 16-step mini toggle strip */}
              <div className="grid grid-cols-16 gap-[2px]">
                {ch.pattern.map((active, stepIdx) => {
                  const isCurrent = currentStep === stepIdx;
                  return (
                    <div
                      key={stepIdx}
                      onClick={() => toggleStep(chIdx, stepIdx)}
                      className={`h-6 rounded-[2px] cursor-pointer transition-all ${
                        active
                          ? 'shadow-[inset_0_0_4px_rgba(255,255,255,0.4)]'
                          : 'bg-[#07090A] hover:bg-[#1a1d2b]'
                      } ${isCurrent ? 'ring-1 ring-[#f43f5e]' : ''} ${stepIdx % 4 === 0 ? 'opacity-100' : 'opacity-85'}`}
                      style={{
                        backgroundColor: active ? ch.color : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>

        {/* Right: Tabs & Performance Surfaces (Drumpads or Piano Roll) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#07090A]">
          {/* Tab Selector */}
          <div className="flex bg-[#0B0F12] border-b border-[#E8E6E0]/10 px-4">
            <button
              onClick={() => setActiveTab('stepsequencer')}
              className={`py-3 px-5 text-xs font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
                activeTab === 'stepsequencer'
                  ? 'text-[#C47A2A] border-[#C47A2A]'
                  : 'text-[#E8E6E0]/40 border-transparent hover:text-[#E8E6E0]'
              }`}
            >
              16-STEP MATRIX
            </button>
            <button
              onClick={() => setActiveTab('drumpads')}
              className={`py-3 px-5 text-xs font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
                activeTab === 'drumpads'
                  ? 'text-[#00f2fe] border-[#00f2fe]'
                  : 'text-[#E8E6E0]/40 border-transparent hover:text-[#E8E6E0]'
              }`}
            >
              DRUMPADS (4×4)
            </button>
            <button
              onClick={() => setActiveTab('pianoroll')}
              className={`py-3 px-5 text-xs font-bold tracking-wider cursor-pointer border-b-2 transition-all ${
                activeTab === 'pianoroll'
                  ? 'text-[#8b5cf6] border-[#8b5cf6]'
                  : 'text-[#E8E6E0]/40 border-transparent hover:text-[#E8E6E0]'
              }`}
            >
              PIANO ROLL (MELODY)
            </button>
          </div>

          {/* View A: Full 16-Step Pattern Workspace */}
          {activeTab === 'stepsequencer' && (
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between text-xs text-[#E8E6E0]/60 pb-2 border-b border-[#E8E6E0]/10">
                  <span>CHANNEL &amp; PAD ASSIGNMENT</span>
                  <span>16 STEPS / 4 BEATS · CLICK TO TOGGLE</span>
                </div>

                {channels.map((ch, chIdx) => (
                  <div key={ch.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ch.color }}
                        />
                        <span className="font-bold text-sm text-[#E8E6E0]">{ch.name}</span>
                        <span className="text-[10px] text-[#E8E6E0]/40">
                          {ch.pattern.filter(Boolean).length} triggers
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setChannels((prev) =>
                              prev.map((c, i) =>
                                i === chIdx ? { ...c, pattern: Array(16).fill(false) } : c
                              )
                            );
                          }}
                          className="text-[9px] text-[#E8E6E0]/40 hover:text-[#E8E6E0] uppercase cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => {
                            setChannels((prev) =>
                              prev.map((c, i) =>
                                i === chIdx
                                  ? {
                                      ...c,
                                      pattern: Array.from({ length: 16 }, (_, s) => s % 4 === 0),
                                    }
                                  : c
                              )
                            );
                          }}
                          className="text-[9px] text-[#E8D56B]/70 hover:text-[#E8D56B] uppercase cursor-pointer"
                        >
                          4-Beat
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-16 gap-1.5 sm:gap-2">
                      {ch.pattern.map((active, stepIdx) => {
                        const isCurrent = currentStep === stepIdx;
                        const isQuarter = stepIdx % 4 === 0;

                        return (
                          <button
                            key={stepIdx}
                            onClick={() => toggleStep(chIdx, stepIdx)}
                            className={`h-14 sm:h-16 rounded-md border flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${
                              active
                                ? 'border-white/30 text-[#07090A] shadow-md font-bold'
                                : isQuarter
                                ? 'bg-[#12141d] border-[#E8E6E0]/20 text-[#E8E6E0]/30 hover:border-[#E8E6E0]/40'
                                : 'bg-[#0B0F12] border-[#E8E6E0]/10 text-[#E8E6E0]/20 hover:border-[#E8E6E0]/30'
                            } ${isCurrent ? 'ring-2 ring-[#f43f5e] scale-95' : ''}`}
                            style={{
                              backgroundColor: active ? ch.color : undefined,
                            }}
                          >
                            <span className="text-[8px] opacity-70">{stepIdx + 1}</span>
                            <span className="text-[10px]">{active ? '●' : '·'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View B: 4x4 Drumpads Grid */}
          {activeTab === 'drumpads' && (
            <div className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-auto">
              <div className="grid grid-cols-4 grid-rows-4 gap-3 sm:gap-4 w-full max-w-[540px] aspect-square">
                {DRUM_PADS_CONFIG.map((pad) => {
                  const isHit = hitPads[pad.id];
                  return (
                    <button
                      key={pad.id}
                      onClick={() => triggerPad(pad.id)}
                      className={`relative rounded-xl border p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-75 select-none active:scale-95 ${
                        isHit
                          ? 'scale-95 shadow-[0_0_25px_var(--accent-glow)]'
                          : 'bg-gradient-to-br from-[#1c1f2e] to-[#12141f] border-[#E8E6E0]/15 hover:border-[#E8E6E0]/40 shadow-lg'
                      }`}
                      style={
                        isHit
                          ? {
                              backgroundColor: pad.color,
                              color: '#07090A',
                              borderColor: pad.color,
                              boxShadow: `0 0 25px ${pad.color}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-xs sm:text-sm font-extrabold tracking-wide">
                        {pad.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono tracking-widest mt-1 ${
                          isHit ? 'text-[#07090A]/80' : 'text-[#E8E6E0]/40'
                        }`}
                      >
                        [{pad.hotkey}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View C: Piano Roll Grid */}
          {activeTab === 'pianoroll' && (
            <div className="flex-1 overflow-auto bg-[#0A0B10] p-4 relative">
              <div className="text-[10px] text-[#E8E6E0]/40 mb-3 tracking-widest flex items-center justify-between">
                <span>C3–B3 NOTE MATRIX (SAWTOOTH SYNTH) · CLICK TO AUDITION &amp; SCHEDULE</span>
                <span>SYNCED TO SYNTH TRACK</span>
              </div>

              <div className="grid grid-cols-[60px_1fr] border border-[#E8E6E0]/15 bg-[#0B0F12]">
                {/* Note Labels Column */}
                <div className="flex flex-col border-r border-[#E8E6E0]/15">
                  {NOTES_FREQUENCIES.map((note, r) => {
                    const isSharp = note.name.includes('#');
                    return (
                      <div
                        key={r}
                        onClick={() => {
                          const ctx = getAudioContext();
                          playSynth(ctx, ctx.destination, note.freq, undefined, 'sawtooth');
                        }}
                        className={`h-7 px-2 flex items-center justify-between text-[10px] font-bold border-b border-[#E8E6E0]/10 cursor-pointer transition-colors ${
                          isSharp ? 'bg-[#07090A] text-[#E8D56B]' : 'bg-[#12141d] text-[#E8E6E0]'
                        } hover:bg-[#8b5cf6]/20`}
                      >
                        <span>{note.name}</span>
                        <span className="text-[8px] text-[#E8E6E0]/30 font-normal">
                          {Math.round(note.freq)}Hz
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 16 Steps Grid */}
                <div className="overflow-x-auto">
                  <div
                    className="grid grid-cols-16 min-w-[560px]"
                    style={{ gridTemplateRows: 'repeat(12, 28px)' }}
                  >
                    {pianoGrid.map((row, r) =>
                      row.map((active, s) => {
                        const isCurrent = currentStep === s;
                        const isSharp = NOTES_FREQUENCIES[r].name.includes('#');
                        return (
                          <div
                            key={`${r}-${s}`}
                            onClick={() => togglePianoCell(r, s)}
                            className={`border-r border-b border-[#E8E6E0]/10 cursor-pointer transition-all ${
                              active
                                ? 'bg-[#8b5cf6] shadow-[inset_0_0_8px_rgba(255,255,255,0.6)]'
                                : isSharp
                                ? 'bg-[#07090A] hover:bg-[#1a1d2b]'
                                : 'bg-[#10131e] hover:bg-[#1f2334]'
                            } ${isCurrent ? 'ring-1 ring-[#f43f5e]' : ''}`}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Bar */}
      <footer className="h-16 bg-[#0B0F12] border-t border-[#E8E6E0]/10 px-5 sm:px-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Play Button */}
          <button
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all active:scale-95 ${
              isPlaying
                ? 'bg-[#E8D56B] text-[#07090A] shadow-[0_0_15px_#E8D56B]'
                : 'bg-[#10b981] text-[#07090A] shadow-[0_0_12px_#10b981]'
            }`}
            title="Play / Pause (Barra de espaço)"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopSequence}
            className="w-10 h-10 rounded-full bg-[#f43f5e] hover:bg-[#f43f5e]/90 text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all active:scale-95"
            title="Stop & Reset"
          >
            ■
          </button>

          {/* BPM Control */}
          <div className="flex items-center gap-2 text-xs text-[#E8E6E0]/60">
            <span>BPM</span>
            <input
              type="number"
              min={60}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(Math.max(60, Math.min(220, Number(e.target.value))))}
              className="w-14 bg-[#07090A] border border-[#E8E6E0]/20 text-[#00f2fe] text-center font-bold px-1 py-1 rounded text-xs focus:outline-none focus:border-[#00f2fe]"
            />
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-20 hidden md:inline-block accent-[#00f2fe]"
            />
          </div>
        </div>

        {/* Position & DSP stat */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-[10px] text-[#E8E6E0]/40 font-mono hidden sm:inline">
            DSP: 0.1ms · 44.1kHz
          </div>
          <div className="text-sm font-bold tracking-widest text-[#00f2fe] tabular-nums">
            01 : 0{barNumber} : 0{beatNumber}
          </div>
        </div>
      </footer>
    </div>
  );
};
