'use client'
import { useState } from 'react';
import { Modal, Button, Spinner } from '../../ui';
import SignOutIcon from '@/assets/sign_out_squre.svg';
import { useAuth } from '@/components/layout/AuthProvider';
import styles from './LogoutModal.module.scss';

const LogoutModal = ({ isOpen, onClose }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Querés cerrar sesión?"
      icon={SignOutIcon}
      size="medium"
    >
      <div className={styles.buttonContainer}>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isLoggingOut}
          style={{ flex: 1, border: 'none' }}
        >
          Cancelar
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{ flex: 1 }}
        >
          {isLoggingOut ? <>Cerrando <Spinner color="white" size="small" /></> : 'Cerrar sesión'}
        </Button>
      </div>
    </Modal>
  );
};

export default LogoutModal;
