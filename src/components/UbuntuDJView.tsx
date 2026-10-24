/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ubuntuDjEngine,
  PRELOADED_TRACKS,
  TrackMetadata,
  DeckState,
} from '../services/ubuntuDjAudio';
import { projectTracker } from '../services/projectTracker';

interface UbuntuDJViewProps {
  onOpenDaw?: () => void;
  onOpenMixer?: () => void;
  onSendTrackToSession?: (trackTitle: string) => void;
}

const initialDeckA: DeckState = {
  track: PRELOADED_TRACKS[0], // 6LACK
  isPlaying: false,
  currentTime: 0,
  duration: PRELOADED_TRACKS[0].duration,
  pitch: 0,
  effectiveBpm: PRELOADED_TRACKS[0].bpm,
  syncActive: false,
  volume: 0.9,
  cuePoint: 0,
  hotCues: [0, null, null, null],
  loopActive: false,
  loopBeats: 4,
  loopStart: 0,
  loopEnd: 0,
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  killHigh: false,
  killMid: false,
  killLow: false,
  filterType: 'off',
  filterSweep: 0,
  fxDelayActive: false,
  fxReverbActive: false,
  fxFlangerActive: false,
  isCuePfl: true,
  vuLevel: 0,
};

const initialDeckB: DeckState = {
  track: PRELOADED_TRACKS[3], // Hillside Therapy
  isPlaying: false,
  currentTime: 0,
  duration: PRELOADED_TRACKS[3].duration,
  pitch: 0,
  effectiveBpm: PRELOADED_TRACKS[3].bpm,
  syncActive: false,
  volume: 0.9,
  cuePoint: 0,
  hotCues: [0, null, null, null],
  loopActive: false,
  loopBeats: 4,
  loopStart: 0,
  loopEnd: 0,
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  killHigh: false,
  killMid: false,
  killLow: false,
  filterType: 'off',
  filterSweep: 0,
  fxDelayActive: false,
  fxReverbActive: false,
  fxFlangerActive: false,
  isCuePfl: false,
  vuLevel: 0,
};

