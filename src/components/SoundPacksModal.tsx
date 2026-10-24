/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  billingService,
  SoundPack,
  TaxBreakdown,
} from '../services/billingService';
import { projectTracker } from '../services/projectTracker';

interface SoundPacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleToSession?: (packTitle: string) => void;
}

export const SoundPacksModal: React.FC<SoundPacksModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleToSession,
}) => {
  const [packs, setPacks] = useState<SoundPack[]>(() => billingService.getPacks());
  const [playingPackId, setPlayingPackId] = useState<string | null>(null);
  const [selectedPackForPurchase, setSelectedPackForPurchase] = useState<SoundPack | null>(null);
  const [provider, setProvider] = useState<'Stitch' | 'Paystack'>('Stitch');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return billingService.subscribe(() => {
      setPacks(billingService.getPacks());
    });
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTogglePlay = (pack: SoundPack) => {
    if (playingPackId === pack.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingPackId(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(pack.audioPreviewSrc);
    audioRef.current = audio;
    audio.play().catch((e) => console.warn('Preview interrupted', e));
    setPlayingPackId(pack.id);

    audio.onended = () => {
      setPlayingPackId(null);
    };
  };

  const handlePurchasePack = async (pack: SoundPack) => {
    setIsProcessing(true);
    try {
      if (provider === 'Stitch') {
        await billingService.processStitchPayment(
          pack.id,
          `${pack.title} Sound Pack`,
          pack.priceZar,
          'Capitec Pay',
          'ebdenstr@gmail.com'
        );
      } else {
        await billingService.processPaystackPayment(
          pack.id,
          `${pack.title} Sound Pack`,
          pack.priceUsd,
          'Card (Visa / Mastercard)',
          'ebdenstr@gmail.com'
        );
      }

      projectTracker.touchProject('proj-horizonte', `Purchased sound pack: ${pack.title}`);
      setSelectedPackForPurchase(null);
      showToast(`Pack "${pack.title}" downloaded and added to project sample library!`);
      if (onLoadSampleToSession) onLoadSampleToSession(pack.title);
    } catch (err) {
      console.error('Purchase failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isZar = provider === 'Stitch';
  const taxBreakdown: TaxBreakdown | null = selectedPackForPurchase
    ? billingService.calculateTax(
        isZar ? selectedPackForPurchase.priceZar : selectedPackForPurchase.priceUsd,
        isZar ? 'ZAR' : 'USD'
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-4xl w-full max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121622] via-[#0e111a] to-[#121622] border-b border-[#E8E6E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Fluid Sound Packs &amp; Stem Library
              </h2>
              <p className="text-[10px] text-[#E8E6E0]/60">
                Lossless 24-bit 48kHz WAV one-shots, rolling log drums, and authentic African stem vaults
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#E8E6E0]/50 hover:text-white px-2 py-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-[#10b981]/20 border-b border-[#10b981]/40 px-4 py-2 text-xs text-[#10b981] flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {selectedPackForPurchase && taxBreakdown ? (
            /* Purchase Checkout with Tax Breakdown */
            <div className="max-w-lg mx-auto bg-[#0e111a] border border-[#E8D56B]/40 rounded-xl p-5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-[#E8E6E0]/10 pb-3">
                <span className="text-xs font-bold text-white">PURCHASE PACK &amp; TAX CALCULATION</span>
                <button
                  onClick={() => setSelectedPackForPurchase(null)}
                  className="text-xs text-[#E8E6E0]/50 hover:text-white"
                >
                  Back
                </button>
              </div>

              <div>
                <h4 className="font-bold text-base text-[#E8D56B]">{selectedPackForPurchase.title}</h4>
                <p className="text-xs text-[#E8E6E0]/70 mt-1">{selectedPackForPurchase.description}</p>
                <div className="flex gap-3 text-[11px] text-[#E8E6E0]/50 mt-2 font-mono">
                  <span>{selectedPackForPurchase.sampleCount} Samples</span>
                  <span>&middot;</span>
                  <span>{selectedPackForPurchase.sizeMb} MB Uncompressed</span>
                  <span>&middot;</span>
                  <span>24-bit / 48kHz</span>
                </div>
              </div>

              {/* Gateway Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setProvider('Stitch')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    provider === 'Stitch'
                      ? 'bg-[#E8D56B] text-[#07090A]'
                      : 'bg-[#1a1f30] text-[#E8E6E0]/60'
                  }`}
                >
                  🇿🇦 Stitch (ZAR)
                </button>
                <button
                  onClick={() => setProvider('Paystack')}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    provider === 'Paystack'
                      ? 'bg-[#00f2fe] text-[#07090A]'
                      : 'bg-[#1a1f30] text-[#E8E6E0]/60'
                  }`}
                >
                  🌍 Paystack (USD)
                </button>
              </div>

              {/* Itemized Tax Breakdown Box */}
              <div className="bg-[#07090e] border border-[#E8E6E0]/15 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#E8E6E0]/60 text-[11px]">
                  <span>Net Price:</span>
                  <span>{taxBreakdown.currency} {taxBreakdown.netSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#E8E6E0]/60 text-[11px]">
                  <span>{taxBreakdown.taxLabel}:</span>
                  <span className="text-[#E8D56B]">+ {taxBreakdown.currency} {taxBreakdown.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#E8E6E0]/10">
                  <span>Grand Total (Incl. Tax):</span>
                  <span className="text-[#00f2fe]">{taxBreakdown.currency} {taxBreakdown.grossTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => handlePurchasePack(selectedPackForPurchase)}
                disabled={isProcessing}
                className="w-full py-3 bg-[#E8D56B] hover:bg-[#E8D56B]/90 text-[#07090A] font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Processing via {provider}...</span>
                  </>
                ) : (
                  <span>
                    Pay {taxBreakdown.currency} {taxBreakdown.grossTotal.toFixed(2)} with {provider}
                  </span>
                )}
              </button>
            </div>
          ) : (
            /* Sound Packs Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packs.map((pack) => {
                const isPlaying = playingPackId === pack.id;

                return (
                  <div
                    key={pack.id}
                    className="bg-[#0e111a] border border-[#E8E6E0]/15 hover:border-[#E8E6E0]/30 rounded-xl p-4 flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Gradient Header Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#C47A2A]/20 text-[#C47A2A] font-bold border border-[#C47A2A]/40 uppercase tracking-wider">
                          {pack.genre}
                        </span>
                        <span className="text-xs font-bold text-white">
                          R{pack.priceZar} / ${pack.priceUsd}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white mb-1">{pack.title}</h3>
                      <p className="text-xs text-[#E8E6E0]/60 line-clamp-2 mb-3">
                        {pack.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pack.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-2 py-0.5 bg-[#1a1f30] text-[#E8E6E0]/70 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E6E0]/10 flex items-center justify-between gap-2">
                      {/* Audio Preview Button */}
                      <button
                        onClick={() => handleTogglePlay(pack)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isPlaying
                            ? 'bg-[#f43f5e] text-white animate-pulse'
                            : 'bg-[#1a1f30] hover:bg-[#252c44] text-[#E8E6E0]'
                        }`}
                      >
                        <span>{isPlaying ? '❚❚' : '▶'}</span>
                        <span>{isPlaying ? 'Playing Preview' : 'Audition'}</span>
                      </button>

                      {pack.purchased ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6A8A4F] font-bold bg-[#6A8A4F]/20 px-2 py-1 rounded">
                            ✓ Unlocked
                          </span>
                          <button
                            onClick={() => {
                              showToast(`Stems from ${pack.title} loaded into active session!`);
                              if (onLoadSampleToSession) onLoadSampleToSession(pack.title);
                            }}
                            className="px-3 py-1.5 bg-[#6A8A4F] hover:bg-[#6A8A4F]/90 text-[#07090A] text-xs font-bold rounded cursor-pointer"
                          >
                            Import Stems
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPackForPurchase(pack)}
                          className="px-4 py-1.5 bg-[#E8D56B] hover:bg-white text-[#07090A] text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all shadow-md"
                        >
                          Buy Pack
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
