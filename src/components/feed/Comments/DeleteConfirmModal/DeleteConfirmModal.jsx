'use client'
import { useState } from 'react'
import styles from './DeleteConfirmModal.module.scss'
import { Button, Spinner } from '@/components/ui'

const DeleteConfirmModal = ({ isOpen, onClose, itemName = 'comentario', onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm?.()
      onClose?.()
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Eliminar {itemName}</h3>
          <Button variant="icon" className={styles.closeBtn} onClick={onClose}>✕</Button>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>¿Seguro que quieres eliminar este {itemName}? Esta acción no se puede deshacer.</p>
        </div>
        <div className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>Cancelar</Button>
          <Button type="button" variant="danger" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? <>Eliminando <Spinner color="white" /></> : 'Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal


