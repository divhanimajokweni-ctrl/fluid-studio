/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { projectTracker } from '../services/projectTracker';

interface ProjectTemplate {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  key: string;
  sampleRate: number;
  description: string;
  badge: string;
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tpl-horizonte',
    name: 'Horizonte (Afro-Trap / R&B)',
    genre: 'Afro-Trap',
    bpm: 124,
    key: 'F# min',
    sampleRate: 48000,
    description: '8-stem arrangement, syncopated 16th hats, sub kick 909 and sawtooth synth lead.',
    badge: 'Flagship Template',
  },
  {
    id: 'tpl-drill',
    name: '808 Drill & Trap Banger',
    genre: 'Trap / Drill',
    bpm: 140,
    key: 'C# min',
    sampleRate: 48000,
    description: 'Aggressive 808 glides, triple-time snare rolls, and dark filtered harmonic textures.',
    badge: 'Popular',
  },
  {
    id: 'tpl-chill',
    name: 'Chill Hip-Hop & Soul Chords',
    genre: 'Lo-Fi / Soul',
    bpm: 92,
    key: 'A min',
    sampleRate: 48000,
    description: 'Swung snare velocity, vintage rhodes chords, and warm vinyl kick tone.',
    badge: 'Warm Vintage',
  },
  {
    id: 'tpl-amapiano',
    name: 'Amapiano & Afrobeats Pulse',
    genre: 'Amapiano',
    bpm: 113,
    key: 'G maj',
    sampleRate: 48000,
    description: 'Deep resonant log drum baseline, shaker pattern, and syncopated rim rimshots.',
    badge: 'VVU Groove',
  },
];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, bpm: number, key: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tpl-horizonte');
  const [title, setTitle] = useState<string>('New Studio Session');
  const [bpm, setBpm] = useState<number>(124);
  const [key, setKey] = useState<string>('F# min');
  const [sampleRate, setSampleRate] = useState<string>('48000');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: ProjectTemplate) => {
    setSelectedTemplate(tpl.id);
    setIsCustom(false);
    setTitle(`${tpl.name} Session`);
    setBpm(tpl.bpm);
    setKey(tpl.key);
    setSampleRate(String(tpl.sampleRate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    projectTracker.addProject({
      title,
      artist: 'Mino Enchilotto',
      genre: isCustom ? 'Custom Production' : TEMPLATES.find((t) => t.id === selectedTemplate)?.genre || 'Audio Production',
      bpm,
      key,
      stage: 'Capture & Edit',
      progress: 0,
      tracksCount: 4,
      duration: '03:30',
      sampleRate: Number(sampleRate),
      bitDepth: 24,
      notes: 'Initial session track setup with ProofBridge quality gate verification.',
      tags: ['New Session', '24-bit'],
    });

    onCreateProject(title, bpm, key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-2xl w-full p-6 sm:p-7 relative shadow-2xl overflow-hidden rounded-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E8E6E0]/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8D56B]" />
            <h2 className="font-display text-2xl font-bold text-[#E8E6E0]">
              Create New Project / Choose Template
            </h2>
          </div>
          <button onClick={onClose} className="text-[#E8E6E0]/50 hover:text-white cursor-pointer text-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Templates Grid */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#E8E6E0]/50 mb-2">
              Select Production Template (or Blank Session)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id && !isCustom;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#C47A2A]/20 border-[#C47A2A] shadow-md'
                        : 'bg-[#07090A] border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-[#E8E6E0] text-[11px] truncate">
                        {tpl.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#E8D56B]/20 text-[#E8D56B] rounded border border-[#E8D56B]/40">
                        {tpl.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#E8E6E0]/50 mb-1.5">
                      {tpl.bpm} BPM · {tpl.key} · {tpl.sampleRate / 1000} kHz
                    </div>
                    <div className="text-[10px] text-[#E8E6E0]/70 font-sans leading-tight">
                      {tpl.description}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true);
                  setTitle('Custom Blank Project');
                }}
                className={`text-[10px] uppercase cursor-pointer hover:underline ${
                  isCustom ? 'text-[#E8D56B] font-bold' : 'text-[#E8E6E0]/50'
                }`}
              >
                + Start With Custom Blank Session
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E8E6E0]/10">
            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase tracking-wider text-[#E8E6E0]/50 mb-1">
                Project Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#07090A] border border-[#E8E6E0]/20 px-3 py-1.5 text-xs text-[#E8E6E0] focus:outline-none focus:border-[#E8D56B]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#E8E6E0]/50 mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min={60}
                max={220}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full bg-[#07090A] border border-[#E8E6E0]/20 px-3 py-1.5 text-xs text-[#E8E6E0] focus:outline-none focus:border-[#E8D56B]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#E8E6E0]/50 mb-1">
                Key Signature
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-[#07090A] border border-[#E8E6E0]/20 px-2 py-1.5 text-xs text-[#E8E6E0] focus:outline-none focus:border-[#E8D56B]"
              >
                <option value="F# min">F# min</option>
                <option value="C# min">C# min</option>
                <option value="A min">A min</option>
                <option value="D min">D min</option>
                <option value="E min">E min</option>
                <option value="G maj">G maj</option>
                <option value="C maj">C maj</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#E8E6E0]/50 mb-1">
                Sample Rate
              </label>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="w-full bg-[#07090A] border border-[#E8E6E0]/20 px-2 py-1.5 text-xs text-[#E8E6E0] focus:outline-none focus:border-[#E8D56B]"
              >
                <option value="48000">48.0 kHz · 24-bit (Studio)</option>
                <option value="44100">44.1 kHz · 16-bit (CD)</option>
                <option value="96000">96.0 kHz · 32-bit Float</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#E8E6E0]/10">
            <span className="text-[10px] text-[#6A8A4F] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6A8A4F]" />
              Offline session state &amp; ProofBridge IVE auto-tracking
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#E8E6E0]/20 text-xs text-[#E8E6E0]/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#F5F0E0] text-[#07090A] font-bold text-xs cursor-pointer hover:bg-white transition-all shadow-md"
              >
                Initialize Session
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
