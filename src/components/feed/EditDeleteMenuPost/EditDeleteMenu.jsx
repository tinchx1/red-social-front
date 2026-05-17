'use client'
import { Submenu } from '@/components/ui'
import styles from './EditDeleteMenu.module.scss'

const EditDeleteMenu = ({
  isOpen,
  onClose,
  anchorRef,
  onEdit,
  onDelete,
  position = 'bottom-right',
  itemName
}) => {
  const items = [
    { label: 'Editar ' + itemName, onClick: onEdit },
    { type: 'separator' },
    { label: 'Eliminar ' + itemName, onClick: onDelete }
  ]

  return (
    <Submenu
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      items={items}
      position={position}
      className={styles.menu}
    />
  )
}

export default EditDeleteMenu


