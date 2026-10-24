/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MilestoneMetric, TeamMetric } from '../types/audio';

const TEAM_METRICS: TeamMetric[] = [
  {
    metric: 'Verified Gate Pass Rate',
    value: '98.4%',
    subtext: '49 of 50 acoustic gates passed',
    trend: 'up',
    change: '+3.2%',
  },
  {
    metric: 'Cycle Time per Stem',
    value: '4.2h',
    subtext: 'Average IVE verification latency',
    trend: 'down',
    change: '-18%',
  },
  {
    metric: 'DSP Buffer Invariant',
    value: '0.12ms',
    subtext: 'Zero audio dropout / 48kHz',
    trend: 'stable',
    change: '0.0ms',
  },
  {
    metric: 'VVU Trust Rating',
    value: '99.8/100',
    subtext: 'D-SME Level 1 Certified',
    trend: 'up',
    change: '+0.4',
  },
];

const INITIAL_MILESTONES: MilestoneMetric[] = [
  {
    id: 'm-01',
    title: '24-bit Lossless Stem Ingestion & Sanitization',
    category: 'Pre-Production',
    assignee: 'Mino Enchilotto',
    status: 'VERIFIED',
    cycle: 'Cycle 2026.10-A',
    gateHash: '0x8F3a...41D9',
    completionDate: '23 Oct 2026 14:20',
    score: 100,
  },
  {
    id: 'm-02',
    title: 'Phase Correlation & Crest Factor Invariants',
    category: 'DSP Engineering',
    assignee: 'ProofBridge Engine',
    status: 'VERIFIED',
    cycle: 'Cycle 2026.10-A',
    gateHash: '0x3C9b...88E2',
    completionDate: '23 Oct 2026 16:45',
    score: 98,
  },
  {
    id: 'm-03',
    title: 'Vocal Harmonic Pitch & Spectral Coherence',
    category: 'Vocal Comping',
    assignee: 'VVU Vocal Lab',
    status: 'VERIFIED',
    cycle: 'Cycle 2026.10-B',
    gateHash: '0x99A1...7F04',
    completionDate: '23 Oct 2026 17:30',
    score: 96,
  },
  {
    id: 'm-04',
    title: 'Multiband Dynamics & Stereo Field Balance',
    category: 'Mixdown',
    assignee: 'Mino Enchilotto',
    status: 'COMPUTED',
    cycle: 'Cycle 2026.10-B',
    gateHash: '0x7E42...12C8',
    completionDate: '23 Oct 2026 18:50',
    score: 88,
  },
  {
    id: 'm-05',
    title: 'True-Peak Limiter Audit & -14 LUFS Target',
    category: 'Mastering',
    assignee: 'Divhani Majokweni',
    status: 'IN_REVIEW',
    cycle: 'Cycle 2026.10-C',
    gateHash: '0x15D3...90B1',
    completionDate: 'In Validation',
    score: 72,
  },
  {
    id: 'm-06',
    title: 'Cryptographic Attestation & Delivery Gate',
    category: 'Governance',
    assignee: 'VVU Foundation',
    status: 'FLAGGED',
    cycle: 'Cycle 2026.10-C',
    gateHash: '0x0000...PEND',
    completionDate: 'Awaiting Master Pass',
    score: 0,
  },
];

