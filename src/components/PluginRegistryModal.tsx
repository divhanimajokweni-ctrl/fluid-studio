/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  pluginRegistry,
  StudioPlugin,
} from '../services/pluginRegistry';
import { projectTracker } from '../services/projectTracker';

interface PluginRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription?: () => void;
}

export const PluginRegistryModal: React.FC<PluginRegistryModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscription,
}) => {
  const [plugins, setPlugins] = useState<StudioPlugin[]>(() => pluginRegistry.getAllPlugins());
  const [selectedPluginId, setSelectedPluginId] = useState<string>(plugins[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId) || plugins[0];

  const handleToggleBypass = (id: string) => {
    pluginRegistry.toggleBypass(id);
    setPlugins([...pluginRegistry.getAllPlugins()]);
    const updated = pluginRegistry.getPlugin(id);
    showToast(`${updated?.name}: ${updated?.isBypassed ? 'BYPASSED' : 'ACTIVE'}`);
    projectTracker.touchProject('proj-horizonte', `Toggled DSP plugin bypass: ${updated?.name}`);
  };

  const handleParamChange = (pluginId: string, paramId: string, val: number) => {
    pluginRegistry.updateParameter(pluginId, paramId, val);
    setPlugins([...pluginRegistry.getAllPlugins()]);
  };

  const handleMixChange = (pluginId: string, val: number) => {
    pluginRegistry.setMix(pluginId, val);
    setPlugins([...pluginRegistry.getAllPlugins()]);
  };

  const filteredPlugins = categoryFilter === 'All'
    ? plugins
    : plugins.filter((p) => p.category === categoryFilter);

  const categories = ['All', 'Dynamics', 'EQ & Filters', 'Reverb & Space', 'Harmonics', 'Mastering'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-5xl w-full h-[88vh] flex flex-col relative shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121622] via-[#0e111a] to-[#121622] border-b border-[#E8E6E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                  Studio DSP Plugin Registry &amp; Rack
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 rounded font-mono">
                  8 PLUGINS LOADED
                </span>
              </div>
              <p className="text-[10px] text-[#E8E6E0]/60">
                Native Web Audio DSP modules, analog tape modelling, FET dynamic compression, and ProofBridge mastering limiters
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

        {/* Filter categories bar */}
        <div className="px-4 py-2.5 bg-[#07090A] border-b border-[#E8E6E0]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#E8D56B] text-[#07090A]'
                    : 'bg-[#121622] text-[#E8E6E0]/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {toastMessage && (
            <span className="text-[10px] text-[#6A8A4F] animate-fade-in font-bold">
              ✓ {toastMessage}
            </span>
          )}
        </div>

        {/* Modal Main Area: List on left, Plugin Chassis on right */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#07090A]">
          {/* Left Plugin List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#E8E6E0]/10 bg-[#0B0F12] p-3 overflow-y-auto space-y-2">
            {filteredPlugins.map((plug) => {
              const isSelected = plug.id === selectedPluginId;

              return (
                <div
                  key={plug.id}
                  onClick={() => setSelectedPluginId(plug.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#141824] border-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                      : 'bg-[#0e111a] border-[#E8E6E0]/10 hover:border-[#E8E6E0]/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span>{plug.icon}</span>
                      <span>{plug.name}</span>
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        plug.isBypassed ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-[#10b981]/20 text-[#10b981]'
                      }`}
                    >
                      {plug.isBypassed ? 'BYP' : 'ON'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[#E8E6E0]/50 mt-1">
                    <span>{plug.category}</span>
                    <span>v{plug.version}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Plugin Chassis & Parameters */}
          <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-[#0B0F12] via-[#0e111a] to-[#07090A] flex flex-col justify-between">
            <div>
              {/* Plugin Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E8E6E0]/15">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPlugin.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{selectedPlugin.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a1f30] text-[#E8E6E0]/60 font-mono">
                        v{selectedPlugin.version}
                      </span>
                    </h3>
                    <p className="text-xs text-[#E8E6E0]/60 mt-0.5 max-w-xl">
                      {selectedPlugin.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBypass(selectedPlugin.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      selectedPlugin.isBypassed
                        ? 'bg-[#f43f5e] text-white shadow-[0_0_10px_#f43f5e]'
                        : 'bg-[#10b981] text-[#07090A] shadow-[0_0_10px_#10b981]'
                    }`}
                  >
                    {selectedPlugin.isBypassed ? 'Bypassed' : 'Active DSP'}
                  </button>
                </div>
              </div>

              {/* Master Wet / Dry Mix Slider */}
              <div className="mb-6 p-3 bg-[#07090e] rounded-xl border border-[#E8E6E0]/10 flex items-center justify-between gap-4">
                <div className="text-xs font-bold text-[#E8D56B]">
                  WET / DRY MIX: <span className="text-white">{selectedPlugin.mixWetDry}%</span>
                </div>
                <input
                  aria-label="Wet Dry Mix"
                  type="range"
                  min="0"
                  max="100"
                  value={selectedPlugin.mixWetDry}
                  onChange={(e) => handleMixChange(selectedPlugin.id, parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-[#1a1f30] rounded cursor-pointer accent-[#E8D56B]"
                />
              </div>

              {/* Parameter Knobs & Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedPlugin.parameters.map((param) => (
                  <div
                    key={param.id}
                    className="bg-[#07090e] border border-[#E8E6E0]/15 rounded-xl p-3 flex flex-col justify-between text-center"
                  >
                    <span className="text-[11px] font-bold text-[#E8E6E0]/70 mb-2 truncate">
                      {param.name}
                    </span>

                    {/* Numeric Display */}
                    <div className="text-lg font-bold text-[#00f2fe] my-1 font-mono">
                      {param.currentValue}{' '}
                      <span className="text-[10px] text-white/50">{param.unit}</span>
                    </div>

                    {/* Slider */}
                    <input
                      aria-label={param.name}
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={param.currentValue}
                      onChange={(e) =>
                        handleParamChange(selectedPlugin.id, param.id, parseFloat(e.target.value))
                      }
                      className="w-full h-1 bg-[#1a1f30] rounded cursor-pointer accent-[#00f2fe] my-2"
                    />

                    <div className="flex justify-between text-[9px] text-[#E8E6E0]/40">
                      <span>{param.min} {param.unit}</span>
                      <span>{param.max} {param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Slot Info & Tier Requirement */}
            <div className="mt-8 pt-4 border-t border-[#E8E6E0]/10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#E8E6E0]/50">
              <div className="flex items-center gap-2">
                <span>Developer:</span>
                <span className="text-white font-semibold">{selectedPlugin.developer}</span>
                <span>&middot;</span>
                <span>Tier Requirement:</span>
                <span className="text-[#E8D56B] font-semibold">{selectedPlugin.tierRequired}</span>
              </div>

              {onOpenSubscription && (
                <button
                  onClick={onOpenSubscription}
                  className="px-3 py-1 bg-[#22273a] hover:bg-[#323952] text-[#E8D56B] rounded text-[11px] font-bold cursor-pointer"
                >
                  Unlock Pro Plugins ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
