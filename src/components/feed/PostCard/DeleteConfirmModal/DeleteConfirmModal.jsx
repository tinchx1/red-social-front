'use client'
import { useState } from 'react'
import styles from './DeleteConfirmModal.module.scss'
import { Button, Spinner } from '@/components/ui'
import { deletePost, removeSharedPost } from '@/actions'
import { usePosts } from '@/contexts/PostsContext'
import { useToast } from '@/contexts/ToastContext'

const DeleteConfirmModal = ({ isOpen, onClose, post }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const { removePost } = usePosts()
  const { showSuccess, showError } = useToast()

  const handleDelete = async () => {
    if (!post) return
    try {
      setIsDeleting(true)
      if (post.type === 'share') {
        removeSharedPost(post.id)
      } else {
        await deletePost(post.id)
      }
      
      // Remove post from context

      removePost(post.id)
      
      // Show success toast
      showSuccess("Publicación eliminada exitosamente")
      
      onClose()
    } catch (error) {
      console.error('Error deleting post:', error)
      showError("Error al eliminar la publicación")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h3 className={styles.title}>Eliminar Publicación</h3>
            <Button variant="icon" className={styles.closeBtn} onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className={styles.content}>
            <p className={styles.message}>
              ¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <>Eliminando <Spinner color="white" size="small" /></> : 'Eliminar'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmModal
