import React from "react";
import { Modal, Button, Spinner } from "@/components/ui";
import styles from "./ConfirmModal.module.scss";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon: Icon,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  loadingText = "Procesando",
  confirmVariant = "secondary",
  confirmButtonStyle = {},
  size = "large",
  iconSize = 40,
  iconStyle = { width: 40, height: 40 },
  titleBold = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Icon}
      size={size}
      iconSize={iconSize}
      iconStyle={iconStyle}
      showCloseButton={true}
      titleClassName={titleBold ? styles.titleBold : undefined}
      titleStyle={{ maxWidth: "440px", margin: "20px auto" }}
    >
      <div className={styles.confirmModal}>
        {/* Close button */}
        {/* <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
 */}
        <div className={styles.confirmActions}>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
            style={{
              width: "100%",
              height: 48,
              fontWeight: 500,
              ...confirmButtonStyle,
            }}
          >
            {loading ? (
              <>
                {loadingText.replace(/\.+$/, "").trim()}{" "}
                <Spinner
                  color={
                    confirmVariant === "default" || confirmVariant === "primary"
                      ? "white"
                      : undefined
                  }
                />
              </>
            ) : (
              confirmText
            )}
          </Button>
          <Button
            variant="link"
            onClick={onClose}
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
