/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Tactile3DNavBarProps {
  currentTab: 'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge';
  onSelectTab: (tab: 'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge') => void;
  onOpenMixer: () => void;
  isMixerOpen: boolean;
  onOpenRecord: () => void;
  onOpenPlutoGrid: () => void;
  onOpenLyrics: () => void;
  onOpenSoundPacks?: () => void;
  onOpenSubscription?: () => void;
}

export const Tactile3DNavBar: React.FC<Tactile3DNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMixer,
  isMixerOpen,
  onOpenRecord,
  onOpenPlutoGrid,
  onOpenLyrics,
  onOpenSoundPacks,
  onOpenSubscription,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] w-auto">
      {/* 3D Elevated Navigation Deck */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-[#1c1f2e] via-[#12141f] to-[#0a0b12] border border-[#E8E6E0]/15"
        style={{
          boxShadow:
            '0 16px 32px -4px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)',
        }}
      >
        {/* Button 1: Overview */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-gradient-to-b from-[#0a0b12] to-[#141624] text-[#E8D56B] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_0_12px_rgba(232,213,107,0.3)] border border-[#E8D56B]/40 translate-y-[1px]'
              : 'bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="hidden xs:inline">Overview</span>
        </button>

        {/* Button 2: Beat Lab */}
        <button
          onClick={() => onSelectTab('daw')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
            currentTab === 'daw'
              ? 'bg-gradient-to-b from-[#0a0b12] to-[#141624] text-[#C47A2A] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_0_12px_rgba(196,122,42,0.3)] border border-[#C47A2A]/40 translate-y-[1px]'
              : 'bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          <span className="hidden xs:inline">Beat Lab</span>
        </button>

        {/* Button 3: UbuntuDJ Parallel */}
        <button
          onClick={() => onSelectTab('ubuntudj')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
            currentTab === 'ubuntudj'
              ? 'bg-gradient-to-b from-[#0a0b12] to-[#141624] text-[#00f2fe] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_0_12px_rgba(0,242,254,0.3)] border border-[#00f2fe]/40 translate-y-[1px]'
              : 'bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10 hover:border-[#00f2fe]/30 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="hidden xs:inline">UbuntuDJ</span>
        </button>

        {/* Button 3: Mic Record Take */}
        <button
          onClick={onOpenRecord}
          className="flex items-center gap-1.5 px-3 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold bg-gradient-to-b from-[#3a1820] to-[#200c12] text-[#f43f5e] hover:text-white border border-[#f43f5e]/40 hover:border-[#f43f5e] shadow-[0_4px_8px_rgba(244,63,94,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse" />
          <span className="hidden sm:inline">Record</span>
        </button>

        {/* Button 4: Lyrics Notebook */}
        <button
          onClick={onOpenLyrics}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8D56B] hover:text-white border border-[#E8E6E0]/10 hover:border-[#E8D56B]/40 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <span>✍</span>
          <span className="hidden sm:inline">Lyrics</span>
        </button>

        {/* Button 5: Pluto Grid */}
        <button
          onClick={onOpenPlutoGrid}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3z" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
          <span className="hidden md:inline">Pluto Grid</span>
        </button>

        {/* Button 6: ProofBridge Gates */}
        <button
          onClick={() => onSelectTab('proofbridge')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
            currentTab === 'proofbridge'
              ? 'bg-gradient-to-b from-[#0a0b12] to-[#141624] text-[#6A8A4F] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_0_12px_rgba(106,138,79,0.3)] border border-[#6A8A4F]/40 translate-y-[1px]'
              : 'bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10 hover:border-[#E8E6E0]/30 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px]'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="hidden xs:inline">Gates</span>
        </button>

        {/* Button 7: Sound Packs */}
        {onOpenSoundPacks && (
          <button
            onClick={onOpenSoundPacks}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold bg-gradient-to-b from-[#22273a] to-[#151724] text-[#C47A2A] hover:text-white border border-[#E8E6E0]/10 hover:border-[#C47A2A]/40 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px] transition-all cursor-pointer"
            title="Browse African Sound Packs & Samples"
          >
            <span>📦</span>
            <span className="hidden lg:inline">Packs</span>
          </button>
        )}

        {/* Button 8: Subscription Upgrade */}
        {onOpenSubscription && (
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold bg-gradient-to-b from-[#3a2610] to-[#1e1308] text-[#E8D56B] hover:text-white border border-[#E8D56B]/40 hover:border-[#E8D56B] shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] active:translate-y-[2px] transition-all cursor-pointer"
            title="Subscription & Storage Quotas"
          >
            <span>💎</span>
            <span className="hidden lg:inline">Pro</span>
          </button>
        )}

        {/* Button 9: Mixer PiP Toggle */}
        <button
          onClick={onOpenMixer}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-mono-code font-bold transition-all cursor-pointer ${
            isMixerOpen
              ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/60 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
              : 'bg-gradient-to-b from-[#22273a] to-[#151724] text-[#E8E6E0]/70 hover:text-white border border-[#E8E6E0]/10'
          }`}
          title="Toggle Floating Mixer PiP with Oscilloscope"
        >
          <span className="text-[10px]">PiP</span>
        </button>
      </div>
    </div>
  );
};
