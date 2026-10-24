/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { projectTracker, TrackedProject } from '../services/projectTracker';

interface DashboardViewProps {
  onOpenDaw: () => void;
  onOpenImport: () => void;
  onOpenLyrics: () => void;
  onSelectProofBridge: () => void;
  onOpenLindiwe: () => void;
  onOpenUbuntuDj?: () => void;
}

interface RealAudioTrack {
  id: string;
  number: string;
  title: string;
  artist: string;
  format: string;
  duration: string;
  bpm: number;
  key: string;
  audioSrc: string;
  stageBadge: string;
}

const REAL_TRACKS: RealAudioTrack[] = [
  {
    id: 'track-1',
    number: '01',
    title: 'Horizonte (Master Stems Mix)',
    artist: 'Mino Enchilotto · Otis TayNino',
    format: 'WAV · 24-bit / 48 kHz',
    duration: '03:42',
    bpm: 124,
    key: 'F# min',
    audioSrc: '/assets/aistudio/Mino_Enchilotto___Otis_TayNino_-_6LACK_3f0bf1eb.mp3',
    stageBadge: 'Tuning & Mix',
  },
  {
    id: 'track-2',
    number: '02',
    title: 'Mino Enchilotto - Vent (Raw Confession)',
    artist: 'Mino Enchilotto',
    format: 'WAV · 24-bit / 48 kHz',
    duration: '03:55',
    bpm: 96,
    key: 'D min',
    audioSrc: '/assets/aistudio/mino-enchilotto_mino-enchilotto-vent_d6798f78.mp3',
    stageBadge: 'Mastering Suite',
  },
  {
    id: 'track-3',
    number: '03',
    title: 'Homegrown (Chill Soul Instrumental)',
    artist: 'Homage Beats · Papamitrou',
    format: 'WAV · 24-bit / 48 kHz',
    duration: '03:16',
    bpm: 92,
    key: 'A min',
    audioSrc: '/assets/aistudio/_SOLD__J_Cole_x_Kendrick_Lamar_Type_Beat_Chill_Hip_Hop_Instrumental_2017____Homegrown___Prod_Homage__eee89af4.mp3',
    stageBadge: 'Capture & Edit',
  },
  {
    id: 'track-4',
    number: '04',
    title: 'Hillside Therapy (Night Session)',
    artist: 'Mino Enchilotto',
    format: 'WAV · 24-bit / 48 kHz',
    duration: '04:08',
    bpm: 118,
    key: 'C# min',
    audioSrc: '/assets/aistudio/Hillside_Therapy_4827260b.mp3',
    stageBadge: 'Delivery & QC',
  },
];

