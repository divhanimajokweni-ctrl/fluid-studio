/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InductionData } from './hooks/useInductionSession';
import styles from './CompleteState.module.css';

interface CompleteStateProps {
  data: InductionData;
  onClose: () => void;
  onReset: () => void;
}

export const CompleteState: React.FC<CompleteStateProps> = ({ data, onClose, onReset }) => {
  return (
    <div className={styles.completeContainer}>
      <div className={styles.sealRingContainer}>
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle cx="23" cy="34" r="11" fill="none" stroke="#6A8A4F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="37" cy="34" r="11" fill="none" stroke="#E8D56B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="26" r="11" fill="none" stroke="#C47A2A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="31" r="2.5" fill="#F5F0E0" />
        </svg>
      </div>

      <div>
        <h3 className={styles.successTitle}>Induction Attestation Verified</h3>
        <p className={styles.successMessage}>
          Congratulations, {data.identity.alias}. Your node-locked induction session is cryptographically anchored to ProofBridge IVE.
        </p>
      </div>

      <div className={styles.certificateBox}>
        <div className={styles.certRow}>
          <span className={styles.certLabel}>Cert Holder</span>
          <span className={styles.certValue}>{data.identity.fullName}</span>
        </div>
        <div className={styles.certRow}>
          <span className={styles.certLabel}>Institutional Affiliation</span>
          <span className={styles.certValue}>{data.institution.name}</span>
        </div>
        <div className={styles.certRow}>
          <span className={styles.certLabel}>Recognition</span>
          <span className={styles.certValue}>{data.institution.accreditationLevel}</span>
        </div>
        <div className={styles.certRow}>
          <span className={styles.certLabel}>Registration Ref</span>
          <span className={styles.certValue}>{data.institution.regNumber}</span>
        </div>
        <div className={styles.certRow}>
          <span className={styles.certLabel}>Attestation Hash</span>
          <span className={styles.hashValue}>{data.inductionHash || '0x9A8F...23C4'}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2 border border-[#c47a2a]/30 hover:border-[#c47a2a] text-[#c47a2a] text-xs uppercase cursor-pointer"
        >
          Reset Induction
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[#e8d56b] text-[#07090a] font-bold text-xs uppercase cursor-pointer hover:bg-white transition-all shadow-lg"
        >
          Enter Studio Session ➔
        </button>
      </div>
    </div>
  );
};
