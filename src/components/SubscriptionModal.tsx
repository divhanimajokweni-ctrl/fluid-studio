/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  billingService,
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
  PaymentTransactionReceipt,
  TaxBreakdown,
} from '../services/billingService';
import { projectTracker } from '../services/projectTracker';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (planName: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activePlan, setActivePlan] = useState<SubscriptionPlan>(() => billingService.getActivePlan());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(() => {
    return SUBSCRIPTION_PLANS[1]; // Studio Pro by default
  });
  const [provider, setProvider] = useState<'Stitch' | 'Paystack'>('Stitch');
  const [stitchBank, setStitchBank] = useState<string>('Capitec Pay');
  const [paystackMethod, setPaystackMethod] = useState<string>('Card (Visa / Mastercard)');
  const [email, setEmail] = useState<string>('ebdenstr@gmail.com');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentTransactionReceipt | null>(null);

  useEffect(() => {
    return billingService.subscribe(() => {
      setActivePlan(billingService.getActivePlan());
    });
  }, []);

  if (!isOpen) return null;

  const isZar = provider === 'Stitch';
  const price = isZar ? selectedPlan.monthlyPriceZar : selectedPlan.monthlyPriceUsd;
  const taxBreakdown: TaxBreakdown = billingService.calculateTax(price, isZar ? 'ZAR' : 'USD');

  const handleCheckout = async () => {
    if (selectedPlan.name === activePlan.name) return;

    setIsProcessing(true);
    try {
      let receipt: PaymentTransactionReceipt;
      if (provider === 'Stitch') {
        receipt = await billingService.processStitchPayment(
          selectedPlan.id,
          `${selectedPlan.name} Subscription`,
          selectedPlan.monthlyPriceZar,
          stitchBank,
          email
        );
      } else {
        receipt = await billingService.processPaystackPayment(
          selectedPlan.id,
          `${selectedPlan.name} Subscription`,
          selectedPlan.monthlyPriceUsd,
          paystackMethod,
          email
        );
      }

      setCompletedReceipt(receipt);
      projectTracker.touchProject('proj-horizonte', `Subscribed to ${selectedPlan.name} via ${provider}`);
      if (onSuccess) onSuccess(selectedPlan.name);
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-code text-[#E8E6E0]">
      <div className="bg-[#0B0F12] border border-[#E8E6E0]/20 max-w-4xl w-full max-h-[92vh] flex flex-col relative shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121622] via-[#0e111a] to-[#121622] border-b border-[#E8E6E0]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C47A2A] to-[#E8D56B] p-[2px] flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-[#07090A]">VVU</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                Fluid Studio Subscription &amp; Tier Upgrades
              </h2>
              <p className="text-[10px] text-[#E8E6E0]/60">
                Local Instant EFT (Stitch) &middot; Pan-African &amp; Global (Paystack) &middot; Full Tax Compliance
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {completedReceipt ? (
            /* Successful Receipt View */
            <div className="bg-[#0e131a] border border-[#6A8A4F]/50 rounded-xl p-6 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#6A8A4F]/20 text-[#6A8A4F] flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 className="font-display font-bold text-2xl text-white">Payment Confirmed</h3>
              <p className="text-xs text-[#E8E6E0]/70 max-w-md mx-auto">
                Your subscription to <strong className="text-[#E8D56B]">{selectedPlan.name}</strong> is now active. Storage limit increased to{' '}
                <strong className="text-white">{selectedPlan.storageLimitGb} GB</strong>.
              </p>

              {/* Tax Invoice Breakdown Box */}
              <div className="bg-[#07090e] border border-[#E8E6E0]/15 rounded-lg p-4 max-w-lg mx-auto text-left text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-[#E8E6E0]/10 pb-2 font-bold text-[#E8D56B]">
                  <span>TAX INVOICE: {completedReceipt.invoiceNumber}</span>
                  <span className="text-[10px] text-[#6A8A4F]">SARS / INTL COMPLIANT</span>
                </div>
                <div className="flex justify-between text-[#E8E6E0]/70 text-[11px]">
                  <span>Provider:</span>
                  <span className="text-white">{completedReceipt.provider} ({completedReceipt.methodDetails})</span>
                </div>
                <div className="flex justify-between text-[#E8E6E0]/70 text-[11px]">
                  <span>Billed to:</span>
                  <span className="text-white">{completedReceipt.customerEmail}</span>
                </div>
                <div className="flex justify-between text-[#E8E6E0]/70 text-[11px]">
                  <span>Item:</span>
                  <span className="text-white">{completedReceipt.itemDescription}</span>
                </div>
                <div className="border-t border-[#E8E6E0]/10 pt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#E8E6E0]/60">
                    <span>Net Subtotal:</span>
                    <span>{completedReceipt.taxBreakdown.currency} {completedReceipt.taxBreakdown.netSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#E8E6E0]/60">
                    <span>{completedReceipt.taxBreakdown.taxLabel}:</span>
                    <span>{completedReceipt.taxBreakdown.currency} {completedReceipt.taxBreakdown.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#E8E6E0]/10">
                    <span>Grand Total:</span>
                    <span className="text-[#00f2fe]">{completedReceipt.taxBreakdown.currency} {completedReceipt.taxBreakdown.grossTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[9px] text-[#E8E6E0]/40 pt-2 border-t border-[#E8E6E0]/10 break-all">
                  ProofBridge Block Attestation Hash: {completedReceipt.proofBridgeHash}
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedReceipt(null);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#F5F0E0] hover:bg-white text-[#07090A] font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
              >
                Return to Studio
              </button>
            </div>
          ) : (
            <>
              {/* Active Plan Indicator */}
              <div className="flex items-center justify-between p-3 bg-[#07090e] border border-[#E8E6E0]/15 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#E8E6E0]/50">Current Active Plan:</span>
                  <span className="px-2 py-0.5 bg-[#6A8A4F]/20 text-[#6A8A4F] font-bold rounded">
                    {activePlan.name} ({activePlan.storageLimitGb} GB Storage)
                  </span>
                </div>
                <span className="text-[10px] text-[#E8E6E0]/40">Node-locked license</span>
              </div>

              {/* Subscription Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = plan.name === activePlan.name;
                  const isSelected = plan.id === selectedPlan.id;
                  const displayPrice = isZar ? `R${plan.monthlyPriceZar}` : `$${plan.monthlyPriceUsd.toFixed(2)}`;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#141824] border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.15)] ring-1 ring-[#00f2fe]'
                          : 'bg-[#0e111a] border-[#E8E6E0]/15 hover:border-[#E8E6E0]/30'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-[#C47A2A] to-[#E8D56B] text-[#07090A] font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                          Recommended
                        </span>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                          {isCurrent && (
                            <span className="text-[9px] text-[#6A8A4F] bg-[#6A8A4F]/20 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="my-3">
                          <span className="text-2xl font-display font-bold text-white">{displayPrice}</span>
                          <span className="text-[10px] text-[#E8E6E0]/50 ml-1">/ month</span>
                        </div>

                        <div className="text-[11px] font-semibold text-[#00f2fe] mb-3">
                          {plan.storageLimitGb} GB High-Speed Storage
                        </div>

                        <ul className="space-y-1.5 text-[11px] text-[#E8E6E0]/70 mb-4">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#6A8A4F] text-[10px]">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                        }}
                        className={`w-full py-2 text-xs font-bold rounded transition-colors ${
                          isCurrent
                            ? 'bg-[#1a1f30] text-[#E8E6E0]/40 cursor-default'
                            : isSelected
                            ? 'bg-[#00f2fe] text-[#07090A] font-extrabold'
                            : 'bg-[#22273a] hover:bg-[#323952] text-white'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Payment Gateway & Tax Breakdown Section */}
              <div className="bg-[#0e111a] border border-[#E8E6E0]/15 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E6E0]/10 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Select Payment Gateway
                  </span>
                  {/* Gateway Selector Tabs */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProvider('Stitch')}
                      className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        provider === 'Stitch'
                          ? 'bg-[#E8D56B] text-[#07090A]'
                          : 'bg-[#1a1f30] text-[#E8E6E0]/60 hover:text-white'
                      }`}
                    >
                      <span>🇿🇦 Stitch (Local ZAR)</span>
                    </button>
                    <button
                      onClick={() => setProvider('Paystack')}
                      className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        provider === 'Paystack'
                          ? 'bg-[#00f2fe] text-[#07090A]'
                          : 'bg-[#1a1f30] text-[#E8E6E0]/60 hover:text-white'
                      }`}
                    >
                      <span>🌍 Paystack (Global USD)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Method inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[#E8E6E0]/60 block mb-1">
                        Billing Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#07090e] border border-[#E8E6E0]/20 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-[#E8D56B]"
                        placeholder="producer@studio.com"
                      />
                    </div>

                    {provider === 'Stitch' ? (
                      <div>
                        <label className="text-[10px] text-[#E8E6E0]/60 block mb-1">
                          Select South African Bank (Instant EFT / Capitec Pay)
                        </label>
                        <select
                          value={stitchBank}
                          onChange={(e) => setStitchBank(e.target.value)}
                          className="w-full bg-[#07090e] border border-[#E8E6E0]/20 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-[#E8D56B]"
                        >
                          <option value="Capitec Pay">Capitec Pay (Instant One-Click Approval)</option>
                          <option value="Standard Bank">Standard Bank Instant EFT</option>
                          <option value="First National Bank (FNB)">FNB / RMB Pay</option>
                          <option value="Nedbank">Nedbank Instant EFT</option>
                          <option value="Absa">Absa Bank Instant EFT</option>
                          <option value="TymeBank">TymeBank Smart EFT</option>
                          <option value="Investec">Investec Private Banking</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] text-[#E8E6E0]/60 block mb-1">
                          Payment Method (Paystack Global)
                        </label>
                        <select
                          value={paystackMethod}
                          onChange={(e) => setPaystackMethod(e.target.value)}
                          className="w-full bg-[#07090e] border border-[#E8E6E0]/20 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-[#00f2fe]"
                        >
                          <option value="Card (Visa / Mastercard)">Debit / Credit Card (3D Secure)</option>
                          <option value="Apple Pay">Apple Pay (Biometric Instant Checkout)</option>
                          <option value="Bank Transfer">Direct Bank Transfer</option>
                          <option value="USSD">Mobile Money / USSD</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Itemized Tax Calculation ("Tax a tax") */}
                  <div className="bg-[#07090e] border border-[#E8E6E0]/10 rounded-lg p-3 space-y-2 text-xs font-mono">
                    <div className="text-[10px] font-bold text-[#E8D56B] border-b border-[#E8E6E0]/10 pb-1 flex justify-between">
                      <span>ORDER SUMMARY &amp; TAX BREAKDOWN</span>
                      <span className="text-[9px] text-[#6A8A4F]">TAX COMPLIANT</span>
                    </div>

                    <div className="flex justify-between text-[#E8E6E0]/70 text-[11px]">
                      <span>{selectedPlan.name} Monthly:</span>
                      <span>{taxBreakdown.currency} {taxBreakdown.netSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-[#E8E6E0]/70 text-[11px]">
                      <span>{taxBreakdown.taxLabel}:</span>
                      <span className="text-[#E8D56B]">+ {taxBreakdown.currency} {taxBreakdown.taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#E8E6E0]/10">
                      <span>Total Due Today:</span>
                      <span className="text-[#00f2fe]">{taxBreakdown.currency} {taxBreakdown.grossTotal.toFixed(2)}</span>
                    </div>

                    <p className="text-[9px] text-[#E8E6E0]/40 pt-1">
                      {isZar
                        ? 'Includes 15% South African Value Added Tax (VAT) in accordance with SARS statutory regulations.'
                        : 'Includes applicable international digital service sales taxes.'}
                    </p>
                  </div>
                </div>

                {/* Checkout Submit Button */}
                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || selectedPlan.name === activePlan.name}
                    className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                      selectedPlan.name === activePlan.name
                        ? 'bg-[#1a1f30] text-[#E8E6E0]/40 cursor-not-allowed'
                        : isProcessing
                        ? 'bg-[#E8D56B]/50 text-[#07090A] cursor-wait'
                        : provider === 'Stitch'
                        ? 'bg-[#E8D56B] hover:bg-[#E8D56B]/90 text-[#07090A] shadow-[#E8D56B]/20'
                        : 'bg-[#00f2fe] hover:bg-[#00f2fe]/90 text-[#07090A] shadow-[#00f2fe]/20'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>Connecting to {provider} Gateway...</span>
                      </>
                    ) : selectedPlan.name === activePlan.name ? (
                      <span>Already Subscribed to {selectedPlan.name}</span>
                    ) : (
                      <span>
                        Authorize with {provider} &middot; {taxBreakdown.currency} {taxBreakdown.grossTotal.toFixed(2)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
