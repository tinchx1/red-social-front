'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './Submenu.module.scss'

const Submenu = ({
  isOpen,
  onClose,
  anchorRef,
  items = [],
  position = 'bottom-right',
  className = ''
}) => {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose?.()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  const content = (
    <div
      ref={menuRef}
      className={`${styles.submenuContainer} ${styles[`origin-${position}`]} ${className}`}
      onClick={(e) => {
        // prevent clicks inside submenu from bubbling to parent links
        e.stopPropagation()
      }}
    >
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={`sep-${index}`} className={styles.separator} />
        }
        const { label, icon: Icon, onClick, disabled } = item
        return (
          <button
            key={label || index}
            className={styles.menuItem}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (disabled) return
              onClick?.()
              onClose?.()
            }}
            disabled={disabled}
          >
            {Icon ? <Icon width={item.iconWidth} height={item.iconHeight} /> : null}
            <span className={item.prewrap ? styles.prewrap : ''}>{label}</span>
          </button>
        )
      })}
    </div>
  )

  return content
}

export default Submenu


