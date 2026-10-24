/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storageManager } from './storageManager';

export interface SoundPack {
  id: string;
  title: string;
  genre: string;
  description: string;
  priceZar: number;
  priceUsd: number;
  sampleCount: number;
  sizeMb: number;
  audioPreviewSrc: string;
  coverGradient: string;
  tags: string[];
  purchased: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Free Tier' | 'Studio Pro' | 'Label Enterprise';
  monthlyPriceZar: number;
  monthlyPriceUsd: number;
  storageLimitGb: number;
  features: string[];
  popular?: boolean;
}

export interface TaxBreakdown {
  currency: 'ZAR' | 'USD';
  taxRatePercent: number;
  taxLabel: string;
  netSubtotal: number;
  taxAmount: number;
  grossTotal: number;
}

export interface PaymentTransactionReceipt {
  transactionId: string;
  invoiceNumber: string;
  date: string;
  customerEmail: string;
  provider: 'Stitch' | 'Paystack';
  methodDetails: string;
  itemDescription: string;
  taxBreakdown: TaxBreakdown;
  proofBridgeHash: string;
  status: 'Completed' | 'Pending';
}

export const SOUND_PACKS: SoundPack[] = [
  {
    id: 'pack-amapiano-log',
    title: 'VVU Amapiano Log Drum Essentials',
    genre: 'Amapiano / Kwaito',
    description: 'Over 120 authentic tuned acoustic log drum one-shots, rolling basslines, and shaker polyrhythms recorded in Soweto.',
    priceZar: 149,
    priceUsd: 9.99,
    sampleCount: 145,
    sizeMb: 240,
    audioPreviewSrc: '/assets/aistudio/Hillside_Therapy_4827260b.mp3',
    coverGradient: 'from-[#C47A2A] via-[#E8D56B] to-[#6A8A4F]',
    tags: ['Log Drum', 'Amapiano', 'Soweto Bass', 'Percussion'],
    purchased: false,
  },
  {
    id: 'pack-cape-flats-soul',
    title: 'Cape Flats Soul & Vintage Rhodes',
    genre: 'Neo-Soul / Jazz Hip Hop',
    description: 'Lush 1973 Mark I Rhodes chords, vintage sax riffs, vinyl dust textures, and live bass takes from Cape Town sessions.',
    priceZar: 199,
    priceUsd: 12.99,
    sampleCount: 180,
    sizeMb: 380,
    audioPreviewSrc: '/assets/aistudio/_SOLD__J_Cole_x_Kendrick_Lamar_Type_Beat_Chill_Hip_Hop_Instrumental_2017____Homegrown___Prod_Homage__eee89af4.mp3',
    coverGradient: 'from-[#8b5cf6] via-[#ec4899] to-[#f43f5e]',
    tags: ['Rhodes', 'Soul', 'Cape Flats', 'Hip Hop'],
    purchased: false,
  },
  {
    id: 'pack-jozi-drill-808',
    title: 'Jozi Drill 808s & 48kHz Brass',
    genre: 'African Drill',
    description: 'Distorted sliding 808s, orchestral brass stabs, dark synth leads, and fast-hat rolls engineered for Mino Enchilotto vocal tracks.',
    priceZar: 179,
    priceUsd: 11.50,
    sampleCount: 160,
    sizeMb: 310,
    audioPreviewSrc: '/assets/aistudio/0FF__be9cbc16.mp3',
    coverGradient: 'from-[#00f2fe] via-[#3b82f6] to-[#1e1b4b]',
    tags: ['808', 'Drill', 'Brass', 'Trap'],
    purchased: false,
  },
  {
    id: 'pack-african-polyrhythm',
    title: 'Ubuntu Polyrhythm Percussion Vault',
    genre: 'Afro-Cuban / Batá / Djembe',
    description: 'Multi-velocity African traditional hand percussion, shakers, cowbells, talking drums, and organic foot stomps.',
    priceZar: 129,
    priceUsd: 7.99,
    sampleCount: 110,
    sizeMb: 190,
    audioPreviewSrc: '/assets/aistudio/Blxnk_9b229f17.mp3',
    coverGradient: 'from-[#10b981] via-[#059669] to-[#064e3b]',
    tags: ['Polyrhythm', 'Percussion', 'Djembe', 'Ubuntu'],
    purchased: false,
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Tier',
    monthlyPriceZar: 0,
    monthlyPriceUsd: 0,
    storageLimitGb: 2,
    features: [
      '2 GB Cloud & Offline Audio Storage',
      '16-Step DAW Beat Lab Sequencer',
      'UbuntuDJ Parallel Dual-Deck Console',
      '4 Basic DSP Plugins Included',
      'Standard 16-bit WAV Export',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Studio Pro',
    monthlyPriceZar: 299,
    monthlyPriceUsd: 18.00,
    storageLimitGb: 25,
    popular: true,
    features: [
      '25 GB High-Speed Audio & Stem Storage',
      'Full Tempo Automation Curve Editor',
      'All 8 DSP Audio Plugins Unlocked',
      'Unlimited Lyric Notebook & OCR Transcriptions',
      'ProofBridge Verified Quality Control Gates',
      'Priority Lossless 24-bit / 48kHz WAV Export',
    ],
  },
  {
    id: 'plan-enterprise',
    name: 'Label Enterprise',
    monthlyPriceZar: 599,
    monthlyPriceUsd: 35.00,
    storageLimitGb: 100,
    features: [
      '100 GB Dedicated Audio & Master Archive',
      'Multi-Producer Collaboration & Node Sync',
      'ProofBridge Cryptographic Block Attestation',
      'Commercial Sample Pack Distribution Rights',
      'Direct Stitch & Paystack Merchant Payouts',
      'Dedicated Studio Support & Mastering Audits',
    ],
  },
];

class BillingService {
  private activePlanName: 'Free Tier' | 'Studio Pro' | 'Label Enterprise' = 'Free Tier';
  private packs: SoundPack[] = SOUND_PACKS;
  private receipts: PaymentTransactionReceipt[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedPlan = localStorage.getItem('fluid_active_plan');
      if (savedPlan) {
        this.activePlanName = savedPlan as any;
      }
      const savedPacks = localStorage.getItem('fluid_purchased_packs');
      if (savedPacks) {
        const ids: string[] = JSON.parse(savedPacks);
        this.packs = this.packs.map((p) => ({
          ...p,
          purchased: ids.includes(p.id),
        }));
      }
      const savedReceipts = localStorage.getItem('fluid_billing_receipts');
      if (savedReceipts) {
        this.receipts = JSON.parse(savedReceipts);
      }
    } catch {
      // fallback
    }
  }

  private saveState() {
    localStorage.setItem('fluid_active_plan', this.activePlanName);
    const purchasedIds = this.packs.filter((p) => p.purchased).map((p) => p.id);
    localStorage.setItem('fluid_purchased_packs', JSON.stringify(purchasedIds));
    localStorage.setItem('fluid_billing_receipts', JSON.stringify(this.receipts));
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

  public getActivePlan(): SubscriptionPlan {
    return SUBSCRIPTION_PLANS.find((p) => p.name === this.activePlanName) || SUBSCRIPTION_PLANS[0];
  }

  public getPacks(): SoundPack[] {
    return this.packs;
  }

  public getReceipts(): PaymentTransactionReceipt[] {
    return this.receipts;
  }

  // Calculate detailed Tax Breakdown (15% South Africa VAT for ZAR, 8.5% International Tax for USD)
  public calculateTax(amount: number, currency: 'ZAR' | 'USD'): TaxBreakdown {
    const isZar = currency === 'ZAR';
    const taxRatePercent = isZar ? 15 : 8.5;
    const taxLabel = isZar ? 'South African VAT (15% SARS)' : 'International Digital Services Tax (8.5%)';

    const netSubtotal = amount;
    const taxAmount = +(netSubtotal * (taxRatePercent / 100)).toFixed(2);
    const grossTotal = +(netSubtotal + taxAmount).toFixed(2);

    return {
      currency,
      taxRatePercent,
      taxLabel,
      netSubtotal,
      taxAmount,
      grossTotal,
    };
  }

  // Process a Stitch (South Africa Local Instant EFT / Capitec Pay) transaction
  public async processStitchPayment(
    planOrPackId: string,
    itemTitle: string,
    netPriceZar: number,
    bankCode: string,
    customerEmail: string
  ): Promise<PaymentTransactionReceipt> {
    const tax = this.calculateTax(netPriceZar, 'ZAR');

    // Simulate instant secure Stitch EFT handshake
    await new Promise((resolve) => setTimeout(resolve, 950));

    const receipt: PaymentTransactionReceipt = {
      transactionId: `STITCH-${Date.now().toString(36).toUpperCase()}`,
      invoiceNumber: `INV-ZA-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      customerEmail,
      provider: 'Stitch',
      methodDetails: `Stitch Instant EFT (${bankCode}) &middot; Capitec Pay / Verified`,
      itemDescription: itemTitle,
      taxBreakdown: tax,
      proofBridgeHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'Completed',
    };

    this.completePurchase(planOrPackId, receipt);
    return receipt;
  }

  // Process a Paystack (Pan-African & Global Card / Apple Pay) transaction
  public async processPaystackPayment(
    planOrPackId: string,
    itemTitle: string,
    netPriceUsd: number,
    method: string,
    customerEmail: string
  ): Promise<PaymentTransactionReceipt> {
    const tax = this.calculateTax(netPriceUsd, 'USD');

    // Simulate Paystack secure gateway tokenization
    await new Promise((resolve) => setTimeout(resolve, 950));

    const receipt: PaymentTransactionReceipt = {
      transactionId: `PSTK-${Date.now().toString(36).toUpperCase()}`,
      invoiceNumber: `INV-INTL-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      customerEmail,
      provider: 'Paystack',
      methodDetails: `Paystack Global &middot; ${method} (Verified)`,
      itemDescription: itemTitle,
      taxBreakdown: tax,
      proofBridgeHash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'Completed',
    };

    this.completePurchase(planOrPackId, receipt);
    return receipt;
  }

  private completePurchase(planOrPackId: string, receipt: PaymentTransactionReceipt) {
    // If it's a subscription plan
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planOrPackId);
    if (plan) {
      this.activePlanName = plan.name;
      storageManager.upgradeTier(plan.name);
    }

    // If it's a sound pack
    const pack = this.packs.find((p) => p.id === planOrPackId);
    if (pack) {
      pack.purchased = true;
      storageManager.addItem({
        name: `${pack.title}.zip`,
        type: 'sample_pack',
        sizeBytes: pack.sizeMb * 1024 * 1024,
      });
    }

    this.receipts.unshift(receipt);
    this.saveState();
  }
}

export const billingService = new BillingService();
