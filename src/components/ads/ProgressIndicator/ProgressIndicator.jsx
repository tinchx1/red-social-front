import React from "react";
import styles from "./ProgressIndicator.module.scss";

const ProgressIndicator = ({ currentStep = 1, totalSteps = 3 }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressSteps}>
        {steps.map((step, index) => {
          const isCurrent = step === currentStep;
          const isCompleted = step < currentStep;
          const isActive = isCurrent || isCompleted;

          return (
            <React.Fragment key={step}>
              <div className={styles.stepWrapper}>
                <div
                  className={`${styles.stepCircle} ${
                    isActive ? styles.active : styles.inactive
                  }`}
                >
                  <span className={styles.stepNumber}>{step}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`${styles.connector} ${
                    isCompleted ? styles.active : styles.inactive
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
