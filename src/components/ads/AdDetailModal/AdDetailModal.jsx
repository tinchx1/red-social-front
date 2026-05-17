"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { pdf } from "@react-pdf/renderer";
import styles from "./AdDetailModal.module.scss";
import { Button, Modal } from "@/components/ui";
import DesktopPreviewFeed from "../DesktopPreviewFeed/DesktopPreviewFeed";
import MobilePreviewFeed from "../MobilePreviewFeed/MobilePreviewFeed";
import { pauseAd } from "@/actions/ads";
import { useToast } from "@/contexts";
import FileIcons from "@/components/ui/FileIcons";
import FileDownloadIcon from "@/assets/file_download.svg?react";
import ReceiptPDF from "./ReceiptPDF";

const WarningIcon = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeIcon = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * @param {{
 *   ad: any | null;
 *   onClose: () => void;
 *   onPause?: (ad: any) => void;
 *   userProfile?: any | null;
 *   clientId?: string;
 * }} props
 */
export default function AdDetailModal({
  ad,
  onClose,
  onPause,
  userProfile,
  clientId,
}) {
  const [portalTarget, setPortalTarget] = useState(null);
  const [previewTab, setPreviewTab] = useState("escritorio");
  const [isPausing, setIsPausing] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [previewSurfaceOverflow, setPreviewSurfaceOverflow] = useState("hidden");
  const previewSurfaceRef = useRef(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (!portalTarget || !ad) return undefined;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [portalTarget, ad]);

  useEffect(() => {
    if (!ad) {
      setPreviewTab("escritorio");
    }
  }, [ad]);

  useEffect(() => {
    setPreviewSurfaceOverflow(previewTab === "escritorio" ? "hidden" : "auto");
  }, [previewTab]);

  useEffect(() => {
    if (previewTab === "escritorio" && previewSurfaceRef.current) {
      previewSurfaceRef.current.scrollTop = 0;
    }
  }, [previewTab]);

  if (!ad || !portalTarget) return null;

  const formatDate = (value) =>
    value ? dayjs(value).format("DD/MM/YYYY") : "-";

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resolvePaymentValue = () => {
    const parseAmount = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const fromTotalPrice = parseAmount(ad.totalPrice);
    if (fromTotalPrice !== null) return fromTotalPrice;

    const fromPricingTotalPrice = parseAmount(ad?.pricing?.totalPrice);
    if (fromPricingTotalPrice !== null) return fromPricingTotalPrice;

    const fromPaymentAmount = parseAmount(ad.paymentAmount);
    if (fromPaymentAmount !== null) return fromPaymentAmount;

    const fromPaymentNestedAmount = parseAmount(ad?.payment?.amount);
    if (fromPaymentNestedAmount !== null) return fromPaymentNestedAmount;

    return null;
  };

  const paymentValue = formatCurrency(resolvePaymentValue());
  const assetUrl = ad.assetUrl || ad.imageUrl || "";
  const format = ad.format || { position: ad.position };
  const resolvedProfile = ad.userProfile || ad.profile || userProfile || null;

  const resolveProfilePhone = (profile) => {
    if (!profile) return "-";
    return profile.phone || profile.phoneNumber || profile.contactPhone || "-";
  };

  const resolveProfileEmail = (profile) => {
    if (!profile) return "-";
    return profile.email || profile.mail || profile.contactEmail || "-";
  };

  const resolveProfileFullName = (profile) => {
    if (!profile) return "-";
    if (profile.fullName) return profile.fullName;

    const firstName = profile.firstName || profile.nombre;
    const lastName = profile.lastName || profile.apellido;

    const combined = [firstName, lastName].filter(Boolean).join(" ");
    return combined || "-";
  };

  const profilePhone = resolveProfilePhone(resolvedProfile);
  const profileEmail = resolveProfileEmail(resolvedProfile);
  const profileFullName = resolveProfileFullName(resolvedProfile);

  const loadLogoAsBase64 = async () => {
    try {
      const response = await fetch("/images/apia-logo.png");
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error loading logo:", error);
      return null;
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const adId = ad.id ? `#${String(ad.id).slice(-6)}` : "-";
      const receiptId = ad.id ? String(ad.id).slice(-5) : null;
      const startDate = formatDate(ad.duration?.startDate);
      const endDate = formatDate(ad.duration?.endDate);

      const paymentMethod =
        ad.payment?.method || ad.paymentMethod || "Mercado Pago";

      const paymentDate =
        ad.payment?.date ||
        ad.paymentDate ||
        ad.created_at ||
        new Date().toISOString();

      const logoUrl = await loadLogoAsBase64();

      const receiptData = {
        userData: {
          fullName: profileFullName,
          phone: profilePhone,
          email: profileEmail,
        },
        adData: {
          id: adId,
          startDate: startDate,
          endDate: endDate,
        },
        paymentData: {
          method: paymentMethod,
          amount: paymentValue,
          date: formatDate(paymentDate),
        },
        logoUrl: logoUrl,
        receiptId: receiptId,
      };

      const blob = await pdf(<ReceiptPDF {...receiptData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Comprobante-${adId.replace("#", "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating receipt:", error);
      showError("No se pudo generar el comprobante. Intentá de nuevo.");
    }
  };

  const handlePauseClick = () => {
    setShowPauseConfirm(true);
  };

  const handlePauseConfirm = async () => {
    if (!ad?.id || !clientId) {
      showError("No se pudo cancelar el anuncio. Faltan datos necesarios.");
      setShowPauseConfirm(false);
      return;
    }

    setIsPausing(true);
    try {
      await pauseAd({ adId: ad.id, clientId });
      showSuccess("Anuncio cancelado correctamente");
      setShowPauseConfirm(false);
      onPause?.(ad);
      onClose();
    } catch (error) {
      console.error("Error pausing ad:", error);
      showError("No se pudo cancelar el anuncio. Intentá de nuevo.");
    } finally {
      setIsPausing(false);
    }
  };
  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h2 className={styles.title}>Detalle de anuncio</h2>
            <div className={styles.headerButtons}>
              <button
                type="button"
                className={styles.previewButton}
                onClick={() => setShowMobilePreview(true)}
                aria-label="Ver preview mobile"
                title="Ver preview mobile"
              >
                <EyeIcon />
              </button>
              <Button
                variant="primary"
                onClick={handlePauseClick}
                disabled={!clientId || ad.status === "cancelled" || ad.status === "inactive"}
              >
                Cancelar anuncio
              </Button>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              aria-label="Cerrar detalle del anuncio"
              className={styles.closeButton}
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.infoColumn}>
            <section className={styles.infoGroup}>
              <p className={styles.infoTitle}>Fecha</p>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Desde</span>
                  <span className={styles.fieldValue}>
                    {formatDate(ad.duration?.startDate)}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Hasta</span>
                  <span className={styles.fieldValue}>
                    {formatDate(ad.duration?.endDate)}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.infoGroup}>
              <p className={styles.infoTitle}>Información de pago</p>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Método de pago</span>
                  <span className={styles.fieldValue}>Mercado Pago</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Valor</span>
                  <span className={styles.fieldValue}>{paymentValue}</span>
                </div>
              </div>
            </section>

            {/* {resolvedProfile && (
              <section className={styles.infoGroup}>
                <p className={styles.infoTitle}>Datos incluidos</p>
                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Contacto</span>
                    <span className={styles.fieldValue}>{profilePhone}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Correo</span>
                    <span className={styles.fieldValue}>{profileEmail}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>Nombre y Apellido</span>
                    <span className={styles.fieldValue}>{profileFullName}</span>
                  </div>
                </div>
              </section>
            )} */}
            {ad.paymentStatus === "paid" && <section className={styles.infoGroup}>
              <p className={styles.infoTitle}>Comprobante</p>
              <button
                type="button"
                className={styles.receiptCard}
                onClick={handleDownloadReceipt}
                title="Descargar comprobante"
              >
                <div className={styles.fileInfo}>
                  <FileIcons fileExtension="pdf" />
                  <div className={styles.fileNameWeight}>
                    <p>Comprobante 1</p>
                    <h6>1 página PDF 1MB</h6>
                  </div>
                </div>
                <FileDownloadIcon />
              </button>
            </section>}
          </div>

          <div className={styles.previewColumn}>
            <div className={styles.previewHeader}>
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
            </div>
            <div
              ref={previewSurfaceRef}
              className={styles.previewSurface}
              style={{ overflow: previewSurfaceOverflow }}
            >
              {previewTab === "escritorio" ? (
                <div className={styles.desktopPreviewScaled}>
                  <DesktopPreviewFeed imageSrc={assetUrl} format={format} />
                </div>
              ) : (
                <div className={styles.mobilePreviewScaled}>
                <MobilePreviewFeed
                  imageSrc={assetUrl}
                  format={format}
                  showHelperText={false}
                />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPauseConfirm}
        onClose={() => !isPausing && setShowPauseConfirm(false)}
        icon={WarningIcon}
        size="large"
        showCloseButton={true}
        closeOnOverlayClick={!isPausing}
        iconSize={60}
        iconStyle={{ color: "#616161" }}
      >
        <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
          <p
            style={{
              fontSize: "22px",
              lineHeight: "1.2",
              color: "#616161",
              margin: 0,
            }}
          >
            Tu anuncio quedará cancelado y no podrá ser
            <br />
            visualizado por otros
          </p>
        </div>
        <div style={{ width: "100%", maxWidth: "340px", margin: "0 auto" }}>
          <Button
            variant="primary"
            onClick={handlePauseConfirm}
            disabled={isPausing}
            style={{ width: "100%", height: "48px", fontWeight: 500 }}
          >
            {isPausing ? "Cancelando..." : "Cancelar anuncio"}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showMobilePreview}
        onClose={() => setShowMobilePreview(false)}
        size="large"
        showCloseButton={true}
        closeOnOverlayClick={true}
      >
        <div className={styles.mobilePreviewContainer}>
          <MobilePreviewFeed
            imageSrc={assetUrl}
            format={format}
            showHelperText={false}
          />
        </div>
      </Modal>
    </div>,
    portalTarget
  );
}
