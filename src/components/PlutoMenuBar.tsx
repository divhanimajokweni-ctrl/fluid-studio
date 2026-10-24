/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';

interface PlutoMenuBarProps {
  onNewProject: () => void;
  onImportAudio: () => void;
  onRecordAudio: () => void;
  onExportWav: () => void;
  onToggleMixer: () => void;
  onOpenDataGrid: () => void;
  onOpenProofBridge: () => void;
  onOpenLyrics: () => void;
  onOpenLindiwe: () => void;
  onReplaySeal: () => void;
  onSelectTab: (tab: 'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge') => void;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
  divider?: boolean;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export const PlutoMenuBar: React.FC<PlutoMenuBarProps> = ({
  onNewProject,
  onImportAudio,
  onRecordAudio,
  onExportWav,
  onToggleMixer,
  onOpenDataGrid,
  onOpenProofBridge,
  onOpenLyrics,
  onOpenLindiwe,
  onReplaySeal,
  onSelectTab,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus: MenuCategory[] = [
    {
      title: 'File',
      items: [
        { label: 'New Project / Templates...', shortcut: 'Ctrl+N', action: onNewProject },
        { label: 'Import Audio Stem...', shortcut: 'Ctrl+I', action: onImportAudio },
        { label: 'Record Vocal / Mic Take...', shortcut: 'Ctrl+R', action: onRecordAudio },
        { label: 'Export Master WAV (16-bit)...', shortcut: 'Ctrl+E', action: onExportWav, divider: true },
        { label: 'Lindiwe Induction Package...', action: onOpenLindiwe },
        { label: 'Executive Stakeholder Report...', action: onOpenProofBridge },
      ],
    },
    {
      title: 'Edit',
      items: [
        { label: 'Quantize Grid (1/16)', shortcut: 'Q', action: () => onSelectTab('daw') },
        { label: 'Toggle Transport Play/Stop', shortcut: 'Space', action: () => onSelectTab('daw') },
        { label: 'Reorder Channel Strips', action: () => onSelectTab('daw'), divider: true },
        { label: 'Inspect Stem Invariants', action: onOpenProofBridge },
      ],
    },
    {
      title: 'Audio & DSP',
      items: [
        { label: 'UbuntuDJ Parallel Console', shortcut: 'D', action: () => onSelectTab('ubuntudj') },
        { label: 'Oscilloscope & Mixer PiP', shortcut: 'M', action: onToggleMixer },
        { label: 'Multichannel Mic Recording', shortcut: 'Ctrl+R', action: onRecordAudio },
        { label: 'True Peak Loudness (-14 LUFS)', action: onOpenProofBridge, divider: true },
        { label: 'Sample Rate: 48 kHz / 24-bit Lossless', action: () => {} },
      ],
    },
    {
      title: 'View',
      items: [
        { label: 'Session Overview', action: () => onSelectTab('dashboard') },
        { label: 'Beat Lab & 16-Step Sequencer', action: () => onSelectTab('daw') },
        { label: 'UbuntuDJ Parallel Deck', shortcut: 'D', action: () => onSelectTab('ubuntudj') },
        { label: 'Lyrical Library & Dictation', shortcut: 'L', action: onOpenLyrics },
        { label: 'Stems Data Table (PlutoGrid)', shortcut: 'G', action: onOpenDataGrid },
        { label: 'ProofBridge Metrics & Gates', action: () => onSelectTab('proofbridge'), divider: true },
        { label: 'Replay Borromean Seal', action: onReplaySeal },
      ],
    },
    {
      title: 'Lindiwe & VVU',
      items: [
        { label: 'Launch Lindiwe Induction Modal', action: onOpenLindiwe },
        { label: 'Audit ProofBridge Quality Gates', action: onOpenProofBridge },
        { label: 'IVE Cryptographic Block Attestation', action: onOpenProofBridge, divider: true },
        { label: 'VVU Foundation Architecture', action: () => window.open('https://venturevisionubuntu.co.za', '_blank') },
      ],
    },
  ];

  return (
    <div
      ref={barRef}
      className="hidden md:flex items-center h-7 px-4 bg-[#0B0F12] border-b border-[#E8E6E0]/10 text-[11px] font-mono-code text-[#E8E6E0]/70 select-none z-30"
    >
      <div className="flex items-center gap-1">
        {menus.map((menu) => {
          const isOpen = activeMenu === menu.title;
          return (
            <div key={menu.title} className="relative">
              <button
                onClick={() => setActiveMenu(isOpen ? null : menu.title)}
                onMouseEnter={() => {
                  if (activeMenu) setActiveMenu(menu.title);
                }}
                className={`px-2.5 py-1 rounded-sm cursor-pointer transition-colors ${
                  isOpen
                    ? 'bg-[#1a1d2b] text-[#E8D56B]'
                    : 'hover:bg-[#12141d] hover:text-[#E8E6E0]'
                }`}
              >
                {menu.title}
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-0.5 w-64 bg-[#12141d] border border-[#E8E6E0]/20 shadow-2xl py-1 z-50 rounded-none">
                  {menu.items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => {
                          item.action();
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#C47A2A]/20 hover:text-[#E8E6E0] text-[11px] cursor-pointer transition-colors"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[9px] text-[#E8E6E0]/40 font-mono tracking-wider ml-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                      {item.divider && <div className="h-[1px] bg-[#E8E6E0]/10 my-1" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-4 text-[10px] text-[#E8E6E0]/40">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6A8A4F]" />
          48 kHz · 24-bit Lossless
        </span>
        <span>DSP LATENCY: 0.12ms</span>
      </div>
    </div>
  );
};
