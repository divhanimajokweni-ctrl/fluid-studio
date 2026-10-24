/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storageManager, UserStorageQuota, StorageItem } from '../services/storageManager';
import { projectTracker } from '../services/projectTracker';

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription?: () => void;
}

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscription,
}) => {
  const [quota, setQuota] = useState<UserStorageQuota>(() => storageManager.getQuota());
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    return storageManager.subscribe(() => {
      setQuota({ ...storageManager.getQuota() });
    });
  }, []);

  if (!isOpen) return null;

  const usedPercent = storageManager.getUsedPercentage();
  const isNearLimit = storageManager.isNearLimit();
  const isAtLimit = storageManager.isAtLimit();

  const handleDeleteItem = (item: StorageItem) => {
    storageManager.removeItem(item.id);
    projectTracker.touchProject('proj-horizonte', `Deleted ${item.name} from storage`);
  };

  const filteredItems = filterType === 'all'
    ? quota.items
    : quota.items.filter((it) => it.type === filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-3xl w-full max-h-[88vh] flex flex-col relative shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121622] via-[#0e111a] to-[#121622] border-b border-[#E8E6E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                  User Cloud &amp; Stem Storage Quota
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] border border-[#6A8A4F]/40 rounded font-mono">
                  {quota.tierName}
                </span>
              </div>
              <p className="text-[10px] text-[#E8E6E0]/60">
                Track and manage stem sessions, multi-track vocal takes, and lossless master WAV files
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Gauge Bar */}
          <div className="bg-[#0e111a] border border-[#E8E6E0]/15 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-[#E8E6E0]/60 block mb-0.5">CURRENT DISK USAGE</span>
                <span className="text-2xl font-bold font-display text-white">
                  {storageManager.formatBytes(quota.usedBytes)}{' '}
                  <span className="text-xs font-mono text-[#E8E6E0]/50">
                    / {storageManager.formatBytes(quota.totalLimitBytes)}
                  </span>
                </span>
              </div>

              <div className="text-right">
                <span
                  className={`text-lg font-bold font-mono ${
                    isAtLimit ? 'text-[#f43f5e]' : isNearLimit ? 'text-[#E8D56B]' : 'text-[#10b981]'
                  }`}
                >
                  {usedPercent}%
                </span>
                <span className="text-[10px] text-[#E8E6E0]/50 block">of quota used</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-[#07090e] rounded-full overflow-hidden p-0.5 border border-[#E8E6E0]/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAtLimit
                    ? 'bg-[#f43f5e] shadow-[0_0_12px_#f43f5e]'
                    : isNearLimit
                    ? 'bg-gradient-to-r from-[#E8D56B] to-[#f43f5e]'
                    : 'bg-gradient-to-r from-[#00f2fe] via-[#E8D56B] to-[#10b981]'
                }`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>

            {/* Quota warning */}
            {isAtLimit ? (
              <div className="p-2.5 bg-[#f43f5e]/15 border border-[#f43f5e]/40 rounded text-xs text-[#f43f5e] flex items-center justify-between">
                <span>⚠️ Storage limit reached! Delete unused takes or upgrade plan.</span>
                {onOpenSubscription && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubscription();
                    }}
                    className="px-2.5 py-1 bg-[#f43f5e] text-white font-bold rounded text-[10px] uppercase cursor-pointer"
                  >
                    Upgrade Tier
                  </button>
                )}
              </div>
            ) : isNearLimit ? (
              <div className="p-2.5 bg-[#E8D56B]/15 border border-[#E8D56B]/40 rounded text-xs text-[#E8D56B] flex items-center justify-between">
                <span>⚠️ Approaching 80% storage threshold.</span>
                {onOpenSubscription && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubscription();
                    }}
                    className="px-2.5 py-1 bg-[#E8D56B] text-[#07090A] font-bold rounded text-[10px] uppercase cursor-pointer"
                  >
                    Get 25 GB Pro
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Filter Types and Item List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Stored Project Assets ({quota.items.length})
              </span>
              <div className="flex gap-1 text-[10px]">
                {['all', 'stem', 'take', 'export', 'sample_pack', 'backup'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2 py-0.5 rounded capitalize cursor-pointer ${
                      filterType === t
                        ? 'bg-[#E8D56B] text-[#07090A] font-bold'
                        : 'bg-[#121622] text-[#E8E6E0]/60 hover:text-white'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0e111a] border border-[#E8E6E0]/15 rounded-xl divide-y divide-[#E8E6E0]/10 overflow-hidden">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#E8E6E0]/40">
                  No assets found in this category.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-[#141824] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">
                        {item.type === 'stem' ? '🎛' : item.type === 'take' ? '🎙' : item.type === 'sample_pack' ? '📦' : '📄'}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#E8E6E0]/40">
                          {item.type.toUpperCase()} &middot; Saved {item.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-[#00f2fe]">
                        {storageManager.formatBytes(item.sizeBytes)}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 text-[#E8E6E0]/40 hover:text-[#f43f5e] cursor-pointer transition-colors"
                        title="Delete asset to free up storage"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e111a] border-t border-[#E8E6E0]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[10px] text-[#E8E6E0]/50">
            Storage is encrypted and synced with ProofBridge IVE verification.
          </span>
          {onOpenSubscription && (
            <button
              onClick={() => {
                onClose();
                onOpenSubscription();
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#C47A2A] to-[#E8D56B] text-[#07090A] font-bold text-xs uppercase tracking-wider rounded cursor-pointer hover:brightness-110 shadow-md"
            >
              Upgrade Storage Tier ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
