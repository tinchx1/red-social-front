import React from "react";
import { Modal, Button, Spinner } from "@/components/ui";
import styles from "./ChangeSubscriptionModal.module.scss";
import AlertIcon from "@/assets/warning2.svg?react";

const ChangeSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CAMBIO DE SUSCRIPCIÓN"
      icon={AlertIcon}
      size="large"
      iconSize={65}
      iconStyle={{ color: "#616161" }}
      showCloseButton
      titleStyle={{
        fontFamily: "Roboto",
        fontWeight: 700,
        fontSize: 37,
        lineHeight: "120%",
        textAlign: "center",
        color: "#0C161D",
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      <div className={styles.wrapper}>
        <p className={styles.secondaryDescription}>
          ¿Estás seguro que quieres cambiar tu suscripción?
          <br />
          El nuevo valor se aplicará a partir del mes siguiente
        </p>

        <div className={styles.actions}>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={loading}
            className={styles.confirmButton}
          >
            {loading ? (
              <>
                Procesando <Spinner color="white" size="small" />
              </>
            ) : (
              "Suscribirme"
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeSubscriptionModal;
