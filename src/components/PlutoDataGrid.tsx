/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { getAudioContext, playSynth, playKick } from '../services/audioEngine';

export interface PlutoGridRow {
  id: string;
  stem: string;
  type: 'Lead' | 'Drums' | 'Bass' | 'Synths' | 'Master' | 'FX';
  format: string;
  sampleRate: number;
  duration: string;
  volume: number; // 0 to 100
  pan: number; // -50 to +50
  gateStatus: 'PASS' | 'COMPUTED' | 'IN_REVIEW' | 'FLAGGED';
  gateHash: string;
  auditedBy: string;
}

const INITIAL_ROWS: PlutoGridRow[] = [
  {
    id: 'row-1',
    stem: '01_Horizonte_Master_Bus.wav',
    type: 'Master',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 85,
    pan: 0,
    gateStatus: 'PASS',
    gateHash: '0x8F3a...41D9',
    auditedBy: 'Mino Enchilotto',
  },
  {
    id: 'row-2',
    stem: '02_Horizonte_SubKick_909.wav',
    type: 'Drums',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 90,
    pan: 0,
    gateStatus: 'PASS',
    gateHash: '0x3C9b...88E2',
    auditedBy: 'ProofBridge DSP',
  },
  {
    id: 'row-3',
    stem: '03_Horizonte_Snare_Body_Clap.wav',
    type: 'Drums',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 80,
    pan: 2,
    gateStatus: 'PASS',
    gateHash: '0x99A1...7F04',
    auditedBy: 'ProofBridge DSP',
  },
  {
    id: 'row-4',
    stem: '04_Horizonte_Vocal_Lead_Tuned.wav',
    type: 'Lead',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 88,
    pan: -5,
    gateStatus: 'COMPUTED',
    gateHash: '0x7E42...12C8',
    auditedBy: 'Mihle Majokweni',
  },
  {
    id: 'row-5',
    stem: '05_Horizonte_PolySynth_SawArp.wav',
    type: 'Synths',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 75,
    pan: 14,
    gateStatus: 'PASS',
    gateHash: '0x15D3...90B1',
    auditedBy: 'Mino Enchilotto',
  },
  {
    id: 'row-6',
    stem: '06_Horizonte_Moog_Bassline.wav',
    type: 'Bass',
    format: '24-bit PCM',
    sampleRate: 48000,
    duration: '03:42',
    volume: 92,
    pan: 0,
    gateStatus: 'IN_REVIEW',
    gateHash: '0x9B10...44E0',
    auditedBy: 'VVU Foundation',
  },
];