export const UbuntuDJView: React.FC<UbuntuDJViewProps> = ({
  onOpenDaw,
  onSendTrackToSession,
}) => {
  const [deckA, setDeckA] = useState<DeckState>(initialDeckA);
  const [deckB, setDeckB] = useState<DeckState>(initialDeckB);
  const [crossfader, setCrossfader] = useState<number>(0.5);
  const [masterVolume, setMasterVolume] = useState<number>(0.85);
  const [rotationA, setRotationA] = useState<number>(0);
  const [rotationB, setRotationB] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Scratch interaction state
  const isScratchingA = useRef<boolean>(false);
  const isScratchingB = useRef<boolean>(false);
  const lastMousePosA = useRef<number>(0);
  const lastMousePosB = useRef<number>(0);

  // Waveform canvas refs
  const canvasWaveRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasWaveRefB = useRef<HTMLCanvasElement | null>(null);

  const showNote = useCallback((msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 3000);
  }, []);

  // Initialize tracks on mount
  useEffect(() => {
    if (initialDeckA.track) {
      ubuntuDjEngine.loadTrack('A', initialDeckA.track);
    }
    if (initialDeckB.track) {
      ubuntuDjEngine.loadTrack('B', initialDeckB.track);
    }
  }, []);

  // Sync state with HTMLAudioElements and VU animation loop
  useEffect(() => {
    let animId: number;
    const audioA = ubuntuDjEngine.getAudioElement('A');
    const audioB = ubuntuDjEngine.getAudioElement('B');

    const updateLoop = () => {
      // Rotation updates
      if (!audioA.paused && audioA.playbackRate > 0) {
        setRotationA((r) => (r + 2.5 * audioA.playbackRate) % 360);
      }
      if (!audioB.paused && audioB.playbackRate > 0) {
        setRotationB((r) => (r + 2.5 * audioB.playbackRate) % 360);
      }

      // Update current times and loop constraints
      if (audioA) {
        const curA = audioA.currentTime;
        const durA = audioA.duration || deckA.track?.duration || 180;
        setDeckA((prev) => {
          if (prev.loopActive && prev.loopEnd > 0 && curA >= prev.loopEnd) {
            audioA.currentTime = prev.loopStart;
          }
          return {
            ...prev,
            currentTime: curA,
            duration: durA,
            isPlaying: !audioA.paused,
            vuLevel: audioA.paused ? 0 : ubuntuDjEngine.getRMSLevel('A'),
          };
        });
      }

      if (audioB) {
        const curB = audioB.currentTime;
        const durB = audioB.duration || deckB.track?.duration || 180;
        setDeckB((prev) => {
          if (prev.loopActive && prev.loopEnd > 0 && curB >= prev.loopEnd) {
            audioB.currentTime = prev.loopStart;
          }
          return {
            ...prev,
            currentTime: curB,
            duration: durB,
            isPlaying: !audioB.paused,
            vuLevel: audioB.paused ? 0 : ubuntuDjEngine.getRMSLevel('B'),
          };
        });
      }

      // Draw waveforms
      drawWaveform('A', canvasWaveRefA.current, audioA);
      drawWaveform('B', canvasWaveRefB.current, audioB);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [deckA.track, deckB.track]);

  // Render high-fidelity audio waveform onto canvas
  const drawWaveform = (
    deck: 'A' | 'B',
    canvas: HTMLCanvasElement | null,
    audio: HTMLAudioElement
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const isDeckA = deck === 'A';
    const primaryColor = isDeckA ? '#00f2fe' : '#f43f5e';
    const secondaryColor = isDeckA ? '#E8D56B' : '#10b981';

    // Background grid
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);

    // Center playhead
    const playheadX = w / 2;

    // Time progress
    const curTime = audio.currentTime || 0;
    const duration = audio.duration || 180;
    const progress = curTime / duration;

    // Draw scrolling bars based on frequency bins
    const analyser = ubuntuDjEngine.getAnalyser(deck);
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    const totalBars = 90;
    const barWidth = w / totalBars;

    for (let i = 0; i < totalBars; i++) {
      const offset = i - totalBars / 2;
      const barTime = curTime + offset * 0.12;

      // Pseudo waveform height based on deterministic hash and real frequency data
      const pseudoHeight =
        (Math.sin(barTime * 3.5) * 0.4 +
          Math.cos(barTime * 7.2) * 0.3 +
          (freqData[i % freqData.length] / 255) * 0.6) *
        (h * 0.42);

      const barHeight = Math.max(3, Math.abs(pseudoHeight));
      const x = i * barWidth;
      const y = h / 2 - barHeight / 2;

      // Beat marker highlight
      const isBeat = Math.floor(barTime * 2) % 2 === 0;

      if (i < totalBars / 2) {
        ctx.fillStyle = isBeat ? primaryColor : `${primaryColor}66`;
      } else {
        ctx.fillStyle = isBeat ? secondaryColor : `${secondaryColor}55`;
      }

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }

    // Draw center playhead line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();

    // Small playhead marker
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(playheadX, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(playheadX, h - 6, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // Keyboard shortcut listener for DJ performance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      // DECK A SHORTCUTS
      if (e.key.toLowerCase() === 'q') {
        handleCue('A');
      } else if (e.key.toLowerCase() === 'w') {
        handlePlayPause('A');
      } else if (e.key.toLowerCase() === 'e') {
        handleSync('A');
      }

      // DECK B SHORTCUTS
      if (e.key.toLowerCase() === 'u') {
        handleCue('B');
      } else if (e.key.toLowerCase() === 'i') {
        handlePlayPause('B');
      } else if (e.key.toLowerCase() === 'o') {
        handleSync('B');
      }

      // CROSSFADER QUICK CUTS
      if (e.key === '[') {
        handleCrossfaderChange(0); // Cut to Deck A
      } else if (e.key === ']') {
        handleCrossfaderChange(1); // Cut to Deck B
      } else if (e.key === '\\') {
        handleCrossfaderChange(0.5); // Center
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Track select handler
  const handleSelectTrack = (deck: 'A' | 'B', trackId: string) => {
    const found = PRELOADED_TRACKS.find((t) => t.id === trackId);
    if (!found) return;

    ubuntuDjEngine.loadTrack(deck, found);

    if (deck === 'A') {
      setDeckA((prev) => ({
        ...prev,
        track: found,
        duration: found.duration,
        currentTime: 0,
        isPlaying: false,
        effectiveBpm: found.bpm,
        pitch: 0,
      }));
    } else {
      setDeckB((prev) => ({
        ...prev,
        track: found,
        duration: found.duration,
        currentTime: 0,
        isPlaying: false,
        effectiveBpm: found.bpm,
        pitch: 0,
      }));
    }

    projectTracker.touchProject('proj-horizonte', `UbuntuDJ: Loaded "${found.title}" into Deck ${deck}`);
    showNote(`Deck ${deck}: "${found.title}" ready.`);
  };

  // Custom file upload to deck
  const handleCustomAudioUpload = (deck: 'A' | 'B', file: File) => {
    const url = URL.createObjectURL(file);
    const customTrack: TrackMetadata = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Custom User Audio',
      bpm: 124,
      key: '1A / Am',
      duration: 180,
      src: url,
      genre: 'Live Audio Import',
    };

    ubuntuDjEngine.loadTrack(deck, customTrack);
    if (deck === 'A') {
      setDeckA((prev) => ({ ...prev, track: customTrack, currentTime: 0, isPlaying: false }));
    } else {
      setDeckB((prev) => ({ ...prev, track: customTrack, currentTime: 0, isPlaying: false }));
    }
    showNote(`Custom audio "${customTrack.title}" loaded on Deck ${deck}.`);
  };

  // Play / Pause
  const handlePlayPause = (deck: 'A' | 'B') => {
    const audio = ubuntuDjEngine.getAudioElement(deck);
    if (audio.paused) {
      ubuntuDjEngine.play(deck);
      if (deck === 'A') setDeckA((p) => ({ ...p, isPlaying: true }));
      else setDeckB((p) => ({ ...p, isPlaying: true }));
      projectTracker.touchProject('proj-horizonte', `UbuntuDJ: Deck ${deck} Play`);
    } else {
      ubuntuDjEngine.pause(deck);
      if (deck === 'A') setDeckA((p) => ({ ...p, isPlaying: false }));
      else setDeckB((p) => ({ ...p, isPlaying: false }));
      projectTracker.touchProject('proj-horizonte', `UbuntuDJ: Deck ${deck} Pause`);
    }
  };

  // Cue button
  const handleCue = (deck: 'A' | 'B') => {
    const audio = ubuntuDjEngine.getAudioElement(deck);
    ubuntuDjEngine.pause(deck);
    const cuePt = deck === 'A' ? deckA.cuePoint : deckB.cuePoint;
    ubuntuDjEngine.seek(deck, cuePt);

    if (deck === 'A') {
      setDeckA((p) => ({ ...p, isPlaying: false, currentTime: cuePt }));
    } else {
      setDeckB((p) => ({ ...p, isPlaying: false, currentTime: cuePt }));
    }
    showNote(`Deck ${deck}: Cue jumped to ${formatTime(cuePt)}`);
  };

  // Hot Cues
  const handleHotCue = (deck: 'A' | 'B', index: number) => {
    const dState = deck === 'A' ? deckA : deckB;
    const targetCue = dState.hotCues[index];

    if (targetCue !== null && targetCue !== undefined) {
      // Jump to hot cue
      ubuntuDjEngine.seek(deck, targetCue);
      ubuntuDjEngine.play(deck);
      if (deck === 'A') setDeckA((p) => ({ ...p, currentTime: targetCue, isPlaying: true }));
      else setDeckB((p) => ({ ...p, currentTime: targetCue, isPlaying: true }));
      showNote(`Deck ${deck}: Jumped to Hot Cue ${index + 1} (${formatTime(targetCue)})`);
    } else {
      // Store current time as hot cue
      const cur = dState.currentTime;
      const updated = [...dState.hotCues];
      updated[index] = cur;

      if (deck === 'A') setDeckA((p) => ({ ...p, hotCues: updated }));
      else setDeckB((p) => ({ ...p, hotCues: updated }));
      showNote(`Deck ${deck}: Saved Hot Cue ${index + 1} at ${formatTime(cur)}`);
    }
  };

  const handleClearHotCues = (deck: 'A' | 'B') => {
    if (deck === 'A') setDeckA((p) => ({ ...p, hotCues: [null, null, null, null] }));
    else setDeckB((p) => ({ ...p, hotCues: [null, null, null, null] }));
    showNote(`Deck ${deck}: Hot Cues Cleared.`);
  };

  // Auto Beat Loop
  const handleToggleLoop = (deck: 'A' | 'B', beats: number) => {
    const dState = deck === 'A' ? deckA : deckB;
    const bpm = dState.effectiveBpm || 120;
    const beatSeconds = 60 / bpm;
    const loopDuration = beatSeconds * beats;
    const curTime = dState.currentTime;

    const newActive = !dState.loopActive || dState.loopBeats !== beats;

    if (deck === 'A') {
      setDeckA((p) => ({
        ...p,
        loopActive: newActive,
        loopBeats: beats,
        loopStart: curTime,
        loopEnd: curTime + loopDuration,
      }));
    } else {
      setDeckB((p) => ({
        ...p,
        loopActive: newActive,
        loopBeats: beats,
        loopStart: curTime,
        loopEnd: curTime + loopDuration,
      }));
    }

    showNote(
      newActive
        ? `Deck ${deck}: Loop ${beats} beats active (${loopDuration.toFixed(1)}s)`
        : `Deck ${deck}: Loop Off`
    );
  };

  // BPM Sync to opposite deck
  const handleSync = (targetDeck: 'A' | 'B') => {
    const sourceDeckState = targetDeck === 'A' ? deckB : deckA;
    const targetDeckState = targetDeck === 'A' ? deckA : deckB;

    if (!sourceDeckState.track || !targetDeckState.track) return;

    const targetBaseBpm = targetDeckState.track.bpm;
    const sourceCurrentBpm = sourceDeckState.effectiveBpm;

    // Calculate needed pitch percent
    const pitchDiffPercent = ((sourceCurrentBpm - targetBaseBpm) / targetBaseBpm) * 100;
    const clampedPitch = Math.max(-8, Math.min(8, pitchDiffPercent));

    ubuntuDjEngine.setPitch(targetDeck, clampedPitch);

    if (targetDeck === 'A') {
      setDeckA((p) => ({
        ...p,
        pitch: clampedPitch,
        effectiveBpm: targetBaseBpm * (1 + clampedPitch / 100),
        syncActive: true,
      }));
    } else {
      setDeckB((p) => ({
        ...p,
        pitch: clampedPitch,
        effectiveBpm: targetBaseBpm * (1 + clampedPitch / 100),
        syncActive: true,
      }));
    }

    projectTracker.touchProject(
      'proj-horizonte',
      `UbuntuDJ: Deck ${targetDeck} synced to ${sourceCurrentBpm.toFixed(1)} BPM`
    );
    showNote(`Deck ${targetDeck} synced to ${sourceCurrentBpm.toFixed(1)} BPM!`);
  };

  // Pitch Fader Change
  const handlePitchChange = (deck: 'A' | 'B', pitchVal: number) => {
    ubuntuDjEngine.setPitch(deck, pitchVal);
    if (deck === 'A') {
      const base = deckA.track?.bpm || 120;
      setDeckA((p) => ({
        ...p,
        pitch: pitchVal,
        effectiveBpm: base * (1 + pitchVal / 100),
        syncActive: false,
      }));
    } else {
      const base = deckB.track?.bpm || 120;
      setDeckB((p) => ({
        ...p,
        pitch: pitchVal,
        effectiveBpm: base * (1 + pitchVal / 100),
        syncActive: false,
      }));
    }
  };

  // Nudge Pitch Bend
  const handleNudge = (deck: 'A' | 'B', direction: -1 | 1) => {
    const audio = ubuntuDjEngine.getAudioElement(deck);
    const origRate = audio.playbackRate;
    audio.playbackRate = origRate + direction * 0.08;
    setTimeout(() => {
      audio.playbackRate = origRate;
    }, 280);
    showNote(`Deck ${deck} Nudge ${direction > 0 ? '+4%' : '-4%'}`);
  };

  // EQ changes
  const handleEqChange = (
    deck: 'A' | 'B',
    band: 'high' | 'mid' | 'low',
    value: number
  ) => {
    const d = deck === 'A' ? deckA : deckB;
    const h = band === 'high' ? value : d.eqHigh;
    const m = band === 'mid' ? value : d.eqMid;
    const l = band === 'low' ? value : d.eqLow;

    ubuntuDjEngine.setEQ(deck, h, m, l, d.killHigh, d.killMid, d.killLow);

    if (deck === 'A') {
      setDeckA((p) => ({
        ...p,
        eqHigh: h,
        eqMid: m,
        eqLow: l,
      }));
    } else {
      setDeckB((p) => ({
        ...p,
        eqHigh: h,
        eqMid: m,
        eqLow: l,
      }));
    }
  };

  // EQ Kill switches
  const handleToggleKill = (deck: 'A' | 'B', band: 'high' | 'mid' | 'low') => {
    const d = deck === 'A' ? deckA : deckB;
    const kh = band === 'high' ? !d.killHigh : d.killHigh;
    const km = band === 'mid' ? !d.killMid : d.killMid;
    const kl = band === 'low' ? !d.killLow : d.killLow;

    ubuntuDjEngine.setEQ(deck, d.eqHigh, d.eqMid, d.eqLow, kh, km, kl);

    if (deck === 'A') {
      setDeckA((p) => ({
        ...p,
        killHigh: kh,
        killMid: km,
        killLow: kl,
      }));
    } else {
      setDeckB((p) => ({
        ...p,
        killHigh: kh,
        killMid: km,
        killLow: kl,
      }));
    }
    showNote(`Deck ${deck} ${band.toUpperCase()} KILL ${kh || km || kl ? 'ON' : 'OFF'}`);
  };

  // Color Filter sweep
  const handleFilterSweepChange = (deck: 'A' | 'B', sweep: number) => {
    ubuntuDjEngine.setFilterSweep(deck, sweep);
    if (deck === 'A') setDeckA((p) => ({ ...p, filterSweep: sweep }));
    else setDeckB((p) => ({ ...p, filterSweep: sweep }));
  };

  // FX Delay
  const handleToggleDelay = (deck: 'A' | 'B') => {
    const d = deck === 'A' ? deckA : deckB;
    const nextVal = !d.fxDelayActive;
    ubuntuDjEngine.setDelayFx(deck, nextVal);
    if (deck === 'A') setDeckA((p) => ({ ...p, fxDelayActive: nextVal }));
    else setDeckB((p) => ({ ...p, fxDelayActive: nextVal }));
    showNote(`Deck ${deck} Dub Delay: ${nextVal ? 'ENGAGED' : 'BYPASS'}`);
  };

  // Channel Volume
  const handleChannelVolumeChange = (deck: 'A' | 'B', vol: number) => {
    ubuntuDjEngine.setChannelVolume(deck, vol);
    if (deck === 'A') setDeckA((p) => ({ ...p, volume: vol }));
    else setDeckB((p) => ({ ...p, volume: vol }));
  };

  // Crossfader
  const handleCrossfaderChange = (val: number) => {
    setCrossfader(val);
    ubuntuDjEngine.updateCrossfader(val);
  };

  // Master Volume
  const handleMasterVolumeChange = (val: number) => {
    setMasterVolume(val);
    ubuntuDjEngine.setMasterVolume(val);
  };

  // Scratch wheel handlers
  const handleScratchStart = (deck: 'A' | 'B', clientX: number) => {
    if (deck === 'A') {
      isScratchingA.current = true;
      lastMousePosA.current = clientX;
    } else {
      isScratchingB.current = true;
      lastMousePosB.current = clientX;
    }
  };

  const handleScratchMove = (deck: 'A' | 'B', clientX: number) => {
    if (deck === 'A' && isScratchingA.current) {
      const delta = clientX - lastMousePosA.current;
      lastMousePosA.current = clientX;
      setRotationA((r) => r + delta * 2.5);
      const audio = ubuntuDjEngine.getAudioElement('A');
      ubuntuDjEngine.seek('A', audio.currentTime + delta * 0.04);
    } else if (deck === 'B' && isScratchingB.current) {
      const delta = clientX - lastMousePosB.current;
      lastMousePosB.current = clientX;
      setRotationB((r) => r + delta * 2.5);
      const audio = ubuntuDjEngine.getAudioElement('B');
      ubuntuDjEngine.seek('B', audio.currentTime + delta * 0.04);
    }
  };

  const handleScratchEnd = (deck: 'A' | 'B') => {
    if (deck === 'A') isScratchingA.current = false;
    else isScratchingB.current = false;
  };

  // Vinyl Brake Effect (Slow stop)
  const handleVinylBrake = (deck: 'A' | 'B') => {
    const audio = ubuntuDjEngine.getAudioElement(deck);
    if (audio.paused) return;

    let step = 1.0;
    const interval = setInterval(() => {
      step -= 0.15;
      if (step <= 0.05) {
        clearInterval(interval);
        ubuntuDjEngine.pause(deck);
        audio.playbackRate = 1.0;
        if (deck === 'A') setDeckA((p) => ({ ...p, isPlaying: false }));
        else setDeckB((p) => ({ ...p, isPlaying: false }));
      } else {
        audio.playbackRate = step;
      }
    }, 45);

    showNote(`Deck ${deck} Vinyl Motor Brake applied!`);
  };

  // Live Mix Recording
  const handleToggleRecordMix = async () => {
    if (!isRecording) {
      ubuntuDjEngine.startRecording();
      setIsRecording(true);
      showNote('Live mix recording started! Capturing master output...');
      projectTracker.touchProject('proj-horizonte', 'UbuntuDJ: Started live mix recording');
    } else {
      setIsRecording(false);
      showNote('Finalizing mix recording...');
      const blob = await ubuntuDjEngine.stopRecording();
      const url = URL.createObjectURL(blob);
      setRecordedAudioUrl(url);
      projectTracker.touchProject('proj-horizonte', 'UbuntuDJ: Completed live mix take');
      showNote('Live DJ Mix Take saved! Ready to download or preview.');
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 py-4 font-mono-code text-[#E8E6E0] select-none">
      {/* 1. UbuntuDJ Parallel Header HUD */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#0d1017] border border-[#E8E6E0]/15 rounded-xl mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C47A2A] via-[#E8D56B] to-[#6A8A4F] p-[2px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-[#07090A] rounded-[10px] flex items-center justify-center">
              <span className="text-sm font-bold text-[#E8D56B]">UDJ</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>UbuntuDJ Parallel</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C47A2A]/20 text-[#C47A2A] border border-[#C47A2A]/40 font-mono tracking-wider uppercase">
                  Dual-Deck Engine
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-[#E8E6E0]/60 mt-0.5">
              African Harmonic DJ Performance Console &middot; Ethos: <span className="text-[#E8D56B]">"I am because we are"</span>
            </p>
          </div>
        </div>

        {/* Global DJ Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Live Mix Recorder */}
          <button
            onClick={handleToggleRecordMix}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#f43f5e] text-white border-white animate-pulse shadow-[0_0_15px_#f43f5e]'
                : 'bg-[#1a1d2b] text-[#E8E6E0] border-[#E8E6E0]/20 hover:border-[#f43f5e]/60 hover:text-[#f43f5e]'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-white' : 'bg-[#f43f5e]'}`} />
            <span>{isRecording ? 'REC MIXING...' : 'Record Mix'}</span>
          </button>

          {recordedAudioUrl && (
            <a
              href={recordedAudioUrl}
              download="UbuntuDJ_Parallel_Mix_Take.webm"
              className="px-3 py-1.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/50 rounded-lg text-xs font-bold hover:bg-[#6A8A4F]/30 transition-colors"
            >
              Export Take (.webm)
            </a>
          )}

          {onOpenDaw && (
            <button
              onClick={onOpenDaw}
              className="px-3 py-1.5 bg-[#22273a] text-[#C47A2A] border border-[#C47A2A]/40 rounded-lg text-xs font-bold hover:bg-[#C47A2A]/10 transition-colors cursor-pointer"
            >
              Back to Beat Lab
            </button>
          )}

          {/* Keybind help badge */}
          <div className="hidden xl:flex items-center gap-2 text-[10px] text-[#E8E6E0]/50 bg-[#07090A] px-3 py-1.5 rounded border border-[#E8E6E0]/10">
            <span>Keys: [Q/W/E] Deck A &middot; [U/I/O] Deck B &middot; [ / \ / ] Crossfader</span>
          </div>
        </div>
      </div>

      {/* Floating Action Toast */}
      {actionNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#161a29] border border-[#00f2fe]/60 text-[#00f2fe] px-4 py-2 rounded-full text-xs font-mono shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* 2. Dual Dynamic Waveform Spectrum Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Deck A Waveform */}
        <div className="bg-[#0a0d14] border border-[#00f2fe]/30 rounded-xl p-2 relative shadow-inner">
          <div className="flex items-center justify-between text-[11px] mb-1 px-2 font-mono">
            <span className="text-[#00f2fe] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f2fe]" />
              DECK A &middot; {deckA.track?.title || 'No Track'}
            </span>
            <span className="text-[#00f2fe]/80">
              {formatTime(deckA.currentTime)} / {formatTime(deckA.duration)}
            </span>
          </div>
          <canvas
            ref={canvasWaveRefA}
            width={600}
            height={70}
            className="w-full h-16 rounded cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              // Scrub +/- 20s relative to center
              const offset = (ratio - 0.5) * 40;
              ubuntuDjEngine.seek('A', deckA.currentTime + offset);
            }}
          />
          {/* Hot Cue visual dots */}
          <div className="flex gap-2 mt-1 px-2 text-[10px]">
            {deckA.hotCues.map((cue, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded ${
                  cue !== null ? 'bg-[#00f2fe]/30 text-[#00f2fe] font-bold' : 'text-[#E8E6E0]/20'
                }`}
              >
                CUE {i + 1}: {cue !== null ? formatTime(cue) : '--:--'}
              </span>
            ))}
          </div>
        </div>

        {/* Deck B Waveform */}
        <div className="bg-[#0a0d14] border border-[#f43f5e]/30 rounded-xl p-2 relative shadow-inner">
          <div className="flex items-center justify-between text-[11px] mb-1 px-2 font-mono">
            <span className="text-[#f43f5e] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
              DECK B &middot; {deckB.track?.title || 'No Track'}
            </span>
            <span className="text-[#f43f5e]/80">
              {formatTime(deckB.currentTime)} / {formatTime(deckB.duration)}
            </span>
          </div>
          <canvas
            ref={canvasWaveRefB}
            width={600}
            height={70}
            className="w-full h-16 rounded cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              const offset = (ratio - 0.5) * 40;
              ubuntuDjEngine.seek('B', deckB.currentTime + offset);
            }}
          />
          <div className="flex gap-2 mt-1 px-2 text-[10px]">
            {deckB.hotCues.map((cue, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded ${
                  cue !== null ? 'bg-[#f43f5e]/30 text-[#f43f5e] font-bold' : 'text-[#E8E6E0]/20'
                }`}
              >
                CUE {i + 1}: {cue !== null ? formatTime(cue) : '--:--'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main DJ Performance Console: Deck A | Central Mixer | Deck B */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-[#0a0c12] p-3 sm:p-4 rounded-2xl border border-[#E8E6E0]/15 shadow-2xl">
        {/* ========================================================= */}
        {/* LEFT CONSOLE: DECK A (Cyan / Gold Theme)                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#131622] via-[#0e111a] to-[#090b10] border border-[#00f2fe]/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            {/* Deck A Header & Track Selector */}
            <div className="flex items-center justify-between mb-3 border-b border-[#00f2fe]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-[#00f2fe]/20 text-[#00f2fe] font-bold rounded">
                  DECK A
                </span>
                <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {deckA.track?.title || 'Select Track'}
                </span>
              </div>
              <span className="text-[10px] text-[#E8D56B] bg-[#E8D56B]/10 px-2 py-0.5 rounded font-mono">
                {deckA.track?.key || '4A / F minor'}
              </span>
            </div>

            {/* Quick Track Picker Dropdown */}
            <div className="flex items-center gap-2 mb-4">
              <select
                aria-label="Load track into Deck A"
                value={deckA.track?.id || ''}
                onChange={(e) => handleSelectTrack('A', e.target.value)}
                className="flex-1 bg-[#06080c] border border-[#00f2fe]/40 text-xs text-[#E8E6E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#00f2fe]"
              >
                {PRELOADED_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} &middot; {t.artist} ({t.bpm} BPM)
                  </option>
                ))}
              </select>

              <label
                className="text-[10px] px-2 py-1.5 bg-[#22273a] hover:bg-[#323952] text-[#E8E6E0] rounded border border-[#E8E6E0]/20 cursor-pointer shrink-0"
                title="Load your own audio file to Deck A"
              >
                Upload
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCustomAudioUpload('A', e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {onSendTrackToSession && deckA.track && (
                <button
                  onClick={() => onSendTrackToSession(deckA.track!.title)}
                  className="text-[10px] px-2 py-1.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 hover:bg-[#6A8A4F]/30 rounded shrink-0 cursor-pointer"
                  title="Send Deck A stem into session stems matrix"
                >
                  To Stems
                </button>
              )}
            </div>

            {/* Turntable / Scratch Jog Wheel Area */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-3">
              {/* Scratch Platter */}
              <div
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-grab active:cursor-grabbing select-none"
                style={{
                  background:
                    'radial-gradient(circle, #1a1e2b 0%, #0d0f15 50%, #000000 100%)',
                  boxShadow:
                    '0 12px 28px rgba(0,0,0,0.9), inset 0 0 15px rgba(0,242,254,0.25)',
                }}
                onMouseDown={(e) => handleScratchStart('A', e.clientX)}
                onMouseMove={(e) => handleScratchMove('A', e.clientX)}
                onMouseUp={() => handleScratchEnd('A')}
                onMouseLeave={() => handleScratchEnd('A')}
                onTouchStart={(e) => handleScratchStart('A', e.touches[0].clientX)}
                onTouchMove={(e) => handleScratchMove('A', e.touches[0].clientX)}
                onTouchEnd={() => handleScratchEnd('A')}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-11 rounded-full border border-white/5 pointer-events-none" />

                {/* Rotating Slipmat & Center Label */}
                <div
                  className="absolute inset-14 rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#0b1424] to-[#E8D56B] flex items-center justify-center shadow-lg transition-transform duration-75"
                  style={{
                    transform: `rotate(${rotationA}deg)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-[#07090A] border border-white/20 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[8px] font-bold text-[#00f2fe] tracking-widest">VVU</span>
                    <span className="text-[6px] text-white/70">A-SIDE</span>
                  </div>
                </div>

                {/* Center Spindle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_white] pointer-events-none" />

                {/* Scratch Needle Indicator */}
                <div
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-[#00f2fe] rounded shadow-[0_0_8px_#00f2fe] pointer-events-none"
                  style={{
                    transformOrigin: 'bottom center',
                    transform: `rotate(${rotationA}deg)`,
                  }}
                />
              </div>

              {/* Pitch Fader & Tempo readout */}
              <div className="flex flex-col items-center bg-[#07090e] p-3 rounded-xl border border-[#E8E6E0]/10 w-28">
                <span className="text-[9px] text-[#E8E6E0]/50 tracking-wider">TEMPO</span>
                <span className="text-sm font-bold text-[#00f2fe] my-1">
                  {deckA.effectiveBpm.toFixed(1)} <span className="text-[9px] text-white/50">BPM</span>
                </span>
                <span className="text-[10px] text-[#E8D56B]">
                  {deckA.pitch >= 0 ? `+${deckA.pitch.toFixed(1)}%` : `${deckA.pitch.toFixed(1)}%`}
                </span>

                {/* Pitch slider */}
                <div className="relative my-2 h-36 flex items-center justify-center">
                  <input
                    aria-label="Deck A pitch adjustment"
                    type="range"
                    min="-8"
                    max="8"
                    step="0.1"
                    value={deckA.pitch}
                    onChange={(e) => handlePitchChange('A', parseFloat(e.target.value))}
                    className="h-32 w-1.5 appearance-none bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  {/* Center zero detent */}
                  <div
                    onClick={() => handlePitchChange('A', 0)}
                    className="absolute top-1/2 -translate-y-1/2 -right-3 text-[8px] text-[#E8E6E0]/40 hover:text-white cursor-pointer px-1"
                  >
                    0%
                  </div>
                </div>

                {/* Nudge Buttons */}
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleNudge('A', -1)}
                    className="px-2 py-0.5 bg-[#1a1f30] hover:bg-[#252c44] text-[9px] font-bold rounded border border-[#E8E6E0]/15"
                  >
                    -4%
                  </button>
                  <button
                    onClick={() => handleNudge('A', 1)}
                    className="px-2 py-0.5 bg-[#1a1f30] hover:bg-[#252c44] text-[9px] font-bold rounded border border-[#E8E6E0]/15"
                  >
                    +4%
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Controls: Hot Cues & Auto-Loops */}
            <div className="space-y-3 pt-2 border-t border-[#00f2fe]/15">
              {/* Hot Cue Pads */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-[#00f2fe] font-semibold">HOT CUES</span>
                  <button
                    onClick={() => handleClearHotCues('A')}
                    className="text-[#E8E6E0]/40 hover:text-white text-[9px] cursor-pointer"
                  >
                    Clear Cues
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {deckA.hotCues.map((cue, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHotCue('A', idx)}
                      className={`py-2 px-1 rounded text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        cue !== null
                          ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe] shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                          : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10 hover:border-[#00f2fe]/40'
                      }`}
                    >
                      <span>CUE {idx + 1}</span>
                      <span className="block text-[8px] font-mono mt-0.5 opacity-80">
                        {cue !== null ? formatTime(cue) : 'EMPTY'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Loop Buttons */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-[#E8D56B] font-semibold">AUTO LOOP</span>
                  <span className="text-[9px] text-[#E8E6E0]/50">
                    {deckA.loopActive ? `Loop: ${deckA.loopBeats} Beats` : 'Off'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 4, 8, 16].map((beats) => (
                    <button
                      key={beats}
                      onClick={() => handleToggleLoop('A', beats)}
                      className={`py-1 text-center text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                        deckA.loopActive && deckA.loopBeats === beats
                          ? 'bg-[#E8D56B] text-[#07090A] border-[#E8D56B] font-extrabold shadow-[0_0_8px_#E8D56B]'
                          : 'bg-[#121622] text-[#E8E6E0]/70 border-[#E8E6E0]/10 hover:border-[#E8D56B]/40'
                      }`}
                    >
                      {beats}B
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter Sweep & Dub Delay FX */}
              <div className="flex items-center justify-between gap-2 p-2 bg-[#07090e] rounded-lg border border-[#E8E6E0]/10">
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] text-[#E8E6E0]/60 mb-1">
                    <span>LPF &larr; FILTER &rarr; HPF</span>
                    <span className="text-[#00f2fe]">
                      {deckA.filterSweep === 0
                        ? 'BYPASS'
                        : deckA.filterSweep < 0
                        ? `${Math.round(deckA.filterSweep * 100)}%`
                        : `+${Math.round(deckA.filterSweep * 100)}%`}
                    </span>
                  </div>
                  <input
                    aria-label="Deck A filter sweep"
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={deckA.filterSweep}
                    onChange={(e) => handleFilterSweepChange('A', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                  />
                </div>

                <button
                  onClick={() => handleToggleDelay('A')}
                  className={`px-2.5 py-2 text-[10px] font-bold rounded border transition-colors shrink-0 cursor-pointer ${
                    deckA.fxDelayActive
                      ? 'bg-[#00f2fe] text-[#07090A] border-[#00f2fe] shadow-[0_0_8px_#00f2fe]'
                      : 'bg-[#121622] text-[#E8E6E0]/70 border-[#E8E6E0]/15 hover:border-[#00f2fe]/40'
                  }`}
                >
                  DUB ECHO
                </button>
              </div>
            </div>
          </div>

          {/* Large Tactile Transport Buttons: SYNC, CUE, PLAY/PAUSE */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#00f2fe]/20">
            {/* SYNC */}
            <button
              onClick={() => handleSync('A')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                deckA.syncActive
                  ? 'bg-[#00f2fe] text-[#07090A] border-[#00f2fe] shadow-[0_0_12px_#00f2fe]'
                  : 'bg-[#121622] text-[#00f2fe] border-[#00f2fe]/40 hover:bg-[#00f2fe]/10'
              }`}
            >
              <span>SYNC</span>
              <span className="text-[8px] opacity-70">[E]</span>
            </button>

            {/* CUE */}
            <button
              onClick={() => handleCue('A')}
              className="flex-1 py-3 rounded-lg text-xs font-bold bg-gradient-to-b from-[#3a2012] to-[#1c1008] text-[#C47A2A] border border-[#C47A2A]/50 hover:border-[#C47A2A] shadow-[0_4px_8px_rgba(196,122,42,0.3)] active:translate-y-[1px] cursor-pointer flex flex-col items-center justify-center"
            >
              <span>CUE</span>
              <span className="text-[8px] opacity-70">[Q]</span>
            </button>

            {/* PLAY / PAUSE */}
            <button
              onClick={() => handlePlayPause('A')}
              className={`flex-[1.5] py-3 rounded-lg text-sm font-bold border transition-all active:translate-y-[1px] cursor-pointer flex flex-col items-center justify-center ${
                deckA.isPlaying
                  ? 'bg-gradient-to-b from-[#10b981] to-[#047857] text-white border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-b from-[#14261d] to-[#0b1410] text-[#10b981] border-[#10b981]/50 hover:border-[#10b981]'
              }`}
            >
              <span>{deckA.isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}</span>
              <span className="text-[8px] opacity-70">[W]</span>
            </button>

            {/* VINYL BRAKE */}
            <button
              onClick={() => handleVinylBrake('A')}
              className="px-2 py-3 bg-[#12141d] hover:bg-[#1a1e2b] text-[9px] text-[#E8E6E0]/60 hover:text-white rounded-lg border border-[#E8E6E0]/15 cursor-pointer"
              title="Vinyl Motor Slow Brake"
            >
              BRAKE
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER CONSOLE: 2-CHANNEL DJ MIXER & CROSSFADER           */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 bg-[#0d0f17] border border-[#E8E6E0]/20 rounded-xl p-3 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="text-center text-[10px] font-bold text-[#E8E6E0]/60 tracking-wider mb-2 pb-1 border-b border-[#E8E6E0]/10">
              DJ MIXER CONSOLE
            </div>

            {/* 3-Band Isolator EQ & Kills: Channel A vs Channel B */}
            <div className="grid grid-cols-2 gap-2 text-center my-2">
              {/* CH A EQ Strip */}
              <div className="space-y-2 bg-[#07090e] p-2 rounded-lg border border-[#00f2fe]/20">
                <span className="text-[9px] font-bold text-[#00f2fe]">CH A</span>

                {/* HIGH */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>HI</span>
                    <span>{deckA.eqHigh > 0 ? `+${deckA.eqHigh}dB` : `${deckA.eqHigh}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck A high EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckA.eqHigh}
                    onChange={(e) => handleEqChange('A', 'high', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                  />
                  <button
                    onClick={() => handleToggleKill('A', 'high')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckA.killHigh ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>

                {/* MID */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>MID</span>
                    <span>{deckA.eqMid > 0 ? `+${deckA.eqMid}dB` : `${deckA.eqMid}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck A mid EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckA.eqMid}
                    onChange={(e) => handleEqChange('A', 'mid', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                  />
                  <button
                    onClick={() => handleToggleKill('A', 'mid')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckA.killMid ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>

                {/* LOW */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>LOW</span>
                    <span>{deckA.eqLow > 0 ? `+${deckA.eqLow}dB` : `${deckA.eqLow}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck A low EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckA.eqLow}
                    onChange={(e) => handleEqChange('A', 'low', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                  />
                  <button
                    onClick={() => handleToggleKill('A', 'low')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckA.killLow ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>
              </div>

              {/* CH B EQ Strip */}
              <div className="space-y-2 bg-[#07090e] p-2 rounded-lg border border-[#f43f5e]/20">
                <span className="text-[9px] font-bold text-[#f43f5e]">CH B</span>

                {/* HIGH */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>HI</span>
                    <span>{deckB.eqHigh > 0 ? `+${deckB.eqHigh}dB` : `${deckB.eqHigh}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck B high EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckB.eqHigh}
                    onChange={(e) => handleEqChange('B', 'high', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#f43f5e]"
                  />
                  <button
                    onClick={() => handleToggleKill('B', 'high')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckB.killHigh ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>

                {/* MID */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>MID</span>
                    <span>{deckB.eqMid > 0 ? `+${deckB.eqMid}dB` : `${deckB.eqMid}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck B mid EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckB.eqMid}
                    onChange={(e) => handleEqChange('B', 'mid', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#f43f5e]"
                  />
                  <button
                    onClick={() => handleToggleKill('B', 'mid')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckB.killMid ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>

                {/* LOW */}
                <div>
                  <div className="flex justify-between text-[8px] text-[#E8E6E0]/50 mb-0.5">
                    <span>LOW</span>
                    <span>{deckB.eqLow > 0 ? `+${deckB.eqLow}dB` : `${deckB.eqLow}dB`}</span>
                  </div>
                  <input
                    aria-label="Deck B low EQ"
                    type="range"
                    min="-24"
                    max="12"
                    value={deckB.eqLow}
                    onChange={(e) => handleEqChange('B', 'low', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#f43f5e]"
                  />
                  <button
                    onClick={() => handleToggleKill('B', 'low')}
                    className={`mt-1 text-[8px] px-1 py-0.5 rounded w-full border ${
                      deckB.killLow ? 'bg-[#f43f5e] text-white border-white' : 'bg-[#121622] text-[#E8E6E0]/40 border-[#E8E6E0]/10'
                    }`}
                  >
                    KILL
                  </button>
                </div>
              </div>
            </div>

            {/* Dual Channel VU Meters and Level Faders */}
            <div className="grid grid-cols-2 gap-3 p-2 bg-[#07090e] rounded-xl border border-[#E8E6E0]/10 my-3">
              {/* CH A Volume & VU */}
              <div className="flex flex-col items-center">
                {/* 10-bar LED VU meter */}
                <div className="flex gap-0.5 mb-2 h-20 w-3 bg-[#0a0c10] p-0.5 rounded flex-col-reverse justify-between">
                  {[...Array(10)].map((_, i) => {
                    const active = deckA.vuLevel * 10 >= i;
                    const isRed = i >= 8;
                    const isYellow = i >= 6 && i < 8;
                    return (
                      <div
                        key={i}
                        className={`w-full h-1.5 rounded-xs transition-colors ${
                          active
                            ? isRed
                              ? 'bg-[#f43f5e]'
                              : isYellow
                              ? 'bg-[#E8D56B]'
                              : 'bg-[#10b981]'
                            : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Volume Fader A */}
                <input
                  aria-label="Deck A channel volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={deckA.volume}
                  onChange={(e) => handleChannelVolumeChange('A', parseFloat(e.target.value))}
                  className="h-24 w-1.5 appearance-none bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe]"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                />
                <span className="text-[8px] text-[#00f2fe] mt-1 font-bold">VOL A</span>
              </div>

              {/* CH B Volume & VU */}
              <div className="flex flex-col items-center">
                {/* 10-bar LED VU meter */}
                <div className="flex gap-0.5 mb-2 h-20 w-3 bg-[#0a0c10] p-0.5 rounded flex-col-reverse justify-between">
                  {[...Array(10)].map((_, i) => {
                    const active = deckB.vuLevel * 10 >= i;
                    const isRed = i >= 8;
                    const isYellow = i >= 6 && i < 8;
                    return (
                      <div
                        key={i}
                        className={`w-full h-1.5 rounded-xs transition-colors ${
                          active
                            ? isRed
                              ? 'bg-[#f43f5e]'
                              : isYellow
                              ? 'bg-[#E8D56B]'
                              : 'bg-[#10b981]'
                            : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Volume Fader B */}
                <input
                  aria-label="Deck B channel volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={deckB.volume}
                  onChange={(e) => handleChannelVolumeChange('B', parseFloat(e.target.value))}
                  className="h-24 w-1.5 appearance-none bg-[#1a1f30] rounded cursor-pointer accent-[#f43f5e]"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                />
                <span className="text-[8px] text-[#f43f5e] mt-1 font-bold">VOL B</span>
              </div>
            </div>
          </div>

          {/* Master Out & Tactile Crossfader Slider */}
          <div className="mt-2 pt-2 border-t border-[#E8E6E0]/10">
            {/* Master Gain knob */}
            <div className="flex items-center justify-between text-[9px] text-[#E8E6E0]/60 mb-1">
              <span>MASTER OUT</span>
              <span className="text-white font-bold">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              aria-label="Master output volume"
              type="range"
              min="0"
              max="1.2"
              step="0.02"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#E8D56B] mb-3"
            />

            {/* Crossfader Section */}
            <div className="bg-[#07090e] p-2.5 rounded-xl border border-[#E8E6E0]/15">
              <div className="flex justify-between text-[9px] font-bold mb-1">
                <span className="text-[#00f2fe]">DECK A</span>
                <span className="text-[#E8E6E0]/40 text-[8px]">CROSSFADER</span>
                <span className="text-[#f43f5e]">DECK B</span>
              </div>

              {/* Crossfader Slider */}
              <input
                aria-label="DJ crossfader position"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={crossfader}
                onChange={(e) => handleCrossfaderChange(parseFloat(e.target.value))}
                className="w-full h-3 appearance-none bg-[#1a1f30] rounded-lg cursor-pointer accent-[#E8D56B] shadow-inner"
              />

              {/* Quick Cut Buttons: A | CENTER | B */}
              <div className="flex justify-between items-center gap-1 mt-2">
                <button
                  onClick={() => handleCrossfaderChange(0)}
                  className="px-2 py-0.5 text-[8px] font-bold bg-[#121622] hover:bg-[#00f2fe]/20 text-[#00f2fe] rounded border border-[#00f2fe]/30 cursor-pointer"
                  title="Cut to Deck A [key: []"
                >
                  FULL A
                </button>
                <button
                  onClick={() => handleCrossfaderChange(0.5)}
                  className="px-2 py-0.5 text-[8px] font-bold bg-[#121622] hover:bg-[#E8D56B]/20 text-[#E8D56B] rounded border border-[#E8D56B]/30 cursor-pointer"
                  title="Center crossfader [key: \]"
                >
                  50/50
                </button>
                <button
                  onClick={() => handleCrossfaderChange(1)}
                  className="px-2 py-0.5 text-[8px] font-bold bg-[#121622] hover:bg-[#f43f5e]/20 text-[#f43f5e] rounded border border-[#f43f5e]/30 cursor-pointer"
                  title="Cut to Deck B [key: ]]"
                >
                  FULL B
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CONSOLE: DECK B (Rose / Emerald Theme)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#1c1216] via-[#140e11] to-[#0a0709] border border-[#f43f5e]/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            {/* Deck B Header & Track Selector */}
            <div className="flex items-center justify-between mb-3 border-b border-[#f43f5e]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-[#f43f5e]/20 text-[#f43f5e] font-bold rounded">
                  DECK B
                </span>
                <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {deckB.track?.title || 'Select Track'}
                </span>
              </div>
              <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded font-mono">
                {deckB.track?.key || '6B / B♭ Major'}
              </span>
            </div>

            {/* Quick Track Picker Dropdown */}
            <div className="flex items-center gap-2 mb-4">
              <select
                aria-label="Load track into Deck B"
                value={deckB.track?.id || ''}
                onChange={(e) => handleSelectTrack('B', e.target.value)}
                className="flex-1 bg-[#0c080a] border border-[#f43f5e]/40 text-xs text-[#E8E6E0] rounded p-1.5 font-mono focus:outline-none focus:border-[#f43f5e]"
              >
                {PRELOADED_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} &middot; {t.artist} ({t.bpm} BPM)
                  </option>
                ))}
              </select>

              <label
                className="text-[10px] px-2 py-1.5 bg-[#22273a] hover:bg-[#323952] text-[#E8E6E0] rounded border border-[#E8E6E0]/20 cursor-pointer shrink-0"
                title="Load your own audio file to Deck B"
              >
                Upload
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCustomAudioUpload('B', e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {onSendTrackToSession && deckB.track && (
                <button
                  onClick={() => onSendTrackToSession(deckB.track!.title)}
                  className="text-[10px] px-2 py-1.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 hover:bg-[#6A8A4F]/30 rounded shrink-0 cursor-pointer"
                  title="Send Deck B stem into session stems matrix"
                >
                  To Stems
                </button>
              )}
            </div>

            {/* Turntable / Scratch Jog Wheel Area */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-3">
              {/* Pitch Fader & Tempo readout (Left of Platter on Deck B) */}
              <div className="flex flex-col items-center bg-[#0e0709] p-3 rounded-xl border border-[#E8E6E0]/10 w-28 order-2 sm:order-1">
                <span className="text-[9px] text-[#E8E6E0]/50 tracking-wider">TEMPO</span>
                <span className="text-sm font-bold text-[#f43f5e] my-1">
                  {deckB.effectiveBpm.toFixed(1)} <span className="text-[9px] text-white/50">BPM</span>
                </span>
                <span className="text-[10px] text-[#10b981]">
                  {deckB.pitch >= 0 ? `+${deckB.pitch.toFixed(1)}%` : `${deckB.pitch.toFixed(1)}%`}
                </span>

                {/* Pitch slider */}
                <div className="relative my-2 h-36 flex items-center justify-center">
                  <input
                    aria-label="Deck B pitch adjustment"
                    type="range"
                    min="-8"
                    max="8"
                    step="0.1"
                    value={deckB.pitch}
                    onChange={(e) => handlePitchChange('B', parseFloat(e.target.value))}
                    className="h-32 w-1.5 appearance-none bg-[#24151a] rounded cursor-pointer accent-[#f43f5e]"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <div
                    onClick={() => handlePitchChange('B', 0)}
                    className="absolute top-1/2 -translate-y-1/2 -right-3 text-[8px] text-[#E8E6E0]/40 hover:text-white cursor-pointer px-1"
                  >
                    0%
                  </div>
                </div>

                {/* Nudge Buttons */}
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleNudge('B', -1)}
                    className="px-2 py-0.5 bg-[#24151a] hover:bg-[#341d25] text-[9px] font-bold rounded border border-[#E8E6E0]/15"
                  >
                    -4%
                  </button>
                  <button
                    onClick={() => handleNudge('B', 1)}
                    className="px-2 py-0.5 bg-[#24151a] hover:bg-[#341d25] text-[9px] font-bold rounded border border-[#E8E6E0]/15"
                  >
                    +4%
                  </button>
                </div>
              </div>

              {/* Scratch Platter */}
              <div
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-grab active:cursor-grabbing select-none order-1 sm:order-2"
                style={{
                  background:
                    'radial-gradient(circle, #2b181f 0%, #150d11 50%, #000000 100%)',
                  boxShadow:
                    '0 12px 28px rgba(0,0,0,0.9), inset 0 0 15px rgba(244,63,94,0.25)',
                }}
                onMouseDown={(e) => handleScratchStart('B', e.clientX)}
                onMouseMove={(e) => handleScratchMove('B', e.clientX)}
                onMouseUp={() => handleScratchEnd('B')}
                onMouseLeave={() => handleScratchEnd('B')}
                onTouchStart={(e) => handleScratchStart('B', e.touches[0].clientX)}
                onTouchMove={(e) => handleScratchMove('B', e.touches[0].clientX)}
                onTouchEnd={() => handleScratchEnd('B')}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-11 rounded-full border border-white/5 pointer-events-none" />

                {/* Rotating Slipmat & Center Label */}
                <div
                  className="absolute inset-14 rounded-full bg-gradient-to-tr from-[#f43f5e] via-[#1c0f14] to-[#10b981] flex items-center justify-center shadow-lg transition-transform duration-75"
                  style={{
                    transform: `rotate(${rotationB}deg)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-[#07090A] border border-white/20 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[8px] font-bold text-[#f43f5e] tracking-widest">VVU</span>
                    <span className="text-[6px] text-white/70">B-SIDE</span>
                  </div>
                </div>

                {/* Center Spindle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_white] pointer-events-none" />

                {/* Scratch Needle Indicator */}
                <div
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-[#f43f5e] rounded shadow-[0_0_8px_#f43f5e] pointer-events-none"
                  style={{
                    transformOrigin: 'bottom center',
                    transform: `rotate(${rotationB}deg)`,
                  }}
                />
              </div>
            </div>

            {/* Performance Controls: Hot Cues & Auto-Loops */}
            <div className="space-y-3 pt-2 border-t border-[#f43f5e]/15">
              {/* Hot Cue Pads */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-[#f43f5e] font-semibold">HOT CUES</span>
                  <button
                    onClick={() => handleClearHotCues('B')}
                    className="text-[#E8E6E0]/40 hover:text-white text-[9px] cursor-pointer"
                  >
                    Clear Cues
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {deckB.hotCues.map((cue, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHotCue('B', idx)}
                      className={`py-2 px-1 rounded text-center text-[10px] font-bold border transition-all cursor-pointer ${
                        cue !== null
                          ? 'bg-[#f43f5e]/20 text-[#f43f5e] border-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : 'bg-[#180f13] text-[#E8E6E0]/40 border-[#E8E6E0]/10 hover:border-[#f43f5e]/40'
                      }`}
                    >
                      <span>CUE {idx + 1}</span>
                      <span className="block text-[8px] font-mono mt-0.5 opacity-80">
                        {cue !== null ? formatTime(cue) : 'EMPTY'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Loop Buttons */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="text-[#10b981] font-semibold">AUTO LOOP</span>
                  <span className="text-[9px] text-[#E8E6E0]/50">
                    {deckB.loopActive ? `Loop: ${deckB.loopBeats} Beats` : 'Off'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 4, 8, 16].map((beats) => (
                    <button
                      key={beats}
                      onClick={() => handleToggleLoop('B', beats)}
                      className={`py-1 text-center text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                        deckB.loopActive && deckB.loopBeats === beats
                          ? 'bg-[#10b981] text-[#07090A] border-[#10b981] font-extrabold shadow-[0_0_8px_#10b981]'
                          : 'bg-[#180f13] text-[#E8E6E0]/70 border-[#E8E6E0]/10 hover:border-[#10b981]/40'
                      }`}
                    >
                      {beats}B
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter Sweep & Dub Delay FX */}
              <div className="flex items-center justify-between gap-2 p-2 bg-[#0e0709] rounded-lg border border-[#E8E6E0]/10">
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] text-[#E8E6E0]/60 mb-1">
                    <span>LPF &larr; FILTER &rarr; HPF</span>
                    <span className="text-[#f43f5e]">
                      {deckB.filterSweep === 0
                        ? 'BYPASS'
                        : deckB.filterSweep < 0
                        ? `${Math.round(deckB.filterSweep * 100)}%`
                        : `+${Math.round(deckB.filterSweep * 100)}%`}
                    </span>
                  </div>
                  <input
                    aria-label="Deck B filter sweep"
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={deckB.filterSweep}
                    onChange={(e) => handleFilterSweepChange('B', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#24151a] rounded cursor-pointer accent-[#f43f5e]"
                  />
                </div>

                <button
                  onClick={() => handleToggleDelay('B')}
                  className={`px-2.5 py-2 text-[10px] font-bold rounded border transition-colors shrink-0 cursor-pointer ${
                    deckB.fxDelayActive
                      ? 'bg-[#f43f5e] text-[#07090A] border-[#f43f5e] shadow-[0_0_8px_#f43f5e]'
                      : 'bg-[#180f13] text-[#E8E6E0]/70 border-[#E8E6E0]/15 hover:border-[#f43f5e]/40'
                  }`}
                >
                  DUB ECHO
                </button>
              </div>
            </div>
          </div>

          {/* Large Tactile Transport Buttons: SYNC, CUE, PLAY/PAUSE */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f43f5e]/20">
            {/* SYNC */}
            <button
              onClick={() => handleSync('B')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                deckB.syncActive
                  ? 'bg-[#f43f5e] text-white border-[#f43f5e] shadow-[0_0_12px_#f43f5e]'
                  : 'bg-[#180f13] text-[#f43f5e] border-[#f43f5e]/40 hover:bg-[#f43f5e]/10'
              }`}
            >
              <span>SYNC</span>
              <span className="text-[8px] opacity-70">[O]</span>
            </button>

            {/* CUE */}
            <button
              onClick={() => handleCue('B')}
              className="flex-1 py-3 rounded-lg text-xs font-bold bg-gradient-to-b from-[#3a1820] to-[#1a0a0e] text-[#f43f5e] border border-[#f43f5e]/50 hover:border-[#f43f5e] shadow-[0_4px_8px_rgba(244,63,94,0.3)] active:translate-y-[1px] cursor-pointer flex flex-col items-center justify-center"
            >
              <span>CUE</span>
              <span className="text-[8px] opacity-70">[U]</span>
            </button>

            {/* PLAY / PAUSE */}
            <button
              onClick={() => handlePlayPause('B')}
              className={`flex-[1.5] py-3 rounded-lg text-sm font-bold border transition-all active:translate-y-[1px] cursor-pointer flex flex-col items-center justify-center ${
                deckB.isPlaying
                  ? 'bg-gradient-to-b from-[#10b981] to-[#047857] text-white border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-b from-[#1c1216] to-[#0d080a] text-[#10b981] border-[#10b981]/50 hover:border-[#10b981]'
              }`}
            >
              <span>{deckB.isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}</span>
              <span className="text-[8px] opacity-70">[I]</span>
            </button>

            {/* VINYL BRAKE */}
            <button
              onClick={() => handleVinylBrake('B')}
              className="px-2 py-3 bg-[#12141d] hover:bg-[#1a1e2b] text-[9px] text-[#E8E6E0]/60 hover:text-white rounded-lg border border-[#E8E6E0]/15 cursor-pointer"
              title="Vinyl Motor Slow Brake"
            >
              BRAKE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
