/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAudioContext, bufferToWave } from './audioEngine';

export interface RecordedAudioTake {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  waveformData: number[];
  timestamp: string;
}

export class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isRecording = false;
  private isPaused = false;
  private startTime = 0;
  private pauseTime = 0;
  private recordedWaveform: number[] = [];

  public onWaveformUpdate?: (level: number, currentWaveform: number[]) => void;
  public onMeteringUpdate?: (averagePowerDb: number, peakPowerDb: number) => void;

  async start(): Promise<void> {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      // Fallback with default constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    this.audioChunks = [];
    this.recordedWaveform = [];

    // Real-time analysis for waveform
    this.sourceNode = ctx.createMediaStreamSource(this.mediaStream);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.7;
    this.sourceNode.connect(this.analyser);

    // MediaRecorder for recording stream
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.mediaStream, { mimeType })
      : new MediaRecorder(this.mediaStream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(50); // slice every 50ms
    this.isRecording = true;
    this.isPaused = false;
    this.startTime = Date.now();

    this.pollWaveform();
  }

  private pollWaveform = () => {
    if (!this.isRecording) return;

    if (!this.isPaused && this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(dataArray);

      // Compute RMS and peak
      let sumSquares = 0;
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const norm = (dataArray[i] - 128) / 128;
        const abs = Math.abs(norm);
        if (abs > peak) peak = abs;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      // Convert to dB (-60dB to 0dB)
      const rmsDb = rms > 0 ? Math.max(-60, 20 * Math.log10(rms)) : -60;
      const peakDb = peak > 0 ? Math.max(-60, 20 * Math.log10(peak)) : -60;

      // Normalized level 0.05 to 1.0 for waveform drawing
      const level = Math.max(0.08, Math.min(1.0, peak * 1.5));
      this.recordedWaveform.push(level);

      if (this.onWaveformUpdate) {
        this.onWaveformUpdate(level, this.recordedWaveform);
      }

      if (this.onMeteringUpdate) {
        this.onMeteringUpdate(Math.round(rmsDb), Math.round(peakDb));
      }
    }

    this.animFrameId = requestAnimationFrame(this.pollWaveform);
  };

  pause(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseTime = Date.now();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.startTime += Date.now() - this.pauseTime;
    }
  }

  async stop(): Promise<RecordedAudioTake> {
    this.isRecording = false;
    this.isPaused = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('MediaRecorder not initialized');
      }

      this.mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });

        // Convert to standard WAV AudioBuffer via AudioContext for lossless studio integration
        const ctx = getAudioContext();
        let wavBlob = rawBlob;
        let duration = (Date.now() - this.startTime) / 1000;

        try {
          const arrayBuffer = await rawBlob.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          duration = decoded.duration;
          wavBlob = bufferToWave(decoded, decoded.length);
        } catch {
          // If browser can't decode webm instantly, use raw blob
          wavBlob = rawBlob;
        }

        const url = URL.createObjectURL(wavBlob);

        // Stop all microphone tracks
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }

        const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const take: RecordedAudioTake = {
          id: `take-${Date.now()}`,
          name: `Take_Vocal_${dateStr}.wav`,
          blob: wavBlob,
          url,
          duration,
          waveformData: this.recordedWaveform,
          timestamp: dateStr,
        };

        resolve(take);
      };

      this.mediaRecorder.stop();
    });
  }

  getIsRecording() {
    return this.isRecording;
  }

  getIsPaused() {
    return this.isPaused;
  }
}

export const audioRecorder = new AudioRecorderService();
