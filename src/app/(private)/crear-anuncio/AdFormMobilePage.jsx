"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./AdFormMobilePage.module.scss";
import { Button } from "@/components";
import { Spinner } from "@/components/ui";
import ImageCropper from "../../../components/ads/Cropper/Cropper";
import AdLinkAndFile from "../../../components/ads/AdLinkAndFile/AdLinkAndFile";
import FormatSelection from "../../../components/ads/FormatSelection/FormatSelection";
import DateRangeSelection from "../../../components/ads/DateRangeSelection/DateRangeSelection";
import ProgressIndicator from "../../../components/ads/ProgressIndicator/ProgressIndicator";
import MobilePreviewFeed from "../../../components/ads/MobilePreviewFeed/MobilePreviewFeed";
import { useAdForm } from "@/contexts/AdFormContext";

const MIN_DAYS = 15;

export default function AdFormMobilePage({
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
  const pageRef = useRef(null);

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
    if (currentStep !== 2 && dateRangeError) {
      setDateRangeError("");
    }
  }, [currentStep, dateRangeError]);

  useEffect(() => {
    if (imageError && croppedImage?.file) {
      setImageError("");
    }
  }, [imageError, croppedImage?.file]);

  useEffect(() => {
    if (currentStep !== 3 && imageError) {
      setImageError("");
    }
  }, [currentStep, imageError]);

  const stepSubtitles = {
    1: "Anunciá tu empresa o servicio para conseguir más clientes o contactos.",
    2: "Seleccioná el rango de fechas en el que querés que se publique tu anuncio",
    3: "Agregá el link y subí tu imagen",
    4: "Previsualizá tu anuncio en el feed móvil antes de confirmarlo.",
  };

  const handleNext = () => {
    if (currentStep === 2) {
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

    if (currentStep === 3) {
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
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      if (pageRef.current) {
        pageRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
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
      setCurrentStep(3);
      return;
    }

    onSubmit();
    // No resetear el step - si hay redirect, la página navega
    // Si hay error, queremos quedarnos en el step actual
  };

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.container}>
        <div className={styles.body}>
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          <header className={styles.header}>
            <h1 className={styles.title}>Solicitar publicación de anuncio</h1>
            <p className={styles.description}>{stepSubtitles[currentStep]}</p>
          </header>

          <div className={styles.form}>
            {currentStep === 1 && <FormatSelection />}

            {currentStep === 2 && (
              <>
                <DateRangeSelection pricingData={pricingData} />
                {dateRangeError && (
                  <p className={styles.error}>{dateRangeError}</p>
                )}
              </>
            )}

            {currentStep === 3 && (
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

            {currentStep === 4 && (
              <div className={styles.field}>
                <MobilePreviewFeed
                  imageSrc={croppedImage?.previewUrl}
                  format={selectedFormat}
                />
              </div>
            )}
          </div>

          <div
            className={styles.actions}
            style={{ maxWidth: currentStep === 4 ? "297px" : "100%" }}
          >
            {currentStep < 4 ? (
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
            {currentStep === 1 ? (
              <Button
                variant="secondary"
                onClick={() => window.history.back()}
                type="button"
                className={styles.cancelBtn}
              >
                Volver
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                type="button"
                className={styles.cancelBtn}
              >
                Volver
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
