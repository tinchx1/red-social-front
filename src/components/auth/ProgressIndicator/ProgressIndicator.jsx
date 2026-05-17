import React from 'react';
import styles from './ProgressIndicator.module.scss';

const ProgressIndicator = ({ currentStep = 1, totalSteps = 3 }) => {
  const getSteps = () => {
    if (totalSteps === 2) {
      return [
        { id: 1, label: 'Datos básicos' },
        { id: 2, label: 'Datos Empresa' }
      ];
    }
    return [
      { id: 1, label: 'Datos básicos' },
      { id: 2, label: 'Datos Empresa' },
      { id: 3, label: 'Perfil Empresa' }
    ];
  };

  const steps = getSteps();

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressSteps}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={styles.stepWrapper}>
              <div 
                className={`${styles.stepCircle} ${
                  step.id === currentStep ? styles.active : styles.inactive
                }`}
              >
                <span className={styles.stepNumber}>{step.id}</span>
              </div>
              {step.id === currentStep && (
                <div className={styles.stepLabels}>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.connector} ${totalSteps === 2 ? styles.connectorPerson : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator; 