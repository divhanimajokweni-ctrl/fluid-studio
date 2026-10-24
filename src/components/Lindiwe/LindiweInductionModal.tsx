/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useInductionSession } from './hooks/useInductionSession';
import {
  IdentityStep,
  InstitutionStep,
  IntentStep,
  ConfirmStep,
} from './InductionSteps';
import { CompleteState } from './CompleteState';
import { UnderstandingMapDisplay } from './UnderstandingMapDisplay';
import styles from './LindiweInductionModal.module.css';

interface LindiweInductionModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const LindiweInductionModal: React.FC<LindiweInductionModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const {
    session,
    updateIdentity,
    updateInstitution,
    updateIntent,
    setStep,
    completeInduction,
    resetInduction,
  } = useInductionSession();

  if (!open) return null;

  const handleNext = () => {
    if (session.step < 4) {
      setStep(session.step + 1);
    } else if (session.step === 4) {
      completeInduction();
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (session.step > 1) {
      setStep(session.step - 1);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <svg viewBox="0 0 60 60" className={styles.sealMark}>
              <circle cx="23" cy="34" r="11" fill="none" stroke="#6A8A4F" strokeWidth="3" strokeLinecap="round" />
              <circle cx="37" cy="34" r="11" fill="none" stroke="#E8D56B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="26" r="11" fill="none" stroke="#C47A2A" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="31" r="2.2" fill="#F5F0E0" />
            </svg>
            <div>
              <h2 className={styles.title}>Lindiwe Induction Package</h2>
              <div className={styles.subtitle}>VVU Foundation · ProofBridge Infrastructure</div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body with Sidebar & Content Area */}
        <div className={styles.bodyGrid}>
          <div className={styles.sidebar}>
            <UnderstandingMapDisplay
              currentStep={session.step}
              completed={session.completed}
              onSelectStep={(s) => setStep(s)}
            />
          </div>

          <div className={styles.contentArea}>
            {session.completed ? (
              <CompleteState
                data={session}
                onClose={onClose}
                onReset={resetInduction}
              />
            ) : (
              <>
                {session.step === 1 && (
                  <IdentityStep
                    data={session}
                    onNext={handleNext}
                    onUpdateIdentity={updateIdentity}
                  />
                )}
                {session.step === 2 && (
                  <InstitutionStep
                    data={session}
                    onNext={handleNext}
                    onBack={handleBack}
                    onUpdateInstitution={updateInstitution}
                  />
                )}
                {session.step === 3 && (
                  <IntentStep
                    data={session}
                    onNext={handleNext}
                    onBack={handleBack}
                    onUpdateIntent={updateIntent}
                  />
                )}
                {session.step === 4 && (
                  <ConfirmStep
                    data={session}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