const WORKFLOW_STAGES = [
  {
    id: 'stage-1',
    number: '01',
    title: 'Capture & Edit',
    description: 'Organize takes, comp recordings, and arrange raw stem material.',
    status: 'Completed',
    progress: 100,
    accent: 'moss',
    gates: '6 / 6 Gates Verified',
  },
  {
    id: 'stage-2',
    number: '02',
    title: 'Tuning & Mix',
    description: 'Balance levels, stereo pan, EQ curves, space, and dynamic punch.',
    status: 'In Progress',
    progress: 64,
    accent: 'yellow',
    gates: '5 / 7 Gates Verified',
  },
  {
    id: 'stage-3',
    number: '03',
    title: 'Mastering Suite',
    description: 'Dial in True Peak loudness, limiter headroom, and cross-system translation.',
    status: 'Pending',
    progress: 20,
    accent: 'ochre',
    gates: '1 / 5 Gates Verified',
  },
  {
    id: 'stage-4',
    number: '04',
    title: 'Delivery & QC',
    description: 'Verify quality control profile gates and export lossless master files.',
    status: 'Locked',
    progress: 0,
    accent: 'dim',
    gates: 'Awaiting Master Pass',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenDaw,
  onOpenImport,
  onOpenLyrics,
  onSelectProofBridge,
  onOpenLindiwe,
  onOpenUbuntuDj,
}) => {
  const [projects, setProjects] = useState<TrackedProject[]>(() => projectTracker.getAllProjects());
  const [activeProject, setActiveProject] = useState<TrackedProject>(() => projectTracker.getActiveProject());
  const [selectedStage, setSelectedStage] = useState<typeof WORKFLOW_STAGES[0] | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0.38);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [waveformBars, setWaveformBars] = useState<{ height: number; color: string; opacity: number }[]>([]);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const playbackTimerRef = useRef<number | null>(null);

  // Subscribe to project tracker changes
  useEffect(() => {
    return projectTracker.subscribe(() => {
      setProjects(projectTracker.getAllProjects());
      setActiveProject(projectTracker.getActiveProject());
    });
  }, []);

  // Generate 72 waveform bars in ochre, yellow, moss
  useEffect(() => {
    const BAR_COUNT = 72;
    const colors = ['#C47A2A', '#E8D56B', '#6A8A4F'];
    const bars: { height: number; color: string; opacity: number }[] = [];

    for (let i = 0; i < BAR_COUNT; i++) {
      const center = BAR_COUNT / 2;
      const dist = Math.abs(i - center) / center;
      const envelope = 1 - Math.pow(dist, 1.8);
      const noise = 0.5 + Math.random() * 0.5;
      const height = Math.max(6, envelope * noise * 74);
      const r = Math.random();
      let color: string;
      if (r < 0.55) color = colors[0];
      else if (r < 0.85) color = colors[1];
      else color = colors[2];

      bars.push({
        height,
        color,
        opacity: 0.55 + Math.random() * 0.45,
      });
    }
    setWaveformBars(bars);
  }, []);

  // Real audio playback
  const handleTogglePlayTrack = (track: RealAudioTrack) => {
    if (playingTrackId === track.id && isPlayingAudio) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlayingAudio(false);
      setPlayingTrackId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(track.audioSrc);
    audioElementRef.current = audio;
    audio.play().catch((e) => console.warn('Audio play request interrupted', e));

    setIsPlayingAudio(true);
    setPlayingTrackId(track.id);

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setPlaybackProgress(audio.currentTime / audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setPlayingTrackId(null);
    };

    projectTracker.touchProject(activeProject.id, `Auditioned track: ${track.title}`);
  };

  const handleToggleActiveProjectWaveform = () => {
    const track = REAL_TRACKS[0];
    handleTogglePlayTrack(track);
  };

  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  const formatCurrentTime = (ratio: number) => {
    const total = 222; // 03:42
    const current = Math.floor(ratio * total);
    const m = Math.floor(current / 60);
    const s = current % 60;
    return `0${m}:${s < 10 ? '0' : ''}${s} / 03:42`;
  };

  return (
    <main className="max-w-[960px] mx-auto px-5 sm:px-10 pt-28 pb-20 font-mono-code transition-all duration-700">
      {/* 1. Standardized Studio Hero */}
      <section className="mb-14">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#E8E6E0]/50">
            Wednesday · 23 Oct 2026 · en-ZA
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 font-mono tracking-wider">
              EN (Studio Default)
            </span>
            <button
              onClick={onOpenLindiwe}
              className="text-[10px] px-2 py-0.5 bg-[#C47A2A]/20 text-[#C47A2A] border border-[#C47A2A]/40 hover:bg-[#C47A2A]/30 cursor-pointer transition-colors"
            >
              Lindiwe Induction ➔
            </button>
          </div>
        </div>

        <h1 className="font-display font-bold italic text-5xl sm:text-7xl tracking-[-1.5px] leading-tight text-[#E8E6E0] mb-3">
          Welcome back to the session, <em className="italic text-[#C47A2A]">Mino.</em>
        </h1>
        <p className="text-[15px] leading-relaxed text-[#E8E6E0]/60 max-w-[560px] mb-8 font-sans">
          Pick up where you left off. Keep the rhythm moving and production fluid. Stems and routing matrices are verified by ProofBridge IVE.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#E8E6E0]/20 text-[#E8E6E0] hover:bg-[#E8E6E0]/5 hover:border-[#E8E6E0]/40 text-xs tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Import Audio</span>
          </button>

          <button
            onClick={onOpenDaw}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C47A2A] text-[#07090A] hover:bg-[#C47A2A]/90 font-bold text-xs tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-[#C47A2A]/20"
          >
            <span>Open Beat Lab</span>
            <span>→</span>
          </button>

          <button
            onClick={onOpenLyrics}
            className="inline-flex items-center gap-2 px-5 py-3 border border-[#E8D56B]/40 text-[#E8D56B] hover:bg-[#E8D56B]/10 font-bold text-xs tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer"
          >
            <span>✍ Lyrical Library</span>
          </button>

          {onOpenUbuntuDj && (
            <button
              onClick={onOpenUbuntuDj}
              className="inline-flex items-center gap-2 px-5 py-3 border border-[#00f2fe]/40 text-[#00f2fe] hover:bg-[#00f2fe]/10 font-bold text-xs tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-[#00f2fe]/10"
            >
              <span>UbuntuDJ Parallel</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#00f2fe]/20 rounded font-mono">DUAL</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Active Project Card (Horizonte) with Last Modified Tracker */}
      <section className="relative border border-[#E8E6E0]/15 bg-gradient-to-b from-[#0B0F12] to-[#0F1418] p-6 sm:p-10 mb-16 overflow-hidden">
        {/* Subtle radial glow background */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(196,122,42,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Project Status & Last Modified Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-[#E8E6E0]/60">
            <span className="w-2 h-2 rounded-full bg-[#6A8A4F] shadow-[0_0_12px_#6A8A4F]" />
            <span>Active Project</span>
            <span className="text-[#E8E6E0]/20">/</span>
            <span className="text-[#E8D56B]">{activeProject.stage}</span>
          </div>

          {/* DYNAMIC LAST MODIFIED LABEL */}
          <div
            className="text-[11px] text-[#E8D56B] bg-[#E8D56B]/10 border border-[#E8D56B]/30 px-2.5 py-0.5 rounded font-mono tracking-wider"
            title={`Exact: ${projectTracker.formatExactDateTime(activeProject.lastModified)}`}
          >
            Last modified {projectTracker.formatRelativeTime(activeProject.lastModified)}
          </div>
        </div>

        {/* Title & Meta */}
        <h2 className="font-display font-bold text-5xl sm:text-6xl tracking-[-1.5px] leading-none mb-3 text-[#E8E6E0]">
          {activeProject.title}
        </h2>
        <div className="text-[13px] text-[#E8E6E0]/50 mb-7 tracking-[0.02em]">
          Album · {activeProject.tracksCount} tracks · Key: {activeProject.key} · {activeProject.bpm} BPM · {activeProject.sampleRate / 1000} kHz {activeProject.bitDepth}-bit
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="flex-1 h-[3px] bg-[#E8E6E0]/10 relative overflow-hidden">
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                width: `${activeProject.progress}%`,
                background: 'linear-gradient(90deg, #6A8A4F 0%, #E8D56B 100%)',
              }}
            />
          </div>
          <span className="text-xs text-[#E8E6E0]/60 tracking-[0.05em] tabular-nums whitespace-nowrap">
            {activeProject.progress}% completed
          </span>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenDaw}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F5F0E0] text-[#07090A] hover:bg-[#E8E6E0] font-semibold text-xs tracking-[0.14em] uppercase cursor-pointer transition-all active:scale-98"
          >
            <span>Open in Beat Lab</span>
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>

          <button
            onClick={handleToggleActiveProjectWaveform}
            className="inline-flex items-center gap-2 px-4 py-3.5 border border-[#E8E6E0]/20 text-[#E8E6E0]/80 hover:text-[#E8E6E0] text-xs tracking-[0.12em] uppercase cursor-pointer"
          >
            <span>{isPlayingAudio && playingTrackId === 'track-1' ? '❚❚ Pause Stems' : '▶ Audition Master'}</span>
          </button>
        </div>

        {/* 72-Bar Waveform Visualizer */}
        <div
          onClick={handleToggleActiveProjectWaveform}
          className="mt-10 h-32 flex items-center gap-[2px] px-2 pb-7 pt-4 border-t border-b border-[#E8E6E0]/10 relative cursor-pointer group bg-[#07090A]/40"
          title="Click to audition master stem mix"
        >
          {/* Playhead line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#f43f5e] shadow-[0_0_8px_#f43f5e] z-10 transition-all pointer-events-none"
            style={{ left: `${playbackProgress * 100}%` }}
          />

          {waveformBars.map((bar, idx) => {
            const isPassed = idx / waveformBars.length <= playbackProgress;
            return (
              <div
                key={idx}
                className="flex-1 rounded-[1px] min-h-[4px] transition-all duration-100"
                style={{
                  height: `${bar.height}%`,
                  backgroundColor: bar.color,
                  opacity: isPassed ? 1 : bar.opacity,
                  filter: isPassed ? 'brightness(1.2)' : 'none',
                }}
              />
            );
          })}

          <div className="absolute bottom-2 left-2 text-[9px] tracking-[0.2em] text-[#E8E6E0]/40 uppercase pointer-events-none">
            24-BIT LOSSLESS MASTER BUS · PROOFBRIDGE VERIFIED
          </div>
          <div className="absolute bottom-2 right-2 text-[9px] tracking-[0.2em] text-[#E8E6E0]/40 uppercase tabular-nums pointer-events-none">
            NOW PLAYING {formatCurrentTime(playbackProgress)}
          </div>
        </div>
      </section>

      {/* 3. Production Workflow Stages (English Lingua Franca) */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-7 gap-5">
          <div>
            <h2 className="font-display font-bold text-3xl tracking-[-0.5px] text-[#E8E6E0]">
              Production Workflow Stages
            </h2>
            <p className="text-[13px] text-[#E8E6E0]/50 mt-1 font-sans">
              One phase at a time. Sonic rigor across verified quality gates.
            </p>
          </div>
          <button
            onClick={onSelectProofBridge}
            className="text-[11px] tracking-[0.18em] uppercase text-[#E8E6E0]/50 hover:text-[#E8E6E0] flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Audit Gates on ProofBridge ↗</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WORKFLOW_STAGES.map((stage) => {
            const isCompleted = stage.status === 'Completed';
            const isCurrent = stage.status === 'In Progress';

            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`border p-6 transition-all duration-200 cursor-pointer relative ${
                  isCompleted
                    ? 'border-[#E8E6E0]/15 bg-[#0B0F12] hover:border-[#E8E6E0]/30 hover:-translate-y-0.5'
                    : isCurrent
                    ? 'border-[#E8D56B]/40 bg-[#0B0F12] shadow-[0_0_15px_rgba(232,213,107,0.06)] hover:-translate-y-0.5'
                    : 'border-[#E8E6E0]/10 bg-[#0B0F12]/60 opacity-60'
                }`}
              >
                {/* Stage Icon */}
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-lg mb-5"
                  style={{
                    backgroundColor:
                      stage.accent === 'moss'
                        ? 'rgba(106,138,79,0.15)'
                        : stage.accent === 'ochre'
                        ? 'rgba(196,122,42,0.15)'
                        : stage.accent === 'yellow'
                        ? 'rgba(232,213,107,0.15)'
                        : 'rgba(232,230,224,0.06)',
                    color:
                      stage.accent === 'moss'
                        ? '#6A8A4F'
                        : stage.accent === 'ochre'
                        ? '#C47A2A'
                        : stage.accent === 'yellow'
                        ? '#E8D56B'
                        : '#64748b',
                  }}
                >
                  {stage.number === '01' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6-6 6 6" />
                      <path d="M6 15l6 6 6-6" />
                      <circle cx="12" cy="12" r="1" />
                    </svg>
                  )}
                  {stage.number === '02' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  )}
                  {stage.number === '03' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                    </svg>
                  )}
                  {stage.number === '04' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>

                {/* Head */}
                <div className="flex items-center justify-between mb-3 text-[10px] tracking-[0.16em] uppercase text-[#E8E6E0]/40">
                  <span>Stage {stage.number}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          stage.accent === 'moss'
                            ? '#6A8A4F'
                            : stage.accent === 'ochre'
                            ? '#C47A2A'
                            : stage.accent === 'yellow'
                            ? '#E8D56B'
                            : '#64748b',
                      }}
                    />
                    <span
                      style={{
                        color:
                          stage.accent === 'moss'
                            ? '#6A8A4F'
                            : stage.accent === 'ochre'
                            ? '#C47A2A'
                            : stage.accent === 'yellow'
                            ? '#E8D56B'
                            : '#64748b',
                      }}
                    >
                      {stage.status}
                    </span>
                  </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-display font-bold text-2xl tracking-[-0.3px] mb-2 text-[#E8E6E0]">
                  <span className="font-mono-code text-[13px] font-medium text-[#E8E6E0]/40 mr-1.5 tracking-normal">
                    {stage.number}
                  </span>
                  {stage.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#E8E6E0]/60 mb-5 font-sans">
                  {stage.description}
                </p>

                {/* Progress Bar */}
                <div className="h-[2px] bg-[#E8E6E0]/10 relative overflow-hidden">
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      width: `${stage.progress}%`,
                      backgroundColor:
                        stage.accent === 'moss'
                          ? '#6A8A4F'
                          : stage.accent === 'ochre'
                          ? '#C47A2A'
                          : stage.accent === 'yellow'
                          ? '#E8D56B'
                          : '#64748b',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Tracks & Stems with Real Audio Playback */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-7 gap-5">
          <div>
            <h2 className="font-display font-bold text-3xl tracking-[-0.5px] text-[#E8E6E0]">
              Recent Tracks &amp; Sessions
            </h2>
            <p className="text-[13px] text-[#E8E6E0]/50 mt-1 font-sans">
              Audition takes directly with studio playback or jump into multitrack editing.
            </p>
          </div>
          <button
            onClick={onOpenDaw}
            className="text-[11px] tracking-[0.18em] uppercase text-[#E8E6E0]/50 hover:text-[#E8E6E0] flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Open Beat Lab ↗</span>
          </button>
        </div>

        <div className="border border-[#E8E6E0]/15 bg-[#0B0F12]">
          {REAL_TRACKS.map((track) => {
            const isPlaying = playingTrackId === track.id && isPlayingAudio;
            return (
              <div
                key={track.id}
                onClick={() => handleTogglePlayTrack(track)}
                className={`grid grid-cols-[44px_1fr_auto_auto] sm:grid-cols-[48px_1fr_auto_auto] items-center gap-4 sm:gap-6 p-4 sm:p-5 border-b border-[#E8E6E0]/10 last:border-b-0 transition-colors cursor-pointer group ${
                  isPlaying ? 'bg-[#E8E6E0]/5' : 'hover:bg-[#E8E6E0]/[0.03]'
                }`}
              >
                {/* Play Button */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-[#E8D56B] text-[#07090A] shadow-[0_0_12px_#E8D56B]'
                      : 'bg-[#E8E6E0]/10 text-[#E8E6E0] group-hover:bg-[#F5F0E0] group-hover:text-[#07090A]'
                  }`}
                >
                  {isPlaying ? (
                    <span className="text-xs font-bold font-mono">❚❚</span>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>

                {/* Track Info */}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#E8E6E0] mb-1 truncate flex items-center gap-2">
                    <span>
                      {track.number} — {track.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#E8D56B]/15 text-[#E8D56B] rounded border border-[#E8D56B]/30 uppercase font-mono">
                      {track.stageBadge}
                    </span>
                    {isPlaying && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 uppercase tracking-widest animate-pulse font-mono">
                        Playing Live
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#E8E6E0]/40 tracking-[0.02em] truncate">
                    {track.artist} · {track.format} · {track.bpm} BPM · Key: {track.key}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-[13px] text-[#E8E6E0]/50 tracking-[0.02em] tabular-nums whitespace-nowrap">
                  {track.duration}
                </div>

                {/* Open in Beat Lab */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDaw();
                  }}
                  className="text-xs text-[#E8E6E0]/40 hover:text-[#E8D56B] px-2 py-1 font-mono uppercase cursor-pointer"
                  title="Open in Beat Lab"
                >
                  Edit ➔
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Sessions & Projects List with 'Last Modified' Label */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-2xl tracking-tight text-[#E8E6E0]">
              All Studio Sessions &amp; Master Catalogs
            </h2>
            <p className="text-xs text-[#E8E6E0]/50 font-sans mt-0.5">
              Offline persisted sessions with automatic modification timestamping
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {projects.map((proj) => {
            const isActive = proj.id === activeProject.id;
            return (
              <div
                key={proj.id}
                onClick={() => projectTracker.setActiveProject(proj.id)}
                className={`p-4 rounded border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#12141f] border-[#E8D56B] shadow-md'
                    : 'bg-[#0B0F12] border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm text-[#E8E6E0] truncate">
                    {proj.title}
                  </div>
                  {/* LAST MODIFIED LABEL */}
                  <span
                    className="text-[10px] text-[#E8D56B] bg-[#E8D56B]/10 px-2 py-0.5 rounded border border-[#E8D56B]/30 font-mono shrink-0 ml-2"
                    title={`Last edited: ${projectTracker.formatExactDateTime(proj.lastModified)}`}
                  >
                    Last modified {projectTracker.formatRelativeTime(proj.lastModified)}
                  </span>
                </div>

                <div className="text-[11px] text-[#E8E6E0]/50 mb-3">
                  {proj.genre} · {proj.tracksCount} tracks · {proj.bpm} BPM · {proj.key}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#E8E6E0]/40 border-t border-white/5 pt-2">
                  <span className="text-[#6A8A4F]">{proj.stage}</span>
                  <span className="font-bold text-[#E8E6E0]/70">{proj.progress}% completed</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stage Inspection Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-md w-full p-6 text-left relative shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E8E6E0]/10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#E8D56B]">STAGE {selectedStage.number}</span>
                <span className="font-display text-xl font-bold">{selectedStage.title}</span>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-[#E8E6E0]/50 hover:text-[#E8E6E0] cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#E8E6E0]/70 mb-5 font-sans leading-relaxed">
              {selectedStage.description}
            </p>

            <div className="space-y-3 mb-6 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-[#E8E6E0]/5">
                <span className="text-[#E8E6E0]/50">Status:</span>
                <span className="text-[#E8E6E0] font-semibold">{selectedStage.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8E6E0]/5">
                <span className="text-[#E8E6E0]/50">Quality Gates:</span>
                <span className="text-[#6A8A4F]">{selectedStage.gates}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8E6E0]/5">
                <span className="text-[#E8E6E0]/50">Registered Progress:</span>
                <span className="text-[#E8D56B]">{selectedStage.progress}%</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-4 py-2 border border-[#E8E6E0]/20 text-xs text-[#E8E6E0]/70 hover:text-[#E8E6E0] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedStage(null);
                  onOpenDaw();
                }}
                className="px-4 py-2 bg-[#F5F0E0] text-[#07090A] font-semibold text-xs cursor-pointer hover:bg-white"
              >
                Open in Beat Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