export const ProofBridgeMetricsView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const filteredMilestones = INITIAL_MILESTONES.filter(
    (m) => filterCategory === 'all' || m.category === filterCategory
  );

  const handleCopyReport = () => {
    const reportText = `=====================================================
PROOFBRIDGE VERIFIABLE FLOW RECORD — EXECUTIVE REPORT
VVU Foundation · Venture Vision Ubuntu Architecture
Authority: Mihle "Divhani" Majokweni (Founder & CEO)
Date: 23 October 2026 · Reg: 2026-2026-03
=====================================================
PROJECT: Horizonte (Mino Enchilotto)
STATUS: Active Tuning & Mixdown Production
QUALITY GATES PASS RATE: 98.4%
DSP INVARIANT LATENCY: 0.12ms (Zero Dropout)
STANDARDS: ITU-R BS.1770-4 / EBU R128 (-14 LUFS target)
ACCREDITATION: D-SME Level 1 (108 Recognition)

VERIFIED MILESTONES & AUDIT LOG:
1. Lossless Stem Ingestion: VERIFIED [0x8F3a...41D9]
2. Phase Correlation & Crest Factor: VERIFIED [0x3C9b...88E2]
3. Vocal Harmonic Alignment: VERIFIED [0x99A1...7F04]
4. Multiband Dynamics: COMPUTED [0x7E42...12C8]
5. True-Peak -14 LUFS Limiting: IN REVIEW [0x15D3...90B1]

SECURITY SIGNATURE:
ProofBridge IVE Hash: 0x9a8f23c4d51b789e001878aa4556c
"I am because we are — trust through transparent cycles."
=====================================================`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-10 pt-28 pb-20 font-mono-code text-[#E8E6E0]">
      {/* ProofBridge Header */}
      <div className="mb-10 pb-6 border-b border-[#E8E6E0]/15">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs tracking-widest text-[#6A8A4F] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#6A8A4F] shadow-[0_0_8px_#6A8A4F]" />
            <span>ProofBridge Infrastructure · Verification Study Portal</span>
          </div>
          <div className="text-[10px] text-[#E8E6E0]/40 tracking-wider">
            Reg 2026-2026-03 · D-SME Level 1 · 108 Recognition
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-[#E8E6E0]">
              Performance Metrics &amp; Verified Milestones
            </h1>
            <p className="text-xs text-[#E8E6E0]/60 mt-1 max-w-2xl font-sans">
              Continuous acoustic lifecycle oversight, mathematical DSP invariant validation, and automated stakeholder reports for VVU Foundation governance.
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6A8A4F] text-[#07090A] hover:bg-[#6A8A4F]/90 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-[#6A8A4F]/10 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Generate Stakeholder Report</span>
          </button>
        </div>

        {/* Institution Info Card */}
        <div className="mt-6 p-4 bg-[#0B0F12] border border-[#E8E6E0]/10 rounded-sm flex flex-wrap items-center justify-between gap-4 text-xs text-[#E8E6E0]/70">
          <div>
            <span className="text-[#E8D56B] font-bold">Mihle "Divhani" Majokweni</span> · Founder &amp; CEO | VVU Foundation
          </div>
          <div className="text-[11px] text-[#E8E6E0]/50">
            Venue: VVU Space Deust → ProofBridge IVE · <span className="text-[#E8E6E0]/80">divh@venturevisionubuntu.co.za</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {TEAM_METRICS.map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 bg-[#0B0F12] border border-[#E8E6E0]/15 relative overflow-hidden"
          >
            <div className="text-[10px] tracking-wider uppercase text-[#E8E6E0]/50 mb-2">
              {kpi.metric}
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display font-bold text-3xl text-[#E8E6E0] tracking-tight">
                {kpi.value}
              </span>
              <span
                className={`text-xs font-semibold ${
                  kpi.trend === 'up'
                    ? 'text-[#6A8A4F]'
                    : kpi.trend === 'down'
                    ? 'text-[#E8D56B]'
                    : 'text-[#E8E6E0]/50'
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="text-[10px] text-[#E8E6E0]/40">{kpi.subtext}</div>
          </div>
        ))}
      </div>

      {/* Real-time Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Visualizer 1: Gates Completion Spectrum */}
        <div className="lg:col-span-2 p-6 bg-[#0B0F12] border border-[#E8E6E0]/15">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-xl text-[#E8E6E0]">
                Acoustic Invariant Spectrum &amp; Quality Gates
              </h3>
              <p className="text-xs text-[#E8E6E0]/50 font-sans mt-0.5">
                Computed verification states across multitrack engineering stages
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 font-mono">
              SYSTEM ONLINE
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-[#E8E6E0]/70">Gate 01 · Lossless Audio Ingestion &amp; Headroom</span>
                <span className="text-[#6A8A4F] font-bold">100% · PASS</span>
              </div>
              <div className="h-2 bg-[#07090A] border border-[#E8E6E0]/10 overflow-hidden">
                <div className="h-full bg-[#6A8A4F] w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-[#E8E6E0]/70">Gate 02 · Multichannel Phase Correlation</span>
                <span className="text-[#6A8A4F] font-bold">98% · PASS</span>
              </div>
              <div className="h-2 bg-[#07090A] border border-[#E8E6E0]/10 overflow-hidden">
                <div className="h-full bg-[#6A8A4F] w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-[#E8E6E0]/70">Gate 03 · Harmonic Formants &amp; Vocal Alignment</span>
                <span className="text-[#C47A2A] font-bold">96% · PASS</span>
              </div>
              <div className="h-2 bg-[#07090A] border border-[#E8E6E0]/10 overflow-hidden">
                <div className="h-full bg-[#C47A2A] w-[96%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-[#E8E6E0]/70">Gate 04 · Dynamic Range &amp; Stereo Width</span>
                <span className="text-[#E8D56B] font-bold">88% · COMPUTED</span>
              </div>
              <div className="h-2 bg-[#07090A] border border-[#E8E6E0]/10 overflow-hidden">
                <div className="h-full bg-[#E8D56B] w-[88%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="text-[#E8E6E0]/70">Gate 05 · True-Peak Limiter Target (-14 LUFS)</span>
                <span className="text-[#f43f5e] font-bold">72% · IN REVIEW</span>
              </div>
              <div className="h-2 bg-[#07090A] border border-[#E8E6E0]/10 overflow-hidden">
                <div className="h-full bg-[#f43f5e] w-[72%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer 2: Ubuntu Philosophy & Architecture */}
        <div className="p-6 bg-[#0B0F12] border border-[#E8E6E0]/15 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-[#E8E6E0] mb-2">
              Ubuntu Architecture
            </h3>
            <p className="text-xs text-[#E8E6E0]/50 font-sans mb-4 leading-relaxed">
              "I am because we are — trust through transparent cycles of sonic verification."
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-[#07090A] border border-[#E8E6E0]/10">
                <div className="text-[9px] text-[#E8E6E0]/40">COMPUTED GATES</div>
                <div className="text-sm font-bold text-[#E8D56B]">4 Active · 1 In Review</div>
              </div>

              <div className="p-2.5 bg-[#07090A] border border-[#E8E6E0]/10">
                <div className="text-[9px] text-[#E8E6E0]/40">BLOCK ATTESTATION HASH</div>
                <div className="text-[11px] font-mono text-[#6A8A4F]">0x9A8F...23C4</div>
              </div>

              <div className="p-2.5 bg-[#07090A] border border-[#E8E6E0]/10">
                <div className="text-[9px] text-[#E8E6E0]/40">ACCREDITED STANDARD</div>
                <div className="text-xs font-semibold text-[#E8E6E0]">Level 1 D-SME 108</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#E8E6E0]/30 pt-4 border-t border-[#E8E6E0]/10">
            Last telemetry sync: 2 min ago · 2026/2026
          </div>
        </div>
      </div>

      {/* Verifiable Flow Records Table */}
      <div className="border border-[#E8E6E0]/15 bg-[#0B0F12]">
        <div className="p-5 border-b border-[#E8E6E0]/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-2xl text-[#E8E6E0]">
              Verifiable Flow Records Ledger
            </h3>
            <p className="text-xs text-[#E8E6E0]/50 font-sans mt-0.5">
              Cryptographically traceable audit log for all musical engineering gates
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#07090A] border border-[#E8E6E0]/10 rounded text-[10px]">
            {['all', 'Pre-Production', 'DSP Engineering', 'Vocal Comping', 'Mixdown', 'Mastering'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#E8D56B] text-[#07090A] font-bold'
                      : 'text-[#E8E6E0]/50 hover:text-[#E8E6E0]'
                  }`}
                >
                  {cat === 'all' ? 'ALL' : cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07090A]/60 text-[#E8E6E0]/40 uppercase text-[9px] tracking-wider border-b border-[#E8E6E0]/10">
              <tr>
                <th className="py-3 px-5">Milestone / Gate</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Gate Hash</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6E0]/10">
              {filteredMilestones.map((m) => (
                <tr key={m.id} className="hover:bg-[#E8E6E0]/[0.02] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#E8E6E0]">{m.title}</div>
                    <div className="text-[10px] text-[#E8E6E0]/40">{m.category} · {m.completionDate}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#E8E6E0]/80">{m.assignee}</td>
                  <td className="py-3.5 px-4 text-[#E8E6E0]/60 font-mono text-[11px]">{m.cycle}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#E8D56B]">{m.gateHash}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${
                        m.status === 'VERIFIED'
                          ? 'bg-[#6A8A4F]/20 text-[#6A8A4F] border-[#6A8A4F]/40'
                          : m.status === 'COMPUTED'
                          ? 'bg-[#E8D56B]/20 text-[#E8D56B] border-[#E8D56B]/40'
                          : m.status === 'IN_REVIEW'
                          ? 'bg-[#C47A2A]/20 text-[#C47A2A] border-[#C47A2A]/40'
                          : 'bg-[#f43f5e]/20 text-[#f43f5e] border-[#f43f5e]/40'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#E8E6E0] tabular-nums">
                    {m.score}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stakeholder Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0B0F12] border border-[#6A8A4F]/40 max-w-2xl w-full p-6 sm:p-8 text-left relative shadow-2xl rounded-none">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#E8E6E0]/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6A8A4F]" />
                <span className="font-display text-2xl font-bold text-[#E8E6E0]">
                  Automated Stakeholder Report
                </span>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-[#E8E6E0]/50 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#07090A] p-4 border border-[#E8E6E0]/10 rounded mb-6 text-xs text-[#E8E6E0]/80 font-mono space-y-2 max-h-80 overflow-y-auto leading-relaxed">
              <div className="text-[#6A8A4F] font-bold">
                PROOFBRIDGE IVE · VERIFIED MILESTONE CERTIFICATE
              </div>
              <div>VVU Foundation &amp; Venture Vision Ubuntu · Reg 2026-2026-03</div>
              <div>Authority: Mihle "Divhani" Majokweni (Founder &amp; CEO)</div>
              <div className="text-[#E8E6E0]/40">──────────────────────────────────────────────</div>
              <div>PROJECT: "Horizonte" Album — Mino Enchilotto</div>
              <div>ACOUSTIC GATES AUDITED: 6 analyzed, 4 verified, 1 computed, 1 in review</div>
              <div>DSP RELIABILITY: 98.4% (Invariant latency 0.12ms)</div>
              <div>COMPLIANCE: ITU-R BS.1770-4 / EBU R128 (-14 LUFS)</div>
              <div className="text-[#E8D56B]">
                BLOCK ATTESTATION HASH: 0x9A8F23C4D51B789E001878AA4556C
              </div>
              <div className="text-[#E8E6E0]/60 italic">
                "I am because we are — trust through transparent cycles."
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#E8E6E0]/50">
                {copiedReport ? '✓ Copied to clipboard!' : 'Ready for executive distribution'}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={handleCopyReport}
                  className="px-4 py-2 bg-[#6A8A4F] text-[#07090A] font-bold text-xs cursor-pointer hover:bg-[#6A8A4F]/90 transition-all uppercase"
                >
                  {copiedReport ? 'Copied!' : 'Copy Report'}
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-[#E8E6E0]/20 text-xs text-[#E8E6E0]/70 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
