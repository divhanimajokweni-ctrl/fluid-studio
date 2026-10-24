/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OcrResult {
  text: string;
  confidence: number; // e.g. 96.8%
  linesDetected: number;
  wordCount: number;
  detectedLanguage: string;
  processingTimeMs: number;
  sourceFileName: string;
}

/**
 * Realistic Studio OCR Placeholder Service
 * Simulates optical character recognition on handwritten lyric notes,
 * studio whiteboard drafts, and napkin scribbles.
 */
export async function performOcrOnImage(
  file: File,
  onProgress?: (progress: number, stage: string) => void
): Promise<OcrResult> {
  const startTime = performance.now();

  // Progress simulation stages
  if (onProgress) {
    onProgress(15, 'Preprocessing image & adjusting contrast...');
    await new Promise((r) => setTimeout(r, 250));
    onProgress(45, 'Detecting text baselines & handwritten contours...');
    await new Promise((r) => setTimeout(r, 300));
    onProgress(75, 'Binarizing characters & neural language modeling...');
    await new Promise((r) => setTimeout(r, 250));
    onProgress(95, 'Synthesizing lyrical verses & punctuation...');
    await new Promise((r) => setTimeout(r, 150));
    onProgress(100, 'OCR extraction complete.');
  }

  // Derive contextual lyrics based on filename or studio defaults
  const lowerName = file.name.toLowerCase();

  let transcribedLines: string[] = [];

  if (lowerName.includes('hook') || lowerName.includes('chorus')) {
    transcribedLines = [
      '[Chorus - Scanned from Studio Note]',
      'Horizonte on the glass, golden hour glow,',
      'I am because we are, let the river flow.',
      'Three rings locked, Borromean seal,',
      'Hold the sacred frequency, make the cipher real.',
    ];
  } else if (lowerName.includes('verse') || lowerName.includes('rap')) {
    transcribedLines = [
      '[Verse - Scanned from Handwritten Pad]',
      'Stepped out the dark room into the sunrise,',
      'Calculated frequencies right before my eyes.',
      'No shims in the routing, pure 24-bit sound,',
      'Anchored in the earth where the Ubuntu ethos found.',
      'From the low-end rumble to the highest pitch curve,',
      'Every bar spoken is the rhythm they deserve.',
    ];
  } else if (lowerName.includes('bridge') || lowerName.includes('outro')) {
    transcribedLines = [
      '[Bridge - Whiteboard Take]',
      'Slow the turntable down, feel the vinyl brake,',
      'Every single milestone is a legacy we make.',
      'ProofBridge verified, the seal in the groove,',
      'Nothing left to doubt when the frequencies move.',
    ];
  } else {
    transcribedLines = [
      `[Scanned from Note: ${file.name}]`,
      '(Bar 01) Written on the night train heading South,',
      '(Bar 02) Golden frequencies straight from the mouth,',
      '(Bar 03) We do not fold when the baseline shifts,',
      '(Bar 04) We build the bridges, we seal the rifts,',
      '(Bar 05) Echo through the monitor, 48k true,',
      '(Bar 06) Venture Vision Ubuntu, all for the crew.',
    ];
  }

  const resultText = transcribedLines.join('\n');
  const words = resultText.split(/\s+/).filter(Boolean).length;
  const processingTime = Math.round(performance.now() - startTime);

  return {
    text: resultText,
    confidence: +(94 + Math.random() * 5.2).toFixed(1), // 94.0% - 99.2%
    linesDetected: transcribedLines.length,
    wordCount: words,
    detectedLanguage: 'English (Studio Audio Standard)',
    processingTimeMs: processingTime,
    sourceFileName: file.name,
  };
}
