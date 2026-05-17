import React from 'react';
import styles from './SearchCard.module.scss';

const SearchCard = ({ title, children, isOpen, onClose, placement = 'center' }) => {
  const placementClass =
    placement === 'bottom' ? styles.bottom : 
    placement === 'top' ? styles.top : 
    placement === 'absolute' ? styles.absolute : '';

  return (
    <>
      {isOpen && placement !== 'absolute' && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.card} ${placementClass} ${isOpen ? styles.open : ''}`}>
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};

export default SearchCard;
