/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface UnderstandingMapDisplayProps {
  currentStep: number;
  completed: boolean;
  onSelectStep?: (step: number) => void;
}

const STEPS = [
  { num: 1, title: 'Identity', desc: 'Creative credentials' },
  { num: 2, title: 'Institution', desc: 'VVU Foundation Reg' },
  { num: 3, title: 'Intent', desc: 'DSP & Audio Scope' },
  { num: 4, title: 'Attestation', desc: 'ProofBridge signing' },
];

export const UnderstandingMapDisplay: React.FC<UnderstandingMapDisplayProps> = ({
  currentStep,
  completed,
  onSelectStep,
}) => {
  return (
    <div className="flex flex-col gap-5 text-xs font-mono">
      <div className="pb-3 border-b border-white/10">
        <div className="text-[10px] text-[#C47A2A] uppercase font-bold tracking-wider">
          UNDERSTANDING MAP
        </div>
        <div className="text-[11px] text-[#e8e6e0]/60 mt-0.5">
          Lindiwe Induction Pathway
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((s) => {
          const isPassed = currentStep > s.num || completed;
          const isCurrent = currentStep === s.num && !completed;

          return (
            <div
              key={s.num}
              onClick={() => onSelectStep?.(s.num)}
              className={`p-2.5 rounded transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-[#c47a2a]/20 border-[#c47a2a] text-white shadow-md'
                  : isPassed
                  ? 'bg-white/5 border-emerald-500/40 text-emerald-400'
                  : 'bg-black/20 border-white/5 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[10px] tracking-wider uppercase">
                  STEP 0{s.num}
                </span>
                <span className="text-[9px]">
                  {isPassed ? '✓ PASS' : isCurrent ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              <div className="font-semibold text-xs text-[#e8e6e0]">{s.title}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{s.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 text-[10px] text-white/40 leading-relaxed font-sans">
        Protocol: VVU-LINDIWE-2026.03<br />
        Status: Secure Node Active
      </div>
    </div>
  );
};