interface PlutoDataGridProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlutoDataGrid: React.FC<PlutoDataGridProps> = ({ isOpen, onClose }) => {
  const [rows, setRows] = useState<PlutoGridRow[]>(INITIAL_ROWS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof PlutoGridRow>('stem');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const filteredAndSortedRows = useMemo(() => {
    return rows
      .filter((r) => {
        const query = searchQuery.toLowerCase();
        return (
          r.stem.toLowerCase().includes(query) ||
          r.type.toLowerCase().includes(query) ||
          r.gateStatus.toLowerCase().includes(query) ||
          r.auditedBy.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [rows, searchQuery, sortField, sortAsc]);

  if (!isOpen) return null;

  const handleSort = (field: keyof PlutoGridRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleUpdateVolume = (id: string, newVol: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, volume: Math.max(0, Math.min(100, newVol)) } : r))
    );
  };

  const handlePreviewStem = (row: PlutoGridRow) => {
    setSelectedRowId(row.id);
    const ctx = getAudioContext();
    if (row.type === 'Drums') playKick(ctx, ctx.destination);
    else if (row.type === 'Bass') playSynth(ctx, ctx.destination, 82.41, undefined, 'sawtooth');
    else playSynth(ctx, ctx.destination, 220, undefined, 'triangle');
  };

  const handleExportCSV = () => {
    const headers = ['Stem', 'Tipo', 'Formato', 'Amostragem', 'Duração', 'Volume', 'Pan', 'Gate', 'Hash', 'Auditor'];
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.stem}"`,
          r.type,
          r.format,
          r.sampleRate,
          r.duration,
          r.volume,
          r.pan,
          r.gateStatus,
          r.gateHash,
          `"${r.auditedBy}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pluto_grid_stems_horizonte.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-5xl w-full h-[85vh] flex flex-col relative shadow-2xl overflow-hidden">
        {/* Top Header & Search Bar */}
        <div className="p-4 sm:p-5 bg-[#12141d] border-b border-[#E8E6E0]/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8D56B]" />
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#E8E6E0]">
                PlutoGrid · Matriz de Stems &amp; Gates de Áudio
              </h2>
              <p className="text-[10px] text-[#E8E6E0]/50">
                Grade de dados interativa com ordenação, edição inline e auditoria ProofBridge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar stems ou gates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 bg-[#07090A] border border-[#E8E6E0]/20 px-3 py-1.5 text-xs text-[#E8E6E0] rounded-sm focus:outline-none focus:border-[#E8D56B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#E8E6E0]/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-[#E8E6E0]/10 hover:bg-[#E8E6E0]/20 text-[#E8E6E0] text-xs font-semibold tracking-wider uppercase cursor-pointer"
            >
              Exportar CSV
            </button>

            <button
              onClick={onClose}
              className="text-[#E8E6E0]/50 hover:text-white text-sm px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pluto Grid Table View */}
        <div className="flex-1 overflow-auto bg-[#07090A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#12141d] text-[#E8E6E0]/60 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-[#E8E6E0]/15 select-none">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">Prévia</th>
                <th
                  onClick={() => handleSort('stem')}
                  className="py-2.5 px-4 cursor-pointer hover:text-white"
                >
                  Nome do Stem {sortField === 'stem' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  Tipo {sortField === 'type' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  Ganho (Vol) {sortField === 'volume' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('pan')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  Pan {sortField === 'pan' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  onClick={() => handleSort('gateStatus')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  Gate {sortField === 'gateStatus' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-2.5 px-4">Gate Hash</th>
                <th className="py-2.5 px-4">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6E0]/10">
              {filteredAndSortedRows.map((row) => {
                const isSelected = selectedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#C47A2A]/15 border-l-2 border-[#C47A2A]'
                        : 'hover:bg-[#12141d]/60'
                    }`}
                  >
                    {/* Play Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewStem(row);
                        }}
                        className="w-6 h-6 rounded-full bg-[#E8E6E0]/10 hover:bg-[#E8D56B] hover:text-[#07090A] flex items-center justify-center transition-colors cursor-pointer mx-auto"
                        title="Tocar Stem"
                      >
                        ▶
                      </button>
                    </td>

                    {/* Stem Name */}
                    <td className="py-3 px-4 font-semibold text-[#E8E6E0]">
                      <div className="truncate max-w-xs">{row.stem}</div>
                      <div className="text-[10px] text-[#E8E6E0]/40 font-normal">
                        {row.format} · {row.sampleRate} Hz · {row.duration}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8E6E0]/10 text-[#E8E6E0]/80">
                        {row.type}
                      </span>
                    </td>

                    {/* Volume Slider (Interactive Cell) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={row.volume}
                          onChange={(e) => handleUpdateVolume(row.id, Number(e.target.value))}
                          className="w-16 accent-[#E8D56B]"
                        />
                        <span className="text-[11px] font-bold tabular-nums text-[#E8D56B]">
                          {row.volume}%
                        </span>
                      </div>
                    </td>

                    {/* Pan */}
                    <td className="py-3 px-3 tabular-nums text-[#E8E6E0]/70">
                      {row.pan === 0 ? 'C (0)' : row.pan > 0 ? `R${row.pan}` : `L${Math.abs(row.pan)}`}
                    </td>

                    {/* Gate Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          row.gateStatus === 'PASS'
                            ? 'bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40'
                            : row.gateStatus === 'COMPUTED'
                            ? 'bg-[#E8D56B]/20 text-[#E8D56B] border border-[#E8D56B]/40'
                            : 'bg-[#C47A2A]/20 text-[#C47A2A] border border-[#C47A2A]/40'
                        }`}
                      >
                        {row.gateStatus}
                      </span>
                    </td>

                    {/* Gate Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] text-[#00f2fe]/80">
                      {row.gateHash}
                    </td>

                    {/* Auditor */}
                    <td className="py-3 px-4 text-[#E8E6E0]/60 text-[11px]">
                      {row.auditedBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Status */}
        <div className="p-3 bg-[#12141d] border-t border-[#E8E6E0]/15 flex items-center justify-between text-[11px] text-[#E8E6E0]/50">
          <span>{filteredAndSortedRows.length} stems carregados no buffer de mixagem</span>
          <span>ProofBridge IVE Protocol v2.4 · 100% Lossless</span>
        </div>
      </div>
    </div>
  );
};
