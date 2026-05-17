import React from 'react';
import styles from './PasswordRequirements.module.scss';

const PasswordRequirements = ({ password = '', singleColumn = false }) => {
  const requirements = [
    {
      id: 'length',
      text: 'Mínimo 8 caracteres',
      validator: (pwd) => pwd.length >= 8
    },
    {
      id: 'uppercase',
      text: 'Una mayúscula',
      validator: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      id: 'number',
      text: 'Un número',
      validator: (pwd) => /\d/.test(pwd)
    },
    {
      id: 'special',
      text: 'Un carácter especial',
      validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Debe contener</h4>
      <div className={`${styles.requirementsGrid} ${singleColumn ? styles.singleColumn : ''}`}>
        {requirements.map((requirement) => {
          const isMet = requirement.validator(password);
          return (
            <div 
              key={requirement.id} 
              className={`${styles.requirement} ${isMet ? styles.met : ''}`}
            >
              {isMet && (
                <div className={styles.checkIcon}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path 
                      d="M10 3L4.5 8.5L2 6" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              <span className={styles.text}>{requirement.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRequirements; 