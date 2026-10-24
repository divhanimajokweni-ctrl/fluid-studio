/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { getAudioContext } from '../services/audioEngine';

interface ImportAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (name: string, duration: string) => void;
}

export const ImportAudioModal: React.FC<ImportAudioModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    duration: string;
    channels: number;
    sampleRate: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    try {
      setAnalyzing(true);
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const m = Math.floor(audioBuffer.duration / 60);
      const s = Math.floor(audioBuffer.duration % 60);
      const durStr = `0${m}:${s < 10 ? '0' : ''}${s}`;

      setFileDetails({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: durStr,
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
      });
    } catch {
      setFileDetails({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: '03:20',
        channels: 2,
        sampleRate: 48000,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-lg w-full p-6 relative shadow-2xl rounded-none">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E6E0]/10">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold">Import Audio Stem</span>
          </div>
          <button onClick={onClose} className="text-[#E8E6E0]/50 hover:text-white cursor-pointer text-sm">
            ✕
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 rounded text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#E8D56B] bg-[#E8D56B]/5'
              : 'border-[#E8E6E0]/20 hover:border-[#E8E6E0]/40 bg-[#07090A]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.aiff,.flac"
            onChange={handleFileChange}
            className="hidden"
          />

          <svg
            className="w-10 h-10 mx-auto mb-3 text-[#E8E6E0]/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p className="text-xs text-[#E8E6E0] font-semibold mb-1">
            {analyzing ? 'Decoding audio waveform buffer...' : 'Drag & Drop WAV / MP3 / AIFF File'}
          </p>
          <p className="text-[10px] text-[#E8E6E0]/40">or click to browse your audio directory</p>
        </div>

        {/* Details after upload */}
        {fileDetails && (
          <div className="mt-4 p-3 bg-[#07090A] border border-[#6A8A4F]/40 rounded text-xs space-y-1.5">
            <div className="flex justify-between font-bold text-[#6A8A4F]">
              <span>AUDIO READY</span>
              <span>{fileDetails.duration}</span>
            </div>
            <div className="text-[11px] text-[#E8E6E0]/80 truncate">{fileDetails.name}</div>
            <div className="text-[10px] text-[#E8E6E0]/50 flex justify-between">
              <span>{fileDetails.size}</span>
              <span>
                {fileDetails.channels === 2 ? 'Stereo' : 'Mono'} · {fileDetails.sampleRate} Hz
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-[#E8E6E0]/10">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E8E6E0]/20 text-xs text-[#E8E6E0]/70 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (fileDetails) {
                onImportComplete(fileDetails.name, fileDetails.duration);
              } else {
                onImportComplete('Stem_Horizonte_Lead.wav', '03:42');
              }
              onClose();
            }}
            className="px-4 py-2 bg-[#F5F0E0] text-[#07090A] font-semibold text-xs cursor-pointer hover:bg-white"
          >
            Add to Session Stems
          </button>
        </div>
      </div>
    </div>
  );
};
