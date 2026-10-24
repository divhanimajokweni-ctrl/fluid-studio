/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TempoKeyframe,
  TEMPO_PRESETS,
  calculateBpmAtStep,
} from '../services/tempoAutomation';

interface TempoAutomationLaneProps {
  currentStep: number;
  isPlaying: boolean;
  baseBpm: number;
  keyframes: TempoKeyframe[];
  onKeyframesChange: (keyframes: TempoKeyframe[]) => void;
  isAutomationEnabled: boolean;
  onToggleAutomation: () => void;
  onApplyDynamicBpm?: (bpm: number) => void;
}

export const TempoAutomationLane: React.FC<TempoAutomationLaneProps> = ({
  currentStep,
  isPlaying,
  baseBpm,
  keyframes,
  onKeyframesChange,
  isAutomationEnabled,
  onToggleAutomation,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('constant');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const currentDynamicBpm = isAutomationEnabled
    ? calculateBpmAtStep(currentStep, keyframes, baseBpm)
    : baseBpm;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = TEMPO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onKeyframesChange(found.keyframes);
    }
  };

  const handleAddOrUpdateKeyframe = (step: number, bpmVal: number) => {
    const existingIdx = keyframes.findIndex((k) => k.step === step);
    const updated = [...keyframes];
    if (existingIdx >= 0) {
      updated[existingIdx] = { ...updated[existingIdx], bpm: bpmVal };
    } else {
      updated.push({
        id: `kf-${step}-${Date.now()}`,
        step,
        bpm: bpmVal,
        curve: 'smooth',
      });
      updated.sort((a, b) => a.step - b.step);
    }
    onKeyframesChange(updated);
  };

  const minBpm = 60;
  const maxBpm = 160;
  const laneHeight = 80;
  const laneWidth = 100; // percent

  // Generate SVG path for tempo curve
  const points: { x: number; y: number; step: number; bpm: number }[] = [];
  for (let s = 0; s < 16; s++) {
    const b = calculateBpmAtStep(s, keyframes, baseBpm);
    const x = (s / 15) * 100;
    const y = laneHeight - ((b - minBpm) / (maxBpm - minBpm)) * laneHeight;
    points.push({ x, y, step: s, bpm: b });
  }

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-[#0a0d14] border border-[#00f2fe]/30 rounded-xl p-3 sm:p-4 my-3 font-mono-code text-[#E8E6E0] shadow-xl">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-[#00f2fe]/20">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Dynamic Tempo Automation Lane
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 font-mono">
                {isAutomationEnabled ? 'AUTOMATION ACTIVE' : 'LOCKED'}
              </span>
            </div>
            <span className="text-[10px] text-[#E8E6E0]/50">
              Modulate sequencer BPM dynamically per step &middot; African groove accelerando
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset dropdown */}
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            disabled={!isAutomationEnabled}
            className="bg-[#121622] border border-[#E8E6E0]/20 text-xs text-[#E8D56B] rounded px-2.5 py-1 focus:outline-none focus:border-[#00f2fe] disabled:opacity-40"
          >
            {TEMPO_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Toggle Automation Button */}
          <button
            onClick={onToggleAutomation}
            className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider cursor-pointer transition-colors ${
              isAutomationEnabled
                ? 'bg-[#00f2fe] text-[#07090A] shadow-[0_0_10px_#00f2fe]'
                : 'bg-[#1a1f30] text-[#E8E6E0]/60 hover:text-white'
            }`}
          >
            {isAutomationEnabled ? 'Engaged' : 'Bypass'}
          </button>
        </div>
      </div>

      {/* Live BPM HUD Indicator */}
      <div className="flex items-center justify-between text-xs px-2 mb-2 font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#E8E6E0]/60">
            Current Step: <strong className="text-white">{currentStep + 1} / 16</strong>
          </span>
          <span className="text-[#00f2fe] font-bold">
            Live Tempo:{' '}
            <span className="text-base font-extrabold text-[#E8D56B]">
              {currentDynamicBpm.toFixed(1)}
            </span>{' '}
            BPM
          </span>
        </div>
        <span className="text-[10px] text-[#E8E6E0]/40">
          Range: {minBpm} - {maxBpm} BPM
        </span>
      </div>

      {/* Interactive SVG Curve Container */}
      <div
        className={`relative w-full h-24 bg-[#07090e] border border-[#E8E6E0]/15 rounded-lg overflow-hidden ${
          !isAutomationEnabled ? 'opacity-40 pointer-events-none' : ''
        }`}
        onMouseLeave={() => setHoveredStep(null)}
      >
        {/* Step Grid Lines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`h-full border-r ${
                i % 4 === 0 ? 'border-white/15' : 'border-white/5'
              } ${i === currentStep && isPlaying ? 'bg-[#00f2fe]/10' : ''}`}
              style={{ width: `${100 / 16}%` }}
            />
          ))}
        </div>

        {/* Playhead Vertical Line */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#00f2fe] shadow-[0_0_8px_#00f2fe] z-20 pointer-events-none transition-all duration-75"
            style={{ left: `${(currentStep / 15) * 100}%` }}
          />
        )}

        {/* SVG Curve */}
        <svg
          viewBox={`0 0 100 ${laneHeight}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full z-10"
        >
          {/* Fill under curve */}
          <path
            d={`${pathD} L 100 ${laneHeight} L 0 ${laneHeight} Z`}
            fill="url(#tempoGradient)"
            opacity={0.3}
          />
          {/* Curve stroke */}
          <path d={pathD} fill="none" stroke="#00f2fe" strokeWidth="2" vectorEffect="non-scaling-stroke" />

          {/* Gradients */}
          <defs>
            <linearGradient id="tempoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Keyframe nodes */}
          {keyframes.map((kf) => {
            const x = (kf.step / 15) * 100;
            const y = laneHeight - ((kf.bpm - minBpm) / (maxBpm - minBpm)) * laneHeight;

            return (
              <g key={kf.id}>
                <circle cx={x} cy={y} r="4" fill="#E8D56B" stroke="#07090A" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {/* Interactive Click Points on the 16 steps */}
        <div className="absolute inset-0 flex z-30">
          {[...Array(16)].map((_, stepIdx) => (
            <div
              key={stepIdx}
              className="flex-1 h-full cursor-pointer hover:bg-white/5 transition-colors relative"
              onMouseEnter={() => setHoveredStep(stepIdx)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const ratio = 1 - clickY / rect.height;
                const newBpm = Math.round(minBpm + ratio * (maxBpm - minBpm));
                handleAddOrUpdateKeyframe(stepIdx, newBpm);
              }}
            >
              {hoveredStep === stepIdx && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#07090A] text-[#00f2fe] border border-[#00f2fe]/40 px-1.5 py-0.5 rounded text-[9px] pointer-events-none whitespace-nowrap z-40">
                  Step {stepIdx + 1}: {calculateBpmAtStep(stepIdx, keyframes, baseBpm)} BPM
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
