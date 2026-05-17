import React from "react";
import { Modal, Button, Spinner } from "@/components/ui";
import styles from "./CancelSubscriptionModal.module.scss";
import AlertIcon from "@/assets/warning2.svg?react";
const CancelSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Querés cancelar tu suscripción?"
      icon={AlertIcon}
      size="large"
      iconSize={65}
      iconStyle={{ color: "#616161" }}
      showCloseButton
      titleStyle={{
        fontFamily: "Roboto",
        fontWeight: 700,
        fontSize: 24,
        lineHeight: "120%",
        textAlign: "center",
        color: "#0C161D",
      }}
    >
      <div className={styles.wrapper}>
        <p className={styles.description}>
          Perderás muchas oportunidades para contactarte con personas relevantes
          para tu empresa
        </p>

        <div className={styles.actions}>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={loading}
            className={styles.confirmButton}
            rounded="xmedium"
          >
            {loading ? <>Procesando <Spinner color="white" size="small" /></> : "Cancelar suscripción"}
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.cancelButton}
            rounded="xmedium"
          >
            Seguir con mi suscripción actual
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelSubscriptionModal;
