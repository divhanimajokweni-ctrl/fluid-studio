/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioRecorder, RecordedAudioTake } from '../services/audioRecorder';

interface LiveAudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTakeAsStem: (take: RecordedAudioTake) => void;
}

export const LiveAudioRecorderModal: React.FC<LiveAudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveTakeAsStem,
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'recorded'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [waveformSamples, setWaveformSamples] = useState<number[]>([]);
  const [avgDb, setAvgDb] = useState<number>(-60);
  const [peakDb, setPeakDb] = useState<number>(-60);
  const [currentTake, setCurrentTake] = useState<RecordedAudioTake | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Initialize recorder callbacks
  useEffect(() => {
    audioRecorder.onWaveformUpdate = (_sample, fullWaveform) => {
      // Keep up to 120 samples for scrolling waveform
      const slice = fullWaveform.slice(-120);
      setWaveformSamples([...slice]);
    };

    audioRecorder.onMeteringUpdate = (avg, peak) => {
      setAvgDb(avg);
      setPeakDb(peak);
    };

    return () => {
      audioRecorder.onWaveformUpdate = undefined;
      audioRecorder.onMeteringUpdate = undefined;
    };
  }, []);

  // Timer counter
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Draw waveform on canvas (matching audio_waveforms Flutter package style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#07090A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const samples = waveformSamples;

    // Draw center guideline
    ctx.strokeStyle = 'rgba(232, 230, 224, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    if (samples.length === 0) {
      ctx.fillStyle = 'rgba(232, 230, 224, 0.2)';
      ctx.font = '10px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(
        recordingState === 'idle'
          ? 'Pressione GRAVAR para iniciar a captura de áudio com microfone'
          : 'Aguardando sinal de áudio...',
        canvas.width / 2,
        centerY + 4
      );
      return;
    }

    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(canvas.width / (barWidth + gap));
    const renderSamples = samples.slice(-totalBars);

    renderSamples.forEach((level, i) => {
      const x = i * (barWidth + gap);
      const barHeight = Math.max(4, level * (canvas.height * 0.85));
      const topY = centerY - barHeight / 2;

      // Color based on intensity
      let color = '#6A8A4F'; // moss
      if (level > 0.7) color = '#f43f5e'; // red/pink peak
      else if (level > 0.4) color = '#E8D56B'; // yellow

      ctx.fillStyle = color;
      ctx.fillRect(x, topY, barWidth, barHeight);
    });

    // If recorded and previewing, draw playhead
    if (recordingState === 'recorded' && previewProgress > 0) {
      const playheadX = previewProgress * canvas.width;
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(playheadX, 0, 2, canvas.height);
    }
  }, [waveformSamples, recordingState, previewProgress]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      setWaveformSamples([]);
      setElapsedSeconds(0);
      setCurrentTake(null);
      await audioRecorder.start();
      setRecordingState('recording');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao acessar microfone';
      setErrorMessage(`Permissão de microfone negada ou indisponível: ${msg}`);
    }
  };

  const handlePauseResume = () => {
    if (recordingState === 'recording') {
      audioRecorder.pause();
      setRecordingState('paused');
    } else if (recordingState === 'paused') {
      audioRecorder.resume();
      setRecordingState('recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      const take = await audioRecorder.stop();
      setRecordingState('recorded');
      setCurrentTake(take);
      setPreviewProgress(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao parar gravação';
      setErrorMessage(msg);
    }
  };

  const handleTogglePreview = () => {
    if (!currentTake) return;

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(currentTake.url);
      audioPreviewRef.current.ontimeupdate = () => {
        if (audioPreviewRef.current && currentTake.duration > 0) {
          setPreviewProgress(audioPreviewRef.current.currentTime / currentTake.duration);
        }
      };
      audioPreviewRef.current.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleDiscard = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setRecordingState('idle');
    setElapsedSeconds(0);
    setWaveformSamples([]);
    setCurrentTake(null);
    setIsPlayingPreview(false);
    setPreviewProgress(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-xl w-full p-6 sm:p-7 relative shadow-2xl rounded-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E6E0]/10">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                recordingState === 'recording'
                  ? 'bg-[#f43f5e] animate-ping'
                  : recordingState === 'paused'
                  ? 'bg-[#E8D56B]'
                  : 'bg-[#6A8A4F]'
              }`}
            />
            <span className="font-display text-2xl font-bold text-[#E8E6E0]">
              Gravador de Áudio &amp; Waveforms
            </span>
          </div>
          <button
            onClick={() => {
              if (recordingState === 'recording') audioRecorder.stop();
              onClose();
            }}
            className="text-[#E8E6E0]/50 hover:text-white cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Waveform Display */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs text-[#E8E6E0]/60">
            <span className="text-[#C47A2A] font-bold">FLUID WAVEFORM METER (LIVE)</span>
            <span className="font-bold text-sm tracking-widest text-[#E8D56B] tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={520}
            height={110}
            className="w-full h-28 bg-[#07090A] border border-[#E8E6E0]/15 cursor-crosshair"
          />

          {/* Level Meter Bar (dB meter) */}
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="p-2 bg-[#07090A] border border-[#E8E6E0]/10">
              <div className="flex justify-between mb-1 text-[#E8E6E0]/50">
                <span>AVERAGE POWER:</span>
                <span className="text-[#6A8A4F] font-bold tabular-nums">{avgDb} dB</span>
              </div>
              <div className="h-1.5 bg-[#12141d] overflow-hidden">
                <div
                  className="h-full bg-[#6A8A4F] transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(0, ((avgDb + 60) / 60) * 100))}%` }}
                />
              </div>
            </div>

            <div className="p-2 bg-[#07090A] border border-[#E8E6E0]/10">
              <div className="flex justify-between mb-1 text-[#E8E6E0]/50">
                <span>PEAK POWER:</span>
                <span className="text-[#f43f5e] font-bold tabular-nums">{peakDb} dB</span>
              </div>
              <div className="h-1.5 bg-[#12141d] overflow-hidden">
                <div
                  className="h-full bg-[#f43f5e] transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(0, ((peakDb + 60) / 60) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 bg-[#f43f5e]/10 border border-[#f43f5e]/40 text-[#f43f5e] text-xs">
            {errorMessage}
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E6E0]/10">
          <div className="flex items-center gap-2">
            {recordingState === 'idle' && (
              <button
                onClick={handleStartRecording}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f43f5e] hover:bg-[#f43f5e]/90 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-[#f43f5e]/20 transition-all active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Gravar Microfone</span>
              </button>
            )}

            {(recordingState === 'recording' || recordingState === 'paused') && (
              <>
                <button
                  onClick={handlePauseResume}
                  className="px-4 py-2 border border-[#E8D56B]/60 text-[#E8D56B] hover:bg-[#E8D56B]/10 text-xs font-bold tracking-wider uppercase cursor-pointer"
                >
                  {recordingState === 'recording' ? '❚❚ Pausar' : '▶ Retomar'}
                </button>
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2 bg-[#f43f5e] text-white text-xs font-bold tracking-wider uppercase cursor-pointer hover:bg-[#f43f5e]/90"
                >
                  ■ Concluir Take
                </button>
              </>
            )}

            {recordingState === 'recorded' && (
              <>
                <button
                  onClick={handleTogglePreview}
                  className="px-4 py-2 bg-[#6A8A4F] text-[#07090A] text-xs font-bold tracking-wider uppercase cursor-pointer hover:bg-[#6A8A4F]/90"
                >
                  {isPlayingPreview ? '❚❚ Pausar' : '▶ Ouvir Take'}
                </button>
                <button
                  onClick={handleDiscard}
                  className="px-3 py-2 border border-[#E8E6E0]/20 text-[#E8E6E0]/60 hover:text-white text-xs cursor-pointer"
                >
                  Gravar Novamente
                </button>
              </>
            )}
          </div>

          {currentTake && (
            <button
              onClick={() => {
                onSaveTakeAsStem(currentTake);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#F5F0E0] text-[#07090A] font-bold text-xs tracking-wider uppercase cursor-pointer hover:bg-white shadow-md"
            >
              ✓ Salvar Como Stem
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
