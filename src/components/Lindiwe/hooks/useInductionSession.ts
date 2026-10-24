/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface InductionData {
  identity: {
    fullName: string;
    alias: string;
    role: string;
    email: string;
  };
  institution: {
    name: string;
    jurisdiction: string;
    accreditationLevel: string;
    regNumber: string;
  };
  intent: {
    primaryFocus: string;
    soundEngineeringTrack: string;
    proofBridgeIntegration: boolean;
    governanceCommitment: boolean;
  };
  step: number;
  completed: boolean;
  inductionHash: string;
}

const DEFAULT_INDUCTION: InductionData = {
  identity: {
    fullName: 'Mino Enchilotto',
    alias: 'Mino',
    role: 'Lead Audio Architect & Producer',
    email: 'mino@venturevisionubuntu.co.za',
  },
  institution: {
    name: 'VVU Foundation · Venture Vision Ubuntu',
    jurisdiction: 'Cape Town / Johannesburg, ZA',
    accreditationLevel: 'D-SME Level 1 (108 Recognition)',
    regNumber: '2026-2026-03',
  },
  intent: {
    primaryFocus: 'Lossless Audio Invariants & High-Fidelity Music DAW',
    soundEngineeringTrack: 'Advanced DSP & Multitrack Comping',
    proofBridgeIntegration: true,
    governanceCommitment: true,
  },
  step: 1,
  completed: false,
  inductionHash: '',
};

const STORAGE_KEY = 'vvu_lindiwe_induction_session';

export function useInductionSession() {
  const [session, setSession] = useState<InductionData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading induction session', e);
    }
    return DEFAULT_INDUCTION;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed saving induction session', e);
    }
  }, [session]);

  const updateIdentity = (fields: Partial<InductionData['identity']>) => {
    setSession((prev) => ({
      ...prev,
      identity: { ...prev.identity, ...fields },
    }));
  };

  const updateInstitution = (fields: Partial<InductionData['institution']>) => {
    setSession((prev) => ({
      ...prev,
      institution: { ...prev.institution, ...fields },
    }));
  };

  const updateIntent = (fields: Partial<InductionData['intent']>) => {
    setSession((prev) => ({
      ...prev,
      intent: { ...prev.intent, ...fields },
    }));
  };

  const setStep = (step: number) => {
    setSession((prev) => ({ ...prev, step }));
  };

  const completeInduction = () => {
    const hash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setSession((prev) => ({
      ...prev,
      completed: true,
      inductionHash: hash,
      step: 5,
    }));
    return hash;
  };

  const resetInduction = () => {
    setSession(DEFAULT_INDUCTION);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    session,
    updateIdentity,
    updateInstitution,
    updateIntent,
    setStep,
    completeInduction,
    resetInduction,
  };
}
