/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BootSeal } from './components/BootSeal';
import { TopNav } from './components/TopNav';
import { PlutoMenuBar } from './components/PlutoMenuBar';
import { Tactile3DNavBar } from './components/Tactile3DNavBar';
import { DashboardView } from './components/DashboardView';
import { DawStudioView } from './components/DawStudioView';
import { ProofBridgeMetricsView } from './components/ProofBridgeMetricsView';
import { MixerOverlay } from './components/MixerOverlay';
import { ImportAudioModal } from './components/ImportAudioModal';
import { NewProjectModal } from './components/NewProjectModal';
import { LiveAudioRecorderModal } from './components/LiveAudioRecorderModal';
import { PlutoDataGrid } from './components/PlutoDataGrid';
import { LyricNotebookModal } from './components/LyricNotebookModal';
import { LindiweInductionModal } from './components/Lindiwe';
import { UbuntuDJView } from './components/UbuntuDJView';
import { exportWAVFile } from './services/audioEngine';
import { RecordedAudioTake } from './services/audioRecorder';
import { projectTracker } from './services/projectTracker';

export default function App() {
  const [bootCompleted, setBootCompleted] = useState<boolean>(false);
  const [bootKey, setBootKey] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'daw' | 'ubuntudj' | 'proofbridge'>('dashboard');
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isRecordOpen, setIsRecordOpen] = useState<boolean>(false);
  const [isPlutoGridOpen, setIsPlutoGridOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isLindiweOpen, setIsLindiweOpen] = useState<boolean>(false);
  const [projectTitle, setProjectTitle] = useState<string>('Horizonte');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReplaySeal = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setBootCompleted(false);
    setBootKey((prev) => prev + 1);
  };

  const handleCreateProject = (name: string) => {
    setProjectTitle(name);
    setCurrentTab('daw');
    projectTracker.touchProject('proj-horizonte', `Created new session: ${name}`);
    showToast(`Session "${name}" initialized with offline state tracking.`);
  };

  const handleImportAudio = (name: string) => {
    setProjectTitle(name.replace(/\.[^/.]+$/, ''));
    projectTracker.touchProject('proj-horizonte', `Imported stem: ${name}`);
    showToast(`Stem "${name}" imported to active session.`);
  };

  const handleSaveTakeAsStem = (take: RecordedAudioTake) => {
    projectTracker.touchProject('proj-horizonte', `Recorded vocal take: ${take.name}`);
    showToast(`Vocal take "${take.name}" saved to stem matrix.`);
  };

  const handleExportWavQuick = async () => {
    try {
      showToast('Rendering lossless audio in 16-bit PCM 44.1kHz...');
      const dummyChannels = [
        { name: 'KICK', pattern: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], muted: false },
        { name: 'SNARE', pattern: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], muted: false },
        { name: 'HI-HAT', pattern: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], muted: false },
        { name: 'SYNTH', pattern: [false, false, true, false, false, false, true, false, false, true, false, false, true, false, false, true], muted: false },
      ];
      const blob = await exportWAVFile(dummyChannels, 124, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluid_studio_${projectTitle.toLowerCase()}_loop.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      projectTracker.touchProject('proj-horizonte', 'Exported master WAV loop');
      showToast('Master WAV export complete! Download started.');
    } catch {
      showToast('Error exporting audio file.');
    }
  };

  // GLOBAL SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);

      // Ctrl+S / Cmd+S: Save session
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        projectTracker.touchProject('proj-horizonte', 'Manual session save triggered');
        showToast('Session saved to offline storage.');
        return;
      }

      // Ctrl+N: New project / template picker
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewProjectOpen(true);
        return;
      }

      // Ctrl+I: Import audio
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsImportOpen(true);
        return;
      }

      // Ctrl+R: Record audio
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRecordOpen(true);
        return;
      }

      // Ctrl+E: Export WAV
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportWavQuick();
        return;
      }

      // Ctrl+L or L (when not typing): Lyric Notebook
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') || (!isInput && e.key.toLowerCase() === 'l')) {
        e.preventDefault();
        setIsLyricsOpen((prev) => !prev);
        return;
      }

      // D (when not typing): Toggle UbuntuDJ Parallel
      if (!isInput && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setCurrentTab((prev) => (prev === 'ubuntudj' ? 'dashboard' : 'ubuntudj'));
        return;
      }

      // M (when not typing): Toggle Mixer
      if (!isInput && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMixerOpen((prev) => !prev);
        return;
      }

      // G (when not typing): Toggle Pluto Grid
      if (!isInput && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsPlutoGridOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectTitle]);

  return (
    <div className="min-h-screen bg-[#07090A] text-[#E8E6E0] flex flex-col font-mono-code antialiased pb-20 sm:pb-24">
      {/* 1. Borromean 3-Ring Seal Boot Animation */}
      {!bootCompleted && (
        <BootSeal
          key={bootKey}
          onComplete={() => setBootCompleted(true)}
          isReplaying={bootKey > 1}
        />
      )}

      {/* 2. Top Navigation Bar */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenMixer={() => setIsMixerOpen((prev) => !prev)}
        isMixerOpen={isMixerOpen}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        onOpenLindiwe={() => setIsLindiweOpen(true)}
      />

      {/* 3. Pluto Menu Bar (Studio Desktop Menu) */}
      <div className="pt-14">
        <PlutoMenuBar
          onNewProject={() => setIsNewProjectOpen(true)}
          onImportAudio={() => setIsImportOpen(true)}
          onRecordAudio={() => setIsRecordOpen(true)}
          onExportWav={handleExportWavQuick}
          onToggleMixer={() => setIsMixerOpen((prev) => !prev)}
          onOpenDataGrid={() => setIsPlutoGridOpen(true)}
          onOpenProofBridge={() => setCurrentTab('proofbridge')}
          onOpenLyrics={() => setIsLyricsOpen(true)}
          onOpenLindiwe={() => setIsLindiweOpen(true)}
          onReplaySeal={handleReplaySeal}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#12141d] border border-[#E8D56B]/60 px-4 py-2 text-xs font-mono text-[#E8D56B] shadow-2xl rounded-sm flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#E8D56B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Main Workspace Views */}
      <div className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenDaw={() => setCurrentTab('daw')}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenLyrics={() => setIsLyricsOpen(true)}
            onSelectProofBridge={() => setCurrentTab('proofbridge')}
            onOpenLindiwe={() => setIsLindiweOpen(true)}
            onOpenUbuntuDj={() => setCurrentTab('ubuntudj')}
          />
        )}

        {currentTab === 'daw' && (
          <DawStudioView
            onOpenMixer={() => setIsMixerOpen(true)}
            onSelectDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'ubuntudj' && (
          <UbuntuDJView
            onOpenDaw={() => setCurrentTab('daw')}
            onOpenMixer={() => setIsMixerOpen(true)}
            onSendTrackToSession={handleImportAudio}
          />
        )}

        {currentTab === 'proofbridge' && (
          <ProofBridgeMetricsView />
        )}
      </div>

      {/* 5. 3D Bottom Navigation Bar */}
      <Tactile3DNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenMixer={() => setIsMixerOpen((prev) => !prev)}
        isMixerOpen={isMixerOpen}
        onOpenRecord={() => setIsRecordOpen(true)}
        onOpenPlutoGrid={() => setIsPlutoGridOpen(true)}
        onOpenLyrics={() => setIsLyricsOpen(true)}
      />

      {/* 6. Floating Detachable Mixer PiP Overlay with Real Oscilloscope */}
      <MixerOverlay
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
      />

      {/* 7. Feature-Packed Live Microphone Audio Recorder Modal */}
      <LiveAudioRecorderModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onSaveTakeAsStem={handleSaveTakeAsStem}
      />

      {/* 8. PlutoGrid Data Grid Modal */}
      <PlutoDataGrid
        isOpen={isPlutoGridOpen}
        onClose={() => setIsPlutoGridOpen(false)}
      />

      {/* 9. Lyric Notebook & Rhyme Studio (TXT upload, Image OCR, Voice Dictation) */}
      <LyricNotebookModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        projectTitle={projectTitle}
      />

      {/* 10. Lindiwe Induction Modal (VVU Foundation Integration Package) */}
      <LindiweInductionModal
        open={isLindiweOpen}
        onClose={() => setIsLindiweOpen(false)}
        onComplete={() => {
          showToast('Lindiwe Induction attestation completed and signed.');
        }}
      />

      {/* 11. Audio Import & Project Creation Modals */}
      <ImportAudioModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportAudio}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* 12. Footer */}
      {currentTab !== 'daw' && currentTab !== 'ubuntudj' && (
        <footer className="border-t border-[#E8E6E0]/10 px-5 sm:px-10 py-10 max-w-[960px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-5 text-[11px] tracking-[0.14em] text-[#E8E6E0]/40 uppercase">
          {/* Brand with canonical Borromean mini logo */}
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 60 60">
              <circle cx="23" cy="34" r="11" fill="none" stroke="#6A8A4F" strokeWidth="3" strokeLinecap="round" />
              <circle cx="37" cy="34" r="11" fill="none" stroke="#E8D56B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="26" r="11" fill="none" stroke="#C47A2A" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="31" r="2.2" fill="#F5F0E0" />
            </svg>
            <span className="text-[#E8E6E0]/70 font-semibold">Fluid Studio · Bench</span>
          </div>

          {/* Sync Status in English */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6A8A4F] shadow-[0_0_8px_#6A8A4F]" />
            <span>Securely synced · Last backup 4 min ago</span>
          </div>

          {/* Replay boot sequence */}
          <button
            onClick={handleReplaySeal}
            className="text-[10px] tracking-[0.18em] text-[#E8E6E0]/40 hover:text-[#E8E6E0] uppercase cursor-pointer px-2 py-1 transition-colors"
          >
            ↻ Replay seal
          </button>
        </footer>
      )}
    </div>
  );
}
