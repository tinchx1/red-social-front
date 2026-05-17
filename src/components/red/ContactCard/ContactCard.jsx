"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ContactCard.module.scss';
import { Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import TrashIcon from '@/assets/trash.svg';
import DeleteContactModal from '@/components/red/ContactCard/DeleteContactModal/DeleteContactModal';
import { useRouter } from 'next/navigation';

/**
 * @param {{
 *   id: string;
 *   name: string;
 *   role: string;
 *   avatar?: string;
 *   onSendMessage: (id: string) => void;
 *   onDelete: (id: string) => void;
 * }} props
 */
export default function ContactCard({ id, name, role, avatar, onSendMessage, onDelete }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(id);
      showSuccess('Contacto eliminado exitosamente');
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Error al eliminar el contacto');
    }
  };

  return (
    <div className={styles.contactCard}>
      {/* Desktop Layout */}
      <div className={styles.desktopLayout}>
        <Link href={`/perfil/${id}`} className={styles.profileSection}>
          {avatar ? (
            <Image 
              src={avatar} 
              alt={name} 
              className={styles.profilePicture}
              width={56}
              height={56}
              priority
            />
          ) : (
            <div className={styles.defaultProfilePicture}>
              <span>{name.charAt(0)}</span>
            </div>
          )}
        </Link>

        <Link href={`/perfil/${id}`} className={styles.contactInfo}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.role}>{role === 'parque_industrial' ? 'Parque Industrial' : role === 'empresa' ? 'Empresa' : 'Persona'}</p>
        </Link>
        
        <div className={styles.actionButtons}>
          <Button 
            onClick={() => onSendMessage(id)}
          >
            Enviar mensaje
          </Button>
          
          <button 
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            aria-label="Eliminar contacto"
          >
            <TrashIcon className={styles.icon} />
          </button>
        </div>
      </div>

      {/* Mobile Layout - Horizontal with profile picture on left */}
      <div className={styles.mobileLayout}>
        <Link href={`/perfil/${id}`} className={styles.mobileContactInfoContainer}>
          <div className={styles.mobileProfilePicture}>
              <Image 
                src={avatar || '/images/profile.svg'} 
                alt={name} 
                className={styles.profilePicture}
                width={56}
                height={56}
                priority
              />
          </div>
          <div className={styles.mobileContactInfo}>
            <h3 className={styles.mobileName}>{name}</h3>
            <p className={styles.mobileRole}>{role === 'parque_industrial' ? 'Parque Industrial' : role === 'empresa' ? 'Empresa' : 'Persona'}</p>
          </div>
        </Link>
        
        <div className={styles.mobileContent}>
          <div className={styles.mobileActions}>
            <Button 
              variant="primary" 
              onClick={() => onSendMessage(id)}
              iconPosition='right'
            >
              Enviar mensaje
            </Button>
            
            <Button 
              onClick={handleDeleteClick}
              aria-label="Eliminar contacto"
              variant="light-blue"
              icon={<TrashIcon className={styles.icon} />}
            >
            </Button>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteContactModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          userName={name}
        />
      )}
    </div>
  );
}
