/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { getAnalyser, setMasterGainValue } from '../services/audioEngine';

interface MixerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixerOverlay: React.FC<MixerOverlayProps> = ({ isOpen, onClose }) => {
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.75;
      ctx.strokeStyle = '#00f2fe';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Subtle center zero-crossing line
      ctx.strokeStyle = 'rgba(232, 230, 224, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen]);

  const handleVolumeChange = (newVal: number) => {
    setMasterVolume(newVal);
    setMasterGainValue(newVal);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-8 w-80 sm:w-88 bg-[#12141d]/95 border border-[#00f2fe]/60 rounded-xl backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] z-50 overflow-hidden font-mono-code text-[#E8E6E0]">
      {/* Header */}
      <div className="bg-[#1a1d2b] px-3.5 py-2 text-[11px] font-bold flex justify-between items-center border-b border-[#E8E6E0]/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
          <span className="text-[#00f2fe] tracking-wider">MASTER OSCILLOSCOPE &amp; BUS</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#E8E6E0]/60 hover:text-white px-1.5 py-0.5 rounded cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Real-time Oscilloscope Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={76}
          className="w-full h-20 bg-[#07090A] rounded border border-[#E8E6E0]/15"
        />

        {/* Master Gain & db Readout */}
        <div className="flex justify-between items-center text-[10px] text-[#E8E6E0]/70 font-mono">
          <span>VOLUME MASTER</span>
          <span className="text-[#00f2fe] font-bold">{Math.round(masterVolume * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-[#00f2fe] cursor-pointer"
        />

        {/* Channel Bus Monitors */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#E8E6E0]/10 text-center">
          <div className="bg-[#07090A] p-1.5 rounded border border-[#E8E6E0]/10">
            <div className="text-[8px] text-[#00f2fe]">KICK</div>
            <div className="text-[10px] font-bold text-[#E8E6E0]">0.0 dB</div>
          </div>
          <div className="bg-[#07090A] p-1.5 rounded border border-[#E8E6E0]/10">
            <div className="text-[8px] text-[#f43f5e]">SNARE</div>
            <div className="text-[10px] font-bold text-[#E8E6E0]">-0.8 dB</div>
          </div>
          <div className="bg-[#07090A] p-1.5 rounded border border-[#E8E6E0]/10">
            <div className="text-[8px] text-[#E8D56B]">HI-HAT</div>
            <div className="text-[10px] font-bold text-[#E8E6E0]">-2.4 dB</div>
          </div>
          <div className="bg-[#07090A] p-1.5 rounded border border-[#E8E6E0]/10">
            <div className="text-[8px] text-[#8b5cf6]">SYNTH</div>
            <div className="text-[10px] font-bold text-[#E8E6E0]">-1.2 dB</div>
          </div>
        </div>

        <div className="flex justify-between text-[8px] text-[#E8E6E0]/40 pt-1">
          <span>TRUE PEAK: -0.1 dBTP</span>
          <span>LATÊNCIA: 1.8ms</span>
        </div>
      </div>
    </div>
  );
};
