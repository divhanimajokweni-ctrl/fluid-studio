/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StorageItem {
  id: string;
  name: string;
  type: 'stem' | 'take' | 'export' | 'sample_pack' | 'backup';
  sizeBytes: number;
  createdAt: string;
}

export interface UserStorageQuota {
  tierName: 'Free Tier' | 'Studio Pro' | 'Label Enterprise';
  totalLimitBytes: number;
  usedBytes: number;
  items: StorageItem[];
}

const TIER_LIMITS: Record<string, number> = {
  'Free Tier': 2 * 1024 * 1024 * 1024, // 2 GB
  'Studio Pro': 25 * 1024 * 1024 * 1024, // 25 GB
  'Label Enterprise': 100 * 1024 * 1024 * 1024, // 100 GB
};

const DEFAULT_ITEMS: StorageItem[] = [
  { id: 'item-1', name: 'Horizonte_Master_Stems_Session.wav', type: 'stem', sizeBytes: 142 * 1024 * 1024, createdAt: '2026-10-23' },
  { id: 'item-2', name: 'Mino_Enchilotto_Vent_Vocals_Lead.wav', type: 'take', sizeBytes: 88 * 1024 * 1024, createdAt: '2026-10-23' },
  { id: 'item-3', name: 'Hillside_Therapy_Amapiano_Bass.wav', type: 'stem', sizeBytes: 64 * 1024 * 1024, createdAt: '2026-10-23' },
  { id: 'item-4', name: 'Horizonte_Master_16bit_PCM_Final.wav', type: 'export', sizeBytes: 52 * 1024 * 1024, createdAt: '2026-10-23' },
  { id: 'item-5', name: 'ProofBridge_BlockAttestation_Backup.json', type: 'backup', sizeBytes: 12 * 1024 * 1024, createdAt: '2026-10-23' },
];

class StorageManagerService {
  private quota: UserStorageQuota;
  private listeners: (() => void)[] = [];

  constructor() {
    this.quota = this.loadQuota();
  }

  private loadQuota(): UserStorageQuota {
    try {
      const saved = localStorage.getItem('fluid_user_storage_quota');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    const initialUsed = DEFAULT_ITEMS.reduce((acc, it) => acc + it.sizeBytes, 0);
    return {
      tierName: 'Free Tier',
      totalLimitBytes: TIER_LIMITS['Free Tier'],
      usedBytes: initialUsed,
      items: DEFAULT_ITEMS,
    };
  }

  private saveQuota() {
    localStorage.setItem('fluid_user_storage_quota', JSON.stringify(this.quota));
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getQuota(): UserStorageQuota {
    return this.quota;
  }

  public getUsedPercentage(): number {
    return Math.min(100, Math.round((this.quota.usedBytes / this.quota.totalLimitBytes) * 100));
  }

  public formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  public isNearLimit(): boolean {
    return this.getUsedPercentage() >= 80;
  }

  public isAtLimit(): boolean {
    return this.quota.usedBytes >= this.quota.totalLimitBytes;
  }

  public addItem(item: Omit<StorageItem, 'id' | 'createdAt'>): boolean {
    if (this.quota.usedBytes + item.sizeBytes > this.quota.totalLimitBytes) {
      return false; // Storage quota exceeded
    }

    const newItem: StorageItem = {
      ...item,
      id: `stor-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.quota.items.unshift(newItem);
    this.quota.usedBytes += newItem.sizeBytes;
    this.saveQuota();
    return true;
  }

  public removeItem(id: string): void {
    const item = this.quota.items.find((it) => it.id === id);
    if (item) {
      this.quota.usedBytes = Math.max(0, this.quota.usedBytes - item.sizeBytes);
      this.quota.items = this.quota.items.filter((it) => it.id !== id);
      this.saveQuota();
    }
  }

  public upgradeTier(tier: 'Free Tier' | 'Studio Pro' | 'Label Enterprise'): void {
    this.quota.tierName = tier;
    this.quota.totalLimitBytes = TIER_LIMITS[tier] || TIER_LIMITS['Free Tier'];
    this.saveQuota();
  }
}

export const storageManager = new StorageManagerService();
