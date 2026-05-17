'use client'
import { useState } from 'react'
import { Modal, Button, Spinner } from '@/components/ui'
import styles from './DeleteContactModal.module.scss'
import TrashIcon from '@/assets/trash.svg'

/**
 * @param {{
 *  isOpen: boolean,
 *  onClose: () => void,
 *  onConfirm: () => Promise<void> | void,
 *  userName: string
 * }} props
 */
const DeleteContactModal = ({ isOpen, onClose, onConfirm, userName }) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={TrashIcon}
      size="medium"
    >
      <h2 className={styles.title}>Eliminar contacto</h2>
      <p className={styles.message}>
        ¿Seguro que querés eliminar a {userName}?  Dejará de estar en tu lista de contactos y no podrás comunicarte nuevamente
      </p>
      <div className={styles.actions}>
        <Button variant="outline" onClick={onClose} disabled={isDeleting} style={{ border: 'none' }}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isDeleting} >
          {isDeleting ? <>Eliminando <Spinner color="white" size="small" /></> : 'Eliminar'}
        </Button>
      </div>
    </Modal>
  )
}

export default DeleteContactModal


