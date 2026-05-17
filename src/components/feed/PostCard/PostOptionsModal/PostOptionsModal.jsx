'use client'
import { useEffect, useRef } from 'react'
import styles from './PostOptionsModal.module.scss'

const PostOptionsModal = ({ isOpen, onClose, post, onEdit, onDelete, buttonRef }) => {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef && !buttonRef.current?.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  const handleDeleteClick = () => {
    onDelete()
    onClose()
  }

  const handleEdit = () => {
    onEdit(post)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.dropdown} ref={menuRef}>
        <div className={styles.menuOptions}>
          <button 
            className={styles.menuOption}
            onClick={handleEdit}
          >
            Editar Publicación
          </button>
          <button 
            className={`${styles.menuOption} ${styles.deleteOption}`}
            onClick={handleDeleteClick}
          >
            Eliminar Publicación
          </button>
        </div>
      </div>


    </>
  )
}

export default PostOptionsModal
