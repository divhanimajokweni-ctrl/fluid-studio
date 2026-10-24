/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PluginParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  currentValue: number;
  unit: string;
}

export interface StudioPlugin {
  id: string;
  name: string;
  version: string;
  developer: string;
  category: 'Dynamics' | 'EQ & Filters' | 'Reverb & Space' | 'Harmonics' | 'Modulation' | 'Mastering';
  description: string;
  icon: string;
  accentColor: string;
  isBypassed: boolean;
  mixWetDry: number; // 0 to 100%
  parameters: PluginParameter[];
  installed: boolean;
  tierRequired: 'Free' | 'Studio Pro' | 'Label Enterprise';
}

export const PLUGIN_CATALOG: StudioPlugin[] = [
  {
    id: 'plug-borromean-reverb',
    name: 'Borromean 3-Ring Reverb',
    version: '2.4.0',
    developer: 'VVU Audio Labs',
    category: 'Reverb & Space',
    description: 'Triple-convolution algorithmic space with sacred geometry reflection decay and damping control.',
    icon: '✨',
    accentColor: '#E8D56B',
    isBypassed: false,
    mixWetDry: 35,
    installed: true,
    tierRequired: 'Free',
    parameters: [
      { id: 'decay', name: 'Decay Time', min: 0.2, max: 8.0, step: 0.1, defaultValue: 2.2, currentValue: 2.2, unit: 's' },
      { id: 'damping', name: 'HF Damping', min: 1000, max: 18000, step: 100, defaultValue: 6500, currentValue: 6500, unit: 'Hz' },
      { id: 'predelay', name: 'Pre-Delay', min: 0, max: 150, step: 1, defaultValue: 24, currentValue: 24, unit: 'ms' },
      { id: 'width', name: 'Stereo Spread', min: 0, max: 200, step: 5, defaultValue: 120, currentValue: 120, unit: '%' },
    ],
  },
  {
    id: 'plug-ochre-tape',
    name: 'Ochre Tape Saturation',
    version: '1.8.2',
    developer: 'VVU Foundation',
    category: 'Harmonics',
    description: 'Authentic 15 IPS magnetic tape head warmth with analog hysteresis and soft-clipping saturation.',
    icon: '📼',
    accentColor: '#C47A2A',
    isBypassed: false,
    mixWetDry: 50,
    installed: true,
    tierRequired: 'Free',
    parameters: [
      { id: 'drive', name: 'Tape Drive', min: 0, max: 24, step: 0.5, defaultValue: 8.5, currentValue: 8.5, unit: 'dB' },
      { id: 'warmth', name: 'Warmth Bias', min: -6, max: 6, step: 0.2, defaultValue: 2.0, currentValue: 2.0, unit: 'dB' },
      { id: 'flutter', name: 'Tape Flutter', min: 0, max: 100, step: 1, defaultValue: 12, currentValue: 12, unit: '%' },
      { id: 'ceiling', name: 'Headroom', min: -12, max: 0, step: 0.5, defaultValue: -1.0, currentValue: -1.0, unit: 'dB' },
    ],
  },
  {
    id: 'plug-transistor-1176',
    name: 'Transistor FET Compressor 1176',
    version: '3.1.0',
    developer: 'Fluid DSP',
    category: 'Dynamics',
    description: 'Ultra-fast FET optical limiter with all-buttons British mode for crushing drum parallel busses.',
    icon: '🎛',
    accentColor: '#00f2fe',
    isBypassed: false,
    mixWetDry: 100,
    installed: true,
    tierRequired: 'Studio Pro',
    parameters: [
      { id: 'input', name: 'Input Level', min: -30, max: 12, step: 0.5, defaultValue: -12, currentValue: -12, unit: 'dB' },
      { id: 'ratio', name: 'Ratio', min: 4, max: 20, step: 4, defaultValue: 8, currentValue: 8, unit: ':1' },
      { id: 'attack', name: 'Attack', min: 20, max: 800, step: 10, defaultValue: 60, currentValue: 60, unit: 'µs' },
      { id: 'release', name: 'Release', min: 50, max: 1100, step: 25, defaultValue: 150, currentValue: 150, unit: 'ms' },
    ],
  },
  {
    id: 'plug-amapiano-sub',
    name: 'Amapiano Sub-Harmonic Exciter',
    version: '1.2.0',
    developer: 'VVU Audio Labs',
    category: 'Harmonics',
    description: 'Specialized low-end frequency synthesizer tuned specifically for African log drum presence on mobile & club rigs.',
    icon: '🔊',
    accentColor: '#6A8A4F',
    isBypassed: false,
    mixWetDry: 75,
    installed: true,
    tierRequired: 'Studio Pro',
    parameters: [
      { id: 'subTune', name: 'Sub Frequency', min: 35, max: 85, step: 1, defaultValue: 52, currentValue: 52, unit: 'Hz' },
      { id: 'octave', name: 'Sub Octave Mix', min: 0, max: 100, step: 2, defaultValue: 45, currentValue: 45, unit: '%' },
      { id: 'drive', name: 'Wood Resonator', min: 0, max: 100, step: 1, defaultValue: 60, currentValue: 60, unit: '%' },
      { id: 'punch', name: 'Transient Slap', min: 0, max: 10, step: 0.5, defaultValue: 6.5, currentValue: 6.5, unit: 'dB' },
    ],
  },
  {
    id: 'plug-parametric-8eq',
    name: 'Precision 8-Band Parametric EQ',
    version: '4.0.0',
    developer: 'Fluid DSP',
    category: 'EQ & Filters',
    description: 'Surgical linear-phase filter array with real-time spectrum overlay and dynamic Q bandwidth.',
    icon: '📊',
    accentColor: '#f43f5e',
    isBypassed: false,
    mixWetDry: 100,
    installed: true,
    tierRequired: 'Free',
    parameters: [
      { id: 'lowcut', name: 'High-Pass Cut', min: 20, max: 300, step: 5, defaultValue: 30, currentValue: 30, unit: 'Hz' },
      { id: 'lowshelf', name: 'Low Shelf (100Hz)', min: -12, max: 12, step: 0.5, defaultValue: 1.5, currentValue: 1.5, unit: 'dB' },
      { id: 'midpeak', name: 'Mid Bell (1.2kHz)', min: -12, max: 12, step: 0.5, defaultValue: -1.0, currentValue: -1.0, unit: 'dB' },
      { id: 'highair', name: 'High Air (14kHz)', min: -12, max: 12, step: 0.5, defaultValue: 3.5, currentValue: 3.5, unit: 'dB' },
    ],
  },
  {
    id: 'plug-stereo-widener',
    name: 'Ubuntu Stereo Spatializer',
    version: '2.1.0',
    developer: 'VVU Foundation',
    category: 'Reverb & Space',
    description: 'Mono-compatible Mid/Side Haas spatializer preserving punch in mono while enveloping in headphones.',
    icon: '🌐',
    accentColor: '#10b981',
    isBypassed: false,
    mixWetDry: 80,
    installed: true,
    tierRequired: 'Free',
    parameters: [
      { id: 'sidesGain', name: 'Sides Expansion', min: 0, max: 200, step: 5, defaultValue: 130, currentValue: 130, unit: '%' },
      { id: 'monosafe', name: 'Mono Bass Cutoff', min: 60, max: 300, step: 10, defaultValue: 140, currentValue: 140, unit: 'Hz' },
      { id: 'phase', name: 'Haas Delay', min: 0, max: 30, step: 0.5, defaultValue: 12.5, currentValue: 12.5, unit: 'ms' },
    ],
  },
  {
    id: 'plug-truepeak-limiter',
    name: 'ProofBridge True Peak Limiter',
    version: '5.2.0',
    developer: 'VVU Cryptographic DSP',
    category: 'Mastering',
    description: 'EBU R128 & ITU-R BS.1770-4 inter-sample peak gate with ProofBridge certified loudness stamping.',
    icon: '🛡',
    accentColor: '#E8E6E0',
    isBypassed: false,
    mixWetDry: 100,
    installed: true,
    tierRequired: 'Label Enterprise',
    parameters: [
      { id: 'ceiling', name: 'True Peak Ceiling', min: -3.0, max: 0.0, step: 0.1, defaultValue: -1.0, currentValue: -1.0, unit: 'dBTP' },
      { id: 'targetLufs', name: 'Target Loudness', min: -18, max: -6, step: 0.5, defaultValue: -14.0, currentValue: -14.0, unit: 'LUFS' },
      { id: 'release', name: 'Adaptive Release', min: 10, max: 500, step: 10, defaultValue: 120, currentValue: 120, unit: 'ms' },
    ],
  },
];

class PluginRegistryService {
  private plugins: StudioPlugin[] = PLUGIN_CATALOG;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('fluid_plugins_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.plugins = this.plugins.map((p) => {
          const match = parsed.find((m: StudioPlugin) => m.id === p.id);
          return match ? { ...p, ...match } : p;
        });
      }
    } catch {
      // fallback to catalog
    }
  }

  private saveToStorage() {
    localStorage.setItem('fluid_plugins_state', JSON.stringify(this.plugins));
  }

  public getAllPlugins(): StudioPlugin[] {
    return this.plugins;
  }

  public getPlugin(id: string): StudioPlugin | undefined {
    return this.plugins.find((p) => p.id === id);
  }

  public toggleBypass(id: string): StudioPlugin | undefined {
    const plug = this.plugins.find((p) => p.id === id);
    if (plug) {
      plug.isBypassed = !plug.isBypassed;
      this.saveToStorage();
    }
    return plug;
  }

  public updateParameter(pluginId: string, paramId: string, value: number): void {
    const plug = this.plugins.find((p) => p.id === pluginId);
    if (plug) {
      const param = plug.parameters.find((pr) => pr.id === paramId);
      if (param) {
        param.currentValue = value;
        this.saveToStorage();
      }
    }
  }

  public setMix(pluginId: string, wetDry: number): void {
    const plug = this.plugins.find((p) => p.id === pluginId);
    if (plug) {
      plug.mixWetDry = Math.max(0, Math.min(100, wetDry));
      this.saveToStorage();
    }
  }
}

export const pluginRegistry = new PluginRegistryService();
