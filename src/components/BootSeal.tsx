/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface BootSealProps {
  onComplete: () => void;
  isReplaying?: boolean;
}

const BASE_INK = '#E8E6E0';
const COLOR_MOSS = '#6A8A4F';
const COLOR_OCHRE = '#C47A2A';
const COLOR_YELLOW = '#E8D56B';

const T1 = 2.0;
const T2 = 5.0;
const T3 = 7.0;

// Ring translations in the rotor's rotated frame.
// With rotor at 840deg (=120deg visual), these produce the correct
// world-space Borromean positions: moss left, yellow right, ochre top.
const RING_OFFSETS = {
  moss: { x: 68.37, y: 34.42 },
  yellow: { x: 4.37, y: -76.42 },
  ochre: { x: -38.1, y: 22.0 },
};

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mixColor(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r},${g},${bl})`;
}

const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const BootSeal: React.FC<BootSealProps> = ({ onComplete, isReplaying }) => {
  const [phaseText, setPhaseText] = useState('INITIALIZING');
  const [phaseColor, setPhaseColor] = useState(COLOR_MOSS);
  const [timerDisplay, setTimerDisplay] = useState('0.0s / 7.0s');
  const [isDone, setIsDone] = useState(false);

  const rotorRef = useRef<SVGGElement | null>(null);
  const centralTextRef = useRef<SVGGElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const ringMossRef = useRef<SVGGElement | null>(null);
  const ringOchreRef = useRef<SVGGElement | null>(null);
  const ringYellowRef = useRef<SVGGElement | null>(null);

  const dot1Ref = useRef<SVGCircleElement | null>(null);
  const dot2Ref = useRef<SVGCircleElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const finish = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsDone(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  }, [onComplete]);

  const renderFrame = useCallback((t: number) => {
    let rot = 0;
    let scale = 1;
    let blur = 0;
    let glow = 0;
    let textOpacity = 1;
    let label = 'INITIALIZING';
    let labelColor = COLOR_MOSS;

    if (t < T1) {
      rot = (t / T1) * 120;
      label = 'SPIN 0.3×';
    } else if (t < T2) {
      const p = (t - T1) / (T2 - T1);
      const e = easeInCubic(p);
      rot = 120 + e * 720;
      scale = 1 + e * 0.08;
      blur = e * 14;
      glow = e;
      label = 'CRESCENDO';
      labelColor = COLOR_OCHRE;
    } else if (t < T3) {
      const p = (t - T2) / (T3 - T2);
      const e = easeOutCubic(p);
      rot = 840;
      scale = 1.08;
      blur = 14 * (1 - e);
      glow = 1 - e;
      textOpacity = 1 - e;
      label = 'SPLIT / BORROMEAN';
      labelColor = COLOR_YELLOW;

      if (ringMossRef.current) {
        ringMossRef.current.style.transform = `translate(${RING_OFFSETS.moss.x * e}px, ${RING_OFFSETS.moss.y * e}px)`;
        const c = ringMossRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', mixColor(BASE_INK, COLOR_MOSS, e));
      }
      if (ringYellowRef.current) {
        ringYellowRef.current.style.transform = `translate(${RING_OFFSETS.yellow.x * e}px, ${RING_OFFSETS.yellow.y * e}px)`;
        const c = ringYellowRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', mixColor(BASE_INK, COLOR_YELLOW, e));
      }
      if (ringOchreRef.current) {
        ringOchreRef.current.style.transform = `translate(${RING_OFFSETS.ochre.x * e}px, ${RING_OFFSETS.ochre.y * e}px)`;
        const c = ringOchreRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', mixColor(BASE_INK, COLOR_OCHRE, e));
      }

      const dotOp = Math.max(0, (e - 0.5) * 2);
      if (dot1Ref.current) dot1Ref.current.setAttribute('opacity', String(dotOp));
      if (dot2Ref.current) dot2Ref.current.setAttribute('opacity', String(dotOp * 0.4));
    } else {
      rot = 840;
      scale = 1.08;
      textOpacity = 0;
      label = 'VERIFIED';
      labelColor = COLOR_YELLOW;

      if (ringMossRef.current) {
        ringMossRef.current.style.transform = `translate(${RING_OFFSETS.moss.x}px, ${RING_OFFSETS.moss.y}px)`;
        const c = ringMossRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', COLOR_MOSS);
      }
      if (ringYellowRef.current) {
        ringYellowRef.current.style.transform = `translate(${RING_OFFSETS.yellow.x}px, ${RING_OFFSETS.yellow.y}px)`;
        const c = ringYellowRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', COLOR_YELLOW);
      }
      if (ringOchreRef.current) {
        ringOchreRef.current.style.transform = `translate(${RING_OFFSETS.ochre.x}px, ${RING_OFFSETS.ochre.y}px)`;
        const c = ringOchreRef.current.querySelector('circle');
        if (c) c.setAttribute('stroke', COLOR_OCHRE);
      }

      if (dot1Ref.current) dot1Ref.current.setAttribute('opacity', '1');
      if (dot2Ref.current) dot2Ref.current.setAttribute('opacity', '0.4');
    }

    if (rotorRef.current) {
      rotorRef.current.style.transform = `rotate(${rot}deg) scale(${scale})`;
    }
    if (centralTextRef.current) {
      centralTextRef.current.style.opacity = String(textOpacity);
    }

    if (svgRef.current) {
      const filters = [];
      if (blur > 0.05) filters.push(`blur(${blur.toFixed(2)}px)`);
      if (glow > 0.05) filters.push(`drop-shadow(0 0 ${(glow * 20).toFixed(1)}px rgba(232,230,224,${(glow * 0.4).toFixed(2)}))`);
      svgRef.current.style.filter = filters.join(' ') || 'none';
    }

    setPhaseText(label);
    setPhaseColor(labelColor);
    setTimerDisplay(`${Math.min(t, 7).toFixed(1)}s / 7.0s`);
  }, []);

  useEffect(() => {
    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      finish();
      return;
    }

    startTimeRef.current = 0;
    setIsDone(false);

    const loop = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000;

      if (elapsed >= T3) {
        renderFrame(T3);
        finish();
        return;
      }

      renderFrame(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(loop);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finish, renderFrame, isReplaying]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#07090A] transition-opacity duration-700 select-none ${
        isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 sm:px-10 text-[10px] tracking-[0.22em] text-[#E8E6E0]/40 uppercase font-mono-code">
        <div className="flex items-center gap-2">
          <span>FLUID_STUDIO / SEAL_03</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full transition-colors duration-300 animate-pulse"
            style={{ backgroundColor: phaseColor }}
          />
          <span style={{ color: phaseColor }}>{phaseText}</span>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={finish}
        className="absolute top-6 right-6 sm:right-10 px-3 py-1.5 border border-[#E8E6E0]/20 text-[#E8E6E0]/60 hover:text-[#E8E6E0] hover:border-[#E8E6E0]/60 text-[10px] tracking-[0.2em] font-mono-code cursor-pointer transition-all uppercase rounded-none bg-transparent"
      >
        SKIP ↦
      </button>

      {/* Center SVG Seal */}
      <div className="relative w-[min(540px,90vw)] h-[min(540px,90vw)] flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 600 600"
          className="w-full h-full overflow-visible will-change-[filter]"
        >
          <defs>
            <path id="topArcBoot" d="M 95 300 A 205 205 0 0 1 505 300" fill="none" />
            <path id="bottomArcBoot" d="M 505 300 A 205 205 0 0 1 95 300" fill="none" />
          </defs>

          <g ref={rotorRef} className="origin-[300px_300px] will-change-transform">
            {/* Central Typography & Master Rings */}
            <g ref={centralTextRef} className="will-change-[opacity]">
              <circle cx="300" cy="300" r="256" fill="none" stroke="#E8E6E0" strokeWidth="0.9" opacity="0.85" />
              <circle cx="300" cy="300" r="240" fill="none" stroke="#E8E6E0" strokeWidth="0.6" opacity="0.38" />
              <text
                fontFamily="'Cormorant Garamond', serif"
                fontSize="20"
                fontWeight="700"
                letterSpacing="4.2"
                fill="#E8E6E0"
              >
                <textPath href="#topArcBoot" startOffset="50%" textAnchor="middle">
                  FLUID STUDIO
                </textPath>
              </text>
              <text
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10.5"
                fontWeight="500"
                letterSpacing="1.8"
                fill="#E8E6E0"
                opacity="0.9"
              >
                <textPath href="#bottomArcBoot" startOffset="50%" textAnchor="middle">
                  BENCH • NODE-LOCKED LICENSE SEAL
                </textPath>
              </text>
              <rect
                x="240"
                y="240"
                width="120"
                height="120"
                transform="rotate(45 300 300)"
                fill="none"
                stroke="#E8E6E0"
                strokeWidth="2"
                opacity="0.28"
              />
              <text
                x="300"
                y="318"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', serif"
                fontSize="58"
                fontWeight="700"
                letterSpacing="-1"
                fill="#E8E6E0"
                fontStyle="italic"
              >
                FS
              </text>
            </g>

            {/* Three Borromean Rings */}
            <g ref={ringMossRef} className="origin-[300px_300px] will-change-transform">
              <circle cx="300" cy="300" r="86" fill="none" stroke="#E8E6E0" strokeWidth="21" strokeLinecap="round" />
            </g>
            <g ref={ringOchreRef} className="origin-[300px_300px] will-change-transform">
              <circle cx="300" cy="300" r="86" fill="none" stroke="#E8E6E0" strokeWidth="21" strokeLinecap="round" />
            </g>
            <g ref={ringYellowRef} className="origin-[300px_300px] will-change-transform">
              <circle cx="300" cy="300" r="86" fill="none" stroke="#E8E6E0" strokeWidth="21" strokeLinecap="round" />
            </g>

            {/* Core Focal Points */}
            <circle ref={dot1Ref} cx="300" cy="300" r="7.5" fill="#F5F0E0" opacity="0" />
            <circle ref={dot2Ref} cx="300" cy="300" r="2.2" fill="#07090A" opacity="0" />
          </g>
        </svg>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-6 sm:px-10 text-[10px] tracking-[0.22em] text-[#E8E6E0]/40 uppercase font-mono-code">
        <div>SEAL CONSTRUCTION: 3× TORUS 86R / 21W</div>
        <div className="tabular-nums">{timerDisplay}</div>
      </div>
    </div>
  );
};
