"use client";
import { useState, useRef } from "react";
import { Modal, Select, Input, Button, Spinner } from "@/components/ui";
import styles from "./WarningModal.module.scss";

const WarningModal = ({ isOpen, onClose, onSubmit }) => {
  const [warningType, setWarningType] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const warningTypeOptions = [
    { value: "", label: "Tipo" },
    { value: "Contenido Inapropiado", label: "Contenido Inapropiado" },
    {
      value: "Información falsa o engañosa",
      label: "Información falsa o engañosa",
    },
    { value: "Publicidad y spam", label: "Publicidad y spam" },
    { value: "Seguridad y confianza", label: "Seguridad y confianza" },
    { value: "Cumplimiento legal", label: "Cumplimiento legal" },
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Solo permitir una imagen a la vez - reemplazar en lugar de agregar
    if (files.length > 0) {
      setSelectedFiles([files[0]]);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!warningType || !warningMessage.trim()) {
      return;
    }

    setIsLoading(true);
    const warningData = {
      type: warningType,
      content: warningMessage,
      imageFile: selectedFiles.length > 0 ? selectedFiles[0] : null, // Only send first image as per API spec
    };

    try {
      await onSubmit(warningData);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setWarningType("");
    setWarningMessage("");
    setSelectedFiles([]);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="large"
      showCloseButton={true}
      closeOnOverlayClick={false}
    >
      <div className={styles.warningModal}>
        {/* Close button */}
        <h2 className={styles.title}>DETALLE DE ADVERTENCIA</h2>
        {/* <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isLoading}
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
        </button> */}
        {/* Warning Type Select */}
        <div className={styles.field}>
          <Select
            value={warningType}
            onChange={setWarningType}
            options={warningTypeOptions}
            placeholder="Tipo"
            variant="neutral"
          />
        </div>

        {/* Warning Message Header */}
        <div className={styles.messageHeader}>
          Enviá una advertencia al usuario sobre su contenido
        </div>

        {/* Warning Message Textarea */}
        <div className={styles.field}>
          <Input
            as="textarea"
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            placeholder="Escribí el motivo y/o detalle de la advertencia para el usuario"
            rows={4}
            className={styles.textarea}
            maxLength={1000}
            disabled={isLoading}
          />
        </div>

        {/* Notification Info */}
        <div className={styles.notificationInfo}>
          Este aviso se enviará como notificación y correo electrónico.
        </div>

        {/* File Upload Section */}
        <div className={styles.uploadSection}>
          <div className={styles.uploadHeader}>
            Podés adjuntar capturas de pantalla (opcional)
          </div>

          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={isLoading}
            />

            <div
              className={styles.uploadZone}
              onClick={() => {
                if (!isLoading) fileInputRef.current?.click();
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.uploadIcon}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className={styles.uploadText}>Subir imagenes</span>
            </div>

            <div className={styles.fileFormats}>
              Formatos compatibles: JPG, JPEG, PNG y WEBP.
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className={styles.selectedFiles}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    className={styles.removeFile}
                    onClick={() => handleRemoveFile(index)}
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={styles.buttonContainer}>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading || !warningType || !warningMessage.trim()}
          >
            {isLoading ? <>Enviando <Spinner color="white" /></> : "Enviar advertencia"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WarningModal;
