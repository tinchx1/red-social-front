"use client";
import { useEffect } from "react";
import styles from "./Modal.module.scss";
import { Button } from "..";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  icon: Icon,
  showCloseButton = false,
  closeOnOverlayClick = true,
  size = "medium", // 'small', 'medium', 'large'
  iconSize = 50,
  iconStyle = {},
  titleClassName,
  titleStyle,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      />
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.content}>
          {showCloseButton && (
            <Button
              variant="icon"
              aria-label="Close"
              className={styles.closeButton}
              onClick={onClose}
            >
              ✕
            </Button>
          )}
          {Icon && (
            <div className={styles.iconContainer}>
              <Icon
                className={styles.icon}
                style={{ width: iconSize, height: iconSize, ...iconStyle }}
              />
            </div>
          )}

          {title && (
            <h2
              className={`${styles.title} ${titleClassName || ""}`}
              style={titleStyle}
            >
              {title}
            </h2>
          )}

          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
