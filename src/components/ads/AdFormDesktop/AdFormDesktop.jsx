"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./AdFormDesktop.module.scss";
import { Button } from "@/components";
import { Spinner } from "@/components/ui";
import FormatSelection from "../FormatSelection/FormatSelection";
import DateRangeSelection from "../DateRangeSelection/DateRangeSelection";
import AdLinkAndFile from "../AdLinkAndFile/AdLinkAndFile";
import ProgressIndicator from "../ProgressIndicator/ProgressIndicator";
import MobilePreviewFeed from "../MobilePreviewFeed/MobilePreviewFeed";
import DesktopPreviewFeed from "../DesktopPreviewFeed/DesktopPreviewFeed";
import ImageCropper from "../Cropper/Cropper";
import { useAdForm } from "@/contexts/AdFormContext";

const MIN_DAYS = 15;

export default function AdFormDesktop({
  isOpen,
  onClose,
  onSubmit,
  pricingData,
  isSubmitting = false,
}) {
  const {
    adFormData,
    selectedFormat,
    croppedImage,
    pendingFile,
    pendingSrc,
    error,
    handleFileChange,
    handleCropCancel,
    handleCropComplete,
    handleRemoveImage,
    resetForm,
    linkError,
    validateClickUrl,
  } = useAdForm();

  const [currentStep, setCurrentStep] = useState(1);
  const [dateRangeError, setDateRangeError] = useState("");
  const [imageError, setImageError] = useState("");
  const [portalTarget, setPortalTarget] = useState(null);
  const [previewTab, setPreviewTab] = useState("escritorio");

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
      if (!isOpen) {
        resetForm();
        setCurrentStep(1);
        setDateRangeError("");
        setImageError("");
      }
    };
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (
      dateRangeError &&
      adFormData.contractDays >= MIN_DAYS &&
      adFormData.startDate
    ) {
      setDateRangeError("");
    }
  }, [adFormData.contractDays, adFormData.startDate, dateRangeError]);

  useEffect(() => {
    if (imageError && croppedImage?.file) {
      setImageError("");
    }
  }, [imageError, croppedImage?.file]);

  const stepSubtitles = {
    1: "Elegí el formato y el período de publicación.",
    2: "Cargá el link y la imagen del anuncio.",
    3: "Revisá la vista previa antes de confirmar.",
  };

  const handleClose = () => {
    resetForm();
    setCurrentStep(1);
    setDateRangeError("");
    setImageError("");
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const hasValidRange =
        adFormData.contractDays >= MIN_DAYS && adFormData.startDate;
      if (!hasValidRange) {
        setDateRangeError(
          "Seleccioná un rango de al menos 15 días consecutivos disponibles. Asegurate de que no haya fechas bloqueadas dentro del rango."
        );
        return;
      }
      setDateRangeError("");
    }

    if (currentStep === 2) {
      let hasError = false;

      if (!croppedImage?.file) {
        setImageError("Necesitás recortar una imagen para continuar.");
        hasError = true;
      } else {
        setImageError("");
      }

      const isValidLink = validateClickUrl(adFormData.clickUrl);
      if (!isValidLink) {
        hasError = true;
      }

      if (hasError) {
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedFormat || !onSubmit) {
      return;
    }

    let hasError = false;

    if (!croppedImage?.file) {
      setImageError("Necesitás recortar una imagen para continuar.");
      hasError = true;
    } else {
      setImageError("");
    }

    const isValidLink = validateClickUrl(adFormData.clickUrl);
    if (!isValidLink) {
      hasError = true;
    }

    if (hasError) {
      setCurrentStep(2);
      return;
    }

    onSubmit();
    // No resetear el step - si hay redirect, la página navega
    // Si hay error, queremos quedarnos en el step actual
  };

  if (!isOpen || !portalTarget) return null;

  const getMobilePreviewScaleClass = () => {
    if (previewTab !== "mobile") {
      return "";
    }

    if (selectedFormat?.position === 3) {
      return styles.mobilePreviewScaleStrong;
    }

    if (selectedFormat?.position === 1 || selectedFormat?.position === 2) {
      return styles.mobilePreviewScaleMedium;
    }

    return styles.mobilePreviewScaleLight;
  };

  const modalContent = (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Button
          variant="icon"
          onClick={handleClose}
          type="button"
          aria-label="Cerrar formulario"
          className={styles.closeBtn}
        >
          ✕
        </Button>

        <div className={styles.body}>
          <header className={styles.header}>
            <h2 className={styles.title}>Solicitar publicación de anuncio</h2>
            <p className={styles.description}>{stepSubtitles[currentStep]}</p>
          </header>

          <div className={styles.form}>
            {currentStep === 1 && (
              <div className={styles.stepGrid}>
                <div className={styles.stepColumn}>
                  <FormatSelection />
                </div>
                <div className={styles.stepColumn}>
                  <DateRangeSelection pricingData={pricingData} />
                  {dateRangeError && (
                    <p className={styles.error}>{dateRangeError}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <>
                <AdLinkAndFile
                  selectedFormat={selectedFormat}
                  onFileChange={handleFileChange}
                  showImageUpload={!pendingFile && !croppedImage}
                />
                <div className={styles.field}>
                  {pendingFile && pendingSrc && selectedFormat && (
                    <ImageCropper
                      file={pendingFile}
                      imageSrc={pendingSrc}
                      format={selectedFormat}
                      onCancel={handleCropCancel}
                      onConfirm={handleCropComplete}
                    />
                  )}
                  {croppedImage?.previewUrl && (
                    <div
                      className={`${styles.previewContainer} ${
                        selectedFormat?.position === 4
                          ? styles.previewContainerPosition4
                          : ""
                      }`}
                    >
                      <div
                        className={`${styles.preview} ${
                          selectedFormat?.position === 3
                            ? styles.previewPosition3
                            : selectedFormat?.position === 4
                            ? styles.previewPosition4
                            : ""
                        }`}
                      >
                        <img
                          src={croppedImage.previewUrl}
                          alt="Vista previa del anuncio"
                          className={styles.previewImage}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className={styles.removeButton}
                          aria-label="Cambiar imagen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {imageError && <p className={styles.error}>{imageError}</p>}
                {error && !imageError && !linkError && (
                  <p className={styles.error}>{error}</p>
                )}
              </>
            )}

            {currentStep === 3 && (
              <div className={styles.previewPanel}>
                <p className={styles.previewTitle}>Vista previa</p>
                <div className={styles.previewTabs}>
                  <button
                    type="button"
                    className={`${styles.previewTab} ${
                      previewTab === "escritorio" ? styles.previewTabActive : ""
                    }`}
                    onClick={() => setPreviewTab("escritorio")}
                  >
                    Escritorio
                  </button>
                  <button
                    type="button"
                    className={`${styles.previewTab} ${
                      previewTab === "mobile" ? styles.previewTabActive : ""
                    }`}
                    onClick={() => setPreviewTab("mobile")}
                  >
                    Mobile
                  </button>
                </div>
                <div className={styles.previewContent}>
                  {previewTab === "escritorio" ? (
                    <DesktopPreviewFeed
                      imageSrc={croppedImage?.previewUrl}
                      format={selectedFormat}
                    />
                  ) : (
                    <div
                      className={`${
                        styles.mobilePreviewWrapper
                      } ${getMobilePreviewScaleClass()}`}
                    >
                      <MobilePreviewFeed
                        imageSrc={croppedImage?.previewUrl}
                        format={selectedFormat}
                        showHelperText={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.progressWrapper}>
            <ProgressIndicator currentStep={currentStep} totalSteps={3} />
          </div>
          <div className={styles.actions}>
            {currentStep === 1 ? (
              <Button variant="secondary" onClick={handleClose} type="button">
                Cancelar
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                type="button"
              >
                Volver
              </Button>
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext} type="button">
                Continuar
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!croppedImage?.file || isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    Creando anuncio <Spinner color="white" size="small" />
                  </>
                ) : (
                  "Pagar anuncio"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalTarget);
}
