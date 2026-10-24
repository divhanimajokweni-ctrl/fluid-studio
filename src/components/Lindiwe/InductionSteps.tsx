/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InductionData } from './hooks/useInductionSession';
import styles from './InductionSteps.module.css';

interface StepProps {
  data: InductionData;
  onNext: () => void;
  onBack?: () => void;
  onUpdateIdentity?: (fields: Partial<InductionData['identity']>) => void;
  onUpdateInstitution?: (fields: Partial<InductionData['institution']>) => void;
  onUpdateIntent?: (fields: Partial<InductionData['intent']>) => void;
}

export const IdentityStep: React.FC<StepProps> = ({ data, onNext, onUpdateIdentity }) => {
  return (
    <div className={styles.stepContainer}>
      <div>
        <h3 className={styles.stepTitle}>01. Identity &amp; Creative Authority</h3>
        <p className={styles.stepDescription}>
          Declare your production name, credentials, and role in the Venture Vision Ubuntu network.
        </p>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Full Name / Legal Entity</label>
        <input
          type="text"
          className={styles.input}
          value={data.identity.fullName}
          onChange={(e) => onUpdateIdentity?.({ fullName: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Studio Alias / Producer Tag</label>
        <input
          type="text"
          className={styles.input}
          value={data.identity.alias}
          onChange={(e) => onUpdateIdentity?.({ alias: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Primary Role</label>
        <input
          type="text"
          className={styles.input}
          value={data.identity.role}
          onChange={(e) => onUpdateIdentity?.({ role: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Official Contact Email</label>
        <input
          type="email"
          className={styles.input}
          value={data.identity.email}
          onChange={(e) => onUpdateIdentity?.({ email: e.target.value })}
        />
      </div>

      <div className={styles.actionsBar}>
        <span />
        <button className={styles.primaryBtn} onClick={onNext}>
          Next: Institution →
        </button>
      </div>
    </div>
  );
};

export const InstitutionStep: React.FC<StepProps> = ({ data, onNext, onBack, onUpdateInstitution }) => {
  return (
    <div className={styles.stepContainer}>
      <div>
        <h3 className={styles.stepTitle}>02. Institutional Governance</h3>
        <p className={styles.stepDescription}>
          Verify foundation affiliation, jurisdiction, and D-SME registration compliance.
        </p>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Organization / Foundation</label>
        <input
          type="text"
          className={styles.input}
          value={data.institution.name}
          onChange={(e) => onUpdateInstitution?.({ name: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Regional Jurisdiction</label>
        <input
          type="text"
          className={styles.input}
          value={data.institution.jurisdiction}
          onChange={(e) => onUpdateInstitution?.({ jurisdiction: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Accreditation &amp; Level</label>
        <input
          type="text"
          className={styles.input}
          value={data.institution.accreditationLevel}
          onChange={(e) => onUpdateInstitution?.({ accreditationLevel: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Registration Number</label>
        <input
          type="text"
          className={styles.input}
          value={data.institution.regNumber}
          onChange={(e) => onUpdateInstitution?.({ regNumber: e.target.value })}
        />
      </div>

      <div className={styles.actionsBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.primaryBtn} onClick={onNext}>
          Next: Intent →
        </button>
      </div>
    </div>
  );
};

export const IntentStep: React.FC<StepProps> = ({ data, onNext, onBack, onUpdateIntent }) => {
  return (
    <div className={styles.stepContainer}>
      <div>
        <h3 className={styles.stepTitle}>03. Studio Intent &amp; Engineering Scope</h3>
        <p className={styles.stepDescription}>
          Specify acoustic target profiles and register automatic ProofBridge gate verification.
        </p>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Primary Studio Focus</label>
        <input
          type="text"
          className={styles.input}
          value={data.intent.primaryFocus}
          onChange={(e) => onUpdateIntent?.({ primaryFocus: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Sound Engineering Track</label>
        <input
          type="text"
          className={styles.input}
          value={data.intent.soundEngineeringTrack}
          onChange={(e) => onUpdateIntent?.({ soundEngineeringTrack: e.target.value })}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={data.intent.proofBridgeIntegration}
          onChange={(e) => onUpdateIntent?.({ proofBridgeIntegration: e.target.checked })}
        />
        <span>Enable ProofBridge IVE lossless invariant monitoring and auto-gate signing</span>
      </label>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={data.intent.governanceCommitment}
          onChange={(e) => onUpdateIntent?.({ governanceCommitment: e.target.checked })}
        />
        <span>Commit to transparent cycles under Venture Vision Ubuntu ("I am because we are")</span>
      </label>

      <div className={styles.actionsBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.primaryBtn} onClick={onNext}>
          Next: Confirm →
        </button>
      </div>
    </div>
  );
};

export const ConfirmStep: React.FC<StepProps> = ({ data, onNext, onBack }) => {
  return (
    <div className={styles.stepContainer}>
      <div>
        <h3 className={styles.stepTitle}>04. Review &amp; Attestation</h3>
        <p className={styles.stepDescription}>
          Verify the parameters below before generating your node-locked induction certificate.
        </p>
      </div>

      <div className="bg-[#14181f] p-4 border border-[#c47a2a]/30 rounded space-y-2 text-xs font-mono">
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-[#64748b]">PRODUCER:</span>
          <span className="text-white font-semibold">{data.identity.fullName} ({data.identity.alias})</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-[#64748b]">INSTITUTION:</span>
          <span className="text-[#e8d56b]">{data.institution.name}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-[#64748b]">REGISTRATION:</span>
          <span className="text-white">{data.institution.regNumber}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
          <span className="text-[#64748b]">DSP SCOPE:</span>
          <span className="text-[#6a8a4f]">{data.intent.primaryFocus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#64748b]">PROOFBRIDGE GATES:</span>
          <span className="text-[#10b981] font-bold">ACTIVE &amp; ENFORCED</span>
        </div>
      </div>

      <div className={styles.actionsBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.primaryBtn} onClick={onNext}>
          Sign &amp; Complete Induction ➔
        </button>
      </div>
    </div>
  );
};
