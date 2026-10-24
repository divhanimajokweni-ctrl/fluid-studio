/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TopNavProps {
  currentTab: 'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge';
  onSelectTab: (tab: 'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge') => void;
  onOpenMixer: () => void;
  isMixerOpen: boolean;
  onOpenNewProject: () => void;
  onOpenImport: () => void;
  onOpenLyrics: () => void;
  onOpenLindiwe: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMixer,
  isMixerOpen,
  onOpenNewProject,
  onOpenImport,
  onOpenLyrics,
  onOpenLindiwe,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 md:gap-6 px-5 py-3 md:px-10 bg-[#07090A]/90 backdrop-blur-xl border-b border-[#E8E6E0]/10 font-mono-code">
      {/* Zone 1: Brand Mark & Wordmark */}
      <div
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-3 cursor-pointer group shrink-0"
      >
        <svg className="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 60 60">
          <circle cx="23" cy="34" r="11" fill="none" stroke="#6A8A4F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="37" cy="34" r="11" fill="none" stroke="#E8D56B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="26" r="11" fill="none" stroke="#C47A2A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="31" r="2.2" fill="#F5F0E0" />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display italic font-bold text-xl md:text-2xl tracking-tight text-[#E8E6E0] leading-none">
              Fluid Studio
            </span>
            {/* Demographic & Context Alignment: EN (Studio Default) Badge */}
            <span className="text-[9px] px-1.5 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 rounded font-mono hidden sm:inline">
              EN (Studio Default)
            </span>
          </div>
          <span className="text-[9px] tracking-[0.2em] text-[#E8E6E0]/40 uppercase hidden sm:inline">
            Bench · Node-Locked
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-3 sm:gap-6 text-[11px] tracking-[0.16em] uppercase">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-[#E8D56B] border-b border-[#E8D56B]'
              : 'text-[#E8E6E0]/50 hover:text-[#E8E6E0]'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => onSelectTab('daw')}
          className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'daw'
              ? 'text-[#C47A2A] border-b border-[#C47A2A]'
              : 'text-[#E8E6E0]/50 hover:text-[#E8E6E0]'
          }`}
        >
          <span>Beat Lab</span>
          <span className="text-[9px] px-1 py-0.2 bg-[#C47A2A]/20 text-[#C47A2A] rounded border border-[#C47A2A]/40 font-mono-code">
            16-STEP
          </span>
        </button>

        {/* UbuntuDJ Parallel Tab */}
        <button
          onClick={() => onSelectTab('ubuntudj')}
          className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'ubuntudj'
              ? 'text-[#00f2fe] border-b border-[#00f2fe]'
              : 'text-[#E8E6E0]/50 hover:text-[#00f2fe]'
          }`}
        >
          <span>UbuntuDJ</span>
          <span className="text-[9px] px-1 py-0.2 bg-[#00f2fe]/20 text-[#00f2fe] rounded border border-[#00f2fe]/40 font-mono-code">
            DUAL
          </span>
        </button>

        <button
          onClick={onOpenLyrics}
          className="whitespace-nowrap transition-colors py-1 cursor-pointer text-[#E8E6E0]/60 hover:text-[#E8D56B] hidden md:inline"
        >
          Lyrics
        </button>

        <button
          onClick={() => onSelectTab('proofbridge')}
          className={`whitespace-nowrap transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'proofbridge'
              ? 'text-[#6A8A4F] border-b border-[#6A8A4F]'
              : 'text-[#E8E6E0]/50 hover:text-[#E8E6E0]'
          }`}
        >
          <span>ProofBridge</span>
          <span className="hidden lg:inline">Gates</span>
        </button>

        <button
          onClick={onOpenMixer}
          className={`hidden lg:flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 border text-[10px] cursor-pointer transition-all ${
            isMixerOpen
              ? 'border-[#00f2fe]/60 text-[#00f2fe] bg-[#00f2fe]/10'
              : 'border-[#E8E6E0]/20 text-[#E8E6E0]/60 hover:border-[#E8E6E0]/50 hover:text-[#E8E6E0]'
          }`}
        >
          <span>MIXER PiP</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Quick Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenLindiwe}
          className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#C47A2A]/40 text-[10px] tracking-[0.14em] uppercase text-[#C47A2A] hover:bg-[#C47A2A]/10 transition-colors cursor-pointer"
        >
          Lindiwe
        </button>

        <button
          onClick={onOpenImport}
          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 border border-[#E8E6E0]/20 text-[10px] tracking-[0.14em] uppercase text-[#E8E6E0]/70 hover:text-[#E8E6E0] hover:border-[#E8E6E0]/40 transition-colors cursor-pointer"
        >
          Import Audio
        </button>

        <button
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F5F0E0] text-[#07090A] hover:bg-[#E8E6E0] transition-transform duration-150 active:scale-98 text-[11px] font-semibold tracking-[0.14em] uppercase cursor-pointer"
        >
          <span className="text-sm leading-none font-bold">+</span>
          <span className="hidden xs:inline">New Project</span>
        </button>
      </div>
    </header>
  );
};
