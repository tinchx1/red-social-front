"use client";
import { Button } from '@/components/ui';
import { useSearch } from '@/contexts';
import styles from './NoResultsFound.module.scss';
import SearchIcon from '@/assets/search.svg';
const NoResultsFound = ({ onEditSearch }) => {
  const { focusSearchInput, openSearchModal, openSearchDesktop } = useSearch();
  
  const handleEditSearch = () => {
    if (onEditSearch) {
      onEditSearch();
    } else {
      // Check if we're on mobile (screen width < 768px)
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;
      
      if (isMobile && openSearchModal) {
        openSearchModal();
      } else if (!isMobile && openSearchDesktop) {
        openSearchDesktop();
      } else {
        focusSearchInput();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <SearchIcon 
          width={40}
          height={40}
          className={styles.searchIcon} 
        />
      </div>
      
      <h2 className={styles.title}>Ningún resultado encontrado</h2>
      <p className={styles.subtitle}>Prueba con reescribir la búsqueda</p>
      
      <Button 
        onClick={handleEditSearch}
      >
        Editar búsqueda
      </Button>
    </div>
  );
};

export default NoResultsFound;
