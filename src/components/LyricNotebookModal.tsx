/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { projectTracker } from '../services/projectTracker';
import { performOcrOnImage, OcrResult } from '../services/ocrService';

interface LyricNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export const LyricNotebookModal: React.FC<LyricNotebookModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
}) => {
  const [lyricsText, setLyricsText] = useState<string>(() => {
    return (
      localStorage.getItem(`fluid_lyrics_${projectTitle}`) ||
`[Intro - 00:00]
(Ochre reverb fades in, sub bass hum)
Yeah, check the monitors. Mino in the booth.
From the Cape flats to Johannesburg nights.

[Verse 1 - 00:15]
I carved the rhythm out of static in the cold room,
Trust in the cycle, watching midnight bloom.
Proof in the waveform, no shims in the gate,
Computed invariants balance the weight.
Every frequency mapped, every truth verified,
We built the infrastructure, nothing denied.

[Chorus - 00:48]
Horizonte on the glass, golden hour glow,
I am because we are, let the river flow.
Three rings locked, Borromean seal,
Hold the sacred frequency, make the cipher real.

[Verse 2 - 01:20]
Phase alignment crisp, true peak never clipping,
While they chasing noise, we the ones who equipping.
VVU architecture, legacy in the code,
Carrying the sound down the unbroken road.`
    );
  });

  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);
  const [activeImageFile, setActiveImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isTranscribingImage, setIsTranscribingImage] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStage, setOcrStage] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrEditableText, setOcrEditableText] = useState<string>('');

  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'image' | 'analysis'>('editor');
  const [rhymeScheme, setRhymeScheme] = useState<string>('AABB');
  const [saveStatus, setSaveStatus] = useState<string>('Saved to session');
  const [txtImportMode, setTxtImportMode] = useState<'replace' | 'append'>('append');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const txtInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(`fluid_lyrics_${projectTitle}`, lyricsText);
    setSaveStatus('All changes saved');
  }, [lyricsText, projectTitle]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimSpeech(interim);

        if (finalChunk) {
          setLyricsText((prev) => prev + '\n' + finalChunk.trim());
          setInterimSpeech('');
          projectTracker.touchProject('proj-horizonte', 'Voice dictated new lyrics');
        }
      };

      recognition.onerror = () => {
        setIsDictating(false);
        setInterimSpeech('');
      };

      recognition.onend = () => {
        setIsDictating(false);
        setInterimSpeech('');
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  const toggleDictation = () => {
    if (!recognitionRef.current) return;

    if (isDictating) {
      recognitionRef.current.stop();
      setIsDictating(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsDictating(true);
      } catch (err) {
        console.warn('Speech recognition start error', err);
      }
    }
  };

  // Process and display uploaded TXT file
  const processTxtFile = async (file: File) => {
    try {
      const content = await file.text();
      if (!content) return;

      if (txtImportMode === 'replace') {
        setLyricsText(content);
        setSaveStatus(`Replaced notebook with ${file.name}`);
      } else {
        setLyricsText((prev) => {
          const separator = prev.trim() ? '\n\n' : '';
          return `${prev}${separator}[Imported: ${file.name}]\n${content}`;
        });
        setSaveStatus(`Appended ${file.name} to notebook`);
      }

      projectTracker.touchProject('proj-horizonte', `Imported lyric file: ${file.name}`);
      setActiveTab('editor');

      // Focus editor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
          textareaRef.current.focus();
        }
      }, 100);
    } catch (err) {
      console.error('Failed to read text file', err);
      setSaveStatus('Error reading text file');
    }
  };

  // Upload TXT handler
  const handleTxtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processTxtFile(file);
    }
    // reset input value so re-uploading same file works
    e.target.value = '';
  };

  // Process and preview uploaded Image file
  const processImageFile = (file: File) => {
    setActiveImageFile(file);
    setImageFileName(file.name);
    setOcrResult(null);
    setOcrEditableText('');
    setOcrProgress(0);
    setOcrStage('');

    const url = URL.createObjectURL(file);
    setActiveImagePreview(url);
    setActiveTab('image');
  };

  // Upload Image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  // Drag and Drop files over modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      processImageFile(file);
    } else if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.lrc')
    ) {
      processTxtFile(file);
    }
  };

  // Run OCR Placeholder Service on the active image
  const handleRunOcr = async () => {
    if (!activeImageFile) return;

    setIsTranscribingImage(true);
    setOcrProgress(5);
    setOcrStage('Initializing neural OCR engine...');

    try {
      const result = await performOcrOnImage(activeImageFile, (progress, stage) => {
        setOcrProgress(progress);
        setOcrStage(stage);
      });

      setOcrResult(result);
      setOcrEditableText(result.text);
      setSaveStatus(`OCR scan completed (${result.confidence}% confidence)`);
    } catch (err) {
      console.error('OCR error', err);
      setOcrStage('OCR failed. Please try again.');
    } finally {
      setIsTranscribingImage(false);
    }
  };

  // Insert extracted OCR text into the notebook editor
  const handleInsertOcrText = (mode: 'append' | 'replace') => {
    if (!ocrEditableText.trim()) return;

    if (mode === 'replace') {
      setLyricsText(ocrEditableText);
      setSaveStatus('Notebook replaced with OCR text');
    } else {
      setLyricsText((prev) => {
        const separator = prev.trim() ? '\n\n' : '';
        return `${prev}${separator}${ocrEditableText}`;
      });
      setSaveStatus('OCR lyrics appended to notebook');
    }

    projectTracker.touchProject('proj-horizonte', 'Inserted OCR extracted lyrics into notebook');
    setActiveTab('editor');

    // Auto focus editor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Download Lyrics as .txt file
  const handleExportTxt = () => {
    const blob = new Blob([lyricsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_lyrics.txt`;
    a.click();
    URL.revokeObjectURL(url);
    projectTracker.touchProject('proj-horizonte', 'Exported lyric document (.txt)');
  };

  // Simple statistics
  const lines = lyricsText.split('\n').filter((l) => l.trim().length > 0);
  const wordCount = lyricsText.split(/\s+/).filter(Boolean).length;
  const verseMarkers = lines.filter((l) => l.startsWith('[')).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay notice */}
      {isDraggingFile && (
        <div className="absolute inset-4 z-50 bg-[#07090A]/95 border-2 border-dashed border-[#E8D56B] rounded-2xl flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl mb-3">📂</span>
          <p className="text-lg font-bold text-[#E8D56B]">Drop File to Import</p>
          <p className="text-xs text-[#E8E6E0]/60 mt-1">
            Drop .TXT for direct text editor import &middot; Drop Image for OCR handwriting scanner
          </p>
        </div>
      )}

      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-5xl w-full h-[88vh] flex flex-col relative shadow-2xl overflow-hidden rounded-none">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#12141d] border-b border-[#E8E6E0]/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8D56B]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#E8E6E0]">
                  Lyric Notebook &amp; Rhyme Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-[#C47A2A]/20 text-[#C47A2A] border border-[#C47A2A]/40 font-mono uppercase">
                  {projectTitle}
                </span>
              </div>
              <p className="text-[10px] text-[#E8E6E0]/50 font-sans">
                Multi-modal songwriter notebook with direct TXT file reader, handwritten image OCR scanner, and live voice dictation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6A8A4F] hidden sm:inline mr-2">{saveStatus}</span>
            <button
              onClick={handleExportTxt}
              className="px-3 py-1.5 bg-[#E8E6E0]/10 hover:bg-[#E8E6E0]/20 text-[#E8E6E0] text-xs font-semibold tracking-wider uppercase cursor-pointer"
            >
              Export .TXT
            </button>
            <button
              onClick={onClose}
              className="text-[#E8E6E0]/50 hover:text-white text-sm px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar & Input Actions */}
        <div className="px-4 py-2.5 bg-[#07090A] border-b border-[#E8E6E0]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[#E8D56B] text-[#07090A]'
                  : 'text-[#E8E6E0]/60 hover:text-[#E8E6E0]'
              }`}
            >
              Notebook Editor
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors ${
                activeTab === 'image'
                  ? 'bg-[#E8D56B] text-[#07090A]'
                  : 'text-[#E8E6E0]/60 hover:text-[#E8E6E0]'
              }`}
            >
              <span>Image OCR Scanner</span>
              {activeImagePreview && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6A8A4F]" />
              )}
            </button>
          </div>

          {/* Upload & Dictation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* TXT Import Mode Toggle (Append vs Replace) */}
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#E8E6E0]/50 bg-[#121622] px-2 py-1 rounded border border-[#E8E6E0]/10">
              <span>TXT Mode:</span>
              <button
                onClick={() => setTxtImportMode('append')}
                className={`px-1.5 py-0.5 rounded ${
                  txtImportMode === 'append' ? 'bg-[#00f2fe]/20 text-[#00f2fe] font-bold' : 'text-[#E8E6E0]/40'
                }`}
              >
                Append
              </button>
              <button
                onClick={() => setTxtImportMode('replace')}
                className={`px-1.5 py-0.5 rounded ${
                  txtImportMode === 'replace' ? 'bg-[#f43f5e]/20 text-[#f43f5e] font-bold' : 'text-[#E8E6E0]/40'
                }`}
              >
                Replace
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={txtInputRef}
              type="file"
              accept=".txt,.md,.lrc,text/plain"
              onChange={handleTxtUpload}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Upload TXT */}
            <button
              onClick={() => txtInputRef.current?.click()}
              className="px-2.5 py-1 bg-[#1a1f30] hover:bg-[#252c44] border border-[#00f2fe]/40 text-[#00f2fe] text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 rounded transition-colors"
              title="Upload TXT file to read and display in editor"
            >
              <span>📄</span>
              <span>Upload TXT</span>
            </button>

            {/* Upload Image */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="px-2.5 py-1 bg-[#1a1f30] hover:bg-[#252c44] border border-[#E8D56B]/40 text-[#E8D56B] text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 rounded transition-colors"
              title="Upload photo of handwritten lyrics or studio note for OCR"
            >
              <span>📷</span>
              <span>Upload Image (OCR)</span>
            </button>

            {/* Voice Dictation (Speech-to-Text) */}
            <button
              onClick={toggleDictation}
              disabled={!speechSupported}
              className={`px-3 py-1 rounded text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center gap-1.5 transition-all ${
                isDictating
                  ? 'bg-[#f43f5e] text-white animate-pulse shadow-[0_0_12px_#f43f5e]'
                  : 'bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 hover:bg-[#6A8A4F]/30'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Speak or freestyle into microphone to transcribe lyrics"
            >
              <span className={`w-2 h-2 rounded-full ${isDictating ? 'bg-white' : 'bg-[#6A8A4F]'}`} />
              <span>{isDictating ? 'Listening...' : 'Voice Dictation'}</span>
            </button>
          </div>
        </div>

        {/* Live Interim Speech Toast */}
        {isDictating && interimSpeech && (
          <div className="px-4 py-2 bg-[#f43f5e]/15 border-b border-[#f43f5e]/30 text-xs text-[#f43f5e] flex items-center gap-2">
            <span className="animate-spin">🎙</span>
            <span className="italic">"{interimSpeech}"</span>
          </div>
        )}

        {/* Modal Main Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#07090A]">
          {/* Main Editor View */}
          <div
            className={`flex-1 flex flex-col p-4 overflow-hidden ${
              activeTab === 'image' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              placeholder="Type verses, hooks, bridge, rhyme schemes, or upload a TXT file / scan image..."
              className="flex-1 w-full bg-[#0B0F12] border border-[#E8E6E0]/15 p-4 text-sm font-mono-code leading-relaxed text-[#E8E6E0] resize-none focus:outline-none focus:border-[#E8D56B]/60 shadow-inner"
              spellCheck={false}
            />

            {/* Bottom Metrics Bar */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#E8E6E0]/40 border-t border-[#E8E6E0]/10 mt-2">
              <div className="flex items-center gap-4">
                <span>{lines.length} lines</span>
                <span>{wordCount} words</span>
                <span>{verseMarkers} structural sections</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Rhyme Scheme:</span>
                <select
                  aria-label="Rhyme Scheme format"
                  value={rhymeScheme}
                  onChange={(e) => setRhymeScheme(e.target.value)}
                  className="bg-[#0B0F12] border border-[#E8E6E0]/20 text-[#E8D56B] px-2 py-0.5 text-[10px]"
                >
                  <option value="AABB">AABB (Couplets)</option>
                  <option value="ABAB">ABAB (Alternate)</option>
                  <option value="AABA">AABA (Rubaiyat)</option>
                  <option value="Free">Freestyle Flow</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right/Secondary Panel: Image Scanner & OCR Engine */}
          {activeTab === 'image' && (
            <div className="w-full md:w-[420px] border-t md:border-t-0 md:border-l border-[#E8E6E0]/15 bg-[#0B0F12] p-4 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E8E6E0]/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#E8D56B] uppercase">
                    Optical Character Recognition (OCR)
                  </span>
                </div>
                {activeImagePreview && (
                  <button
                    onClick={() => {
                      setActiveImagePreview(null);
                      setActiveImageFile(null);
                      setOcrResult(null);
                      setOcrEditableText('');
                    }}
                    className="text-[10px] text-[#f43f5e] hover:underline cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {activeImagePreview ? (
                <div className="space-y-4">
                  {/* Image Preview Container with Scanner Line Effect */}
                  <div className="relative border border-[#E8E6E0]/20 rounded-lg overflow-hidden max-h-56 flex items-center justify-center bg-black group">
                    <img
                      src={activeImagePreview}
                      alt="Handwritten lyrics note"
                      className="object-contain max-h-56 w-full"
                    />

                    {/* Animated OCR Laser Scan Bar */}
                    {isTranscribingImage && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f2fe]/20 to-transparent pointer-events-none animate-pulse">
                        <div className="w-full h-1 bg-[#00f2fe] shadow-[0_0_12px_#00f2fe] animate-bounce" />
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] text-[#E8E6E0]/70 font-mono">
                      {imageFileName}
                    </div>
                  </div>

                  {/* OCR Scanning Action / Progress */}
                  {isTranscribingImage ? (
                    <div className="p-3 bg-[#07090A] border border-[#00f2fe]/40 rounded-lg space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#00f2fe]">
                        <span>{ocrStage}</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1a1f30] rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00f2fe] to-[#E8D56B] transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleRunOcr}
                      className="w-full py-2.5 bg-gradient-to-r from-[#C47A2A] to-[#E8D56B] hover:brightness-110 text-[#07090A] font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg rounded transition-all flex items-center justify-center gap-2"
                    >
                      <span>🔍</span>
                      <span>Run OCR Handwriting Scan</span>
                    </button>
                  )}

                  {/* OCR Extracted Result Box */}
                  {ocrResult && (
                    <div className="space-y-3 bg-[#07090e] p-3 rounded-xl border border-[#6A8A4F]/40 animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#6A8A4F] font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6A8A4F]" />
                          OCR Extraction Ready
                        </span>
                        <span className="text-[#E8D56B] font-semibold">
                          {ocrResult.confidence}% Confidence
                        </span>
                      </div>

                      <div className="text-[10px] text-[#E8E6E0]/60 flex justify-between">
                        <span>{ocrResult.linesDetected} lines detected</span>
                        <span>{ocrResult.wordCount} words &middot; {ocrResult.processingTimeMs}ms</span>
                      </div>

                      {/* Editable OCR text area */}
                      <div>
                        <label className="text-[9px] text-[#E8E6E0]/50 block mb-1">
                          Review Extracted Lyrics (editable):
                        </label>
                        <textarea
                          value={ocrEditableText}
                          onChange={(e) => setOcrEditableText(e.target.value)}
                          className="w-full h-32 bg-[#0B0F12] border border-[#E8E6E0]/20 p-2 text-xs font-mono text-[#E8E6E0] rounded resize-none focus:outline-none focus:border-[#6A8A4F]"
                          placeholder="Extracted text..."
                        />
                      </div>

                      {/* Insert into notebook action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleInsertOcrText('append')}
                          className="py-2 bg-[#6A8A4F]/20 hover:bg-[#6A8A4F]/30 text-[#6A8A4F] border border-[#6A8A4F]/50 rounded text-xs font-bold cursor-pointer transition-colors"
                        >
                          + Append to Notebook
                        </button>
                        <button
                          onClick={() => handleInsertOcrText('replace')}
                          className="py-2 bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#f43f5e] border border-[#f43f5e]/50 rounded text-xs font-bold cursor-pointer transition-colors"
                        >
                          Replace Entire Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E6E0]/20 hover:border-[#E8D56B] p-8 text-center cursor-pointer transition-colors rounded-xl my-auto bg-[#07090A]/60 flex flex-col items-center justify-center group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</span>
                  <p className="text-xs font-semibold text-[#E8E6E0] mb-1">
                    Upload Lyric Photo or Napkin Note
                  </p>
                  <p className="text-[10px] text-[#E8E6E0]/40 max-w-[220px]">
                    Supports JPG, PNG, WEBP. Drag &amp; drop an image here or click to browse.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
